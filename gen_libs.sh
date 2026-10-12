#!/bin/sh
# Build browser-loadable bytecode for libraries, plus a manifest describing
# them, so the worker can fetch a library only when the code actually uses it.
#
# Each library lives in its own directory under libs-src/ and is compiled to a
# .cma (which Dynlink loads at runtime) alongside its .cmi files (which the
# toplevel needs to type-check against it).
#
# Must run under `opam exec` (see docker/build.sh).

set -eu

src=${1:-libs-src}
out=${2:-web/libs}

rm -rf "$out"
mkdir -p "$out"
: > "$out/manifest.txt"

for dir in "$src"/*/; do
  [ -d "$dir" ] || continue
  name=$(basename "$dir")
  [ -f "$dir/$name.ml" ] || continue

  build=$(mktemp -d)
  cp "$dir"/*.ml "$build"/

  # One unit per .ml, packed into a single archive.
  ( cd "$build" && ocamlfind ocamlc -c ./*.ml )
  ( cd "$build" && ocamlfind ocamlc -a ./*.cmo -o "$name.cma" )

  cmis=$(cd "$build" && ls ./*.cmi | sed 's#\./##' | tr '\n' ',' | sed 's/,$//')
  for cmi in "$build"/*.cmi; do
    cp "$cmi" "$out"/
  done
  cp "$build/$name.cma" "$out"/

  # library <TAB> archive <TAB> comma-separated cmi files
  printf '%s\t%s\t%s\n' "$name" "$name.cma" "$cmis" >> "$out/manifest.txt"
  rm -rf "$build"

  echo "    $name -> $name.cma ($cmis)"
done

# The libraries that come with the switch, shipped as they are: each archive, to be
# Dynlinked, with its interfaces listed so the worker can load it when code names one
# of its modules. Nothing is fetched until then.
#
# js_of_ocaml's runtime is separate and first: it is in a subdirectory of the compiler
# package, and js_of_ocaml.cma references it, so it has to be loadable on its own.
runtime_dir=$(opam exec -- ocamlfind query js_of_ocaml-compiler 2>&1)/runtime
if [ -d "$runtime_dir" ]; then
  for cma in "$runtime_dir"/*.cma; do
    [ -f "$cma" ] || continue
    name=$(basename "$cma" .cma)
    cp "$cma" "$out"/
    cmis=$(cd "$runtime_dir" && ls *.cmi 2>&1 | tr '\n' ',' | sed 's/,$//')
    printf '%s\t%s\t%s\n' "$name" "$(basename "$cma")" "$cmis" >> "$out/manifest.txt"
  done
fi

for pkg in \
  str unix graphics \
  js_of_ocaml js_of_ocaml-lwt lwt \
  re uutf jsonm fmt logs base64 xmlm digestif \
  zarith zarith_stubs_js; do
  dir=$(opam exec -- ocamlfind query "$pkg" 2>&1) || dir=""
  [ -d "$dir" ] || continue
  for cma in "$dir"/*.cma; do
    [ -f "$cma" ] || continue
    name=$(basename "$cma" .cma)
    # A toplevel-support archive lives in the same directory and shadows the real one:
    # zarith_top declares the same interfaces as zarith, the manifest lists both under
    # those names, and the worker keeps the last entry it saw -- so asking for Z loaded
    # zarith_top, which is the *dependent* one, and the phrase failed with "Reference to
    # undefined compilation unit Z". It is printer support for a native toplevel, and
    # nothing here wants it.
    case "$name" in *_top) continue ;; esac
    cp "$cma" "$out"/
    cp "$dir"/*.cmi "$out"/ 2>&1 || true
    cmis=$(cd "$dir" && ls *.cmi 2>&1 | tr '\n' ',' | sed 's/,$//')
    # An archive may need another loaded first. js_of_ocaml is the one that does:
    # js_of_ocaml.cma references the runtime, which is its own archive in a
    # subdirectory of the compiler package, and no program ever asks for the
    # runtime's interface -- so nothing would ever trigger it.
    archives=$(basename "$cma")
    case "$name" in
      js_of_ocaml) archives="jsoo_runtime.cma $archives" ;;
    esac
    printf '%s\t%s\t%s\n' "$name" "$archives" "$cmis" >> "$out/manifest.txt"
  done
done

echo "==> $(wc -l < "$out/manifest.txt") libraries in $out"
