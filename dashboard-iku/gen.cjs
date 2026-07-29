const fs = require('fs');
const path = require('path');

function writeFile(rel, content) {
  const full = path.join('C:\\renja\\dashboard-iku', rel);
  const dir = path.dirname(full);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('OK:', rel);
}

// Load all file contents from a JSON-like structure
const files = JSON.parse(fs.readFileSync(path.join(__dirname, 'files.json'), 'utf8'));
for (const [rel, content] of Object.entries(files)) {
  writeFile(rel, content);
}
console.log('All files written!');