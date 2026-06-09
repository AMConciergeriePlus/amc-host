import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const C = {
  bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",
  borderGold:"#3A2E10",gold:"#C8A951",goldDark:"#7A5E1A",
  white:"#FAF6EE",muted:"#5A5550",successTxt:"#5BBF8A",
  dangerTxt:"#E07A65",warn:"#D4A52A",
};

const F={serif:"'Cormorant Garamond',serif",sans:"'Montserrat',sans-serif"};
const MOIS=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const Btn=({children,onClick,variant="gold",disabled,small,style:st})=>{
  const v={
    gold:{background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,color:"#080808",border:"none"},
    outline:{background:"transparent",color:C.gold,border:`0.5px solid ${C.goldDark}`},
    ghost:{background:"transparent",color:C.muted,border:`0.5px solid ${C.border}`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...v[variant],padding:small?"5px 10px":"7px 16px",borderRadius:3,fontSize:small?9:10,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:F.sans,letterSpacing:1,textTransform:"uppercase",opacity:disabled?.45:1,...st}}>{children}</button>;
};

export default function Tarification(){
  const[apparts,setApparts]=useState([]);
  const[selected,setSelected]=useState(null);
  const[tarif,setTarif]=useState(null);
  const[loading,setLoading]=useState(true);
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);

  useEffect(()=>{
    supabase.from('appartements').select('*').order('nom').then(({data})=>{
      setApparts(data||[]);
      if(data&&data.length>0)loadTarif(data[0]);
      setLoading(false);
    });
  },[]);

  const loadTarif=async(ap)=>{
    setSelected(ap);
    const{data}=await supabase.from('tarification').select('*').eq('appart_id',ap.id).single();
    if(data){
      setTarif(data);
    }else{
      setTarif({
        appart_id:ap.id,
        prix_base:80,weekend_maj:20,sejour_min:2,
        frais_menage:ap.frais_menage||0,caution:ap.caution||0,
        remise_semaine:10,remise_mois:20,
        actif_airbnb:true,actif_booking:true,
        saisons:[
          {id:1,label:"Haute saison été",debut:"2026-07-01",fin:"2026-08-31",maj:35,actif:true},
          {id:2,label:"Noël/Jour de l'an",debut:"2026-12-20",fin:"2027-01-05",maj:40,actif:true},
          {id:3,label:"Basse saison",debut:"2026-01-01",fin:"2026-02-28",maj:-15,actif:true},
        ],
        evenements:[
          {id:1,label:"Roland Garros",debut:"2026-05-25",fin:"2026-06-07",maj:25,actif:true},
          {id:2,label:"Disneyland fêtes",debut:"2026-12-01",fin:"2026-12-19",maj:20,actif:true},
        ],
      });
    }
  };

  const save=async()=>{
    if(!tarif)return;
    setSaving(true);
    const data={...tarif,saisons:JSON.stringify(tarif.saisons),evenements:JSON.stringify(tarif.evenements)};
    const{data:existing}=await supabase.from('tarification').select('id').eq('appart_id',tarif.appart_id).single();
    if(existing){
      await supabase.from('tarification').update(data).eq('appart_id',tarif.appart_id);
    }else{
      await supabase.from('tarification').insert(data);
    }
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000);
  };

  const f=(k,v)=>setTarif(p=>({...p,[k]:v}));

  if(loading) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  if(apparts.length===0) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Aucun appartement — ajoutez-en un d'abord.</div>;

  return(
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:`0.5px solid ${C.borderGold}`,paddingBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Tarification</h1>
          <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>Prix et règles par appartement</p>
        </div>
        <Btn onClick={save} disabled={saving} variant={saved?"outline":"gold"}>{saving?"Sauvegarde...":saved?"✓ Sauvegardé":"💾 Sauvegarder"}</Btn>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {apparts.map(ap=>(
          <button key={ap.id} onClick={()=>loadTarif(ap)}
            style={{background:selected?.id===ap.id?`${ap.color||C.gold}18`:"transparent",border:`0.5px solid ${selected?.id===ap.id?ap.color||C.gold:C.border}`,color:selected?.id===ap.id?ap.color||C.gold:C.muted,padding:"6px 14px",borderRadius:4,fontSize:10,cursor:"pointer",fontFamily:F.sans,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:ap.color||C.gold}}/>{ap.nom_long||ap.nom}
          </button>
        ))}
      </div>

      {tarif&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"16px"}}>
            <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Prix de base</div>
            {[
              {l:"Prix/nuit (€)",       k:"prix_base",     min:0},
              {l:"Majoration week-end (%)",k:"weekend_maj", min:0,max:100},
              {l:"Séjour minimum (nuits)",k:"sejour_min",   min:1},
              {l:"Frais ménage (€)",    k:"frais_menage",  min:0},
              {l:"Caution (€)",         k:"caution",       min:0},
              {l:"Remise 7+ nuits (%)", k:"remise_semaine",min:0,max:50},
              {l:"Remise 28+ nuits (%)",k:"remise_mois",   min:0,max:50},
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:i<6?`0.5px solid ${C.border}`:"none"}}>
                <span style={{fontFamily:F.sans,fontSize:11,color:C.white}}>{item.l}</span>
                <input type="number" value={tarif[item.k]??0} min={item.min} max={item.max}
                  onChange={e=>f(item.k,+e.target.value)}
                  style={{background:C.surface,border:`0.5px solid ${C.border}`,color:C.gold,padding:"5px 8px",borderRadius:4,fontFamily:F.sans,fontSize:12,width:80,textAlign:"right",outline:"none"}}/>
              </div>
            ))}
          </div>

          <div>
            <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"16px",marginBottom:12}}>
              <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Saisons</div>
              {(Array.isArray(tarif.saisons)?tarif.saisons:JSON.parse(tarif.saisons||"[]")).map((s,i)=>(
                <div key={s.id} style={{display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:i<2?`0.5px solid ${C.border}`:"none",flexWrap:"wrap"}}>
                  <span style={{fontFamily:F.sans,fontSize:10,color:C.white,flex:1,minWidth:100}}>{s.label}</span>
                  <input type="number" value={s.maj} onChange={e=>{
                    const saisons=Array.isArray(tarif.saisons)?[...tarif.saisons]:JSON.parse(tarif.saisons||"[]");
                    saisons[i]={...saisons[i],maj:+e.target.value};
                    f("saisons",saisons);
                  }} style={{background:C.surface,border:`0.5px solid ${C.border}`,color:s.maj>0?C.dangerTxt:C.successTxt,padding:"4px 6px",borderRadius:3,fontFamily:F.sans,fontSize:11,width:55,textAlign:"right",outline:"none"}}/>
                  <span style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>%</span>
                  <div className={`toggle-track${s.actif?" on":""}`} onClick={()=>{
                    const saisons=Array.isArray(tarif.saisons)?[...tarif.saisons]:JSON.parse(tarif.saisons||"[]");
                    saisons[i]={...saisons[i],actif:!s.actif};
                    f("saisons",saisons);
                  }}><div className="toggle-thumb"/></div>
                </div>
              ))}
            </div>

            <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"16px"}}>
              <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Événements</div>
              {(Array.isArray(tarif.evenements)?tarif.evenements:JSON.parse(tarif.evenements||"[]")).map((e,i)=>(
                <div key={e.id} style={{display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:i<1?`0.5px solid ${C.border}`:"none",flexWrap:"wrap"}}>
                  <span style={{fontFamily:F.sans,fontSize:10,color:C.white,flex:1,minWidth:100}}>{e.label}</span>
                  <input type="number" value={e.maj} onChange={ev=>{
                    const evs=Array.isArray(tarif.evenements)?[...tarif.evenements]:JSON.parse(tarif.evenements||"[]");
                    evs[i]={...evs[i],maj:+ev.target.value};
                    f("evenements",evs);
                  }} style={{background:C.surface,border:`0.5px solid ${C.border}`,color:C.dangerTxt,padding:"4px 6px",borderRadius:3,fontFamily:F.sans,fontSize:11,width:55,textAlign:"right",outline:"none"}}/>
                  <span style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>%</span>
                  <div className={`toggle-track${e.actif?" on":""}`} onClick={()=>{
                    const evs=Array.isArray(tarif.evenements)?[...tarif.evenements]:JSON.parse(tarif.evenements||"[]");
                    evs[i]={...evs[i],actif:!e.actif};
                    f("evenements",evs);
                  }}><div className="toggle-thumb"/></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
