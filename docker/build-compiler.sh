#!/bin/sh
# Builds the compiler: OCaml source -> JavaScript, plus the standard library the
# two compiler programs read. Stages into packages/ocaml/assets/compiler/.
#
# Runs in the toolchain container (docker/Dockerfile) with the repository mounted
# at /home/opam/src.
#
# Two js_of_ocaml programs, both the real thing:
#   compile_stdout.browser.js   OCaml source -> bytecode   (our own driver)
#   jsoo.js                     bytecode -> JavaScript     (js_of_ocaml itself)
#
# They are compiled for the browser filesystem (fs_fake), because that is where
# they run, and nothing is written to disk there.

set -eu
cd /home/opam/src

out=packages/ocaml/assets/compiler

# Nothing version-specific is written down here. Ask the switch instead:
#   ocamllib  the standard library it was built with (`opam var ocaml:lib`)
#   jsoo_src  the js_of_ocaml sources opam unpacked when it built the package,
#             named for whatever version it installed
# That is what makes an upgrade two lines in docker/Dockerfile.
ocamllib=$(opam var ocaml:lib)
switch=$(opam var prefix)
jsoo_version=$(opam list --installed --short --columns=version js_of_ocaml-compiler)
jsoo_src="$switch/.opam-switch/sources/js_of_ocaml-compiler.$jsoo_version"
if [ ! -d "$jsoo_src" ]; then
  # opam can satisfy an install from its binary cache, and then nothing is unpacked
  # into sources/. The findlib opt-out below edits that dune file, so fetch them.
  echo "    no sources unpacked; fetching js_of_ocaml-compiler $jsoo_version"
  opam source "js_of_ocaml-compiler.$jsoo_version" --dir="$jsoo_src" > /tmp/opam-source.log 2>&1 || \
    cat /tmp/opam-source.log >&2
fi
if [ ! -d "$jsoo_src" ]; then
  echo "ERROR: no js_of_ocaml-compiler $jsoo_version sources at $jsoo_src" >&2
  echo "       opam keeps them once it has built the package. What is there:" >&2
  ls "$switch/.opam-switch/sources/" >&2 || true
  exit 1
fi
dune="$jsoo_src/compiler/bin-js_of_ocaml/dune"

echo "==> Versions"
opam exec -- ocaml -version
opam exec -- js_of_ocaml --version
echo "    stdlib  $ocamllib"
echo "    sources $jsoo_src"

echo "==> Opting js_of_ocaml out of findlib"
# findlib's support code reads an absolute config path as the compiler starts:
#   Sys_error("no device found for <lib>/findlib.conf/")
# A browser filesystem has nothing mounted at the root, so it cannot resolve it.
# The dune file already carries the opt-out -- a `select` whose default is
# findlib_support.empty.ml -- so removing the library mapping activates it.
#
# Only that one line is removed, so anything else upstream changes is kept; and
# if the file no longer has the expected shape the build stops rather than
# editing something it does not understand. Pinned to js_of_ocaml 6.4.1.
line='(js_of_ocaml-compiler.findlib-support -> findlib_support.empty.ml)'
fallback='(-> findlib_support.empty.ml)'
if grep -qF "$line" "$dune"; then
  grep -v -F "$line" "$dune" > "$dune.tmp"
  mv "$dune.tmp" "$dune"
  echo "    dropped the findlib-support mapping"
elif grep -qF "$fallback" "$dune"; then
  echo "    already opted out"
else
  echo "ERROR: $dune has changed shape; work out the findlib opt-out again" >&2
  exit 1
fi

echo "==> js_of_ocaml as bytecode"
# dune wants a git repository for version detection; its absence is fatal.
[ -d "$jsoo_src/.git" ] || (cd "$jsoo_src" && git init -q)
cd "$jsoo_src"
opam exec -- dune build compiler/bin-js_of_ocaml/js_of_ocaml.bc

echo "==> js_of_ocaml as JavaScript"
cd /home/opam/src
mkdir -p "$out"
opam exec -- js_of_ocaml "$jsoo_src/_build/default/compiler/bin-js_of_ocaml/js_of_ocaml.bc" \
  -o "$out/jsoo.js"

echo "==> The driver, built for the browser filesystem"
# `--dynlink` is what makes js_of_ocaml link its own dynlink runtime into the
# driver: compile.ml adds "+dynlink.js" when toplevel or dynlink is set. The
# driver pulls Dynlink in through compiler-libs, so without this js_of_ocaml
# substitutes a raising dummy for each dynlink primitive. That is harmless while
# nothing calls them -- and fatal as soon as a compiler version does, which OCaml
# 5.5's Dynlink does. The build prints a "missing primitives" warning either way;
# the flag is what silences it.
opam exec -- dune build tools/compile-stdout/compile_stdout.bc
opam exec -- js_of_ocaml compile --target-env=browser --dynlink \
  _build/default/tools/compile-stdout/compile_stdout.bc \
  -o "$out/compile_stdout.browser.js"

