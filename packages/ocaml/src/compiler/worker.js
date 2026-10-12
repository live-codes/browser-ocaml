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
// Bytes to a bytestring, one character per byte, chunked so a multi-megabyte archive
// does not overflow the argument list. Deliberately not TextDecoder: in browsers
// "latin1" and "iso-8859-1" are both aliases for windows-1252, which remaps
// 0x80-0x9F, and that is enough to make a .cmi or a .cma unreadable.
const bytesToString = (bytes) => {
	let s = '';
	const CHUNK = 0x8000;
	for (let i = 0; i < bytes.length; i += CHUNK) {
		s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
	}
	return s;
};

// The library files this compile needs. The *page* fetches them, not this worker: a
// worker created from a data URL has an opaque origin, so a fetch from here to the
// server that served the page is refused. They arrive with the path each belongs at,
// which is the same shape a filesystem artifact uses.
const mountLibraries = (files) => {
	const archives = [];
	for (const { path, content } of files) {
		globalThis.jsoo_fs_tmp.push({ name: path, content });
		if (path.endsWith('.cma')) archives.push(path.slice(path.lastIndexOf('/') + 1));
	}
	// What the linker links, and the order matters: a library has to come before the
	// archive that references it. stdlib first, because that is where a program's
	// runtime starts, then js_of_ocaml's runtime, then the rest.
	const rank = (name) => (name === 'stdlib.cma' ? 0 : name === 'jsoo_runtime.cma' ? 1 : 2);
	archives.sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0));
	globalThis.jsoo_fs_tmp.push({
		name: '/stdlib/cmas.txt',
		content: ['stdlib.cma', ...archives].join('\n') + '\n',
	});
};

self.onmessage = async (event) => {
	const { script, files, env, argv, fs = [], libs = [] } = event.data;
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
		// Filesystem artifacts first. Nothing has defined `jsoo_create_file` yet,
		// so they queue their files on `jsoo_fs_tmp` -- and the program's runtime
		// replays that queue at start-up. Loading them after the program would
		// take the other branch and register the files directly, so the order is
		// not load-bearing, but this is the cheaper one.
		for (const url of fs) importScripts(url);
		// Then the libraries, which have to be in place before the program starts.
		if (libs.length > 0) mountLibraries(libs);
		importScripts(script);
		// The chunks go back as they arrived, not joined: the caller knows how to
		// put them together, and joining here would lose the newlines between
		// them. js_of_ocaml's stdout is line-buffered, so it hands over one call
		// per line, and a program that arrives as a single line is a program
		// swallowed by its own header comment.
		self.postMessage({ out, err });
	} catch (error) {
		self.postMessage({ out, err: [...err, String((error && error.message) || error)] });
	} finally {
		console.log = realLog;
		console.error = realError;
	}
};
