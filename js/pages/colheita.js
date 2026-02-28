// js/pages/colheita.js
export async function pageColheita({ pageHeader, pageBody, toast }) {
  pageHeader.innerHTML = `
    <div>
      <div style="font-weight:800; font-size:18px;">Colheita & Fretes</div>
      <div style="color:var(--muted); font-size:13px;">(Próximo passo) Colheita por cargas, caminhões e frete por tonelada.</div>
    </div>
    <div><button class="btn btn-ghost" type="button" id="btnInfo">Info</button></div>
  `;

  pageBody.innerHTML = `
    <div class="card">
      <div style="font-weight:800; margin-bottom:8px;">Em construção</div>
      <div style="color:var(--muted); font-size:14px;">
        Aqui entra: Colheitas (modo total ou cargas) → Cargas → Caminhões → Fretes.
      </div>
    </div>
  `;

  pageHeader.querySelector("#btnInfo").addEventListener("click", () => {
    toast("Quando você quiser, eu te mando a tela completa de colheita/cargas/fretes.");
  });
}
