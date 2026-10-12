# FINDINGS.md — OCaml in LiveCodes

Technical findings from building a server-free, browser-only OCaml toolchain for LiveCodes.

Everything below is marked **verified** or **unverified**. Do not treat unverified items as
fact; several are the exact things that cost time when assumed.

---

## 0. Goal and constraints

* Real OCaml (not a dialect) running in LiveCodes, in the browser, **with no servers**.
* LiveCodes model: **compile to JavaScript**, which the result page then executes — the way
  TypeScript, CoffeeScript and ReScript work. *Not* the wasm-language model (a script in the
  result iframe that executes the program itself, reporting only through `console`).
* Add alongside the existing `ocaml` language (currently ReScript-backed), deprecate that,
  then swap. The existing entry advertises OCaml but runs ReScript — a different language.
* Playground experience should approximate local `dune` development.
* Artifacts should be committable (the user controls `.gitignore`).

Repos involved:

| Path | Role |
| --- | --- |
| `D:\DevWork\live-codes\browser-ocaml` | this repo — the toolchain and the npm package |
| `D:\DevWork\live-codes\livecodes` | LiveCodes itself — read-only reference |
| `D:\DevWork\live-codes\clang-wasm\packages\clang-wasm` | package shape mirrored |

`browser-ocaml` is a git repository (branch `main`).

---

## 1. Status at a glance

### Works, verified

| Thing | How verified |
| --- | --- |
| OCaml source → bytecode, **as JavaScript** (`ocamlc.js`) | ran under node, produced `t.byte` |
| bytecode → JavaScript, **as JavaScript** (`jsoo.js`) | ran under node, produced runnable `out.js` |
| The emitted JS runs and is correct | `node out.js` → `probe ok`; and `sum=30 squares=0,1,4,9,16` for a program using `List`/`Printf`/`String` |
| argv can be injected from JS with no patch | injected `process.argv`, compiler produced a correct 28,554-byte bundle |
| The interpreter works in node | `packages/ocaml/test/node-check.mjs`: plain, stdin, argv, files, library, compileError, warning all correct |
| js_of_ocaml can be compiled to JS and emit complete bundles | 5,228,872-byte `jsoo.js`; output identical in size to the native CLI's |

### Does not work / not done

| Thing | State |
| --- | --- |
| The virtual filesystem **in a browser** | unverified. Node uses the real FS; the browser uses `fs_fake.js` |
| Stdlib asset size | **49.5 MB** as copied — unusable, needs trimming to a measured minimum |
| LiveCodes language entry | not started |
| Starter template for real OCaml | not started (the existing one is ReScript-flavoured OCaml importing React — it will not compile) |
| Browser verification of the interpreter | never achieved; the browser harness was unreliable (tab reverted to `about:blank`) |
| Automated tests for the runtime | none; the test pages are manual |
| Package license | decided: LGPL-2.1-or-later WITH OCaml-LGPL-linking-exception |

---

## 2. The chosen architecture: compile to JavaScript

### 2.1 The idea

Do not reimplement the js_of_ocaml driver. **Compile the official compilers to JavaScript and
run them.** Both halves are OCaml programs, and js_of_ocaml compiles OCaml programs to JS.

```
OCaml source ──(ocamlc.js)──> bytecode ──(jsoo.js)──> JavaScript ──> LiveCodes result page
```

This is the same architecture as the ReScript integration, which is an OCaml-derived compiler
compiled with js_of_ocaml.

### 2.2 Verified pipeline and evidence

```sh
node ocamlc.js t.ml -o t.byte     # t.byte: 22,273 bytes
node jsoo.js  t.byte -o out.js    # out.js: 28,554 bytes
node out.js                       # probe ok
```

Richer program (`List.init`, `List.fold_left`, `String.concat`, `Printf.printf`,
`string_of_int`):

```sh
# -> sum=30 squares=0,1,4,9,16
```

`out.js` from `jsoo.js` is the **same size (28,554 bytes)** as the native `js_of_ocaml`
command line's output for the same input; an earlier probe emitted **byte-identical** output
(SHA-256 `2DAED810A755945075C1A376BFF550CD30536AE26A4D9CC9632C45D9F5190580`) natively and
from inside a js_of_ocaml program.

### 2.3 Measured sizes

| Artifact | Size |
| --- | --- |
| `ocamlc.js` — source → bytecode | 2,001,360 B (1.9 MB) |
| `jsoo.js` — bytecode → JS | 5,228,872 B (5.0 MB) |
| emitted JS, trivial program | 28,554 B |
| emitted JS, richer program | ~70.5 KB |
| bytecode intermediate | 22 KB (trivial) / 179 KB (richer) |
| stdlib as copied | **49.5 MB (438 files)** — needs trimming |

### 2.4 How to build

All OCaml-side work happens in the Docker container `ocaml-toolchain` (opam switch `5.5`,
OCaml 5.5.1, js_of_ocaml 6.4.1 — see §2.5 for how those are declared). The repo is mounted at
`/home/opam/src`. **There is no node
inside the container** — run the JS on the host.

`tools/emit_probe/pipeline.sh` does all of the below and is the reference.

**a. `jsoo.js` — the bytecode→JS compiler**

```sh
src=/home/opam/.opam/5.2/.opam-switch/sources/js_of_ocaml-compiler.6.4.1

# dune wants a git repo for version detection.
# `fatal: bad revision 'HEAD'` is harmless.
[ -d "$src/.git" ] || (cd "$src" && git init -q)

# Opt out of findlib. Without this the compiled compiler dies at startup with
#   Sys_error("no device found for <lib>/findlib.conf/")
# because findlib reads an absolute config path. findlib only serves -I and
# package lookup, which a self-contained program does not need. The dune file
# already has the opt-out: drop the library mapping and its default applies.
sed -i '/findlib-support -> findlib_support.empty.ml/d' \
  "$src/compiler/bin-js_of_ocaml/dune"

cd "$src"
opam exec -- dune build compiler/bin-js_of_ocaml/js_of_ocaml.bc
opam exec -- js_of_ocaml _build/default/compiler/bin-js_of_ocaml/js_of_ocaml.bc \
  -o /home/opam/src/tools/emit_probe/work/jsoo.js
```

**b. `ocamlc.js` — the source→bytecode compiler**

`ocamlc.byte` is the switch's own bytecode compiler, so nothing has to be built first:

```sh
opam exec -- js_of_ocaml /home/opam/.opam/5.2/bin/ocamlc.byte \
  -o /home/opam/src/tools/emit_probe/work/ocamlc.js
```

**c. The stdlib**

`ocamlc` needs the standard library reachable. It resolves `OCAMLLIB`, and the path **must be
relative** (see §3.2), so copy it into the working directory and point `OCAMLLIB` there:

