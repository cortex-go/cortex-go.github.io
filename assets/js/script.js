document.documentElement.classList.add('js');

function cortexCopyText(el){
  let text=(el.dataset.copyText||el.textContent||'').trim();
  text=text.replace(/^$\s+/,'');
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
function cortexInitMobileMenu(){
  const toggle=document.querySelector('[data-menu-toggle]');
  const menu=document.getElementById('mobile-menu');
  const docsToggle=document.querySelector('[data-docs-menu-toggle]');
  const docsMenu=document.getElementById('docs-mobile-nav');
  const setMenu=(panel,btn,open)=>{
    panel.classList.toggle('open',open);
    panel.toggleAttribute('hidden',!open);
    btn.setAttribute('aria-expanded',String(open));
    btn.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  };
  if(toggle&&menu){
    toggle.addEventListener('click',()=>{
      const open=!menu.classList.contains('open');
      if(open&&docsMenu&&docsMenu.classList.contains('open'))setMenu(docsMenu,docsToggle,false);
      setMenu(menu,toggle,open);
      document.body.style.overflow=open?'hidden':'';
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{setMenu(menu,toggle,false);document.body.style.overflow=''}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){setMenu(menu,toggle,false);document.body.style.overflow='';toggle.focus()}});
  }
  if(docsToggle&&docsMenu){
    docsToggle.addEventListener('click',()=>{
      const open=!docsMenu.classList.contains('open');
      if(open&&menu&&menu.classList.contains('open')){setMenu(menu,toggle,false);document.body.style.overflow=''}
      setMenu(docsMenu,docsToggle,open);
    });
    docsMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(docsMenu,docsToggle,false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&docsMenu.classList.contains('open')){setMenu(docsMenu,docsToggle,false);docsToggle.focus()}});
  }
  const source=document.querySelector('.docs-nav');
  const target=document.querySelector('[data-docs-mobile-nav]');
  if(source&&target){
    source.querySelectorAll('[data-docs-group]').forEach(group=>{
      const heading=group.querySelector('.docs-nav-toggle span')?.textContent||'';
      const links=[...group.querySelectorAll('.docs-nav-links a')].map(a=>a.outerHTML).join('');
      if(heading)target.insertAdjacentHTML('beforeend',`<p class="mobile-docs-heading">${heading}</p>${links}`);
    });
  }
}
document.addEventListener('DOMContentLoaded',()=>{
  cortexInitDocsNav();
  cortexInitMobileMenu();
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
