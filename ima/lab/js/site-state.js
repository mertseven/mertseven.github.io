// Browser-local navigation and saved learning choices. No account or server database.
window.IslandState=(()=>{
  const key='interaction-island-library-v1';
  function get(){let state={};try{state=JSON.parse(localStorage.getItem(key))||{};}catch{}
    const params=new URLSearchParams(location.hash.slice(1));
    if(params.has('premise'))return {...state,direction:'character-library-premises',view:'lesson',premiseId:params.get('premise'),section:params.get('section')||'lesson'};
    return {...state,direction:'character-library-premises',view:'home'};
  }
  async function save(snapshot){const next={...snapshot.modelContent,privateContent:snapshot.privateContent};try{localStorage.setItem(key,JSON.stringify(next));}catch{}
    const hash=next.view==='home'?'#home':'#premise='+next.premiseId+'&section='+next.section;
    if(location.hash!==hash)history.pushState(null,'',hash);
  }
  addEventListener('popstate',()=>dispatchEvent(new CustomEvent('island:restore',{detail:{globals:{widgetState:get()}}})));
  return {get,save};
})();

// Sayfa değişimi anında; sayfa içi yönlendirme hareket tercihine göre yumuşaktır.
window.IslandScroll = {
  to(element, {instant = false} = {}) {
    if (!element) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({block:'start', behavior:instant || reduced ? 'instant' : 'smooth'});
  }
};
