// js/pages/propriedades.js (LOCAL STORAGE)
import { h, num } from "../ui.js";

export async function pagePropriedades({ pageHeader, pageBody, state, db, toast, loading }) {
  pageHeader.innerHTML = `
    <div>
      <div style="font-weight:800; font-size:18px;">Propriedades</div>
      <div style="color:var(--muted); font-size:13px;">
        Cadastre Safras, Fazendas e Talhões. Tudo será filtrado por Safra + Fazenda.
      </div>
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
          <div style="color:var(--muted); font-size:12px; margin-bottom:8px;">
            Dica: toque em uma safra para marcar como ativa.
          </div>
          <table class="table" id="tbSafras">
            <thead><tr><th>Nome</th><th>Ativa</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      <div class="col">
        <div class="card">
          <div style="font-weight:800; margin-bottom:10px;">Fazendas</div>
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
      db.listSafras(),
      db.listFazendas({ somenteAtivas: false }),
      state.fazendaId
        ? db.listTalhoes({ fazendaId: state.fazendaId })
        : Promise.resolve({ data: [], error: null })
    ]);

    loading.hide();

    if(safras.error) toast("Erro safras: " + safras.error.message);
    if(fazendas.error) toast("Erro fazendas: " + fazendas.error.message);
    if(talhoes.error) toast("Erro talhões: " + talhoes.error.message);

    // Safras (clicável para ativar)
    const tbS = pageBody.querySelector("#tbSafras tbody");
    tbS.innerHTML = (safras.data||[]).map(s => `
      <tr class="clickrow" data-safra="${s.id}" title="Marcar como ativa">
        <td>${h(s.nome)}</td>
        <td>${s.ativa ? "Sim" : "Não"}</td>
      </tr>
    `).join("");

    tbS.querySelectorAll("tr[data-safra]").forEach(tr => {
      tr.addEventListener("click", async () => {
        const id = tr.getAttribute("data-safra");
        if(!id) return;
        loading.show("Atualizando safra ativa...");
        const { error } = await db.setSafraAtiva(id);
        loading.hide();
        if(error) return toast("Erro: " + error.message);

        toast("Safra ativa atualizada.");
        // não altero state aqui; o app.js recarrega filtro ao navegar.
        loadAll();
      });
    });

    // Fazendas
    const tbF = pageBody.querySelector("#tbFazendas tbody");
    tbF.innerHTML = (fazendas.data||[]).map(f => `
      <tr>
        <td>${h(f.nome)}</td>
        <td>${f.ativa ? "Ativa" : "Inativa"}</td>
      </tr>
    `).join("");

    // Talhões
    const tbT = pageBody.querySelector("#tbTalhoes tbody");
    tbT.innerHTML = (talhoes.data||[]).map(t => `
      <tr>
        <td>${h(t.nome)}</td>
        <td>${num(t.area_ha, 2)}</td>
      </tr>
    `).join("");
  }

  pageHeader.querySelector("#btnNovaSafra").addEventListener("click", async () => {
    const nome = prompt("Nome da Safra (ex: 25/26):");
    if(!nome) return;

    loading.show("Criando safra...");
    const { error } = await db.createSafra({ nome, ativa: false });
    loading.hide();

    if(error) return toast("Erro: " + error.message);
    toast("Safra criada!");
    loadAll();
  });

  pageHeader.querySelector("#btnNovaFaz").addEventListener("click", async () => {
    const nome = prompt("Nome da Fazenda:");
    if(!nome) return;

    loading.show("Criando fazenda...");
    const { error } = await db.createFazenda({ nome, ativa: true });
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
    const { error } = await db.createTalhao({ fazendaId: state.fazendaId, nome, area_ha: area });
    loading.hide();

    if(error) return toast("Erro: " + error.message);
    toast("Talhão criado!");
    loadAll();
  });

  await loadAll();
}
