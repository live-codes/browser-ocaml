#!/bin/sh
# How small can the stdlib asset be?
#
# The linker's requirements are now known from testing, so the set can be stated
# exactly instead of copying the whole library directory: every .cmi (the
# interfaces the compiler looks up by module name as it type-checks),
# stdlib.cma (the code), std_exit.cmo and runtime-launch-info (which the linker
# reads). Nothing else.
set -u
cd /home/opam/src

work=tools/compile-stdout/work
rm -rf "$work"
mkdir -p "$work"
ocamllib=/home/opam/.opam/5.2/lib/ocaml

echo "== build the driver"
opam exec -- dune build tools/compile-stdout/compile_stdout.exe 2>&1 | head -20
cp _build/default/tools/compile-stdout/compile_stdout.exe "$work/"

cd "$work"

echo
echo "== full: every top-level file in the library directory"
find "$ocamllib" -maxdepth 1 -type f | wc -l
find "$ocamllib" -maxdepth 1 -type f -exec du -cb {} + | tail -1 | cut -f1

echo
echo "== minimal: cmi + stdlib.cma + std_exit.cmo + runtime-launch-info"
mkdir -p stdlib-min
cp "$ocamllib"/*.cmi stdlib-min/
cp "$ocamllib"/stdlib.cma stdlib-min/
cp "$ocamllib"/std_exit.cmo stdlib-min/
cp "$ocamllib"/runtime-launch-info stdlib-min/
echo "files: $(ls stdlib-min | wc -l)"
find stdlib-min -type f -exec du -cb {} + | tail -1 | cut -f1

echo
echo "== does the pipeline still work against it?"
printf 'let () = print_endline "minimal stdlib ok"\n' > main.ml
OCAMLLIB=stdlib-min ./compile_stdout.exe main.ml > out.hex
echo "exit $?  hex $(wc -c < out.hex)"
ls -l main.byte 2>/dev/null
