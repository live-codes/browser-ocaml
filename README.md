# browser-ocaml

Tools for running **OCaml in a browser**, with no server: two implementations, and the npm package
that ships them.

Everything here is built from the real OCaml compiler — the same `compiler-libs` frontend and the
same `js_of_ocaml` backend that compile ordinary OCaml, built to run in a page. Nothing is sent
anywhere: there is no compile server, no API, no backend.

| | |
| --- | --- |
| `packages/ocaml` | **`@live-codes/ocaml`**: the npm package, both implementations behind separate entry points |
| `tools/compile-stdout` | The compiler-libs driver: OCaml source to bytecode, written to stdout |
| `tools/emit_probe` | js_of_ocaml built as JavaScript, and the probes that established how |
| `src/worker.ml` | The interpreter: an OCaml toplevel, compiled to JavaScript |
| `web/` | The interpreter's own demo page |
| `docker/` | The build-time toolchain and the two build scripts |
| `FINDINGS.md` | What was learned, what was ruled out and why, and the traps that cost time |
| `HANDOVER.md` | Where the work stands, and what is left |

## The two implementations

**The compiler** turns OCaml source into JavaScript, which the page then runs. That is the model
LiveCodes uses for TypeScript, CoffeeScript and ReScript, so it is the default:

```
source ──> compile_stdout.browser.js ──> bytecode ──> jsoo.js ──> JavaScript
```

Both of those are js_of_ocaml programs: the first is our own driver over compiler-libs, the second
is js_of_ocaml *itself*, compiled to JavaScript — which is how the compiler runs in a browser at
all. One worker per step, because a js_of_ocaml program runs its main on load and returns. Nothing
is written to disk: every file crosses through a virtual filesystem, and the result comes back on
stdout.

What it deliberately does *not* give you: no stdin, no `Sys.argv`, no exit code, because the
compiled program runs in the page rather than as a process. That is the trade for page interaction —
the program *is* JavaScript by the time it runs.

**The interpreter** is an OCaml toplevel: it type-checks and runs source directly, in a worker, so a
slow program cannot freeze the page. It behaves like a program rather than a page — `read_line`,
`Sys.argv`, `open_in` and `exit n` all work, and libraries are Dynlinked on demand the first time
code names one of their modules. Mechanically it is the same core step as the official OCaml
Playground (<https://ocaml.org/play>): `js_of_ocaml --toplevel`, driving `JsooTop`.

Use the compiler when the program should touch the page; use the interpreter when it should behave
like a script. `packages/ocaml/README.md` has both contracts in full.

## Requirements

- [Docker](https://www.docker.com/) — build time only
- Node 20+ — for the package's Node-side checks and `ocaml-copy-assets`
- Python 3, or any static file server — to serve a page locally

You do **not** need OCaml on your machine. The built artifacts are committed, so a build is only
needed when something changes.

## Building

The toolchain container is `ocaml-toolchain` — OCaml 5.5.1 and js_of_ocaml 6.4.1, both declared in
`docker/Dockerfile` — with the repository mounted at `/home/opam/src`. `docker run --rm` rather than
`docker exec`, so it always uses the image you just built:

```sh
docker build -t ocaml-toolchain docker                                       # once
docker run --rm -v "$PWD:/home/opam/src" -w /home/opam/src ocaml-toolchain sh docker/build-compiler.sh
docker run --rm -v "$PWD:/home/opam/src" -w /home/opam/src ocaml-toolchain sh docker/build.sh
```

Both stage into `packages/ocaml/assets/{compiler,interpreter}/`; `build.sh` also writes the
interpreter's demo into `web/`.

Which OCaml and js_of_ocaml they build with is declared in `docker/Dockerfile` and nowhere else —
the scripts ask the switch for their paths. Upgrading is those two lines, a rebuild and the checks;
`FINDINGS.md` §2.5 is the guide, including what tends to break and why.

The compiler build applies a one-line opt-out of findlib — code that otherwise reads an absolute
config path as the compiler starts, which a browser filesystem cannot resolve — and **fails loudly**
if js_of_ocaml's dune file changes shape, so a version bump cannot silently patch the wrong thing.
The `Makefile` wraps the same steps with `docker run`, for when there is no long-lived container.

## Tests

Serve the repository root, then open the pages. Every test runs against the built assets.

```sh
python -m http.server 8080      # from the repository root
```

| | |
| --- | --- |
| `packages/ocaml/test/compiler.html` | compiles a program and runs it, in a browser |
| `packages/ocaml/test/interpreter.html` | the interpreter's contract, in a browser |
| `packages/ocaml/test/interpreter-in-worker.html` | the runtime inside a worker the host already owns |
| `packages/ocaml/test/node-check.mjs` | the interpreter outside a browser: `node packages/ocaml/test/node-check.mjs` |
| `web/index.html` | the interpreter's standalone demo |

`tools/compile-stdout/emit-check.mjs` is a diagnostic rather than a test: it reproduces a browser's
conditions outside one — the driver with no filesystem, `jsoo.js` from an empty directory — and
reports the bundle's size, its dummy primitives and what the program prints. `capture-server.mjs`
next to it is a static server that accepts `POST /save`, which is the only way to get bytes out of a
page. Both are worth keeping: the last real bug was found with them after reasoning from inside the
page had failed several times. `verify-fs.mjs` is the third: it hashes what the stdlib artifact
actually registered so it can be compared with the switch's own files, which is the check for a
corrupted `.cmi` after a toolchain upgrade.

## The package

`packages/ocaml` publishes as **`@live-codes/ocaml`** — public, under **LGPL-2.1-or-later WITH
OCaml-LGPL-linking-exception**. The compiler artifacts are compiled OCaml produced by js_of_ocaml and
link compiler-libs; the linking exception is what allows distributing artifacts like these under
terms of your choosing. See `packages/ocaml/LICENSE` and `packages/ocaml/THIRD-PARTY-NOTICES.md`.

## Next

LiveCodes integration is the remaining step, and it is deliberately not started: the language entry,
its starter, its tests, and deprecating the ReScript-backed `ocaml` entry that currently advertises
OCaml while running a different language. `HANDOVER.md` has the contract and the decisions.
