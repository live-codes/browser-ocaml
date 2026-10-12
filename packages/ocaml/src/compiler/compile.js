// Compile OCaml source to JavaScript.
//
// Two compiler programs, each in its own worker: the compiler-libs driver turns
// source into bytecode, js_of_ocaml turns bytecode into JavaScript. A worker per
// step because a js_of_ocaml program runs its main on load and returns -- it
// cannot be reused.
//
// Everything crosses between the page and the compilers through the virtual
// filesystem; nothing is written to disk. The result travels as hex, because a
// raw bytecode stream would not survive being put on a text channel.

const lines = (text) => text.split('\n').filter((line) => line.trim() !== '');

// Three kinds of upstream noise reach the worker's stderr, and none says anything
// about the program being compiled:
//
//  - js_of_ocaml is a command-line program and calls `exit` after writing its
//    output -- and in a browser-target build `exit` is not implemented, so it
//    raises. The output has already arrived by then.
//  - js_of_ocaml's runtime tries to `importScripts` its own chunk files, which
//    cannot work once the worker is created from a data URL -- the trick that lets
//    the compiler run from a CDN, since a worker script must otherwise be
//    same-origin. It falls back to the files it was handed and the bundle is
//    correct. A genuinely fatal load leaves no output at all, and that is reported
//    separately by `compile`.
//  - js_of_ocaml warns when it cannot represent an integer exactly, and does so
//    about its own generated runtime rather than about the program. It is filtered
//    on request; the cost is that a program relying on such an integer will not see
//    it either.
const PHANTOM =
	/Function 'exit' not implemented|Failed to execute 'importScripts'|^Uncaught NetworkError:|Warning \[integer-overflow\]/;
const diagnosticsOf = (text) => lines(text).filter((line) => !PHANTOM.test(line));

// Byte-for-byte, and deliberately not TextDecoder: in browsers "latin1" and
// "iso-8859-1" are both aliases for windows-1252, which remaps bytes 0x80-0x9F.
// That is enough to make a .cmi unreadable -- "Corrupted compiled interface" --
// so bytes are copied one at a time, chunked because a 1.6 MB .cma would
// overflow the argument list.
function bytesToString(bytes) {
	let s = '';
	const CHUNK = 0x8000;
	for (let i = 0; i < bytes.length; i += CHUNK) {
		s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
	}
	return s;
}

function hexToBytes(hex) {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
	return bytes;
}

// A worker script has to be same-origin with whatever creates it: `new Worker()`
// refuses a cross-origin URL, and CORS does not help -- it is the script fetch the
// browser will not make. So the worker is created from a small data URL whose only
// job is to `importScripts` the harness, which *is* allowed across origins and then
// loads everything else itself.
//
// A data URL rather than a blob because the compiler may itself be running inside a
// worker, where `URL.createObjectURL` is not dependable. The URL is interpolated
// into JavaScript, so it is quoted with `JSON.stringify` and base64-encoded: the
// base64 form needs no escaping of its own.
const toDataUrl = (content, type = 'text/javascript') =>
	`data:${type};charset=UTF-8;base64,` + btoa(content);

const workerDataUrlFor = (script) =>
	toDataUrl(`importScripts(${JSON.stringify(String(script))});`);

async function runInWorker(baseUrl, script, files, env, argv, fs = [], libs) {
	const worker = new Worker(workerDataUrlFor(new URL('worker.js', baseUrl).href));
	return new Promise((resolve, reject) => {
		worker.onmessage = (event) => {
			worker.terminate();
			resolve(event.data);
		};
		worker.onerror = (event) => {
			worker.terminate();
			reject(new Error(event.message || 'the compiler worker failed to load'));
		};
		worker.postMessage({ script, files, env, argv, fs, libs });
	});
}

// The compiler finds parts of its own runtime through a filesystem -- `Fs` --
// while it emits a program. Outside a browser those files are on disk beside it;
// inside one there is no filesystem, and the program it emits is then missing
// pieces of its own runtime, silently: a chunk that provides classes or helpers
// rather than primitives leaves no dummy behind. So they are shipped and
// registered, under both the plain and the `+`-prefixed name the compiler may
// ask for. Loaded once per page, not once per compile.
let runtimeChunks;

async function loadRuntime(baseUrl) {
	if (runtimeChunks) return runtimeChunks;
	const manifest = await (await fetch(new URL('runtime/manifest.txt', baseUrl))).text();
	runtimeChunks = (
		await Promise.all(
			lines(manifest).map(async (name) => {
				const content = bytesToString(
					new Uint8Array(await (await fetch(new URL(`runtime/${name}`, baseUrl))).arrayBuffer())
				);
				return [
					{ name, content },
					{ name: `+${name}`, content }
				];
			})
		)
	).flat();
	return runtimeChunks;
}

