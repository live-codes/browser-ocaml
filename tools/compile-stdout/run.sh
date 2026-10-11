#!/bin/sh
# Does the compiler-libs driver also work compiled to JavaScript, with its
# inputs supplied the way a browser would supply them?
set -u
cd /home/opam/src

work=tools/compile-stdout/work
rm -rf "$work"
mkdir -p "$work"
ocamllib=/home/opam/.opam/5.2/lib/ocaml

echo "== build, native and bytecode"
opam exec -- dune build tools/compile-stdout/compile_stdout.exe tools/compile-stdout/compile_stdout.bc 2>&1 | head -30
cp _build/default/tools/compile-stdout/compile_stdout.exe "$work/"

cd "$work"
printf 'let () = print_endline "js driver ok"\n' > main.ml

echo
echo "== native run, with OCAMLLIB pointed at the real stdlib"
OCAMLLIB="$ocamllib" ./compile_stdout.exe main.ml > native.hex
echo "native hex: $(wc -c < native.hex)"

echo
echo "== a stdlib subset for the JavaScript run"
mkdir -p stdlib-ocaml
cp "$ocamllib"/*.cmi stdlib-ocaml/ 2>/dev/null || true
cp "$ocamllib"/*.cma stdlib-ocaml/ 2>/dev/null || true
# The linker wants std_exit.cmo, which lives among the .cmo files.
cp "$ocamllib"/*.cmo stdlib-ocaml/ 2>/dev/null || true
# ...and runtime-launch-info, which it also reads.
cp "$ocamllib"/runtime-launch-info stdlib-ocaml/ 2>/dev/null || true
echo "files: $(ls stdlib-ocaml | wc -l)"
du -sh stdlib-ocaml

echo
echo "== compile the driver to JavaScript"
opam exec -- js_of_ocaml /home/opam/src/_build/default/tools/compile-stdout/compile_stdout.bc \
  -o compile_stdout.js 2>&1 | head -20
wc -c compile_stdout.js
ls -l
