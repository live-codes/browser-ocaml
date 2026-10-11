// Compile OCaml source to JavaScript.
//
// This is the entry point the rest of the world should use: source in,
// JavaScript out, diagnostics alongside. Underneath it is two one-shot compiler
// programs -- the compiler-libs driver for source to bytecode, and js_of_ocaml
// for bytecode to JavaScript -- composed here.
//
// This is the Node shape, where each compiler can simply be run in its own
// process against real files. The browser mirror is the same sequence with one
// worker per compiler and the files registered into the virtual filesystem
// instead of written to disk: same two steps, same handoff, no new ideas.
//
//   import { compile } from './compile.mjs';
//   const { js, diagnostics } = compile(source, { driver, jsoo, stdlib });

import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const lines = (text) => text.split('\n').filter((line) => line.trim() !== '');

export function compile(source, { driver, jsoo, stdlib }) {
  if (typeof source !== 'string') throw new TypeError('compile: source must be a string');
  for (const [name, value] of Object.entries({ driver, jsoo, stdlib })) {
    if (!value) throw new TypeError(`compile: ${name} is required`);
  }

  // A fresh directory per compile: the compilers write .cmo/.byte next to the
  // source, and reusing a directory is how stale artifacts get linked instead.
  const dir = mkdtempSync(join(tmpdir(), 'ocaml-compile-'));
  try {
    cpSync(stdlib, join(dir, 'stdlib'), { recursive: true });
    writeFileSync(join(dir, 'main.ml'), source);

    const run = (script, args) =>
      spawnSync(process.execPath, [script, ...args], {
        cwd: dir,
        env: { ...process.env, OCAMLLIB: 'stdlib' },
        encoding: 'buffer',
        maxBuffer: 256 * 1024 * 1024
      });

    // Source -> bytecode, as hex. Success is "the hex arrived", not an exit
    // code: the driver must not call `exit`, because in a browser-target build
    // `exit` is not implemented.
    const front = run(driver, ['main.ml']);
    const diagnostics = lines(front.stderr.toString());
    const hex = front.stdout.toString().trim();
    if (!/^[0-9a-f]+$/.test(hex)) {
      return { js: null, diagnostics, error: 'compilation failed' };
    }
    writeFileSync(join(dir, 'main.byte'), Buffer.from(hex, 'hex'));

    // Bytecode -> JavaScript, on stdout. Same rule: go by the output.
    const back = run(jsoo, ['main.byte', '-o', '-']);
    const backDiagnostics = lines(back.stderr.toString());
    const js = back.stdout.toString();
    if (back.status !== 0 || js.trim() === '') {
      return {
        js: null,
        diagnostics: [...diagnostics, ...backDiagnostics],
        error: `js_of_ocaml produced no output (exit ${back.status})`
      };
    }
    return { js, diagnostics: [...diagnostics, ...backDiagnostics] };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
