const fs=require('fs');

const nav=fs.readFileSync('templates/docs-nav.html','utf8');
const script=fs.readFileSync('content/assets/js/script.js','utf8');
const style=fs.readFileSync('content/assets/css/style.css','utf8');
const tracked=JSON.parse(fs.readFileSync('.nift/tracked.json','utf8')).tracked;
const groups=[...nav.matchAll(/data-docs-group/g)];
const routes=[...nav.matchAll(/@pathto\('([^']+)'\)/g)].map(match=>match[1]);
const expected=tracked.map(item=>item.name).filter(name=>name==='docs'||name.startsWith('docs/'));

if(groups.length!==5)throw new Error(`expected 5 documentation groups, found ${groups.length}`);
if(new Set(routes).size!==routes.length)throw new Error('documentation navigation contains duplicate routes');
for(const route of expected)if(!routes.includes(route))throw new Error(`documentation navigation omits ${route}`);
for(const route of routes)if(!expected.includes(route))throw new Error(`documentation navigation points at unknown route ${route}`);
for(const contract of ['aria-current','activeGroup','group===activeGroup','aria-expanded','links.hidden=!open']){
  if(!script.includes(contract))throw new Error(`page-aware navigation contract missing ${contract}`);
}
if(!/\.docs-nav-links\[hidden\]\s*\{display:none\}/.test(style))throw new Error('collapsed documentation groups are not hidden by author CSS');
console.log(`cortex docs navigation smoke: ${groups.length} groups, ${routes.length} routes`);
