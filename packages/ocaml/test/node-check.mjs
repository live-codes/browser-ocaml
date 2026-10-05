// Runs the runtime outside a browser.
//
// This is the same path as `importScripts`: load the runtime, tell it where the
// assets are, and call it. The only browser-specific piece was reading assets,
// and `setReader` replaces that -- with another *synchronous* reader, because
// the compiler asks for interfaces from inside the type-checker and there is
// nothing to await there.
//
//   node test/node-check.mjs
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const assets = new URL('../assets/', import.meta.url);

// The runtime addresses itself through `self`, the way it does in a worker.
globalThis.self = globalThis;

// js_of_ocaml's runtime detects Node and builds a real filesystem device with
// `require("node:fs")`. This file is an ES module, so `require` has to be put
// back for it -- the script is written for a classic context.
globalThis.require = createRequire(import.meta.url);

// Load it the way a classic script would be, not as a module: it defines a
// global and exports nothing.
vm.runInThisContext(readFileSync(new URL('worker.js', assets), 'utf8'), {
  filename: 'worker.js'
});

const runtime = globalThis.ocamlWasm;
if (!runtime) throw new Error('the runtime did not install itself as self.ocamlWasm');

runtime.setBaseUrl(assets.href);
// Return bytes, not a string: `readFileSync` gives a Buffer, and a UTF-8
// encoded byte string would corrupt the .cmi.
runtime.setReader((url) => {
  try {
    return readFileSync(fileURLToPath(url));
  } catch {
    return null;
  }
});

const cases = {
  plain: { code: 'let () = print_endline "hello from node"' },
  stdin: { code: 'let () = print_endline (read_line ())', input: 'piped in' },
  argv: { code: 'let () = Array.iter print_endline Sys.argv', args: ['one', 'two'] },
  files: {
    code: 'let ic = open_in "d.txt" in print_endline (input_line ic); close_in ic',
    files: [{ name: 'd.txt', contents: 'from a file\n' }]
  },
  library: { code: 'let () = print_endline (Greet.hello "node")' },
  compileError: { code: 'let x : int = "nope"' },
  warning: { code: 'let f x = 1' },
  badAssets: { code: 'let () = print_endline "unreachable"', _breakReader: true }
};

for (const [name, { _breakReader, ...payload }] of Object.entries(cases)) {
  if (_breakReader) runtime.setReader(() => null);
  const result = runtime.run(payload);
  const failed = result.exitCode === null;
  console.log(
    `${name}: exitCode=${result.exitCode}` +
      ` stdout=${JSON.stringify(result.stdout)}` +
      (result.error ? ` error=${JSON.stringify(result.error)}` : '') +
      (failed ? ` diagnostics=${JSON.stringify(result.diagnostics)}` : '')
  );
  if (_breakReader) {
    // Put the real reader back so the summary is not misleading.
    runtime.setReader((url) => {
      try {
        return readFileSync(fileURLToPath(url));
      } catch {
        return null;
      }
    });
  }
}
