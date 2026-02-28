import { h, num, fmtBRL } from "../ui.js";

export async function pageRelatorios({ pageHeader, pageBody, state, db, toast, loading }) {
  pageHeader.innerHTML = `
    <div>
      <div style="font-weight:800; font-size:18px;">Relatório Conectado</div>
      <div style="color:var(--muted); font-size:13px;">Custos cumulativos por talhão + chuva + toneladas + receita estimada.</div>
    </div>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn" id="btnReload" type="button">Recarregar</button>
    </div>
  `;

  pageBody.innerHTML = `
    <div class="card" id="kpis"></div>
    <div style="margin-top: var(--space-3);" class="card">
      <div style="font-weight:800; margin-bottom:10px;">Por Talhão (Safra + Fazenda)</div>
      <div style="overflow:auto;">
        <table class="table" id="tbRel">
          <thead>
            <tr>
              <th>Talhão</th><th>Área (ha)</th><th>Chuva (mm)</th><th>Ton</th>
              <th>Custo Total</th><th>Custo/ha</th><th>Preço cfg/Ton</th><th>Receita Est.</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <hr class="sep" />
      <div style="color:var(--muted); font-size:12px;">
        * Nesta fase (storage), Ton/Custos/Preços ainda são placeholders.
      </div>
    </div>
  `;

  async function loadReport(){
    if(!state.safraId || !state.fazendaId) return toast("Selecione safra e fazenda.");

    loading.show("Carregando relatório...");
    const { data, error } = await db.getRelatorioTalhoes({ safraId: state.safraId, fazendaId: state.fazendaId });
    loading.hide();
    if(error) return toast("Erro relatório: " + error.message);

    const rows = data || [];
    const tbody = pageBody.querySelector("#tbRel tbody");

    let totalCusto=0, totalHa=0, totalChuva=0, totalTon=0, totalReceita=0;

    tbody.innerHTML = rows.map(r=>{
      const area = Number(r.area_ha||0);
      const chuva = Number(r.chuva_mm_safra||0);
      const ton = Number(r.toneladas||0);
      const custo = Number(r.custo_total||0);
      const custoHa = Number(r.custo_por_ha||0);
      const preco = Number(r.preco_cfg_por_ton||0);
      const receita = Number(r.receita_estimada||0);

      totalHa += area; totalChuva += chuva; totalTon += ton; totalCusto += custo; totalReceita += receita;

      return `
        <tr>
          <td>${h(r.talhao_nome||"—")}</td>
          <td>${num(area,2)}</td>
          <td>${num(chuva,2)}</td>
          <td>${num(ton,3)}</td>
          <td>${fmtBRL(custo)}</td>
          <td>${fmtBRL(custoHa)}</td>
          <td>${fmtBRL(preco)}</td>
          <td>${fmtBRL(receita)}</td>
        </tr>
      `;
    }).join("");

    const custoPorHa = totalHa>0 ? totalCusto/totalHa : 0;
    const receitaPorHa = totalHa>0 ? totalReceita/totalHa : 0;

    pageBody.querySelector("#kpis").innerHTML = `
      <div class="row">
        <div class="col"><div style="color:var(--muted);font-size:12px;">Área total (ha)</div><div style="font-weight:900;font-size:20px;">${num(totalHa,2)}</div></div>
        <div class="col"><div style="color:var(--muted);font-size:12px;">Chuva acumulada (mm)</div><div style="font-weight:900;font-size:20px;">${num(totalChuva,2)}</div></div>
        <div class="col"><div style="color:var(--muted);font-size:12px;">Custo total</div><div style="font-weight:900;font-size:20px;">${fmtBRL(totalCusto)}</div></div>
        <div class="col"><div style="color:var(--muted);font-size:12px;">Custo/ha</div><div style="font-weight:900;font-size:20px;">${fmtBRL(custoPorHa)}</div></div>
        <div class="col"><div style="color:var(--muted);font-size:12px;">Toneladas</div><div style="font-weight:900;font-size:20px;">${num(totalTon,3)}</div></div>
        <div class="col"><div style="color:var(--muted);font-size:12px;">Receita estimada</div><div style="font-weight:900;font-size:20px;">${fmtBRL(totalReceita)}</div></div>
        <div class="col"><div style="color:var(--muted);font-size:12px;">Receita/ha</div><div style="font-weight:900;font-size:20px;">${fmtBRL(receitaPorHa)}</div></div>
      </div>
    `;
  }

  pageHeader.querySelector("#btnReload").addEventListener("click", loadReport);
  await loadReport();
}
