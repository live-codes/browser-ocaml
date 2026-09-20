# @live-codes/ocaml-wasm

Run **OCaml** in the browser, with no server and no build step. The runtime is a real OCaml toplevel -
the same `compiler-libs` frontend that compiles ordinary OCaml, built with `js_of_ocaml` - running in a
Web Worker, so a slow or runaway program cannot freeze the page.

```js
import { createCompiler } from '@live-codes/ocaml-wasm';

const compiler = await createCompiler({ baseUrl: new URL('/ocaml/', location.href) });

const { stdout, errors, exitCode } = await compiler.run(`
let () = print_endline "hello"
`);

console.log(stdout);   // "hello\n"
console.log(exitCode); // 0
```

A page cannot read a file inside an npm package, so the runtime assets have to be published somewhere
it can fetch them:

```bash
npx --package @live-codes/ocaml-wasm ocaml-wasm-copy-assets public/ocaml
```

That writes `worker.js`, `stdlib/` and `libs/` into a directory you already serve. Point `baseUrl` at
it. **Browser only for now**: the worker talks to the page through `self.onmessage`/`postMessage`,
which is the Web Worker API, and Node's `worker_threads` is a different interface - so there is no
`node` entry rather than a misleading one.

## API

### `createCompiler(options)`

Returns a promise for a runtime. The worker is started and the toplevel initialised here, so a bad
`baseUrl` fails now rather than at the first `run`.

| Option | Meaning |
| --- | --- |
| `baseUrl` | Where the runtime assets are served from. **Required.** Absolute, or relative to the page. |
| `args` | Default program argv. `Sys.argv.(0)` is `"main.ml"`. |
| `files` | Default files: `[{ name, contents }]`, written into the runtime's filesystem so `open_in "name"` finds them. |

### `compiler.run(code, input?, runOptions?)`

Runs a program. `input` is stdin as a string, handed to the program once and then closed.
`runOptions` may override `args` and `files` for that run.

| Field | Meaning |
| --- | --- |
| `stdout` | Everything the program wrote to fd 1. |
| `stderr` | Everything it wrote to fd 2. |
| `output` | Both, in the order they were flushed - what a terminal would have shown. |
| `diagnostics` | The compiler's errors **and warnings**, one string per line. |
| `errors` | The same, but only when the program failed to compile. |
| `exitCode` | The program's exit status, or `null` if it never ran because it did not compile. |
| `outcome` | The toplevel's own output, e.g. `val x : int = 3`. A compiled program would not print this. |
| `runMs` | Wall clock for the run. |

Two choices worth knowing, since they are choices:

- **`errors` is empty on success** so `errors.length` is a reliable failure test. That means warnings
  from a successful run are not in it - they are in `diagnostics`, which always holds everything. A
  build treats a warning as a warning, so `exitCode` stays `0`.
- **`stderr` and `diagnostics` are separated by shape, not by channel.** The toplevel routes both the
  compiler's output and the program's own stderr to the same stream. A program that prints something
  shaped like a diagnostic (`Line 1, ...`, `Error: ...`) is misclassified as one. The alternative was
  not offering them apart at all.

### `compiler.dispose()`

Stops the worker. Further runs reject.

## Interoperability

| Capability | Status |
| --- | --- |
| stdout / stderr | yes, separately, and as one ordered `output` |
| stdin | yes - `read_line`, `input_line stdin`, `read_int`, `Scanf` |
| argv | yes - `Sys.argv`, and `Arg.parse` |
| files | yes - in the runtime's filesystem, readable with `open_in` |
| exit code | yes - `exit n` works, and `null` means it never ran |
| warnings and diagnostics | yes, kept apart from program output |
| libraries | yes, lazily - see below |
| JS interop / DOM | **no** |

**Libraries load on demand.** A library's `.cma` is fetched and Dynlinked the first time code names
one of its modules, which is what the type-checker asking for that module's interface means. Nothing
is loaded because it merely exists. The archive must be built for the same OCaml version and be
pure enough to run in a browser - no C stubs, no `Unix`, no threads - so most of opam is out, and
building the set is a toolchain step rather than something this package can do at runtime.

**No JS interop, and no DOM.** The toplevel runs in a Worker, which has no `document` at all, and the
build exports only the standard library to user code, so `Js` and `Dom_html` are unbound. DOM work
would mean either moving the toplevel to the main thread - losing the ability to stop a runaway
program, which is the reason for the worker - or building a message bridge.

This package is a **script runner**: it matches what a local `dune exec` gives you (stdout, stdin,
argv, files, exit codes, diagnostics). It does not aim to match a `dune` *project* - there is no
multi-module build, and no `dune-project`.

## Where the assets come from

About 4.4 MB, laid out as the runtime expects a base URL to be:

```
worker.js          the OCaml toplevel, compiled to JavaScript (~4.2 MB)
stdlib/            71 .cmi interfaces, fetched on demand
  units.txt        the manifest of which interfaces exist
libs/              libraries, fetched only when used
  manifest.txt     library <TAB> archive <TAB> comma-separated cmi files
```

`worker.js` is large because it contains the compiler: the parser, the type-checker and the bytecode
interpreter. The `.cmi` files are deliberately *not* embedded - that was 12.5 MB - and are fetched as
the type-checker asks for them, which brought the payload down to where it is now.

## License

**Not yet decided** - this package has no `license` field for that reason. Note before choosing:
`worker.js` embeds js_of_ocaml and OCaml's `compiler-libs`, which are LGPL-2.1-or-later *with the
OCaml linking exception* (js_of_ocaml is dual-licensed, the other arm being GPL-2.0-or-later). The
linking exception is what makes a bundle like this permissible, but it carries an attribution
condition - see `THIRD-PARTY-NOTICES.md`.

## Development

`packages/ocaml-wasm/test/browser.html` runs the API against the staged `assets/` and prints a summary
for each case. Serve the repository root and open it:

```bash
python -m http.server 8080      # from the repository root
# http://localhost:8080/packages/ocaml-wasm/test/browser.html
```

The assets come from the repository's build (`docker/build.sh`), which stages them here as well as
into `web/` for the standalone demo page.
