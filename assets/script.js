// assets/script.js
/* Main script - handles configurations + basic localStorage events */
(function(){
  const KEY = 'agroscan_data';
  const CFGKEY = 'agroscan_cfg';

  function money(v){ return 'R$ ' + Number(v||0).toFixed(2); }

  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){return {}; } }
  function save(db){ localStorage.setItem(KEY, JSON.stringify(db)); }

  (function applyCfg(){
    try {
      const cfg = JSON.parse(localStorage.getItem(CFGKEY) || '{}');
      if (cfg.color) document.documentElement.style.setProperty('--card', cfg.color);
      if (cfg.name) document.querySelectorAll('header h1').forEach(h=> h.textContent = cfg.name);
      if (cfg.fontSize) document.body.style.fontSize = cfg.fontSize;
      if (cfg.modo === 'escuro') document.body.classList.add('dark');
      else document.body.classList.remove('dark');
      if (cfg.lang && window.__applyLang) window.__applyLang(cfg.lang);
    } catch(e){}
  })();

  const saveBtn = document.getElementById('btnSaveConfig');
  if (saveBtn){
    saveBtn.addEventListener('click', ()=>{
      const color = document.getElementById('themeColor')?.value || '#00d398';
      const name = document.getElementById('panelName')?.value || 'AgroScan Hub';
      const modo = document.getElementById('darkMode')?.value || 'auto';
      const lang = document.getElementById('lang')?.value || 'pt-BR';
      const fontSize = document.getElementById('fontSize')?.value || '16px';

      const cfg = { color, name, modo, lang, fontSize };
      localStorage.setItem(CFGKEY, JSON.stringify(cfg));

      document.documentElement.style.setProperty('--card', color);
      document.querySelectorAll('header h1').forEach(h=> h.textContent = name);
      document.body.style.fontSize = fontSize;
      if (modo === 'on' || modo === 'escuro') document.body.classList.add('dark');
      else if (modo === 'off' || modo === 'claro') document.body.classList.remove('dark');

      if (window.__applyLang) window.__applyLang(lang);

      alert((window.__t && window.__t.sucesso) ? window.__t.sucesso : 'Configurações salvas');
    });
  }

  window.addEventListener('storage', (e)=>{
    if (e.key === CFGKEY){
      try{ const cfg = JSON.parse(e.newValue || '{}'); 
        if (cfg.color) document.documentElement.style.setProperty('--card', cfg.color);
        if (cfg.name) document.querySelectorAll('header h1').forEach(h=> h.textContent = cfg.name);
        if (cfg.fontSize) document.body.style.fontSize = cfg.fontSize;
        if (cfg.lang && window.__applyLang) window.__applyLang(cfg.lang);
      }catch{}
    }
  });

  window.agro_helpers = { load, save, money };

})();