echo "==> The standard library, as one filesystem artifact"
# `js_of_ocaml build-fs` writes a script that registers files in the pseudo
# filesystem -- through `jsoo_create_file` when a runtime is already up, or by
# queueing on `jsoo_fs_tmp` when not, which is exactly what the worker harness
# seeds. So the worker mounts it with `importScripts` before the compiler program,
# and the program's runtime replays the queue as it starts; nothing in JavaScript
# has to assemble the set.
#
# Contents are inlined as bytestrings (`Native_string.of_bytestring`), which is
# byte-exact for a .cmi -- the trap here is a text decoding, and browsers alias
# both "latin1" and "iso-8859-1" to windows-1252, which remaps 0x80-0x9F and
# reads back as "Corrupted compiled interface".
#
# Registration is flat, at /stdlib, and the driver is told so through OCAMLLIB.
rm -rf "$out/stdlib" "$out/libs"
mkdir -p "$out/libs"
: > /tmp/fs-args
for f in "$ocamllib"/*.cmi "$ocamllib"/stdlib.cma "$ocamllib"/std_exit.cmo "$ocamllib"/runtime-launch-info; do
  n=$(basename "$f")
  printf '%s:/stdlib/%s\n' "$n" "$n" >> /tmp/fs-args
done
set --
while IFS= read -r arg; do set -- "$@" "$arg"; done < /tmp/fs-args
opam exec -- js_of_ocaml build-fs -I "$ocamllib" "$@" -o "$out/stdlib.js"
echo "    $# files -> $(wc -c < "$out/stdlib.js") bytes"

echo "==> The libraries the compiler can link"
# Plain files, fetched by the worker itself, plus an index saying which module needs
# which files -- so a program fetches only the libraries it names rather than all of
# them. They are binary, and the artifact the standard library uses escapes every byte
# above 127, which turned 12 MB of archives into 31 MB of text. Fetched, they stay as
# they are on disk, and the browser caches them.
#
# What goes in: js_of_ocaml's browser runtime, with Js, Dom_html and the web APIs;
# the standard library's own extras, Str and Unix and Graphics; and the pure-OCaml
# packages baked into the image. Each is taken from its own findlib directory, not
# its dependency tree -- which for js_of_ocaml alone is tens of megabytes of
# interfaces no program of ours will ever name.
: > "$out/libs/manifest.txt"
: > "$out/libs/index.txt"
add_group() {
  group=$1
  shift
  : > /tmp/fs-group
  for dir in "$@"; do
    [ -d "$dir" ] || continue
    for f in "$dir"/*.cmi "$dir"/*.cma; do
      [ -f "$f" ] || continue
      n=$(basename "$f")
      cp "$f" "$out/libs/$n"
      printf '%s\n' "$n" >> /tmp/fs-group
      printf '/stdlib/%s\t%s\n' "$n" "$n" >> "$out/libs/manifest.txt"
    done
  done
  files=$(tr '\n' ' ' < /tmp/fs-group)
  # Every interface in a group answers to the same set of files: naming any one of
  # them means the library is in use, so all of it is fetched.
  for f in $files; do
    case "$f" in
      *.cmi) printf '%s\t%s\n' "${f%.cmi}" "$files" >> "$out/libs/index.txt" ;;
    esac
  done
  : > /tmp/fs-group
  echo "    $group: $(printf '%s' "$files" | wc -w) files"
}
for pkg in \
  str unix graphics \
  js_of_ocaml-lwt lwt \
  re uutf jsonm fmt logs base64 xmlm digestif; do
  add_group "$pkg" "$(opam exec -- ocamlfind query "$pkg" 2>&1)"
done
# js_of_ocaml is one group with two directories: its runtime is a separate archive in
# a subdirectory of the compiler package, and js_of_ocaml.cma references it. Kept as
# its own group it would never load, because nothing asks for its interfaces.
add_group js_of_ocaml \
  "$(opam exec -- ocamlfind query js_of_ocaml 2>&1)" \
  "$(opam exec -- ocamlfind query js_of_ocaml-compiler 2>&1)/runtime"
# Bytecode linking checks that each archive's stub library exists, though the
# implementation of those primitives comes from js_of_ocaml's JavaScript runtime and
# never from the .so. This build looks for them at /static; they are there to be
# found, not to be run. They are small, so they are always fetched rather than
# grouped. Two places ship them: findlib's own stublibs, and the ones that come with
# the standard library (Str, Unix).
: > "$out/libs/stubs.txt"
for stubdir in "$(opam var lib)/stublibs" "$ocamllib/stublibs"; do
  [ -d "$stubdir" ] || continue
  for f in "$stubdir"/*.so; do
    [ -f "$f" ] || continue
    n=$(basename "$f")
    cp "$f" "$out/libs/$n"
    printf '%s\n' "$n" >> "$out/libs/stubs.txt"
    printf '/static/%s\t%s\n' "$n" "$n" >> "$out/libs/manifest.txt"
  done
done
echo "    $(grep -c . "$out/libs/index.txt") units indexed, $(grep -c . "$out/libs/manifest.txt") files staged"

echo "==> The worker harness"
cp packages/ocaml/src/compiler/worker.js "$out/worker.js"

echo "==> The js_of_ocaml runtime chunks"
# The compiler resolves these through Fs while it emits a program. Outside a
# browser that works, because the files are on disk next to the compiler; inside
# one there is no filesystem to resolve them in, and the emitted program is then
# quietly missing pieces of its own runtime -- quietly, because a chunk that
# provides classes or helpers rather than primitives leaves no dummy behind.
mkdir -p "$out/runtime"
cp "$(opam var lib)/js_of_ocaml-compiler"/*.js "$out/runtime/" 2>/dev/null || true
(cd "$out/runtime" && ls | grep -v '^manifest.txt$' > manifest.txt)
echo "    $(ls "$out/runtime" | wc -l) files"

# The artifacts are classic scripts that use `require` and set globals, so the
# directory has to say it is not a module: this package is "type": "module", and
# without this marker Node treats a `.js` file under it as ESM and the compilers
# fail to load outside a browser.
printf '{\n  "type": "commonjs"\n}\n' > "$out/package.json"

echo "==> Done"
du -sh "$out"
