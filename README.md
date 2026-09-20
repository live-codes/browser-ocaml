# browser-ocaml

Proof of concept: a **real OCaml toplevel running in the browser, with no server**.

This is groundwork for adding OCaml (Wasm) language support to
[LiveCodes](https://livecodes.io). It follows the same approach as the official
OCaml Playground (<https://ocaml.org/play>) — see `## How it works` below.

## What this does

Type OCaml in the page, press **Run**, and get real toplevel output (values,
`Printf` output, and compiler error messages) — all computed in the browser.

Nothing is ever sent anywhere: there is no compile server, no API, no backend.

## Status

**Working and verified end to end.** The page was driven with a real browser:
values, `Printf` output, stdlib calls and compiler errors are all produced by
the OCaml toplevel running inside the page.

| Step | Status |
| ---- | ------ |
| Toolchain image builds, `opam` installs `js_of_ocaml` 6.4.1 + `js_of_ocaml-toplevel` 6.4.1 | verified |
| `gen_stdlib.sh` collects interfaces into `web/stdlib/` | verified (71 interfaces, ~350 KB) |
| `dune build src/worker.bc` | verified |
| `js_of_ocaml --toplevel --effects=cps --no-cmis --export` → `web/worker.js` | verified (4.2 MB) |
| Running OCaml in a browser | verified |

Payload: **12.5 MB → 4.2 MB**, plus ~350 KB of interfaces that are fetched only
when the code being run actually needs them (`--no-cmis`).

What was actually observed in the browser:

- Naive `fib` via recursion → `val fib : int -> int = <fun>`, then
  `fib 0 = 0` … `fib 10 = 55` from `Printf.printf`
- `List.map`, `Printf.printf`, `String.uppercase_ascii` →
  `val xs : int list = [1; 4; 9; 16]` and `val s : string = "STDLIB WORKS"`
- A deliberate type error, reported with its source location:
  `Error: This expression has type "string" but an expression was expected of type "int"`
- Moving `web/stdlib/` aside makes the same stdlib call fail with
  `Error: The module "List" is an alias for module "Stdlib__List", which is missing`
  — which is what proves the interfaces are fetched on demand rather than
  embedded.

### Three things that are easy to get wrong

- **`--effects=cps` is required.** Without an effects backend js_of_ocaml warns
  `[missing-effects-backend]` and the toplevel misbehaves, because compiler-libs
  uses effect handlers. This is the modern equivalent of the official
  playground's `--enable=effects`.
- **The interface fetch has to be synchronous.** The compiler calls the
  signature loader from inside the type-checker, so there is no opportunity to
  await a promise. `worker.ml` uses synchronous `XMLHttpRequest` — deprecated,
  but it works in a worker. An async loader cannot work here.
- **Don't hand-parse the `.cmi` format.** The official playground unmarshals the
  header itself, and that is fragile across compiler versions — it broke here:
  `Persistent_signature.t` gained a `visibility` field and `load` gained
  `allow_hidden`. This PoC sidesteps it by writing the fetched bytes into
  js_of_ocaml's in-memory filesystem and calling the compiler's own
  `Cmi_format.read_cmi`.

## How it works

There are two separate things people mean by "compile OCaml to the browser",
and they are easy to conflate:

1. **`js_of_ocaml` / `wasm_of_ocaml`** — a *compiler* from OCaml **bytecode** to
   JavaScript or WebAssembly. It is an offline build tool. You cannot load it
   into a page and have it compile OCaml source; it only takes bytecode as input.
2. **The toplevel** — the OCaml compiler frontend itself (`compiler-libs`
   toplevel) compiled to JavaScript and shipped to the browser. This is what
   turns *source code you type* into something runnable at runtime.

The official playground uses approach (2). So does this PoC:

```
src/worker.ml                 OCaml: JsooTop + on-demand interface loader
      │  dune build
      ▼
_build/.../worker.bc          OCaml bytecode
      │  js_of_ocaml --toplevel --effects=cps --no-cmis --export
      ▼
web/worker.js                 the OCaml toplevel, as JavaScript (4.2 MB)
      │  new Worker()
      ▼
browser                       runs typed OCaml source, in a Web Worker
      │  needs a unit's interface?
      ▼
web/stdlib/*.cmi              fetched on demand — 71 interfaces, ~350 KB
```

The `--toplevel` flag is the important part: it packages `compiler-libs` into
the JavaScript output so the in-browser toplevel can *parse, type-check and
execute* source phrases at runtime. Within `worker.ml`, the actual work is done
by `Js_of_ocaml_toplevel.JsooTop`.

By default `--toplevel` also embeds the `.cmi` interface files of every linked
unit, which is what made the first version 12.5 MB. `--no-cmis` turns that off,
and `worker.ml` fetches the interfaces it needs from `web/stdlib/` instead.

The worker runs off the main thread so a slow program (or an infinite loop)
does not freeze the page — the same reason the official playground puts its
toplevel in a worker.

### Difference from the official playground

The official playground is built from `playground/` in the
[ocaml/ocaml.org](https://github.com/ocaml/ocaml.org) repo. It additionally uses
CodeMirror 6, Merlin (for autocompletion) and an `rpclib` RPC layer between the
page and the worker. Those are features, not mechanics, so this PoC drops them
and uses a two-message protocol instead, to keep the moving parts visible.

What it keeps is the part that matters: **`js_of_ocaml --toplevel`, driving
`JsooTop` from a Web Worker, with the page sending source strings.**

## Requirements

- [Docker](https://www.docker.com/) — used **only at build time**
- Python 3 (or any static file server) — to serve the page locally

You do **not** need OCaml installed on your machine.

## Build

```sh
make toolchain   # build the OCaml + js_of_ocaml image (once, slow)
make worker      # compile src/worker.ml -> web/worker.js
```

Or without `make`:

```sh
docker build -t browser-ocaml-toolchain docker
docker run --rm -v "$PWD:/home/opam/src" -w /home/opam/src \
  browser-ocaml-toolchain sh docker/build.sh
```

## Run

```sh
make serve       # serves web/ on http://localhost:8080
```

Then open <http://localhost:8080>.

A local server is needed only because Web Workers are not permitted on
`file://` origins. It serves static files and does no computation; the same
`web/` directory works unchanged on any static host (GitHub Pages, S3, the
LiveCodes CDN).

## Layout

| Path                    | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `src/worker.ml`         | The toplevel worker (OCaml)                      |
| `src/dune`              | Builds `worker.ml` to bytecode                   |
| `gen_stdlib.sh`         | Collects the interfaces into `web/stdlib/`       |
| `web/index.html`        | The page                                         |
| `web/app.js`            | Main-thread client                               |
| `web/worker.js`         | Generated — the compiled toplevel                |
| `web/stdlib/`           | Generated — the interfaces, fetched on demand    |
| `export.txt`            | Generated — the units exposed to the toplevel    |
| `docker/Dockerfile`     | Build-time toolchain                             |
| `docker/build.sh`       | The actual build steps                           |

## The WebAssembly question

This PoC compiles the toplevel with `js_of_ocaml`, so the *toplevel* is
JavaScript, matching the official playground. It is not yet "OCaml Wasm".

That is a deliberate staging decision, and it is a one-line change to move:

- `js_of_ocaml --toplevel worker.byte` → produces a JavaScript toplevel
- `wasm_of_ocaml --toplevel worker.byte` → produces a WebAssembly toplevel

`wasm_of_ocaml` was a fork of `js_of_ocaml` but was **merged back**: since
v6.0.1 they share one repository and one release. Both are installed from the
same project and both support `--toplevel`, `Dynlink` and `--export`; toplevel
support on the Wasm backend specifically landed in 6.4.

The Wasm backend additionally requires the browser to support WebAssembly GC,
tail calls and exception handling (Chrome 119+, Firefox 122+, Safari 18.2+), and
does not support multicore `Domain`s. Note that this increases the browser
baseline a Wasm-backed language support would impose on LiveCodes.

## Next steps

1. **Minify.** The 4.2 MB is unminified. The playground pipes its worker through
   `jsoo_minify`; doing the same here should take a real bite out of it, and
   gzip/brotli over the wire more again.
2. **Add the Wasm backend.** Add a second target in `docker/build.sh` using
   `wasm_of_ocaml --toplevel`, and select between the two at runtime. This is
   the step that makes it "OCaml (Wasm)".
3. **Fit LiveCodes.** LiveCodes' WASM languages are "load a prebuilt toolchain
   from a CDN and run it in an iframe/worker". This PoC's `web/` is already
   that shape: `worker.js`, `stdlib/`, and a page. The remaining work is
   packaging those assets for the CDN, and mapping the Run/console output onto
   LiveCodes' language API (`LanguageSpecs`, a compiler/worker entry, and the
   `Run` hook).
4. **Decide the domain story.** The JS backend supports OCaml 5 multicore
   `Domain`s (that is why the official playground uses it); the Wasm backend
   does not. If LiveCodes wants `Domain.spawn` to work, the JS backend is the
   only option today.
5. **Consider a worker timeout.** An infinite loop in the user's code will hang
   the worker forever. LiveCodes will want to terminate and respawn it, the way
   the playground does with its timeout container.
