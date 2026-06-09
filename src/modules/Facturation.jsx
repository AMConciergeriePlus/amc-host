import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const C = {
  bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",
  borderGold:"#3A2E10",gold:"#C8A951",goldDark:"#7A5E1A",
  white:"#FAF6EE",muted:"#5A5550",successTxt:"#5BBF8A",
  dangerTxt:"#E07A65",warn:"#D4A52A",airbnb:"#FF5A5F",booking:"#003B95",
};

const F={serif:"'Cormorant Garamond',serif",sans:"'Montserrat',sans-serif"};
const MOIS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function Facturation(){
  const[reservations,setReservations]=useState([]);
  const[apparts,setApparts]=useState([]);
  const[loading,setLoading]=useState(true);
  const[periode,setPeriode]=useState("mois");

  const load=async()=>{
    setLoading(true);
    const[{data:res},{data:ap}]=await Promise.all([
      supabase.from('reservations').select('*,appartements(nom,nom_long,color)').neq('source','blocage').neq('statut','annulé').order('checkin',{ascending:false}),
      supabase.from('appartements').select('id,nom,nom_long,color').order('nom'),
    ]);
    setReservations(res||[]);setApparts(ap||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const now=new Date();
  const filtrees=reservations.filter(r=>{
    if(!r.checkin)return false;
    const d=new Date(r.checkin);
    if(periode==="mois")return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    if(periode==="annee")return d.getFullYear()===now.getFullYear();
    return true;
  });

  const caTotal=filtrees.reduce((a,r)=>a+(r.montant||0),0);
  const caAMC=Math.round(caTotal*0.2);
  const sansMontant=filtrees.filter(r=>!r.montant||r.montant===0);

  const caParAppart=apparts.map(ap=>{
    const resAp=filtrees.filter(r=>r.appart_id===ap.id);
    const ca=resAp.reduce((a,r)=>a+(r.montant||0),0);
    return{...ap,ca,nb:resAp.length,partProprio:Math.round(ca*0.8),partAMC:Math.round(ca*0.2)};
  }).filter(a=>a.nb>0);

  if(loading) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;

  return(
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:`0.5px solid ${C.borderGold}`,paddingBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Facturation</h1>
          <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{MOIS[now.getMonth()]} {now.getFullYear()}</p>
        </div>
        <div style={{display:"flex",gap:5}}>
          {[{v:"mois",l:"Ce mois"},{v:"annee",l:"Cette année"},{v:"tout",l:"Tout"}].map(p=>(
            <button key={p.v} onClick={()=>setPeriode(p.v)} style={{background:periode===p.v?`${C.gold}15`:"transparent",border:`0.5px solid ${periode===p.v?C.gold:C.border}`,color:periode===p.v?C.gold:C.muted,padding:"5px 12px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:600,textTransform:"uppercase"}}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {sansMontant.length>0&&(
        <div style={{background:`${C.warn}15`,border:`0.5px solid ${C.warn}44`,borderRadius:6,padding:"12px 16px",marginBottom:16}}>
          <div style={{fontFamily:F.sans,fontSize:11,color:C.warn,fontWeight:600}}>⚠️ {sansMontant.length} réservation{sansMontant.length>1?"s":""} sans montant — allez dans Réservations pour les saisir</div>
        </div>
      )}

      <div style={{background:`linear-gradient(135deg,${C.goldDark}22,${C.goldDark}08)`,border:`0.5px solid ${C.borderGold}`,borderRadius:8,padding:"16px 20px",marginBottom:18}}>
        <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>AM Conciergerie Plus</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {[
            {l:"CA brut total",      v:`${caTotal.toLocaleString("fr-FR")} €`, c:C.white},
            {l:"Commission AMC (20%)",v:`${caAMC.toLocaleString("fr-FR")} €`,  c:C.gold},
            {l:"Réservations",       v:filtrees.length,                         c:C.white},
            {l:"Sans montant",       v:sansMontant.length,                      c:sansMontant.length>0?C.warn:C.successTxt},
          ].map((s,i)=>(
            <div key={i}>
              <div style={{fontFamily:F.sans,fontSize:8,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{s.l}</div>
              <div style={{fontFamily:F.serif,fontSize:i===1?28:20,color:s.c,fontWeight:300}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {caParAppart.length>0&&(
        <div style={{marginBottom:18}}>
          <div style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>Détail par appartement</div>
          {caParAppart.map(ap=>(
            <div key={ap.id} style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"14px 16px",marginBottom:10,borderLeft:`2px solid ${ap.color||C.gold}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontFamily:F.serif,fontSize:14,color:C.white}}>{ap.nom_long||ap.nom}</div>
                <div style={{fontFamily:F.serif,fontSize:20,color:C.gold,fontWeight:300}}>{ap.ca.toLocaleString("fr-FR")} €</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[
                  {l:"Part proprio (80%)", v:`${ap.partProprio.toLocaleString("fr-FR")} €`, c:C.gold},
                  {l:"Commission AMC (20%)",v:`${ap.partAMC.toLocaleString("fr-FR")} €`,    c:C.muted},
                  {l:"Réservations",        v:ap.nb,                                          c:C.white},
                ].map((s,i)=>(
                  <div key={i} style={{background:C.surface,borderRadius:4,padding:"8px 10px"}}>
                    <div style={{fontFamily:F.sans,fontSize:8,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
                    <div style={{fontFamily:F.serif,fontSize:15,color:s.c,fontWeight:300}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>Réservations</div>
      {filtrees.length===0?(
        <div style={{textAlign:"center",padding:"30px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Aucune réservation pour cette période</div>
      ):(
        <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,overflow:"hidden"}}>
          {filtrees.map((r,i)=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:i<filtrees.length-1?`0.5px solid ${C.border}`:"none",background:i%2===0?"transparent":C.surface}}>
              <div style={{width:3,height:28,borderRadius:2,background:r.appartements?.color||C.gold,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:F.sans,fontSize:11,color:C.white}}>{r.voyageur_nom||"Réservé"}</div>
                <div style={{fontFamily:F.sans,fontSize:9,color:C.muted,marginTop:1}}>{r.appartements?.nom} · {r.checkin} → {r.checkout}</div>
              </div>
              <span style={{fontFamily:F.sans,fontSize:9,color:r.source==="airbnb"?C.airbnb:C.booking,fontWeight:600,textTransform:"uppercase"}}>{r.source}</span>
              {r.montant>0
                ?<span style={{fontFamily:F.serif,fontSize:15,color:C.gold,fontWeight:300}}>{r.montant.toLocaleString("fr-FR")} €</span>
                :<span style={{fontFamily:F.sans,fontSize:9,color:C.warn}}>⚠️ Manquant</span>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
