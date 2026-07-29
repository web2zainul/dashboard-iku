const fs = require('fs');
const path = require('path');

const b64 = fs.readFileSync('C:/renja/dashboard-iku/b64.txt', 'utf8').trim();
const pairs = b64.split('\n');
for (const pair of pairs) {
  const [rel, encoded] = pair.split('|||');
  if (!rel || !encoded) continue;
  const content = Buffer.from(encoded, 'base64').toString('utf8');
  const full = path.join('C:/renja/dashboard-iku', rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('OK:', rel);
}
console.log('All done!');