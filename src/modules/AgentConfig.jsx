import { useState, useRef } from "react";

const C = {
  bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",
  borderGold:"#3A2E10",gold:"#C8A951",goldLight:"#E2C97E",goldDark:"#7A5E1A",
  white:"#FAF6EE",muted:"#5A5550",mutedMid:"#7A7470",
  successTxt:"#5BBF8A",warn:"#D4A52A",dangerTxt:"#E07A65",
  airbnb:"#FF5A5F",booking:"#003B95",info:"#185FA5",infoTxt:"#60A8E0",
};

const F = {
  serif:"'Cormorant Garamond','Palatino Linotype',serif",
  sans:"'Montserrat','Trebuchet MS',sans-serif",
};

const TYPES = ["Studio","T1","T2","T3","T4","T5+","Loft","Duplex","Maison","Villa"];
const PLATEFORMES = ["Airbnb","Booking"];
const LANGUES = ["Français","Anglais","Espagnol","Italien","Allemand","Chinois","Japonais","Arabe"];

const EQUIP_CATS = [
  {cat:"Essentiels",items:["WiFi","Cuisine équipée","Lave-linge","Sèche-linge","Climatisation","Chauffage","TV","Cafetière"]},
  {cat:"Confort",items:["Lave-vaisselle","Micro-ondes","Bouilloire","Grille-pain","Fer à repasser","Sèche-cheveux","Bureau","Canapé-lit"]},
  {cat:"Sécurité",items:["Détecteur de fumée","Détecteur CO","Extincteur","Trousse de secours","Verrou porte"]},
  {cat:"Premium",items:["Parking privé","Balcon/Terrasse","Jardin","Piscine","Jacuzzi","Sauna","Ascenseur"]},
];
const Btn=({children,onClick,variant="gold",disabled,small,style:st})=>{
  const v={
    gold:{background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,color:C.bg,border:"none"},
    outline:{background:"transparent",color:C.gold,border:`0.5px solid ${C.goldDark}`},
    ghost:{background:"transparent",color:C.muted,border:`0.5px solid ${C.border}`},
    airbnb:{background:C.airbnb,color:C.white,border:"none"},
    booking:{background:C.booking,color:C.white,border:"none"},
    success:{background:"transparent",color:C.successTxt,border:`0.5px solid ${C.successTxt}44`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...v[variant],padding:small?"5px 10px":"7px 16px",borderRadius:3,fontSize:small?9:10,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:F.sans,letterSpacing:1,textTransform:"uppercase",opacity:disabled?.45:1,...st}}>{children}</button>;
};

const Field=({label,children,required})=>(
  <div style={{marginBottom:12}}>
    <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>
      {label}{required&&<span style={{color:C.dangerTxt,marginLeft:3}}>*</span>}
    </label>
    {children}
  </div>
);

