// Drive the driver the way a browser must: no filesystem at all.
//
// The build is compiled for the browser target, so it uses fs_fake -- there is
// no disk to fall back on. Every file the compiler needs is queued on
// globalThis.jsoo_fs_tmp, which the program drains at caml_fs_init, and the
// environment and argv are supplied the same way. If this works, the browser
// has nothing left to supply that Node did.
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, 'work');
const stdlib = path.join(dir, 'stdlib-min');

globalThis.jsoo_fs_tmp = [
  { name: 'main.ml', content: fs.readFileSync(path.join(dir, 'main.ml'), 'latin1') },
  ...fs.readdirSync(stdlib).map((name) => ({
    name: 'stdlib-min/' + name,
    content: fs.readFileSync(path.join(stdlib, name), 'latin1')
  }))
];
globalThis.jsoo_env = { OCAMLLIB: 'stdlib-min' };
process.argv = ['node', 'compile_stdout', 'main.ml'];

require(path.join(dir, 'compile_stdout.browser.js'));
