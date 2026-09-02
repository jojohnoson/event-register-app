const fs = require('fs');
const code = fs.readFileSync('lib/db.ts', 'utf8');
const lines = code.split('\n');
for (let i = 32; i < 45; i++) {
  console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
}