#!/bin/sh
# Which chunk set makes a runtime the program can actually link against?
#
# So far:
#   * `print-standard-runtime` prints a superset and is not loadable.
#   * `build-runtime` with the individual chunks only => a runtime that parses
#     and runs, but does not define `caml_fs_init`, which the program wants.
#   * including `runtime.js` alongside them warns about overriding every
#     primitive -- but those are warnings, and `runtime.js` may well be the base
#     runtime with the others as additions.
# Build both and let the run decide.
set -u

work=/home/opam/src/tools/emit_probe/work
lib="$(opam var lib)/js_of_ocaml-compiler"
cd "$work"

all="$(ls "$lib"/*.js)"
ind="$(ls "$lib"/*.js | grep -v -E '/(runtime|stdlib|jslib|jslib_js_of_ocaml|toplevel)\.js$')"

opam exec -- js_of_ocaml build-runtime --target-env=browser $all -o rt.all.js 2>/dev/null
opam exec -- js_of_ocaml build-runtime --target-env=browser $ind -o rt.ind.js 2>/dev/null
echo "runtime sizes:"
wc -c rt.all.js rt.ind.js
