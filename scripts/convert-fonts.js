#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import ttf2woff2 from 'ttf2woff2';

const fonts = [
  'src/assets/fonts/Poppins/Poppins-Medium.ttf',
  'src/assets/fonts/Poppins/Poppins-Regular.ttf',
  'src/assets/fonts/Poppins/Poppins-SemiBold.ttf',
];

for (const f of fonts) {
  const abs = path.resolve(process.cwd(), f);
  if (!fs.existsSync(abs)) {
    console.warn('Missing font:', f);
    continue;
  }
  const out = abs.replace(/\.ttf$/, '.woff2');
  try {
    const buf = fs.readFileSync(abs);
    const woff2 = ttf2woff2(buf);
    fs.writeFileSync(out, woff2);
    console.log('Created', out);
  } catch (e) {
    console.error('Failed to convert', f, e.message);
  }
}

console.log('Font conversion done');
