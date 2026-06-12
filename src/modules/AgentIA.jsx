import { useState } from "react";

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

export default function AgentIA() {
  const [appart, setAppart] = useState({
    type:"T3", capacite:4, chambres:2, sdb:1, parking:false,
    equipements:["WiFi","Cuisine équipée","Lave-linge","Climatisation","Lave-vaisselle"],
    heure_limit:"13:00", duree_sejour:3,
  });
  const [checklist, setChecklist] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading]     = useState(false);
  const [checked, setChecked]     = useState({});

  const f = (k,v) => setAppart(p=>({...p,[k]:v}));

  const genChecklist = async () => {
    setLoading(true); setStreaming(""); setChecklist(""); setChecked({});
    const prompt = `Tu es expert en gestion locative courte durée. Génère une checklist ménage complète et ordonnée.

APPARTEMENT :
- Type : ${appart.type}
- Capacité : ${appart.capacite} personnes
- Chambres : ${appart.chambres === 0 ? "Studio (coin nuit)" : appart.chambres + " chambre(s)"}
- Salles de bain : ${appart.sdb}
- Parking : ${appart.parking ? "Oui" : "Non"}
- Équipements : ${appart.equipements.join(", ")}
- Heure limite : ${appart.heure_limit}
- Durée séjour précédent : ${appart.duree_sejour} nuit(s)

Structure par zone (Entrée, Salon, Cuisine, Chambre(s), Salle(s) de bain, Extérieur si applicable).
Adapte l'intensité au type et à la durée du séjour.
Format : "ZONE\n- tâche 1\n- tâche 2\n\nZONE\n- tâche..."
Réponds uniquement avec la checklist.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true",
        },
        body: JSON.stringify({ model:"claude-3-5-sonnet-20241022", max_tokens:1500, messages:[{role:"user",content:prompt}] })
      });
      const d = await res.json();
      const txt = d.content?.find(b=>b.type==="text")?.text || "";
      let i = 0;
      const interval = setInterval(()=>{
        i += 4;
        setStreaming(txt.slice(0, i));
        if (i >= txt.length) { clearInterval(interval); setStreaming(""); setChecklist(txt); setLoading(false); }
      }, 6);
    } catch(e) { setLoading(false); setChecklist("Erreur de génération. Réessaie."); }
  };

  const parseChecklist = (txt) => {
    if (!txt) return [];
    const sections = [];
    let current = null;
    txt.split("\n").forEach(line => {
      if (!line.trim()) return;
      if (!line.startsWith("-") && !line.startsWith("•")) {
        if (current) sections.push(current);
        current = { title: line.trim().replace(/[:#]/g,""), items: [] };
      } else if (current) {
        current.items.push(line.replace(/^[-•]\s*/,"").trim());
      }
    });
    if (current) sections.push(current);
    return sections;
  };

  const sections = parseChecklist(streaming || checklist);
  const allItems = sections.flatMap(s => s.items.map((_,i) => `${s.title}-${i}`));
  const checkedCount = allItems.filter(k => checked[k]).length;
  const progress = allItems.length > 0 ? Math.round((checkedCount/allItems.length)*100) : 0;

  return (
    <div className="fade">
      <div style={{ marginBottom:24, borderBottom:`0.5px solid #3A2E10`, paddingBottom:14 }}>
        <h1 style={{ fontFamily:F.serif, fontSize:26, fontWeight:300, color:C.white, letterSpacing:1 }}>Checklist ménage IA</h1>
        <p style={{ fontFamily:F.sans, fontSize:11, color:C.muted, marginTop:4 }}>Génère une checklist adaptée au type d'appartement, à la capacité et aux équipements</p>
      </div>

      {/* Config */}
      <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'16px', marginBottom:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:12 }}>
          {[
            { l:"Type", k:"type", type:"select" },
            { l:"Capacité", k:"capacite", type:"number" },
            { l:"Chambres", k:"chambres", type:"number" },
            { l:"Salles de bain", k:"sdb", type:"number" },
            { l:"Heure limite", k:"heure_limit", type:"time" },
            { l:"Nuits séjour précédent", k:"duree_sejour", type:"number" },
          ].map((fi,i) => (
            <div key={i}>
              <label style={{ fontFamily:F.sans, fontSize:9, color:C.muted, letterSpacing:1.5, textTransform:'uppercase', display:'block', marginBottom:4 }}>{fi.l}</label>
              {fi.type === "select" ? (
                <select value={appart[fi.k]} onChange={e=>f(fi.k,e.target.value)}
                  style={{ width:'100%', background:C.surface, border:`0.5px solid ${C.border}`, color:C.white, padding:'7px 9px', borderRadius:4, fontFamily:F.sans, fontSize:11 }}>
                  {TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              ) : (
                <input type={fi.type} value={appart[fi.k]} onChange={e=>f(fi.k, fi.type==="number"?+e.target.value:e.target.value)}
                  style={{ width:'100%', background:C.surface, border:`0.5px solid ${C.border}`, color:C.white, padding:'7px 9px', borderRadius:4, fontFamily:F.sans, fontSize:11 }}/>
              )}
            </div>
          ))}
        </div>

        {/* Équipements */}
        <div style={{ fontFamily:F.sans, fontSize:9, color:C.muted, letterSpacing:1.5, textTransform:'uppercase', marginBottom:7 }}>Équipements</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {["WiFi","Cuisine équipée","Lave-linge","Lave-vaisselle","Climatisation","Parking","Balcon/Terrasse","Machine à café","Jacuzzi","Piscine"].map(item => {
            const sel = appart.equipements.includes(item);
            return (
              <button key={item} onClick={()=>setAppart(p=>({...p, equipements: sel?p.equipements.filter(e=>e!==item):[...p.equipements,item]}))}
                style={{ background:sel?'#C8A95118':"transparent", border:`0.5px solid ${sel?"#C8A951":"#222"}`, color:sel?"#C8A951":"#5A5550", padding:'5px 10px', borderRadius:3, fontSize:9, cursor:'pointer', fontFamily:F.sans, fontWeight:sel?600:400 }}>
                {sel?"✓ ":""}{item}
              </button>
            );
          })}
        </div>

        <button onClick={genChecklist} disabled={loading}
          style={{ background:`linear-gradient(135deg,#7A5E1A,#C8A951)`, color:'#080808', border:'none', padding:'9px 20px', borderRadius:3, fontSize:10, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:F.sans, letterSpacing:1, textTransform:'uppercase', opacity:loading?.7:1 }}>
          {loading ? <><span className="spin">⟳</span> Génération...</> : "🤖 Générer la checklist"}
        </button>
      </div>

      {/* Barre de progression */}
      {checklist && !streaming && (
        <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'12px 14px', marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontFamily:F.sans, fontSize:10, color:C.gold, fontWeight:600 }}>Progression</span>
            <span style={{ fontFamily:F.serif, fontSize:16, color:progress===100?C.successTxt:C.gold }}>{progress}%</span>
          </div>
          <div style={{ height:4, background:C.border, borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:progress===100?C.successTxt:`linear-gradient(90deg,#7A5E1A,#C8A951)`, borderRadius:2, transition:'width .3s' }}/>
          </div>
          <div style={{ fontFamily:F.sans, fontSize:10, color:C.muted, marginTop:4 }}>{checkedCount}/{allItems.length} tâches</div>
        </div>
      )}

      {/* Checklist streaming */}
      {streaming && (
        <div style={{ background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'14px', fontFamily:F.sans, fontSize:12, color:C.gold, lineHeight:1.8, whiteSpace:'pre-line' }}>
          {streaming}<span className="pulse" style={{ color:C.gold }}>|</span>
        </div>
      )}

      {/* Checklist interactive */}
      {checklist && !streaming && sections.map((section, si) => (
        <div key={si} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'12px 14px', marginBottom:8 }}>
          <div style={{ fontFamily:F.sans, fontSize:10, color:C.gold, fontWeight:600, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>
            {section.title}
          </div>
          {section.items.map((item, ii) => {
            const key = `${section.title}-${ii}`;
            return (
              <div key={ii} onClick={()=>setChecked(p=>({...p,[key]:!p[key]}))}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:ii<section.items.length-1?`0.5px solid ${C.border}`:"none", cursor:'pointer' }}>
                <div style={{ width:16, height:16, borderRadius:3, border:`1.5px solid ${checked[key]?C.successTxt:C.border}`, background:checked[key]?C.successTxt:"transparent", display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                  {checked[key] && <span style={{ color:C.white, fontSize:10, fontWeight:700, lineHeight:1 }}>✓</span>}
                </div>
                <span style={{ fontFamily:F.sans, fontSize:12, color:checked[key]?C.muted:C.white, textDecoration:checked[key]?"line-through":"none", opacity:checked[key]?.6:1 }}>{item}</span>
              </div>
            );
          })}
        </div>
      ))}

      {checklist && !streaming && (
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <button onClick={()=>{setChecklist("");setChecked({});}}
            style={{ background:"transparent", color:C.muted, border:`0.5px solid ${C.border}`, padding:'5px 10px', borderRadius:3, fontSize:9, cursor:'pointer', fontFamily:F.sans, letterSpacing:1, textTransform:'uppercase' }}>
            Réinitialiser
          </button>
          <button onClick={genChecklist}
            style={{ background:"transparent", color:C.gold, border:`0.5px solid #7A5E1A`, padding:'5px 10px', borderRadius:3, fontSize:9, cursor:'pointer', fontFamily:F.sans, letterSpacing:1, textTransform:'uppercase' }}>
            🤖 Régénérer
          </button>
        </div>
      )}
    </div>
  );
}
