/* AgroScan Hub — main JS (localStorage-based, offline) */
(function(){
  const KEY = 'agroscan_data';
  const SELECTED = 'agroscan_selected';

  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){return {}; } }
  function save(db){ localStorage.setItem(KEY, JSON.stringify(db)); }
  function money(v){ return 'R$ ' + Number(v||0).toFixed(2); }

  /* ---------- INDEX (form) ---------- */
  const form = document.getElementById('formEmprestimo');
  if (form){
    const dataInput = document.getElementById('data');
    dataInput.value = dataInput.value || new Date().toISOString().split('T')[0];

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const cliente = document.getElementById('cliente').value.trim();
      const valor = parseFloat(document.getElementById('valor').value);
      const juros = parseFloat(document.getElementById('juros').value);
      const prazo = parseInt(document.getElementById('prazo').value,10);
      const tipo = document.getElementById('tipo').value;
      const data = document.getElementById('data').value || new Date().toISOString().split('T')[0];

      if (!cliente || isNaN(valor) || isNaN(juros) || isNaN(prazo)){ 
        alert('Preencha corretamente'); 
        return; 
      }

      const db = load();
      if (!db[cliente]) db[cliente]=[];

      let total = tipo === 'simples' 
        ? (valor + (valor*(juros/100)*prazo)) 
        : Number((valor * Math.pow(1 + juros/100, prazo)).toFixed(2));

      db[cliente].push({ valor, juros, prazo, tipo, data, total });
      save(db);
      
      alert('Empréstimo salvo ✅');
      form.reset();
      dataInput.value = new Date().toISOString().split('T')[0];
      updateStats();

      // ✅ Notifica outras páginas (como emprestimos.html) para atualizar lista
      window.dispatchEvent(new Event('storage'));
    });

    document.getElementById('btnLimpar')?.addEventListener('click', ()=>{
      form.reset();
      dataInput.value = new Date().toISOString().split('T')[0];
    });
  }

  /* ---------- STATS ---------- */
  function updateStats(){
    const db = load();
    const clientes = Object.keys(db);
    let soma=0, jurosTot=0;
    clientes.forEach(c => {
      db[c].forEach(r => {
        soma += Number(r.valor||0);
        jurosTot += Number((r.total||0) - (r.valor||0));
      });
    });
    document.getElementById('statClientes')?.textContent = clientes.length;
    document.getElementById('statTotal')?.textContent = money(soma);
    document.getElementById('statJuros')?.textContent = money(jurosTot);
  }
  updateStats();

  /* ---------- EMPRESTIMOS PAGE ---------- */
  (function emprestimosPage(){
    const lista = document.getElementById('lista');
    if (!lista) return;
    const buscar = document.getElementById('buscar');
    const ordenarBtn = document.getElementById('ordenar');
    const exportCSV = document.getElementById('exportCSV');
    const exportPDF = document.getElementById('exportPDF');

    function render(filter='', desc=true){
      const db = load();
      const items = Object.keys(db).map(c=>{
        const regs = db[c];
        const total = regs.reduce((s,r)=>s + Number(r.total||0),0);
        const last = regs[regs.length-1]?.data || '';
        return { cliente:c, total, last };
      });
      let arr = items;
      if (filter) arr = arr.filter(i => i.cliente.toLowerCase().includes(filter.toLowerCase()));
      arr.sort((a,b) => desc ? b.total - a.total : a.total - b.total);
      lista.innerHTML = arr.map(it => `
        <div class="card">
          <div class="plus">•</div>
          <h3>${it.cliente}</h3>
          <p><strong>Total:</strong> ${money(it.total)}</p>
          <p><strong>Último:</strong> ${it.last}</p>
          <div class="actions">
            <button class="btn small" onclick="ag_open('${encodeURIComponent(it.cliente)}')">Abrir</button>
            <button class="btn ghost small" onclick="ag_edit('${encodeURIComponent(it.cliente)}')">Editar</button>
            <button class="btn small" style="background:#ff6b6b" onclick="ag_delete('${encodeURIComponent(it.cliente)}')">Excluir</button>
          </div>
        </div>
      `).join('');
    }

    render();

    buscar?.addEventListener('input', ()=> render(buscar.value));
    ordenarBtn?.addEventListener('click', ()=>{
      const txt = ordenarBtn.textContent || '';
      const desc = txt.includes('↓');
      ordenarBtn.textContent = desc ? 'Ordenar ↑' : 'Ordenar ↓';
      render(buscar.value, !desc);
    });

    // ✅ Atualiza automaticamente quando localStorage muda (ao salvar novo empréstimo)
    window.addEventListener('storage', ()=> render(buscar.value));

    exportCSV?.addEventListener('click', exportCSVAll);
    exportPDF?.addEventListener('click', exportPDFAll);
  })();

  /* ---------- REGISTRO DETALHADO ---------- */
  (function detalhePage(){
    const cont = document.getElementById('detalhes');
    if (!cont) return;
    const cliente = localStorage.getItem(SELECTED) || '';
    document.getElementById('tituloDetalhado').textContent = 'Registro Detalhado — ' + (cliente || '(selecione na lista)');
    function render(){
      const db = load();
      const lista = db[cliente] || [];
      if (!lista.length){
        cont.innerHTML = '<p class="hint">Nenhum registro para esse cliente.</p><button class="btn" id="addReg">Adicionar empréstimo</button>';
        document.getElementById('addReg').addEventListener('click', ()=> addRegistro(cliente));
        return;
      }
      cont.innerHTML = '<table><thead><tr><th>Data</th><th>Valor</th><th>Juros</th><th>Prazo</th><th>Tipo</th><th>Total</th><th>Ações</th></tr></thead><tbody>' +
        lista.map((r,i)=>`<tr>
          <td><input type="date" value="${r.data}" onchange="ag_update('${encodeURIComponent(cliente)}',${i},'data',this.value)"/></td>
          <td><input type="number" value="${r.valor}" onchange="ag_update('${encodeURIComponent(cliente)}',${i},'valor',parseFloat(this.value))"/></td>
          <td><input type="number" value="${r.juros}" onchange="ag_update('${encodeURIComponent(cliente)}',${i},'juros',parseFloat(this.value))"/></td>
          <td><input type="number" value="${r.prazo}" onchange="ag_update('${encodeURIComponent(cliente)}',${i},'prazo',parseInt(this.value))"/></td>
          <td>${r.tipo}</td>
          <td>${money(r.total)}</td>
          <td><button class="btn small" onclick="ag_remove('${encodeURIComponent(cliente)}',${i})" style="background:#ff6b6b">Excluir</button></td>
        </tr>`).join('') + '</tbody></table><div style="margin-top:12px"><button class="btn" id="addReg2">Adicionar Empréstimo</button></div>';
      document.getElementById('addReg2').addEventListener('click', ()=> addRegistro(cliente));
    }
    render();
  })();

  window.ag_open = function(enc){
    const cliente = decodeURIComponent(enc);
    localStorage.setItem(SELECTED, cliente);
    window.location.href = 'registro_detalhado.html';
  };
  window.ag_edit = function(enc){
    const cliente = decodeURIComponent(enc);
    const newName = prompt('Editar nome do cliente:', cliente);
    if (!newName) return;
    const db = load();
    db[newName.trim()] = db[cliente];
    delete db[cliente];
    save(db);
    location.reload();
  };
  window.ag_delete = function(enc){
    const cliente = decodeURIComponent(enc);
    if (!confirm('Excluir '+cliente+' e todos os registros?')) return;
    const db = load();
    delete db[cliente];
    save(db);
    location.reload();
  };

  function addRegistro(cliente){
    const valor = parseFloat(prompt('Valor (R$):','0')) || 0;
    const juros = parseFloat(prompt('Juros (% ao mês):','0')) || 0;
    const prazo = parseInt(prompt('Prazo (meses):','1'),10) || 1;
    const tipo = confirm('Usar juros compostos? OK = composto, Cancel = simples') ? 'composto' : 'simples';
    const data = new Date().toISOString().split('T')[0];
    const db = load();
    if (!db[cliente]) db[cliente]=[];
    const total = tipo==='simples' ? (valor + (valor*(juros/100)*prazo)) : Number((valor*Math.pow(1+juros/100,prazo)).toFixed(2));
    db[cliente].push({ valor, juros, prazo, tipo, data, total });
    save(db);
    location.reload();
  }

  window.ag_update = function(clienteEnc, idx, campo, valor){
    const cliente = decodeURIComponent(clienteEnc);
    const db = load();
    if (!db[cliente] || !db[cliente][idx]) return;
    db[cliente][idx][campo] = valor;
    const r = db[cliente][idx];
    if (r.tipo === 'simples') r.total = r.valor + (r.valor*(r.juros/100)*r.prazo);
    else r.total = Number((r.valor*Math.pow(1 + r.juros/100, r.prazo)).toFixed(2));
    save(db);
  };
  window.ag_remove = function(clienteEnc, idx){
    const cliente = decodeURIComponent(clienteEnc);
    if (!confirm('Excluir esse registro?')) return;
    const db = load();
    if (!db[cliente]) return;
    db[cliente].splice(idx,1);
    save(db);
    location.reload();
  };

  /* ---------- RELATÓRIOS / EXPORT ---------- */
  function exportCSVAll(){
    const db = load();
    let csv = 'Cliente,Data,Valor,Juros (%),Prazo,Tipo,Total\n';
    Object.keys(db).forEach(c=>{
      db[c].forEach(r=>{
        csv += `${c},${r.data},${r.valor},${r.juros},${r.prazo},${r.tipo},${r.total}\n`;
      });
    });
    const blob = new Blob([csv],{type:'text/csv'});
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = 'relatorio_emprestimos.csv'; 
    a.click();
  }
  window.exportCSVAll = exportCSVAll;

  function exportPDFAll(){
    const db = load();
    let html = '<h1>Relatório de Empréstimos — AgroScan Hub</h1><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%"><tr><th>Cliente</th><th>Data</th><th>Valor</th><th>Juros (%/mês)</th><th>Prazo</th><th>Total</th></tr>';
    Object.keys(db).forEach(c=>{
      db[c].forEach(r=>{
        html += `<tr><td>${c}</td><td>${r.data}</td><td>${r.valor}</td><td>${r.juros}%</td><td>${r.prazo}</td><td>${r.total}</td></tr>`;
      });
    });
    html += '</table>';
    const w = window.open('', '_blank');
    w.document.write('<html><head><title>Relatório</title></head><body>');
    w.document.write(html);
    w.document.write('</body></html>');
    w.document.close();
    w.print();
  }
  window.exportPDFAll = exportPDFAll;

  document.getElementById('btnGenPDF')?.addEventListener('click', exportPDFAll);
  document.getElementById('btnGenCSV')?.addEventListener('click', exportCSVAll);

  // Backup / Restore e Configurações (inalterados)
  document.getElementById('btnBackup')?.addEventListener('click', ()=>{
    const data = localStorage.getItem(KEY) || '{}';
    const blob = new Blob([data],{type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'backup_agroscan.json'; a.click();
  });
  const fileInput = document.getElementById('fileInput');
  document.getElementById('btnRestore')?.addEventListener('click', ()=> fileInput && fileInput.click());
  fileInput?.addEventListener('change', (ev)=>{
    const f = ev.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ()=> {
      try {
        const json = JSON.parse(r.result);
        if (typeof json === 'object'){ localStorage.setItem(KEY, JSON.stringify(json)); alert('Backup restaurado'); location.reload(); }
        else alert('Arquivo inválido');
      } catch(e){ alert('Erro na restauração: '+e.message); }
    };
    r.readAsText(f);
  });

  document.getElementById('exportCSV')?.addEventListener('click', exportCSVAll);
  document.getElementById('exportPDF')?.addEventListener('click', exportPDFAll);

  document.getElementById('btnSaveConfig')?.addEventListener('click', ()=>{
    const color = document.getElementById('themeColor')?.value || '#00d398';
    const name = document.getElementById('panelName')?.value || 'AgroScan Hub';
    localStorage.setItem('agroscan_cfg', JSON.stringify({ color, name }));
    document.documentElement.style.setProperty('--card', color);
    document.querySelectorAll('header h1').forEach(h=> h.textContent = name);
    alert('Configurações salvas');
  });

  document.getElementById('btnReset')?.addEventListener('click', ()=>{
    if (!confirm('Resetar todos os dados?')) return;
    localStorage.removeItem(KEY);
    alert('Dados resetados');
    location.reload();
  });

  (function applyCfg(){
    try {
      const cfg = JSON.parse(localStorage.getItem('agroscan_cfg') || '{}');
      if (cfg.color) document.documentElement.style.setProperty('--card', cfg.color);
      if (cfg.name) document.querySelectorAll('header h1').forEach(h=> h.textContent = cfg.name);
    } catch(e){}
  })();

})();
