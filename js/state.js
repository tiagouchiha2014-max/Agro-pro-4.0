// js/state.js — Agro Pro (LOCAL)
const KEY = "agropro_state_v1";

export const state = {
  safraId: null,
  fazendaId: null,
};

export function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return;

    const obj = JSON.parse(raw) || {};
    // merge seguro (pra permitir novos campos no futuro)
    if(Object.prototype.hasOwnProperty.call(obj, "safraId")) state.safraId = obj.safraId ?? null;
    if(Object.prototype.hasOwnProperty.call(obj, "fazendaId")) state.fazendaId = obj.fazendaId ?? null;
  }catch{
    // se der erro, não trava o app
  }
}

export function saveState(){
  try{
    localStorage.setItem(KEY, JSON.stringify(state));
  }catch{
    // storage cheio/erro: não trava UI
  }
}

export function clearState(){
  state.safraId = null;
  state.fazendaId = null;
  try{ localStorage.removeItem(KEY); }catch{}
}
