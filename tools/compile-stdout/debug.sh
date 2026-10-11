#!/bin/sh
# Isolate why the native run fails to link.
set -u
cd /home/opam/src/tools/compile-stdout/work
printf 'let () = print_endline "dbg ok"\n' > main.ml

echo "== what does the driver think the stdlib is?"
echo "Config.standard_library was /home/opam/.opam/5.2/lib/ocaml in the working revision"
ls -d /home/opam/.opam/5.2/lib/ocaml
ls -l /home/opam/.opam/5.2/lib/ocaml/stdlib.cma

echo
echo "== no OCAMLLIB: falls back to Config.standard_library"
./compile_stdout.exe main.ml > a.hex 2> a.err
echo "exit $?  hex $(wc -c < a.hex)"
head -8 a.err

echo
echo "== OCAMLLIB=/home/opam/.opam/5.2/lib/ocaml"
OCAMLLIB=/home/opam/.opam/5.2/lib/ocaml ./compile_stdout.exe main.ml > b.hex 2> b.err
echo "exit $?  hex $(wc -c < b.hex)"
head -8 b.err
