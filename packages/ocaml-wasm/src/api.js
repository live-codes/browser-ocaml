// One implementation behind the package entry point.
//
// There are two ways to run it, and the caller's situation decides which:
//
//  - If the runtime is already loaded in this context (a host that called
//    `importScripts('worker.js')`, as LiveCodes' compiler worker would), it is
//    used in place. A host that is already a worker should not start a nested
//    one just to hold a runtime it could call directly.
//  - Otherwise a worker is started for you, for standalone use where nobody
//    else owns the message loop.
//
// `baseUrl` is what makes the first case work: the runtime cannot discover
// where its assets are once it has been imported into someone else's worker,
// so it is told rather than left to infer.

const shape = (raw, runMs) => {
	const failed = raw.exitCode === null;
	const lines = raw.diagnostics ? raw.diagnostics.split('\n').filter(Boolean) : [];
	return {
		stdout: raw.stdout,
		stderr: raw.stderr,
		output: raw.output,
		diagnostics: lines,
		// Empty on success, so `errors.length` is a reliable failure test. Warnings
		// from a successful run are in `diagnostics`, not here.
		errors: failed ? lines : [],
		exitCode: failed ? null : Number(raw.exitCode),
		outcome: raw.outcome,
		// A runtime failure (a missing asset, a failed start) rather than the
		// program's diagnostics. Null when nothing went wrong at that level.
		error: raw.error ?? null,
		runMs
	};
};

const absolute = (baseUrl) =>
	new URL(baseUrl, globalThis.location?.href ?? 'http://localhost/').href;

export function createApi() {
	/**
	 * Start an OCaml runtime.
	 *
	 * @param {object} options
	 * @param {string|URL} options.baseUrl - where the runtime assets are served from. Required:
	 *   the assets ship in this package but a page cannot read them off disk, so they have to be
	 *   published somewhere fetchable (see `ocaml-wasm-copy-assets`).
	 * @param {object} [options.runtime] - an already-loaded `self.ocamlWasm` to use in place,
	 *   instead of starting a worker. Defaults to one already present in this context.
	 * @param {string[]} [options.args] - default program argv. `Sys.argv.(0)` is `"main.ml"`.
	 * @param {{name: string, contents: string}[]} [options.files] - default files, written into the
	 *   runtime's filesystem so `open_in "name"` finds them.
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

		const resolvedBase = absolute(baseUrl);
		let disposed = false;

		const runtime = options.runtime ?? globalThis.ocamlWasm;
		if (runtime) {
			runtime.setBaseUrl(resolvedBase);
			runtime.init();
			return {
				banner: 'in-thread',
				/** Run a program in this context. Synchronous underneath; the Promise is for parity. */
				run(code, input = '', runOptions = {}) {
					if (disposed) return Promise.reject(new Error('This compiler has been disposed.'));
					if (typeof code !== 'string') {
						return Promise.reject(
							new Error('run() needs the program source as its first argument.')
						);
					}
					const started = performance.now();
					// `run` does not throw: a failure comes back as `error`.
					const raw = runtime.run({
						code,
						input,
						args: runOptions.args ?? defaultArgs,
						files: runOptions.files ?? defaultFiles
					});
					return Promise.resolve(shape(raw, performance.now() - started));
				},
				dispose() {
					disposed = true;
				}
			};
		}

		const workerUrl = new URL('worker-entry.js', resolvedBase);
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

		/**
		 * Run a program.
		 *
		 * @param {string} code - OCaml source.
		 * @param {string} [input] - stdin, handed to the program once and then closed.
		 * @param {object} [runOptions] - per-run overrides: `args`, `files`.
		 * @returns {Promise<{stdout: string, stderr: string, output: string, diagnostics: string[],
		 *   errors: string[], exitCode: number|null, outcome: string, error: string|null,
		 *   runMs: number}>}
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
							resolve(
								shape(
									{ exitCode, stdout, stderr, outcome, output, diagnostics, error: null },
									performance.now() - started
								)
							);
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
