#!/usr/bin/env node
// Copies the assets an implementation needs into a directory you serve.
//
// A page cannot read a file out of node_modules, so the runtime assets have to
// be published by whatever serves the page. This writes the set for one
// implementation at a time, so using the compiler does not mean serving the
// interpreter's assets or the other way round.
import { cp, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url));

const USAGE = `Copy the OCaml assets that ship with this package into a directory you serve.

  ocaml-copy-assets [directory] [--compiler|--interpreter|--all]

  directory      where to write them (default: ./ocaml)
  --compiler     the compiler: the two compiler programs and the stdlib (default)
  --interpreter  the toplevel: its runtime, interfaces and libraries
  --all          both, each in its own subdirectory
  --print-path   print the packaged assets directory and exit
  --help         print this

The default is --compiler, so a compiler user serves nothing they do not need.
`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
	console.log(USAGE);
	process.exit(0);
}
if (args.includes('--print-path')) {
	console.log(ASSETS);
	process.exit(0);
}

const which = args.includes('--all')
	? ['compiler', 'interpreter']
	: args.includes('--interpreter')
		? ['interpreter']
		: ['compiler'];

const root = resolve(args.find((arg) => !arg.startsWith('-')) ?? 'ocaml');

// One implementation is written straight into the target directory so that
// `baseUrl` is simply that directory; both are nested, because each has its own
// `stdlib/` and they would collide.
const targetFor = (implementation) =>
	which.length === 1 ? root : resolve(root, implementation);

for (const implementation of which) {
	const source = resolve(ASSETS, implementation);
	const target = targetFor(implementation);
	await mkdir(target, { recursive: true });
	for (const entry of await readdir(source, { withFileTypes: true })) {
		await cp(resolve(source, entry.name), resolve(target, entry.name), {
			recursive: true,
			force: true
		});
	}
	console.log(`${implementation} assets copied to ${target}`);
}

console.log('');
console.log(`Serve ${which.length === 1 ? 'that directory' : 'those directories'} and pass the URL as baseUrl,`);
console.log('for example:');
for (const implementation of which) {
	console.log(
		`  ${implementation}: ` +
			"new URL('" +
			(which.length === 1 ? '/ocaml/' : `/${implementation}/`) +
			"', location.href)"
	);
}
