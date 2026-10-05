#!/bin/sh
# The front half: source -> bytecode. Can the official bytecode compiler
# (ocamlc.byte) also be compiled to JavaScript?
set -u

work=/home/opam/src/tools/emit_probe/work
rm -rf "$work"
mkdir -p "$work"

echo "== a bytecode ocamlc to compile?"
ls -l /home/opam/.opam/5.2/bin/ocamlc* 2>&1
opam exec -- ocamlc -version

echo
echo "== node in this container?"
command -v node && node --version

echo
echo "== the stdlib libraries ocamlc links against"
ls /home/opam/.opam/5.2/lib/ocaml/*.cma 2>/dev/null | head -5
ls /home/opam/.opam/5.2/lib/ocaml/stdlib.cma 2>/dev/null

echo
echo "== compile ocamlc.byte to JavaScript"
if [ -f /home/opam/.opam/5.2/bin/ocamlc.byte ]; then
  opam exec -- js_of_ocaml /home/opam/.opam/5.2/bin/ocamlc.byte -o "$work/ocamlc.js" 2>&1 | head -30
  wc -c "$work/ocamlc.js"
else
  echo "no ocamlc.byte -- only the native compiler is installed"
fi
