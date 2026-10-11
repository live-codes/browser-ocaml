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

function runInWorker(baseUrl, script, files, env, argv) {
	return new Promise((resolve, reject) => {
		const worker = new Worker(new URL('worker.js', baseUrl));
		worker.onmessage = (event) => {
			worker.terminate();
			resolve(event.data);
		};
		worker.onerror = (event) => {
			worker.terminate();
			reject(new Error(event.message || 'the compiler worker failed to load'));
		};
		worker.postMessage({ script, files, env, argv });
	});
}

// The stdlib ships as plain files plus a manifest listing them, so the page can
// fetch the set without needing a directory listing. 71 files, about 1.8 MB.
export async function loadStdlib(baseUrl) {
	const manifest = await (await fetch(new URL('manifest.txt', baseUrl))).text();
	return Promise.all(
		lines(manifest).map(async (name) => ({
			name: `stdlib/${name}`,
			content: bytesToString(
				new Uint8Array(await (await fetch(new URL(name, baseUrl))).arrayBuffer())
			)
		}))
	);
}

/**
 * Compile OCaml source to JavaScript.
 *
 * @param {string} source
 * @param {object} options
 * @param {string|URL} options.baseUrl - where the compiler assets are served from.
 * @param {string} [options.driver] - the source-to-bytecode program in that directory.
 * @param {string} [options.jsoo] - the bytecode-to-JavaScript program.
 * @param {{name: string, content: string}[]} options.stdlib - from `loadStdlib`.
 * @returns {Promise<{js: string|null, diagnostics: string[], error?: string}>}
 */
export async function compile(source, { baseUrl, driver = 'compile_stdout.browser.js', jsoo = 'jsoo.js', stdlib }) {
	if (typeof source !== 'string') throw new TypeError('compile: source must be a string');
	const files = [{ name: 'main.ml', content: source }, ...stdlib];

	// Source -> bytecode, as hex.
	const front = await runInWorker(
		baseUrl,
		new URL(driver, baseUrl).href,
		files,
		{ OCAMLLIB: 'stdlib' },
		['node', 'compile_stdout', 'main.ml']
	);
	const diagnostics = diagnosticsOf(front.err);
	const hex = front.out.trim();
	if (!/^[0-9a-f]+$/.test(hex)) {
		return { js: null, diagnostics, error: 'compilation failed' };
	}

	// Bytecode -> JavaScript, on stdout.
	//
	// `--target-env=browser` because that is where the result runs: it selects
	// the browser filesystem, and the node one is not merely unused, it decides
	// how the program ends -- the program's own final exit is a stub in a
	// browser build rather than something that flushes stdout first.
	const back = await runInWorker(
		baseUrl,
		new URL(jsoo, baseUrl).href,
		[{ name: 'main.byte', content: bytesToString(hexToBytes(hex)) }],
		{},
		['node', 'js_of_ocaml', 'main.byte', '-o', '-', '--target-env=browser']
	);
	const backDiagnostics = diagnosticsOf(back.err);
	const js = back.out;
	if (js.trim() === '') {
		return {
			js: null,
			diagnostics: [...diagnostics, ...backDiagnostics],
			error: 'js_of_ocaml produced no output'
		};
	}
	return { js, diagnostics: [...diagnostics, ...backDiagnostics] };
}
