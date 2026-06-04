import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
const C = {bg:'#080808',surface:'#0F0F0F',card:'#131313',border:'#222222',borderGold:'#3A2E10',gold:'#C8A951',goldDark:'#7A5E1A',white:'#FAF6EE',muted:'#5A5550',mutedMid:'#7A7470',successTxt:'#5BBF8A',warn:'#D4A52A',dangerTxt:'#E07A65',airbnb:'#FF5A5F',booking:'#003B95'};
const F = {serif:"'Cormorant Garamond','Palatino Linotype',serif",sans:"'Montserrat','Trebuchet MS',sans-serif"};
const MONTHS = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre'];
const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
export default function Calendrier() {
  const [apparts,setApparts]=useState([]);
  const [reservations,setRes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [current,setCurrent]=useState(new Date());
  const [selected,setSelected]=useState(null);
  useEffect(()=>{
    const load=async()=>{
      const [{data:ap},{data:res}]=await Promise.all([
        supabase.from('appartements').select('*').order('created_at'),
        supabase.from('reservations').select('*,appartements(nom,color)').order('checkin'),
      ]);
      setApparts(ap||[]);setRes(res||[]);setLoading(false);
    };
    load();
  },[]); // eslint-disable-line
  const year=current.getFullYear(),month=current.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const offset=firstDay===0?6:firstDay-1;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const pad=n=>String(n).padStart(2,'0');
  const getResForDay=day=>{
    const d=year+'-'+pad(month+1)+'-'+pad(day);
    return reservations.filter(r=>r.checkin<=d&&r.checkout>d);
  };
  if(loading) return <div style={{textAlign:'center',padding:'60px 0',fontFamily:F.sans,fontSize:12,color:C.muted}}>Chargement...</div>;
  return (
    <div className='fade'>
      <div style={{marginBottom:24,borderBottom:'0.5px solid '+C.borderGold,paddingBottom:14,display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
        <div><h1 style={{fontFamily:F.serif,fontSize:26,fontWeight:300,color:C.white,letterSpacing:1}}>Calendrier</h1>
        <p style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:4}}>{MONTHS[month]} {year} - {reservations.length} reservation{reservations.length>1?'s':''}</p></div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setCurrent(new Date(year,month-1,1))} style={{background:'transparent',border:'0.5px solid '+C.border,color:C.muted,padding:'6px 12px',borderRadius:3,cursor:'pointer',fontFamily:F.sans,fontSize:12}}>prev</button>
          <button onClick={()=>setCurrent(new Date())} style={{background:'linear-gradient(135deg,'+C.goldDark+','+C.gold+')',border:'none',color:C.bg,padding:'6px 12px',borderRadius:3,cursor:'pointer',fontFamily:F.sans,fontSize:10,fontWeight:600}}>Aujourd'hui</button>
          <button onClick={()=>setCurrent(new Date(year,month+1,1))} style={{background:'transparent',border:'0.5px solid '+C.border,color:C.muted,padding:'6px 12px',borderRadius:3,cursor:'pointer',fontFamily:F.sans,fontSize:12}}>next</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
        {DAYS.map(d=><div key={d} style={{fontFamily:F.sans,fontSize:9,color:C.muted,textAlign:'center',letterSpacing:1,padding:'4px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
        {Array(offset).fill(null).map((_,i)=><div key={'e'+i}/>)}
        {Array(daysInMonth).fill(null).map((_,i)=>{
          const day=i+1;
          const todayD=new Date();
          const isToday=todayD.getDate()===day&&todayD.getMonth()===month&&todayD.getFullYear()===year;
          const dayRes=getResForDay(day);
          return (
            <div key={day} className='day-cell' onClick={()=>setSelected(selected===day?null:day)}
              style={{background:selected===day?C.surface:C.card,border:'0.5px solid '+(selected===day?C.gold:C.border),minHeight:70,padding:'6px 6px 4px'}}>
              <div style={{fontFamily:F.sans,fontSize:11,color:isToday?C.gold:C.white,fontWeight:isToday?600:400,marginBottom:4}}>{day}</div>
              {dayRes.slice(0,2).map(r=>(
                <div key={r.id} className='res-block' style={{background:(r.appartements?.color||C.gold)+'22',color:r.appartements?.color||C.gold}}>
                  {r.appartements?.nom||'?'} - {r.voyageur_nom||'?'}
                </div>
              ))}
              {dayRes.length>2&&<div style={{fontFamily:F.sans,fontSize:8,color:C.muted}}>+{dayRes.length-2}</div>}
            </div>
          );
        })}
      </div>
      {apparts.length>0&&(
        <div style={{marginTop:16,display:'flex',gap:12,flexWrap:'wrap'}}>
          {apparts.map(ap=>(
            <div key={ap.id} style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:10,height:10,borderRadius:2,background:ap.color||C.gold}}/>
              <span style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{ap.nom}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
