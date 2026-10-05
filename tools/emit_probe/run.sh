#!/bin/sh
# Can the js_of_ocaml backend compile bytecode to JS from inside a
# js_of_ocaml-compiled program?
#
# Produces, under tools/emit_probe/work/ (in the shared mount, so the host can
# run the JS output with node):
#   t.byte      a trivial OCaml program, compiled with ocamlc
#   cli.js      the same program through the `js_of_ocaml` command line
#   probe.native.js   through the library pipeline, built natively
#   probe.js          the probe itself, compiled with js_of_ocaml
#
# The comparison that matters is probe.native.js vs the output of running
# probe.js under node: the same library code, once native and once as JS.

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
opam exec -- ocamlfind ocamlc -S -I "$(opam var ocaml:lib)" t.ml 2>/dev/null || true
ls -l t.ml t.byte

echo
echo "== reference: the js_of_ocaml command line"
opam exec -- js_of_ocaml t.byte -o cli.js && wc -c cli.js

echo
echo "== build the probe natively"
cd /home/opam/src
opam exec -- dune build tools/emit_probe/emit_probe.exe tools/emit_probe/emit_probe.bc
cp _build/default/tools/emit_probe/emit_probe.exe "$work/"

echo
echo "== run the probe natively"
cd "$work"
./emit_probe.exe && mv probe.out.js probe.native.js && wc -c probe.native.js

echo
echo "== native probe vs the command line"
if cmp -s probe.native.js cli.js; then
  echo "IDENTICAL to cli.js"
else
  echo "differs from cli.js (expected: link/format options may differ)"
fi

echo
echo "== compile the probe itself with js_of_ocaml"
cd /home/opam/src
opam exec -- js_of_ocaml _build/default/tools/emit_probe/emit_probe.bc \
  -o "$work/probe.js" && wc -c "$work/probe.js"

# The backend looks for its runtime .js files through Fs, which resolves
# relative paths against the cwd. Give it what it might want.
cp "$(opam var lib)/js_of_ocaml-compiler"/runtime.js "$work/" 2>/dev/null || true
cp "$(opam var lib)/js_of_ocaml-compiler"/stdlib.js "$work/" 2>/dev/null || true
cp "$(opam var lib)/js_of_ocaml-compiler"/jslib.js "$work/" 2>/dev/null || true
cp "$(opam var lib)/js_of_ocaml-compiler"/jslib_js_of_ocaml.js "$work/" 2>/dev/null || true
cp "$(opam var lib)/js_of_ocaml-compiler"/toplevel.js "$work/" 2>/dev/null || true

echo
echo "== done; now run probe.js under node (host side)"
ls -l "$work"
