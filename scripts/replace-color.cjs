const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const targetDir = path.join(root, 'src');

const replacements = [
  { from: /#dd2727/gi, to: '#bf0603' },
  { from: /rgba\(\s*221\s*,\s*39\s*,\s*39/gi, to: 'rgba(191, 6, 3' },
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      walk(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      const allowExt = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.json', '.md'];
      if (!allowExt.includes(ext)) continue;
      try {
        let content = fs.readFileSync(full, 'utf8');
        let updated = content;
        for (const r of replacements) {
          updated = updated.replace(r.from, r.to);
        }
        if (updated !== content) {
          fs.writeFileSync(full, updated, 'utf8');
          console.log('Updated:', full);
        }
      } catch (err) {
        console.error('Failed:', full, err.message);
      }
    }
  }
}

console.log('Starting replacements under', targetDir);
walk(targetDir);
console.log('Done');
