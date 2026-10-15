import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const option = (key, fallback) => args[args.indexOf(key) + 1] && args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const port = Number(option('--port', '4173'));
const host = option('--host', '127.0.0.1');
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://preview.local').pathname);
    const filename = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!filename.startsWith(root)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(filename);
    res.writeHead(200, { 'Content-Type': types[path.extname(filename)] ?? 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 400);
    res.end('Page not found');
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`Local preview: http://${host}:${port}/`));
