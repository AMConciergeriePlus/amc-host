import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const C = {
  bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",
  borderGold:"#3A2E10",gold:"#C8A951",goldDark:"#7A5E1A",
  white:"#FAF6EE",muted:"#5A5550",successTxt:"#5BBF8A",
  dangerTxt:"#E07A65",warn:"#D4A52A",
};
const F={serif:"'Cormorant Garamond',serif",sans:"'Montserrat',sans-serif"};
const STATUTS=[
  {v:"planifié",  c:"#60A8E0",l:"Planifié"},
  {v:"en cours",  c:"#D4A52A",l:"En cours"},
  {v:"terminé",   c:"#5BBF8A",l:"Terminé"},
  {v:"problème",  c:"#E07A65",l:"Problème"},
];

const Btn=({children,onClick,variant="gold",disabled,small,style:st})=>{
  const v={
    gold:{background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,color:"#080808",border:"none"},
    outline:{background:"transparent",color:C.gold,border:`0.5px solid ${C.goldDark}`},
    ghost:{background:"transparent",color:C.muted,border:`0.5px solid ${C.border}`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...v[variant],padding:small?"5px 10px":"7px 16px",borderRadius:3,fontSize:small?9:10,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:F.sans,letterSpacing:1,textTransform:"uppercase",opacity:disabled?.45:1,...st}}>{children}</button>;
};

