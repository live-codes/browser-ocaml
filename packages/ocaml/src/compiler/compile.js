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

// js_of_ocaml is a command-line program and calls `exit` after writing its
// output -- and in a browser-target build `exit` is not implemented, so it
// raises. The output has already arrived by then, so this is noise rather than
// a diagnostic. Filter it, since the CLI is not ours to change.
const PHANTOM = /Function 'exit' not implemented/;
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
// browser will not make. A data URL carries its own source, so there is nothing to
// fetch and nothing to refuse, which is what lets the compiler run from a CDN.
//
// Everything the harness then loads is passed to it as an absolute URL, and
// `importScripts` *does* accept cross-origin scripts, which `new Worker` does not.
//
// A data URL rather than a blob because the compiler may itself be running inside a
// worker, where `URL.createObjectURL` is not dependable.
const harnessUrls = new Map();

async function harnessFor(baseUrl) {
	let url = harnessUrls.get(String(baseUrl));
	if (!url) {
		const source = await (await fetch(new URL('worker.js', baseUrl))).text();
		url = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(source);
		harnessUrls.set(String(baseUrl), url);
	}
	return url;
}

async function runInWorker(baseUrl, script, files, env, argv, fs = []) {
	const worker = new Worker(await harnessFor(baseUrl));
	return new Promise((resolve, reject) => {
		worker.onmessage = (event) => {
			worker.terminate();
			resolve(event.data);
		};
		worker.onerror = (event) => {
			worker.terminate();
			reject(new Error(event.message || 'the compiler worker failed to load'));
		};
		worker.postMessage({ script, files, env, argv, fs });
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

/**
 * Compile OCaml source to JavaScript.
 *
 * @param {string} source
 * @param {object} options
 * @param {string|URL} options.baseUrl - where the compiler assets are served from.
 * @param {string} [options.driver] - the source-to-bytecode program in that directory.
 * @param {string} [options.jsoo] - the bytecode-to-JavaScript program.
 * @param {string} [options.stdlib] - the filesystem artifact carrying the standard library.
 * @returns {Promise<{js: string|null, diagnostics: string[], error?: string}>}
 */
export async function compile(source, { baseUrl, driver = 'compile_stdout.browser.js', jsoo = 'jsoo.js', stdlib = STDLIB }) {
	if (typeof source !== 'string') throw new TypeError('compile: source must be a string');
	const runtimeFiles = await loadRuntime(baseUrl);
	const files = [{ name: 'main.ml', content: source }, ...runtimeFiles];

	// Source -> bytecode, as hex.
	const front = await runInWorker(
		baseUrl,
		new URL(driver, baseUrl).href,
		files,
		{ OCAMLLIB: STDLIB_DIR },
		['node', 'compile_stdout', 'main.ml'],
		[new URL(stdlib, baseUrl).href]
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
	const back = await runInWorker(
		baseUrl,
		new URL(jsoo, baseUrl).href,
		[{ name: 'main.byte', content: bytesToString(hexToBytes(hex)) }, ...runtimeFiles],
		{},
		['node', 'js_of_ocaml', 'main.byte', '-o', '-', '--target-env=browser', '--pretty']
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
