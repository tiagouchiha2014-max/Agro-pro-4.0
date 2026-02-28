import { state, loadState, saveState } from "./state.js";
import { toast, loading, setActiveMenuRoute } from "./ui.js";
import * as db from "./db.js";

import { pageLogin } from "./pages/login.js";
import { pagePropriedades } from "./pages/propriedades.js";
import { pageEstoque } from "./pages/estoque.js";
import { pageColheita } from "./pages/colheita.js";
import { pageClima } from "./pages/clima.js";
import { pageRelatorios } from "./pages/relatorios.js";

const pageTitle = document.getElementById("pageTitle");
const breadcrumb = document.getElementById("breadcrumb");
const pageHeader = document.getElementById("pageHeader");
const pageBody = document.getElementById("pageBody");

const selSafra = document.getElementById("selSafra");
const selFazenda = document.getElementById("selFazenda");

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const btnMenu = document.getElementById("btnMenu");

loadState();
db.ensureSeed();

const routes = {
  "/login":        { title:"Login",        crumb:"Acesso",        render: pageLogin },
  "/propriedades": { title:"Propriedades", crumb:"Cadastro",      render: pagePropriedades },
  "/estoque":      { title:"Estoque",      crumb:"Operações",     render: pageEstoque },
  "/colheita":     { title:"Colheita",     crumb:"Operações",     render: pageColheita },
  "/clima":        { title:"Clima",        crumb:"Monitoramento", render: pageClima },
  "/relatorios":   { title:"Relatórios",   crumb:"Gestão",        render: pageRelatorios },
};

function setTitle(route){
  pageTitle.textContent = route.title;
  breadcrumb.textContent = `Agro Pro • ${route.crumb}`;
}

function openMenu(){ sidebar.classList.add("open"); overlay.hidden=false; btnMenu?.setAttribute("aria-expanded","true"); }
function closeMenu(){ sidebar.classList.remove("open"); overlay.hidden=true; btnMenu?.setAttribute("aria-expanded","false"); }
function toggleMenu(){ sidebar.classList.contains("open") ? closeMenu() : openMenu(); }

btnMenu?.addEventListener("click", toggleMenu);
overlay?.addEventListener("click", closeMenu);
window.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeMenu(); });

document.getElementById("btnLogout")?.addEventListener("click", () => {
  toast("Sessão local encerrada.");
  location.hash = "#/login";
});

async function loadSafras(){
  const { data, error } = await db.listSafras();
  if(error) throw new Error(error.message);

  selSafra.innerHTML = data.map(s => `<option value="${s.id}">${s.nome}${s.ativa?" (ativa)":""}</option>`).join("");

  if(!state.safraId || !data.find(x=>x.id===state.safraId)){
    state.safraId = (data.find(x=>x.ativa) || data[0])?.id ?? null;
    saveState();
  }
  selSafra.value = state.safraId ?? "";
}

async function loadFazendas(){
  const { data, error } = await db.listFazendas({ somenteAtivas:true });
  if(error) throw new Error(error.message);

  selFazenda.innerHTML = data.map(f => `<option value="${f.id}">${f.nome}</option>`).join("");

  if(!state.fazendaId || !data.find(x=>x.id===state.fazendaId)){
    state.fazendaId = data[0]?.id ?? null;
    saveState();
  }
  selFazenda.value = state.fazendaId ?? "";
}

selSafra?.addEventListener("change", ()=>{ state.safraId = selSafra.value||null; saveState(); renderRoute(); });
selFazenda?.addEventListener("change", ()=>{ state.fazendaId = selFazenda.value||null; saveState(); renderRoute(); });

function currentPath(){ return (location.hash.replace("#","") || "/relatorios"); }

async function renderRoute(){
  const path = currentPath();
  const route = routes[path] || routes["/relatorios"];

  setActiveMenuRoute(path);
  setTitle(route);
  closeMenu();

  pageHeader.innerHTML = "";
  pageBody.innerHTML = "";

  const gf = document.getElementById("globalFilters");
  if(gf) gf.style.display = (path === "/login") ? "none" : "flex";

  try{
    if(path !== "/login"){
      loading.show("Carregando filtros...");
      await loadSafras();
      await loadFazendas();
      loading.hide();
    }
    await route.render({ pageHeader, pageBody, state, db, toast, loading });
  }catch(err){
    loading.hide();
    console.error(err);
    toast("Erro: " + (err?.message || err));
  }
}

window.addEventListener("hashchange", renderRoute);
if(!location.hash) location.hash = "#/relatorios";
renderRoute();
