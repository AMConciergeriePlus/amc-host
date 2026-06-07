import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const C = {
  bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",
  borderGold:"#3A2E10",gold:"#C8A951",goldDark:"#7A5E1A",
  white:"#FAF6EE",muted:"#5A5550",mutedMid:"#7A7470",
  successTxt:"#5BBF8A",warn:"#D4A52A",dangerTxt:"#E07A65",
  airbnb:"#FF5A5F",booking:"#003B95",
};
const F = {serif:"'Cormorant Garamond',serif",sans:"'Montserrat',sans-serif"};
const sourceColor=s=>s==="airbnb"?C.airbnb:s==="booking"?C.booking:s==="blocage"?"#555":C.warn;
const statutColor=s=>s==="confirmé"?C.successTxt:s==="annulé"?C.dangerTxt:s==="en attente"?C.warn:C.gold;

const Btn=({children,onClick,variant="gold",disabled,small,style:st})=>{
  const v={
    gold:{background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,color:"#080808",border:"none"},
    outline:{background:"transparent",color:C.gold,border:`0.5px solid ${C.goldDark}`},
    ghost:{background:"transparent",color:C.muted,border:`0.5px solid ${C.border}`},
    danger:{background:"transparent",color:C.dangerTxt,border:`0.5px solid #C0503A44`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...v[variant],padding:small?"5px 10px":"7px 16px",borderRadius:3,fontSize:small?9:10,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:F.sans,letterSpacing:1,textTransform:"uppercase",opacity:disabled?.45:1,...st}}>{children}</button>;
};

const Field=({label,children})=>(
  <div style={{marginBottom:12}}>
    <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>{label}</label>
    {children}
  </div>
);

const Input=({value,onChange,placeholder,type="text"})=>(
  <input type={type} value={value??""} onChange={onChange} placeholder={placeholder}
    style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}/>
);

