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

    // Source -> bytecode. The driver prints it as hex, because a raw bytecode
    // stream would not survive a text channel's encoding.
    const front = run(driver, ['main.ml']);
    const diagnostics = lines(front.stderr.toString());
    if (front.status !== 0) {
      return { js: null, diagnostics, error: `compilation failed (exit ${front.status})` };
    }
    writeFileSync(join(dir, 'main.byte'), Buffer.from(front.stdout.toString().trim(), 'hex'));

    // Bytecode -> JavaScript, on stdout.
    const back = run(jsoo, ['main.byte', '-o', '-']);
    const backDiagnostics = lines(back.stderr.toString());
    if (back.status !== 0) {
      return { js: null, diagnostics: [...diagnostics, ...backDiagnostics], error: `js_of_ocaml failed (exit ${back.status})` };
    }
    return { js: back.stdout.toString(), diagnostics: [...diagnostics, ...backDiagnostics] };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
