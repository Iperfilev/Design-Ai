import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { courseContent } from '../src/content.js';
import { pageMarkup } from '../src/render.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const template = await readFile(path.join(root, 'src/page-template.html'), 'utf8');
const html = template.replace('<!-- PAGE_CONTENT -->', pageMarkup(courseContent));
await writeFile(path.join(root, 'index.html'), html);
const dist = path.join(root, 'dist');
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'index.html'), path.join(dist, 'index.html'));
for (const folder of ['assets', 'styles', 'src']) await cp(path.join(root, folder), path.join(dist, folder), { recursive: true });
console.log('Built index.html and dist/: complete static content, original links, local decorative assets.');
