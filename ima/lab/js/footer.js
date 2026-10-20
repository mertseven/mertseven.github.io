(()=>{
 const site=document.getElementById('island-premise-library');
 const footer=document.getElementById('island-footer-full-width');
 footer.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-back')){window.IslandScroll.to(site);return;}
  const section=button.dataset.footerSection;if(!section)return;
  const current=site.querySelector('[data-module][aria-current="page"]');
  const index=Number(current?.dataset.module)||0;
  site.querySelector('[data-open-chapter="'+index+'"]').click();
  site.querySelector('[data-tab="'+section+'"]').click();
  window.IslandScroll.to(site.querySelector('[data-tabs]'));
 });
})();
