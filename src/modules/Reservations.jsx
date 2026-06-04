import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const C = {bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",borderGold:"#3A2E10",gold:"#C8A951",goldDark:"#7A5E1A",white:"#FAF6EE",muted:"#5A5550",mutedMid:"#7A7470",successTxt:"#5BBF8A",warn:"#D4A52A",dangerTxt:"#E07A65",airbnb:"#FF5A5F",booking:"#003B95"};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
const Pill = ({label,color,small}) => <span style={{fontSize:small?8:10,padding:small?"1px 6px":"2px 9px",borderRadius:10,background:color+'18',color,border:'0.5px solid '+color+'44',fontFamily:F.sans,letterSpacing:.5,whiteSpace:"nowrap",fontWeight:500}}>{label}</span>;
export default function Reservations() {
  const [reservations,setRes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState('all');
  const [open,setOpen]=useState(null);
  useEffect(()=>{
    supabase.from('reservations').select('*,appartements(nom,nom_long,color)').order('checkin').then(({data})=>{setRes(data||[]);setLoading(false);});
  },[]); // eslint-disable-line
  const filtered = filter==='all'?reservations:reservations.filter(r=>r.source===filter);
  const sc = s=>({confirme:C.successTxt,attente:C.warn,annule:C.dangerTxt}[s]||C.muted);
  if(loading) return <div style={{textAlign:"center",padding:"60px 0",fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return (
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Reservations</h1>
          <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{reservations.length} reservation{reservations.length>1?"s":""}</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          {['all','airbnb','booking'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?'linear-gradient(135deg,'+C.goldDark+','+C.gold+')':'transparent',border:'0.5px solid '+(filter===f?C.gold:C.border),color:filter===f?C.bg:C.muted,padding:"5px 12px",borderRadius:3,cursor:"pointer",fontFamily:F.sans,fontSize:10,fontWeight:600,textTransform:"uppercase"}}>
              {f==='all'?'Toutes':f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {filtered.map(r=>(
        <div key={r.id} style={{background:C.card,border:'0.5px solid '+(open===r.id?C.gold:C.border),borderRadius:6,padding:"14px 18px",marginBottom:10,borderLeft:'2px solid '+(r.appartements?.color||C.gold),transition:"all .15s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{cursor:"pointer",flex:1}} onClick={()=>setOpen(open===r.id?null:r.id)}>
              <div style={{fontFamily:F.serif,fontSize:16,color:C.white,letterSpacing:.4,marginBottom:3}}>{r.voyageur_nom}</div>
              <div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{r.appartements?.nom} - {r.checkin} au {r.checkout}</div>
            </div>
            <span style={{fontFamily:F.serif,fontSize:16,color:C.gold}}>{r.montant} EUR</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            <Pill label={r.statut||'confirme'} color={sc(r.statut)} small/>
            {r.source&&<Pill label={r.source} color={r.source==='airbnb'?C.airbnb:C.booking} small/>}
          </div>
          {open===r.id&&(
            <div className="fade" style={{marginTop:12,paddingTop:12,borderTop:'0.5px solid '+C.border,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[{l:"Email",v:r.voyageur_email||"—"},{l:"Tel",v:r.voyageur_tel||"—"},{l:"Check-in",v:r.checkin||"—"},{l:"Check-out",v:r.checkout||"—"},{l:"Voyageurs",v:r.nb_voyageurs||"—"},{l:"Montant",v:(r.montant||0)+' EUR'}].map((it,i)=>(
                <div key={i} style={{background:C.surface,borderRadius:4,padding:"7px 10px"}}>
                  <div style={{fontFamily:F.sans,fontSize:8,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{it.l}</div>
                  <div style={{fontFamily:F.sans,fontSize:11,color:C.white}}>{it.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