const FormulaireMission=({mission,apparts,equipes,onSave,onClose})=>{
  const empty={appart_id:"",equipe_id:"",date:"",heure_limit:"13:00",statut:"planifié",note_globale:""};
  const[form,setForm]=useState(mission?{...mission}:empty);
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState("");
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave=async()=>{
    if(!form.date||!form.appart_id){setError("L'appartement et la date sont obligatoires");return;}
    setSaving(true);setError("");
    try{
      if(form.id){
        const{error:e}=await supabase.from('missions_menage').update(form).eq('id',form.id);
        if(e)throw e;
      }else{
        const{error:e}=await supabase.from('missions_menage').insert({...form,checklist:'[]'});
        if(e)throw e;
      }
      onSave();
    }catch(e){setError(e.message);}
    finally{setSaving(false);}
  };
  return(
    <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:10,overflow:"hidden",marginBottom:20}}>
      <div style={{background:C.surface,borderBottom:`0.5px solid ${C.border}`,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:F.serif,fontSize:16,color:C.gold}}>{form.id?"Modifier la mission":"Nouvelle mission ménage"}</div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{padding:"18px 20px"}}>
        {error&&<div style={{fontFamily:F.sans,fontSize:11,color:C.dangerTxt,marginBottom:12,padding:"8px 12px",background:"#C0503A15",borderRadius:4}}>{error}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Appartement *</label>
            <select value={form.appart_id??""} onChange={e=>f("appart_id",e.target.value)}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}>
              <option value="">— Sélectionner —</option>
              {apparts.map(a=><option key={a.id} value={a.id}>{a.nom_long||a.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Équipe ménage</label>
            <select value={form.equipe_id??""} onChange={e=>f("equipe_id",e.target.value||null)}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}>
              <option value="">— Sélectionner —</option>
              {equipes.map(e=><option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Date *</label>
            <input type="date" value={form.date??""} onChange={e=>f("date",e.target.value)}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}/>
          </div>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Heure limite</label>
            <input type="time" value={form.heure_limit??""} onChange={e=>f("heure_limit",e.target.value)}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}/>
          </div>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Statut</label>
            <select value={form.statut??""} onChange={e=>f("statut",e.target.value)}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}>
              {STATUTS.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Notes</label>
            <textarea value={form.note_globale??""} onChange={e=>f("note_globale",e.target.value)} rows={2}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none",resize:"none"}}/>
          </div>
        </div>
      </div>
      <div style={{padding:"11px 20px",borderTop:`0.5px solid ${C.border}`,background:C.surface,display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn onClick={onClose} variant="ghost">Annuler</Btn>
        <Btn onClick={handleSave} disabled={saving}>{saving?"Sauvegarde...":"💾 Sauvegarder"}</Btn>
      </div>
    </div>
  );
};

export default function Menage(){
  const[missions,setMissions]=useState([]);
  const[apparts,setApparts]=useState([]);
  const[equipes,setEquipes]=useState([]);
  const[loading,setLoading]=useState(true);
  const[editing,setEditing]=useState(null);
  const[showNew,setShowNew]=useState(false);
  const[filterStatut,setFilterStatut]=useState("tous");
  const load=async()=>{
    setLoading(true);
    const[{data:m},{data:ap},{data:eq}]=await Promise.all([
      supabase.from('missions_menage').select('*,appartements(nom,nom_long,color),equipes(nom)').order('date',{ascending:false}),
      supabase.from('appartements').select('id,nom,nom_long').order('nom'),
      supabase.from('equipes').select('*').order('nom'),
    ]);
    setMissions(m||[]);setApparts(ap||[]);setEquipes(eq||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  const updateStatut=async(id,statut)=>{
    await supabase.from('missions_menage').update({statut}).eq('id',id);
    load();
  };
  const filtered=filterStatut==="tous"?missions:missions.filter(m=>m.statut===filterStatut);
  if(loading) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return(
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:`0.5px solid ${C.borderGold}`,paddingBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Ménage & équipes</h1>
          <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{missions.length} mission{missions.length>1?"s":""}</p>
        </div>
        <Btn onClick={()=>{setEditing(null);setShowNew(true);}}>+ Nouvelle mission</Btn>
      </div>
      {(showNew||editing)&&(
        <FormulaireMission mission={editing} apparts={apparts} equipes={equipes}
          onSave={()=>{setShowNew(false);setEditing(null);load();}}
          onClose={()=>{setShowNew(false);setEditing(null);}}/>
      )}
      {/* Filtres statut */}
      <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
        <button onClick={()=>setFilterStatut("tous")} style={{background:filterStatut==="tous"?`${C.gold}15`:"transparent",border:`0.5px solid ${filterStatut==="tous"?C.gold:C.border}`,color:filterStatut==="tous"?C.gold:C.muted,padding:"4px 10px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:600,textTransform:"uppercase"}}>Tous</button>
        {STATUTS.map(s=>(
          <button key={s.v} onClick={()=>setFilterStatut(s.v)} style={{background:filterStatut===s.v?`${s.c}15`:"transparent",border:`0.5px solid ${filterStatut===s.v?s.c:C.border}`,color:filterStatut===s.v?s.c:C.muted,padding:"4px 10px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:600,textTransform:"uppercase"}}>
            {s.l}
          </button>
        ))}
      </div>
      {filtered.length===0&&!showNew&&(
        <div style={{background:C.card,border:`0.5px solid ${C.borderGold}`,borderRadius:6,padding:"32px",textAlign:"center"}}>
          <div style={{fontFamily:F.serif,fontSize:18,color:C.gold,marginBottom:8}}>✦ Aucune mission</div>
          <div style={{fontFamily:F.sans,fontSize:12,color:C.muted,marginBottom:16}}>Les missions sont créées automatiquement à chaque réservation.</div>
          <Btn onClick={()=>setShowNew(true)}>+ Créer manuellement</Btn>
        </div>
      )}
      {filtered.map(m=>{
        const statut=STATUTS.find(s=>s.v===m.statut)||STATUTS[0];
        return(
          <div key={m.id} style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"13px 16px",marginBottom:10,borderLeft:`2px solid ${statut.c}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontFamily:F.serif,fontSize:14,color:C.white,marginBottom:2}}>{m.appartements?.nom_long||m.appartements?.nom||"—"}</div>
                <div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{m.date} · Limite {m.heure_limit} {m.equipes&&`· ${m.equipes.nom}`}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:8,padding:"2px 8px",borderRadius:10,background:`${statut.c}18`,color:statut.c,border:`0.5px solid ${statut.c}44`,fontFamily:F.sans,fontWeight:600}}>{statut.l}</span>
                <Btn onClick={()=>{setEditing(m);setShowNew(false);}} variant="outline" small>✏️</Btn>
              </div>
            </div>
            {/* Changer le statut */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {STATUTS.map(s=>(
                <button key={s.v} onClick={()=>updateStatut(m.id,s.v)} disabled={m.statut===s.v}
                  style={{background:m.statut===s.v?`${s.c}18`:"transparent",border:`0.5px solid ${m.statut===s.v?s.c:C.border}`,color:m.statut===s.v?s.c:C.muted,padding:"3px 8px",borderRadius:3,fontSize:8,cursor:m.statut===s.v?"default":"pointer",fontFamily:F.sans,fontWeight:600,textTransform:"uppercase",opacity:m.statut===s.v?1:.6}}>
                  {s.l}
                </button>
              ))}
            </div>
            {m.note_globale&&<div style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:8}}>📝 {m.note_globale}</div>}
          </div>
        );
      })}
    </div>
  );
}
