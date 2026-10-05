#!/bin/sh
# Both halves of the toolchain as JavaScript:
#   ocamlc.byte   source -> bytecode
#   js_of_ocaml   bytecode -> JavaScript
#
# The stdlib is copied to a *relative* directory because that is the only kind
# of path js_of_ocaml's filesystem can resolve outside a browser (an absolute
# /home/... has no device). In a browser the same files go into the virtual
# filesystem instead.
set -u

src=/home/opam/.opam/5.2/.opam-switch/sources/js_of_ocaml-compiler.6.4.1
ocamllib=/home/opam/.opam/5.2/lib/ocaml
work=/home/opam/src/tools/emit_probe/work
rm -rf "$work"
mkdir -p "$work"

[ -d "$src/.git" ] || (cd "$src" && git init -q)
sed -i '/findlib-support -> findlib_support.empty.ml/d' "$src/compiler/bin-js_of_ocaml/dune"

echo "== js_of_ocaml as JavaScript"
cd "$src"
opam exec -- dune build compiler/bin-js_of_ocaml/js_of_ocaml.bc 2>&1 | head -5
cp _build/default/compiler/bin-js_of_ocaml/js_of_ocaml.bc "$work/"
cd "$work"
opam exec -- js_of_ocaml js_of_ocaml.bc -o jsoo.js
echo "jsoo.js: $(wc -c < jsoo.js)"

echo
echo "== ocamlc as JavaScript"
opam exec -- js_of_ocaml /home/opam/.opam/5.2/bin/ocamlc.byte -o ocamlc.js
echo "ocamlc.js: $(wc -c < ocamlc.js)"

echo
echo "== the stdlib ocamlc needs, in a relative directory"
mkdir -p stdlib-ocaml
for f in "$ocamllib"/*; do
  [ -f "$f" ] && cp "$f" stdlib-ocaml/ 2>/dev/null
done
echo "files: $(ls stdlib-ocaml | wc -l)"
du -sh stdlib-ocaml

echo
echo "== a program to run through both"
printf 'let () = print_endline "probe ok"\n' > t.ml
ls -l
