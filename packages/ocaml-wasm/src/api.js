// One implementation behind the package entry point.
//
// The runtime is a Web Worker: the OCaml toplevel is compiled to JavaScript and
// runs off the main thread, so a slow or runaway program cannot freeze the page.
// Everything the caller needs - stdout, stderr, argv, stdin, files, exit code -
// is a message to that worker.
//
// Note there is no `node` entry point. The worker talks to the page through
// `self.onmessage`/`postMessage`, which is the Web Worker API; Node's
// worker_threads is a different interface, so this package is browser-only for
// now rather than pretending otherwise.

export function createApi() {
	/**
	 * Start an OCaml runtime.
	 *
	 * @param {object} options
	 * @param {string|URL} options.baseUrl - where the runtime assets are served from. Required:
	 *   the assets ship in this package but a page cannot read them off disk, so they have to be
	 *   published somewhere fetchable (see `ocaml-wasm-copy-assets`).
	 * @param {string[]} [options.args] - default program argv. `Sys.argv.(0)` is `"main.ml"`.
	 * @param {{name: string, contents: string}[]} [options.files] - default files, written into the
	 *   runtime's filesystem so `open_in "name"` finds them.
	 * @returns {Promise<{run: Function, banner: string, dispose: Function}>}
	 */
	async function createCompiler(options = {}) {
		const { baseUrl, args: defaultArgs = [], files: defaultFiles = [] } = options;
		if (!baseUrl) {
			throw new Error(
				'baseUrl is required: serve the runtime assets and pass their URL. ' +
					'Run `ocaml-wasm-copy-assets <dir>` to write them, then ' +
					"`createCompiler({ baseUrl: new URL('/ocaml/', location.href) })`."
			);
		}

		const workerUrl = new URL('worker.js', baseUrl);
		const worker = new Worker(workerUrl);

		// `ready` is posted once the toplevel has initialised, so a bad baseUrl fails here rather
		// than at the first run.
		const banner = await new Promise((resolve, reject) => {
			const onMessage = (event) => {
				const message = event.data;
				if (message && message[0] === 'ready') {
					worker.removeEventListener('message', onMessage);
					resolve(message[1]);
				}
			};
			worker.addEventListener('message', onMessage);
			worker.addEventListener('error', (event) => {
				reject(
					new Error(
						`Failed to load the OCaml runtime from ${workerUrl}: ${event.message ?? 'unknown error'}`
					)
				);
			});
		});

		// One toplevel, one environment: runs share it, so they are serialised rather than
		// interleaved. A queued run still resolves - it just waits.
		let queue = Promise.resolve();
		let disposed = false;

		/**
		 * Run a program.
		 *
		 * @param {string} code - OCaml source.
		 * @param {string} [input] - stdin, handed to the program once and then closed.
		 * @param {object} [runOptions] - per-run overrides: `args`, `files`.
		 * @returns {Promise<{stdout: string, stderr: string, output: string, diagnostics: string[],
		 *   errors: string[], exitCode: number|null, outcome: string, runMs: number}>}
		 *   `stderr` is what the program itself wrote to stderr. `diagnostics` holds the compiler's
		 *   errors and warnings; `errors` holds them only when the program failed to compile, so
		 *   `errors.length` is a reliable failure test and warnings still reach `diagnostics`.
		 *   `exitCode` is null when the program never ran. `outcome` is the toplevel's own output
		 *   (`val x : int = 3`), which a compiled program would not print.
		 */
		function run(code, input = '', runOptions = {}) {
			if (disposed) return Promise.reject(new Error('This compiler has been disposed.'));
			if (typeof code !== 'string') {
				return Promise.reject(new Error('run() needs the program source as its first argument.'));
			}

			const started = performance.now();
			const done = queue.then(
				() =>
					new Promise((resolve) => {
						const onMessage = (event) => {
							const message = event.data;
							if (!message || message[0] !== 'result') return;
							worker.removeEventListener('message', onMessage);
							const [, exitCode, stdout, stderr, outcome, output, diagnostics] = message;
							const failed = exitCode === 'null';
							const lines = diagnostics ? diagnostics.split('\n').filter(Boolean) : [];
							resolve({
								stdout,
								stderr,
								output,
								diagnostics: lines,
								errors: failed ? lines : [],
								exitCode: failed ? null : Number(exitCode),
								outcome,
								runMs: performance.now() - started
							});
						};
						worker.addEventListener('message', onMessage);
						worker.postMessage({
							code,
							input,
							args: runOptions.args ?? defaultArgs,
							files: runOptions.files ?? defaultFiles
						});
					})
			);
			queue = done.then(
				() => undefined,
				() => undefined
			);
			return done;
		}

		/** Stop the worker. Further runs reject. */
		function dispose() {
			if (disposed) return;
			disposed = true;
			worker.terminate();
		}

		return { banner, run, dispose };
	}

	return { createCompiler };
}
