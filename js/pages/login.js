export async function pageLogin({ pageHeader, pageBody, toast, loading }) {
  pageHeader.innerHTML = `
    <div class="card" style="width:100%">
      <div style="font-weight:800; font-size:18px; margin-bottom:8px;">Agro Pro</div>
      <div style="color:var(--muted); font-size:14px;">
        Modo local (storage). Login real por convite entra na migração para Supabase.
      </div>
    </div>
  `;

  pageBody.innerHTML = `
    <div class="card" style="max-width:560px;">
      <div style="font-weight:800; margin-bottom:8px;">Entrar</div>
      <div style="color:var(--muted); font-size:14px; line-height:1.5;">
        Teste as funcionalidades salvando no navegador. Depois migramos para Supabase.
      </div>

      <div style="margin-top: var(--space-4); display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
        <button class="btn btn-ghost" id="btnReset" type="button">Reset local</button>
        <button class="btn" id="btnEnter" type="button">Entrar</button>
      </div>
    </div>
  `;

  pageBody.querySelector("#btnEnter").addEventListener("click", async () => {
    loading.show("Entrando...");
    await new Promise(r => setTimeout(r, 200));
    loading.hide();
    toast("Entrou no modo local!");
    location.hash = "#/relatorios";
  });

  pageBody.querySelector("#btnReset").addEventListener("click", async () => {
    const ok = window.confirm("Apagar todos os dados locais do Agro Pro neste navegador?");
    if(!ok) return;

    try{ localStorage.removeItem("agropro_state_v1"); }catch{}
    try{ localStorage.removeItem("agropro_db_v1"); }catch{}
    toast("Dados locais apagados.");
    location.hash = "#/relatorios";
  });
}
