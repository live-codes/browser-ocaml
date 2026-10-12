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

# The libraries a program can use, from the switch. Their interfaces are listed but
# deliberately *not* copied here: a library gets loaded when the type-checker asks
# for one of its interfaces and the interface is not where the toplevel looks. Put
# them in stdlib/ and the lookup succeeds, the trigger never fires, and the archive
# is never Dynlinked -- the phrase fails with "the interface of a module is loaded,
# but its implementation is not". They are fetched from libs/ instead, which is
# where gen_libs.sh puts them.
: > "$out/units.txt.extra"
for pkg in \
  str unix graphics \
  js_of_ocaml js_of_ocaml-lwt lwt \
  re uutf jsonm fmt logs base64 xmlm digestif \
  zarith zarith_stubs_js; do
  dir=$(opam exec -- ocamlfind query "$pkg" 2>&1) || dir=""
  [ -d "$dir" ] || continue
  for cmi in "$dir"/*.cmi; do
    [ -f "$cmi" ] || continue
    basename "$cmi" >> "$out/units.txt.extra"
  done
done
# js_of_ocaml's runtime is in a subdirectory of the compiler package. Its archive is
# Dynlinked from libs/ too; its interfaces are listed for the same reason.
runtime_dir=$(opam exec -- ocamlfind query js_of_ocaml-compiler 2>&1)/runtime
if [ -d "$runtime_dir" ]; then
  for cmi in "$runtime_dir"/*.cmi; do
    [ -f "$cmi" ] || continue
    basename "$cmi" >> "$out/units.txt.extra"
  done
fi

# Manifest, fetched by the worker at start-up: the interfaces the toplevel ships
# itself, then the ones it can load a library for.
for cmi in "$out"/*.cmi; do
  basename "$cmi"
done > "$out/units.txt"
cat "$out/units.txt.extra" >> "$out/units.txt"
rm -f "$out/units.txt.extra"

# Manifest, fetched by the worker at start-up.
for cmi in "$out"/*.cmi; do
  basename "$cmi"
done > "$out/units.txt"

echo "==> $(wc -l < "$out/units.txt") cmi files written to $out"
