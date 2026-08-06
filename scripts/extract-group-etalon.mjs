import fs from 'fs';

const raw = fs.readFileSync('local/group-etalon-raw.html', 'utf8');

// Find the big embedded document (starts with DOCTYPE after nominify)
const start = raw.indexOf('<!-- nominify begin --> <!DOCTYPE html>');
const end = raw.lastIndexOf('<!-- nominify end -->');
if (start < 0 || end < 0) {
  console.error('block not found', start, end);
  process.exit(1);
}
const inner = raw.slice(start + '<!-- nominify begin --> '.length, end).trim();
fs.writeFileSync('local/group-etalon-doc.html', inner);
console.log('doc bytes', inner.length);

// Extract style
const styleMatch = inner.match(/<style>([\s\S]*?)<\/style>/);
const style = styleMatch ? styleMatch[1] : '';
fs.writeFileSync('local/group-etalon.css', style);
console.log('css bytes', style.length);

// Extract body inner
const bodyMatch = inner.match(/<body[^>]*>([\s\S]*)<\/body>/i);
const body = bodyMatch ? bodyMatch[1].trim() : '';
fs.writeFileSync('local/group-etalon-body.html', body);
console.log('body bytes', body.length);

// Extract scripts inside body (keep fade-in etc)
const scripts = [...body.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((x) => x[1]);
console.log('inline scripts', scripts.length, scripts.reduce((a, b) => a + b.length, 0));
