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
    if(Object.prototype.hasOwnProperty.call(obj, "safraId")) state.safraId = obj.safraId ?? null;
    if(Object.prototype.hasOwnProperty.call(obj, "fazendaId")) state.fazendaId = obj.fazendaId ?? null;
  }catch{}
}

export function saveState(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch{}
}
