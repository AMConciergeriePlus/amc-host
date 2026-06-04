import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const C = {bg:'#080808',surface:'#0F0F0F',card:'#131313',border:'#222222',borderGold:'#3A2E10',gold:'#C8A951',goldDark:'#7A5E1A',white:'#FAF6EE',muted:'#5A5550',mutedMid:'#7A7470',successTxt:'#5BBF8A',warn:'#D4A52A',dangerTxt:'#E07A65'};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
const CATS = ['Check-in','Check-out','Rappel','Probleme','Annulation','General'];
export default function Templates() {
  const [templates,setTemplates]=useState([]);
  const [loading,setLoading]=useState(true);
  const [form,setForm]=useState(null);
  const [saving,setSaving]=useState(false);
  useEffect(()=>{load();},[]); // eslint-disable-line
  const load=async()=>{
    const {data}=await supabase.from('templates').select('*').order('created_at');
    setTemplates(data||[]);setLoading(false);
  };
  const save=async()=>{
    if(!form?.nom||!form?.contenu) return;
    setSaving(true);
    if(form.id){await supabase.from('templates').update(form).eq('id',form.id);}
    else{await supabase.from('templates').insert(form);}
    setForm(null);setSaving(false);load();
  };
  const del=async(id)=>{await supabase.from('templates').delete().eq('id',id);load();};
  if(loading) return <div style={{textAlign:'center',padding:'60px 0',fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return (
    <div className='fade'>
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14,display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
        <div><h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Templates messages</h1>
        <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{templates.length} template{templates.length>1?'s':''}</p></div>
        <button onClick={()=>setForm({nom:'',categorie:'General',contenu:''})} style={{background:'linear-gradient(135deg,'+C.goldDark+','+C.gold+')',color:C.bg,border:'none',padding:'7px 16px',borderRadius:3,fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:F.sans,letterSpacing:1,textTransform:'uppercase'}}>+ Nouveau</button>
      </div>
      {form&&(
        <div style={{background:C.card,border:'1px solid '+C.gold+'44',borderRadius:10,overflow:'hidden',marginBottom:20}}>
          <div style={{background:C.surface,borderBottom:'0.5px solid '+C.border,padding:'13px 18px',fontFamily:F.serif,fontSize:16,color:C.gold}}>{form.id?'Modifier':'Nouveau template'}</div>
          <div style={{padding:'18px 20px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div><label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:'uppercase',display:'block',marginBottom:5}}>Nom</label><input value={form.nom||''} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} style={{width:'100%',background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:'8px 10px',borderRadius:4,fontFamily:F.sans,fontSize:12,outline:'none'}}/></div>
              <div><label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:'uppercase',display:'block',marginBottom:5}}>Categorie</label><select value={form.categorie||'General'} onChange={e=>setForm(p=>({...p,categorie:e.target.value}))} style={{width:'100%',background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:'8px 10px',borderRadius:4,fontFamily:F.sans,fontSize:12}}>{CATS.map(cat=><option key={cat}>{cat}</option>)}</select></div>
            </div>
            <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:'uppercase',display:'block',marginBottom:5}}>Contenu</label>
            <textarea value={form.contenu||''} onChange={e=>setForm(p=>({...p,contenu:e.target.value}))} rows={5} placeholder='Bonjour {prenom}...' style={{width:'100%',background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:'8px 10px',borderRadius:4,fontFamily:F.sans,fontSize:12,resize:'vertical'}}/>
          </div>
          <div style={{padding:'11px 20px',borderTop:'0.5px solid '+C.border,background:C.surface,display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button onClick={()=>setForm(null)} style={{background:'transparent',border:'0.5px solid '+C.border,color:C.muted,padding:'7px 16px',borderRadius:3,fontSize:10,cursor:'pointer',fontFamily:F.sans}}>Annuler</button>
            <button onClick={save} disabled={saving} style={{background:'linear-gradient(135deg,'+C.goldDark+','+C.gold+')',color:C.bg,border:'none',padding:'7px 16px',borderRadius:3,fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:F.sans}}>{saving?'...':'Sauvegarder'}</button>
          </div>
        </div>
      )}
      {templates.length===0&&!form&&(<div style={{background:C.card,border:'0.5px solid '+C.borderGold,borderRadius:6,padding:'32px',textAlign:'center'}}><div style={{fontFamily:F.serif,fontSize:18,color:C.gold,marginBottom:8}}>Aucun template</div><div style={{fontFamily:F.sans,fontSize:12,color:C.muted}}>Creez des templates pour accelerer vos messages.</div></div>)}
      {templates.map(t=>(<div key={t.id} style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:'14px 18px',marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><div style={{fontFamily:F.serif,fontSize:16,color:C.white,marginBottom:3}}>{t.nom}</div><div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{t.categorie} - {(t.contenu||'').substring(0,60)}...</div></div><div style={{display:'flex',gap:6}}><button onClick={()=>setForm(t)} style={{background:'transparent',border:'0.5px solid '+C.goldDark,color:C.gold,padding:'4px 8px',borderRadius:3,fontSize:9,cursor:'pointer',fontFamily:F.sans}}>Modifier</button><button onClick={()=>del(t.id)} style={{background:'transparent',border:'0.5px solid #C0503A44',color:C.dangerTxt,padding:'4px 8px',borderRadius:3,fontSize:9,cursor:'pointer',fontFamily:F.sans}}>Sup.</button></div></div></div>))}
    </div>
  );
}
