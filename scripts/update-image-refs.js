/**
 * update-image-refs.js
 * Updates all /images/*.png references to /images/*.webp in .tsx/.ts source files
 */
const fs   = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "../src");

function findFiles(dir, exts) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) results = results.concat(findFiles(full, exts));
    else if (exts.some(ext => e.name.endsWith(ext))) results.push(full);
  }
  return results;
}

const files = findFiles(SRC_DIR, [".tsx", ".ts"]);
let updated = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const replaced = original.replace(/\/images\/([^"'`\s]+)\.png/g, "/images/$1.webp");
  if (replaced !== original) {
    fs.writeFileSync(file, replaced, "utf8");
    console.log(`✅ Updated: ${path.relative(SRC_DIR, file)}`);
    updated++;
  }
}

console.log(`\nDone — updated ${updated} file(s).`);
