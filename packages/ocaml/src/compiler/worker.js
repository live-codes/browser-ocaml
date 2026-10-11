// The compiler worker: one compiler per worker.
//
// A js_of_ocaml program runs its main on load and returns, so a worker cannot
// run two of them -- each compile needs a fresh one, created and terminated.
//
// Everything the compiler needs arrives through the virtual filesystem and the
// environment; its output is collected by overriding console, because with the
// browser filesystem fd 1 and fd 2 are wired to console.log and console.error
// (runtime/js/fs_fake.js). A worker has no other way in: the output never
// reaches a file the page can read.
self.onmessage = (event) => {
	const { script, files, env, argv } = event.data;
	const out = [];
	const err = [];
	const realLog = console.log;
	const realError = console.error;

	console.log = (...args) => out.push(args.join(' '));
	console.error = (...args) => err.push(args.join(' '));

	try {
		globalThis.jsoo_fs_tmp = files;
		globalThis.jsoo_env = env;
		// Browsers have no `process`; js_of_ocaml reads `process?.argv` for argv,
		// so a fake one is enough. Note Sys.argv.(0) is argv[1].
		globalThis.process = { argv };
		importScripts(script);
		self.postMessage({ out: out.join(''), err: err.join('\n') });
	} catch (error) {
		self.postMessage({
			out: out.join(''),
			err: `${err.join('\n')}\n${error && error.message ? error.message : error}`
		});
	} finally {
		console.log = realLog;
		console.error = realError;
	}
};
