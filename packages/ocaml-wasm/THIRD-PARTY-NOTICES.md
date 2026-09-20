# Third-party notices

`worker.js` in this package is not only this project's code. It is an OCaml compiler, compiled to
JavaScript, and it embeds other projects' work under their own licenses. Those licenses are
permissive-with-conditions rather than copyleft-on-you, but the conditions are real, and this file
records what is whose.

## js_of_ocaml

<https://github.com/ocsigen/js_of_ocaml>

The compiler that turns OCaml bytecode into the JavaScript in `worker.js`, and the runtime that
`worker.js` runs on.

Dual-licensed, as its opam metadata states:

- **GPL-2.0-or-later**, or
- **LGPL-2.1-or-later WITH OCaml-LGPL-linking-exception**

The second arm is the one that applies to a bundle like this: the linking exception exists so that
compiling or linking OCaml code does not make the result subject to copyleft. `worker.js` is a
compiled artifact of this kind.

## OCaml compiler-libs

<https://github.com/ocaml/ocaml>

The OCaml frontend - parser, type-checker and bytecode interpreter - which is what makes the runtime a
real OCaml toplevel rather than a reimplementation. `worker.js` links it, because a toplevel that
cannot type-check is not a toplevel.

**LGPL-2.1-or-later WITH the OCaml linking exception**, the same arrangement as above.

## Note on this file

`worker.js` is a generated artifact, so this notice travels with the package rather than being
reproduced inside the bundle. If you redistribute the assets, keep this file with them.
