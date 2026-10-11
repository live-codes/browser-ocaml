#!/bin/sh
# The driver on the *browser* filesystem device.
#
# Node uses fs_node (real files); a browser uses fs_fake. That device is where an
# earlier bug hid, so build for it explicitly and let the caller supply every
# file through the virtual filesystem instead of the disk.
set -u
cd /home/opam/src

work=tools/compile-stdout/work
rm -rf "$work"
mkdir -p "$work"
ocamllib=/home/opam/.opam/5.2/lib/ocaml

echo "== build the driver bytecode"
opam exec -- dune build tools/compile-stdout/compile_stdout.bc 2>&1 | head -20

cd "$work"
printf 'let () = print_endline "fake fs ok"\n' > main.ml

echo "== the minimal stdlib, to be registered into the virtual filesystem"
mkdir -p stdlib-min
cp "$ocamllib"/*.cmi stdlib-min/
cp "$ocamllib"/stdlib.cma stdlib-min/
cp "$ocamllib"/std_exit.cmo stdlib-min/
cp "$ocamllib"/runtime-launch-info stdlib-min/
echo "files: $(ls stdlib-min | wc -l)"

echo
echo "== compile the driver for the browser target (fs_fake)"
opam exec -- js_of_ocaml compile --target-env=browser \
  /home/opam/src/_build/default/tools/compile-stdout/compile_stdout.bc \
  -o compile_stdout.browser.js 2>&1 | head -20
wc -c compile_stdout.browser.js
