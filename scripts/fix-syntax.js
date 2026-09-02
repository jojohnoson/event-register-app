const fs = require('fs');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');
  // Replace sql\ with sql`
  text = text.replace(/sql\\/g, 'sql`');
  // Fix closing backticks or unclosed queries
  // Let's inspect where SQL template strings were written
  fs.writeFileSync(filePath, text, 'utf8');
  console.log(`Cleaned: ${filePath}`);
}

fixFile('lib/db.ts');
fixFile('app/api/events/[slug]/route.ts');
fixFile('app/api/admin/events/route.ts');
fixFile('app/api/admin/events/[id]/route.ts');
fixFile('app/api/registrations/create/route.ts');
fixFile('app/api/registrations/lookup/route.ts');