#!/bin/sh
# Builds the compiler: OCaml source -> JavaScript, plus the standard library the
# two compiler programs read. Stages into packages/ocaml/assets/compiler/.
#
# Runs in the toolchain container (docker/Dockerfile) with the repository mounted
# at /home/opam/src.
#
# Two js_of_ocaml programs, both the real thing:
#   compile_stdout.browser.js   OCaml source -> bytecode   (our own driver)
#   jsoo.js                     bytecode -> JavaScript     (js_of_ocaml itself)
#
# They are compiled for the browser filesystem (fs_fake), because that is where
# they run, and nothing is written to disk there.

set -eu
cd /home/opam/src

out=packages/ocaml/assets/compiler

# Nothing version-specific is written down here. Ask the switch instead:
#   ocamllib  the standard library it was built with (`opam var ocaml:lib`)
#   jsoo_src  the js_of_ocaml sources opam unpacked when it built the package,
#             named for whatever version it installed
# That is what makes an upgrade two lines in docker/Dockerfile.
ocamllib=$(opam var ocaml:lib)
switch=$(opam var prefix)
jsoo_version=$(opam list --installed --short --columns=version js_of_ocaml-compiler)
jsoo_src="$switch/.opam-switch/sources/js_of_ocaml-compiler.$jsoo_version"
if [ ! -d "$jsoo_src" ]; then
  echo "ERROR: no js_of_ocaml-compiler $jsoo_version sources at $jsoo_src" >&2
  echo "       opam keeps them once it has built the package. What is there:" >&2
  ls "$switch/.opam-switch/sources/" >&2 || true
  exit 1
fi
dune="$jsoo_src/compiler/bin-js_of_ocaml/dune"

echo "==> Versions"
opam exec -- ocaml -version
opam exec -- js_of_ocaml --version
echo "    stdlib  $ocamllib"
echo "    sources $jsoo_src"

echo "==> Opting js_of_ocaml out of findlib"
# findlib's support code reads an absolute config path as the compiler starts:
#   Sys_error("no device found for <lib>/findlib.conf/")
# A browser filesystem has nothing mounted at the root, so it cannot resolve it.
# The dune file already carries the opt-out -- a `select` whose default is
# findlib_support.empty.ml -- so removing the library mapping activates it.
#
# Only that one line is removed, so anything else upstream changes is kept; and
# if the file no longer has the expected shape the build stops rather than
# editing something it does not understand. Pinned to js_of_ocaml 6.4.1.
line='(js_of_ocaml-compiler.findlib-support -> findlib_support.empty.ml)'
fallback='(-> findlib_support.empty.ml)'
if grep -qF "$line" "$dune"; then
  grep -v -F "$line" "$dune" > "$dune.tmp"
  mv "$dune.tmp" "$dune"
  echo "    dropped the findlib-support mapping"
elif grep -qF "$fallback" "$dune"; then
  echo "    already opted out"
else
  echo "ERROR: $dune has changed shape; work out the findlib opt-out again" >&2
  exit 1
fi

echo "==> js_of_ocaml as bytecode"
# dune wants a git repository for version detection; its absence is fatal.
[ -d "$src/.git" ] || (cd "$src" && git init -q)
cd "$src"
opam exec -- dune build compiler/bin-js_of_ocaml/js_of_ocaml.bc

echo "==> js_of_ocaml as JavaScript"
cd /home/opam/src
mkdir -p "$out"
opam exec -- js_of_ocaml "$src/_build/default/compiler/bin-js_of_ocaml/js_of_ocaml.bc" \
  -o "$out/jsoo.js"

echo "==> The driver, built for the browser filesystem"
opam exec -- dune build tools/compile-stdout/compile_stdout.bc
opam exec -- js_of_ocaml compile --target-env=browser \
  _build/default/tools/compile-stdout/compile_stdout.bc \
  -o "$out/compile_stdout.browser.js"

echo "==> The standard library the compilers open"
# One artifact, not 71 files. `js_of_ocaml build-fs` writes a script that
# registers each file in the pseudo filesystem -- through `jsoo_create_file`
# when a runtime is already up, or by queueing on `jsoo_fs_tmp` when not, which
# is exactly what the worker harness seeds. So the worker mounts it with
# `importScripts` before the compiler program, and the program's runtime replays
# the queue as it starts; nothing in JavaScript has to assemble the set.
#
# Contents are inlined as bytestrings (`Native_string.of_bytestring`), which is
# byte-exact for a .cmi -- the trap here is a text decoding, and browsers alias
# both "latin1" and "iso-8859-1" to windows-1252, which remaps 0x80-0x9F and
# reads back as "Corrupted compiled interface".
#
# The set is every *.cmi (68), which the type-checker looks up by module name,
# plus the three the linker reads: stdlib.cma, std_exit.cmo and
# runtime-launch-info. Registration is flat, at /stdlib, and the driver is told
# so through OCAMLLIB.
rm -rf "$out/stdlib"
set --
for f in "$ocamllib"/*.cmi "$ocamllib"/stdlib.cma "$ocamllib"/std_exit.cmo "$ocamllib"/runtime-launch-info; do
  n=$(basename "$f")
  set -- "$@" "$n:/stdlib/$n"
done
opam exec -- js_of_ocaml build-fs -I "$ocamllib" -o "$out/stdlib.js" "$@"
echo "    $# files -> $(wc -c < "$out/stdlib.js") bytes"

echo "==> The worker harness"
cp packages/ocaml/src/compiler/worker.js "$out/worker.js"

echo "==> The js_of_ocaml runtime chunks"
# The compiler resolves these through Fs while it emits a program. Outside a
# browser that works, because the files are on disk next to the compiler; inside
# one there is no filesystem to resolve them in, and the emitted program is then
# quietly missing pieces of its own runtime -- quietly, because a chunk that
# provides classes or helpers rather than primitives leaves no dummy behind.
mkdir -p "$out/runtime"
cp "$(opam var lib)/js_of_ocaml-compiler"/*.js "$out/runtime/" 2>/dev/null || true
(cd "$out/runtime" && ls | grep -v '^manifest.txt$' > manifest.txt)
echo "    $(ls "$out/runtime" | wc -l) files"

# The artifacts are classic scripts that use `require` and set globals, so the
# directory has to say it is not a module: this package is "type": "module", and
# without this marker Node treats a `.js` file under it as ESM and the compilers
# fail to load outside a browser.
printf '{\n  "type": "commonjs"\n}\n' > "$out/package.json"

echo "==> Done"
du -sh "$out"
