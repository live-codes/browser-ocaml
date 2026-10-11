// Prove that argv can be injected from JavaScript before the compiler loads.
//
// This is what makes the CLI-as-JS usable in a browser. js_of_ocaml's runtime
// initialises argv like this (runtime/js/sys.js):
//
//   var caml_argv = (function () {
//     if (process?.argv?.length > 1) { var argv = process.argv; main = argv[1]; args = argv.slice(2); }
//
// It reads `process?.argv`, so where there is no real `process` -- a browser --
// a fake one is enough. Nothing has to be patched.
process.argv = ['node', 'js_of_ocaml', 'work/t.byte', '-o', 'work/out.js'];
require('./work/jsoo.js');
