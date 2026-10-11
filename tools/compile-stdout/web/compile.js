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
const decoder = new TextDecoder('latin1'); // byte-for-byte, unlike utf-8

const lines = (text) => text.split('\n').filter((line) => line.trim() !== '');

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

const bytesToString = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
};

const hexToBytes = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
};

// The stdlib is served as plain files plus a manifest listing them, the same
// shape the earlier interpreter used for its interfaces.
export async function loadStdlib(baseUrl) {
  const manifest = await (await fetch(new URL('manifest.txt', baseUrl))).text();
  const names = lines(manifest);
  return Promise.all(
    names.map(async (name) => ({
      name: `stdlib/${name}`,
      content: decoder.decode(new Uint8Array(await (await fetch(new URL(name, baseUrl))).arrayBuffer()))
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
  const diagnostics = lines(front.err);
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
  const backDiagnostics = lines(back.err);
  const js = back.out;
  if (js.trim() === '') {
    return { js: null, diagnostics: [...diagnostics, ...backDiagnostics], error: 'js_of_ocaml produced no output' };
  }
  return { js, diagnostics: [...diagnostics, ...backDiagnostics] };
}
