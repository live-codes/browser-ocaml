# Build the in-browser OCaml toplevel PoC.
#
# Requires Docker. Nothing is installed on the host.

IMAGE = browser-ocaml-toolchain

.PHONY: all toolchain worker serve clean

all: worker

## Build the toolchain image (opam + js_of_ocaml). Only needed once.
toolchain:
	docker build -t $(IMAGE) docker

## Compile src/worker.ml -> web/worker.js
worker: toolchain
	docker run --rm -v "$(CURDIR):/home/opam/src" -w /home/opam/src $(IMAGE) sh docker/build.sh

## Serve the PoC locally. This only serves static files; no compute happens
## server-side. A server is required because Web Workers are not allowed on
## file:// origins.
serve:
	python -m http.server 8080 --directory web

clean:
	rm -rf _build web/worker.js web/stdlib web/libs export.txt