```sh
ocamllib=/home/opam/.opam/5.2/lib/ocaml
mkdir -p stdlib-ocaml
for f in "$ocamllib"/*; do [ -f "$f" ] && cp "$f" stdlib-ocaml/; done
```

Copying only `*.cmi`/`*.cma` is **not enough** — the linker also wants `std_exit.cmo` and
`runtime-launch-info`, and fails with `Cannot find file "std_exit.cmo"` and then
`Cannot find file "runtime-launch-info"`. Copying every top-level file works but is 49.5 MB.

**d. Running it (host, node)**

```powershell
cd tools\emit_probe\work
$env:OCAMLLIB = "stdlib-ocaml"
node ocamlc.js t.ml -o t.byte
node jsoo.js  t.byte -o out.js
node out.js
```

### 2.5 How to upgrade

Two versions decide everything, and both are declared in `docker/Dockerfile` and nowhere else:

```dockerfile
ARG OCAML_VERSION=5.5
FROM ocaml/opam:debian-12-ocaml-${OCAML_VERSION}
ARG JS_OF_OCAML_VERSION=6.4.1
```

The build scripts derive the rest from the switch — `opam var ocaml:lib` for the standard library,
`opam var prefix` plus the installed version for the js_of_ocaml sources — so an upgrade is those
two lines, a rebuild and the checks below. Nothing else in the tree names a version.

| Move | Do | Watch |
| --- | --- | --- |
| OCaml, e.g. `5.2` → `5.5` | `docker build --build-arg OCAML_VERSION=5.5 -t ocaml-toolchain docker` | the driver links compiler-libs internals, so it breaks first |
| js_of_ocaml, e.g. `6.4.1` → next | `docker build --build-arg JS_OF_OCAML_VERSION=x.y.z -t ocaml-toolchain docker` | the findlib opt-out, and `--effects=cps` |

The build args exist so a candidate can be tried without touching the tree; editing the defaults in
the Dockerfile is the same thing when it works out.

**Compatibility is not ours to decide, and the constraint is not the whole story.**

`js_of_ocaml-compiler` declares `ocaml {>= "4.13" & < "5.6"}`, so 5.5 is nominally inside it:

```sh
opam show js_of_ocaml-compiler.<version> --field=depends | grep ocaml
```

**5.5 needed a fix on our side, and now works.**

The first attempt built everything — the image, `jsoo.js`, the driver against 5.5's compiler-libs, a
byte-exact 75-file `build-fs` artifact — and then the driver died at startup:

```
[ 0, [ 248, 'Failure', -3 ], 'caml_dynlink_parse_ld_conf not implemented' ]
```

That is not an upstream gap. `runtime/js/dynlink.js` provides the primitive, and the chunk is
byte-identical whether js_of_ocaml 6.4.1 was built on 5.2 or on 5.5 — 2924 bytes, same `//Provides:`
list, checked on both. The driver's build simply never *linked* that chunk, so js_of_ocaml
substituted a raising dummy and mentioned it only in a missing-primitives warning that reads like a
footnote:

```
Missing primitives provided by +dynlink.js:
  caml_dynlink_close_lib
  caml_dynlink_lookup_symbol
  caml_dynlink_open_lib
  caml_dynlink_parse_ld_conf     <- listed only from 5.5 on
```

5.2 named three of those and called none of them — its `dynlink` sources do not mention
`parse_ld_conf` at all — which is why it went unnoticed. 5.5's `Dynlink` does call it.

**The fix is one flag.** js_of_ocaml adds `+dynlink.js` itself:

```ocaml
(* compiler/bin-js_of_ocaml/compile.ml *)
if (not no_runtime) && (toplevel || dynlink) then ... add_if_absent "+dynlink.js"
```

so the driver is now built with `--dynlink`, and the warning disappears. Verified on 5.5:
`emit-check` reports no dummy primitives and the program prints all three lines, `verify-fs` matches
the switch byte for byte across 75 files, and the interpreter passes all seven node cases including
Dynlink. It was worth doing regardless of version: on 5.2 those dummies were latent, harmless only
because nothing called them.

**What 5.5 changes for us.** The stdlib grows to 75 files / 5.94 MB (from 71 / 4.86 MB), so
`stdlib.js` is 5.67 MB and the driver 2.6 MB — `--dynlink` implies `linkall`. Compiler assets are
~14 MB, the interpreter's 4.6 MB. Diagnostics also reword: 5.2 said `This expression has type
"string" but an expression was expected of type "int"`, 5.5 says `This constant has type string but
an expression was expected of type int`. Nothing should assert that text.

**Rebuild, then verify.** Note that a container keeps running the image it was created from, so after
rebuilding use `docker run --rm` (as below, and as `make compiler` / `make worker` do) or recreate
the container.

```sh
docker build -t ocaml-toolchain docker
docker run --rm -v "$PWD:/home/opam/src" -w /home/opam/src ocaml-toolchain sh docker/build-compiler.sh
docker run --rm -v "$PWD:/home/opam/src" -w /home/opam/src ocaml-toolchain sh docker/build.sh
```

**Five checks, every time.** The first three are the ones that caught real bugs:

```sh
node tools/compile-stdout/emit-check.mjs     # no "dummy primitives", and the program prints
node packages/ocaml/test/node-check.mjs      # interpreter: 7 cases, in node
node tools/compile-stdout/verify-fs.mjs      # stdlib artifact is byte-exact (see its header)
npm run serve                                # then, in a browser:
#   packages/ocaml/test/compiler.html         the compiler, end to end
#   packages/ocaml/test/interpreter.html
#   packages/ocaml/test/interpreter-in-worker.html
```

If the versions did not change, the artifacts should come out byte-identical — `git status --short
packages/ocaml/assets` empty is how you know the derivation still points where the hard-coded paths
did. After an actual version bump they will differ; what matters is the checks.

**What breaks, in the order it breaks**

1. **The driver** (`tools/compile-stdout/compile_stdout.ml`) — the most fragile piece, and it is ours.
   It links compiler-libs internals: `Compile.implementation`, `Bytelink.link`, `Errors.report_error`,
   `Load_path.init`, `Warnings.parse_options`, `Config.standard_library`. Signatures move between
   releases, and a build failure here names the function.
2. **The interpreter** (`src/worker.ml`) — `JsooTop`, `Sys_js.*`, the `#warnings "+a"` prelude, and
   whether `--effects=cps` is still the right effects backend.
3. **The findlib opt-out** — the guard in `build-compiler.sh` greps for an exact line in upstream's
   `bin-js_of_ocaml/dune` and stops with `ERROR: … has changed shape` if it has gone. That is
   deliberate: the opt-out then has to be found again by reading that dune file.
4. **`build-fs`** — we rely on its output registering through `jsoo_create_file` / `jsoo_fs_tmp`, and
   on `of_bytestring` keeping `.cmi` contents byte-exact. `verify-fs.mjs` is the check for that half.

