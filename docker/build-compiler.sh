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

src=/home/opam/.opam/5.2/.opam-switch/sources/js_of_ocaml-compiler.6.4.1
dune="$src/compiler/bin-js_of_ocaml/dune"
out=packages/ocaml/assets/compiler
ocamllib=/home/opam/.opam/5.2/lib/ocaml

echo "==> Versions"
opam exec -- ocaml -version
opam exec -- js_of_ocaml --version

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
# Every .cmi (the compiler looks interfaces up by module name as it type-checks),
# the code itself, and the two non-obvious entries the linker reads.
mkdir -p "$out/stdlib"
cp "$ocamllib"/*.cmi "$out/stdlib/"
cp "$ocamllib"/stdlib.cma "$out/stdlib/"
cp "$ocamllib"/std_exit.cmo "$out/stdlib/"
cp "$ocamllib"/runtime-launch-info "$out/stdlib/"
(cd "$out/stdlib" && ls | grep -v '^manifest.txt$' > manifest.txt)
echo "    $(ls "$out/stdlib" | wc -l) files"

echo "==> The worker harness"
cp packages/ocaml/src/compiler/worker.js "$out/worker.js"

echo "==> Done"
du -sh "$out"
