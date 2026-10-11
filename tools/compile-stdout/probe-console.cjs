// The browser harness has to capture the compiler's output by overriding
// console, because fs_fake picks console.log / console.error as the fd 1 and 2
// sinks. This checks that the output really arrives there -- if it does not, a
// worker-based mirror cannot work.
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, 'work');
const stdlib = path.join(dir, 'stdlib-min');
const realLog = console.log;
const realError = console.error;
const captured = [];

console.log = (...args) => captured.push(args.join(' '));
console.error = (...args) => captured.push(args.join(' '));

globalThis.jsoo_fs_tmp = [
  { name: 'main.ml', content: fs.readFileSync(path.join(dir, 'main.ml'), 'latin1') },
  ...fs.readdirSync(stdlib).map((name) => ({
    name: 'stdlib-min/' + name,
    content: fs.readFileSync(path.join(stdlib, name), 'latin1')
  }))
];
globalThis.jsoo_env = { OCAMLLIB: 'stdlib-min' };
globalThis.process = { argv: ['node', 'compile_stdout', 'main.ml'] };

require(path.join(dir, 'compile_stdout.browser.js'));

console.log = realLog;
console.error = realError;
const text = captured.join('');
realLog('captured chunks :', captured.length);
realLog('captured chars  :', text.length);
realLog('looks like hex  :', /^[0-9a-f]+$/.test(text));
