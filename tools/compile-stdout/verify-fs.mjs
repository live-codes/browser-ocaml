// Check the stdlib artifact against the files it was built from.
//
// `js_of_ocaml build-fs` inlines every file as a bytestring, and the property
// that matters is byte-exactness: a byte above 127 that gets remapped turns a
// .cmi into "Corrupted compiled interface". Worth checking after a toolchain
// upgrade, where the artifact and the switch's stdlib are rebuilt together.
//
// The originals live in the container and node does not, so this prints hashes
// to compare rather than comparing itself:
//
//   docker run --rm ocaml-toolchain sh -c \
//     'cd $(opam var ocaml:lib) && sha256sum *.cmi stdlib.cma std_exit.cmo runtime-launch-info | LC_ALL=C sort -k2' \
//     > originals.txt
//   node tools/compile-stdout/verify-fs.mjs > artifact.txt
//   diff originals.txt artifact.txt
//
// Both sides sort by name, and `LC_ALL=C` matters: a locale-aware sort orders
// `stdlib__Arg.cmi` before `stdlib.cmi`, and this file compares by code point.
// An empty diff is the pass. The artifact registers through `jsoo_create_file`
// when a runtime is up and queues on `jsoo_fs_tmp` when not -- defining the
// former makes it take the path that can be captured.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'packages', 'ocaml');
const artifact = join(packageRoot, 'assets', 'compiler', 'stdlib.js');

const captured = [];
globalThis.jsoo_create_file = (name, content) => captured.push({ name, content });
delete globalThis.jsoo_fs_tmp;
vm.runInThisContext(readFileSync(artifact, 'utf8'), { filename: artifact });

if (captured.length === 0) {
	throw new Error(`${artifact} registered no files`);
}

const lines = captured.map(({ name, content }) => {
	const bytes = Buffer.alloc(content.length);
	for (let i = 0; i < content.length; i++) bytes[i] = content.charCodeAt(i) & 0xff;
	const hash = createHash('sha256').update(bytes).digest('hex');
	return { name: name.replace(/^\/stdlib\//, ''), hash };
});

lines.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
for (const { hash, name } of lines) {
	console.log(`${hash}  ${name}`);
}
console.error(`${lines.length} files`);
