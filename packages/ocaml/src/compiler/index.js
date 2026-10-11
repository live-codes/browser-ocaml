// The compiler entry point.
//
//   import { createCompiler } from '@live-codes/ocaml';
//
//   const compiler = await createCompiler({ baseUrl });
//   const { js, diagnostics } = await compiler.compile(source);
//
// A page cannot read files out of node_modules, so the compiler assets have to
// be published by whatever serves the page -- `ocaml-copy-assets` writes a copy
// into a directory you serve, and `baseUrl` points at it. Creating a compiler
// checks the assets are actually there, so a bad baseUrl fails here rather than
// at the first compile.
import { compile as compileSource } from './compile.js';

export async function createCompiler({ baseUrl } = {}) {
	if (!baseUrl) {
		throw new Error(
			'baseUrl is required: serve the compiler assets and pass their URL. ' +
				'Run `ocaml-copy-assets --compiler <dir>` to write them, then ' +
				"`createCompiler({ baseUrl: new URL('/ocaml-compiler/', location.href) })`."
		);
	}
	const base = new URL(baseUrl, globalThis.location?.href ?? 'http://localhost/');

	// The standard library is one 5 MB artifact, so it is not fetched just to
	// prove it is reachable -- a HEAD is enough to catch a wrong baseUrl, and
	// the worker's `importScripts` would fail much less legibly later.
	const stdlib = new URL('stdlib.js', base);
	const response = await fetch(stdlib, { method: 'HEAD' }).catch(() => null);
	if (!response || !response.ok) {
		throw new Error(
			`No compiler assets at ${base}: ${stdlib} is not there. ` +
				'Run `ocaml-copy-assets --compiler <dir>` and point baseUrl at the directory you serve.'
		);
	}

	return {
		banner: 'ocaml compiler',
		/** Compile a program. Returns `{ js, diagnostics, error? }`. */
		compile(source) {
			return compileSource(source, { baseUrl: base });
		}
	};
}

export { compileSource as compile };
