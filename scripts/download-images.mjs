import { createClient } from '@libsql/client';
import { createWriteStream, existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';

const c = createClient({ url: 'file:./dev.db' });
const PUBLIC_DIR = './public/cars';

await mkdir(PUBLIC_DIR, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (existsSync(dest)) { resolve(dest); return; }
    const proto = url.startsWith('https') ? https : http;
    const file = createWriteStream(dest);
    const req = proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.moteur.ma/'
      }
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    });
    req.on('error', err => { file.close(); reject(err); });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

const rows = await c.execute('SELECT id, url FROM listing_images');

for (const row of rows.rows) {
  const url = row.url;
  const ext = path.extname(url.split('?')[0]) || '.jpg';
  const filename = row.id + ext;
  const dest = path.join(PUBLIC_DIR, filename);
  const localUrl = `/cars/${filename}`;

  try {
    await download(url, dest);
    await c.execute({
      sql: 'UPDATE listing_images SET url=? WHERE id=?',
      args: [localUrl, row.id]
    });
    console.log('✅', filename);
  } catch (e) {
    console.log('❌', filename, e.message);
  }
}

console.log('\nDone! All images downloaded.');
