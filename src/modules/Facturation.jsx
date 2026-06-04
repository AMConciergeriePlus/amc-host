import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const C = {bg:'#080808',surface:'#0F0F0F',card:'#131313',border:'#222222',borderGold:'#3A2E10',gold:'#C8A951',goldDark:'#7A5E1A',white:'#FAF6EE',muted:'#5A5550',mutedMid:'#7A7470',successTxt:'#5BBF8A',warn:'#D4A52A',dangerTxt:'#E07A65'};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
export default function Facturation() {
  const [reservations,setRes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [period,setPeriod]=useState('month');
  useEffect(()=>{
    supabase.from('reservations').select('*,appartements(nom,color)').order('checkin').then(({data})=>{setRes(data||[]);setLoading(false);});
  },[]); // eslint-disable-line
  const now=new Date();
  const filtered=reservations.filter(r=>{
    if(!r.checkin) return false;
    const d=new Date(r.checkin);
    if(period==='month') return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    if(period==='year') return d.getFullYear()===now.getFullYear();
    return true;
  });
  const total=filtered.reduce((a,r)=>a+(r.montant||0),0);
  const bySource=filtered.reduce((a,r)=>{a[r.source||'autre']=(a[r.source||'autre']||0)+(r.montant||0);return a;},{});
  if(loading) return <div style={{textAlign:'center',padding:'60px 0',fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return (
    <div className='fade'>
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14,display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
        <div><h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Facturation</h1>
        <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{filtered.length} transaction{filtered.length>1?'s':''}</p></div>
        <div style={{display:'flex',gap:8}}>
          {[{v:'month',l:'Ce mois'},{v:'year',l:'Cette annee'},{v:'all',l:'Tout'}].map(p=>(<button key={p.v} onClick={()=>setPeriod(p.v)} style={{background:period===p.v?'linear-gradient(135deg,'+C.goldDark+','+C.gold+')':'transparent',border:'0.5px solid '+(period===p.v?C.gold:C.border),color:period===p.v?C.bg:C.muted,padding:'5px 12px',borderRadius:3,cursor:'pointer',fontFamily:F.sans,fontSize:10,fontWeight:600}}>{p.l}</button>))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:22}}>
        {[{l:'CA Total',v:total.toLocaleString('fr-FR')+' EUR',c:C.gold},{l:'Transactions',v:filtered.length,c:C.white},{l:'Moyenne',v:filtered.length?Math.round(total/filtered.length)+' EUR':'n/a',c:C.successTxt}].map((s,i)=>(<div key={i} style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:'13px 16px'}}><div style={{fontFamily:F.sans,fontSize:8,letterSpacing:2.5,color:C.muted,textTransform:'uppercase',marginBottom:8}}>{s.l}</div><div style={{fontFamily:F.serif,fontSize:24,color:s.c,fontWeight:300}}>{s.v}</div></div>))}
      </div>
      {Object.entries(bySource).length>0&&(<div style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:'14px 16px',marginBottom:16}}><div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2.5,textTransform:'uppercase',marginBottom:12}}>Par plateforme</div>{Object.entries(bySource).map(([src,amt])=>(<div key={src} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'0.5px solid '+C.border}}><span style={{fontFamily:F.sans,fontSize:11,color:C.white,textTransform:'capitalize'}}>{src}</span><span style={{fontFamily:F.serif,fontSize:14,color:C.gold}}>{amt.toLocaleString('fr-FR')} EUR</span></div>))}</div>)}
      {filtered.map(r=>(<div key={r.id} style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:'12px 16px',marginBottom:8,borderLeft:'2px solid '+(r.appartements?.color||C.gold)}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontFamily:F.sans,fontSize:11,color:C.white,marginBottom:2}}>{r.voyageur_nom||'n/a'}</div><div style={{fontFamily:F.sans,fontSize:9,color:C.muted}}>{r.appartements?.nom} - {r.checkin}</div></div><span style={{fontFamily:F.serif,fontSize:16,color:C.gold}}>{r.montant||0} EUR</span></div></div>))}
    </div>
  );
}
