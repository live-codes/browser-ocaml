# Build and run the in-browser OCaml work: the compiler, the interpreter, and the
# interpreter's own demo page. Requires Docker; nothing is installed on the host.
#
# These wrap the same scripts the long-lived `ocaml-toolchain` container runs, for
# when there is no container to exec into -- and after an image rebuild, since a
# container keeps running the image it was created from. See README.md.

IMAGE = ocaml-toolchain

.PHONY: all toolchain compiler worker serve clean

all: compiler worker

## Build the toolchain image (opam + js_of_ocaml). Only needed once.
toolchain:
	docker build -t $(IMAGE) docker

## Build the compiler: OCaml source -> JavaScript, into packages/ocaml/assets/compiler/
compiler: toolchain
	docker run --rm -v "$(CURDIR):/home/opam/src" -w /home/opam/src $(IMAGE) sh docker/build-compiler.sh

## Build the interpreter: src/worker.ml -> web/worker.js, and its package assets
worker: toolchain
	docker run --rm -v "$(CURDIR):/home/opam/src" -w /home/opam/src $(IMAGE) sh docker/build.sh

## Serve the demo and the test pages locally — the same thing as `npm run serve`,
## with no Docker involved. Static files only; no compute happens server-side. A
## server is required because Web Workers are not allowed on file:// origins.
serve:
	npm run serve

clean:
	rm -rf _build web/worker.js web/stdlib web/libs export.txt