// The standard library the driver reads, as one `js_of_ocaml build-fs` artifact:
// a script that registers every file in the pseudo filesystem, through
// `jsoo_create_file` when a runtime is already up and by queueing on
// `jsoo_fs_tmp` when not. The worker mounts it before the compiler program, and
// the program's runtime replays the queue as it starts.
//
// It used to be 71 files, listed in a manifest and fetched one at a time on
// every compile. One artifact is one request, and no JavaScript has to assemble
// it. The files register at `/stdlib`, which is why `OCAMLLIB` below is
// absolute rather than the bare name it used to be.
const STDLIB = 'stdlib.js';
const STDLIB_DIR = '/stdlib';

// The libraries a program names are fetched on demand rather than shipped up front.
// `libs/index.txt` says which files a module needs, and a compile that could not find
// a module is retried with those files added. Only what a program uses is fetched, and
// once fetched it stays, so the set converges as a session goes on.
const required = new Set();
let libraryIndex;

const loadLibraryIndex = async (baseUrl) => {
	const byUnit = new Map();
	try {
		const text = await (await fetch(new URL('libs/index.txt', baseUrl))).text();
		for (const line of lines(text)) {
			const [unit, files] = line.split('\t');
			if (unit && files) byUnit.set(unit.toLowerCase(), files.split(' ').filter(Boolean));
		}
		// The stub libraries are small and every link may need them, so they are always
		// fetched rather than being part of a group.
		const stubs = await (await fetch(new URL('libs/stubs.txt', baseUrl))).text();
		for (const name of lines(stubs)) required.add(name.trim());
	} catch {
		// No index, so nothing can be fetched on demand: a program gets the standard
		// library and whatever else it can link without one.
	}
	return byUnit;
};

