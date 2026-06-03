import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const C = {
  bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",
  borderGold:"#3A2E10",gold:"#C8A951",goldLight:"#E2C97E",goldDark:"#7A5E1A",
  white:"#FAF6EE",muted:"#5A5550",mutedMid:"#7A7470",
  successTxt:"#5BBF8A",warn:"#D4A52A",dangerTxt:"#E07A65",
};
const F = {
  serif:"'Cormorant Garamond','Palatino Linotype',serif",
  sans:"'Montserrat','Trebuchet MS',sans-serif",
};
const TYPES = ["Studio","T1","T2","T3","T4","T5+","Loft","Duplex","Maison","Villa"];
const COLORS = ["#C8A951","#60A8E0","#5BBF8A","#E07A65","#A78BFA","#F59E0B","#10B981"];

const Pill = ({label,color,small}) => (
  <span style={{fontSize:small?8:10,padding:small?"1px 6px":"2px 9px",borderRadius:10,background:`${color}18`,color,border:`0.5px solid ${color}44`,fontFamily:F.sans,letterSpacing:.5,whiteSpace:"nowrap",fontWeight:500}}>{label}</span>
);

const Btn = ({children,onClick,variant="gold",disabled,small,style:st}) => {
  const v={
    gold:{background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,color:C.bg,border:"none"},
    outline:{background:"transparent",color:C.gold,border:`0.5px solid ${C.goldDark}`},
    ghost:{background:"transparent",color:C.muted,border:`0.5px solid ${C.border}`},
    danger:{background:"transparent",color:C.dangerTxt,border:`0.5px solid #C0503A44`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...v[variant],padding:small?"5px 10px":"7px 16px",borderRadius:3,fontSize:small?9:10,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:F.sans,letterSpacing:1,textTransform:"uppercase",opacity:disabled?.45:1,...st}}>{children}</button>;
};

const Field = ({label,children,required}) => (
  <div style={{marginBottom:12}}>
    <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>
      {label}{required&&<span style={{color:C.dangerTxt,marginLeft:3}}>*</span>}
    </label>
    {children}
  </div>
);

const Input = ({value,onChange,placeholder,type="text"}) => (
  <input type={type} value={value||""} onChange={onChange} placeholder={placeholder}
    style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}/>
);

