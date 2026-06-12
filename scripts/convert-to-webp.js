/**
 * convert-to-webp.js
 * Converts all PNG images in public/images to WebP format.
 * Originals are kept alongside the new .webp files.
 * Run: node scripts/convert-to-webp.js
 */

const sharp = require("sharp");
const path  = require("path");
const fs    = require("fs");

const INPUT_DIR = path.resolve(__dirname, "../public/images");

// Recursively find all .png files
function findPngs(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findPngs(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      results.push(fullPath);
    }
  }
  return results;
}

async function convert() {
  const pngs = findPngs(INPUT_DIR);
  console.log(`\nFound ${pngs.length} PNG files to convert.\n`);

  let saved = 0;
  let totalOriginalBytes = 0;
  let totalWebpBytes = 0;

  for (const src of pngs) {
    const dest = src.replace(/\.png$/i, ".webp");
    try {
      const originalSize = fs.statSync(src).size;
      await sharp(src)
        .webp({ quality: 82, effort: 4 })
        .toFile(dest);
      const webpSize = fs.statSync(dest).size;
      const reduction = (((originalSize - webpSize) / originalSize) * 100).toFixed(1);
      totalOriginalBytes += originalSize;
      totalWebpBytes     += webpSize;
      saved++;
      console.log(
        `✅ ${path.relative(INPUT_DIR, src).padEnd(50)} ${(originalSize / 1024).toFixed(0).padStart(6)} KB → ${(webpSize / 1024).toFixed(0).padStart(6)} KB  (${reduction}% smaller)`
      );
    } catch (err) {
      console.error(`❌ Failed: ${src} — ${err.message}`);
    }
  }

  console.log(`\n${"─".repeat(80)}`);
  console.log(`Converted : ${saved} / ${pngs.length} files`);
  console.log(`Before    : ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`After     : ${(totalWebpBytes     / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved     : ${((totalOriginalBytes - totalWebpBytes) / 1024 / 1024).toFixed(2)} MB  (${(((totalOriginalBytes - totalWebpBytes) / totalOriginalBytes) * 100).toFixed(1)}%)`);
  console.log(`\nOriginal .png files are kept alongside the new .webp files.`);
  console.log(`Once you verify everything looks good, delete the .png files or run cleanup.\n`);
}

convert().catch(console.error);
