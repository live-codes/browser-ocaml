#!/bin/sh
# Prepare what the entry point needs: the driver as JavaScript, and the minimal
# stdlib. js_of_ocaml itself is built by ../emit_probe/pipeline.sh.
set -u
cd /home/opam/src

work=tools/compile-stdout/work
rm -rf "$work"
mkdir -p "$work"
ocamllib=/home/opam/.opam/5.2/lib/ocaml

echo "== the driver, as JavaScript"
opam exec -- dune build tools/compile-stdout/compile_stdout.bc 2>&1 | head -20
opam exec -- js_of_ocaml _build/default/tools/compile-stdout/compile_stdout.bc \
  -o "$work/compile_stdout.js" 2>&1 | head -20
wc -c "$work/compile_stdout.js"

echo
echo "== the minimal stdlib"
mkdir -p "$work/stdlib"
cp "$ocamllib"/*.cmi "$work/stdlib/"
cp "$ocamllib"/stdlib.cma "$work/stdlib/"
cp "$ocamllib"/std_exit.cmo "$work/stdlib/"
cp "$ocamllib"/runtime-launch-info "$work/stdlib/"
echo "files: $(ls "$work/stdlib" | wc -l)"
