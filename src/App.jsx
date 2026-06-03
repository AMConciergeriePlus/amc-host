import { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from './lib/supabase';
import Appartements from './modules/Appartements';

// ── PALETTE & FONTS ───────────────────────────────────────────────────
const C = {
  bg:"#080808", surface:"#0F0F0F", card:"#131313", border:"#222222",
  borderGold:"#3A2E10", gold:"#C8A951", goldLight:"#E2C97E", goldDark:"#7A5E1A",
  white:"#FAF6EE", muted:"#5A5550", mutedMid:"#7A7470",
  successTxt:"#5BBF8A", warn:"#D4A52A", dangerTxt:"#E07A65",
  airbnb:"#FF5A5F", booking:"#003B95",
};
const F = {
  serif:"'Cormorant Garamond','Palatino Linotype',serif",
  sans:"'Montserrat','Trebuchet MS',sans-serif",
};

// ── INJECT STYLES & FONTS ─────────────────────────────────────────────
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
  `;
  document.head.appendChild(s);
};

// ── LOGO SVG ──────────────────────────────────────────────────────────
const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <defs>
      <linearGradient id="rG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7A5E1A"/>
        <stop offset="50%" stopColor="#C8A951"/>
        <stop offset="100%" stopColor="#7A5E1A"/>
      </linearGradient>
      <linearGradient id="kG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C8A951"/>
        <stop offset="50%" stopColor="#F0DFA0"/>
        <stop offset="100%" stopColor="#8B6914"/>
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

// ── PAGE LOGIN ────────────────────────────────────────────────────────
const PageLogin = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await supabase.auth.signInWithPassword({ email, password });
      if (data.user) onLogin(data.user);
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
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
          <div style={{ fontFamily:F.serif, fontSize:18, color:C.white, marginBottom:20, textAlign:'center', letterSpacing:.5 }}>Connexion</div>
          {[
            { label:'Email', value:email, set:setEmail, type:'email', placeholder:'amconciergerieplus@gmail.com' },
            { label:'Mot de passe', value:password, set:setPassword, type:'password', placeholder:'••••••••' },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom:14 }}>
              <label style={{ fontFamily:F.sans, fontSize:9, color:C.muted, letterSpacing:2, textTransform:'uppercase', display:'block', marginBottom:5 }}>{f.label}</label>
              <input
                type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder} required
                style={{ width:'100%', background:C.surface, border:`0.5px solid ${C.border}`, color:C.white, padding:'10px 12px', borderRadius:4, fontFamily:F.sans, fontSize:12, outline:'none' }}
              />
            </div>
          ))}
          {error && (
            <div style={{ fontFamily:F.sans, fontSize:11, color:C.dangerTxt, marginBottom:12, textAlign:'center' }}>{error}</div>
          )}
          <button type="submit" disabled={loading}
            style={{ width:'100%', background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, color:C.bg, border:'none', padding:'11px', borderRadius:4, fontSize:11, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:F.sans, letterSpacing:2, textTransform:'uppercase', marginTop:4, opacity:loading?.7:1 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div style={{ textAlign:'center', marginTop:16, fontFamily:F.sans, fontSize:10, color:C.muted }}>
          AM Conciergerie Plus · Usage privé
        </div>
      </div>
    </div>
  );
};

// ── NAVIGATION ────────────────────────────────────────────────────────
const NAV = [
  { section:"Vue d'ensemble", items:[
    { id:"dashboard",   icon:"⊞", label:"Dashboard" },
    { id:"appartements",icon:"⌂", label:"Appartements" },
    { id:"calendrier",  icon:"▦", label:"Calendrier" },
  ]},
  { section:"Opérations", items:[
    { id:"reservations",icon:"◈", label:"Réservations",     badge:3, badgeColor:C.dangerTxt },
    { id:"menage",      icon:"✦", label:"Ménage & équipes",  badge:1, badgeColor:C.dangerTxt },
    { id:"messages",    icon:"◻", label:"Messages",          badge:3, badgeColor:C.dangerTxt },
    { id:"livrets",     icon:"◉", label:"Livrets d'accueil" },
  ]},
  { section:"Finance", items:[
    { id:"compta",     icon:"◆", label:"Comptabilité" },
    { id:"facturation",icon:"▣", label:"Facturation" },
  ]},
  { section:"Gestion", items:[
    { id:"proprio",    icon:"👤", label:"Propriétaires" },
    { id:"tarification",icon:"€", label:"Tarification" },
  ]},
  { section:"IA & Intégrations", items:[
    { id:"agent",      icon:"🤖", label:"Agent IA Config" },
    { id:"connexions", icon:"⬡",  label:"Airbnb & Booking" },
  ]},
  { section:"Paramètres", items:[
    { id:"equipes",     icon:"◎", label:"Équipes" },
    { id:"deploiement", icon:"🚀", label:"Déploiement" },
  ]},
];

// ── PAGE PLACEHOLDER ──────────────────────────────────────────────────
const PagePlaceholder = ({ title, icon }) => (
  <div style={{ textAlign:'center', padding:'60px 20px' }}>
    <div style={{ fontSize:36, opacity:.2, marginBottom:14 }}>{icon}</div>
    <div style={{ fontFamily:F.serif, fontSize:20, color:C.mutedMid, fontWeight:300, letterSpacing:.5, marginBottom:8 }}>{title}</div>
    <div style={{ fontFamily:F.sans, fontSize:12, color:C.muted, maxWidth:400, margin:'0 auto', lineHeight:1.7 }}>
      Module complet — connexion Supabase en cours de branchement.
    </div>
  </div>
);

// ── DASHBOARD ─────────────────────────────────────────────────────────
const Dashboard = ({ user }) => {
  const [apparts, setApparts]   = useState([]);
  const [reservations, setRes]  = useState([]);
  const [loading, setLoading]   = useState(true);
  const role = user?.profile?.role || 'admin';

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: ap }, { data: res }] = await Promise.all([
          supabase.from('appartements').select('*').order('created_at'),
          supabase.from('reservations').select('*, appartements(nom, nom_long)').order('checkin').limit(5),
        ]);
        setApparts(ap || []);
        setRes(res || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const ca = reservations.reduce((a, r) => a + (r.montant || 0), 0);

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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
            {[
              { l:'Appartements', v:apparts.length },
              { l:'Réservations', v:reservations.length, c:C.gold },
              { l:'CA estimé',    v:`${ca.toLocaleString('fr-FR')} €`, c:C.successTxt },
              { l:'Messages',     v:3, c:C.dangerTxt },
            ].map((s, i) => (
              <div key={i} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'13px 16px' }}>
                <div style={{ fontFamily:F.sans, fontSize:8, letterSpacing:2.5, color:C.muted, textTransform:'uppercase', marginBottom:8 }}>{s.l}</div>
                <div style={{ fontFamily:F.serif, fontSize:24, color:s.c||C.white, fontWeight:300 }}>{s.v}</div>
              </div>
            ))}
          </div>
          {apparts.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:F.sans, fontSize:9, color:C.gold, letterSpacing:2.5, textTransform:'uppercase', marginBottom:10 }}>Appartements</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {apparts.map(ap => (
                  <div key={ap.id} className="hvr" style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'12px 14px', borderLeft:`2px solid ${ap.color||C.gold}` }}>
                    <div style={{ fontFamily:F.serif, fontSize:14, color:C.white, marginBottom:4 }}>{ap.nom_long || ap.nom}</div>
                    <div style={{ fontFamily:F.sans, fontSize:10, color:C.muted }}>{ap.type} · {ap.ville}</div>
                    <div style={{ fontFamily:F.serif, fontSize:16, color:C.gold, marginTop:6 }}>{ap.prix_base} €<span style={{ fontFamily:F.sans, fontSize:9, color:C.muted }}>/nuit</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {apparts.length === 0 && (
            <div style={{ background:C.card, border:`0.5px solid ${C.borderGold}`, borderRadius:6, padding:'24px', textAlign:'center' }}>
              <div style={{ fontFamily:F.serif, fontSize:16, color:C.gold, marginBottom:8 }}>✦ Bienvenue sur AMC HOST</div>
              <div style={{ fontFamily:F.sans, fontSize:12, color:C.muted, lineHeight:1.7 }}>
                Votre base de données est prête. Commencez par ajouter votre premier appartement.
              </div>
            </div>
          )}
          {reservations.length > 0 && (
            <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:6, padding:'14px 16px' }}>
              <div style={{ fontFamily:F.sans, fontSize:9, color:C.gold, letterSpacing:2.5, textTransform:'uppercase', marginBottom:12 }}>Réservations récentes</div>
              {reservations.map(r => (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:`0.5px solid ${C.border}` }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:F.sans, fontSize:11, color:C.white }}>{r.voyageur_nom}</div>
                    <div style={{ fontFamily:F.sans, fontSize:9, color:C.muted, marginTop:1 }}>{r.appartements?.nom} · {r.checkin} → {r.checkout}</div>
                  </div>
                  <span style={{ fontFamily:F.sans, fontSize:10, color:r.source==='airbnb'?C.airbnb:C.booking, fontWeight:600 }}>{r.source}</span>
                  <span style={{ fontFamily:F.serif, fontSize:14, color:C.gold }}>{r.montant} €</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── APP PRINCIPALE ────────────────────────────────────────────────────
export default function App() {
  injectGlobal();
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState('dashboard');
  const [sidebarOpen, setSidebar] = useState(true);

  useEffect(() => {
    // Use getSession - simpler and more reliable than getCurrentUser
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const u = await getCurrentUser();
          setUser(u || session.user);
        } catch(e) {
          setUser(session.user);
        }
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const u = await getCurrentUser();
          setUser(u || session.user);
        } catch(e) {
          setUser(session.user);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps; // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <Logo size={48}/>
          <div style={{ fontFamily:F.sans, fontSize:10, color:C.muted, marginTop:12, letterSpacing:2 }}>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!user) return <PageLogin onLogin={async () => { const u = await getCurrentUser(); setUser(u); }}/>;

  const role = user?.profile?.role || 'admin';

  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <Dashboard user={user}/>;
      case 'appartements': return <Appartements/>;
      case 'calendrier':   return <PagePlaceholder title="Calendrier" icon="▦"/>;
      case 'reservations': return <PagePlaceholder title="Réservations" icon="◈"/>;
      case 'menage':       return <PagePlaceholder title="Ménage & équipes" icon="✦"/>;
      case 'messages':     return <PagePlaceholder title="Messages" icon="◻"/>;
      case 'livrets':      return <PagePlaceholder title="Livrets d'accueil" icon="◉"/>;
      case 'compta':       return <PagePlaceholder title="Comptabilité" icon="◆"/>;
      case 'facturation':  return <PagePlaceholder title="Facturation" icon="▣"/>;
      case 'proprio':      return <PagePlaceholder title="Propriétaires" icon="👤"/>;
      case 'tarification': return <PagePlaceholder title="Tarification" icon="€"/>;
      case 'agent':        return <PagePlaceholder title="Agent IA Config" icon="🤖"/>;
      case 'connexions':   return <PagePlaceholder title="Airbnb & Booking" icon="⬡"/>;
      case 'equipes':      return <PagePlaceholder title="Équipes" icon="◎"/>;
      case 'deploiement':  return <PagePlaceholder title="Déploiement" icon="🚀"/>;
      default:             return <Dashboard user={user}/>;
    }
  };

  return (
    <div style={{ fontFamily:F.sans, background:C.bg, color:C.white, minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* TOPBAR */}
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
          <span style={{ fontFamily:F.sans, fontSize:10, color:C.muted }}>
            <span style={{ color:C.successTxt }}>●</span> {role}
          </span>
          <button onClick={async () => { await supabase.auth.signOut(); setUser(null); }}
            style={{ background:'transparent', border:`0.5px solid ${C.border}`, color:C.muted, padding:'5px 10px', borderRadius:3, fontSize:9, cursor:'pointer', fontFamily:F.sans, letterSpacing:.5 }}>
            Déconnexion
          </button>
          <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:C.bg, fontFamily:F.sans }}>
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* SIDEBAR */}
        <div style={{ width:sidebarOpen?210:0, background:C.surface, borderRight:`0.5px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden', transition:'width .2s ease' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'14px 0' }}>
            {NAV.map((section, si) => (
              <div key={si}>
                <div style={{ fontFamily:F.sans, fontSize:8, letterSpacing:3, color:C.muted, textTransform:'uppercase', padding:'8px 18px 4px', fontWeight:600, marginTop:si>0?6:0 }}>
                  {section.section}
                </div>
                {section.items.map(item => (
                  <div key={item.id}
                    className={`nav-item${page===item.id?' active':''}`}
                    onClick={() => setPage(item.id)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 18px', fontSize:12, color:page===item.id?C.gold:'#888480', background:page===item.id?'#7A5E1A22':'transparent', fontFamily:F.sans, fontWeight:page===item.id?500:400, whiteSpace:'nowrap' }}>
                    <span style={{ fontSize:12, opacity:.8, width:14, textAlign:'center' }}>{item.icon}</span>
                    <span style={{ flex:1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ background:item.badgeColor||C.gold, color:C.bg, borderRadius:8, padding:'0 6px', fontSize:8, fontWeight:700 }}>{item.badge}</span>
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

        {/* MAIN */}
        <div style={{ flex:1, padding:'24px 28px', overflowY:'auto', background:C.bg }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