const FormulaireRes=({res,apparts,onSave,onClose})=>{
  const empty={appart_id:"",source:"airbnb",voyageur_nom:"",voyageur_email:"",voyageur_tel:"",nb_voyageurs:1,checkin:"",checkout:"",montant:0,frais_menage:0,caution:0,statut:"confirmé",statut_paiement:"en attente",notes:""};
  const[form,setForm]=useState(res?{...res}:empty);
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState("");
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave=async()=>{
    if(!form.checkin||!form.checkout){setError("Les dates sont obligatoires");return;}
    setSaving(true);setError("");
    try{
      if(form.id){
        const{error:e}=await supabase.from('reservations').update(form).eq('id',form.id);
        if(e)throw e;
      }else{
        const{error:e}=await supabase.from('reservations').insert(form);
        if(e)throw e;
      }
      onSave();
    }catch(e){setError(e.message);}
    finally{setSaving(false);}
  };
  return(
    <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:10,overflow:"hidden",marginBottom:20}}>
      <div style={{background:C.surface,borderBottom:`0.5px solid ${C.border}`,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:F.serif,fontSize:16,color:C.gold}}>{form.id?"Modifier la réservation":"Nouvelle réservation"}</div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{padding:"18px 20px",maxHeight:600,overflowY:"auto"}}>
        {error&&<div style={{fontFamily:F.sans,fontSize:11,color:C.dangerTxt,marginBottom:12,padding:"8px 12px",background:"#C0503A15",borderRadius:4}}>{error}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Appartement">
            <select value={form.appart_id??""} onChange={e=>f("appart_id",e.target.value)}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}>
              <option value="">— Sélectionner —</option>
              {apparts.map(a=><option key={a.id} value={a.id}>{a.nom_long||a.nom}</option>)}
            </select>
          </Field>
          <Field label="Source">
            <select value={form.source} onChange={e=>f("source",e.target.value)}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}>
              {["airbnb","booking","manuel","blocage"].map(s=><option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Nom du voyageur"><Input value={form.voyageur_nom} onChange={e=>f("voyageur_nom",e.target.value)}/></Field>
          <Field label="Téléphone"><Input value={form.voyageur_tel} onChange={e=>f("voyageur_tel",e.target.value)}/></Field>
          <Field label="Check-in"><Input type="date" value={form.checkin} onChange={e=>f("checkin",e.target.value)}/></Field>
          <Field label="Check-out"><Input type="date" value={form.checkout} onChange={e=>f("checkout",e.target.value)}/></Field>
          <Field label="Montant (€)"><Input type="number" value={form.montant} onChange={e=>f("montant",+e.target.value)}/></Field>
          <Field label="Frais ménage (€)"><Input type="number" value={form.frais_menage} onChange={e=>f("frais_menage",+e.target.value)}/></Field>
          <Field label="Statut">
            <select value={form.statut} onChange={e=>f("statut",e.target.value)}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}>
              {["confirmé","en attente","annulé","en cours","terminé"].map(s=><option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Paiement">
            <select value={form.statut_paiement} onChange={e=>f("statut_paiement",e.target.value)}
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}>
              {["en attente","payé","remboursé"].map(s=><option key={s}>{s}</option>)}
            </select>
          </Field>
          <div style={{gridColumn:"1/-1"}}>
            <Field label="Notes">
              <textarea value={form.notes??""} onChange={e=>f("notes",e.target.value)} rows={2}
                style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none",resize:"none"}}/>
            </Field>
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

export default function Reservations(){
  const[reservations,setReservations]=useState([]);
  const[apparts,setApparts]=useState([]);
  const[loading,setLoading]=useState(true);
  const[editing,setEditing]=useState(null);
  const[showNew,setShowNew]=useState(false);
  const[filter,setFilter]=useState("tous");
  const[search,setSearch]=useState("");
  const load=async()=>{
    setLoading(true);
    const[{data:res},{data:ap}]=await Promise.all([
      supabase.from('reservations').select('*,appartements(nom,nom_long,color)').order('checkin',{ascending:false}),
      supabase.from('appartements').select('id,nom,nom_long').order('nom'),
    ]);
    setReservations(res||[]);setApparts(ap||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  const filtered=(reservations||[]).filter(r=>{
    if(filter!=="tous"&&r.source!==filter)return false;
    if(search&&!r.voyageur_nom?.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });
  const sansMontant=(reservations||[]).filter(r=>(!r.montant||r.montant===0)&&r.source!=="blocage");
  if(loading) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return(
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:`0.5px solid ${C.borderGold}`,paddingBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Réservations</h1>
          <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{reservations.length} réservation{reservations.length>1?"s":""}</p>
        </div>
        <Btn onClick={()=>{setEditing(null);setShowNew(true);}}>+ Nouvelle réservation</Btn>
      </div>
      {sansMontant.length>0&&(
        <div style={{background:`${C.warn}15`,border:`0.5px solid ${C.warn}44`,borderRadius:6,padding:"12px 16px",marginBottom:16}}>
          <div style={{fontFamily:F.sans,fontSize:11,color:C.warn,fontWeight:600}}>⚠️ {sansMontant.length} réservation{sansMontant.length>1?"s":""} sans montant — cliquez pour saisir</div>
        </div>
      )}
      {(showNew||editing)&&(
        <FormulaireRes res={editing} apparts={apparts} onSave={()=>{setShowNew(false);setEditing(null);load();}} onClose={()=>{setShowNew(false);setEditing(null);}}/>
      )}
      {/* Filtres */}
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un voyageur..."
          style={{background:C.card,border:`0.5px solid ${C.border}`,color:C.white,padding:"6px 12px",borderRadius:4,fontFamily:F.sans,fontSize:11,width:200,outline:"none"}}/>
        <div style={{display:"flex",gap:5}}>
          {["tous","airbnb","booking","manuel"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)}
              style={{background:filter===s?`${sourceColor(s)||C.gold}15`:"transparent",border:`0.5px solid ${filter===s?sourceColor(s)||C.gold:C.border}`,color:filter===s?sourceColor(s)||C.gold:C.muted,padding:"4px 10px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:600,textTransform:"uppercase"}}>
              {s}
            </button>
          ))}
        </div>
      </div>
      {/* Liste */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(r=>{
          const ap=r.appartements;
          const nuits=r.checkin&&r.checkout?Math.round((new Date(r.checkout)-new Date(r.checkin))/86400000):0;
          return(
            <div key={r.id} style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"13px 16px",borderLeft:`2px solid ${ap?.color||C.gold}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
                <div>
                  <div style={{fontFamily:F.serif,fontSize:14,color:C.white,marginBottom:2}}>{r.voyageur_nom||"Réservé"}</div>
                  <div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{ap?.nom_long||ap?.nom} · {r.checkin} → {r.checkout} · {nuits}n</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {(!r.montant||r.montant===0)&&r.source!=="blocage"&&(
                    <span style={{fontFamily:F.sans,fontSize:9,color:C.warn,fontWeight:600}}>⚠️ Montant manquant</span>
                  )}
                  {r.montant>0&&<span style={{fontFamily:F.serif,fontSize:18,color:C.gold,fontWeight:300}}>{r.montant} €</span>}
                  <Btn onClick={()=>{setEditing(r);setShowNew(false);}} variant="outline" small>✏️</Btn>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:8,padding:"1px 6px",borderRadius:10,background:`${sourceColor(r.source)}18`,color:sourceColor(r.source),border:`0.5px solid ${sourceColor(r.source)}44`,fontFamily:F.sans,fontWeight:500,textTransform:"uppercase"}}>{r.source}</span>
                <span style={{fontSize:8,padding:"1px 6px",borderRadius:10,background:`${statutColor(r.statut)}18`,color:statutColor(r.statut),border:`0.5px solid ${statutColor(r.statut)}44`,fontFamily:F.sans,fontWeight:500}}>{r.statut}</span>
                <span style={{fontSize:8,padding:"1px 6px",borderRadius:10,background:`${r.statut_paiement==="payé"?C.successTxt:C.warn}18`,color:r.statut_paiement==="payé"?C.successTxt:C.warn,border:`0.5px solid ${r.statut_paiement==="payé"?C.successTxt:C.warn}44`,fontFamily:F.sans,fontWeight:500}}>{r.statut_paiement}</span>
              </div>
            </div>
          );
        })}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"30px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Aucune réservation</div>}
      </div>
    </div>
  );
}
