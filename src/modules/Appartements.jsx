import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const C = {
  bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",
  borderGold:"#3A2E10",gold:"#C8A951",goldDark:"#7A5E1A",
  white:"#FAF6EE",muted:"#5A5550",successTxt:"#5BBF8A",
  dangerTxt:"#E07A65",warn:"#D4A52A",
};
const F = {serif:"'Cormorant Garamond',serif",sans:"'Montserrat',sans-serif"};
const TYPES = ["Studio","T1","T2","T3","T4","T5+","Loft","Duplex","Maison","Villa"];
const COLORS = ["#C8A951","#60A8E0","#5BBF8A","#E07A65","#A78BFA","#F59E0B"];

const Btn = ({children,onClick,variant="gold",disabled,small,style:st})=>{
  const v={
    gold:{background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,color:"#080808",border:"none"},
    outline:{background:"transparent",color:C.gold,border:`0.5px solid ${C.goldDark}`},
    ghost:{background:"transparent",color:C.muted,border:`0.5px solid ${C.border}`},
    danger:{background:"transparent",color:C.dangerTxt,border:`0.5px solid #C0503A44`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...v[variant],padding:small?"5px 10px":"7px 16px",borderRadius:3,fontSize:small?9:10,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:F.sans,letterSpacing:1,textTransform:"uppercase",opacity:disabled?.45:1,...st}}>{children}</button>;
};

const Field = ({label,children})=>(
  <div style={{marginBottom:12}}>
    <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>{label}</label>
    {children}
  </div>
);

const Input = ({value,onChange,placeholder,type="text"})=>(
  <input type={type} value={value??""} onChange={onChange} placeholder={placeholder}
    style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}/>
);

const Textarea = ({value,onChange,placeholder,rows=3})=>(
  <textarea value={value??""} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none",resize:"none"}}/>
);

const Select = ({value,onChange,options})=>(
  <select value={value??""} onChange={onChange}
    style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}>
    {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
  </select>
);

