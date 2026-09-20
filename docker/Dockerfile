# Toolchain image for building the in-browser OCaml toplevel.
#
# This is build-time only: it produces a static web/worker.js. The PoC itself
# runs entirely in the browser and never needs a server (or this image).

FROM ocaml/opam:debian-12-ocaml-5.2

USER opam
WORKDIR /home/opam/src

# Bake the OCaml dependencies into the image so rebuilds are fast.
RUN opam install -y dune js_of_ocaml js_of_ocaml-toplevel

CMD ["sh", "docker/build.sh"]
