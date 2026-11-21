// Leonida Platinum v3 — tiny static server for app/ (Node 22, standard library only).
// Run `node serve.ts` and open http://localhost:8080 (or `--port <n>` for another
// port, `HOST=0.0.0.0 node serve.ts` to listen beyond localhost). It serves only
// files under app/, with the MIME types a browser needs, and refuses any path that
// escapes the folder. A development convenience, not a server for the internet —
// the guide itself needs no server at all beyond static files.
// Every request is logged on one line (method, path, status, bytes) so a missing
// data file or a bad asset shows up immediately instead of failing silently.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;
const host = process.env.HOST && process.env.HOST.trim() ? process.env.HOST.trim() : '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function logLine(method, pathname, status, bytes) {
  const stamp = new Date().toISOString().slice(11, 19);
  console.log(`${stamp} ${method} ${pathname} -> ${status} (${bytes} B)`);
}

createServer((request, response) => {
  const method = request.method ?? 'GET';
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('bad request');
    logLine(method, url.pathname, 400, 0);
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(pathname)));
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end('forbidden');
    logLine(method, pathname, 403, 0);
    return;
  }
  let size;
  try {
    const stats = statSync(file);
    if (!stats.isFile()) throw new Error('not a file');
    size = stats.size;
  } catch {
    response.writeHead(404).end('not found');
    logLine(method, pathname, 404, 0);
    return;
  }
  response.writeHead(200, {
    'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
  });
  if (method === 'HEAD') {
    response.end();
    logLine(method, pathname, 200, size);
    return;
  }
  logLine(method, pathname, 200, size);
  createReadStream(file).pipe(response);
}).listen(port, host, () => {
  console.log(`Leonida Platinum v3 is on http://${host}:${port}`);
});
