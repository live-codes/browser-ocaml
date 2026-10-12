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

# zarith is arbitrary-precision arithmetic, and it has C stubs, so it needs gmp to build.
# zarith_stubs_js then replaces those stubs at run time, which is what makes the pair
# usable in a browser -- but the C half still has to compile first.
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends libgmp-dev pkg-config \
  && rm -rf /var/lib/apt/lists/*

USER opam
WORKDIR /home/opam/src

# Bake the OCaml dependencies into the image so rebuilds are fast.
#
# js_of_ocaml is the compiler and its browser runtime -- Js, Dom_html and the rest
# of the web APIs. The others are pure-OCaml libraries a browser can actually run:
# no C stubs anywhere, or (for Zarith) a JavaScript replacement for them.
RUN opam install -y dune \
  js_of_ocaml.${JS_OF_OCAML_VERSION} \
  js_of_ocaml-toplevel.${JS_OF_OCAML_VERSION} \
  re \
  uutf \
  jsonm \
  fmt \
  logs \
  base64 \
  xmlm \
  lwt \
  js_of_ocaml-lwt \
  zarith \
  zarith_stubs_js \
  digestif

# Kept separate: `graphics` is the one package here that is not pure OCaml, so a
# failure to build it should not take the rest of the image with it.
RUN opam install -y graphics

CMD ["sh", "docker/build.sh"]
