// js/pages/relatorios.js
export async function pageRelatorios({ pageHeader, pageBody, state, sb, toast, loading }) {
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
              <th>Talhão</th>
              <th>Área (ha)</th>
              <th>Chuva (mm)</th>
              <th>Ton</th>
              <th>Custo Total</th>
              <th>Custo/ha</th>
              <th>Preço cfg/Ton</th>
              <th>Receita Est.</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <hr class="sep" />
      <div style="color:var(--muted); font-size:12px;">
        * Receita estimada usa o preço configurado em <b>config_precos_graos</b> por cultura.
      </div>
    </div>
  `;

  async function loadReport(){
    if(!state.safraId || !state.fazendaId) return toast("Selecione safra e fazenda.");

    loading.show("Carregando relatório...");
    const { data, error } = await sb
      .from("v_relatorio_talhao_safra")
      .select("*")
      .eq("safra_id", state.safraId)
      .eq("fazenda_id", state.fazendaId)
      .order("talhao_nome", { ascending:true });

    loading.hide();

    if(error) return toast("Erro relatório: " + error.message);

    const rows = data || [];
    const tbody = pageBody.querySelector("#tbRel tbody");

    let totalCusto = 0, totalHa = 0, totalChuva = 0, totalTon = 0, totalReceitaEst = 0;

    tbody.innerHTML = rows.map(r => {
      totalCusto += Number(r.custo_total || 0);
      totalHa += Number(r.area_ha || 0);
      totalChuva += Number(r.chuva_mm_safra || 0);
      totalTon += Number(r.toneladas || 0);
      totalReceitaEst += Number(r.receita_estimada || 0);

      return `
        <tr>
          <td>${escapeHtml(r.talhao_nome || "—")}</td>
          <td>${num(r.area_ha,2)}</td>
          <td>${num(r.chuva_mm_safra,2)}</td>
          <td>${num(r.toneladas,3)}</td>
          <td>R$ ${num(r.custo_total,2)}</td>
          <td>R$ ${num(r.custo_por_ha,2)}</td>
          <td>R$ ${num(r.preco_cfg_por_ton,2)}</td>
          <td>R$ ${num(r.receita_estimada,2)}</td>
        </tr>
      `;
    }).join("");

    const kpis = pageBody.querySelector("#kpis");
    const custoPorHa = totalHa > 0 ? (totalCusto / totalHa) : 0;
    const receitaPorHa = totalHa > 0 ? (totalReceitaEst / totalHa) : 0;

    kpis.innerHTML = `
      <div class="row">
        <div class="col">
          <div style="color:var(--muted); font-size:12px;">Área total (ha)</div>
          <div style="font-weight:900; font-size:20px;">${num(totalHa,2)}</div>
        </div>
        <div class="col">
          <div style="color:var(--muted); font-size:12px;">Custo total</div>
          <div style="font-weight:900; font-size:20px;">R$ ${num(totalCusto,2)}</div>
        </div>
        <div class="col">
          <div style="color:var(--muted); font-size:12px;">Custo/ha</div>
          <div style="font-weight:900; font-size:20px;">R$ ${num(custoPorHa,2)}</div>
        </div>
        <div class="col">
          <div style="color:var(--muted); font-size:12px;">Toneladas</div>
          <div style="font-weight:900; font-size:20px;">${num(totalTon,3)}</div>
        </div>
        <div class="col">
          <div style="color:var(--muted); font-size:12px;">Receita estimada</div>
          <div style="font-weight:900; font-size:20px;">R$ ${num(totalReceitaEst,2)}</div>
        </div>
        <div class="col">
          <div style="color:var(--muted); font-size:12px;">Receita/ha</div>
          <div style="font-weight:900; font-size:20px;">R$ ${num(receitaPorHa,2)}</div>
        </div>
      </div>
    `;
  }

  pageHeader.querySelector("#btnReload").addEventListener("click", loadReport);

  await loadReport();
}

function num(v, dec=2){
  const n = Number(v || 0);
  return n.toFixed(dec);
}
function escapeHtml(s=""){
  return String(s)
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
