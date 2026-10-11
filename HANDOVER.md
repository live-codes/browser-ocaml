# HANDOVER.md — continuing OCaml-in-LiveCodes

For a fresh session picking this up. Read `FINDINGS.md` alongside it: that has the technical record —
what was measured, what was ruled out and why, the traps, the upgrade guide (§2.5) and the LiveCodes
contract (§6). This file is what to *do* next and what not to repeat.

**Status: the OCaml side is done.** Both implementations are packaged behind separate entry points,
licensed, built reproducibly, and verified — the compiler and the interpreter, in a browser and under
node, from the source tree and from the published tarball. The one remaining step is the LiveCodes
integration below, which is deliberately not started.

---

## 1. Where everything is

| Path | What |
| --- | --- |
| `FINDINGS.md` | the technical record: measurements, ruled-out approaches, traps, the upgrade guide (§2.5), the LiveCodes contract (§6) |
| `packages/ocaml/` | npm package `@live-codes/ocaml` — both implementations, behind separate entry points |
| `docker/Dockerfile` | the toolchain, and the only place a version is named (OCaml 5.5, js_of_ocaml 6.4.1) |
| `docker/build-compiler.sh`, `docker/build.sh` | the two builds; they ask the switch for their paths, so a version bump touches only the Dockerfile |
| `tools/compile-stdout/` | the compiler-libs driver (source → bytecode), with `emit-check.mjs` and `verify-fs.mjs` |
| `tools/emit_probe/` | the original feasibility investigation, kept as small scripts |
| `src/worker.ml` | the interpreter (an OCaml toplevel); `web/` is its standalone demo |
| `Makefile` | `make compiler` / `make worker` / `make serve` wrap the same steps |

`tools/emit_probe/work/` is generated (~50 MB) and untracked; `pipeline.sh` recreates it.

---

## 2. What is left: the LiveCodes integration

This is the only remaining work. It needs `@live-codes/ocaml` published first, because the vendors
path is a CDN.

1. **Publish** `@live-codes/ocaml` — see §4.
2. **Language entry** — `lang-ocaml-wasm-script.ts`: id `ocaml-wasm`, title `OCaml (Wasm)`,
   `editorLanguage: 'ocaml'`, `editor: 'script'`, `largeDownload: true`, and a factory in the
   compiler worker returning the emitted JavaScript. Register it in `languages.ts`, and add the
   script to the IIFE entry points in `scripts/build.js` — the `{{hash:…}}` rewrite means the file
   does not exist otherwise.
3. **`vendors.ts`** — resolve the assets through jsDelivr.
4. **Deprecate the old entry** — change its `title` to `OCaml (ReScript, deprecated)`. There is no
   `deprecated` field. Keep it visible and sorted last: hiding it is indistinguishable from removal
   and strands `l=en` links.
5. **A new starter** — the existing `ocaml-starter.ts` is ReScript-flavoured OCaml importing React
   and will not compile.
6. **New thumbnail, i18n strings** across the locales, a `__tests__` unit spec, a `test.slow()` e2e.
7. **Later, the swap** — `ocaml`'s `compiler: 'rescript'` → `'ocaml-wasm'`, then hand over `ml`/`mli`.
   That hand-over *is* the swap. Do not take `ml`/`mli` earlier: `getLanguageByAlias` resolves ids,
   titles *and* extensions and returns the first match, so two languages claiming `ml` is a real
   ambiguity.

---

## 3. How to verify

| Check | Command | Expect |
| --- | --- | --- |
| Compiler, outside a browser | `node tools/compile-stdout/emit-check.mjs` | `dummy primitives: (none)` and the program prints |
| Stdlib artifact, byte for byte | `node tools/compile-stdout/verify-fs.mjs`, against `sha256sum` in the container (see its header) | no differences |
| Interpreter, outside a browser | `node packages/ocaml/test/node-check.mjs` | seven cases correct |
| Both, in a browser | `npm run serve`, then open `packages/ocaml/test/{compiler,interpreter,interpreter-in-worker}.html` | each reports its cases |
| The published artifact | `npm pack`, install into a fresh project, import all three entry points | they resolve, and the interpreter runs from the copied assets |

The browser pages matter. `emit-check` and `node-check` reproduce the browser's conditions by
construction, but the sync-XHR delivery, the on-demand interface fetching and the worker handshake
only exist in a page — and that is where the two real harness bugs were found.

---

## 4. Publishing

1. **`git push`** — the repository is public, and the work is not pushed.
2. **`npm publish`** from `packages/ocaml` — needs auth for the `@live-codes` scope.
   `publishConfig.access` is `public` already.
3. **`.commandcode/taste/`** is tracked and would go public with the repository. Untrack and ignore,
   or keep. Asked; not yet answered.

---

## 5. Decisions already made — do not relitigate

* **Compile to JS, not an interpreter, for the language.** The user was explicit: OCaml should work
  like TypeScript/ReScript. The interpreter ships too, behind its own entry point, but it is not the
  language's backend.
