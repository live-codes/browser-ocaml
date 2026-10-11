// Exercise the entry point: does one call turn source into runnable JavaScript,
// and does it report diagnostics rather than failing silently?
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { compile } from './compile.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const assets = {
  driver: join(here, 'work', 'compile_stdout.js'),
  jsoo: join(here, '..', 'emit_probe', 'work', 'jsoo.js'),
  stdlib: join(here, 'work', 'stdlib')
};

const cases = {
  plain: 'let () = print_endline "entry point ok"',
  warning: 'let f x = 1',
  compileError: 'let x : int = "nope"'
};

for (const [name, source] of Object.entries(cases)) {
  const result = compile(source, assets);
  const summary = result.js
    ? `js ${result.js.length} bytes, diagnostics ${result.diagnostics.length}`
    : `${result.error}, diagnostics ${JSON.stringify(result.diagnostics)}`;
  console.log(`${name.padEnd(13)} -> ${summary}`);

  // Prove the JavaScript actually runs.
  if (result.js) {
    const file = join(here, `work/${name}.js`);
    writeFileSync(file, result.js);
    const output = execFileSync(process.execPath, [file], { encoding: 'utf8' }).trim();
    console.log(`${''.padEnd(13)}    runs and prints: ${JSON.stringify(output)}`);
  }
}
