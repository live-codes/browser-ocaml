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

echo "==> $(wc -l < "$out/manifest.txt") libraries in $out"
