document.documentElement.classList.add('js');

function cortexCopyText(el){
  let text=(el.dataset.copyText||el.textContent||'').trim();
  text=text.replace(/^\$\s+/,'');
  return text;
}

function cortexNormaliseDocsPath(value){
  let path;
  try{path=decodeURIComponent(new URL(value,location.href).pathname)}
  catch{path=String(value)}
  return path.replace(/\/index\.html$/,'').replace(/\.html$/,'').replace(/\/$/,'')||'/';
}

function cortexInitDocsNav(){
  const groups=[...document.querySelectorAll('[data-docs-group]')];
  if(!groups.length)return;
  const currentPath=cortexNormaliseDocsPath(location.href);
  const setOpen=(group,open)=>{
    const toggle=group.querySelector('.docs-nav-toggle');
    const links=group.querySelector('.docs-nav-links');
    toggle.setAttribute('aria-expanded',String(open));
    links.hidden=!open;
  };
  let activeGroup=null;
  document.querySelectorAll('.docs-nav a').forEach(link=>{
    const active=cortexNormaliseDocsPath(link.href)===currentPath;
    link.classList.toggle('active',active);
    if(active){link.setAttribute('aria-current','page');activeGroup=link.closest('[data-docs-group]')}
  });
  groups.forEach(group=>{
    setOpen(group,group===activeGroup);
    group.querySelector('.docs-nav-toggle').addEventListener('click',()=>{
      setOpen(group,group.querySelector('.docs-nav-toggle').getAttribute('aria-expanded')!=='true');
    });
  });
}
document.addEventListener('DOMContentLoaded',()=>{
  cortexInitDocsNav();
  const targets=[...document.querySelectorAll('.docs article pre, .code-card, .install-card')];
  for(const box of targets){
    if(box.querySelector('.copy-code'))continue;
    const source=box.querySelector('code,.code-line,.terminal-code')||box;
    const button=document.createElement('button');
    button.type='button';button.className='copy-code';button.textContent='Copy';
    button.addEventListener('click',async()=>{
      try{
        await navigator.clipboard.writeText(cortexCopyText(source));
        button.textContent='Copied';
        setTimeout(()=>button.textContent='Copy',1200);
      }catch{
        button.textContent='Failed';
        setTimeout(()=>button.textContent='Copy',1200);
      }
    });
    box.append(button);
  }
});
