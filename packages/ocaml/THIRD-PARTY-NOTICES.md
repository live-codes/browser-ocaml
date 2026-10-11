# Third-party notices

The generated artifacts in this package are not only this project's code. They are real OCaml
compilers, and they embed other projects' work under their own licenses. Those licenses are
permissive-with-conditions rather than copyleft-on-you, but the conditions are real, and this file
records what is whose.

The package ships two independent implementations, each with its own artifacts:

| Implementation | Artifacts | What runs |
| --- | --- | --- |
| **compiler** | `assets/compiler/compile_stdout.browser.js`, `assets/compiler/jsoo.js`, `assets/compiler/stdlib/` | OCaml source becomes JavaScript |
| **interpreter** | `assets/interpreter/worker.js`, `assets/interpreter/worker-entry.js`, `assets/interpreter/stdlib/`, `assets/interpreter/libs/` | OCaml runs directly, as a toplevel |

## OCaml

<https://github.com/ocaml/ocaml>

Two separate things come from here.

`compiler-libs` is the frontend — parser, type-checker, bytecode compiler and linker — which is
what makes these real OCaml rather than a reimplementation, and it is what both
`compile_stdout.browser.js` and `worker.js` link.

`stdlib/` is the standard library of the OCaml distribution, copied from the installed compiler:
the interfaces, the code, and the two files the bytecode linker reads (`std_exit.cmo` and
`runtime-launch-info`).

**LGPL-2.1-or-later WITH the OCaml linking exception.** The full text is in `LICENSE`.

## js_of_ocaml

<https://github.com/ocsigen/js_of_ocaml>

The compiler that turns OCaml bytecode into every `.js` artifact here, and the runtime those
artifacts run on. `assets/compiler/jsoo.js` is js_of_ocaml itself, compiled to JavaScript by
js_of_ocaml — which is how the compiler runs in a browser at all.

Dual-licensed, as its opam metadata states:

- **GPL-2.0-or-later**, or
- **LGPL-2.1-or-later WITH OCaml-LGPL-linking-exception**

The second arm is the one that applies to bundled artifacts like these: the linking exception
exists so that compiling or linking OCaml code does not make the result subject to copyleft.

## Note on this file

The `.js` artifacts are generated, so this notice travels with the package rather than being
reproduced inside them. If you redistribute the assets, keep this file with them.
