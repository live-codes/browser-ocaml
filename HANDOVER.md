# HANDOVER.md — continuing OCaml-in-LiveCodes

For a fresh session picking this up. Read `FINDINGS.md` alongside this: it has the technical
detail and the evidence; this file is what to *do* and what not to repeat.

---

## 1. State of play in one paragraph

The goal is real OCaml in LiveCodes, browser-only, **compiled to JavaScript** which the result
page runs (like TypeScript/ReScript) — not an interpreter. The feasibility question is **closed
and the hard part is done and verified**: both halves of the official toolchain now run as
JavaScript. `ocamlc` compiled to JS turns source into bytecode; `js_of_ocaml` compiled to JS
turns bytecode into a self-contained runnable JS bundle. What is left is a build-and-integration
project: a browser adapter (virtual filesystem + injected argv), trimming a 49.5 MB stdlib
asset, and the LiveCodes language entry with its starter and tests. Nothing is usable in
LiveCodes yet.

---

## 2. Where everything is

| Path | What |
| --- | --- |
| `FINDINGS.md` | technical findings, evidence, ruled-out approaches, LiveCodes contract |
| `tools/emit_probe/` | the whole investigation as small scripts |
| `tools/emit_probe/pipeline.sh` | **the reference** — builds both compilers and the stdlib |
| `tools/emit_probe/inject_argv.cjs` | demonstrates argv injection (the key unlock for browsers) |
| `tools/emit_probe/jsoo_in_js.sh` | builds `js_of_ocaml` as bytecode → JS, incl. the findlib opt-out |
| `tools/emit_probe/ocamlc_in_js.sh` | compiles `ocamlc.byte` to JS |
| `tools/emit_probe/run.sh`, `target_env.sh`, `emit_probe.ml`, `dune` | earlier probes; `emit_probe.ml` proves bytecode→JS works from *inside* a js_of_ocaml program |
| `src/worker.ml` | the **superseded** interpreter (works in node; wrong model for LiveCodes) |
| `packages/ocaml/` | npm package `@live-codes/ocaml` (interpreter-shaped; README stale) |
| `docker/build.sh` | builds the interpreter and stages package assets |
| `D:\DevWork\live-codes\livecodes` | LiveCodes, read-only reference |

`tools/emit_probe/work/` is generated and gitignored-in-spirit — it holds ~50 MB of copies.
It is removed after each run; `pipeline.sh` recreates everything.

---

## 3. What to do next, in order

### Step 1 — Reproduce the verified pipeline

Do this first. It confirms the environment before anything is built on it.

```powershell
docker start ocaml-toolchain
docker exec ocaml-toolchain sh /home/opam/src/tools/emit_probe/pipeline.sh
cd D:\DevWork\live-codes\browser-ocaml\tools\emit_probe\work
$env:OCAMLLIB = "stdlib-ocaml"
node ocamlc.js t.ml -o t.byte     # expect t.byte ≈ 22,273 bytes
node jsoo.js  t.byte -o out.js    # expect out.js = 28,554 bytes
node out.js                       # expect: probe ok
```

If that prints `probe ok`, the toolchain works and you can move on.

### Step 2 — Browser adapter: prove `fs_fake`

Node uses `fs_node.js`; a browser uses `fs_fake.js`. Build the compilers with
`--target-env=browser` and drive them with **no real files at all**:

```js
globalThis.process = { argv: ['js_of_ocaml', 'main.byte', '-o', 'out.js'] };
globalThis.jsoo_fs_tmp = [
  { name: 'main.byte', content: bytecodeBytes },
  // the stdlib files, from build-fs or from disk
];
require('./jsoo-browser.js');
```

* `globalThis.process.argv` gives the compiler its arguments (§3.1 of FINDINGS).
* `globalThis.jsoo_fs_tmp` queues files, which the program drains at `caml_fs_init` (§3.2).
* Registration needs the **fake** device — `MlNodeDevice` has no `register`, so
  `caml_create_file` raises `cannot register file` — hence `--target-env=browser`.
