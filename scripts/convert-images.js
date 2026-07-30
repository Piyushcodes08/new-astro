#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Top images to process (project-root relative)
const TOP_IMAGES = [
  'src/assets/images/pages/about/Aboutus-pg.webp',
  'src/assets/images/sections/horoscope/new_wheel_s5ozry.png',
  'src/assets/images/sections/hero/hero-absolute.png',
  'src/assets/images/pages/courses/paidcoursepg.webp',
  'src/assets/images/sections/about/what-we-do-hp.webp',
  'src/assets/images/pages/consulting/consulting.webp',
  'src/assets/images/pages/courses/foundation.webp',
  'src/assets/images/pages/about/About-us-hp.webp',
];

const widths = [640, 960, 1440];

const quality = {
  avif: 50,
  webp: 70,
};

const ensureDir = (p) => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

async function processImage(inputRel) {
  const input = path.resolve(process.cwd(), inputRel);
  if (!fs.existsSync(input)) {
    console.warn('Missing source image:', inputRel);
    return;
  }

  const parsed = path.parse(input);
  const baseName = parsed.name.replace(/\s+/g, '-');
  const outDir = parsed.dir; // keep in same folder

  for (const w of widths) {
    const outAvif = path.join(outDir, `${baseName}-${w}.avif`);
    const outWebp = path.join(outDir, `${baseName}-${w}.webp`);

    try {
      await sharp(input)
        .resize({ width: w })
        .avif({ quality: quality.avif })
        .toFile(outAvif);
      console.log('Written', path.relative(process.cwd(), outAvif));
    } catch (e) {
      console.error('Failed to write avif for', inputRel, e.message);
    }

    try {
      await sharp(input)
        .resize({ width: w })
        .webp({ quality: quality.webp })
        .toFile(outWebp);
      console.log('Written', path.relative(process.cwd(), outWebp));
    } catch (e) {
      console.error('Failed to write webp for', inputRel, e.message);
    }
  }

  // Also create an optimized full-width webp for fallback (no resize)
  const outFullWebp = path.join(outDir, `${baseName}-orig-optimized.webp`);
  try {
    await sharp(input)
      .webp({ quality: quality.webp })
      .toFile(outFullWebp);
    console.log('Written', path.relative(process.cwd(), outFullWebp));
  } catch (e) {
    console.error('Failed to write optimized webp for', inputRel, e.message);
  }
}

async function main() {
  const toProcess = TOP_IMAGES;
  console.log(`Processing ${toProcess.length} images...`);
  for (const rel of toProcess) {
    // ensure directory exists
    const abs = path.resolve(process.cwd(), rel);
    if (!fs.existsSync(abs)) {
      console.warn('Source not found:', rel);
      continue;
    }
    await processImage(rel);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