Nothing else is version-sensitive: `export.txt` and the interpreter's stdlib are regenerated by
`jsoo_listunits` and `gen_stdlib.sh` on every build.
| **LiveCodes** | the integration is a normal language addition; see §6. |

---

## 3. The browser adapter

Both compilers are ordinary command-line programs: they take **paths** and use `Sys.argv`.
A browser has neither. Two mechanisms solve this, both verified in node.

### 3.1 argv is injectable, with no patch — **verified**

`runtime/js/sys.js` in js_of_ocaml initialises argv like this:

```js
//Provides: caml_argv
var caml_argv = (function () {
  ...
  if (process?.argv?.length > 1) { var argv = process.argv; main = argv[1]; args = argv.slice(2); }
  ...
})();
```

It reads `process?.argv`. Where there is no real `process` — a browser — a **fake one is
enough**:

```js
globalThis.process = { argv: ['js_of_ocaml', 't.byte', '-o', 'out.js'] };
// then load the compiler
```

Verified by `tools/emit_probe/inject_argv.cjs`, which sets `process.argv` then `require`s the
compiler: it produced a correct 28,554-byte bundle which ran and printed `probe ok`.

Note `process.argv[1]` is the *program name* — it appears in error messages
(`js_of_ocaml: Error: ...`), which is how the injection was confirmed.

### 3.2 The virtual filesystem

`Sys_js` (OCaml side) provides:

| Function | Use |
| --- | --- |
| `create_file ~name ~content` | register a file so `open_in name` finds it |
| `update_file ~name ~content` | update a registered file |
| `read_file ~name` | read a file back out |
| `mount ~path f` | **supply missing files on demand** — the callback receives `(prefix, suffix)` |
| `set_channel_flusher` | capture output from a channel |
| `set_channel_filler` | provide input to a channel (stdin) |

**There is no `set_argv`** — use §3.1.

**Path resolution, which caused real bugs:** js_of_ocaml's **node** filesystem resolves
*relative* paths against the cwd and real filesystem, but an **absolute** path such as
`/home/...` fails with `Sys_error("no device found for ...")` because nothing is mounted at
`/`. That is why `OCAMLLIB` must be relative. In a **browser** the device is `fs_fake.js`,
which is where files registered by `Sys_js` live.

**The compiler allows external file registration by default.** `js_of_ocaml --help` lists,
under `OPTIONS (FILESYSTEM)`:

| Option | Meaning |
| --- | --- |
| `--extern-fs` **(default)** | "Configure pseudo-filesystem to allow registering files from outside." |
| `--no-extern-fs` | forbid it |
| `--file=FILE` | register a file into the pseudo filesystem at compile time |
| `-I DIR` | add an include directory |
| `--ofs=FILE` | output the filesystem to a file |
| `build-fs [-I DIR] -o FILE [FILES]…` | **build a filesystem as its own artifact** |

Two consequences. First, the compiler-as-JS built here used defaults, so **external
registration is allowed**. Second, `build-fs` builds the filesystem once as a separate
artifact, which is how the stdlib is now shipped: one file instead of 71 registered by hand.

**How outside registration actually works — and why it is enough.** A program runs its `main`
on load, so a page cannot register a file *after* loading it. js_of_ocaml solves this with a
pending queue (`runtime/js/fs.js`):

```js
//Provides: jsoo_create_file_extern
function jsoo_create_file_extern(name, content) {
  if (globalThis.jsoo_create_file) globalThis.jsoo_create_file(name, content);
  else { if (!globalThis.jsoo_fs_tmp) globalThis.jsoo_fs_tmp = [];
         globalThis.jsoo_fs_tmp.push({ name, content }); }
}

//Provides: caml_fs_init
function caml_fs_init() {
  var tmp = globalThis.jsoo_fs_tmp;
  if (tmp) { for (var i = 0; i < tmp.length; i++) jsoo_create_file(tmp[i].name, tmp[i].content); }
  globalThis.jsoo_create_file = jsoo_create_file;
  globalThis.jsoo_fs_tmp = [];
  return 0;
}
```

So the page **queues files on `globalThis.jsoo_fs_tmp` before loading the compiler**, and the
program drains the queue when it initialises its filesystem:

```js
globalThis.process = { argv: ['js_of_ocaml', 'main.byte', '-o', 'out.js'] };
globalThis.jsoo_fs_tmp = [{ name: 'main.byte', content: bytecodeBytes } /* + stdlib files */];
// now load the compiler
```

Registration needs a device with a `register` method. `MlFakeDevice` (browser) has one;
`MlNodeDevice` does not — `caml_create_file` fails with `cannot register file` on the node
filesystem. So **this path requires `--target-env=browser`**, or any build that mounts the fake
device. Note that this is also why a tiny `MlFakeDevice` is mounted by `fs.js` itself
(`jsoo_mount_point.push({ path: name, device: new MlFakeDevice(name, f) })`).