* **Registration is emitted by default — confirmed.** `globalThis.jsoo_fs_tmp`, `caml_fs_init`
  and `globalThis.jsoo_env` are all present in a default build. (An earlier note here said the
  machinery was missing; that was a **bad grep** — the global is reached through a minified
  alias, so search for `jsoo_fs_tmp`, not `globalThis.jsoo_*`.)
* **Output is solved on both halves.** js_of_ocaml writes to stdout with `-o -` (**verified**,
  and *not* the same as omitting `-o`, which prints nothing). The intermediate bytecode comes out
  of `tools/compile-stdout/` — our own compiler-libs driver — as **hex** on stdout, so no
  read-back and no patch. The full loop is verified end to end; see FINDINGS §3.2.
* **The driver also runs as JavaScript — verified.** `process.argv` + `jsoo_env` drive it, and
  its bytecode goes through `jsoo.js -o -` to JavaScript that runs. The whole source→JS pipeline
  is JavaScript end to end. FINDINGS §3.2 has the two gotchas (absolute paths for `Bytelink`;
  the argv convention) — read them before debugging anything here.
* **`fs_fake` is verified.** The driver rebuilt for the browser target, with all 72 files
  registered and nothing on disk, produces bytecode that goes through `jsoo.js -o -` to
  JavaScript that runs. See FINDINGS §3.2.
* **Remaining on the OCaml side:** fold the two programs into one entry point returning
  `{ js, diagnostics }`, and load it from an actual browser page. The stdlib is measured
  (Step 3); shipping it is the `build-fs` question.
* Then confirm in a real browser page.

### Step 3 — Trim and ship the stdlib

**Measured: 71 files / 1.8 MB**, down from 438 files / 49.5 MB. The set is exactly every `*.cmi`,
plus `stdlib.cma`, `std_exit.cmo` and `runtime-launch-info`.
`tools/compile-stdout/minimal.sh` builds it and verifies the pipeline still works against it.

What remains is only *how to ship it*: `js_of_ocaml build-fs -I DIR -o FILE [FILES]…` builds the
filesystem as its own artifact, rather than registering 71 files by hand at runtime. `--file` and
`--ofs` are the related options.

### Step 4 — One entry point: source → JS

Wrap both compilers behind a single call taking and returning in-memory data:

```
compile(source) -> { js, diagnostics }
```

Remember each compiler is a **one-shot program** (runs on load, exits), so the likely shape is
a worker per compile, created and terminated. See §3.3 of FINDINGS.

### Step 5 — LiveCodes language entry

Full contract in §6 of FINDINGS. Summary: language id **`ocaml-wasm`**, `editorLanguage:
'ocaml'`, `largeDownload: true`, a `factory` in the compiler worker returning the emitted JS, a
`vendors.ts` entry (**requires publishing `@live-codes/ocaml` to npm, and so a `license`**), the
script added to `scripts/build.js`'s IIFE entry points, a **new starter** (the existing
`ocaml-starter.ts` is ReScript-flavoured OCaml importing React and will not compile), i18n
strings, and a `test.slow()` e2e.

### Step 6 — Deprecate, then swap

Give `ocaml-wasm` a qualified extension; leave `ml`/`mli` with the old entry for now. Deprecate
by changing the old entry's `title` (no new API needed). The eventual swap is **one line**:
`ocaml`'s `compiler: 'rescript'` → `compiler: 'ocaml-wasm'`, then hand over `ml`/`mli`.

---

## 4. Decisions already made — do not relitigate

* **Compile to JS, not an interpreter.** The user was explicit: OCaml should work like
  TypeScript/ReScript — compile to JS, executed in the result page.
* **JS backend, not `wasm_of_ocaml`.** The user chose js_of_ocaml.
* **Do not reimplement the js_of_ocaml driver.** The runtime is composed by the CLI's
  orchestration, which lives in the *executable* (`compiler/bin-js_of_ocaml/compile.ml`), not
  the library. Compiling the compiler itself to JS brings that orchestration along for free.
  Chasing `Driver.f` flags was a dead end — see FINDINGS §5.
