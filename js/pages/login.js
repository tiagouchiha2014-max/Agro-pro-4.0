// js/pages/login.js
import { signIn } from "../supabase.js";

export async function pageLogin({ pageHeader, pageBody, toast, loading }) {
  pageHeader.innerHTML = `
    <div class="card" style="width:100%">
      <div style="font-weight:800; font-size:18px; margin-bottom:8px;">Entrar</div>
      <div style="color:var(--muted); font-size:14px;">Acesso por convite (email e senha).</div>
    </div>
  `;

  pageBody.innerHTML = `
    <div class="card" style="max-width:520px;">
      <div class="row">
        <div class="col">
          <label style="font-size:13px;color:var(--muted)">Email</label>
          <input class="input" id="email" type="email" placeholder="seuemail@exemplo.com" />
        </div>
      </div>

      <div class="row" style="margin-top: var(--space-3);">
        <div class="col">
          <label style="font-size:13px;color:var(--muted)">Senha</label>
          <input class="input" id="pass" type="password" placeholder="••••••••" />
        </div>
      </div>

      <div style="margin-top: var(--space-4); display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn" id="btnLogin" type="button">Entrar</button>
      </div>
    </div>
  `;

  pageBody.querySelector("#btnLogin").addEventListener("click", async () => {
    const email = pageBody.querySelector("#email").value.trim();
    const password = pageBody.querySelector("#pass").value;

    if (!email || !password) return toast("Informe email e senha.");

    loading.show("Entrando...");
    const { error } = await signIn(email, password);
    loading.hide();

    if (error) return toast("Falha no login: " + error.message);

    toast("Login OK!");
    location.hash = "#/relatorios";
  });
}
