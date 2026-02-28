const KEY = "agropro_db_v1";

function uid(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
function readDB(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw) return JSON.parse(raw);
  }catch{}
  return null;
}
function writeDB(db){ localStorage.setItem(KEY, JSON.stringify(db)); }

export function ensureSeed(){
  let db = readDB();
  if(!db){
    db = {
      meta:{ version:1, created_at:new Date().toISOString() },
      safras:[{ id:"s1", nome:"Safra 25/26", ativa:true }],
      fazendas:[{ id:"f1", nome:"Fazenda Principal", ativa:true }],
      talhoes:[{ id:"t1", fazenda_id:"f1", nome:"Talhão 01", area_ha:50 }],
      chuvas_registros: [],
      produtos:[], estoque_movs:[], aplicacoes:[], colheitas:[], colheita_cargas:[], fretes:[],
      financeiro_lancamentos:[], funcionarios:[], folha_pagamentos:[], config_precos_graos:[]
    };
    writeDB(db);
  }
  return db;
}

function ok(data){ return { data, error:null }; }
function fail(message){ return { data:null, error:{ message } }; }
function req(v, name){ if(!v) throw new Error(`${name} é obrigatório`); }

function sortSafras(a,b){
  return (b.ativa?1:0)-(a.ativa?1:0) || (a.nome||"").localeCompare(b.nome||"");
}
function sortNome(a,b){ return (a.nome||"").localeCompare(b.nome||""); }

export async function listSafras(){ const db = ensureSeed(); return ok([...db.safras].sort(sortSafras)); }
export async function createSafra({ nome, ativa=false }){
  try{
    req(nome,"nome");
    const db = ensureSeed();
    const s = { id:uid("s"), nome, ativa:!!ativa };
    db.safras.push(s); writeDB(db);
    return ok(s);
  }catch(e){ return fail(e.message); }
}
export async function setSafraAtiva(safraId){
  try{
    req(safraId,"safraId");
    const db = ensureSeed();
    db.safras.forEach(s=>{ s.ativa = (s.id===safraId); });
    writeDB(db);
    return ok(true);
  }catch(e){ return fail(e.message); }
}

export async function listFazendas({ somenteAtivas=true } = {}){
  const db = ensureSeed();
  let data = [...db.fazendas];
  if(somenteAtivas) data = data.filter(f=>f.ativa);
  data.sort(sortNome);
  return ok(data);
}
export async function createFazenda({ nome, ativa=true }){
  try{
    req(nome,"nome");
    const db = ensureSeed();
    const f = { id:uid("f"), nome, ativa:!!ativa };
    db.fazendas.push(f); writeDB(db);
    return ok(f);
  }catch(e){ return fail(e.message); }
}

export async function listTalhoes({ fazendaId }){
  try{
    req(fazendaId,"fazendaId");
    const db = ensureSeed();
    const data = db.talhoes.filter(t=>t.fazenda_id===fazendaId).sort(sortNome);
    return ok(data);
  }catch(e){ return fail(e.message); }
}
export async function createTalhao({ fazendaId, nome, area_ha=0 }){
  try{
    req(fazendaId,"fazendaId"); req(nome,"nome");
    const db = ensureSeed();
    const t = { id:uid("t"), fazenda_id:fazendaId, nome, area_ha:Number(area_ha||0) };
    db.talhoes.push(t); writeDB(db);
    return ok(t);
  }catch(e){ return fail(e.message); }
}

export async function listChuvas({ safraId, fazendaId, limit=200 }){
  try{
    req(safraId,"safraId"); req(fazendaId,"fazendaId");
    const db = ensureSeed();
    const data = db.chuvas_registros
      .filter(r=>r.safra_id===safraId && r.fazenda_id===fazendaId)
      .sort((a,b)=>String(b.data).localeCompare(String(a.data)))
      .slice(0, limit);
    return ok(data);
  }catch(e){ return fail(e.message); }
}
export async function addChuva({ safraId, fazendaId, talhaoId, data, mm, fonte="manual" }){
  try{
    req(safraId,"safraId"); req(fazendaId,"fazendaId"); req(talhaoId,"talhaoId"); req(data,"data");
    const db = ensureSeed();
    const r = { id:uid("c"), safra_id:safraId, fazenda_id:fazendaId, talhao_id:talhaoId, data, mm:Number(mm||0), fonte };
    db.chuvas_registros.push(r); writeDB(db);
    return ok(r);
  }catch(e){ return fail(e.message); }
}

export async function getRelatorioTalhoes({ safraId, fazendaId }){
  try{
    req(safraId,"safraId"); req(fazendaId,"fazendaId");
    const db = ensureSeed();
    const talhoes = db.talhoes.filter(t=>t.fazenda_id===fazendaId);

    const chuvaMap = new Map();
    for(const r of db.chuvas_registros){
      if(r.safra_id===safraId && r.fazenda_id===fazendaId){
        chuvaMap.set(r.talhao_id, (chuvaMap.get(r.talhao_id)||0) + Number(r.mm||0));
      }
    }

    const rows = talhoes.map(t=>{
      const area = Number(t.area_ha||0);
      const custo_total = 0;
      const toneladas = 0;
      const preco_cfg_por_ton = 0;
      const receita_estimada = toneladas * preco_cfg_por_ton;

      return {
        talhao_id: t.id,
        talhao_nome: t.nome,
        area_ha: area,
        chuva_mm_safra: Number(chuvaMap.get(t.id)||0),
        toneladas,
        custo_total,
        custo_por_ha: area>0 ? custo_total/area : 0,
        preco_cfg_por_ton,
        receita_estimada
      };
    }).sort((a,b)=>String(a.talhao_nome).localeCompare(String(b.talhao_nome)));

    return ok(rows);
  }catch(e){ return fail(e.message); }
}
