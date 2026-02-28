// js/ui.js
const toastEl = document.getElementById("toast");
const loadingEl = document.getElementById("loading");

let toastTimer = null;

export function toast(msg, ms = 2600){
  if(!toastEl) return;
  if(toastTimer) clearTimeout(toastTimer);

  toastEl.hidden = false;
  toastEl.textContent = msg;

  // replay animation
  toastEl.style.animation = "none";
  // eslint-disable-next-line no-unused-expressions
  toastEl.offsetHeight; // reflow
  toastEl.style.animation = "";

  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, ms);
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
