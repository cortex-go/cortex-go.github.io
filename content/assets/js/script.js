document.documentElement.classList.add('js');

function cortexCopyText(el){
  let text=(el.dataset.copyText||el.textContent||'').trim();
  text=text.replace(/^\$\s+/,'');
  return text;
}
document.addEventListener('DOMContentLoaded',()=>{
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
