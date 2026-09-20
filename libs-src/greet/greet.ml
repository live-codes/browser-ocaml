(* A stand-in for a third-party opam library: pure OCaml, no C stubs, so it
   can actually run in the browser. Used to prove runtime library loading. *)

let hello name = "hello, " ^ name
let twice f x = f (f x)
