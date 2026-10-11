#!/bin/sh
# Does a compiler-libs driver produce a valid bytecode executable on stdout,
# without writing anything the caller cannot read?
set -u
cd /home/opam/src

work=tools/compile-stdout/work
rm -rf "$work"
mkdir -p "$work"

echo "== build"
opam exec -- dune build tools/compile-stdout/compile_stdout.exe 2>&1 | head -40

cd "$work"
printf 'let () = print_endline "stdout route ok"\n' > main.ml

echo
echo "== reference: ocamlc"
opam exec -- ocamlfind ocamlc -o ref.byte main.ml 2>&1 | head -5
echo "ref.byte: $(wc -c < ref.byte)"

echo
echo "== our driver, natively"
cp /home/opam/src/_build/default/tools/compile-stdout/compile_stdout.exe .
./compile_stdout.exe main.ml > out.hex 2> err.txt
echo "exit: $?"
echo "stderr:"; head -25 err.txt
echo "hex length: $(wc -c < out.hex)"
ls -l
