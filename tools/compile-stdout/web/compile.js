// Compile OCaml source to JavaScript, in a browser.
//
// The mirror of compile.mjs: the same two steps and the same handoff, but each
// compiler runs in its own worker (it cannot be reused) with its files
// registered into the virtual filesystem instead of written to disk.
//
//   import { loadStdlib, compile } from './compile.js';
//   const stdlib = await loadStdlib(new URL('../../work/stdlib-min/', location.href));
//   const { js, diagnostics } = await compile(source, { baseUrl, stdlib });

const WORKER = new URL('worker.js', import.meta.url);

const lines = (text) => text.split('\n').filter((line) => line.trim() !== '');

// js_of_ocaml is a command-line program and calls `exit` after writing its
// output -- and in a browser-target build `exit` is not implemented, so it
// raises. That is noise rather than a diagnostic: the output has already
// arrived. Filter it, since we cannot change the CLI.
const PHANTOM = /Function 'exit' not implemented/;
const diagnosticsOf = (text) => lines(text).filter((line) => !PHANTOM.test(line));

// Byte-for-byte, and deliberately not TextDecoder: in browsers "latin1" and
// "iso-8859-1" are both aliases for windows-1252, which remaps bytes 0x80-0x9F.
// That is enough to make a .cmi unreadable -- "Corrupted compiled interface" --
// so the bytes are copied one at a time. Chunked, because a 1.6 MB .cma would
// overflow the argument list.
function bytesToString(bytes) {
  let s = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return s;
}

function runInWorker(script, files, env, argv) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKER);
    worker.onmessage = (event) => {
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || 'worker failed'));
    };
    worker.postMessage({ script, files, env, argv });
  });
}

const hexToBytes = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
};

// The stdlib is served as plain files plus a manifest listing them, the same
// shape the earlier interpreter used for its interfaces.
export async function loadStdlib(baseUrl) {
  const manifest = await (await fetch(new URL('manifest.txt', baseUrl))).text();
  return Promise.all(
    lines(manifest).map(async (name) => ({
      name: `stdlib/${name}`,
      content: bytesToString(new Uint8Array(await (await fetch(new URL(name, baseUrl))).arrayBuffer()))
    }))
  );
}

export async function compile(source, { baseUrl, driver, jsoo, stdlib }) {
  if (typeof source !== 'string') throw new TypeError('compile: source must be a string');
  const files = [{ name: 'main.ml', content: source }, ...stdlib];

  // Source -> bytecode, as hex.
  const front = await runInWorker(
    new URL(driver, baseUrl).href,
    files,
    { OCAMLLIB: 'stdlib' },
    ['node', 'compile_stdout', 'main.ml']
  );
  const diagnostics = diagnosticsOf(front.err);
  const hex = front.out.trim();
  if (!/^[0-9a-f]+$/.test(hex)) {
    return { js: null, diagnostics, error: 'compilation failed' };
  }

  // Bytecode -> JavaScript, on stdout.
  const back = await runInWorker(
    new URL(jsoo, baseUrl).href,
    [{ name: 'main.byte', content: bytesToString(hexToBytes(hex)) }],
    {},
    ['node', 'js_of_ocaml', 'main.byte', '-o', '-']
  );
  const backDiagnostics = diagnosticsOf(back.err);
  const js = back.out;
  if (js.trim() === '') {
    return { js: null, diagnostics: [...diagnostics, ...backDiagnostics], error: 'js_of_ocaml produced no output' };
  }
  return { js, diagnostics: [...diagnostics, ...backDiagnostics] };
}
