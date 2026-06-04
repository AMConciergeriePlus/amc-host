import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const C = {bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",borderGold:"#3A2E10",gold:"#C8A951",goldDark:"#7A5E1A",white:"#FAF6EE",muted:"#5A5550",mutedMid:"#7A7470",successTxt:"#5BBF8A",warn:"#D4A52A",dangerTxt:"#E07A65"};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
const STATUS_COLORS = {a_faire:C.warn,en_cours:'#60A8E0',fait:C.successTxt,probleme:C.dangerTxt};
const STATUS_LABELS = {a_faire:'A faire',en_cours:'En cours',fait:'Fait',probleme:'Probleme'};
export default function Menage() {
  const [menages,setMenages]=useState([]);
  const [equipes,setEquipes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState('all');
  useEffect(()=>{load();},[]); // eslint-disable-line
  const load = async()=>{
    const [{data:m},{data:e}] = await Promise.all([
      supabase.from('menages').select('*,appartements(nom,nom_long,color),equipes(nom)').order('date'),
      supabase.from('equipes').select('*').order('nom'),
    ]);
    setMenages(m||[]);setEquipes(e||[]);setLoading(false);
  };
  const updateStatus = async(id,statut)=>{
    await supabase.from('menages').update({statut}).eq('id',id);
    load();
  };
  const filtered = filter==='all'?menages:menages.filter(m=>m.statut===filter);
  if(loading) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return (
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Menage & equipes</h1>
          <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{filtered.length} tache{filtered.length>1?"s":""} · {equipes.length} equipe{equipes.length>1?"s":""}</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          {['all','a_faire','en_cours','fait','probleme'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?'linear-gradient(135deg,'+C.goldDark+','+C.gold+')':'transparent',border:'0.5px solid '+(filter===f?C.gold:C.border),color:filter===f?C.bg:C.muted,padding:"5px 10px",borderRadius:3,cursor:"pointer",fontFamily:F.sans,fontSize:9,fontWeight:600,textTransform:"uppercase"}}>
              {f==='all'?'Tout':(STATUS_LABELS[f]||f)}
            </button>
          ))}
        </div>
      </div>
      {equipes.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat("+Math.min(equipes.length,4)+",1fr)",gap:10,marginBottom:20}}>
          {equipes.map(e=>{
            const nb = menages.filter(m=>m.equipe_id===e.id&&m.statut!=='fait').length;
            return (
              <div key={e.id} style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:"12px 14px"}}>
                <div style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginBottom:4}}>{e.nom}</div>
                <div style={{fontFamily:F.serif,fontSize:20,color:nb>0?C.warn:C.successTxt,fontWeight:300}}>{nb} <span style={{fontFamily:F.sans,fontSize:9,color:C.muted}}>en attente</span></div>
              </div>
            );
          })}
        </div>
      )}
      {filtered.length===0?(
        <div style={{background:C.card,border:'0.5px solid '+C.borderGold,borderRadius:6,padding:"32px",textAlign:"center"}}>
          <div style={{fontFamily:F.serif,fontSize:18,color:C.gold,marginBottom:8}}>Aucune tache</div>
          <div style={{fontFamily:F.sans,fontSize:12,color:C.muted}}>Les taches de menage apparaitront ici.</div>
        </div>
      ):filtered.map(m=>(
        <div key={m.id} style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:"14px 18px",marginBottom:10,borderLeft:'2px solid '+(m.appartements?.color||C.gold),transition:"all .15s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:F.serif,fontSize:16,color:C.white,marginBottom:3}}>{m.appartements?.nom_long||m.appartements?.nom||"—"}</div>
              <div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{m.date||"—"} · {m.equipes?.nom||"Equipe non assignee"}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{background:(STATUS_COLORS[m.statut]||C.muted)+'22',color:STATUS_COLORS[m.statut]||C.muted,border:'0.5px solid '+(STATUS_COLORS[m.statut]||C.muted)+'44',padding:"2px 9px",borderRadius:10,fontFamily:F.sans,fontSize:9,fontWeight:500}}>
                {STATUS_LABELS[m.statut]||m.statut||"—"}
              </span>
              <select value={m.statut||'a_faire'} onChange={e=>updateStatus(m.id,e.target.value)}
                style={{background:C.surface,border:'0.5px solid '+C.border,color:C.muted,padding:"4px 8px",borderRadius:3,fontFamily:F.sans,fontSize:9,cursor:"pointer"}}>
                {Object.entries(STATUS_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          {m.notes&&<div style={{marginTop:8,fontFamily:F.sans,fontSize:11,color:C.mutedMid}}>Notes: {m.notes}</div>}
        </div>
      ))}
    </div>
  );
}
