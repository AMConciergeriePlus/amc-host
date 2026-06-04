import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const C = {bg:'#080808',surface:'#0F0F0F',card:'#131313',border:'#222222',borderGold:'#3A2E10',gold:'#C8A951',goldDark:'#7A5E1A',white:'#FAF6EE',muted:'#5A5550',mutedMid:'#7A7470',successTxt:'#5BBF8A',warn:'#D4A52A',dangerTxt:'#E07A65'};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
export default function Tarification() {
  const [apparts,setApparts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState(null);
  useEffect(()=>{
    supabase.from('appartements').select('id,nom,nom_long,color,type,prix_base,frais_menage,caution').order('nom').then(({data})=>{setApparts(data||[]);setLoading(false);});
  },[]); // eslint-disable-line
  const save=async(ap)=>{
    await supabase.from('appartements').update({prix_base:ap.prix_base,frais_menage:ap.frais_menage,caution:ap.caution}).eq('id',ap.id);
    setEditing(null);
    supabase.from('appartements').select('id,nom,nom_long,color,type,prix_base,frais_menage,caution').order('nom').then(({data})=>setApparts(data||[]));
  };
  const inp=(label,k)=>(<div><div style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:'uppercase',marginBottom:4}}>{label}</div><input type='number' value={apparts.find(a=>a.id===editing)?.[k]||''} onChange={e=>setApparts(prev=>prev.map(a=>a.id===editing?{...a,[k]:+e.target.value}:a))} style={{width:'100%',background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:'6px 10px',borderRadius:4,fontFamily:F.sans,fontSize:12,outline:'none'}}/></div>);
  if(loading) return <div style={{textAlign:'center',padding:'60px 0',fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return (
    <div className='fade'>
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14}}>
        <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Tarification</h1>
        <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>Gestion des prix par appartement</p>
      </div>
      {apparts.map(ap=>(
        <div key={ap.id} style={{background:C.card,border:'0.5px solid '+(editing===ap.id?C.gold:C.border),borderRadius:6,padding:'16px 18px',marginBottom:10,borderLeft:'2px solid '+(ap.color||C.gold),transition:'all .15s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:editing===ap.id?14:0}}>
            <div><div style={{fontFamily:F.serif,fontSize:16,color:C.white,marginBottom:3}}>{ap.nom_long||ap.nom}</div><div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{ap.type}</div></div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:F.serif,fontSize:20,color:C.gold,fontWeight:300}}>{ap.prix_base} EUR<span style={{fontFamily:F.sans,fontSize:9,color:C.muted}}>/nuit</span></div>
                <div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>Menage: {ap.frais_menage} EUR - Caution: {ap.caution} EUR</div>
              </div>
              <button onClick={()=>setEditing(editing===ap.id?null:ap.id)} style={{background:'transparent',border:'0.5px solid '+C.goldDark,color:C.gold,padding:'5px 10px',borderRadius:3,fontSize:9,cursor:'pointer',fontFamily:F.sans}}>{editing===ap.id?'Fermer':'Modifier'}</button>
            </div>
          </div>
          {editing===ap.id&&(
            <div className='fade'>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:12}}>
                {inp('Prix/nuit (EUR)','prix_base')}{inp('Frais menage (EUR)','frais_menage')}{inp('Caution (EUR)','caution')}
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
                <button onClick={()=>setEditing(null)} style={{background:'transparent',border:'0.5px solid '+C.border,color:C.muted,padding:'7px 16px',borderRadius:3,fontSize:10,cursor:'pointer',fontFamily:F.sans}}>Annuler</button>
                <button onClick={()=>save(ap)} style={{background:'linear-gradient(135deg,'+C.goldDark+','+C.gold+')',color:C.bg,border:'none',padding:'7px 16px',borderRadius:3,fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:F.sans}}>Sauvegarder</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
