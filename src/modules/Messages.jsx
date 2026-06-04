import { useState } from 'react';
const C = {bg:'#080808',surface:'#0F0F0F',card:'#131313',border:'#222222',borderGold:'#3A2E10',gold:'#C8A951',goldDark:'#7A5E1A',white:'#FAF6EE',muted:'#5A5550',mutedMid:'#7A7470',successTxt:'#5BBF8A',warn:'#D4A52A',dangerTxt:'#E07A65',airbnb:'#FF5A5F',booking:'#003B95'};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
const CONVS = [
  {id:1,nom:'Sophie Martin',appart:'Elysian',source:'airbnb',last:'Merci pour l accueil !',time:'14:32',unread:2},
  {id:2,nom:'Jean Dupont',appart:'Lumiere',source:'booking',last:'A quelle heure puis-je entrer ?',time:'11:15',unread:1},
  {id:3,nom:'Maria Garcia',appart:'Elysian',source:'airbnb',last:'Tout est parfait !',time:'Hier',unread:0},
];
export default function Messages() {
  const [selected,setSelected]=useState(null);
  const [input,setInput]=useState('');
  const [msgs,setMsgs]=useState([
    {id:1,from:'guest',text:'Bonjour, pouvez-vous me donner le code wifi ?',time:'14:28'},
    {id:2,from:'host',text:'Bonjour ! Le reseau est FreeboxAMC et le mot de passe est AMC2024',time:'14:30'},
    {id:3,from:'guest',text:'Merci pour l accueil !',time:'14:32'},
  ]);
  const conv=CONVS.find(c=>c.id===selected);
  const send=()=>{
    if(!input.trim()) return;
    setMsgs(prev=>[...prev,{id:Date.now(),from:'host',text:input,time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}]);
    setInput('');
  };
  return (
    <div className='fade'>
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14}}>
        <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Messages</h1>
        <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{CONVS.filter(c=>c.unread>0).length} conversation{CONVS.filter(c=>c.unread>0).length>1?'s':''} non lue{CONVS.filter(c=>c.unread>0).length>1?'s':''}</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16,height:480}}>
        <div style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'10px 14px',borderBottom:'0.5px solid '+C.border,fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2.5,textTransform:'uppercase'}}>Conversations</div>
          <div style={{flex:1,overflowY:'auto'}}>
            {CONVS.map(c=>(<div key={c.id} className={'conv-row'+(selected===c.id?' active':'')} onClick={()=>setSelected(c.id)} style={{padding:'10px 14px',borderBottom:'0.5px solid '+C.border,borderLeft:'2px solid '+(selected===c.id?C.gold:'transparent'),cursor:'pointer'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontFamily:F.sans,fontSize:11,color:C.white,fontWeight:c.unread>0?600:400}}>{c.nom}</span><span style={{fontFamily:F.sans,fontSize:9,color:C.muted}}>{c.time}</span></div>
              <div style={{fontFamily:F.sans,fontSize:10,color:C.muted,marginBottom:3}}>{c.appart}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontFamily:F.sans,fontSize:10,color:C.mutedMid,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>{c.last}</span>{c.unread>0&&<span style={{background:C.dangerTxt,color:'#fff',borderRadius:8,padding:'0 5px',fontSize:8,fontWeight:700}}>{c.unread}</span>}</div>
            </div>))}
          </div>
        </div>
        <div style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,display:'flex',flexDirection:'column'}}>
          {!conv?(<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F.sans,fontSize:12,color:C.muted}}>Selectionnez une conversation</div>):(
            <><div style={{padding:'12px 16px',borderBottom:'0.5px solid '+C.border,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontFamily:F.serif,fontSize:16,color:C.white}}>{conv.nom}</div><div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{conv.appart} - {conv.source}</div></div><span style={{fontFamily:F.sans,fontSize:10,color:conv.source==='airbnb'?C.airbnb:C.booking,fontWeight:600,textTransform:'uppercase'}}>{conv.source}</span></div>
            <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>{msgs.map(m=>(<div key={m.id} style={{display:'flex',justifyContent:m.from==='host'?'flex-end':'flex-start',marginBottom:10}}><div style={{maxWidth:'70%',background:m.from==='host'?C.goldDark+'44':C.surface,border:'0.5px solid '+(m.from==='host'?C.goldDark:C.border),borderRadius:8,padding:'8px 12px'}}><div style={{fontFamily:F.sans,fontSize:11,color:C.white,marginBottom:3}}>{m.text}</div><div style={{fontFamily:F.sans,fontSize:9,color:C.muted}}>{m.time}</div></div></div>))}</div>
            <div style={{padding:'10px 14px',borderTop:'0.5px solid '+C.border,display:'flex',gap:8}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder='Votre message...' style={{flex:1,background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:'8px 12px',borderRadius:4,fontFamily:F.sans,fontSize:12,outline:'none'}}/><button onClick={send} style={{background:'linear-gradient(135deg,'+C.goldDark+','+C.gold+')',color:C.bg,border:'none',padding:'8px 16px',borderRadius:4,fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:F.sans}}>Envoyer</button></div></> 
          )}
        </div>
      </div>
    </div>
  );
}
