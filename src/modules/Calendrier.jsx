import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const C = {
  bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",
  borderGold:"#3A2E10",gold:"#8A951",goldDark:"#7A5E1A",
  white:"#FAF6EE",muted:"#5A5550",successTxt:"#5BBF8A",
  dangerTxt:"#E07A65",warn:"#D4A52A",airbnb:"#FF5A5F",booking:"#003B95",
};
const F={serif:"'Cormorant Garamond',serif",sans:"'Montserrat',sans-serif"};
const MOIS=["Janvier","FÃ©vrier","Mars","Avril","Mai","Juin","Juillet","AoÃ»t","Septembre","Octobre","Novembre","DÃ©cembre"];
const JOURS=["L","M","M","J","V","S","D"];
const pad2=n=>String(n).padStart(2,"0");
const dateStr=(y,m,d)=>`${y}-${pad2(m+1)}-${pad2(d)}`;

export default function Calendrier(){
  const[apparts,setApparts]=useState([]);
  const[reservations,setReservations]=useState([]);
  const[filterAp,setFilterAp]=useState("tous");
  const[year,setYear]=useState(new Date().getFullYear());
  const[month,setMonth]=useState(new Date().getMonth());
  const[loading,setLoading]=useState(true);
  const[showBlocage,setShowBlocage]=useState(null);
  const[blocageData,setBlocageData]=useState({debut:"",fin:"",motif:""});
  const[saving,setSaving]=useState(false);
  const[syncing,setSyncing]=useState(false);
  const load=async()=>{
    setLoading(true);
    const[{data:ap},{data:res}]=await Promise.all([
      supabase.from('appartements').select('id,nom,nom_long,color').order('nom'),
      supabase.from('reservations').select('*,appartements(nom,color)').neq('statut','annulÃ©'),
    ]);
    setApparts(ap||[]);setReservations(res||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  const daysInMonth=new Date(year,month+1,0).getDate();
  const firstDay=()=>{const d=new Date(year,month,1).getDay();return d===0?6:d-1;};
  const totalCells=Math.ceil((firstDay()+daysInMonth)/7)*7;
  const todayStr=dateStr(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
  const getResForDay=(d)=>{
    const ds=dateStr(year,month,d);
    const list=filterAp==="tous"?reservations:reservations.filter(r=>r.appart_id===filterAp);
    return list.filter(r=>ds>=r.checkin&&ds<r.checkout);
  };
  const bloquerDates=async()=>{
    if(!blocageData.debut||!blocageData.fin||!showBlocage)return;
    setSaving(true);
    await supabase.from('reservations').insert({
      appart_id:showBlocage,
      source:"blocage",
      voyageur_nom:blocageData.motif||"Bloqué",
      checkin:blocageData.debut,
      checkout:blocageData.fin,
      statut:"bloqué",
      montant:0,
    });
    setSaving(false);setShowBlocage(null);setBlocageData({debut:"",fin:"",motif:""});
    load();
  };
  const parseIcal=(text,appartId,source)=>{
    const events=[];
    const blocks=text.split('BEGIN:VEVENT');
    for(let i=1;i<blocks.length;i++){
      const b=blocks[i];
      const getVal=(key)=>{const m=b.match(new RegExp(key+'[^:]*:([^\r\n]+)'));return m?m[1].trim():'';};
      const dtstart=getVal('DTSTART');
      const dtend=getVal('DTEND');
      const summary=getVal('SUMMARY');
      if(!dtstart||!dtend||summary.toLowerCase().includes('block')||summary.toLowerCase().includes('bloqué'))continue;
      const fmtDate=(d)=>d.length>=8?`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`:d;
      events.push({appart_id:appartId,source,statut:'confirmé',voyageur_nom:summary||'Voyageur '+source,checkin:fmtDate(dtstart),checkout:fmtDate(dtend),montant:0,adultes:1,nuits:Math.ceil((new Date(fmtDate(dtend))-new Date(fmtDate(dtstart)))/(1000*60*60*24))});
    }
    return events;
  };
  const syncIcal=async()=>{
    if(!apparts.length)return;
    setSyncing(true);
    try{
      const {data:apData}=await supabase.from('appartements').select('id,nom,airbnb_ical,booking_ical').order('nom');
      let imported=0;
      for(const ap of (apData||[])){
        const urls=[{url:ap.airbnb_ical,source:'airbnb'},{url:ap.booking_ical,source:'booking'}].filter(u=>u.url);
        for(const {url,source} of urls){
          try{
            const proxyUrl=`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const res=await fetch(proxyUrl);
            const text=await res.text();
            const events=parseIcal(text,ap.id,source);
            for(const ev of events){
              const exists=(await supabase.from('reservations').select('id').eq('appart_id',ev.appart_id).eq('checkin',ev.checkin).eq('source',source)).data?.length>0;
              if(!exists){await supabase.from('reservations').insert(ev);imported++;}
            }
          }catch(e){console.error('ical error',e);}
        }
      }
      alert(`Sync iCal terminée. ${imported} nouvelle(s) réservation(s) importée(s).`);
      load();
    }catch(e){alert('Erreur sync: '+e.message);}
    finally{setSyncing(false);}
  };
  const navPrev=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);};
  const navNext=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);};
  if(loading) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return(
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:`0.5px solid ${C.borderGold}`,paddingBottom:14}}>
        <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Calendrier</h1>
        <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>Gestion multi-appartements</p>
      </div>
      {/* ContrÃ´les */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:C.card,border:`0.5px solid ${C.border}`,borderRadius:4,padding:"5px 10px"}}>
          <button onClick={navPrev} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:16}}>â¹</button>
          <span style={{fontFamily:F.serif,fontSize:14,color:C.white,minWidth:160,textAlign:"center"}}>{MOIS[month]} {year}</span>
          <button onClick={navNext} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:16}}>âº</button>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          <button onClick={()=>setFilterAp("tous")} style={{background:filterAp==="tous"?`${C.gold}15`:"transparent",border:`0.5px solid ${filterAp==="tous"?C.gold:C.border}`,color:filterAp==="tous"?C.gold:C.muted,padding:"4px 10px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:600,textTransform:"uppercase"}}>Tous</button>
          {apparts.map(a=>(
            <button key={a.id} onClick={()=>setFilterAp(a.id)} style={{background:filterAp===a.id?`${a.color}15`:"transparent",border:`0.5px solid ${filterAp===a.id?a.color:C.border}`,color:filterAp===a.id?a.color:C.muted,padding:"4px 10px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:a.color}}/>{a.nom}
            </button>
          ))}
        </div>
        {/* Bloquer des dates */}
        {filterAp!=="tous"&&(
          <button onClick={()=>setShowBlocage(filterAp)}
            style={{background:"transparent",border:`0.5px solid ${C.dangerTxt}44`,color:C.dangerTxt,padding:"5px 12px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>
            ð« Bloquer des dates
          </button>
        )}
                <button onClick={syncIcal} disabled={syncing} style={{background:"transparent",border:`0.5px solid ${C.gold}44`,color:C.gold,padding:"5px 12px",borderRadius:3,fontSize:9,fontWeight:600,cursor:syncing?"not-allowed":"pointer",fontFamily:F.sans,letterSpacing:1,textTransform:"uppercase",opacity:syncing?.6:1}}>
        {syncing?"Synchronisation...":"ð Sync iCal"}
      </button>
      </div>
      {/* Formulaire blocage */}
      {showBlocage&&(
        <div style={{background:C.card,border:`0.5px solid ${C.dangerTxt}44`,borderRadius:6,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontFamily:F.sans,fontSize:10,color:C.dangerTxt,fontWeight:600,marginBottom:10}}>ð« Bloquer des dates â {apparts.find(a=>a.id===showBlocage)?.nom}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
            {[{l:"Du",k:"debut",t:"date"},{l:"Au",k:"fin",t:"date"},{l:"Motif",k:"motif",t:"text"}].map(fi=>(
              <div key={fi.k}>
                <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:4}}>{fi.l}</label>
                <input type={fi.t} value={blocageData[fi.k]} onChange={e=>setBlocageData(p=>({...p,[fi.k]:e.target.value}))}
                  placeholder={fi.k==="motif"?"Travaux, usage perso...":""}
                  style={{width:"100%",background:C.surface,border:`0.5px solid ${C.border}`,color:C.white,padding:"7px 9px",borderRadius:4,fontFamily:F.sans,fontSize:11,outline:"none"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowBlocage(null)} style={{background:"transparent",border:`0.5px solid ${C.border}`,color:C.muted,padding:"5px 12px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,letterSpacing:.5,textTransform:"uppercase"}}>Annuler</button>
            <button onClick={bloquerDates} disabled={saving} style={{background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,color:"#080808",border:"none",padding:"5px 12px",borderRadius:3,fontSize:9,cursor:"pointer",fontFamily:F.sans,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>
              {saving?"Sauvegarde...":"Bloquer"}
            </button>
          </div>
        </div>
      )}
      {/* Calendrier */}
      <div style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"14px 16px",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
          {JOURS.map((d,i)=><div key={i} style={{textAlign:"center",fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:1.5,padding:"4px 0"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {Array.from({length:totalCells}).map((_,i)=>{
            const dn=i-firstDay()+1;
            const valid=dn>=1&&dn<=daysInMonth;
            const ds=valid?dateStr(year,month,dn):null;
            const isToday=ds===todayStr;
            const dayRes=valid?getResForDay(dn):[];
            return(
              <div key={i} className={valid?"day-cell":""}
                style={{minHeight:56,background:valid?C.surface:"transparent",border:`0.5px solid ${isToday?C.gold:valid?C.border:"transparent"}`,borderRadius:4,padding:"3px 4px",opacity:valid?1:.2}}>
                {valid&&(
                  <>
                    <div style={{fontFamily:F.sans,fontSize:9,color:isToday?C.gold:C.muted,marginBottom:2}}>{dn}</div>
                    {dayRes.slice(0,3).map(r=>{
                      const color=r.source==="blocage"?"#555":r.appartements?.color||C.gold;
                      return(
                        <div key={r.id} className="res-block"
                          style={{background:`${color}28`,color,border:`0.5px solid ${color}55`,fontSize:9,padding:"1px 4px",borderRadius:2,marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {r.source==="blocage"?"ð«":""}{r.voyageur_nom?.split(" ")[0]||"RÃ©servÃ©"}
                        </div>
                      );
                    })}
                    {dayRes.length>3&&<div style={{fontFamily:F.sans,fontSize:8,color:C.muted}}>+{dayRes.length-3}</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* LÃ©gende */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
        {apparts.map(a=>(
          <div key={a.id} style={{display:"flex",alignItems:"center",gap:5,fontFamily:F.sans,fontSize:10,color:C.muted}}>
            <div style={{width:10,height:10,borderRadius:2,background:a.color}}/>{a.nom_long||a.nom}
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:5,fontFamily:F.sans,fontSize:10,color:C.muted}}>
          <div style={{width:10,height:10,borderRadius:2,background:"#555"}}/> BloquÃ©
        </div>
      </div>
      {/* Prochaines arrivÃ©es & dÃ©parts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[{label:"â¶ Prochaines arrivÃ©es",color:C.successTxt,key:"checkin"},{label:"â Prochains dÃ©parts",color:C.dangerTxt,key:"checkout"}].map(({label,color,key})=>(
          <div key={key} style={{background:C.card,border:`0.5px solid ${C.border}`,borderRadius:6,padding:"12px 14px"}}>
            <div style={{fontFamily:F.sans,fontSize:9,color,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{label}</div>
            {[...reservations]
              .filter(r=>r.source!=="blocage"&&new Date(r[key])>=new Date()&&(filterAp==="tous"||r.appart_id===filterAp))
              .sort((a,b)=>new Date(a[key])-new Date(b[key]))
              .slice(0,4)
              .map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`0.5px solid ${C.border}`}}>
                  <div style={{width:3,height:26,borderRadius:2,background:r.appartements?.color||C.gold,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:F.sans,fontSize:11,color:C.white}}>{r.voyageur_nom}</div>
                    <div style={{fontFamily:F.sans,fontSize:9,color:C.muted}}>{r.appartements?.nom} Â· {r[key]}</div>
                  </div>
                </div>
              ))}
            {reservations.filter(r=>r.source!=="blocage"&&new Date(r[key])>=new Date()&&(filterAp==="tous"||r.appart_id===filterAp)).length===0&&(
              <div style={{fontFamily:F.sans,fontSize:11,color:C.muted}}>Aucune</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
