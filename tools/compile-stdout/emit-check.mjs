// Reproduce the browser's compilation outside a browser, where the reason can
// be seen.
//
// In a worker there is no filesystem, and js_of_ocaml resolves its runtime chunk
// files (`+io.js`, `+obj.js`, ...) through `Fs`. When one cannot be found the
// compiler still succeeds, but the primitive it provided becomes a dummy that
// raises "Function 'x' not implemented" at run time -- so a program whose output
// goes through a missing primitive prints nothing.
//
// This runs the two shipped artifacts the way the browser does -- the driver
// with no disk at all, then jsoo.js from an empty directory -- and reports what
// the emitted program contains and whether it prints.

import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const assets = join(here, '..', '..', 'packages', 'ocaml', 'assets', 'compiler');
const execPath = process.execPath;
const realLog = console.log;

const source = 'let () =\n  print_endline "first";\n  Printf.printf "second\\n";\n  print_endline "third"\n';

// Step 1: source -> bytecode, with the browser-target driver in this process.
// It uses the browser filesystem, so its files arrive through jsoo_fs_tmp, and
// its output arrives on console -- which is what both the browser and its
// harness rely on.
//
// The standard library is one `js_of_ocaml build-fs` artifact. A worker mounts
// it with importScripts; here it is evaluated, which is the same thing -- it
// finds no runtime yet, so it queues its files on jsoo_fs_tmp, and the driver's
// own runtime replays that queue at caml_fs_init. Its contents are bytestrings,
// so evaluating it is byte-exact.
const captured = [];
const realConsoleLog = console.log;
console.log = (...args) => captured.push(args.join(' '));
globalThis.jsoo_fs_tmp = [{ name: 'main.ml', content: source }];
(0, eval)(readFileSync(join(assets, 'stdlib.js'), 'utf8'));
globalThis.jsoo_env = { OCAMLLIB: '/stdlib' };
globalThis.process = { argv: ['node', 'compile_stdout', 'main.ml'] };
require(join(assets, 'compile_stdout.browser.js'));
console.log = realConsoleLog;

const hex = captured.join('').trim();
realLog(`bytecode        : ${hex.length / 2} bytes`, hex.length > 0 && /^[0-9a-f]+$/.test(hex) ? '' : '(NOT hex)');

// Step 2: bytecode -> JavaScript, from an empty directory. That is the browser's
// condition: nothing on disk for the compiler to find its runtime chunks in.
const dir = mkdtempSync(join(tmpdir(), 'ocaml-emit-'));
writeFileSync(join(dir, 'main.byte'), Buffer.from(hex, 'hex'));
const emitted = spawnSync(
	execPath,
	[join(assets, 'jsoo.js'), 'main.byte', '-o', '-', '--target-env=browser'],
	{ cwd: dir, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
);
const js = emitted.stdout ?? '';
realLog(`emitted         : ${js.length} bytes of JavaScript`);
if (emitted.stderr && emitted.stderr.trim()) {
	realLog(`compiler stderr : ${emitted.stderr.trim().split('\n').slice(0, 6).join(' | ')}`);
}

// Step 3: what the bundle says about itself. A dummy primitive is the whole
// question -- the runtime leaves this message wherever it had to guess.
const dummies = [...js.matchAll(/Function '([A-Za-z_]+)' not implemented/g)].map((m) => m[1]);
realLog(`dummy primitives: ${dummies.length ? [...new Set(dummies)].join(', ') : '(none)'}`);

// Step 4: run it and see whether it prints.
writeFileSync(join(dir, 'out.js'), js);
const runner = `console.log = (...a) => process.stdout.write('OUT ' + a.join(' ') + '\\n'); require(${JSON.stringify(join(dir, 'out.js'))});`;
const ran = spawnSync(execPath, ['-e', runner], { cwd: dir, encoding: 'utf8' });
realLog(`program stdout  : ${JSON.stringify(ran.stdout ?? '')}`);
if (ran.stderr && ran.stderr.trim()) realLog(`program stderr  : ${ran.stderr.trim().split('\n')[0]}`);

// Keep the bundle for comparison with the one a browser produces.
writeFileSync(join(here, 'local-bundle.js'), js);
rmSync(dir, { recursive: true, force: true });
