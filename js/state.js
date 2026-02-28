// js/state.js
const KEY = "agropro_state_v1";

export const state = {
  safraId: null,
  fazendaId: null,
};

export function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw){
      const obj = JSON.parse(raw);
      state.safraId = obj.safraId ?? null;
      state.fazendaId = obj.fazendaId ?? null;
    }
  }catch{}
}

export function saveState(){
  localStorage.setItem(KEY, JSON.stringify(state));
}
