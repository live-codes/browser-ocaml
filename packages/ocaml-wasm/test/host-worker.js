// A host worker with its own protocol.
//
// This stands in for LiveCodes' compiler worker: it already owns `onmessage`
// and has its own message shapes. It imports the OCaml runtime and keeps its
// protocol - which only works because the runtime defines an API instead of
// hijacking `onmessage` the way a worker-shaped bundle would.

importScripts('../assets/worker.js');

// The runtime cannot tell where it was loaded from once it is `importScripts`ed
// into a worker that lives elsewhere: relative asset paths would resolve against
// *this* file's directory and 404. A host that does this has to say where the
// assets are -- this is the `baseUrl` the package passes through.
self.ocamlWasm.setBaseUrl(new URL('../assets/', self.location.href).href);

// Deliberately no eager `init()`: it happens on the first `run`, so a worker
// that is started but never used pays nothing, and a failure to initialise
// surfaces as `run`'s `error` rather than as a worker that dies on load with
// nothing to say.

self.addEventListener('message', (event) => {
  const job = event.data;

  // The host's own protocol, untouched by the runtime.
  if (!job || job.type !== 'compile-ocaml') return;

  const result = self.ocamlWasm.run(job.payload);

  self.postMessage({
    type: 'compile-ocaml-result',
    id: job.id,
    stdout: result.stdout,
    stderr: result.stderr,
    errors: result.diagnostics ? result.diagnostics.split('\n').filter(Boolean) : [],
    exitCode: result.exitCode,
    error: result.error ?? null,
  });
});

self.postMessage({ type: 'host-ready' });
