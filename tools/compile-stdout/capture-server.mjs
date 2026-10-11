// A static server for the repository root that also accepts POST /save.
//
// For diagnosing the browser: the only way to compare what a browser produced
// with what the same pipeline produces outside one is to get the bytes out of
// the page, and a page cannot write files.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.json': 'application/json',
	'.txt': 'text/plain',
	'.cmi': 'application/octet-stream',
	'.cma': 'application/octet-stream',
	'.cmo': 'application/octet-stream'
};

createServer((req, res) => {
	if (req.method === 'POST' && req.url === '/save') {
		const chunks = [];
		req.on('data', (chunk) => chunks.push(chunk));
		req.on('end', () => {
			const body = Buffer.concat(chunks);
			writeFileSync(join(root, 'saved-bundle.js'), body);
			console.log(`saved ${body.length} bytes`);
			res.writeHead(200).end('saved');
		});
		return;
	}

	const path = resolve(root, decodeURIComponent((req.url ?? '/').split('?')[0]).replace(/^\/+/, ''));
	if (!path.startsWith(root) || !existsSync(path) || !statSync(path).isFile()) {
		res.writeHead(404).end('not found');
		return;
	}
	res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
	res.end(readFileSync(path));
}).listen(8080, () => console.log(`serving ${root} on 8080`));
