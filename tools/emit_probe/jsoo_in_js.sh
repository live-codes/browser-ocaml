#!/bin/sh
# Can the js_of_ocaml compiler itself be compiled to JavaScript, and still
# compile bytecode to JavaScript when running as JS?
#
# It compiles and runs (5.2 MB). It then fails at startup reading
# /home/opam/.../findlib.conf -- an absolute path its filesystem cannot reach,
# the same shape as the earlier `/cmi` problem. findlib is only needed for -I
# and package lookups, neither of which a self-contained program requires, and
# the dune file already has an opt-out: a `select` whose default module is
# findlib_support.empty.ml. Linking the findlib-support library is what reads
# the config, so drop it from the select and the default applies.
set -u

src=/home/opam/.opam/5.2/.opam-switch/sources/js_of_ocaml-compiler.6.4.1
work=/home/opam/src/tools/emit_probe/work
rm -rf "$work"
mkdir -p "$work"

echo "== dune wants a git repo for version detection"
[ -d "$src/.git" ] || (cd "$src" && git init -q)

echo "== opt out of findlib"
sed -i '/findlib-support -> findlib_support.empty.ml/d' "$src/compiler/bin-js_of_ocaml/dune"
sed -n '/^(executable/,/^)/p' "$src/compiler/bin-js_of_ocaml/dune"

echo
echo "== a trivial program to feed it"
cd "$work"
printf 'let () = print_endline "probe ok"\n' > t.ml
opam exec -- ocamlfind ocamlc -o t.byte t.ml
ls -l t.byte

echo
echo "== build the compiler as bytecode"
cd "$src"
opam exec -- dune build compiler/bin-js_of_ocaml/js_of_ocaml.bc 2>&1 | head -20
ls -l _build/default/compiler/bin-js_of_ocaml/js_of_ocaml.bc
cp _build/default/compiler/bin-js_of_ocaml/js_of_ocaml.bc "$work/"

echo
echo "== compile that compiler to JavaScript"
cd "$work"
opam exec -- js_of_ocaml js_of_ocaml.bc -o jsoo.js 2>&1 | head -20
wc -c jsoo.js
