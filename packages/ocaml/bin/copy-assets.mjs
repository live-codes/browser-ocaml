#!/usr/bin/env node
// Copies the runtime assets that ship inside this package into a directory you serve.
//
// This is the browser story: a page cannot read a file inside node_modules, so the assets have to be
// published by whatever serves the page. One command drops a complete copy into your public
// directory; point `baseUrl` at it and nothing else has to be hosted.
import { cp, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url));

const USAGE = `Copy the OCaml runtime assets that ship with this package into a directory you serve.

  ocaml-copy-assets [directory]

  directory   where to write them (default: ./ocaml)

  --print-path   print the packaged assets directory and exit
  --help         print this
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

const target = resolve(args.find((arg) => !arg.startsWith('-')) ?? 'ocaml');

await mkdir(target, { recursive: true });
for (const entry of await readdir(ASSETS, { withFileTypes: true })) {
	await cp(resolve(ASSETS, entry.name), resolve(target, entry.name), {
		recursive: true,
		force: true
	});
}

console.log(`Runtime assets copied to ${target}`);
console.log('Serve that directory and pass its URL as baseUrl, for example:');
console.log("  await createCompiler({ baseUrl: new URL('/ocaml/', location.href) });");
