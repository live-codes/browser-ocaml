# @live-codes/ocaml

Run **OCaml** in the browser, with no server and no build step. Two independent implementations
ship in this package, behind separate entry points so that using one costs nothing for the other.

| Entry point | What it does |
| --- | --- |
| `@live-codes/ocaml` (or `/compiler`) | Compiles OCaml to JavaScript, which the page then runs |
| `@live-codes/ocaml/interpreter` | A toplevel: type-checks and runs OCaml directly |

Both are real OCaml — the same `compiler-libs` frontend that compiles ordinary OCaml — built with
`js_of_ocaml` to run in a browser. Neither needs a server. **The compiler is the default**, because
that is the shape the rest of LiveCodes uses: source becomes JavaScript, and the result page runs
it.

A page cannot read files out of `node_modules`, so whichever implementation you use, its assets have
to be published by whatever serves the page:

```bash
npx --package @live-codes/ocaml ocaml-copy-assets --compiler public/ocaml-compiler
```

`copy-assets` writes one implementation at a time — `--compiler`, `--interpreter`, or `--all` into
subdirectories — so a compiler user never serves the interpreter's 4.6 MB, and the other way round.
Serve that directory and point `baseUrl` at it.

## The compiler

```js
import { createCompiler } from '@live-codes/ocaml';

const compiler = await createCompiler({ baseUrl: new URL('/ocaml-compiler/', location.href) });

const { js, diagnostics } = await compiler.compile(`
let () =
  let xs = List.init 5 (fun i -> i * i) in
  Printf.printf "sum=%d\\n" (List.fold_left (+) 0 xs)
`);

console.log(js);          // JavaScript, ready to run in the page
console.log(diagnostics); // [] on success
```

`compile` returns:

| Field | Meaning |
| --- | --- |
| `js` | The compiled JavaScript, self-contained. `null` if it did not compile. |
| `diagnostics` | Compiler messages — errors *and* warnings — one string per line, with locations. |
| `error` | Present only when the toolchain itself failed, as opposed to the program not compiling. |

Underneath it is two compilers, each in its own worker: `compile_stdout.browser.js` turns source
into bytecode, and `jsoo.js` — js_of_ocaml itself, compiled to JavaScript — turns bytecode into
JavaScript. One worker per step, because a js_of_ocaml program runs its main on load and returns,
so it cannot be reused. Everything crosses between the page and the compilers through a virtual
filesystem; nothing is written to disk.

**What this does *not* give you, deliberately:** no stdin, no `Sys.argv`, no exit code. The compiled
program runs in the page rather than as a process — the same trade every compile-to-JS language in
LiveCodes makes, and it is what buys page interaction, since the program *is* JavaScript by the time
it runs. If you need a process-like contract, use the interpreter.

About 14 MB of assets, fetched once and cacheable: 2.6 MB for the driver, 5.02 MB for js_of_ocaml,
0.8 MB of the js_of_ocaml runtime chunks the compiler looks for while emitting, and 5.67 MB for the
standard library. That last one is a single `js_of_ocaml build-fs` artifact carrying all 75 files
rather than 75 fetched separately — about 2.6× the size, because a byte above 127 inlines as an
escape, but one request instead of 75 and nothing to assemble on the page. A small program compiles
in about a second and emits roughly 70 KB — the JavaScript is pretty-printed, which is what a
Compiled Code pane wants, and it keeps the output line-oriented.

## The interpreter

```js
import { createCompiler } from '@live-codes/ocaml/interpreter';

const compiler = await createCompiler({ baseUrl: new URL('/ocaml-interpreter/', location.href) });

const { stdout, stderr, exitCode, diagnostics } = await compiler.run(
  'let () = print_endline (read_line ())',
  'from stdin'
);
```

This one behaves like a program rather than a page: `read_line`, `Sys.argv`, `open_in`, `exit n` and
command-line arguments all work, and so do libraries, loaded on demand the first time code names one
of their modules.

