// js/pages/colheita.js
export async function pageColheita({ pageHeader, pageBody, toast, state, db }) {
  pageHeader.innerHTML = `
    <div>
      <div style="font-weight:800; font-size:18px;">Colheita & Fretes</div>
      <div style="color:var(--muted); font-size:13px;">
        (Próximo passo) Colheita por cargas, caminhões e frete por tonelada.
      </div>
    </div>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn btn-ghost" type="button" id="btnInfo">Info</button>
    </div>
  `;

  const safraOk = !!state?.safraId;
  const fazOk = !!state?.fazendaId;

  pageBody.innerHTML = `
    <div class="card">
      <div style="font-weight:800; margin-bottom:8px;">Em construção</div>
      <div style="color:var(--muted); font-size:14px; line-height:1.5;">
        Aqui entra:
        <b>Colheitas</b> (modo total ou cargas) → <b>Cargas</b> → <b>Caminhões</b> → <b>Fretes</b>.
      </div>

      <hr class="sep" />

      <div style="color:var(--muted); font-size:13px;">
        Filtros atuais:
        <div style="margin-top:6px;">
          Safra: <b>${safraOk ? state.safraId : "— selecione no topo —"}</b><br/>
          Fazenda: <b>${fazOk ? state.fazendaId : "— selecione no topo —"}</b>
        </div>
      </div>
    </div>
  `;

  pageHeader.querySelector("#btnInfo").addEventListener("click", () => {
    toast("Quando você quiser, eu monto a tela completa de colheita/cargas/fretes com gravação no storage.");
  });
}
