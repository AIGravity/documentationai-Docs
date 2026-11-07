import {compile} from '@mdx-js/mdx'; import gfm from 'remark-gfm'; import fs from 'fs'; import path from 'path';
const root = process.argv[2]; const nav = JSON.parse(fs.readFileSync(path.join(root,'documentation.json'),'utf8'));
const paths = []; JSON.stringify(nav, (k,v)=>{ if(k==='path') paths.push(v); return v; });
let bad = 0;
for (const p of paths) { const f = path.join(root, p + '.mdx');
  if (!fs.existsSync(f)) { console.log('MISSING', p); bad++; continue; }
  const src = fs.readFileSync(f,'utf8').replace(/^---[\s\S]*?---/, '');
  try { await compile(src, {remarkPlugins:[gfm]}); } catch (e) { console.log('FAIL', p, e.message); bad++; } }
const links = []; for (const p of paths) { const s = fs.readFileSync(path.join(root,p+'.mdx'),'utf8'); for (const m of s.matchAll(/(?:href="|\]\()\/([a-z0-9\/-]+)/g)) if (!paths.includes(m[1])) links.push(p+' -> '+m[1]); }
console.log(paths.length, 'pages,', bad, 'problems; broken links:', links.length ? links : 'none');
const all = fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.mdx')).map(f=>f.split(path.sep).join('/').replace(/\.mdx$/,''));
const orphans = all.filter(f=>!paths.includes(f)); console.log('mdx not in nav:', orphans);
if (bad || links.length || orphans.length) process.exit(1);
