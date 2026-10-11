// The compiler entry point.
//
//   import { createCompiler } from '@live-codes/ocaml';
//
//   const compiler = await createCompiler({ baseUrl });
//   const { js, diagnostics } = await compiler.compile(source);
//
// A page cannot read files out of node_modules, so the compiler assets have to
// be published by whatever serves the page -- `ocaml-copy-assets` writes a copy
// into a directory you serve, and `baseUrl` points at it. Starting the compiler
// loads the standard library, so a bad baseUrl fails here rather than at the
// first compile.
import { compile as compileSource, loadStdlib } from './compile.js';

export async function createCompiler({ baseUrl } = {}) {
	if (!baseUrl) {
		throw new Error(
			'baseUrl is required: serve the compiler assets and pass their URL. ' +
				'Run `ocaml-copy-assets --compiler <dir>` to write them, then ' +
				"`createCompiler({ baseUrl: new URL('/ocaml-compiler/', location.href) })`."
		);
	}
	const base = new URL(baseUrl, globalThis.location?.href ?? 'http://localhost/');
	const stdlib = await loadStdlib(new URL('stdlib/', base));

	return {
		banner: `ocaml compiler, ${stdlib.length} stdlib files`,
		/** Compile a program. Returns `{ js, diagnostics, error? }`. */
		compile(source) {
			return compileSource(source, { baseUrl: base, stdlib });
		}
	};
}

export { compileSource as compile, loadStdlib };
