// js/pages/estoque.js
export async function pageEstoque({ pageHeader, pageBody, toast, state, db }) {
  pageHeader.innerHTML = `
    <div>
      <div style="font-weight:800; font-size:18px;">Estoque & Aplicações</div>
      <div style="color:var(--muted); font-size:13px;">
        (Próximo passo) Produtos, estoque por fazenda, aplicações e baixa automática.
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
        <b>Produtos</b> → <b>Estoque por Fazenda</b> → <b>Aplicações</b> (rascunho/confirmar) →
        baixa automática e custo por talhão.
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
    toast("Quando você quiser, eu monto a tela completa de estoque+produtos+aplicações com baixa automática no storage.");
  });
}
