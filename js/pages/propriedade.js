// js/pages/propriedades.js
export async function pagePropriedades({ pageHeader, pageBody, state, sb, toast, loading }) {
  pageHeader.innerHTML = `
    <div>
      <div style="font-weight:800; font-size:18px;">Propriedades</div>
      <div style="color:var(--muted); font-size:13px;">Cadastre Safras, Fazendas e Talhões. Tudo será filtrado por Safra + Fazenda.</div>
    </div>

    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn" id="btnNovaSafra" type="button">+ Nova Safra</button>
      <button class="btn btn-ghost" id="btnNovaFaz" type="button">+ Nova Fazenda</button>
      <button class="btn btn-ghost" id="btnNovoTal" type="button">+ Novo Talhão</button>
    </div>
  `;

  pageBody.innerHTML = `
    <div class="row">
      <div class="col">
        <div class="card">
          <div style="font-weight:800; margin-bottom:10px;">Safras</div>
          <table class="table" id="tbSafras">
            <thead><tr><th>Nome</th><th>Ativa</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      <div class="col">
        <div class="card">
          <div style="font-weight:800; margin-bottom:10px;">Fazendas (as que você tem acesso)</div>
          <table class="table" id="tbFazendas">
            <thead><tr><th>Nome</th><th>Status</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>

    <div style="margin-top: var(--space-3);">
      <div class="card">
        <div style="font-weight:800; margin-bottom:10px;">Talhões (da Fazenda selecionada)</div>
        <table class="table" id="tbTalhoes">
          <thead><tr><th>Nome</th><th>Área (ha)</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  async function loadAll(){
    loading.show("Carregando propriedades...");
    const [safras, fazendas, talhoes] = await Promise.all([
      sb.from("safras").select("id,nome,ativa").order("ativa",{ascending:false}).order("nome"),
      sb.from("fazendas").select("id,nome,ativa").order("nome"),
      state.fazendaId
        ? sb.from("talhoes").select("id,nome,area_ha").eq("fazenda_id", state.fazendaId).order("nome")
        : Promise.resolve({ data: [], error: null })
    ]);
    loading.hide();

    if(safras.error) toast("Erro safras: " + safras.error.message);
    if(fazendas.error) toast("Erro fazendas: " + fazendas.error.message);
    if(talhoes.error) toast("Erro talhoes: " + talhoes.error.message);

    const tbS = pageBody.querySelector("#tbSafras tbody");
    tbS.innerHTML = (safras.data||[]).map(s => `
      <tr><td>${escapeHtml(s.nome)}</td><td>${s.ativa ? "Sim" : "Não"}</td></tr>
    `).join("");

    const tbF = pageBody.querySelector("#tbFazendas tbody");
    tbF.innerHTML = (fazendas.data||[]).map(f => `
      <tr><td>${escapeHtml(f.nome)}</td><td>${f.ativa ? "Ativa" : "Inativa"}</td></tr>
    `).join("");

    const tbT = pageBody.querySelector("#tbTalhoes tbody");
    tbT.innerHTML = (talhoes.data||[]).map(t => `
      <tr><td>${escapeHtml(t.nome)}</td><td>${Number(t.area_ha||0).toFixed(2)}</td></tr>
    `).join("");
  }

  pageHeader.querySelector("#btnNovaSafra").addEventListener("click", async () => {
    const nome = prompt("Nome da Safra (ex: 25/26):");
    if(!nome) return;
    loading.show("Criando safra...");
    const { error } = await sb.from("safras").insert({ nome, ativa: false });
    loading.hide();
    if(error) return toast("Erro: " + error.message);
    toast("Safra criada!");
    loadAll();
  });

  pageHeader.querySelector("#btnNovaFaz").addEventListener("click", async () => {
    const nome = prompt("Nome da Fazenda:");
    if(!nome) return;
    loading.show("Criando fazenda...");
    const { error } = await sb.from("fazendas").insert({ nome, ativa: true });
    loading.hide();
    if(error) return toast("Erro: " + error.message);
    toast("Fazenda criada!");
    loadAll();
  });

  pageHeader.querySelector("#btnNovoTal").addEventListener("click", async () => {
    if(!state.fazendaId) return toast("Selecione uma fazenda no topo primeiro.");
    const nome = prompt("Nome do Talhão:");
    if(!nome) return;
    const area = Number(prompt("Área (ha):", "0") || "0");
    loading.show("Criando talhão...");
    const { error } = await sb.from("talhoes").insert({ fazenda_id: state.fazendaId, nome, area_ha: area });
    loading.hide();
    if(error) return toast("Erro: " + error.message);
    toast("Talhão criado!");
    loadAll();
  });

  await loadAll();
}

function escapeHtml(s=""){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
