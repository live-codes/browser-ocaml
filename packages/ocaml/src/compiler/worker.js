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

// The libraries a program can link are fetched here rather than shipped inside a
// filesystem artifact: they are binary, and that format escapes every byte above 127,
// which tripled them. Fetched, they stay as they are on disk -- and the browser caches
// them, so this is a cache read on every compile after the first.
//
// Each arrives as `path` and the file to fetch for it, and is queued the same way the
// artifact queues its files, for the program's runtime to replay as it starts.
const mountLibraries = async (manifestUrl) => {
	const base = new URL('.', manifestUrl);
	const manifest = await (await fetch(manifestUrl)).text();
	const entries = manifest
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line !== '')
		.map((line) => line.split('\t'));
	await Promise.all(
		entries.map(async ([path, name]) => {
			const bytes = new Uint8Array(await (await fetch(new URL(name, base))).arrayBuffer());
			globalThis.jsoo_fs_tmp.push({ name: path, content: bytesToString(bytes) });
		})
	);
};

self.onmessage = async (event) => {
	const { script, files, env, argv, fs = [], libs } = event.data;
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
		if (libs) await mountLibraries(libs);
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
