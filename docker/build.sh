#!/bin/sh
# Builds web/worker.js and web/stdlib/: an OCaml toplevel compiled to
# JavaScript, plus the standard library interfaces it type-checks against.
#
# Runs inside the toolchain container (see ./Dockerfile), with the repository
# mounted at /home/opam/src.
#
# This is the same core step the official OCaml playground uses
# (ocaml.org/play): compile the compiler-libs toplevel with js_of_ocaml's
# --toplevel flag so it can accept source phrases at runtime.

set -eu

echo "==> Versions"
opam exec -- ocaml -version
opam exec -- js_of_ocaml --version

echo "==> Collecting standard library interfaces into web/stdlib/"
opam exec -- sh gen_stdlib.sh

echo "==> Building libraries into web/libs/"
opam exec -- sh gen_libs.sh

echo "==> Listing the compilation units exported to the toplevel"
opam exec -- jsoo_listunits -o export.txt stdlib

echo "==> Compiling worker.ml to bytecode"
opam exec -- dune build src/worker.bc

echo "==> Compiling bytecode to JavaScript (--toplevel, --no-cmis)"
# --effects=cps is required: the toplevel uses effect handlers, and without an
# effects backend js_of_ocaml warns and the toplevel misbehaves. This is the
# modern equivalent of the official playground's `--enable=effects`.
#
# --no-cmis keeps the .cmi interfaces out of the bundle; the worker fetches
# them from stdlib/ on demand, which is what makes the payload tractable.
#
# --dynlink enables Dynlink, so libraries can be loaded at runtime instead of
# being linked in ahead of time.
#
# zarith's primitives are C stubs and zarith_stubs_js implements them in JavaScript, as a
# js_of_ocaml runtime chunk: all //Provides: and //Requires: lines, some of it reaching
# into a table js_of_ocaml's own runtime populates. Passing it as a *link input* is what
# makes js_of_ocaml honour those directives and place each definition where its
# dependencies already exist. Concatenating it as text instead leaves the definitions
# outside the primitive table, and Dynlink then fails with "f.ml_z_init is not a function".
stubs_dir=$(opam exec -- ocamlfind query zarith_stubs_js 2>/dev/null) || stubs_dir=""
stubs_chunk=""
if [ -f "$stubs_dir/runtime.js" ]; then
  stubs_chunk="$stubs_dir/runtime.js"
else
  echo "==> zarith_stubs_js not found: Z will fail at run time"
fi

# The chunk has to come *before* the bytecode. js_of_ocaml decides how to read its
# positional inputs from the first one, so a .js first means JS for the rest -- give it the
# chunk afterwards and it tries to parse the bytecode as JavaScript and gives up with
# "cannot parse file worker.bc".
opam exec -- js_of_ocaml --toplevel --dynlink --effects=cps \
  --no-cmis \
  --export export.txt \
  $stubs_chunk \
  _build/default/src/worker.bc \
  -o web/worker.js

echo "==> Done"
ls -l web/worker.js

# The package ships the same runtime as `assets/interpreter/`, so that
# `copy-assets` has something self-contained to publish.
echo "==> Staging package assets"
mkdir -p packages/ocaml/assets/interpreter
cp web/worker.js packages/ocaml/assets/interpreter/
# The message-loop adapter: the runtime itself is a library, so standalone
# hosts need this small shim, while a host that already owns a worker does not.
cp web/worker-entry.js packages/ocaml/assets/interpreter/
rm -rf packages/ocaml/assets/interpreter/stdlib packages/ocaml/assets/interpreter/libs
cp -r web/stdlib packages/ocaml/assets/interpreter/
cp -r web/libs packages/ocaml/assets/interpreter/
# Same reason as the compiler's: these are classic scripts, not modules.
printf '{\n  "type": "commonjs"\n}\n' > packages/ocaml/assets/interpreter/package.json
du -sh packages/ocaml/assets/interpreter
