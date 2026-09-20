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
opam exec -- js_of_ocaml --toplevel --effects=cps \
  --no-cmis \
  --export export.txt \
  _build/default/src/worker.bc \
  -o web/worker.js

echo "==> Done"
ls -l web/worker.js
