import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const C = {bg:'#080808',surface:'#0F0F0F',card:'#131313',border:'#222222',borderGold:'#3A2E10',gold:'#C8A951',goldDark:'#7A5E1A',white:'#FAF6EE',muted:'#5A5550',mutedMid:'#7A7470',successTxt:'#5BBF8A',warn:'#D4A52A',dangerTxt:'#E07A65'};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
export default function Livrets() {
  const [apparts,setApparts]=useState([]);
  const [selected,setSelected]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    supabase.from('appartements').select('*').order('nom').then(({data})=>{setApparts(data||[]);setLoading(false);});
  },[]); // eslint-disable-line
  const ap = apparts.find(a=>a.id===selected);
  if(loading) return <div style={{textAlign:'center',padding:'60px 0',fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return (
    <div className='fade'>
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14}}><h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Livrets d'accueil</h1><p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{apparts.length} livret{apparts.length>1?'s':''}</p></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        {apparts.map(a=>(<div key={a.id} onClick={()=>setSelected(selected===a.id?null:a.id)} style={{background:C.card,border:'0.5px solid '+(selected===a.id?C.gold:C.border),borderRadius:6,padding:'16px',cursor:'pointer',borderLeft:'2px solid '+(a.color||C.gold),transition:'all .15s'}}><div style={{fontFamily:F.serif,fontSize:16,color:C.white,marginBottom:6}}>{a.nom_long||a.nom}</div><div style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginBottom:8}}>{a.ville} - {a.type}</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{a.wifi_nom&&<span style={{fontFamily:F.sans,fontSize:9,color:C.successTxt}}>WiFi</span>}{a.code_acces&&<span style={{fontFamily:F.sans,fontSize:9,color:C.successTxt}}>Code</span>}{a.points_forts&&<span style={{fontFamily:F.sans,fontSize:9,color:C.gold}}>Points forts</span>}</div></div>))}
      </div>
      {ap&&(<div style={{background:C.card,border:'1px solid '+C.gold+'44',borderRadius:10,padding:'24px'}}><div style={{fontFamily:F.serif,fontSize:22,color:C.gold,marginBottom:16}}>{ap.nom_long||ap.nom}</div><div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,marginBottom:ap.points_forts?16:0}}>{[{l:'Adresse',v:ap.adresse||'n/a'},{l:'Code acces',v:ap.code_acces||'n/a'},{l:'WiFi',v:ap.wifi_nom?(ap.wifi_nom+' / '+ap.wifi_pw):'n/a'},{l:'Check-in',v:ap.heure_checkin||'16:00'},{l:'Check-out',v:ap.heure_checkout||'11:00'},{l:'Parking',v:ap.parking?'Disponible':'Non disponible'}].map((it,i)=>(<div key={i} style={{background:C.surface,borderRadius:4,padding:'10px 14px'}}><div style={{fontFamily:F.sans,fontSize:8,color:C.muted,letterSpacing:2,textTransform:'uppercase',marginBottom:4}}>{it.l}</div><div style={{fontFamily:F.sans,fontSize:12,color:C.white}}>{it.v}</div></div>))}</div>{ap.points_forts&&(<div style={{borderTop:'0.5px solid '+C.border,paddingTop:14}}><div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>Points forts</div><div style={{fontFamily:F.sans,fontSize:12,color:C.mutedMid,lineHeight:1.6}}>{ap.points_forts}</div></div>)}</div>)}
    </div>
  );
}