const FormulaireAppart = ({appart, proprios, equipes, onSave, onClose}) => {
  const [form, setForm] = useState(appart || {
    nom:"",nom_long:"",type:"T2",adresse:"",ville:"",zone:"",
    capacite:2,chambres:1,lits:1,sdb:1,parking:false,
    wifi_nom:"",wifi_pw:"",code_acces:"",
    heure_checkin:"16:00",heure_checkout:"11:00",
    prix_base:80,frais_menage:50,caution:300,
    proprio_id:"",equipe_id:"",
    airbnb_ical:"",booking_ical:"",
    statut:"actif",color:"#C8A951",points_forts:"",
  });
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const handleSave = async () => {
    if(!form.nom){setError("Le nom est obligatoire.");return;}
    setSaving(true);setError("");
    try {
      const data={...form};
      if(!data.proprio_id) delete data.proprio_id;
      if(!data.equipe_id) delete data.equipe_id;
      if(form.id){
        const {error}=await supabase.from('appartements').update(data).eq('id',form.id);
        if(error) throw error;
      } else {
        const {error}=await supabase.from('appartements').insert(data);
        if(error) throw error;
      }
      onSave();
    } catch(e){setError(e.message);}
    finally{setSaving(false);}
  };

  return(
    <div style={{background:C.card,border:`1px solid ${C.gold}44`,borderRadius:10,overflow:"hidden",marginBottom:20}}>
      <div style={{background:C.surface,borderBottom:`0.5px solid ${C.border}`,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:F.serif,fontSize:16,color:C.gold}}>{form.id?"Modifier l'appartement":"Nouvel appartement"}</div>
        <button onClick={onClose} style={{background:`${C.goldDark}33`,border:`0.5px solid ${C.goldDark}`,color:C.gold,width:28,height:28,borderRadius:4,cursor:"pointer",fontSize:14}}>✕</button>
      </div>
      <div style={{padding:"18px 20px",maxHeight:600,overflowY:"auto"}}>
        {error&&<div style={{fontFamily:F.sans,fontSize:11,color:C.dangerTxt,marginBottom:12,padding:"8px 12px",background:"#C0503A15",borderRadius:4}}>{error}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Nom *"><Input value={form.nom} onChange={e=>f("nom",e.target.value)} placeholder="Elysian"/></Field>
          <Field label="Nom long"><Input value={form.nom_long} onChange={e=>f("nom_long",e.target.value)} placeholder="Elysian — Noisy-le-Grand"/></Field>
          <Field label="Type">
            <select value={form.type} onChange={e=>f("type",e.target.value)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12}}>
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Couleur">
            <div style={{display:"flex",gap:8,marginTop:4}}>
              {COLORS.map(c=>(
                <div key={c} onClick={()=>f("color",c)} style={{width:24,height:24,borderRadius:"50%",background:c,border:`2px solid ${form.color===c?"#fff":"transparent"}`,cursor:"pointer"}}/>
              ))}
            </div>
          </Field>
          <Field label="Adresse"><Input value={form.adresse} onChange={e=>f("adresse",e.target.value)} placeholder="B107, 4 Rue de la Varenne"/></Field>
          <Field label="Ville"><Input value={form.ville} onChange={e=>f("ville",e.target.value)} placeholder="Noisy-le-Grand"/></Field>
          <Field label="Capacité"><Input type="number" value={form.capacite} onChange={e=>f("capacite",+e.target.value)}/></Field>
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
          <Field label="Prix de base (€/nuit)"><Input type="number" value={form.prix_base} onChange={e=>f("prix_base",+e.target.value)}/></Field>
          <Field label="Frais ménage (€)"><Input type="number" value={form.frais_menage} onChange={e=>f("frais_menage",+e.target.value)}/></Field>
          <Field label="Caution (€)"><Input type="number" value={form.caution} onChange={e=>f("caution",+e.target.value)}/></Field>
          <Field label="Parking">
            <div style={{display:"flex",gap:10,marginTop:4}}>
              {[{l:"Oui",v:true},{l:"Non",v:false}].map(opt=>(
                <button key={opt.l} onClick={()=>f("parking",opt.v)} style={{flex:1,background:form.parking===opt.v?`${C.gold}18`:"transparent",border:`0.5px solid ${form.parking===opt.v?C.gold:C.border}`,color:form.parking===opt.v?C.gold:C.muted,padding:"7px 0",borderRadius:4,fontSize:11,cursor:"pointer",fontFamily:F.sans}}>
                  {opt.l}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Propriétaire">
            <select value={form.proprio_id||""} onChange={e=>f("proprio_id",e.target.value||null)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12}}>
              <option value="">— Sélectionner —</option>
              {proprios.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </Field>
          <Field label="Équipe ménage">
            <select value={form.equipe_id||""} onChange={e=>f("equipe_id",e.target.value||null)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12}}>
              <option value="">— Sélectionner —</option>
              {equipes.map(e=><option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </Field>
          <Field label="iCal Airbnb"><Input value={form.airbnb_ical} onChange={e=>f("airbnb_ical",e.target.value)} placeholder="https://www.airbnb.com/calendar/ical/..."/></Field>
          <Field label="iCal Booking"><Input value={form.booking_ical} onChange={e=>f("booking_ical",e.target.value)} placeholder="https://admin.booking.com/..."/></Field>
          <div style={{gridColumn:"1/-1"}}>
            <Field label="Points forts">
              <textarea value={form.points_forts||""} onChange={e=>f("points_forts",e.target.value)} rows={2}
                placeholder="Vue dégagée, proche Disney, parking privé..."
                style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,resize:"none"}}/>
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

export default function Appartements() {
  const [apparts,setApparts]=useState([]);
  const [proprios,setProprios]=useState([]);
  const [equipes,setEquipes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [open,setOpen]=useState(null);
  const [deleting,setDeleting]=useState(null);

  const load=async()=>{
    setLoading(true);
    const [{data:ap},{data:pr},{data:eq}]=await Promise.all([
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

  if(loading) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;

  return(
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:`0.5px solid ${C.borderGold}`,paddingBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Appartements</h1>
          <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{apparts.length} appartement{apparts.length>1?"s":""} · Studio, T1→T5+, Loft, Duplex, Maison, Villa</p>
        </div>
        <Btn onClick={()=>{setEditing(null);setShowForm(true);}}>+ Nouvel appartement</Btn>
      </div>

      {(showForm||editing)&&(
        <FormulaireAppart appart={editing} proprios={proprios} equipes={equipes}
          onSave={()=>{setShowForm(false);setEditing(null);load();}}
          onClose={()=>{setShowForm(false);setEditing(null);}}/>
      )}

      {apparts.length===0&&!showForm&&(
        <div style={{background:C.card,border:`0.5px solid ${C.borderGold}`,borderRadius:6,padding:"32px",textAlign:"center"}}>
          <div style={{fontFamily:F.serif,fontSize:18,color:C.gold,marginBottom:8}}>✦ Aucun appartement</div>
          <div style={{fontFamily:F.sans,fontSize:12,color:C.muted,marginBottom:16}}>Ajoutez votre premier appartement pour commencer.</div>
          <Btn onClick={()=>setShowForm(true)}>+ Ajouter un appartement</Btn>
        </div>
      )}

      {apparts.map(ap=>(
        <div key={ap.id} style={{background:C.card,border:`0.5px solid ${open===ap.id?C.gold:C.border}`,borderRadius:6,padding:"14px 18px",marginBottom:10,borderLeft:`2px solid ${ap.color||C.gold}`,transition:"all .15s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{cursor:"pointer",flex:1}} onClick={()=>setOpen(open===ap.id?null:ap.id)}>
              <div style={{fontFamily:F.serif,fontSize:16,color:C.white,letterSpacing:.4,marginBottom:3}}>{ap.nom_long||ap.nom}</div>
              <div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{ap.adresse}</div>
            </div>
            <div style={{fontFamily:F.serif,fontSize:20,color:C.gold,fontWeight:300}}>{ap.prix_base} €<span style={{fontFamily:F.sans,fontSize:9,color:C.muted}}>/nuit</span></div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:open===ap.id?12:0}}>
            <Pill label={ap.type||"T2"} color={C.goldLight} small/>
            <Pill label={`${ap.capacite} pers.`} color={C.mutedMid} small/>
            <Pill label={ap.statut||"actif"} color={C.successTxt} small/>
            {ap.parking&&<Pill label="Parking" color={C.successTxt} small/>}
            {ap.proprios&&<span style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginLeft:4}}>{ap.proprios.prenom} {ap.proprios.nom}</span>}
          </div>
          {open===ap.id&&(
            <div className="fade">
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                {[
                  {l:"WiFi",v:ap.wifi_nom||"—"},
                  {l:"Code accès",v:ap.code_acces||"—"},
                  {l:"Check-in",v:ap.heure_checkin||"16:00"},
                  {l:"Check-out",v:ap.heure_checkout||"11:00"},
                  {l:"Frais ménage",v:`${ap.frais_menage||0} €`},
                  {l:"Caution",v:`${ap.caution||0} €`},
                ].map((it,i)=>(
                  <div key={i} style={{background:C.surface,borderRadius:4,padding:"7px 10px"}}>
                    <div style={{fontFamily:F.sans,fontSize:8,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{it.l}</div>
                    <div style={{fontFamily:F.sans,fontSize:11,color:C.white}}>{it.v}</div>
                  </div>
                ))}
              </div>
              {ap.points_forts&&<div style={{fontFamily:F.sans,fontSize:11,color:C.mutedMid,marginBottom:12}}>✦ {ap.points_forts}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {[{l:"iCal Airbnb",v:ap.airbnb_ical,c:"#FF5A5F"},{l:"iCal Booking",v:ap.booking_ical,c:"#003B95"}].map((it,i)=>(
                  <div key={i} style={{background:C.surface,borderRadius:4,padding:"7px 10px"}}>
                    <div style={{fontFamily:F.sans,fontSize:8,color:it.c,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{it.l}</div>
                    <div style={{fontFamily:"monospace",fontSize:9,color:it.v?C.successTxt:C.dangerTxt}}>{it.v?"✓ Configuré":"✕ Non configuré"}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,paddingTop:10,borderTop:`0.5px solid ${C.border}`}}>
                <Btn onClick={()=>{setEditing(ap);setShowForm(false);}} variant="outline" small>✏️ Modifier</Btn>
                {deleting===ap.id?(
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontFamily:F.sans,fontSize:11,color:C.dangerTxt}}>Confirmer ?</span>
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