| Field | Meaning |
| --- | --- |
| `stdout` | Everything the program wrote to fd 1. |
| `stderr` | Everything it wrote to fd 2. |
| `output` | Both, in the order they were flushed — what a terminal would have shown. |
| `diagnostics` | The compiler's errors **and warnings**, one string per line. |
| `errors` | The same, but only when the program failed to compile. |
| `exitCode` | The program's exit status, or `null` if it never ran because it did not compile. |
| `outcome` | The toplevel's own output, e.g. `val x : int = 3`. A compiled program would not print this. |
| `error` | Present only when the toolchain itself failed. `run` does not throw for a broken program. |
| `runMs` | Wall clock for the run. |

Two choices worth knowing, since they are choices:

- **`errors` is empty on success**, so `errors.length` is a reliable failure test. Warnings from a
  successful run are in `diagnostics`, not there. A build treats a warning as a warning, so
  `exitCode` stays `0`.
- **`stderr` and `diagnostics` are separated by shape, not by channel.** The toplevel routes both the
  compiler's output and the program's own stderr to the same stream, so a program printing something
  shaped like a diagnostic (`Line 1, ...`, `Error: ...`) is classified as one. The alternative was
  not offering them apart at all.

`createCompiler` also takes default `args` and `files` (`[{ name, contents }]`, written into the
runtime's filesystem so `open_in "name"` finds them), which `run(code, input, runOptions)` can
override per run. `compiler.dispose()` stops the worker.

**Libraries load on demand.** A library's `.cma` is fetched and Dynlinked the first time code names
one of its modules. The archive must be built for the same OCaml version and be pure enough to run in
a browser — no C stubs, no `Unix`, no threads — so most of opam is out, which is a toolchain step
rather than something this package can do at runtime.

**No JS interop and no DOM.** The toplevel runs in a Worker, which has no `document` at all, and the
build exports only the standard library, so `Js` and `Dom_html` are unbound. Use the compiler if you
want the program to touch the page — that is exactly what it is for.

## Which one

| | Compiler | Interpreter |
| --- | --- | --- |
| Result | JavaScript the page runs | Output text, from a program that ran |
| Page interaction | yes — it *is* JavaScript by then | no |
| stdin, argv, exit codes | no | yes |
| Libraries | linked in when compiling | loaded on demand |
| Cost per run | ~1 s | instant, incremental |

## License

**LGPL-2.1-or-later WITH OCaml-LGPL-linking-exception.** The compiler and the standard library in
`assets/` come from OCaml and js_of_ocaml, and that exception is what allows distributing compiled
artifacts like these under terms of your choosing. See `LICENSE`, and `THIRD-PARTY-NOTICES.md` for
what is whose inside the generated bundles.

## Building

The artifacts are generated, and the build runs in the toolchain container described in `docker/` —
OCaml 5.5.1 and js_of_ocaml 6.4.1, both declared in `docker/Dockerfile` and nowhere else — with the
repository mounted at `/home/opam/src`. `docker run --rm` rather than `docker exec`, so it always
runs the image you just built:

```sh
docker build -t ocaml-toolchain docker                                       # once
docker run --rm -v "$PWD:/home/opam/src" -w /home/opam/src ocaml-toolchain sh docker/build-compiler.sh
docker run --rm -v "$PWD:/home/opam/src" -w /home/opam/src ocaml-toolchain sh docker/build.sh
```

Both stage into this package's `assets/`. The compiler build applies a one-line opt-out of findlib —
code that otherwise reads an absolute config path at startup, which a browser filesystem cannot
resolve. It removes exactly that line and fails loudly if js_of_ocaml's dune file changes shape, so a
version bump cannot silently patch the wrong thing.

## Tests

- `test/compiler.html` — compiles and runs a program in a browser
- `test/interpreter.html` — the interpreter's contract, in a browser
- `test/interpreter-in-worker.html` — the runtime inside a worker the host already owns
- `test/node-check.mjs` — the interpreter outside a browser: `node test/node-check.mjs`

Serve the repository root and open the pages; they load the assets from this package.
