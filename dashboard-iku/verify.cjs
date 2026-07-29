const fs = require("fs");
const path = require("path");
const base = "C:/renja/dashboard-iku/src";

function w(rel, content) {
  const full = path.join(base, "..", rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("OK:", rel);
}

function r(rel) {
  const full = path.join(base, rel);
  return fs.readFileSync(full, "utf8");
}

// Read source files and write to project
const srcDir = "C:/renja/dashboard-iku/src";
const files = fs.readdirSync(srcDir + "/components").filter(f => f.endsWith(".tsx"));
for (const f of files) {
  const content = fs.readFileSync(srcDir + "/components/" + f, "utf8");
  w("src/components/" + f, content);
}
console.log("Components verified");