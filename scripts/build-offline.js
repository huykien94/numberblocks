import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Run after Vite: precache the actual fingerprinted assets, not guessed filenames.
async function filesIn(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const lists = await Promise.all(entries.map(entry => entry.isDirectory()
    ? filesIn(`${directory}/${entry.name}`) : `${directory}/${entry.name}`));
  return lists.flat().sort();
}
const files = (await filesIn('dist')).filter(file => !file.endsWith('/sw.js'));
const hash = createHash('sha256');
for (const file of files) { hash.update(file); hash.update(await readFile(file)); }
const version = hash.digest('hex').slice(0, 16);
const paths = files.map(file => file.slice('dist/'.length));
await writeFile('dist/sw.js', `
const CACHE = 'numberblocks-${version}';
const ROOT = new URL('./', self.location.href);
const ASSETS = ${JSON.stringify(paths)}.map(path => new URL(path, ROOT).href);
const INDEX = new URL('index.html', ROOT).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('numberblocks-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isEntry = event.request.mode === 'navigate' &&
    (url.pathname === ROOT.pathname || url.pathname === new URL('index.html', ROOT).pathname);
  const key = isEntry ? INDEX : url.href;
  if (!ASSETS.includes(key)) return;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(key)) || fetch(event.request)));
});
`);
console.log(`Offline cache generated for ${paths.length} assets (${version}).`);
