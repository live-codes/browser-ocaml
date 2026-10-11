# Toolchain image for building the in-browser OCaml work.
#
# This is build-time only: it produces static artifacts, and the browser then
# does all the work -- nothing a page runs needs a server, or this image.
#
# Both versions live here and nowhere else. The build scripts ask the switch for
# their paths (`opam var ocaml:lib`, the sources directory named for the
# installed version) instead of hard-coding them, so moving to a new OCaml or
# js_of_ocaml is these two lines. See "How to upgrade" in FINDINGS.md.
ARG OCAML_VERSION=5.5
FROM ocaml/opam:debian-12-ocaml-${OCAML_VERSION}

# Pinned on purpose. The artifacts embed js_of_ocaml, so an unpinned install
# would drift silently the next time this image is rebuilt.
ARG JS_OF_OCAML_VERSION=6.4.1

USER opam
WORKDIR /home/opam/src

# Bake the OCaml dependencies into the image so rebuilds are fast.
RUN opam install -y dune \
  js_of_ocaml.${JS_OF_OCAML_VERSION} \
  js_of_ocaml-toplevel.${JS_OF_OCAML_VERSION}

CMD ["sh", "docker/build.sh"]
