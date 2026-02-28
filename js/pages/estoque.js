export async function pageEstoque({ pageHeader, pageBody, toast, state }) {
  pageHeader.innerHTML = `
    <div>
      <div style="font-weight:800; font-size:18px;">Estoque & Aplicações</div>
      <div style="color:var(--muted); font-size:13px;">(Próximo passo) Produtos, estoque por fazenda, aplicações e baixa automática.</div>
    </div>
    <div><button class="btn btn-ghost" type="button" id="btnInfo">Info</button></div>
  `;

  pageBody.innerHTML = `
    <div class="card">
      <div style="font-weight:800; margin-bottom:8px;">Em construção</div>
      <div style="color:var(--muted); font-size:14px;">
        Safra: <b>${state?.safraId || "—"}</b><br/>
        Fazenda: <b>${state?.fazendaId || "—"}</b>
      </div>
    </div>
  `;

  pageHeader.querySelector("#btnInfo").addEventListener("click", () => {
    toast("Quando quiser, eu monto a tela completa de estoque+produtos+aplicações com baixa automática no storage.");
  });
}
