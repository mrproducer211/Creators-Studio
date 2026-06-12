const fs = require("fs");
const path = require("path");

function findFiles(dir) {
  let r = [];
  const e = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of e) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) r = r.concat(findFiles(p));
    else if (f.name.endsWith(".tsx") || f.name.endsWith(".ts")) r.push(p);
  }
  return r;
}

const files = findFiles("src");
let total = 0;

for (const f of files) {
  const c = fs.readFileSync(f, "utf8");
  const matches = c.match(/\/images\/[^"'`\s]+\.png/g);
  if (matches) {
    console.log(path.relative("src", f), "→", matches.join(", "));
    total += matches.length;
  }
}

console.log("\nTotal remaining .png refs:", total);
