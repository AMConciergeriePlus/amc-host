import { useState } from 'react';
const C = {bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",borderGold:"#3A2E10",gold:"#C8A951",goldDark:"#7A5E1A",white:"#FAF6EE",muted:"#5A5550",mutedMid:"#7A7470",successTxt:"#5BBF8A",warn:"#D4A52A",dangerTxt:"#E07A65"};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
const Toggle = ({on,onChange}) => (
  <div className={'toggle-track'+(on?' on':'')} onClick={()=>onChange(!on)}>
    <div className="toggle-thumb"/>
  </div>
);
export default function AgentConfig() {
  const [config,setConfig]=useState({
    auto_reply:false,checkin_msg:true,checkout_msg:true,review_msg:false,
    delay_checkin:24,delay_checkout:2,delay_review:48,
    lang:"fr",tone:"professionnel",
    openai_key:"",model:"gpt-4o-mini",
  });
  const [saved,setSaved]=useState(false);
  const set=(k,v)=>setConfig(p=>({...p,[k]:v}));
  const handleSave=()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);};
  const inp=(k,label,type="text",placeholder="")=>(
    <div style={{marginBottom:12}}>
      <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>{label}</label>
      <input type={type} value={config[k]||""} onChange={e=>set(k,type==='number'?+e.target.value:e.target.value)} placeholder={placeholder}
        style={{width:"100%",background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}/>
    </div>
  );
  const row=(k,label)=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:'0.5px solid '+C.border}}>
      <div>
        <div style={{fontFamily:F.sans,fontSize:12,color:C.white}}>{label}</div>
      </div>
      <Toggle on={config[k]} onChange={v=>set(k,v)}/>
    </div>
  );
  return (
    <div className="fade">
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Agent IA Config</h1>
          <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>Configuration de l'assistant automatique</p>
        </div>
        <button onClick={handleSave} style={{background:'linear-gradient(135deg,'+C.goldDark+','+C.gold+')',color:C.bg,border:"none",padding:"7px 16px",borderRadius:3,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F.sans,letterSpacing:1,textTransform:"uppercase"}}>
          {saved?"Sauvegarde !":"Sauvegarder"}
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <div style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:"16px 18px",marginBottom:14}}>
            <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2.5,textTransform:"uppercase",marginBottom:12}}>Reponses automatiques</div>
            {row("auto_reply","Reponse auto activee")}
            {row("checkin_msg","Message de check-in auto")}
            {row("checkout_msg","Message de check-out auto")}
            {row("review_msg","Demande d'avis auto")}
          </div>
          <div style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:"16px 18px"}}>
            <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2.5,textTransform:"uppercase",marginBottom:12}}>Delais (heures avant)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {inp("delay_checkin","Avant check-in","number")}
              {inp("delay_checkout","Apres check-out","number")}
              {inp("delay_review","Apres depart","number")}
            </div>
          </div>
        </div>
        <div>
          <div style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:"16px 18px",marginBottom:14}}>
            <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2.5,textTransform:"uppercase",marginBottom:12}}>Parametres IA</div>
            <div style={{marginBottom:12}}>
              <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Cle API OpenAI</label>
              <input type="password" value={config.openai_key||""} onChange={e=>set("openai_key",e.target.value)} placeholder="sk-..." style={{width:"100%",background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12,outline:"none"}}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Modele</label>
              <select value={config.model} onChange={e=>set("model",e.target.value)} style={{width:"100%",background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12}}>
                <option>gpt-4o-mini</option>
                <option>gpt-4o</option>
                <option>gpt-3.5-turbo</option>
              </select>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Langue</label>
              <select value={config.lang} onChange={e=>set("lang",e.target.value)} style={{width:"100%",background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12}}>
                <option value="fr">Francais</option>
                <option value="en">English</option>
                <option value="es">Espanol</option>
              </select>
            </div>
            <div>
              <label style={{fontFamily:F.sans,fontSize:9,color:C.muted,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5}}>Ton</label>
              <select value={config.tone} onChange={e=>set("tone",e.target.value)} style={{width:"100%",background:C.surface,border:'0.5px solid '+C.border,color:C.white,padding:"8px 10px",borderRadius:4,fontFamily:F.sans,fontSize:12}}>
                <option value="professionnel">Professionnel</option>
                <option value="chaleureux">Chaleureux</option>
                <option value="formel">Formel</option>
              </select>
            </div>
          </div>
          <div style={{background:C.card,border:'0.5px solid '+C.border,borderRadius:6,padding:"14px 16px"}}>
            <div style={{fontFamily:F.sans,fontSize:9,color:C.gold,letterSpacing:2.5,textTransform:"uppercase",marginBottom:8}}>Statut</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:config.auto_reply?C.successTxt:C.muted}}/>
              <span style={{fontFamily:F.sans,fontSize:11,color:config.auto_reply?C.successTxt:C.muted}}>{config.auto_reply?"Agent actif":"Agent inactif"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