* **js_of_ocaml, not `wasm_of_ocaml`.** The `-wasm` in the language id is aspirational — `ocaml-js`
  was the alternative, and the id is expensive to change, so it is settled.
* **Do not reimplement the js_of_ocaml driver.** Its orchestration lives in the executable
  (`compiler/bin-js_of_ocaml/compile.ml`), not the library, which is why the compiler is compiled
  with itself. Chasing `Driver.f` flags was a dead end — FINDINGS §5.
* **Do not hand-assemble runtimes.** Three attempts failed for three different reasons (§5).
* **The interpreter keeps on-demand `.cmi` fetching.** A small program should not download
  interfaces it never uses; the compiler's single `build-fs` artifact is the other trade, and both
  are deliberate.
* **The package ships both implementations, with separate assets**, so using one costs nothing for
  the other.

---

## 6. Constraints and rules

* Browser-only. **No servers.**
* The user controls `.gitignore` and wants artifacts committable — do not "restore" it.
* Only commit when asked; commit messages end with
  `Co-authored-by: CommandCodeBot <noreply@commandcode.ai>`.
* Follow the existing comment style: explain *why*, and only where it is not obvious.
* Do not edit `.commandcode/taste/`. Record preferences with the `taste` tool.
* **Do not publish, and do not start the LiveCodes integration, without being asked.**

---

## 7. Traps that cost real time

* **A program that calls Dynlink needs `--dynlink` when it is built**, or js_of_ocaml substitutes a
  raising dummy and mentions it only in a "missing primitives" warning that reads like a footnote.
  That is what made OCaml 5.5 fail at first — FINDINGS §2.5.
* **`build-fs` inlines bytes as escapes**, so the artifact is ~2.6× its files. Fine for one request
  instead of 75; `verify-fs.mjs` is how you check nothing was remapped.
* **`TextDecoder('latin1')` is windows-1252 in browsers** and corrupts bytes above 127. Convert byte
  by byte.
* **`null` and `undefined` are different** across the JS/OCaml boundary; field mismatches hang rather
  than throw.
* **`print-standard-runtime` output is not loadable** (duplicate `class MlNodeDevice`), and
  **`build-runtime` needs `-o`** or a redirect silently yields a 0-byte runtime.
* **Absolute paths do not resolve outside a browser's `fs_fake`** — use relative paths.
* **A container keeps running the image it was created from.** After an image rebuild, use
  `docker run --rm` or recreate it; the `Makefile` does the former.
* **Docker Desktop sometimes dies** — a missing named pipe, or a 500 on `_ping`. Restart it and wait.
* **Stopping the `npm run serve` task can leave the server holding the port.** npm runs the script as
  a child process, and the child outlives the wrapper. Check the port and stop the process that owns
  it rather than assuming the task kill released it, or the next `npm run serve` fails to bind.
* **A worker script has to be same-origin with whatever creates it.** `new Worker()` refuses a
  cross-origin URL, and CORS does not help — it is the script fetch the browser will not make. That is
  why the compiler builds its harness worker from a **data URL**, which carries its own source and so
  has nothing to fetch: it works from a CDN, and unlike `URL.createObjectURL` it is dependable when
  the compiler is itself running inside a worker. Everything the harness then loads is passed as an
  absolute URL — `importScripts` *does* accept cross-origin scripts, which `new Worker` does not.
  LiveCodes meets the same rule and answers it the same way: its sandbox iframe's wasm languages
  create a same-origin worker that then `importScripts` the CDN.
  Verified cross-origin (page on one port, assets on another): the program compiled and ran.
* **The harness worker now reports one stray diagnostic, and it is a regression we introduced.**
  `importScripts` is reported as failing to load `jsoo.js`, in the same-origin case as well as
  cross-origin, while the compile still succeeds and the output runs — so it is non-fatal but it is
  user-visible, and it reached the diagnostics pane only after the worker stopped being created from
  a same-origin URL. It appeared with both the data-URL and the blob-URL forms, which points at the
  worker's script URL being unreadable (`self.location` is a `data:`/`blob:` URL) rather than at the
  fetch. Fix it before wiring diagnostics into LiveCodes, where it would surface as a compile error.
* **Watch for the failure you cannot see.** A filtered build log hid a failed step, and a
  "byte-identical, so it works" claim turned out to describe a script that had aborted. Print exit
  codes, read the tail of the output, and re-run rather than infer.
* **`shell_command` runs `cmd.exe`, not PowerShell**, and PowerShell mangles embedded quotes in
  native args. Prefer a script on stdin (`sh -s`) or a `.sh` file.
* **`for` loops do not survive the PowerShell→docker stdin pipe.** Write flat commands.
* **Read the source before experimenting.** Two files answered in minutes what hours of flag
  toggling did not: `js_of_ocaml-compiler/dynlink/js_of_ocaml_compiler_dynlink.ml`, and
  `bin-js_of_ocaml/dune` — and `compile.ml:206` is where `--dynlink` turned out to live.
