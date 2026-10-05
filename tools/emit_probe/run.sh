#!/bin/sh
# Can the js_of_ocaml backend emit a complete, runnable bundle from inside a
# js_of_ocaml program, with no filesystem?
#
# The runtime chunks come from js_of_ocaml-compiler.runtime-files, which
# registers them into the compiler as builtins. Nothing is read from disk, which
# is the point: a browser has no disk.
set -u
cd /home/opam/src

work=tools/emit_probe/work
rm -rf "$work"
mkdir -p "$work"

echo "== versions"
opam exec -- ocaml -version
opam exec -- js_of_ocaml --version

echo
echo "== a trivial program"
cd "$work"
printf 'let () = print_endline "probe ok"\n' > t.ml
opam exec -- ocamlfind ocamlc -o t.byte t.ml
ls -l t.byte

echo
echo "== reference: the js_of_ocaml command line"
opam exec -- js_of_ocaml t.byte -o cli.js && wc -c cli.js

echo
echo "== the probe, native"
cd /home/opam/src
opam exec -- dune build tools/emit_probe/emit_probe.exe tools/emit_probe/emit_probe.bc
cp _build/default/tools/emit_probe/emit_probe.exe "$work/"
cd "$work"
./emit_probe.exe

echo
echo "== the probe itself, compiled by js_of_ocaml"
cd /home/opam/src
opam exec -- js_of_ocaml _build/default/tools/emit_probe/emit_probe.bc \
  -o "$work/probe.js"
wc -c "$work/probe.js"
