const fs = require('fs');
const { execSync } = require('child_process');
const css = fs.readFileSync('src/styles.css', 'utf8');
const regex = /\.([a-zA-Z0-9_-]+)/g;
const names = new Set();
let m;
while ((m = regex.exec(css)) !== null) names.add(m[1]);
const classes = Array.from(names).sort();
const res = [];
classes.forEach((c) => {
  try {
    const out = execSync(`grep -RIn -- "\\b${c}\\b" src public index.html || true`, { encoding: 'utf8' });
    const lines = out.trim() ? out.trim().split('\n') : [];
    res.push({ class: c, count: lines.length, lines });
  } catch (e) {
    res.push({ class: c, count: 0, lines: [] });
  }
});
const unused = res.filter(r => r.count === 0).map(r => r.class);
console.log(JSON.stringify({ total: classes.length, unusedCount: unused.length, unused, details: res }, null, 2));
