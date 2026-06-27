useEffect(() => {
  let initialCheckDone = false;

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      setResetMode(true);
      setResetSuccess(false);
      setUser(null);
      setLoading(false);
      initialCheckDone = true;
      return;
    }
    if (event === 'USER_UPDATED') {
      setResetMode(false);
      setResetSuccess(false);
      if (session?.user) {
        const u = await getCurrentUser();
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
      initialCheckDone = true;
      return;
    }
    if (event === 'SIGNED_IN') {
      if (session?.user) {
        const u = await getCurrentUser();
        setUser(u);
      }
      setLoading(false);
      initialCheckDone = true;
      return;
    }
    if (event === 'SIGNED_OUT') {
      setUser(null);
      setLoading(false);
      initialCheckDone = true;
      return;
    }
    if (event === 'INITIAL_SESSION') {
      if (session?.user) {
        const u = await getCurrentUser();
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
      initialCheckDone = true;
      return;
    }
    if (!initialCheckDone) {
      if (session?.user) {
        const u = await getCurrentUser();
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
      initialCheckDone = true;
    }
  });

  const fallback = setTimeout(() => {
    if (!initialCheckDone) {
      getCurrentUser().then(u => { setUser(u); setLoading(false); initialCheckDone = true; });
    }
  }, 3000);

  return () => { subscription.unsubscribe(); clearTimeout(fallback); };
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
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState('dashboard');
  const [sidebarOpen, setSidebar] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [montantsManquants, setMontantsManquants] = useState(0);

  useEffect(() => {
    // Subscribe to auth state changes first (always)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setResetMode(true);
        setResetSuccess(false);
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
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#080808' }}>
      <div style={{ background:'#131313',padding:'32px',borderRadius:'12px',width:'360px',boxShadow:'0 4px 24px rgba(0,0,0,0.5)',border:'1px solid #3A2E10' }}>
        {!resetSuccess ? (
          <>
            <h2 style={{ color:'#C8A951',marginBottom:'24px',textAlign:'center',fontFamily:"'Cormorant Garamond',serif",letterSpacing:'2px' }}>NOUVEAU MOT DE PASSE</h2>
            <input type="password" placeholder="Nouveau mot de passe" value={newPwd}
              onChange={e => { setNewPwd(e.target.value); setResetError(''); }}
              style={{ width:'100%',padding:'10px',marginBottom:'12px',background:'#0F0F0F',border:'1px solid #333',color:'#fff',borderRadius:'6px',boxSizing:'border-box',fontSize:'14px' }} />
            <input type="password" placeholder="Confirmer le mot de passe" value={confirmPwd}
              onChange={e => { setConfirmPwd(e.target.value); setResetError(''); }}
              style={{ width:'100%',padding:'10px',marginBottom:'16px',background:'#0F0F0F',border:'1px solid #333',color:'#fff',borderRadius:'6px',boxSizing:'border-box',fontSize:'14px' }} />
            {resetError && <div style={{ color:'#E07A65',fontSize:'13px',marginBottom:'12px' }}>{resetError}</div>}
            <button
              onClick={async () => {
                setResetError('');
                if (!newPwd || !confirmPwd) { setResetError('Remplissez les deux champs'); return; }
                if (newPwd !== confirmPwd) { setResetError('Les mots de passe ne correspondent pas'); return; }
                if (newPwd.length < 6) { setResetError('Minimum 6 caractères requis'); return; }
                const { error } = await supabase.auth.updateUser({ password: newPwd });
                if (error) { setResetError(error.message); }
                else { setNewPwd(''); setConfirmPwd(''); setResetSuccess(true); }
              }}
              style={{ width:'100%',padding:'12px',background:'#C8A951',color:'#080808',border:'none',borderRadius:'6px',fontWeight:'bold',cursor:'pointer',fontSize:'14px',letterSpacing:'1px' }}>
              ENREGISTRER
            </button>
          </>
        ) : (
          <>
            <div style={{ textAlign:'center',marginBottom:'24px' }}>
              <div style={{ color:'#5BBF8A',fontSize:'32px',marginBottom:'12px' }}>✓</div>
              <h2 style={{ color:'#C8A951',marginBottom:'12px',fontFamily:"'Cormorant Garamond',serif",letterSpacing:'2px' }}>MOT DE PASSE MODIFIÉ</h2>
              <p style={{ color:'#7A7470',fontSize:'13px',marginBottom:'20px',lineHeight:'1.6' }}>Votre mot de passe a été mis à jour. Veuillez vous reconnecter.</p>
            </div>
            <button
              onClick={() => { setResetMode(false); setResetSuccess(false); setUser(null); setShowLoginModal(true); }}
              style={{ width:'100%',padding:'12px',background:'#C8A951',color:'#080808',border:'none',borderRadius:'6px',fontWeight:'bold',cursor:'pointer',fontSize:'14px',letterSpacing:'1px' }}>
              SE CONNECTER
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (!user) return (
    <>
      <LandingPage onOpenLogin={() => setShowLoginModal(true)}/>
      {showLoginModal && <LoginModal
        onLogin={(u) => { setUser(u); setShowLoginModal(false); }}
        onClose={() => setShowLoginModal(false)}
      />}
    </>
  );


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
