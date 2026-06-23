import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from './lib/supabase';
import Appartements from './modules/Appartements';
import Calendrier    from './modules/Calendrier';
import Reservations  from './modules/Reservations';
import Menage        from './modules/Menage';
import Facturation   from './modules/Facturation';
import Tarification  from './modules/Tarification';
import AgentIA       from './modules/AgentIA';

const C = {
  bg:"#080808",surface:"#0F0F0F",card:"#131313",border:"#222222",
  borderGold:"#3A2E10",gold:"#C8A951",goldLight:"#E2C97E",goldDark:"#7A5E1A",
  white:"#FAF6EE",muted:"#5A5550",mutedMid:"#7A7470",
  successTxt:"#5BBF8A",warn:"#D4A52A",dangerTxt:"#E07A65",
};

const F = {
  serif:"'Cormorant Garamond','Palatino Linotype',serif",
  sans:"'Montserrat','Trebuchet MS',sans-serif",
};

const injectGlobal = () => {
  if (document.getElementById('amc-global')) return;
  const l = document.createElement('link');
  l.id = 'amc-global'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Montserrat:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
  const s = document.createElement('style');
  s.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080808; color: #FAF6EE; font-family: 'Montserrat', sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0F0F0F; }
    ::-webkit-scrollbar-thumb { background: #7A5E1A; border-radius: 2px; }
    .nav-item { transition: all .15s; cursor: pointer; border-left: 2px solid transparent; }
    .nav-item:hover { background: #161410 !important; color: #E2C97E !important; }
    .nav-item.active { background: #161410 !important; border-left-color: #C8A951 !important; color: #C8A951 !important; }
    .hvr { transition: border-color .12s, background .12s; }
    .hvr:hover { border-color: #7A5E1A !important; background: #141414 !important; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    .fade { animation: fadeUp .2s ease forwards; }
    @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    .shimmer {
      background: linear-gradient(90deg,#7A5E1A,#C8A951,#F0DFA0,#C8A951,#7A5E1A);
      background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; animation: shimmer 4s linear infinite;
    }
    .day-cell { transition: border-color .1s; cursor: pointer; border-radius: 4px; }
    .day-cell:hover { border-color: #7A5E1A !important; }
    .res-block { border-radius:3px; padding:1px 5px; font-size:9px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; margin-bottom:2px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { display:inline-block; animation: spin .8s linear infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    .pulse { animation: pulse 1s ease infinite; }
    input[type=range] { -webkit-appearance:none; height:4px; border-radius:2px; background:#2A2A2A; outline:none; cursor:pointer; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:linear-gradient(135deg,#7A5E1A,#C8A951); cursor:pointer; }
    .toggle-track { width:28px; height:16px; border-radius:8px; background:#2A2A2A; border:0.5px solid #333; cursor:pointer; position:relative; transition:background .2s; }
    .toggle-track.on { background:#7A5E1A; border-color:#C8A951; }
    .toggle-thumb { position:absolute; top:2px; left:2px; width:10px; height:10px; border-radius:50%; background:#888; transition:left .2s, background .2s; }
    .toggle-track.on .toggle-thumb { left:14px; background:#C8A951; }
  `;
  document.head.appendChild(s);
};

const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <defs>
      <linearGradient id="rG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7A5E1A"/><stop offset="50%" stopColor="#C8A951"/><stop offset="100%" stopColor="#7A5E1A"/>
      </linearGradient>
      <linearGradient id="kG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C8A951"/><stop offset="50%" stopColor="#F0DFA0"/><stop offset="100%" stopColor="#8B6914"/>
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="#0F0F0F"/>
    <circle cx="60" cy="60" r="56" stroke="url(#rG)" strokeWidth="2" fill="none"/>
    <g transform="translate(60,60)">
      <circle cx="0" cy="-14" r="10" stroke="url(#kG)" strokeWidth="2.5" fill="none"/>
      <circle cx="0" cy="-14" r="5" fill="url(#kG)" opacity=".6"/>
      <rect x="-1.5" y="-4" width="3" height="22" rx="1.5" fill="url(#kG)"/>
      <rect x="1.5" y="8" width="5" height="2.5" rx="1" fill="url(#kG)"/>
      <rect x="1.5" y="13" width="4" height="2.5" rx="1" fill="url(#kG)"/>
    </g>
  </svg>
);

const NAV = [
  { section:"Vue d'ensemble", items:[
    { id:"dashboard",   icon:"⊞", label:"Dashboard" },
    { id:"appartements",icon:"⌂", label:"Appartements" },
    { id:"calendrier",  icon:"▦", label:"Calendrier" },
  ]},
  { section:"Opérations", items:[
    { id:"reservations",icon:"◈", label:"Réservations", badge:0, badgeColor:"#E07A65" },
    { id:"menage",      icon:"✦", label:"Ménage & équipes" },
  ]},
  { section:"Finance", items:[
    { id:"facturation", icon:"▣", label:"Facturation" },
    { id:"tarification",icon:"€", label:"Tarification" },
  ]},
  { section:"IA", items:[
    { id:"agent",       icon:"🤖", label:"Checklist IA" },
  ]},
];

const PageLogin = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) onLogin(data.user);
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Logo size={56}/>
          <div style={{ fontFamily:F.serif, fontSize:24, letterSpacing:4, color:C.white, textTransform:'uppercase', marginTop:12, fontWeight:500 }}>AMC HOST</div>
          <div style={{ fontFamily:F.sans, fontSize:9, letterSpacing:4, color:C.gold, textTransform:'uppercase', marginTop:4 }}>Channel Manager</div>
        </div>
        <form onSubmit={handleSubmit} style={{ background:C.card, border:`0.5px solid ${C.borderGold}`, borderRadius:10, padding:28 }}>
          <div style={{ fontFamily:F.serif, fontSize:18, color:C.white, marginBottom:20, textAlign:'center' }}>Connexion</div>
          {[
            { label:'Email', value:email, set:setEmail, type:'email' },
            { label:'Mot de passe', value:password, set:setPassword, type:'password' },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom:14 }}>
              <label style={{ fontFamily:F.sans, fontSize:9, color:C.muted, letterSpacing:2, textTransform:'uppercase', display:'block', marginBottom:5 }}>{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} required
                style={{ width:'100%', background:C.surface, border:`0.5px solid ${C.border}`, color:C.white, padding:'10px 12px', borderRadius:4, fontFamily:F.sans, fontSize:12, outline:'none' }}/>
            </div>
          ))}
          {error && <div style={{ fontFamily:F.sans, fontSize:11, color:C.dangerTxt, marginBottom:12, textAlign:'center' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width:'100%', background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, color:C.bg, border:'none', padding:'11px', borderRadius:4, fontSize:11, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:F.sans, letterSpacing:2, textTransform:'uppercase', opacity:loading?.7:1 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          {resetSent
            ? <p style={{textAlign:"center",marginTop:"12px",color:"#C8A951",fontFamily:"sans-serif",fontSize:"13px"}}>Email envoye ! Consultez votre boite mail.</p>
            : <p style={{textAlign:"center",marginTop:"8px"}}>
                <button type="button" onClick={async () => {
                  if (!email) { setError("Entrez votre email dabord"); return; }
                  const { error: e } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://amchost.fr" });
                  if (e) { setError(e.message); } else { setResetSent(true); }
                }} style={{background:"none",border:"none",color:"#C8A951",fontFamily:"sans-serif",fontSize:"12px",cursor:"pointer",textDecoration:"underline",padding:"0"}}>
                  Mot de passe oublie ?
                </button>
              </p>
          }
        </form>
<div style={{ textAlign:'center', marginTop:'12px' }}>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) { setError('Entrez votre email d\'abord'); return; }
                    const { error: e } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://amchost.fr' });
                    if (e) { setError(e.message); } else { setResetSent(true); }
                  }}
                  style={{ background:'none', border:'none', color:'#C8A951', fontFamily:'sans-serif', fontSize:'12px', cursor:'pointer', textDecoration:'underline', padding:'0' }}
                >Mot de passe oublie ?</button>
              </div>
          }ter', marginTop:16, fontFamily:F.sans, fontSize:10, color:C.muted }}>AM Conciergerie Plus · Usage privé</div>
      </div>
    </div>
  );
};

const Dashboard = ({ setPage }) => {
  const [apparts, setApparts]   = useState([]);
  const [reservations, setRes]  = useState([]);
  const [alertes, setAlertes]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: ap }, { data: res }] = await Promise.all([
          supabase.from('appartements').select('*').order('created_at'),
          supabase.from('reservations').select('*, appartements(nom,nom_long,color)').order('checkin').limit(5),
        ]);
        setApparts(ap || []);
        setRes(res || []);
        const sansMontant = (res||[]).filter(r => !r.montant || r.montant === 0);
        setAlertes(sansMontant);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const aujourd_hui = new Date().toISOString().split('T')[0];
  const arrivees = reservations.filter(r => r.checkin === aujourd_hui);
  const departs  = reservations.filter(r => r.checkout === aujourd_hui);

  return (
    <div className="fade">
      <div style={{ marginBottom:24, borderBottom:`0.5px solid #3A2E10`, paddingBottom:14, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontFamily:F.serif, fontSize:26, fontWeight:300, color:C.white, letterSpacing:1 }}>
            Bonjour, <span className="shimmer">Aloyse</span>
          </h1>
          <p style={{ fontFamily:F.sans, fontSize:11, color:C.muted, marginTop:4 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            {apparts.length > 0 && ` · ${apparts.length} appartement${apparts.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px 0', fontFamily:F.sans, fontSize:12, color:C.muted }}>Chargement...</div>
      ) : (
        <>
          {alertes.length > 0 && (
            <div style={{ background:`${C.warn}15`, border:`0.5px solid ${C.warn}44`, borderRadius:6, padding:'12px 16px', marginBottom:16, cursor:'pointer' }} onClick={()=>setPage('reservations')}>
              <div style={{ fontFamily:F.sans, fontSize:11, color:C.warn, fontWeight:600, marginBottom:4 }}>
                ⚠️ {alertes.length} réservation{alertes.length>1?'s':''} sans montant
              </div>
              <div style={{ fontFamily:F.sans, fontSize:10, color:C.mutedMid }}>
                Cliquez pour saisir les montants manquants → la facturation se mettra à jour automatiquement
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
            {[
              { l:'Appartements', v:apparts.length },
              { l:"Arrivées aujourd'hui", v:arrivees.length, c:C.successTxt },
              { l:"Départs aujourd'hui", v:departs.length, c:C.dangerTxt },
              { l:'Montants manquants', v:alertes.length, c:alertes.length>0?C.warn:C.successTxt },
            ].map((s, i) => (
              <div key={i} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'13px 16px' }}>
                <div style={{ fontFamily:F.sans, fontSize:8, letterSpacing:2.5, color:C.muted, textTransform:'uppercase', marginBottom:8 }}>{s.l}</div>
                <div style={{ fontFamily:F.serif, fontSize:24, color:s.c||C.white, fontWeight:300 }}>{s.v}</div>
              </div>
            ))}
          </div>

          {apparts.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
              {apparts.map(ap => (
                <div key={ap.id} className="hvr" onClick={()=>setPage('appartements')}
                  style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'12px 14px', cursor:'pointer', borderLeft:`2px solid ${ap.color||C.gold}` }}>
                  <div style={{ fontFamily:F.serif, fontSize:14, color:C.white, marginBottom:4 }}>{ap.nom_long||ap.nom}</div>
                  <div style={{ fontFamily:F.sans, fontSize:10, color:C.muted }}>{ap.type} · {ap.ville}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background:C.card, border:`0.5px solid ${C.borderGold}`, borderRadius:6, padding:'24px', textAlign:'center', marginBottom:20 }}>
              <div style={{ fontFamily:F.serif, fontSize:16, color:C.gold, marginBottom:8 }}>✦ Bienvenue sur AMC HOST</div>
              <div style={{ fontFamily:F.sans, fontSize:12, color:C.muted, lineHeight:1.7, marginBottom:16 }}>Commencez par ajouter votre premier appartement.</div>
              <button onClick={()=>setPage('appartements')}
                style={{ background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, color:C.bg, border:'none', padding:'7px 16px', borderRadius:3, fontSize:10, fontWeight:600, cursor:'pointer', fontFamily:F.sans, letterSpacing:1, textTransform:'uppercase' }}>
                + Ajouter un appartement
              </button>
            </div>
          )}

          {reservations.length > 0 && (
            <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontFamily:F.sans, fontSize:9, color:C.gold, letterSpacing:2.5, textTransform:'uppercase' }}>Réservations récentes</span>
                <span style={{ fontFamily:F.sans, fontSize:9, color:C.muted, cursor:'pointer' }} onClick={()=>setPage('reservations')}>Tout voir →</span>
              </div>
              {reservations.map(r => (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:`0.5px solid ${C.border}` }}>
                  <div style={{ width:3, height:28, borderRadius:2, background:r.appartements?.color||C.gold, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:F.sans, fontSize:11, color:C.white }}>{r.voyageur_nom}</div>
                    <div style={{ fontFamily:F.sans, fontSize:9, color:C.muted, marginTop:1 }}>{r.appartements?.nom} · {r.checkin} → {r.checkout}</div>
                  </div>
                  <span style={{ fontFamily:F.sans, fontSize:10, color:r.source==='airbnb'?'#FF5A5F':'#003B95', fontWeight:600 }}>{r.source}</span>
                  {r.montant > 0
                    ? <span style={{ fontFamily:F.serif, fontSize:14, color:C.gold }}>{r.montant} €</span>
                    : <span style={{ fontFamily:F.sans, fontSize:10, color:C.warn }}>⚠️ Montant manquant</span>
                  }
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function App() {
  injectGlobal();
  const [user, setUser]           = useState(null);
  const [resetMode, setResetMode] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [resetError, setResetError] = useState('');
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState('dashboard');
  const [sidebarOpen, setSidebar] = useState(true);
  const [montantsManquants, setMontantsManquants] = useState(0);

  useEffect(() => {
    // Subscribe to auth state changes first (always)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setResetMode(true);
        setUser(null);
        setLoading(false);
        return;
      }
      if (event === 'USER_UPDATED') {
        if (session?.user) {
          const u = await getCurrentUser();
          setUser(u);
          setResetMode(false);
        }
        setLoading(false);
        return;
      }
      if (session?.user) {
        const u = await getCurrentUser();
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Check URL hash for recovery token (Supabase puts it there)
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      // The onAuthStateChange will fire PASSWORD_RECOVERY event
      // Just set resetMode immediately for faster UX
      setResetMode(true);
      setLoading(false);
    } else {
      // Normal init: get current user
      getCurrentUser().then(u => { setUser(u); setLoading(false); });
    }

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}><Logo size={48}/><div style={{ fontFamily:F.sans, fontSize:10, color:C.muted, marginTop:12, letterSpacing:2 }}>Chargement...</div></div>
    </div>
  );

  if (resetMode) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080808' }}>
      <div style={{ background:'#131313', padding:'32px', borderRadius:'12px', width:'360px', boxShadow:'0 4px 24px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color:'#C8A951', marginBottom:'24px', textAlign:'center', fontFamily:'serif', letterSpacing:'2px' }}>NOUVEAU MOT DE PASSE</h2>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
          style={{ width:'100%', padding:'10px', marginBottom:'12px', background:'#0F0F0F', border:'1px solid #333', color:'#fff', borderRadius:'6px', boxSizing:'border-box', fontSize:'14px' }}
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPwd}
          onChange={e => setConfirmPwd(e.target.value)}
          style={{ width:'100%', padding:'10px', marginBottom:'16px', background:'#0F0F0F', border:'1px solid #333', color:'#fff', borderRadius:'6px', boxSizing:'border-box', fontSize:'14px' }}
        />
        {resetError && <div style={{ color:'#E07A65', fontSize:'13px', marginBottom:'12px' }}>{resetError}</div>}
        <button
          onClick={async () => {
            setResetError('');
            if (newPwd !== confirmPwd) { setResetError('Les mots de passe ne correspondent pas'); return; }
            if (newPwd.length < 6) { setResetError('Minimum 6 caractères requis'); return; }
            const { error } = await supabase.auth.updateUser({ password: newPwd });
            if (error) { setResetError(error.message); }
            else {
              setResetMode(false);
              setNewPwd('');
              setConfirmPwd('');
              const u = await getCurrentUser();
              setUser(u);
            }
          }}
          style={{ width:'100%', padding:'12px', background:'#C8A951', color:'#080808', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', fontSize:'14px', letterSpacing:'1px' }}
        >ENREGISTRER</button>
      </div>
    </div>
  );
    if (!user) return <PageLogin onLogin={async () => { const u = await getCurrentUser(); setUser(u); }}/>;

  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <Dashboard setPage={setPage}/>;
      case 'appartements': return <Appartements/>;
      case 'calendrier':   return <Calendrier/>;
      case 'reservations': return <Reservations/>;
      case 'menage':       return <Menage/>;
      case 'facturation':  return <Facturation/>;
      case 'tarification': return <Tarification/>;
      case 'agent':        return <AgentIA/>;
      default:             return <Dashboard setPage={setPage}/>;
    }
  };

  return (
    <div style={{ fontFamily:F.sans, background:C.bg, color:C.white, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:C.surface, borderBottom:`0.5px solid ${C.border}`, padding:'0 20px', height:54, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => setSidebar(!sidebarOpen)} style={{ background:'transparent', border:'none', color:C.muted, cursor:'pointer', fontSize:16, padding:'4px', lineHeight:1 }}>☰</button>
          <Logo size={30}/>
          <div>
            <div style={{ fontFamily:F.serif, fontSize:14, fontWeight:500, letterSpacing:3.5, color:C.white, textTransform:'uppercase', lineHeight:1 }}>AMC HOST</div>
            <div style={{ fontFamily:F.sans, fontSize:8, letterSpacing:3.5, color:C.gold, textTransform:'uppercase', marginTop:2 }}>Channel Manager</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {montantsManquants > 0 && (
            <button onClick={()=>setPage('reservations')}
              style={{ background:`${C.warn}15`, border:`0.5px solid ${C.warn}44`, color:C.warn, padding:'5px 10px', borderRadius:3, fontSize:9, cursor:'pointer', fontFamily:F.sans, fontWeight:600 }}>
              ⚠️ {montantsManquants} montant{montantsManquants>1?'s':''} manquant{montantsManquants>1?'s':''}
            </button>
          )}
          <button onClick={async () => { await supabase.auth.signOut(); setUser(null); }}
            style={{ background:'transparent', border:`0.5px solid ${C.border}`, color:C.muted, padding:'5px 10px', borderRadius:3, fontSize:9, cursor:'pointer', fontFamily:F.sans }}>
            Déconnexion
          </button>
          <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:C.bg, fontFamily:F.sans }}>
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <div style={{ width:sidebarOpen?200:0, background:C.surface, borderRight:`0.5px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden', transition:'width .2s ease' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'14px 0' }}>
            {NAV.map((section, si) => (
              <div key={si}>
                <div style={{ fontFamily:F.sans, fontSize:8, letterSpacing:3, color:C.muted, textTransform:'uppercase', padding:'8px 18px 4px', fontWeight:600, marginTop:si>0?6:0 }}>
                  {section.section}
                </div>
                {section.items.map(item => (
                  <div key={item.id} className={`nav-item${page===item.id?' active':''}`} onClick={() => setPage(item.id)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 18px', fontSize:12, color:page===item.id?C.gold:'#888480', background:page===item.id?`#7A5E1A22`:'transparent', fontFamily:F.sans, fontWeight:page===item.id?500:400, whiteSpace:'nowrap' }}>
                    <span style={{ fontSize:12, opacity:.8, width:14, textAlign:'center' }}>{item.icon}</span>
                    <span style={{ flex:1 }}>{item.label}</span>
                    {item.id==='reservations' && montantsManquants > 0 && (
                      <span style={{ background:C.warn, color:C.bg, borderRadius:8, padding:'0 6px', fontSize:8, fontWeight:700 }}>{montantsManquants}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ padding:'12px 18px', borderTop:`0.5px solid ${C.border}` }}>
            <div style={{ fontFamily:F.sans, fontSize:8, color:C.muted, letterSpacing:2, textTransform:'uppercase', marginBottom:3 }}>AMC HOST · v1.0</div>
            <div style={{ fontFamily:F.sans, fontSize:9, color:C.muted }}>AM Conciergerie Plus</div>
          </div>
        </div>

        <div style={{ flex:1, padding:'24px 28px', overflowY:'auto', background:C.bg }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