**Output: `-o -` writes to stdout — solved for js_of_ocaml.** `cmd_arg.ml:342` maps the value
`"-"` to `` `Stdout``, and `compile.ml:272` handles that path. Verified:

```sh
node jsoo.js t.byte -o - > out.js     # out.js: 28,554 bytes, byte-identical, runs
```

An earlier conclusion in this file said stdout was not available. That was drawn from running
**without `-o` at all**, which prints nothing and is a different thing. Corrected.

**ocamlc has no stdout option.** `node ocamlc.js t.ml -o -` writes **nothing to stdout**; it
creates a file literally named `-` instead (22,273 bytes for the sample program — the bytecode).
Unlike js_of_ocaml, `-` is not special to ocamlc, so the source→bytecode half must write a real
file. That file then lives in the compiler's filesystem, and there is no JS-side read hook (no
`jsoo_read_file`). So exactly one read-back remains — of the *intermediate bytecode*, not of the
final JavaScript.

**That read-back is now closed.** `tools/compile-stdout/` is a small driver that links
compiler-libs and does the whole job in one process — `Compile` and `Bytelink` are the same
front end and linker that ocamlc uses:

```ocaml
Load_path.init ~auto_include:Load_path.no_auto_include ~visible:[ Config.standard_library ] ~hidden:[];
Compile.implementation ~start_from:Clflags.Compiler_pass.Parsing ~source_file ~output_prefix;
Bytelink.link [ Filename.concat Config.standard_library "stdlib.cma"; cmo ] byte;
print_string (hex_of_string (read_file byte))
```

Verified end to end:

```
driver                              -> hex on stdout   44,650 chars = 2 x 22,325
decoded                                    out.byte = 22,325 bytes   (identical to ocamlc's ref.byte)
node jsoo.js out.byte -o -                 out.js   = 28,562 bytes
node out.js                                "stdout route ok"
```

Three details that matter:

* **The bytecode is emitted as hex, not raw bytes.** js_of_ocaml's stdout goes through Node's
  UTF-8 writer, so any byte above 127 would be re-encoded and corrupted — the same trap that
  corrupted `.cmi` files. Hex is ASCII and survives.
* **The file round-trip happens inside OCaml**, where reads do work: the driver writes `.cmo`
  and `.byte` into its own filesystem and reads them back itself. Only the *source* has to come
  from outside, via `jsoo_fs_tmp`.
* `ocamlc`'s `Main.main` is linkable (`main.cmo`/`optmain.cmo` are in compiler-libs), but it
  calls `exit`, so driving `Compile`/`Bytelink` directly is the right level.

The alternatives were not needed: sharing one filesystem, reading the fake device
(`MlFakeDevice.register` stores into `this.content[name]`, but the device is not exposed), or
patching ocamlc.

**And the driver runs as JavaScript.** Built with js_of_ocaml and driven the way a browser would
drive it — argv through `process.argv`, the stdlib located through `jsoo_env`:

```js
process.argv = ['node', 'compile_stdout', 'main.ml'];
globalThis.jsoo_env = { OCAMLLIB: 'stdlib-ocaml' };
require('./compile_stdout.js');
```

```
the JS driver                 -> 44,566 hex chars -> 22,283 bytes of bytecode
node jsoo.js js.byte -o -     -> 28,559 bytes of JavaScript
node that                     -> "js driver ok"
```

The whole source→JavaScript pipeline now runs in JavaScript. Three gotchas found getting there:

* **`Bytelink.link` resolves its arguments through `Load_path`**, and a bare `main.cmo` was not
  found there even with `.` on the path. It has to be given an **absolute** path
  (`Filename.concat (Sys.getcwd ()) cmo`). Before that fix it failed on a clean directory but
  silently linked a *stale* `main.cmo`/`main.byte` from a dirty one — which is exactly why
  results looked flaky and inconsistent between runs. Compare *behaviour*, not bytes: the native
  and JS outputs differ by ~39 bytes of embedded build info.
* **The argv convention is `Sys.argv.(0)` = `process.argv[1]`, `Sys.argv.(1)` =
  `process.argv[2]`** (`sys.js` builds `[0, argv[1], ...argv.slice(2)]`). Passing
  `['prog', 'main.ml']` leaves `Sys.argv` with nothing past index 0.
* **The stdlib subset the linker needs** so far is `*.cmi`, `*.cma`, `*.cmo` (for
  `std_exit.cmo`) and **`runtime-launch-info`** — the same two non-obvious entries `ocamlc`
  wanted.

**The stdlib asset: 49.5 MB → 1.8 MB, measured.** Copying every top-level file in `lib/ocaml` is
438 files / 51,873,187 bytes. What the compiler and linker actually need is **71 files /
1,838,202 bytes**: every `*.cmi`, plus `stdlib.cma`, `std_exit.cmo` and `runtime-launch-info`.
`tools/compile-stdout/minimal.sh` builds that set and verifies the pipeline against it — compile
and link unchanged (`exit 0`, 44,654 hex chars, `main.byte` 22,327 bytes).

Sizes for planning, first load: driver ~2.6 MB + `jsoo.js` 5.02 MB + `stdlib.js` 5.67 MB + runtime
chunks 0.8 MB ≈ **14 MB**, cached after that. The standard library ships as 5.67 MB rather than the
1.8 MB measured above — 5.94 MB of files before escaping — because `build-fs` inlines a byte above 127
as a four-character escape, and it is worth it to turn 75 requests per compile into one. LiveCodes'
ruby-wasm and python-wasm are larger, so this is still in range.

**Confirmed: the machinery IS emitted in a default build.** An earlier version of this file
claimed otherwise. That was a **bad grep** — the generated code reaches the global object through
a minified alias, so searching for `globalThis.jsoo_*` finds nothing. Search for the property
name `jsoo_fs_tmp` instead. What a default `ocamlc.byte` build actually contains (minified):

```js
function buF() {                          // caml_fs_init
  var b = aV.jsoo_fs_tmp;                 // aV is the global object
  if (b) for (var a = 0; a < b.length; a++) auT(b[a].name, b[a].content);
  aV.jsoo_create_file = auT; aV.jsoo_fs_tmp = []; return 0
}
function but(a, b) {                      // caml_create_file
  var c = ny(a);
  if (!c.device.register) bc("cannot register file");
  c.device.register(c.rest, b); return 0
}
```

`compile.ml` hard-codes the choice per input kind: `~standalone:true` for the
bytecode-executable path (line 447) and `~standalone:false` for the `.cmo`/`.cma` partial paths
(487, 521, 559, 609). So `init_pseudo_fs = fs_external && standalone` is true for a `.byte`
input — our case. There is **no** `--standalone` flag; it is not a CLI option at all.

**Also exposed: `globalThis.jsoo_env`.** `sys.js` reads it for the environment:

```js
if (globalThis.jsoo_env && typeof globalThis.jsoo_env[n] === "string") return globalThis.jsoo_env[n];
```

So the page can supply `OCAMLLIB` and anything else the compiler reads from the environment,
without argv plumbing.

**The adapter's mechanisms, and their status:**

| Need | Mechanism | Status |
| --- | --- | --- |
| argv | `globalThis.process.argv` | **verified** |
| files in | `globalThis.jsoo_fs_tmp` | **confirmed emitted**, no patch |
| environment | `globalThis.jsoo_env` | present in a default build |
| output, js_of_ocaml | `-o -` → stdout | **verified**, 28,554 bytes, runs |
| output, ocamlc | — | **the remaining gap** |

**There is no reader.** The only jsoo globals a program exposes are `jsoo_create_file`,
`jsoo_env` and `jsoo_fs_tmp` — all write-side. That is precisely what leaves the bytecode
read-back open, and why the three options above are the whole list.

**Verified: the browser (`fs_fake`) path works.** Node normally exercises `fs_node.js`, but the
driver was rebuilt with `--target-env=browser` — which selects `fs_fake` — and driven with every
file registered and nothing on disk:

```js
globalThis.jsoo_fs_tmp = [ { name: 'main.ml', content }, /* ...the 75 stdlib files */ ];
globalThis.jsoo_env = { OCAMLLIB: 'stdlib-min' };
process.argv = ['node', 'compile_stdout', 'main.ml'];
```

```
the driver on fs_fake       -> 44,563 hex chars -> 22,281 bytes of bytecode
node jsoo.js that.byte -o - -> 28,557 bytes of JavaScript
node that                   -> "fake fs ok"
```

So the entire source→JavaScript pipeline runs with **no filesystem at all** — the browser
configuration, including the driver's internal round-trip of writing `.cmo`/`.byte` into the
virtual filesystem and reading them back. What remains untested is only loading it from an actual
browser page; the device, the registration queue, the environment and argv are all exercised.

**The entry point: `compile(source) -> { js, diagnostics }`.** `tools/compile-stdout/compile.mjs`
composes the two programs behind a single call. Verified with `test-entry.mjs`:

```
plain         -> js 28,561 bytes, diagnostics 0
                 runs and prints: "entry point ok"
compileError  -> compilation failed (exit 2), diagnostics
                   [ 'File "main.ml", line 1, characters 14-20:',
                     '1 | let x : int = "nope"',
                     '                  ^^^^^^',
                     'Error: This expression has type "string" but an expression',
                     '       was expected of type "int"' ]
```

Two things this settled, both of which would otherwise have reached a user as an opaque failure:

* **The compiler does not report its own errors — the caller must.** A type error arrived as
  `Typecore.Error(_, _, _)` and nothing else until `Errors.report_error Format.err_formatter exn`
  was called. That is the generic reporter for every compiler exception, and it prints the
  message with location, source excerpt and caret. Wrapping `Compile` and calling it is the whole
  fix.
* **`Format` buffers, so flush before exiting.** Without
  `Format.pp_print_flush Format.err_formatter ()` (and the std formatter, and `stdout`/`stderr`)
  before `exit`, reported messages never reach the caller.

The Node shape runs each compiler in its own process against real files. The **browser mirror** is
the same two steps with one worker per compiler and the files registered into the virtual
filesystem instead of written to disk — a configuration §3.2 has already verified.

**The browser harness.** `tools/compile-stdout/web/` mirrors `compile.mjs`: one worker per compiler
(each is one-shot, so a worker cannot run two), every file registered through `jsoo_fs_tmp`, and
the output captured by overriding `console`. Two findings make it work, and both are
browser-only — neither shows up under node:

* **`exit` is not implemented in a browser-target build.** A program that calls it works under
  node and dies in a browser with `Invalid_argument "Function 'exit' not implemented"`. The driver
  therefore **returns** rather than exiting, and the caller tells success from failure by whether
  the hex arrived. This is a general rule for anything meant to run in both.
* **With the fake filesystem, fd 1 and fd 2 are wired to `console.log` and `console.error`.**
  `fs_fake.js:442-454` picks them as the sinks ("console.log / console.error always …"). So a
  worker captures the compiler's output by replacing those two functions *before* loading it —
  verified: the driver's 44,612 characters of hex arrive as a single console call. A worker has no
  other way in, since the output never reaches a file the page can read.

**Fixed: a compiled program produced no output in a browser.** It was the harness, not js_of_ocaml,
and the diagnosis took a while because every symptom was consistent with a plausible-looking
bundle.

What it looked like: the program ran — the runner reported `(program returned)` — but nothing it
printed arrived anywhere, with `print_endline` *or* `Printf.printf`, so it was not buffering; node
was unaffected; no dummy primitives; no error.

What it was: **js_of_ocaml's stdout is line-buffered, so it hands its output over one console call
per line, and the worker joined those chunks with `''`** — deleting every newline. The emitted
bundle then arrived as a *single line*:

```
// Generated by js_of_ocaml//# buildInfo:…version=6.4.1(function  (Object){   typeof globalThis !== "object" …
```

which is a `//` comment spanning the entire program. So it ran nothing, printed nothing, raised
nothing, and "returned" — a no-op script. 64 KB of plausible-looking, commented-out code.

The fix is that the chunks are rejoined with newlines rather than concatenated: the worker returns
them as they arrived and the caller puts them together, because the caller knows what it asked for
— the driver's hex has no newlines anywhere and is joined with `''`, the compiler's output is
line-oriented and is joined with `'\n'`. `compile()` now also fails loudly if a bundle ever arrives
as a single line, so this cannot recur silently.

Two things worth keeping from the hunt: `--pretty` is worth passing regardless — the emitted
JavaScript is what a Compiled Code pane shows — and it keeps the output line-oriented, which the
joining depends on. And the way to compare a browser's output with the same pipeline's output
outside one is to have the page POST it back (`tools/compile-stdout/capture-server.mjs`); the
bundle is the only witness, and a string-literal diff over the two is enough to tell "different
code" from "same code, different whitespace".

**Verified in a real browser, after the fix:**

```
Program output: first / second / third
```

And in node, the whole pipeline prints too — `tools/compile-stdout/emit-check.mjs` reproduces a
browser's conditions (the driver with no filesystem, jsoo.js from an empty directory) and reports
the bundle's size, its dummy primitives, and what the program prints.

**Earlier account, kept because it is the shape of the trap.** The pipeline worked — source
compiled to ~64 KB of JavaScript in ~1.5 s, diagnostics arrived, the emitted program *ran* — but
nothing it printed arrived anywhere. Reproduced with `print_endline`, which flushes, and with
`Printf.printf`, so it was **not** buffering; node was unaffected; script injection and console
capture both worked in the page (a marker script was captured). Passing `--target-env=browser`
changed the bundle without changing this. The two things I could not tell apart from inside the
page — a bundle that is missing runtime pieces, and a bundle that is present but inert — are why
getting the bytes back out mattered.

**Verified in a real browser.** `packages/ocaml/test/compiler.html` compiles its sample in well under
a second — and, since the fix below, runs it and shows what it printed:

```
137455 bytes of JavaScript (740 ms) · process: undefined · dummies: none
first
second
third
```

Two bugs the browser caught that node never could:

* **`TextDecoder('latin1')` is not byte-preserving.** In browsers, `latin1` and `iso-8859-1` are
  both aliases for **windows-1252**, which remaps bytes 0x80–0x9F — enough to make every `.cmi`
  unreadable: `Error: Corrupted compiled interface "stdlib/stdlib.cmi"`. Convert byte by byte
  (`String.fromCharCode`, chunked, because a 1.6 MB `.cma` overflows the argument list).
* **The js_of_ocaml CLI calls `exit` after writing its output**, and in a browser-target build
  `exit` is unimplemented, so it raises. The output has already arrived by then, so the harness
  filters that message instead of reporting a phantom error.

**One thing not working:** the page's own "run the output" iframe shows nothing. That is plumbing
in the test page, not the toolchain — the emitted JavaScript's runnability is proven under node
(`test-entry.mjs` runs each compiled program and checks its output), and LiveCodes captures program
output by overriding `console`, the same mechanism verified above.

### 3.3 The compilers are one-shot programs

Each compiled compiler runs its `main` on load and exits. Using one repeatedly in the same
realm is not straightforward. The natural integration shape is therefore **a worker per
compile** (created and terminated, as LiveCodes already does for other heavy languages), with
the 1.9 MB + 5.0 MB artifacts cached by the browser/CDN.

### 3.4 What remains for a shippable browser artifact

1. Fail-safe exercise of `fs_fake` in a real browser.
2. Trim the stdlib asset (49.5 MB → measured minimum; likely low single-digit MB).
3. A single entry point that does source → JS, taking and returning in-memory data:
   `globalThis.process = { argv: [...] }` + files registered in the virtual FS + read the
   result back.
4. Capture diagnostics (the compilers print to stderr; `set_channel_flusher` or the
   program's output stream).

---

## 4. The interpreter, and why it is not the default

The package ships **both** implementations, because they do different jobs: the compiler is for
programs that should touch the page, the interpreter is for programs that should behave like a
script. This is the interpreter.

It is an **OCaml toplevel** — the `compiler-libs` frontend plus a bytecode interpreter, compiled to
JS with js_of_ocaml, running in a worker. Its code is `src/worker.ml`. It works, and what follows is
what it buys and what it costs.

### 4.1 What it does (verified in node via `packages/ocaml/test/node-check.mjs`)

| Case | Result |
| --- | --- |
| `plain` | `exitCode=0`, `"hello from node\n"` |
| `stdin` | `exitCode=0`, `"piped in\n"` |
| `argv` | `exitCode=0`, `"main.ml\none\ntwo\n"` |
| `files` | `exitCode=0`, `"from a file\n"` (`open_in`) |
| `library` | `exitCode=0`, `"hello, node\n"` — lazily Dynlinked from `libs/` |
| `compileError` | `exitCode=null` + `Line 1, characters 14-20: Error: ...` |
| `warning` | `exitCode=0`, no stdout |

Run it with: `node packages/ocaml/test/node-check.mjs`.

`node-check.mjs` has no "missing asset" case, deliberately: the environment caches loaded
interfaces, so a later case never asks for one it has already seen, and a test built on breaking the
reader proves nothing. The earlier version had one and it was misleading; it is gone.

### 4.2 Implementation gotchas, all learned the hard way

* `open Js_of_ocaml_toplevel` is required for `JsooTop`.
* The `.cmi` loader **must be synchronous** — the type-checker asks for interfaces from inside
  type-checking, so there is nothing to await. In the browser this is sync XHR; outside it is an
  injectable reader (`setReader`).
* **`.cmi` parsing is done from bytes** (`Config.cmi_magic_number`, then `Marshal.from_bytes`
  three times for header/crcs/flags). The earlier route — writing the bytes to a file and
  calling the compiler's own reader — was abandoned because **js_of_ocaml's node filesystem
  writes strings as UTF-8**, re-encoding bytes above 127 and corrupting the file. It only ever
  worked in the browser.
* `--effects=cps` is **mandatory** (compiler-libs uses effect handlers).
* Library loading: clear `Sys.interactive`, then `Topdirs.dir_load` (what `#load` calls).
  `Dynlink.loadfile` alone is insufficient.
* Warnings: `#warnings "+a"` at startup — the interactive toplevel silences them by default.
* `exit` is shadowed in a prelude that writes the code into js_of_ocaml's pseudo-FS then
  raises; the code is read back because the toplevel swallows exceptions into its output.
  `Error`-shaped stderr lines → exit 1; `Warning`-shaped → exit 0; compile failure →
  `exitCode: null`.
* argv: shadowing `Sys` **and** `Arg` (Arg reads `Stdlib.Sys.argv` internally).
* stdin: `Sys_js.set_channel_filler` on the real stdin channel, **registered per run**, and the
  input must end with `\n` — returning `""` permanently detaches the filler.
* Field-name mismatches across the JS/OCaml boundary **hang** rather than throw
  (`Js.to_string` of `undefined`). Every field needs a tolerant read. `null` and `undefined`
  are different: `Js.Optdef.to_option` treats only `undefined` as absent, so `null` needs its
  own test.
* `--no-cmis --export export.txt` + on-demand `.cmi` fetch took the payload from 12.5 MB to
  4.2 MB.
* No ppx on toplevel-evaluated code: `##`/`##.` fail, only `Js.Unsafe.*`.
* No JS interop and no DOM: the build exports only the stdlib, and a worker has no `document`.

### 4.3 Build

```sh
# in the container, from /home/opam/src
opam exec -- sh gen_stdlib.sh
opam exec -- jsoo_listunits -o export.txt stdlib
opam exec -- js_of_ocaml --toplevel --effects=cps \
  --no-cmis --export export.txt worker.bc -o web/worker.js
```

(`docker/build.sh` does this plus staging the package assets.)

---

## 5. Ruled out: js_of_ocaml packaging experiments

Do not repeat these. Each was tried and failed for a specific reason.

| Attempt | Why it failed |
| --- | --- |
| Get `Driver.f` to emit the runtime by varying `~link` / `~standalone` / `~wrap_with_fun` | **byte-identical output** (15,547 B) in every combination. `Driver.f`'s defaults are `standalone=true, wrap_with_fun=\`Iife, link=\`No` (`driver.ml:694`), so the toggles were already at their defaults. Runtime inclusion is not `Driver.f`'s job. |
| Link `js_of_ocaml-compiler.runtime-files` so the runtime gets inlined | no change at all. The chunks **were already registered** — that is why the missing-primitive diagnostics can name `+obj.js`, `+fail.js`, `+io.js` (`driver.ml:262` iterates `Builtins.all ()`). `Builtins` is a lookup table (`linker.ml:345` reads `Builtins.File.content`), not an emitter. |
| Concatenate `runtime.js` with the program | `SyntaxError: Identifier 'MlNodeDevice' has already been declared` |
| Use `print-standard-runtime` as the runtime half | **its output does not even run on its own** — it prints a superset covering every target env, so `class MlNodeDevice` is declared more than once and `node rt.js` alone fails to parse |
| `build-runtime <all *.js>` | `runtime.js` **is** the concatenation of the chunks, so including it warns about overriding every primitive. Excluding the aggregates gives a valid, loadable 176 KB runtime that runs silently — but pairing it with a program still failed (`caml_fs_init is not defined`). |
| `build-runtime` without `-o` | requires `-o`; a shell redirect silently produced a 0-byte runtime, surfacing later as a misleading `caml_fs_init is not defined` |

**Conclusion:** the runtime is not something `Driver.f` inlines; it is composed by the CLI's
orchestration (`compiler/bin-js_of_ocaml/compile.ml`, in the *executable*, not the library).
The resolution is not to port that orchestration but to **use the compiler itself compiled to
JS**, which brings the orchestration along as working code.

**Also useful:** `js_of_ocaml-compiler.dynlink` shows the working in-program recipe —
`Parse_bytecode.normalize_bytecode` → `Ocaml_compiler.Symtable.all_primitives` →
`Driver.from_string ~prims ~debug` → JS → `eval` in a realm that already has the runtime.
It emits *unit* JS with **no runtime**, because the host program *is* a js_of_ocaml program.
This is how `#load` of `.cma` works in a js_of_ocaml build — proven working, since the
interpreter's `library` test passes.

---

## 6. LiveCodes integration contract

Facts gathered by reading `D:\DevWork\live-codes\livecodes`.

### 6.1 Language definitions

`LanguageSpecs` — `src/livecodes/models.ts:55-68`. Fields: `name`, `title`, `longTitle?`,
`info?`, `formatter?`, `compiler`, `extensions`, `editor`, `editorLanguage?`,
`editorSupport?`, `preset?`, `largeDownload?`.

**There is no `deprecated`, `hidden` or `experimental` field.** `info?: boolean` only toggles
the "click for info" tooltip. `hidden` exists only on `ProcessorSpecs`.

### 6.2 Naming convention for a second implementation

| | |
| --- | --- |
| `name` | `<base>-wasm` — `ruby-wasm`, `python-wasm`, `fsharp-wasm` |
| `title` | `"<Display> (Wasm)"` — `"Ruby (Wasm)"`, `"F# (Wasm)"`; `python-wasm` uses `title: 'Py (Wasm)'` + `longTitle: 'Python (Wasm)'` |
| `editorLanguage` | the base language id (`'ruby'`, `'python'`) |

**Recommended: `name: 'ocaml-wasm'`, `title: 'OCaml (Wasm)'`, `editorLanguage: 'ocaml'`.**
Caveat: the build is js_of_ocaml, not wasm, so "(Wasm)" is aspirational. `ocaml-js` would be
literally accurate but would need renaming if the project ever moves to `wasm_of_ocaml`.
Avoid `ocaml-native`/`ocaml-real`.

### 6.3 Aliases and extensions

`getLanguageByAlias` (`languages/utils.ts:5-14`) resolves ids, **titles** and **extensions**,
returning the first match. So **only one language can own `ml`/`mli`**. The convention is that
the original keeps the natural extension and the new one takes a qualified one
(`wasm.rb`/`rubywasm`). Hand `ml`/`mli` over at swap time — that handover *is* the swap.

### 6.4 The compiler contract

`compiler: Compiler | Language`. **When it is a string, it recurses** into that language's
compiler (`getLanguageCompiler`, `utils.ts:30-37`). The current `ocaml` entry is
`compiler: 'rescript'`, so **the swap is a one-line change**: `'rescript'` → `'ocaml-wasm'`.
`l=ocaml` links keep working throughout; only the semantics change, which is the intent.

For compile-to-JS, `factory` runs in the compiler worker and returns `string | CompileResult`;
a bare string is normalised to `{ code, info: {} }` (`compiler/utils.ts:3-8`). `info.errors:
string[]` is rendered into the Console pane as `[LanguageTitle] <error>` (`core.ts:1093-1099`)
— **not** as editor markers. If the factory throws, the worker returns
`{ code: '', info: { errors: [message] } }`.

### 6.5 Other mechanics

| Thing | Fact |
| --- | --- |
| `{{hash:…}}` | build-time rewrite by `scripts/hash.js`; a new language script must be added to `scripts/build.js`'s IIFE entry points or the file will not exist |
| `vendors.ts` | `getUrl('@live-codes/ocaml@0.1.0/')` → jsDelivr; **requires publishing to npm**, and so a `license` |
| `largeDownload: true` | one info toast (`core.ts:844-854`); no progress bar |
| progress | only `parent.postMessage({ type: 'loading', payload: bool })`; no byte-level API |
| worker lifecycle | the compiler worker is created once and never terminated; wasm languages with `liveReload` rewrite the result iframe |
| wasm-language model | `factory` is an identity no-op; `scripts` load into the **result iframe**; the script reads its source from `script[type=…]`; output only via `console` |
| starter | `templates/starter/ocaml-starter.ts` is ReScript-flavoured OCaml importing React from esm.sh — **will not compile** with a real OCaml compiler |
| tests | unit specs beside the language (`languages/<lang>/__tests__/*.spec.ts`); Playwright e2e in `e2e/specs/`, heavy ones marked `test.slow()` |

### 6.6 The existing `ocaml` entry

```ts
export const ocaml: LanguageSpecs = {
  name: 'ocaml',
  title: 'OCaml',
  compiler: 'rescript',
  extensions: ['ml', 'mli'],
  editor: 'script',
  editorSupport: { monaco: { language: 'csharp' }, codemirror: { /* mllike */ } },
};
```

Its locale text (`i18n/locales/en/language-info.ts:286-291`) already says the ReScript compiler
is used — that is the natural place to state a deprecation in prose.

### 6.7 Deprecating the old entry

No mechanism exists. Two options:

* **Zero new API:** the menu renders `longTitle || title` (`create-language-menus.ts:98-99`),
  so changing the entry's `title` to `'OCaml (ReScript, deprecated)'` deprecates it today.
* **Proper flag:** add `deprecated?: boolean` to `models.ts:55` and consume it where languages
  are filtered (`create-language-menus.ts:57-59`, and/or `languageIsEnabled` in `utils.ts:57`).
  Label or sort last rather than hide — hiding is indistinguishable from removal and strands
  `l=ocaml` links.

---

## 7. The package

`packages/ocaml` — `@live-codes/ocaml` (renamed from `@live-codes/ocaml-wasm`).

| Path | What |
| --- | --- |
| `src/index.js` | the compiler: `createCompiler({ baseUrl })` → `{ banner, compile }` |
| `src/compiler/` | that API, its orchestration, and the worker harness |
| `src/interpreter/` | the toplevel's API: `createCompiler({ baseUrl, args, files })` → `{ run, dispose, banner }` |
| `bin/copy-assets.mjs` | `ocaml-copy-assets [dir] [--compiler\|--interpreter\|--all]` |
| `assets/compiler/` | the two compiler programs, `stdlib.js` and the runtime chunks (~14 MB) |
| `assets/interpreter/` | the toplevel, its interfaces and its libraries (~4.6 MB) |
| `test/` | `compiler.html`, `interpreter.html`, `interpreter-in-worker.html`, `node-check.mjs` |
| `LICENSE` | LGPL-2.1-or-later WITH OCaml-LGPL-linking-exception |
| `THIRD-PARTY-NOTICES.md` | what is whose inside the generated bundles |

Runtime API surface (interpreter): `self.ocamlWasm.init()`, `.run({code, input, args, files})`,
`.setReader(fn)`, `.setBaseUrl(url)`. `run` **never throws** — failures come back as `error`
plus `exitCode: null`.

Result shape: `{ stdout, stderr, output, diagnostics, errors, exitCode, outcome, error, runMs }`
where `output` is stdout+stderr in flush order, `errors` is empty on success (so
`errors.length` is a reliable failure test), and `outcome` is the toplevel's own output
(`val x : int = 3`) which is *not* program output.

Note this contract is likely to be replaced by the compile-to-JS one (`{ js, diagnostics }`).

---

## 8. Environment and tooling notes

| Thing | Detail |
| --- | --- |
| Container | `ocaml-toolchain`; `docker start ocaml-toolchain` |
| Repo mount | `/home/opam/src` |
| opam switch | `5.5` — OCaml 5.5.1, js_of_ocaml 6.4.1 |
| node | **host only** (v24.4.1); not in the container |
| js_of_ocaml sources | derived, not written down: `$(opam var prefix)/.opam-switch/sources/js_of_ocaml-compiler.<installed version>` |
| build both | `docker run --rm -v "$PWD:/home/opam/src" -w /home/opam/src ocaml-toolchain sh docker/build-compiler.sh`, then `… sh docker/build.sh` |

**Traps encountered:**

* Docker Desktop can go down entirely (missing named pipe, or a 500 on `_ping`). Restart with
  `Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"` and wait ~45 s.
* PowerShell mangles embedded double quotes passed to native commands, and `shell_command` runs
  `cmd.exe` rather than PowerShell. Feed a script to `docker exec -i … sh -s` on stdin, or put it in
  a `.sh` file — a `for` loop does not survive the pipe.
* `Remove-Item` on a directory just used by node/docker may fail with a handle error; retry
  after a few seconds.
* `dune build` inside the opam source tree needs `git init` there.
* Building `jsoo.js` in the container with `rm -rf _build` first is fine; the build is
  reproducible.
* The interpreter's build produced a *different* `worker.js` once (4219716 vs 4220030 bytes) and a
  `Marshal.data_size: bad object` failure did not reproduce afterwards: it was a **stale artifact**
  from a build that had not finished writing. Treat "the artifact I tested" as something to confirm
  by size, or simply re-run the check.
* **Do not filter a build log when you are checking whether a step succeeded.** A `Select-String` on
  the output hid a script that had aborted at an unset variable, and the "nothing changed, so the
  derivation is equivalent" conclusion that followed described a run which had built nothing. Print
  the exit code, and read the tail unfiltered.

---

## 9. Open questions

1. Does LiveCodes' compile worker allow `importScripts` of a 5.7 MB script, and how do
   `largeDownload` and CDN caching handle the compiler assets? **Answered**: yes, and it does. The
   integration works from a CDN, and a worker created from a data URL is what makes that possible —
   see §10, which also records the trap that comes with it.

Answered since this list was written: `fs_fake` *does* behave the same as `fs_node` for the
compilers — the whole browser path runs (§3.2); the minimum stdlib set is every `*.cmi` plus
`stdlib.cma`, `std_exit.cmo` and `runtime-launch-info` (§3); and a js_of_ocaml program cannot be
reused once it has run, so it is one worker per compile (§3.3).

The "first ship" question is settled as well: compile-to-JS is the language, and the interpreter
ships alongside it behind its own entry point.

---

## 10. Libraries, lazily

Nothing is fetched until a program names it. Each implementation answers that question its own way,
because neither can ask the other's.

**The interpreter** ships every library's `.cma` and `.cmi` in `assets/interpreter/libs/`, plus
`stdlib/units.txt` listing the interfaces and `libs/manifest.txt` mapping library → archive →
interfaces. It overrides `Persistent_env.Persistent_signature.load`, and the type-checker asking for
an interface it cannot find *is* the signal: fetch the archive, Dynlink it, read the interface out of
it.

**The trigger is the counter-intuitive part.** Because it only fires on a *miss*, the libraries'
interfaces must **not** be in `stdlib/`. Copying them there — which is what the build did — satisfies
the lookup, so the archive is never Dynlinked and the phrase fails with *"the interface of a module is
loaded, but its implementation is not"*. That is what that message means. They are listed in
`units.txt` and kept in `libs/`.

An archive may also need another loaded first. `js_of_ocaml.cma` references `jsoo_runtime`, whose
interfaces nothing ever asks for, so a manifest entry's archive field is a list loaded in order, and
`js_of_ocaml` names `jsoo_runtime.cma` first.

**The compiler** has no such hook, so it uses the compiler's own errors: `libs/index.txt` maps a
module to the files that implement it, and a compile that reports `Unbound module X`, or `No
implementation provided for the following modules: Y`, is retried with those files added. `required`
remembers them, so a session converges. A program using no libraries fetches 13 files; one that opens
`Js_of_ocaml` and uses `Re` fetches 38 and 2 on demand. Measured: 655 ms and 1728 ms.

Two rules fell out of this that are easy to violate later:

- **The page fetches the library files, not the worker.** A worker created from a data URL — which is
  how the compiler runs from a CDN — has an opaque origin, so its own fetches are refused with
  `Failed to fetch`, even same-origin ones the page can make perfectly well.
- **The link list is per compile.** The harness writes `cmas.txt` from the archives it was handed, in
  order: `stdlib.cma`, then `jsoo_runtime.cma`, then the rest.

### Zarith

Arbitrary-precision arithmetic, and the one library here whose OCaml half is not enough:
`zarith.cma` calls C stubs, and `zarith_stubs_js` implements them in JavaScript.

Installing it at all needed `libgmp-dev`: those stubs are C, and `opam install zarith` fails without
gmp — which is why only `zarith_stubs_js` was ever present, and why `Z` was unbound rather than
broken.

Two things are settled and verified:

- **Type-checking works.** A phrase that opens `Z` loads `zarith.cma` on demand and resolves its
  interfaces like any other library.
- **`zarith_top` must not be staged.** It sits in the same findlib directory, declares the same
  interfaces, and the worker's table keeps the last entry it saw — so `Z` mapped to the *dependent*
  archive and failed with "Reference to undefined compilation unit `Z'". `gen_libs.sh` skips `*_top`.

Running it does not work yet, and the reason is exact. `zarith_stubs_js`'s `runtime.js` is not plain
JavaScript: it is a js_of_ocaml **runtime chunk**, 1246 lines of `//Provides: ml_z_add` and
`//Requires: caml_custom_ops`, some of it reaching into a table that js_of_ocaml's own runtime has to
have populated. Concatenating it — which is what prepending does — leaves the definitions somewhere
js_of_ocaml's primitive table cannot see them, so Dynlink fails with `TypeError: f.ml_z_init is not a
function`. A chunk has to be given to js_of_ocaml's resolver, which emits it in the right position:

- for the compiler, the driver owns the link, so `Js_of_ocaml_compiler.Builtins` is where to look;
- for the interpreter, it has to reach the `js_of_ocaml` command line the way `+dynlink.js` does.

Neither is done, so `Z` type-checks and then fails to load. The 32720-byte text prepend that was tried
first is not in the tree; `docker/build.sh` says why.
