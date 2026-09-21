// A message-loop adapter around the runtime library.
//
// The runtime in worker.js is a *library*: it exposes `self.ocamlWasm` and does
// not touch `onmessage`, so a host that is already a worker (LiveCodes' compiler
// worker, for instance) can `importScripts('worker.js')` and call
// `self.ocamlWasm.run(...)` directly, keeping its own protocol.
//
// This file is the other case: standalone use, where nobody else owns the
// message loop, so something has to provide one. It is deliberately the only
// place the postMessage protocol exists.

importScripts('worker.js');

// The runtime cannot tell where it was loaded from once it is `importScripts`ed
// into a worker that lives elsewhere -- relative asset paths would resolve
// against the *host*. The adapter does know its own location, so it says.
self.ocamlWasm.setBaseUrl(new URL('./', self.location.href).href);

self.addEventListener('message', (event) => {
  const result = self.ocamlWasm.run(event.data);
  self.postMessage([
    'result',
    result.exitCode === null ? 'null' : String(result.exitCode),
    result.stdout,
    result.stderr,
    result.outcome,
    result.output,
    result.diagnostics,
  ]);
});

// The page waits for this before enabling Run, so pay initialisation here
// rather than on the first run.
self.ocamlWasm.init();
self.postMessage(['ready', 'Toplevel ready.']);
