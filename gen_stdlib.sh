#!/bin/sh
# Collect the .cmi interface files the in-browser toplevel needs in order to
# type-check user code against the standard library, plus a manifest listing
# them.
#
# This is what makes `--no-cmis` viable. Embedding every interface in
# worker.js made it ~12 MB; instead the toplevel fetches the .cmi it needs, on
# demand, from stdlib/.
#
# Must run under `opam exec` (see docker/build.sh) so that opam, jsoo_listunits
# and the compiler's libraries are on PATH.

set -eu

out=${1:-web/stdlib}

rm -rf "$out"
mkdir -p "$out"

ocamllib=$(opam var ocaml:lib)

# Unit names are capitalised ("Stdlib__List") while the files are not
# ("stdlib__List.cmi"): only the first character is lower-cased. So drop the
# first character of the unit name and match it with a glob.
copy_units() {
  package=$1
  list=$(mktemp)
  jsoo_listunits -o "$list" "$package"
  while IFS= read -r unit; do
    # shellcheck disable=SC2086
    set -- "$ocamllib"/?${unit#?}.cmi
    if [ -f "$1" ]; then
      cp "$1" "$out"/
    else
      echo "gen_stdlib: no cmi found for unit $unit" >&2
    fi
  done < "$list"
  rm -f "$list"
}

copy_units stdlib

# Units the toplevel itself needs, which are not part of the stdlib package.
for extra in std_exit unix/unix unix/unixLabels compiler-libs/topdirs; do
  if [ -f "$ocamllib/$extra.cmi" ]; then
    cp "$ocamllib/$extra.cmi" "$out"/
  else
    echo "gen_stdlib: no cmi found for $extra" >&2
  fi
done

# The libraries a program can use, from the switch. Same reasoning as the standard
# library above: these are interfaces the type-checker asks for by module name, and
# they are fetched on demand, so a program that names none of these modules fetches
# none of these files.
for pkg in \
  str unix graphics \
  js_of_ocaml js_of_ocaml-lwt lwt \
  re uutf jsonm fmt logs base64 xmlm digestif; do
  dir=$(opam exec -- ocamlfind query "$pkg" 2>&1) || dir=""
  [ -d "$dir" ] || continue
  for cmi in "$dir"/*.cmi; do
    [ -f "$cmi" ] || continue
    cp "$cmi" "$out"/
  done
done
# js_of_ocaml's runtime lives in a subdirectory of the compiler package, and the
# toplevel needs its archive rather than its interfaces -- it is Dynlinked, below,
# in libs/. Its interfaces are copied all the same, because a program may name it.
runtime_dir=$(opam exec -- ocamlfind query js_of_ocaml-compiler 2>&1)/runtime
if [ -d "$runtime_dir" ]; then
  for cmi in "$runtime_dir"/*.cmi; do
    [ -f "$cmi" ] || continue
    cp "$cmi" "$out"/
  done
fi

# Manifest, fetched by the worker at start-up.
for cmi in "$out"/*.cmi; do
  basename "$cmi"
done > "$out/units.txt"

echo "==> $(wc -l < "$out/units.txt") cmi files written to $out"
