// @live-codes/ocaml
//
// Two implementations of OCaml in the browser, each behind its own entry point
// so that using one costs nothing for the other:
//
//   @live-codes/ocaml              this file -- the compiler
//   @live-codes/ocaml/compiler     OCaml source -> JavaScript
//   @live-codes/ocaml/interpreter  a toplevel that runs OCaml directly
//
// The compiler is the default because that is the model the other LiveCodes
// languages use: the source becomes JavaScript, which the page then runs.
export * from './compiler/index.js';
