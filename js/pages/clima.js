// js/pages/clima.js (LOCAL STORAGE)
import { h, num } from "../ui.js";

export async function pageClima({ pageHeader, pageBody, state, db, toast, loading }) {
  pageHeader.innerHTML = `
    <div>
      <div style="font-weight:800; font-size:18px;">Clima • Chuvas</div>
      <div style="color:var(--muted); font-size:13px;">
        Registre chuva por talhão (mm) e acompanhe o acumulado na safra.
      </div>
    </div>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn" id="btnAddChuva" type="button">+ Registrar Chuva</button>
      <button class="btn btn-ghost" id="btnReload" type="button">Recarregar</button>
    </div>
  `;

  pageBody.innerHTML = `
    <div class="card">
      <div style="font-weight:800; margin-bottom:10px;">Chuvas por Talhão (Safra + Fazenda selecionadas)</div>
      <table class="table" id="tbChuvas">
        <thead>
          <tr>
            <th>Data</th>
            <th>Talhão</th>
            <th>mm</th>
            <th>Fonte</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>

    <div style="margin-top: var(--space-3);" class="card" id="cardAcum">
      <div style="font-weight:800; margin-bottom:10px;">Acumulado por Talhão (na safra)</div>
      <table class="table" id="tbAcum">
        <thead><tr><th>Talhão</th><th>Chuva (mm)</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  async function loadData(){
    if(!state.safraId || !state.fazendaId) return toast("Selecione safra e fazenda.");

    loading.show("Carregando chuvas...");

    const [talhoesRes, chuvasRes] = await Promise.all([
      db.listTalhoes({ fazendaId: state.fazendaId }),
      db.listChuvas({ safraId: state.safraId, fazendaId: state.fazendaId, limit: 200 })
    ]);

    loading.hide();

    if(talhoesRes.error) return toast("Erro talhões: " + talhoesRes.error.message);
    if(chuvasRes.error) return toast("Erro chuvas: " + chuvasRes.error.message);

    const talhoes = talhoesRes.data || [];
    const mapTal = new Map(talhoes.map(t => [t.id, t.nome]));

    const tb = pageBody.querySelector("#tbChuvas tbody");
    tb.innerHTML = (chuvasRes.data||[]).map(r => `
      <tr>
        <td>${fmtDate(r.data)}</td>
        <td>${h(mapTal.get(r.talhao_id) || "—")}</td>
        <td>${num(r.mm, 2)}</td>
        <td>${h(r.fonte || "manual")}</td>
      </tr>
    `).join("");

    // acumulado por talhão
    const acum = new Map();
    for(const r of (chuvasRes.data||[])){
      acum.set(r.talhao_id, (acum.get(r.talhao_id)||0) + Number(r.mm||0));
    }

    const tbA = pageBody.querySelector("#tbAcum tbody");
    tbA.innerHTML = talhoes.map(t => `
      <tr><td>${h(t.nome)}</td><td>${num(acum.get(t.id)||0, 2)}</td></tr>
    `).join("");
  }

  pageHeader.querySelector("#btnAddChuva").addEventListener("click", async () => {
    if(!state.safraId || !state.fazendaId) return toast("Selecione safra e fazenda.");

    const talhoesRes = await db.listTalhoes({ fazendaId: state.fazendaId });
    if(talhoesRes.error) return toast("Erro talhões: " + talhoesRes.error.message);

    const talhoes = talhoesRes.data || [];
    if(!talhoes.length) return toast("Cadastre talhões primeiro (em Propriedades).");

    const talhaoNome = prompt(
      "Talhão (digite exatamente o nome):\n" + talhoes.map(t => t.nome).join("\n")
    );
    if(!talhaoNome) return;

    const talhao = talhoes.find(t => String(t.nome).toLowerCase() === talhaoNome.toLowerCase());
    if(!talhao) return toast("Talhão não encontrado.");

    const data = prompt("Data (AAAA-MM-DD):", new Date().toISOString().slice(0,10));
    if(!data) return toast("Data é obrigatória.");

    const mm = Number(prompt("Chuva (mm):", "0") || "0");

    loading.show("Salvando...");

    const { error } = await db.addChuva({
      safraId: state.safraId,
      fazendaId: state.fazendaId,
      talhaoId: talhao.id,
      data,
      mm,
      fonte: "manual"
    });

    loading.hide();
    if(error) return toast("Erro: " + error.message);

    toast("Chuva registrada!");
    loadData();
  });

  pageHeader.querySelector("#btnReload").addEventListener("click", loadData);

  await loadData();
}

function fmtDate(d){
  if(!d) return "—";
  return String(d);
}