const FormulaireAppart = ({appart,proprios,equipes,onSave,onClose})=>{
  const empty = {nom:"",nom_long:"",type:"T3",adresse:"",ville:"",zone:"",capacite:2,chambres:1,lits:1,sdb:1,parking:false,wifi_nom:"",wifi_pw:"",code_acces:"",heure_checkin:"16:00",heure_checkout:"11:00",frais_menage:0,caution:0,proprio_id:null,equipe_id:null,airbnb_ical:"",booking_ical:"",statut:"actif",color:"#C8A951",points_forts:""};
  const [form,setForm] = useState(appart?{...appart}:empty);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSave = async()=>{
    if(!form.nom){setError("Le nom est obligatoire");return;}
    setSaving(true);setError("");
    try{
      const data={...form};
      if(!data.proprio_id) data.proprio_id=null;
      if(!data.equipe_id) data.equipe_id=null;
            delete data.equipes;
            delete data.proprios;
      if(form.id){
        const{error:e}=await supabase.from('appartements').update(data).eq('id',form.id);
        if(e)throw e;
      }else{
        const{error:e}=await supabase.from('appartements').insert(data);
        if(e)throw e;
      }
      onSave();
    }catch(e){setError(e.message);}
    finally{setSaving(false);}
  };
  return(
    <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:10,overflow:"hidden",marginBottom:20}}>
      <div style={{background:C.surface,borderBottom:`0.5px solid ${C.border}`,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:F.serif,fontSize:16,color:C.gold}}>{form.id?"Modifier":"Nouvel appartement"}</div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{padding:"18px 20px",maxHeight:600,overflowY:"auto"}}>
        {error&&<div style={{fontFamily:F.sans,fontSize:11,color:C.dangerTxt,marginBottom:12,padding:"8px 12px",background:"#C0503A15",borderRadius:4}}>{error}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Nom *"><Input value={form.nom} onChange={e=>f("nom",e.target.value)} placeholder="Elysian Paris - Disney"/></Field>
          <Field label="Nom long"><Input value={form.nom_long} onChange={e=>f("nom_long",e.target.value)} placeholder="Elysian Paris - Disney"/></Field>
          <Field label="Type"><Select value={form.type} onChange={e=>f("type",e.target.value)} options={TYPES}/></Field>
          <Field label="Couleur">
            <div style={{display:"flex",gap:8,marginTop:4}}>
              {COLORS.map(c=><div key={c} onClick={()=>f("color",c)} style={{width:24,height:24,borderRadius:"50%",background:c,border:`2px solid ${form.color===c?"#fff":"transparent"}`,cursor:"pointer"}}/>)}
            </div>
          </Field>
          <Field label="Adresse"><Input value={form.adresse} onChange={e=>f("adresse",e.target.value)} placeholder="B107, 4 Rue de la Varenne"/></Field>
          <Field label="Ville"><Input value={form.ville} onChange={e=>f("ville",e.target.value)} placeholder="Noisy-le-Grand"/></Field>
          <Field label="Capacité (personnes)"><Input type="number" value={form.capacite} onChange={e=>f("capacite",+e.target.value)}/></Field>
          <Field label="Chambres"><Input type="number" value={form.chambres} onChange={e=>f("chambres",+e.target.value)}/></Field>
          <Field label="Lits"><Input type="number" value={form.lits} onChange={e=>f("lits",+e.target.value)}/></Field>
          <Field label="Salles de bain"><Input type="number" value={form.sdb} onChange={e=>f("sdb",+e.target.value)}/></Field>
          <Field label="WiFi — Réseau"><Input value={form.wifi_nom} onChange={e=>f("wifi_nom",e.target.value)} placeholder="Freebox-XXXX"/></Field>
          <Field label="WiFi — Mot de passe"><Input value={form.wifi_pw} onChange={e=>f("wifi_pw",e.target.value)}/></Field>
          <div style={{gridColumn:"1/-1"}}>
            <Field label="Code d'accès"><Input value={form.code_acces} onChange={e=>f("code_acces",e.target.value)} placeholder="Code immeuble : 1234 / Boîte à clés : 5678"/></Field>
          </div>
          <Field label="Check-in"><Input value={form.heure_checkin} onChange={e=>f("heure_checkin",e.target.value)} placeholder="16:00"/></Field>
          <Field label="Check-out"><Input value={form.heure_checkout} onChange={e=>f("heure_checkout",e.target.value)} placeholder="11:00"/></Field>
          <Field label="Frais ménage (€)"><Input type="number" value={form.frais_menage} onChange={e=>f("frais_menage",+e.target.value)}/></Field>
          <Field label="Caution (€)"><Input type="number" value={form.caution} onChange={e=>f("caution",+e.target.value)}/></Field>
          <Field label="Parking">
            <div style={{display:"flex",gap:10,marginTop:4}}>
              {[{l:"Oui",v:true},{l:"Non",v:false}].map(opt=>(
                <button key={opt.l} onClick={()=>f("parking",opt.v)} style={{flex:1,background:form.parking===opt.v?`${C.gold}18`:"transparent",border:`0.5px solid ${form.parking===opt.v?C.gold:C.border}`,color:form.parking===opt.v?C.gold:C.muted,padding:"7px",borderRadius:4,fontSize:11,cursor:"pointer",fontFamily:F.sans}}>
                  {opt.l}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Propriétaire">
            <Select value={form.proprio_id??""} onChange={e=>f("proprio_id",e.target.value||null)}
              options={[{value:"",label:"— Sélectionner —"},...(proprios||[]).map(p=>({value:p.id,label:`${p.prenom??""} ${p.nom}`}))]}/>
          </Field>
          <Field label="Équipe ménage">
            <Select value={form.equipe_id??""} onChange={e=>f("equipe_id",e.target.value||null)}
              options={[{value:"",label:"— Sélectionner —"},...(equipes||[]).map(e=>({value:e.id,label:e.nom}))]}/>
          </Field>
          <Field label="iCal Airbnb"><Input value={form.airbnb_ical} onChange={e=>f("airbnb_ical",e.target.value)} placeholder="https://www.airbnb.fr/calendar/ical/..."/></Field>
          <Field label="iCal Booking"><Input value={form.booking_ical} onChange={e=>f("booking_ical",e.target.value)} placeholder="https://ical.booking.com/..."/></Field>
          <div style={{gridColumn:"1/-1"}}>
            <Field label="Points forts"><Textarea value={form.points_forts} onChange={e=>f("points_forts",e.target.value)} placeholder="Vue dégagée, proche Disney, parking privé..."/></Field>
          </div>
          <Field label="Statut">
            <Select value={form.statut} onChange={e=>f("statut",e.target.value)} options={["actif","inactif","maintenance"]}/>
          </Field>
        </div>
      </div>
      <div style={{padding:"11px 20px",borderTop:`0.5px solid ${C.border}`,background:C.surface,display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn onClick={onClose} variant="ghost">Annuler</Btn>
        <Btn onClick={handleSave} disabled={saving}>{saving?"Sauvegarde...":"💾 Sauvegarder"}</Btn>
      </div>
    </div>
  );
};

export default function Appartements(){
  const [apparts,setApparts]=useState([]);
  const [proprios,setProprios]=useState([]);
  const [equipes,setEquipes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [open,setOpen]=useState(null);
  const [deleting,setDeleting]=useState(null);
  const load=async()=>{
    setLoading(true);
    const[{data:ap},{data:pr},{data:eq}]=await Promise.all([
      supabase.from('appartements').select('*,proprios(nom,prenom),equipes(nom)').order('created_at'),
      supabase.from('proprios').select('*').order('nom'),
      supabase.from('equipes').select('*').order('nom'),
    ]);
    setApparts(ap||[]);setProprios(pr||[]);setEquipes(eq||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  const handleDelete=async(id)=>{
    await supabase.from('appartements').delete().eq('id',id);
    setDeleting(null);load();
  };
  const handleSave=()=>{setShowNew(false);setEditing(null);load();};
  if(loading) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return(
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:`0.5px solid ${C.borderGold}`,paddingBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Appartements</h1>
          <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{apparts.length} appartement{apparts.length>1?"s":""}</p>
        </div>
        <Btn onClick={()=>{setEditing(null);setShowNew(true);}}>+ Nouvel appartement</Btn>
      </div>
      {(showNew||editing)&&(
        <FormulaireAppart appart={editing} proprios={proprios} equipes={equipes} onSave={handleSave} onClose={()=>{setShowNew(false);setEditing(null);}}/>
      )}
      {apparts.length===0&&!showNew&&(
        <div style={{background:C.card,border:`0.5px solid ${C.borderGold}`,borderRadius:6,padding:"32px",textAlign:"center"}}>
          <div style={{fontFamily:F.serif,fontSize:18,color:C.gold,marginBottom:8}}>✦ Aucun appartement</div>
          <div style={{fontFamily:F.sans,fontSize:12,color:C.muted,marginBottom:16}}>Ajoutez votre premier appartement.</div>
          <Btn onClick={()=>setShowNew(true)}>+ Ajouter</Btn>
        </div>
      )}
      {apparts.map(ap=>(
        <div key={ap.id} style={{background:C.card,border:`0.5px solid ${open===ap.id?C.gold:C.border}`,borderRadius:6,padding:"14px 18px",marginBottom:10,borderLeft:`2px solid ${ap.color||C.gold}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{cursor:"pointer",flex:1}} onClick={()=>setOpen(open===ap.id?null:ap.id)}>
              <div style={{fontFamily:F.serif,fontSize:16,color:C.white,letterSpacing:.4,marginBottom:3}}>{ap.nom_long||ap.nom}</div>
              <div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{ap.adresse}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn onClick={e=>{e.stopPropagation();setEditing(ap);setShowNew(false);}} variant="outline" small>✏️ Modifier</Btn>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:`${C.gold}18`,color:C.gold,border:`0.5px solid ${C.gold}44`,fontFamily:F.sans,fontWeight:500}}>{ap.type||"T3"}</span>
            <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:"#7A747018",color:C.muted,border:`0.5px solid #7A747044`,fontFamily:F.sans,fontWeight:500}}>{ap.capacite} pers.</span>
            <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:`${C.successTxt}18`,color:C.successTxt,border:`0.5px solid ${C.successTxt}44`,fontFamily:F.sans,fontWeight:500}}>{ap.statut||"actif"}</span>
            {ap.parking&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:`${C.successTxt}18`,color:C.successTxt,border:`0.5px solid ${C.successTxt}44`,fontFamily:F.sans,fontWeight:500}}>Parking</span>}
            {ap.proprios&&<span style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginLeft:4}}>{ap.proprios.prenom} {ap.proprios.nom}</span>}
          </div>
          {open===ap.id&&(
            <div className="fade" style={{marginTop:12,paddingTop:12,borderTop:`0.5px solid ${C.border}`}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                {[
                  {l:"WiFi",v:ap.wifi_nom||"—"},
                  {l:"Mot de passe",v:ap.wifi_pw||"—"},
                  {l:"Code accès",v:ap.code_acces||"—"},
                  {l:"Check-in",v:ap.heure_checkin||"16:00"},
                  {l:"Check-out",v:ap.heure_checkout||"11:00"},
                  {l:"Frais ménage",v:`${ap.frais_menage||0} €`},
                ].map((it,i)=>(
                  <div key={i} style={{background:C.surface,borderRadius:4,padding:"7px 10px"}}>
                    <div style={{fontFamily:F.sans,fontSize:8,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{it.l}</div>
                    <div style={{fontFamily:F.sans,fontSize:11,color:C.white}}>{it.v}</div>
                  </div>
                ))}
              </div>
              {/* iCal */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {[
                  {l:"iCal Airbnb",v:ap.airbnb_ical,c:"#FF5A5F"},
                  {l:"iCal Booking",v:ap.booking_ical,c:"#003B95"},
                ].map((it,i)=>(
                  <div key={i} style={{background:C.surface,borderRadius:4,padding:"7px 10px"}}>
                    <div style={{fontFamily:F.sans,fontSize:8,color:it.c,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{it.l}</div>
                    <div style={{fontFamily:"monospace",fontSize:9,color:it.v?C.successTxt:C.dangerTxt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.v?"✓ Configuré":"✕ Non configuré"}</div>
                  </div>
                ))}
              </div>
              {/* iCal export AMC HOST */}
              <div style={{background:`${C.goldDark}15`,border:`0.5px solid ${C.borderGold}`,borderRadius:5,padding:"10px 12px",marginBottom:12}}>
                <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Lien iCal export AMC HOST → Airbnb & Booking</div>
                <div style={{fontFamily:"monospace",fontSize:10,color:C.white,wordBreak:"break-all",marginBottom:8}}>
                  {`https://ijseaolohnnjiicepety.supabase.co/functions/v1/ical-export?appart_id=${ap.id}`}
                </div>
                <button onClick={()=>navigator.clipboard?.writeText(`https://ijseaolohnnjiicepety.supabase.co/functions/v1/ical-export?appart_id=${ap.id}`)}
                  style={{background:"transparent",border:`0.5px solid ${C.goldDark}`,color:C.gold,padding:"4px 10px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,letterSpacing:.5}}>
                  📋 Copier le lien
                </button>
              </div>
              {ap.points_forts&&<div style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginBottom:12}}>✦ {ap.points_forts}</div>}
              <div style={{display:"flex",gap:8,paddingTop:10,borderTop:`0.5px solid ${C.border}`}}>
                <Btn onClick={()=>{setEditing(ap);setShowNew(false);}} variant="outline" small>✏️ Modifier</Btn>
                {deleting===ap.id?(
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontFamily:F.sans,fontSize:11,color:C.dangerTxt}}>Confirmer la suppression ?</span>
                    <Btn onClick={()=>handleDelete(ap.id)} variant="danger" small>Oui</Btn>
                    <Btn onClick={()=>setDeleting(null)} variant="ghost" small>Non</Btn>
                  </div>
                ):(
                  <Btn onClick={()=>setDeleting(ap.id)} variant="danger" small>🗑️ Supprimer</Btn>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
