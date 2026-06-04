import { useState } from 'react';
const C = {bg:'#080808',surface:'#0F0F0F',card:'#131313',border:'#222222',borderGold:'#3A2E10',gold:'#C8A951',goldDark:'#7A5E1A',white:'#FAF6EE',muted:'#5A5550',mutedMid:'#7A7470',successTxt:'#5BBF8A',dangerTxt:'#E07A65'};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
export default function Deploiement() {
  const [copied,setCopied]=useState('');
  const copy=(text,key)=>{ navigator.clipboard.writeText(text).then(()=>{setCopied(key);setTimeout(()=>setCopied(''),2000);}); };
  const steps = [{n:1,t:'Configurer Supabase',d:'Creez votre projet sur supabase.com et recuperez URL + anon key'},{n:2,t:'Configurer Vercel',d:'Ajoutez les variables dans Settings > Environment Variables'},{n:3,t:'Deployer',d:'Chaque push sur main declenche un deploiement automatique'},{n:4,t:'Verifier',d:'Testez la connexion et authentification en production'}];
  const envs = [{k:'VITE_SUPABASE_URL',d:'URL de votre projet Supabase',e:'https://xxxx.supabase.co'},{k:'VITE_SUPABASE_ANON_KEY',d:'Cle publique Supabase (anon key)',e:'eyJhbGci...'}];
  const cmds = [{c:'npm install',d:'Installer les dependances'},{c:'npm run dev',d:'Lancer en local'},{c:'npm run build',d:'Build production'},{c:'git push origin main',d:'Declencher un deploiement'}];
  return (
    <div className='fade'>
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14}}>
        <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Deploiement</h1>
        <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>Configuration et mise en production</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
        {steps.map(s=>(
          <div key={s.n} style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:'14px 16px',display:'flex',gap:12,alignItems:'flex-start'}}>
            <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,'+C.goldDark+','+C.gold+')',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F.sans,fontSize:11,fontWeight:700,color:C.bg,flexShrink:0}}>{s.n}</div>
            <div><div style={{fontFamily:F.sans,fontSize:12,color:C.white,marginBottom:3,fontWeight:500}}>{s.t}</div><div style={{fontFamily:F.sans,fontSize:11,color:C.muted,lineHeight:1.6}}>{s.d}</div></div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:'14px 16px',marginBottom:14}}>
        <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2.5,textTransform:'uppercase',marginBottom:12}}>Variables d'environnement</div>
        {envs.map(v=>(
          <div key={v.k} style={{marginBottom:12,paddingBottom:12,borderBottom:'0.5px solid '+C.border}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <code style={{fontFamily:'monospace',fontSize:12,color:C.gold,background:C.surface,padding:'2px 8px',borderRadius:3}}>{v.k}</code>
              <button onClick={()=>copy(v.k,v.k)} style={{background:'transparent',border:'0.5px solid '+C.border,color:copied===v.k?C.successTxt:C.muted,padding:'2px 8px',borderRadius:3,fontSize:9,cursor:'pointer',fontFamily:F.sans}}>{copied===v.k?'Copie !':'Copier'}</button>
            </div>
            <div style={{fontFamily:F.sans,fontSize:11,color:C.muted}}>{v.d}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:'14px 16px'}}>
        <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2.5,textTransform:'uppercase',marginBottom:12}}>Commandes</div>
        {cmds.map((cmd,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'0.5px solid '+C.border}}>
            <div><code style={{fontFamily:'monospace',fontSize:11,color:C.white}}>{cmd.c}</code><div style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginTop:2}}>{cmd.d}</div></div>
            <button onClick={()=>copy(cmd.c,'c'+i)} style={{background:'transparent',border:'0.5px solid '+C.border,color:copied==='c'+i?C.successTxt:C.muted,padding:'2px 8px',borderRadius:3,fontSize:9,cursor:'pointer',fontFamily:F.sans}}>{copied==='c'+i?'Copie !':'Copier'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
