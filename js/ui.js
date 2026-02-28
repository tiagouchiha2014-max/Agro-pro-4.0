const toastEl = document.getElementById("toast");
const loadingEl = document.getElementById("loading");

let toastTimer = null;

export function toast(msg, ms = 2600){
  if(!toastEl) return;
  if(toastTimer) clearTimeout(toastTimer);

  toastEl.hidden = false;
  toastEl.textContent = msg;

  toastEl.style.animation = "none";
  toastEl.offsetHeight;
  toastEl.style.animation = "";

  toastTimer = setTimeout(() => { toastEl.hidden = true; }, ms);
}

export const loading = {
  show(text = "Carregando..."){
    if(!loadingEl) return;
    loadingEl.hidden = false;
    const t = loadingEl.querySelector(".loading-text");
    if(t) t.textContent = text;
  },
  hide(){
    if(!loadingEl) return;
    loadingEl.hidden = true;
  }
};

export function setActiveMenuRoute(path){
  document.querySelectorAll(".menu a[data-route]").forEach(a => {
    a.classList.toggle("active", a.dataset.route === path);
  });
}

export function h(s=""){
  return String(s)
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

export function num(v, d=2){
  const n = Number(v);
  if(Number.isNaN(n)) return (0).toFixed(d);
  return n.toFixed(d);
}

export function fmtBRL(v){
  const n = Number(v||0);
  try{
    return new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(n);
  }catch{
    return "R$ " + num(n,2).replace(".", ",");
  }
}