// The two ways the compiler says a library is missing: a module it cannot find at all,
// and a unit with nothing to link against.
const missingUnits = (diagnostics) => {
	const text = diagnostics.join('\n');
	const names = new Set();
	for (const [, name] of text.matchAll(/Unbound module ([A-Za-z0-9_']+)/g)) names.add(name);
	for (const [, block] of text.matchAll(
		/No implementation provided for the following modules:([\s\S]*?)(?:\n\s*\n|$)/g
	)) {
		for (const [, name] of block.matchAll(/([A-Za-z0-9_']+) referenced from/g)) names.add(name);
	}
	return [...names];
};

const filesFor = (byUnit, names) => {
	const files = new Set();
	const known = [...byUnit.keys()];
	for (const name of names) {
		const key = name.toLowerCase();
		const exact = byUnit.get(key);
		if (exact) {
			for (const file of exact) files.add(file);
			continue;
		}
		// A submodule is named without its package: Dom_html is Js_of_ocaml's.
		for (const unit of known.filter((u) => u.endsWith('__' + key))) {
			for (const file of byUnit.get(unit)) files.add(file);
		}
	}
	return [...files];
};

// Byte by byte, not through TextDecoder: these are binary files, and decoding them as
// UTF-8 would corrupt every byte above 127 into something else entirely.
const toByteString = (bytes) => {
	const chunks = [];
	for (let i = 0; i < bytes.length; i += 0x8000) {
		chunks.push(String.fromCharCode(...bytes.subarray(i, i + 0x8000)));
	}
	return chunks.join('');
};

// The library files are fetched here, in the page, rather than in the worker: a worker
// created from a data URL has an opaque origin, so a fetch from inside it to the server
// that served the page is refused. The page is same-origin, so it can.
const fetchLibraries = async (baseUrl, names) => {
	const base = new URL('libs/', baseUrl);
	return Promise.all(
		names.map(async (name) => {
			const bytes = new Uint8Array(await (await fetch(new URL(name, base))).arrayBuffer());
			// The stub libraries are looked for at /static, from the stub directory of
			// the build; everything else is read from the compiler's library directory.
			const path = (name.startsWith('dll') ? '/static/' : '/stdlib/') + name;
			return { path, content: toByteString(bytes) };
		})
	);
};

/**
 * Compile OCaml source to JavaScript, fetching whatever libraries it turns out to need.
 *
 * @param {string} source
 * @param {object} options
 * @param {string|URL} options.baseUrl - where the compiler assets are served from.
 * @param {string} [options.driver] - the source-to-bytecode program in that directory.
 * @param {string} [options.jsoo] - the bytecode-to-JavaScript program.
 * @param {string} [options.stdlib] - the filesystem artifact carrying the standard library.
 * @returns {Promise<{js: string|null, diagnostics: string[], error?: string}>}
 */
export async function compile(source, options) {
	libraryIndex ??= await loadLibraryIndex(options.baseUrl);
	let libs = [...required];
	for (let attempt = 0; attempt < 6; attempt++) {
		const result = await compileOnce(source, { ...options, libs });
		const added = filesFor(libraryIndex, missingUnits(result.diagnostics)).filter(
			(name) => !required.has(name)
		);
		if (added.length === 0) return result;
		for (const name of added) required.add(name);
		libs = [...required];
	}
	// Six rounds and still missing something: run once more, so the caller sees the
	// compiler's own error rather than a guess about it.
	return compileOnce(source, { ...options, libs });
}

// zarith's primitives are C stubs, and `zarith_stubs_js` implements them in JavaScript as a
// js_of_ocaml runtime chunk -- `//Provides:` and `//Requires:` lines that have to be a *link
// input* to js_of_ocaml, not text pasted into the output. Only as an input does js_of_ocaml
// honour them and put each definition where its dependencies already exist; concatenated,
// they land outside its primitive table and the program fails at load with
// "f.ml_z_init is not a function".
const RUNTIME_CHUNK = 'zarith_stubs_js.runtime.js';
const CHUNK_AS_INPUT = 'zarith_stubs_js.js';
let runtimeChunk;

const loadRuntimeChunk = async (baseUrl) => {
	runtimeChunk ??= await (await fetch(new URL('libs/' + RUNTIME_CHUNK, baseUrl))).text();
	return runtimeChunk;
};

async function compileOnce(
	source,
	{ baseUrl, driver = 'compile_stdout.browser.js', jsoo = 'jsoo.js', stdlib = STDLIB, libs = [] }
) {
	if (typeof source !== 'string') throw new TypeError('compile: source must be a string');
	const runtimeFiles = await loadRuntime(baseUrl);
	const files = [{ name: 'main.ml', content: source }, ...runtimeFiles];
	const libraryFiles = await fetchLibraries(baseUrl, libs);

	// Source -> bytecode, as hex. The library files go over with the source, one request
	// each, from the browser's cache after the first compile. The bytecode ->
	// JavaScript step needs none of them.
	const front = await runInWorker(
		baseUrl,
		new URL(driver, baseUrl).href,
		files,
		{ OCAMLLIB: STDLIB_DIR },
		['node', 'compile_stdout', 'main.ml'],
		[new URL(stdlib, baseUrl).href],
		libraryFiles
	);
	const diagnostics = diagnosticsOf(front.err.join('\n'));
	// The driver prints its hex with no newlines anywhere, so its chunks are
	// pieces of one line and go back together without separators.
	const hex = front.out.join('').trim();
	if (!/^[0-9a-f]+$/.test(hex)) {
		return { js: null, diagnostics, error: 'compilation failed' };
	}

	// Bytecode -> JavaScript, on stdout.
	//
	// `--target-env=browser` because that is where the result runs.
	//
	// `--pretty` is for the reader -- the emitted JavaScript is what a Compiled
	// Code pane shows -- and it also keeps the output line-oriented, which the
	// joining below depends on.
	const stubs = required.has('zarith.cma') ? await loadRuntimeChunk(baseUrl) : null;
	const back = await runInWorker(
		baseUrl,
		new URL(jsoo, baseUrl).href,
		[
			{ name: 'main.byte', content: bytesToString(hexToBytes(hex)) },
			...runtimeFiles,
			// The chunk is mounted as a file and named on the command line, which is what
			// makes js_of_ocaml treat it as a link input rather than something to paste in.
			...(stubs ? [{ name: CHUNK_AS_INPUT, content: stubs }] : [])
		],
		{},
		[
			'node',
			'js_of_ocaml',
			// The chunk comes before the bytecode: js_of_ocaml decides how to read its
			// positional inputs from the first one, so a .js has to lead or the bytecode
			// gets parsed as JavaScript.
			...(stubs ? [CHUNK_AS_INPUT] : []),
			'main.byte',
			'-o',
			'-',
			'--target-env=browser',
			'--pretty'
		]
	);
	const backDiagnostics = diagnosticsOf(back.err.join('\n'));
	// js_of_ocaml's stdout is line-buffered, so it hands over one console call
	// per line: the chunks have to be rejoined with newlines, not concatenated.
	// Concatenated, the whole program lands on a single line and ends up inside
	// the header comment it begins with -- it then runs nothing, prints nothing
	// and raises nothing. That is a miserable failure to debug: 64 KB of
	// plausible-looking, commented-out code.
	const js = back.out.join('\n');
	// A bundle that arrives as one line would be swallowed by the header comment
	// it starts with, and would then run nothing at all. Fail loudly rather than
	// hand back a program that quietly does nothing.
	if (!js.includes('\n')) {
		return {
			js: null,
			diagnostics: [...diagnostics, ...backDiagnostics],
			error: 'the compiler produced a single-line bundle, which would not run'
		};
	}
	if (js.trim() === '') {
		return {
			js: null,
			diagnostics: [...diagnostics, ...backDiagnostics],
			error: 'js_of_ocaml produced no output'
		};
	}
	return { js, diagnostics: [...diagnostics, ...backDiagnostics] };
}
