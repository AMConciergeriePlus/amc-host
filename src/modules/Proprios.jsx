import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const C = {bg:'#080808',surface:'#0F0F0F',card:'#131313',border:'#222222',borderGold:'#3A2E10',gold:'#C8A951',goldDark:'#7A5E1A',white:'#FAF6EE',muted:'#5A5550',mutedMid:'#7A7470',successTxt:'#5BBF8A',warn:'#D4A52A',dangerTxt:'#E07A65'};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
export default function Proprios() {
  const [proprios,setProprios]=useState([]);
  const [loading,setLoading]=useState(true);
  const [open,setOpen]=useState(null);
  const [form,setForm]=useState(null);
  const [saving,setSaving]=useState(false);
  useEffect(()=>{load();},[]); // eslint-disable-line
  const load=async()=>{
    const {data}=await supabase.from('proprios').select('*,appartements(nom,color)').order('nom');
    setProprios(data||[]);setLoading(false);
  };
  const save=async()=>{
    if(!form) return;
    setSaving(true);
    if(form.id){await supabase.from('proprios').update(form).eq('id',form.id);}
    else{await supabase.from('proprios').insert(form);}
    setForm(null);setSaving(false);load();
  };
  const inp=(k,l,t='text')=>(<div style={{marginBottom:12}}><label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:'uppercase',display:'block',marginBottom:5}}>{l}</label><input type={t} value={(form||{})[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={{width:'100%',background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:'8px 10px',borderRadius:4,fontFamily:F.sans,fontSize:12,outline:'none'}}/></div>);
  if(loading) return <div style={{textAlign:'center',padding:'60px 0',fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return (
    <div className='fade'>
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14,display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
        <div><h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Proprietaires</h1>
        <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{proprios.length} proprietaire{proprios.length>1?'s':''}</p></div>
        <button onClick={()=>setForm({nom:'',prenom:'',email:'',tel:'',iban:''})} style={{background:'linear-gradient(135deg,'+C.goldDark+','+C.gold+')',color:C.bg,border:'none',padding:'7px 16px',borderRadius:3,fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:F.sans,letterSpacing:1,textTransform:'uppercase'}}>+ Nouveau</button>
      </div>
      {form&&(<div style={{background:C.card,border:'1px solid '+C.gold+'44',borderRadius:10,overflow:'hidden',marginBottom:20}}>
        <div style={{background:C.surface,borderBottom:'0.5px solid '+C.border,padding:'13px 18px',fontFamily:F.serif,fontSize:16,color:C.gold}}>{form.id?'Modifier':'Nouveau proprietaire'}</div>
        <div style={{padding:'18px 20px'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>{inp('prenom','Prenom')}{inp('nom','Nom')}{inp('email','Email','email')}{inp('tel','Telephone')}{inp('iban','IBAN')}</div></div>
        <div style={{padding:'11px 20px',borderTop:'0.5px solid '+C.border,background:C.surface,display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={()=>setForm(null)} style={{background:'transparent',border:'0.5px solid '+C.border,color:C.muted,padding:'7px 16px',borderRadius:3,fontSize:10,cursor:'pointer',fontFamily:F.sans}}>Annuler</button>
          <button onClick={save} disabled={saving} style={{background:'linear-gradient(135deg,'+C.goldDark+','+C.gold+')',color:C.bg,border:'none',padding:'7px 16px',borderRadius:3,fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:F.sans}}>{saving?'...':'Sauvegarder'}</button>
        </div>
      </div>)}
      {proprios.length===0&&!form&&(<div style={{background:C.card,border:'0.5px solid '+C.borderGold,borderRadius:6,padding:'32px',textAlign:'center'}}><div style={{fontFamily:F.serif,fontSize:18,color:C.gold,marginBottom:8}}>Aucun proprietaire</div><div style={{fontFamily:F.sans,fontSize:12,color:C.muted}}>Ajoutez votre premier proprietaire.</div></div>)}
      {proprios.map(p=>(<div key={p.id} style={{background:C.card,border:'0.5px solid '+(open===p.id?C.gold:C.border),borderRadius:6,padding:'14px 18px',marginBottom:10,transition:'all .15s'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{cursor:'pointer',flex:1}} onClick={()=>setOpen(open===p.id?null:p.id)}>
            <div style={{fontFamily:F.serif,fontSize:16,color:C.white,marginBottom:3}}>{p.prenom} {p.nom}</div>
            <div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{p.email||'n/a'} - {(p.appartements||[]).length} appart{(p.appartements||[]).length>1?'s':''}</div>
          </div>
          <button onClick={()=>setForm(p)} style={{background:'transparent',border:'0.5px solid '+C.goldDark,color:C.gold,padding:'5px 10px',borderRadius:3,fontSize:9,cursor:'pointer',fontFamily:F.sans}}>Modifier</button>
        </div>
        {open===p.id&&(p.appartements||[]).length>0&&(<div style={{marginTop:12,paddingTop:12,borderTop:'0.5px solid '+C.border,display:'flex',gap:8,flexWrap:'wrap'}}>{p.appartements.map(a=><div key={a.id} style={{background:C.surface,borderRadius:4,padding:'5px 10px',borderLeft:'2px solid '+(a.color||C.gold)}}><span style={{fontFamily:F.sans,fontSize:11,color:C.white}}>{a.nom}</span></div>)}</div>)}
      </div>))}
    </div>
  );
}
