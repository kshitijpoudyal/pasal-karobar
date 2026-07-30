import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, "../public/icons");

await mkdir(outDir, { recursive: true });

async function makeIcon(size) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.12)}" fill="#022448"/>
    <rect x="${size * 0.18}" y="${size * 0.18}" width="${size * 0.64}" height="${size * 0.64}" rx="${Math.round(size * 0.08)}" fill="#1e3a5f"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.14}" fill="#a0f1ed"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

for (const size of [192, 512]) {
  const buf = await makeIcon(size);
  await sharp(buf).toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`Wrote public/icons/icon-${size}.png`);
}