const Input=({value,onChange,placeholder,type="text"})=>(
  <input type={type} value={value||""} onChange={onChange} placeholder={placeholder}
    style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}/>
);
// ── AGENT IA UNIFIÉ ────────────────────────────────────────────────────
const useAgentIA = () => {
  const [loading,setLoading] = useState(false);
  const [streaming,setStreaming] = useState("");
  const generate = async (prompt, onResult) => {
    setLoading(true); setStreaming("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":process.env.REACT_APP_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,
          messages:[{role:"user",content:prompt}]})
      });
      const d = await res.json();
      const txt = d.content?.find(b=>b.type==="text")?.text||"";
      let i=0;
      const interval = setInterval(()=>{
        i+=4;
        setStreaming(txt.slice(0,i));
        if(i>=txt.length){ clearInterval(interval); setStreaming(""); onResult(txt); setLoading(false); }
      },6);
    } catch(e){ setLoading(false); setStreaming(""); onResult("Erreur de génération. Réessaie."); }
  };
  return {generate, loading, streaming};
};
// ── ONGLET : CONFIG ANNONCES ───────────────────────────────────────────
const TabAnnonces = ({data, setData}) => {
  const {generate, loading, streaming} = useAgentIA();
  const [suggestions,setSuggestions] = useState([]);
  const [tab,setTab] = useState("infos");
  const fileRef = useRef(null);
  const ETAPES = [
    {id:"infos",label:"Infos"},{id:"photos",label:"Photos"},
    {id:"description",label:"Description IA"},{id:"titre",label:"Titre IA"},
    {id:"equipements",label:"Équipements"},{id:"regles",label:"Règles & tarifs"},
    {id:"publication",label:"Publication"},
  ];
  const f=(k,v)=>setData(p=>({...p,[k]:v}));
  const toggleEquip=(item)=>{
    const eq=data.equipements||[];
    setData(d=>({...d,equipements:eq.includes(item)?eq.filter(e=>e!==item):[...eq,item]}));
  };
  const genDescription = () => {
    const prompt=`Tu es expert en rédaction d'annonces Airbnb/Booking optimisées SEO.
Rédige une description complète et attrayante pour :
- Type : ${data.type} · ${data.capacite} personnes · ${data.chambres} chambre(s) · ${data.sdb} sdb
- Zone : ${data.ville} · Adresse : ${data.adresse}
- Points forts : ${data.points_forts||"Non renseignés"}
- Équipements : ${(data.equipements||[]).join(", ")||"Non renseignés"}
- Plateformes : ${(data.plateformes||[]).join(", ")}
- Langue : ${data.langue||"Français"}
Style : Luxe chaleureux, pro, efficace. Vouvoiement. Emojis discrets.
Structure : Accroche → Description → Points forts → Quartier → Règles → Clôture.
Réponds uniquement avec la description, sans explication.`;
    generate(prompt, txt=>setData(d=>({...d,description:txt})));
  };
  const genTitres = () => {
    const prompt=`Génère 5 titres d'annonce Airbnb/Booking pour un ${data.type} à ${data.ville}.
Points forts : ${data.points_forts||"Non renseignés"}. Capacité : ${data.capacite} personnes.
Langue : ${data.langue||"Français"}. Max 50 caractères par titre.
Réponds UNIQUEMENT avec ce JSON : {"titres":["titre1","titre2","titre3","titre4","titre5"]}`;
    generate(prompt, txt=>{
      try{ const p=JSON.parse(txt.replace(/```json|```/g,"").trim()); setSuggestions(p.titres||[]); }
      catch{ setSuggestions([]); }
    });
  };
  const apPts = [
    {l:"Nom",ok:!!data.nom},{l:"Adresse",ok:!!data.adresse},
    {l:"Photos",ok:(data.photos||[]).length>=1},
    {l:"Description",ok:!!data.description},
    {l:"Titre",ok:!!data.titre&&data.titre.length<=50},
    {l:"Équipements",ok:(data.equipements||[]).length>=3},
    {l:"Prix/nuit",ok:!!data.prix_nuit},
  ];
  const allOk=apPts.every(p=>p.ok);
  const [published,setPublished]=useState(null);
  const [publishing,setPublishing]=useState(null);
  const handlePublish=async(pl)=>{
    setPublishing(pl);
    await new Promise(r=>setTimeout(r,2000));
    setPublishing(null); setPublished(pl==="airbnb"?"Airbnb":"Booking");
  };
  return(
    <div>
      <div style={{display:"flex",gap:4,marginBottom:20,flexWrap:"wrap"}}>
        {ETAPES.map((e,i)=>(
          <button key={e.id} onClick={()=>setTab(e.id)}
            style={{background:tab===e.id?`linear-gradient(135deg,${C.goldDark},${C.gold})`:"transparent",color:tab===e.id?C.bg:C.muted,border:`0.5px solid ${tab===e.id?C.gold:C.border}`,padding:"6px 12px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>
            {i+1}. {e.label}
          </button>
        ))}
      </div>
      {tab==="infos"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Nom *"><Input value={data.nom} onChange={e=>f("nom",e.target.value)} placeholder="Elysian"/></Field>
          <Field label="Type">
            <select value={data.type||"T2"} onChange={e=>f("type",e.target.value)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12}}>
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Adresse"><Input value={data.adresse} onChange={e=>f("adresse",e.target.value)} placeholder="4 Rue de la Varenne, 93160"/></Field>
          <Field label="Ville / Zone"><Input value={data.ville} onChange={e=>f("ville",e.target.value)} placeholder="Noisy-le-Grand"/></Field>
          <Field label="Capacité"><Input type="number" value={data.capacite||2} onChange={e=>f("capacite",+e.target.value)}/></Field>
          <Field label="Chambres"><Input type="number" value={data.chambres||1} onChange={e=>f("chambres",+e.target.value)}/></Field>
          <Field label="Lits"><Input type="number" value={data.lits||1} onChange={e=>f("lits",+e.target.value)}/></Field>
          <Field label="Salles de bain"><Input type="number" value={data.sdb||1} onChange={e=>f("sdb",+e.target.value)}/></Field>
          <Field label="Langue">
            <select value={data.langue||"Français"} onChange={e=>f("langue",e.target.value)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12}}>
              {LANGUES.map(l=><option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Plateformes">
            <div style={{display:"flex",gap:8,marginTop:4}}>
              {PLATEFORMES.map(p=>(
                <button key={p} onClick={()=>setData(d=>({...d,plateformes:(d.plateformes||[]).includes(p)?(d.plateformes||[]).filter(x=>x!==p):[...(d.plateformes||[]),p]}))}
                  style={{flex:1,background:(data.plateformes||[]).includes(p)?(p==="Airbnb"?`${C.airbnb}22`:`${C.booking}22`):"transparent",border:`0.5px solid ${(data.plateformes||[]).includes(p)?(p==="Airbnb"?C.airbnb:C.booking):C.border}`,color:(data.plateformes||[]).includes(p)?(p==="Airbnb"?C.airbnb:C.booking):C.muted,padding:"7px",borderRadius:4,fontSize:11,cursor:"pointer",fontFamily:F.sans,fontWeight:600}}>
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <div style={{gridColumn:"1/-1"}}>
            <Field label="Points forts">
              <textarea value={data.points_forts||""} onChange={e=>f("points_forts",e.target.value)} rows={2}
                placeholder="Vue dégagée, proche Disney, parking privé, climatisation..."
                style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,resize:"none"}}/>
            </Field>
          </div>
        </div>
      )}
      {tab==="photos"&&(
        <div>
          <div onClick={()=>fileRef.current?.click()} style={{border:`1px dashed ${C.goldDark}`,borderRadius:6,padding:"24px",textAlign:"center",cursor:"pointer",background:`${C.goldDark}08`,marginBottom:14}}>
            <input ref={fileRef} type="file" multiple accept="image/*" style={{display:"none"}} onChange={e=>{
              Array.from(e.target.files).forEach(file=>{
                const r=new FileReader();
                r.onload=ev=>setData(d=>({...d,photos:[...(d.photos||[]),{id:Date.now()+Math.random(),name:file.name,url:ev.target.result}]}));
                r.readAsDataURL(file);
              });
            }}/>
            <div style={{fontSize:28,opacity:.4,marginBottom:8}}>📷</div>
            <div style={{fontFamily:F.sans,fontSize:12,color:C.muted}}>Glissez vos photos ici ou cliquez</div>
            <div style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginTop:4}}>Min. 3 photos · Résolution min. 1024x683</div>
          </div>
          {(data.photos||[]).length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {(data.photos||[]).map((ph,i)=>(
                <div key={ph.id} style={{aspectRatio:"4/3",borderRadius:5,overflow:"hidden",border:`2px solid ${i===0?C.gold:C.border}`,position:"relative"}}>
                  <img src={ph.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  {i===0&&<div style={{position:"absolute",top:5,left:5,background:C.gold,color:C.bg,borderRadius:3,padding:"2px 7px",fontFamily:F.sans,fontSize:8,fontWeight:700}}>BANNIÈRE</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab==="description"&&(
        <div>
          <div style={{background:`${C.goldDark}10`,border:`0.5px solid ${C.goldDark}`,borderRadius:6,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:20}}>🤖</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:F.sans,fontSize:11,color:C.goldLight,fontWeight:500}}>Agent IA — Description optimisée</div>
              <div style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginTop:2}}>Analyse le type ({data.type}), la zone ({data.ville}), la capacité ({data.capacite} pers.) et les équipements.</div>
            </div>
            <Btn onClick={genDescription} disabled={loading} small>{loading?<><span className="spin">⟳</span> Génération...</>:"🤖 Générer"}</Btn>
          </div>
          <div style={{position:"relative"}}>
            <textarea value={streaming||data.description||""} onChange={e=>f("description",e.target.value)} readOnly={!!streaming} rows={14}
              placeholder="Cliquez sur Générer ou rédigez votre description..."
              style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:streaming?C.gold:C.white,padding:"11px 13px",borderRadius:4,fontFamily:F.sans,fontSize:12,lineHeight:1.75,resize:"vertical"}}/>
            {streaming&&<div style={{position:"absolute",bottom:8,right:10,fontFamily:F.sans,fontSize:9,color:C.gold}}><span className="pulse">⟳</span> Rédaction...</div>}
          </div>
          {data.description&&<div style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginTop:4}}>{data.description.length} caractères</div>}
        </div>
      )}
      {tab==="titre"&&(
        <div>
          <div style={{display:"flex",gap:10,marginBottom:10}}>
            <Input value={data.titre||""} onChange={e=>f("titre",e.target.value)} placeholder="✨ Loft cosy — Marais · Paris Centre"/>
            <Btn onClick={genTitres} disabled={loading} small>{loading?<><span className="spin">⟳</span></>:"🤖 Suggestions"}</Btn>
          </div>
          <div style={{fontFamily:F.sans,fontSize:10,color:(data.titre||"").length>50?C.dangerTxt:C.muted,marginBottom:12}}>
            {(data.titre||"").length}/50 caractères {(data.titre||"").length>50?"— Trop long !":""}
          </div>
          {suggestions.length>0&&suggestions.map((t,i)=>(
            <div key={i} onClick={()=>f("titre",t)}
              style={{background:data.titre===t?`${C.goldDark}25`:C.card,border:`0.5px solid ${data.titre===t?C.gold:C.border}`,borderRadius:5,padding:"9px 13px",cursor:"pointer",fontFamily:F.sans,fontSize:12,color:data.titre===t?C.gold:C.white,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{t}</span>
              <span style={{fontFamily:F.sans,fontSize:9,color:t.length>50?C.dangerTxt:C.successTxt}}>{t.length}/50</span>
            </div>
          ))}
        </div>
      )}
      {tab==="equipements"&&(
        <div>
          <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>{(data.equipements||[]).length} équipement(s) sélectionné(s)</div>
          {EQUIP_CATS.map(cat=>(
            <div key={cat.cat} style={{marginBottom:14}}>
              <div style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{cat.cat}</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {cat.items.map(item=>{
                  const sel=(data.equipements||[]).includes(item);
                  return(
                    <button key={item} onClick={()=>toggleEquip(item)}
                      style={{background:sel?`${C.gold}18`:"transparent",border:`0.5px solid ${sel?C.gold:C.border}`,color:sel?C.gold:C.muted,padding:"6px 12px",borderRadius:4,fontSize:10,cursor:"pointer",fontFamily:F.sans,fontWeight:sel?600:400,transition:"all .15s"}}>
                      {sel?"✓ ":""}{item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="regles"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Check-in"><Input value={data.heure_checkin||"16:00"} onChange={e=>f("heure_checkin",e.target.value)}/></Field>
          <Field label="Check-out"><Input value={data.heure_checkout||"11:00"} onChange={e=>f("heure_checkout",e.target.value)}/></Field>
          <Field label="Prix/nuit (€)"><Input type="number" value={data.prix_nuit||""} onChange={e=>f("prix_nuit",+e.target.value)}/></Field>
          <Field label="Frais ménage (€)"><Input type="number" value={data.frais_menage||""} onChange={e=>f("frais_menage",+e.target.value)}/></Field>
          <Field label="Caution (€)"><Input type="number" value={data.caution||""} onChange={e=>f("caution",+e.target.value)}/></Field>
          <Field label="Séjour minimum (nuits)"><Input type="number" value={data.sejour_min||2} onChange={e=>f("sejour_min",+e.target.value)}/></Field>
          <div style={{gridColumn:"1/-1"}}>
            <Field label="Instructions acces">
              <textarea value={data.acces||""} onChange={e=>f("acces",e.target.value)} rows={3}
                placeholder="Code immeuble 2584, boite a cles a droite de la porte, code 1805..."
                style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,resize:"none"}}/>
            </Field>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Règles maison</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[{k:"non_fumeur",l:"🚭 Non-fumeur"},{k:"animaux",l:"🐾 Animaux"},{k:"fetes",l:"🎉 Pas de fêtes"},{k:"enfants",l:"👶 Enfants OK"},{k:"bruit",l:"🔇 Calme apres 22h"}].map(r=>{
                const val=data.regles?.[r.k]||false;
                return(
                  <button key={r.k} onClick={()=>setData(d=>({...d,regles:{...d.regles,[r.k]:!val}}))}
                    style={{background:val?`${C.gold}15`:"transparent",border:`0.5px solid ${val?C.gold:C.border}`,color:val?C.gold:C.muted,padding:"6px 12px",borderRadius:4,fontSize:10,cursor:"pointer",fontFamily:F.sans,transition:"all .15s"}}>
                    {r.l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {tab==="publication"&&(
        <div>
          <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,overflow:"hidden",marginBottom:16}}>
            {apPts.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderBottom:i<apPts.length-1?`0.5px solid ${C.border}`:"none"}}>
                <span style={{color:p.ok?C.successTxt:C.dangerTxt,fontSize:13}}>{p.ok?"✓":"✕"}</span>
                <span style={{fontFamily:F.sans,fontSize:11,color:p.ok?C.white:C.dangerTxt}}>{p.l}</span>
              </div>
            ))}
          </div>
          {!published?(
            <div style={{display:"flex",gap:10}}>
              {(data.plateformes||[]).includes("Airbnb")&&(
                <Btn onClick={()=>handlePublish("airbnb")} disabled={!!publishing||!allOk} variant="airbnb" style={{flex:1}}>
                  {publishing==="airbnb"?<><span className="spin">⟳</span> Publication...</>:"🚀 Publier sur Airbnb"}
                </Btn>
              )}
              {(data.plateformes||[]).includes("Booking")&&(
                <Btn onClick={()=>handlePublish("booking")} disabled={!!publishing||!allOk} variant="booking" style={{flex:1}}>
                  {publishing==="booking"?<><span className="spin">⟳</span> Publication...</>:"🚀 Publier sur Booking"}
                </Btn>
              )}
            </div>
          ):(
            <div style={{background:`${C.successTxt}15`,border:`0.5px solid ${C.successTxt}44`,borderRadius:6,padding:"14px",textAlign:"center"}}>
              <div style={{fontFamily:F.serif,fontSize:16,color:C.successTxt}}>🎉 Publié sur {published} !</div>
            </div>
          )}
          {!allOk&&<div style={{fontFamily:F.sans,fontSize:10,color:C.warn,marginTop:8,textAlign:"center"}}>Complétez les éléments ✕ avant de publier</div>}
        </div>
      )}
    </div>
  );
};
// ── ONGLET : CHECKLIST MÉNAGE IA ───────────────────────────────────────
const TabChecklist = () => {
  const {generate, loading, streaming} = useAgentIA();
  const [appart, setAppart] = useState({
    type:"T3", capacite:4, chambres:2, sdb:1, parking:false,
    equipements:["WiFi","Cuisine équipée","Lave-linge","Climatisation","Lave-vaisselle"],
    heure_limit:"13:00", duree_sejour:3,
  });
  const [checklist, setChecklist] = useState("");
  const [checked, setChecked] = useState({});
  const f=(k,v)=>setAppart(p=>({...p,[k]:v}));
  const genChecklist = () => {
    const prompt=`Tu es expert en gestion locative courte durée. Génère une checklist ménage complète et ordonnée.
APPARTEMENT :
- Type : ${appart.type}
- Capacité : ${appart.capacite} personnes
- Chambres : ${appart.chambres===0?"Studio (coin nuit)":appart.chambres+" chambre(s)"}
- Salles de bain : ${appart.sdb}
- Parking : ${appart.parking?"Oui":"Non"}
- Équipements : ${appart.equipements.join(", ")}
- Heure limite de rendu : ${appart.heure_limit}
- Durée du séjour précédent : ${appart.duree_sejour} nuit(s)
Génère une checklist structurée par zone (Entrée, Salon, Cuisine, Chambre(s), Salle(s) de bain, Extérieur si applicable).
Pour chaque zone liste les tâches dans l'ordre logique d'exécution.
Adapte l'intensité au type d'appartement et à la durée du séjour.
Format : "ZONE\n- tâche 1\n- tâche 2\n\nZONE\n- tâche..."
Réponds uniquement avec la checklist, sans introduction.`;
    generate(prompt, txt=>setChecklist(txt));
  };
  const parseChecklist = (txt) => {
    if(!txt) return [];
    const sections = [];
    let current = null;
    txt.split("\n").forEach(line=>{
      if(!line.trim()) return;
      if(!line.startsWith("-")&&!line.startsWith("•")) {
        if(current) sections.push(current);
        current = {title:line.trim().replace(/[:#]/g,""), items:[]};
      } else if(current) {
        current.items.push(line.replace(/^[-•]\s*/,"").trim());
      }
    });
    if(current) sections.push(current);
    return sections;
  };
  const sections = parseChecklist(streaming||checklist);
  const allItems = sections.flatMap(s=>s.items.map((_,i)=>`${s.title}-${i}`));
  const checkedCount = allItems.filter(k=>checked[k]).length;
  const progress = allItems.length>0?Math.round((checkedCount/allItems.length)*100):0;
  return(
    <div>
      <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"14px 16px",marginBottom:14}}>
        <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Configuration de l'appartement</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:4}}>Type</label>
            <select value={appart.type} onChange={e=>f("type",e.target.value)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"7px 9px",borderRadius:4,fontFamily:F.sans,fontSize:11}}>
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:4}}>Capacité</label>
            <input type="number" value={appart.capacite} onChange={e=>f("capacite",+e.target.value)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"7px 9px",borderRadius:4,fontFamily:F.sans,fontSize:11}}/>
          </div>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:4}}>Chambres</label>
            <input type="number" value={appart.chambres} onChange={e=>f("chambres",+e.target.value)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"7px 9px",borderRadius:4,fontFamily:F.sans,fontSize:11}}/>
          </div>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:4}}>Salles de bain</label>
            <input type="number" value={appart.sdb} onChange={e=>f("sdb",+e.target.value)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"7px 9px",borderRadius:4,fontFamily:F.sans,fontSize:11}}/>
          </div>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:4}}>Heure limite</label>
            <input type="time" value={appart.heure_limit} onChange={e=>f("heure_limit",e.target.value)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"7px 9px",borderRadius:4,fontFamily:F.sans,fontSize:11}}/>
          </div>
          <div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:4}}>Nuits séjour précédent</label>
            <input type="number" value={appart.duree_sejour} onChange={e=>f("duree_sejour",+e.target.value)} style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"7px 9px",borderRadius:4,fontFamily:F.sans,fontSize:11}}/>
          </div>
        </div>
        <div style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:7}}>Équipements à vérifier</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {["WiFi","Cuisine équipée","Lave-linge","Lave-vaisselle","Climatisation","Parking","Balcon/Terrasse","Machine à café"].map(item=>{
            const sel=appart.equipements.includes(item);
            return(
              <button key={item} onClick={()=>setAppart(p=>({...p,equipements:sel?p.equipements.filter(e=>e!==item):[...p.equipements,item]}))}
                style={{background:sel?`${C.gold}18`:"transparent",border:`0.5px solid ${sel?C.gold:C.border}`,color:sel?C.gold:C.muted,padding:"5px 10px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:sel?600:400}}>
                {sel?"✓ ":""}{item}
              </button>
            );
          })}
        </div>
        <Btn onClick={genChecklist} disabled={loading}>
          {loading?<><span className="spin">⟳</span> Génération de la checklist...</>:"🤖 Générer la checklist IA"}
        </Btn>
      </div>
      {(streaming||checklist)&&(
        <div>
          {checklist&&!streaming&&(
            <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"12px 14px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontFamily:F.sans,fontSize:10,color:C.gold,fontWeight:600}}>Progression</span>
                <span style={{fontFamily:F.serif,fontSize:16,color:progress===100?C.successTxt:C.gold}}>{progress}%</span>
              </div>
              <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${progress}%`,background:progress===100?C.successTxt:`linear-gradient(90deg,${C.goldDark},${C.gold})`,borderRadius:2,transition:"width .3s"}}/>
              </div>
              <div style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginTop:4}}>{checkedCount}/{allItems.length} tâches</div>
            </div>
          )}
          {streaming?(
            <div style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"14px",fontFamily:F.sans,fontSize:12,color:C.gold,lineHeight:1.8,whiteSpace:"pre-line"}}>
              {streaming}<span className="pulse" style={{color:C.gold}}>|</span>
            </div>
          ):(
            sections.map((section,si)=>(
              <div key={si} style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"12px 14px",marginBottom:8}}>
                <div style={{fontFamily:F.sans,fontSize:10,color:C.gold,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>{section.title}</div>
                {section.items.map((item,ii)=>{
                  const key=`${section.title}-${ii}`;
                  return(
                    <div key={ii} onClick={()=>setChecked(p=>({...p,[key]:!p[key]}))}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:ii<section.items.length-1?`0.5px solid ${C.border}`:"none",cursor:"pointer"}}>
                      <div style={{width:16,height:16,borderRadius:3,border:`1.5px solid ${checked[key]?C.successTxt:C.border}`,background:checked[key]?C.successTxt:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                        {checked[key]&&<span style={{color:C.white,fontSize:10,fontWeight:700,lineHeight:1}}>✓</span>}
                      </div>
                      <span style={{fontFamily:F.sans,fontSize:12,color:checked[key]?C.muted:C.white,textDecoration:checked[key]?"line-through":"none",opacity:checked[key]?.6:1}}>{item}</span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          {checklist&&!streaming&&(
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <Btn onClick={()=>{setChecklist("");setChecked({});}} variant="ghost" small>Réinitialiser</Btn>
              <Btn onClick={genChecklist} variant="outline" small>🤖 Régénérer</Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// ── PAGE PRINCIPALE ────────────────────────────────────────────────────
export default function AgentConfig() {
  const [onglet, setOnglet] = useState("annonces");
  const [formData, setFormData] = useState({
    nom:"",type:"T2",adresse:"",ville:"",capacite:2,chambres:1,lits:1,sdb:1,
    langue:"Français",plateformes:["Airbnb","Booking"],points_forts:"",
    photos:[],description:"",titre:"",equipements:[],
    heure_checkin:"16:00",heure_checkout:"11:00",
    prix_nuit:"",frais_menage:"",caution:"",sejour_min:2,regles:{},acces:"",
  });
  return(
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:"0.5px solid #3A2E10",paddingBottom:14}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:"#FAF6EE",letterSpacing:1}}>Agent IA</h1>
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:11,color:"#5A5550",marginTop:4}}>Configuration annonces Airbnb/Booking · Checklist ménage intelligente</p>
      </div>
      <div style={{display:"flex",background:"#131313",border:"0.5px solid #222",borderRadius:6,marginBottom:20,overflow:"hidden"}}>
        {[
          {id:"annonces",icon:"🏠",label:"Config annonces Airbnb / Booking"},
          {id:"checklist",icon:"✅",label:"Checklist ménage IA"},
        ].map(o=>(
          <button key={o.id} onClick={()=>setOnglet(o.id)}
            style={{flex:1,background:onglet===o.id?`linear-gradient(135deg,${C.goldDark},${C.gold})`:"transparent",color:onglet===o.id?C.bg:"#5A5550",border:"none",padding:"12px 8px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'Montserrat',sans-serif",letterSpacing:.5,textTransform:"uppercase",transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <span>{o.icon}</span><span>{o.label}</span>
          </button>
        ))}
      </div>
      {onglet==="annonces" && <TabAnnonces data={formData} setData={setFormData}/>}
      {onglet==="checklist" && <TabChecklist/>}
    </div>
  );
}