* **Do not hand-assemble runtimes.** Three attempts failed for three different reasons
  (FINDINGS §5). The compiler-as-JS emits complete bundles; use it.
* **Add the language, do not replace it yet.** Deprecate the ReScript-backed `ocaml` first.

---

## 5. Constraints and rules

* Browser-only. **No servers.**
* The user controls `.gitignore` and wants artifacts committable — do not "restore" it.
* Only commit when asked; commit messages end with
  `Co-authored-by: CommandCodeBot <noreply@commandcode.ai>`.
* Follow the existing code's comment style: explain *why*, and only where it is not obvious.
* Do not edit `.commandcode/taste/`. Record preferences with the `taste` tool.

---

## 6. How to verify

| Check | Command | Expect |
| --- | --- | --- |
| Toolchain end to end | `pipeline.sh` then the three node commands (§3 Step 1) | `probe ok` |
| argv injection | `node inject_argv.cjs` | `work/out.js` = 28,554 bytes, runs |
| Interpreter (superseded) | `node packages/ocaml/test/node-check.mjs` | all cases correct |
| Emitted bundle is self-contained | `node out.js` from a clean directory | prints the program's output |

Note: `node-check.mjs`'s `badAssets` case is a **false test** — the environment caches loaded
interfaces so a missing asset is never exercised. Do not treat it as evidence.

---

## 7. Traps that cost real time

* **`print-standard-runtime` output is not loadable** — duplicate `class MlNodeDevice`. Do not
  use it as a runtime asset.
* **`build-runtime` needs `-o`**; a shell redirect silently yields a 0-byte runtime, which
  surfaces much later as a misleading `caml_fs_init is not defined`.
* **Absolute paths do not resolve** outside a browser — `Sys_error("no device found for …")`.
  Use relative paths and a relative `OCAMLLIB`.
* **js_of_ocaml's node filesystem writes strings as UTF-8**, so staging binary data through it
  corrupts bytes above 127.
* **`null` and `undefined` are different** across the JS/OCaml boundary;
  `Js.Optdef.to_option` treats only `undefined` as absent.
* **Field mismatches across that boundary hang** rather than throw.
* **PowerShell mangles embedded double quotes** in native args — use `docker exec -w DIR …`
  rather than nested `sh -c`, or put the commands in a `.sh` file (as the probe scripts do).
* **Docker Desktop sometimes dies** (missing named pipe). Restart:
  `Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"`, wait ~45 s.
* **`Remove-Item` may fail on a just-used directory** — retry after a few seconds.
* **Read the source before experimenting.** Two files answered in minutes what hours of flag
  toggling did not: `js_of_ocaml-compiler/dynlink/js_of_ocaml_compiler_dynlink.ml` (the working
  in-program recipe) and `bin-js_of_ocaml/dune` (it already links `runtime-files`).
* **Docker lifecycle:** stop the container when done, and remove
  `tools/emit_probe/work/` — it is ~50 MB.

---

## 8. Questions for the user

1. **First ship:** compile-to-JS only, or the working interpreter as an interim? The
   interpreter is verified and could replace the misleading `ocaml` entry quickly, but it has
   no Compiled Code pane, no DOM interop and reports through the console.
2. **Package license** — required before publishing `@live-codes/ocaml` to npm, which the
   LiveCodes CDN path needs. Currently unset on purpose.
3. **Language id** — `ocaml-wasm` (convention, matches other second implementations, but the
   build is js_of_ocaml not wasm) versus `ocaml-js` (accurate now, rename later if the project
   ever moves to `wasm_of_ocaml`).
4. **Stdlib size ceiling** — how much first-download is acceptable in LiveCodes, since it
   drives how hard Step 3 needs to work.

---

## 9. Suggested first message to the user

> I've read FINDINGS.md and HANDOVER.md. The toolchain runs entirely as JavaScript and that's
> verified; what remains is the browser adapter, trimming the stdlib asset, and the LiveCodes
> entry. Shall I start with the browser adapter — proving the virtual filesystem in an actual
> browser — since that's the last unverified mechanism?
