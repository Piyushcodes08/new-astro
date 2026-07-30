#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const folder = path.resolve(process.cwd(), 'src/assets/images/pages/consulting');

async function main() {
  if (!fs.existsSync(folder)) {
    console.error('Folder missing:', folder);
    process.exit(1);
  }

  const files = fs.readdirSync(folder).filter(f => f.endsWith('.webp'));
  for (const file of files) {
    const full = path.join(folder, file);
    const base = path.parse(file).name; // e.g., personalized-guidance-640
    const avifName = `${base}.avif`;
    const avifPath = path.join(folder, avifName);
    if (fs.existsSync(avifPath)) continue;

    try {
      await sharp(full).avif({ quality: 50 }).toFile(avifPath);
      console.log('Created', avifPath);
    } catch (e) {
      console.error('Failed', full, e.message);
    }
  }
  console.log('Done');
}

main().catch(e => { console.error(e); process.exit(1); });
