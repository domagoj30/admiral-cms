"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";


// ═══════════════════════════════════════════════════════════════
// ADMIRAL CMS — s "Put do Finala" Calendar blokom
// ═══════════════════════════════════════════════════════════════

// ── Konst & tipovi faza ──
const PHASE_CONFIG = [
  { id:"gs",  label:"Grupna faza",        color:"#22c55e", days:18 },
  { id:"r32", label:"Šesnaestina finala", color:"#06b6d4", days:5 },
  { id:"r16", label:"Osmina finala",      color:"#3b82f6", days:6 },
  { id:"qf",  label:"Četvrtfinale",       color:"#a855f7", days:4 },
  { id:"sf",  label:"Polufinale",         color:"#f97316", days:4 },
  { id:"tp",  label:"Utakmica za 3. mj.", color:"#ef4444", days:1 },
  // Dan 39 = Finale (posebna kartica)
];

function buildPhaseArray() {
  const arr = [];
  PHASE_CONFIG.forEach(ph => { for(let i=0;i<ph.days;i++) arr.push(ph); });
  return arr; // 38 elemenata
}

const MONTH_SHORT = ['sij','velj','ožu','tra','svi','lip','srp','kol','ruj','lis','stu','pro'];
const MONTH_FULL  = ['siječnja','veljače','ožujka','travnja','svibnja','lipnja','srpnja','kolovoza','rujna','listopada','studenog','prosinca'];

function dayDate(startDate, n) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + n - 1);
  return d;
}

// ── Animations (globalni CSS) ──
const globalCSS = `
@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{to{background-position:200% center}}
@keyframes activeGlow{
  0%,100%{box-shadow:0 0 22px rgba(245,197,24,.2),0 0 44px rgba(245,197,24,.08),inset 0 0 20px rgba(245,197,24,.05)}
  50%{box-shadow:0 0 32px rgba(245,197,24,.35),0 0 64px rgba(245,197,24,.12),inset 0 0 28px rgba(245,197,24,.08)}
}
@keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes floatB{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(10deg)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes particleFloat{0%{transform:translateY(0) scale(1);opacity:.3}100%{transform:translateY(-20px) scale(1.5);opacity:.05}}
@keyframes cardIn{from{opacity:0;transform:scale(.7) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.ed-sidebar{display:none !important}
.ed-fab{display:flex}
@media(min-width:900px){.ed-sidebar{display:flex !important}.ed-fab{display:none !important}}
.cal-scroll::-webkit-scrollbar{width:5px}
.cal-scroll::-webkit-scrollbar-track{background:transparent}
.cal-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px}
`;

// ═══════════════════════════════════════
// CALENDAR BLOK — Renderer (Player View)
// ═══════════════════════════════════════
function CalendarBlock({ data, inEditor }) {
  const startDate = data.startDate ? new Date(data.startDate) : new Date(2026, 5, 11);
  const promoAmounts = data.promoAmounts || Array(38).fill("2€");
  const finaleInfo = data.finaleInfo || { day:"39", date:"19. srpnja", title:"FINALE", venue:"MetLife Stadium\nNew York / New Jersey" };
  const cols = data.cols || 7;

  // Demo: uvijek dan 1 (za editor), u produkciji calcuate real dan
  const activeDayNum = inEditor ? (data.previewDay || 1) : (() => {
    const PROMO_HOUR = 6;
    const now = new Date();
    const pd = new Date(now);
    if(pd.getHours() < PROMO_HOUR) pd.setDate(pd.getDate()-1);
    pd.setHours(0,0,0,0);
    const sd = new Date(startDate); sd.setHours(0,0,0,0);
    return Math.max(1, Math.min(39, Math.floor((pd-sd)/(24*3600*1000))+1));
  })();

  const phases = buildPhaseArray();
  const [dayView, setDayView] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if(!scrollRef.current) return;
    const grid = scrollRef.current.querySelector('.cal-inner-grid');
    if(!grid) return;
    setTimeout(() => {
      const cards = grid.querySelectorAll('.day-card');
      const activeCard = grid.querySelector('.day-card.active');
      if(activeCard) {
        const firstCard = cards[0];
        const cardH = firstCard?.offsetHeight || 0;
        const gap = 10;
        scrollRef.current.scrollTop = Math.max(0, activeCard.offsetTop - cardH - gap);
      }
    }, 200);
  }, []);

  // ── Day Detail View ──
  if(dayView) {
    const { num, date, phase, amount } = dayView;
    const dd = date.getDate(), mm = date.getMonth(), yyyy = date.getFullYear();
    const dateStr = dd + '. ' + MONTH_FULL[mm] + ' ' + yyyy + '.';
    const amt = amount.replace('€','').trim();
    const dateFrom = dd+'.'+(mm+1<10?'0':'')+(mm+1)+'.'+yyyy+'. 0:00';
    const dateTo = dd+'.'+(mm+1<10?'0':'')+(mm+1)+'.'+yyyy+'. 23:59';

    return (
      <div style={{background:'#080e1e', minHeight:400}}>
        {/* Back */}
        <div style={{padding:'16px 16px 0'}}>
          <button onClick={()=>setDayView(null)} style={{
            display:'inline-flex',alignItems:'center',gap:6,
            fontFamily:'Barlow Condensed,sans-serif',fontWeight:600,
            fontSize:14,color:'#f5c518',background:'none',border:'none',
            cursor:'pointer',letterSpacing:1,textTransform:'uppercase'
          }}>
            ← Natrag na kalendar
          </button>
        </div>

        <div style={{maxWidth:800,margin:'0 auto',padding:'16px 16px 40px'}}>
          {/* Header */}
          <div style={{textAlign:'center',marginBottom:24}}>
            <div style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:600,fontSize:13,
              color:'rgba(255,255,255,0.5)',letterSpacing:3,textTransform:'uppercase',marginBottom:6}}>
              Dan {num} · {phase.label}
            </div>
            <div style={{fontFamily:'Oswald,sans-serif',fontWeight:700,fontSize:34,color:'#fff',letterSpacing:2}}>
              {dateStr}
            </div>
            <div style={{display:'inline-block',background:'rgba(245,197,24,0.1)',border:'2px solid rgba(245,197,24,0.4)',
              color:'#fff',borderRadius:12,marginTop:18,padding:'16px 32px',textAlign:'center'}}>
              <div style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:600,fontSize:12,
                letterSpacing:2,textTransform:'uppercase',color:'rgba(255,255,255,0.5)',marginBottom:4}}>
                🎁 Danas osvoji
              </div>
              <div style={{fontFamily:'Oswald,sans-serif',fontWeight:800,fontSize:34,color:'#f5c518',lineHeight:1.1}}>
                {amt} € BESPLATNIH OKLADA
              </div>
              <div style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:500,fontSize:12,
                letterSpacing:1,textTransform:'uppercase',color:'rgba(255,255,255,0.4)',marginTop:4}}>
                Odigraj listić i preuzmi nagradu!
              </div>
            </div>
          </div>

          {/* Promo card */}
          <div style={{background:'#111f3a',border:'1px solid #1c3a65',borderRadius:14,padding:'24px 24px 20px',marginBottom:20}}>
            <p style={{fontFamily:'Barlow,sans-serif',fontSize:15,color:'#fff',lineHeight:1.7,marginBottom:16}}>
              <span style={{fontSize:20}}>🎁</span>{' '}
              Odigraj sportski listić za minimalno <strong style={{color:'#f5c518'}}>5 €</strong> s minimalno <strong style={{color:'#f5c518'}}>5 parova</strong> u razdoblju od <strong style={{color:'#f5c518'}}>{dateFrom}</strong> do <strong style={{color:'#f5c518'}}>{dateTo}</strong> i osvoji besplatne oklade u iznosu od <strong style={{color:'#f5c518'}}>{amt} €</strong>.
            </p>
            <div style={{fontFamily:'Barlow,sans-serif',fontSize:14,color:'rgba(255,255,255,0.85)',
              lineHeight:1.7,padding:'14px 18px',background:'rgba(245,197,24,0.06)',
              borderLeft:'3px solid #f5c518',borderRadius:'0 10px 10px 0'}}>
              <span style={{fontSize:18}}>🏆</span>{' '}
              Uzmi besplatne oklade iz <strong style={{color:'#f5c518'}}>Put do Finala</strong> svaki dan, a na kraju promocije igrači koji su sudjelovali barem <strong style={{color:'#f5c518'}}>38 od 39 dana</strong> osvajaju dodatnih <strong style={{color:'#f5c518'}}>39 € besplatnih oklada</strong>!
            </div>
          </div>

          {/* Rules */}
          <div style={{background:'#111f3a',border:'1px solid #1c3a65',borderRadius:14,padding:'24px 24px 20px'}}>
            <div style={{fontFamily:'Oswald,sans-serif',fontWeight:700,fontSize:18,color:'#fff',marginBottom:14}}>
              Pravila promocije:
            </div>
            <ul style={{listStyle:'none',padding:0,margin:0}}>
              {(data.rules || defaultRules).map((r,i) => (
                <li key={i} style={{fontFamily:'Barlow,sans-serif',fontSize:13,color:'rgba(255,255,255,0.7)',
                  lineHeight:1.8,padding:'8px 0 8px 18px',position:'relative',
                  borderBottom:i<(data.rules||defaultRules).length-1?'1px solid rgba(255,255,255,0.05)':'none'}}>
                  <span style={{position:'absolute',left:0,color:'#f5c518',fontWeight:700}}>•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Grid View ──
  const cardSize = 'min(calc((100% - ' + (cols-1)*10 + 'px) / ' + cols + '), 140px)';

  return (
    <div style={{background:'#080e1e',padding:'0 0 8px'}}>
      {/* Title */}
      <div style={{textAlign:'center',padding:'20px 16px 14px'}}>
        <h2 style={{fontFamily:'Oswald,sans-serif',fontWeight:700,fontSize:'clamp(18px,4vw,28px)',
          textTransform:'uppercase',letterSpacing:3,marginBottom:6,
          background:'linear-gradient(135deg,#f5c518,#ffd700,#fff5a0,#f5c518)',
          backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
          animation:'shimmer 3s linear infinite'}}>
          🏆 PUT DO FINALA 🏆
        </h2>
        <p style={{fontFamily:'Barlow Condensed,sans-serif',fontSize:13,
          color:'rgba(255,255,255,0.5)',letterSpacing:2}}>
          Klikni na aktivan dan i otkrij dnevnu promociju · 11.06. — 19.07.2026.
        </p>
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="cal-scroll" style={{
        position:'relative',
        maxHeight: cols===7
          ? 'calc((min(100vw - 32px, 900px) - ' + (cols-1)*10 + 'px) / ' + cols + ' * 3 + 20px)'
          : 'calc((min(100vw - 32px, 900px) - ' + (cols-1)*10 + 'px) / ' + cols + ' * 3 + 20px)',
        overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch',
        borderRadius:10,margin:'0 12px 12px',
        scrollbarWidth:'thin',scrollbarColor:'rgba(255,255,255,.15) transparent'
      }}>
        <div className="cal-inner-grid" style={{
          display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,
          gap:10,padding:'4px 0 4px'
        }}>
          {/* Days 1-38 */}
          {Array.from({length:38},(_,i) => {
            const n = i+1;
            const d = dayDate(startDate, n);
            const ph = phases[i];
            const state = n===activeDayNum ? 'active' : n<activeDayNum ? 'open' : 'locked';
            const amt = promoAmounts[i] || '2€';

            return (
              <div key={n} className={`day-card ${state}`}
                onClick={()=>{ if(state!=='locked') setDayView({num:n,date:d,phase:ph,amount:amt}); }}
                style={{
                  position:'relative',aspectRatio:'1',
                  background: state==='active'
                    ? 'linear-gradient(145deg,#0f2952,#080e1e)'
                    : state==='open' ? '#111f3a' : 'rgba(8,14,30,0.9)',
                  border: state==='active' ? '2px solid #f5c518'
                    : state==='open' ? '1px solid #1c3a65'
                    : '1px solid rgba(28,58,101,0.15)',
                  borderRadius:10,display:'flex',flexDirection:'column',
                  alignItems:'center',justifyContent:'center',
                  cursor:state!=='locked'?'pointer':'default',overflow:'hidden',
                  transition:'all .3s ease',
                  animation:`cardIn 0.4s ease ${i*.025}s both`,
                  boxShadow: state==='active' ? '0 0 22px rgba(245,197,24,.2),0 0 44px rgba(245,197,24,.08)' : 'none',
                  animationName: state==='active' ? 'cardIn, activeGlow' : 'cardIn',
                  ...(state==='active' ? {animationDuration:'0.4s, 2.5s', animationIterationCount:'1, infinite', animationTimingFunction:'ease, ease-in-out'} : {})
                }}
              >
                {/* DANAS badge */}
                {state==='active' && (
                  <div style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',
                    background:'#f5c518',color:'#080e1e',fontFamily:'Barlow Condensed,sans-serif',
                    fontWeight:700,fontSize:7,letterSpacing:1,textTransform:'uppercase',
                    padding:'1px 6px',borderRadius:'0 0 4px 4px',zIndex:4}}>DANAS</div>
                )}
                {/* Dan number */}
                <span style={{position:'absolute',top:7,left:0,right:0,textAlign:'center',
                  fontFamily:'Barlow Condensed,sans-serif',fontWeight:700,
                  fontSize:'clamp(11px,1.8vw,16px)',letterSpacing:2,textTransform:'uppercase',
                  color: state==='active' ? '#f5c518' : '#fff'}}>
                  Dan {n}
                </span>
                {/* Content */}
                {state==='locked'
                  ? <span style={{fontSize:'clamp(16px,3vw,26px)',opacity:0.35}}>🔒</span>
                  : <span style={{fontFamily:'Oswald,sans-serif',fontWeight:700,
                      fontSize:'clamp(13px,2vw,22px)',color:'#fff',
                      textAlign:'center',lineHeight:1.05,textTransform:'uppercase',
                      letterSpacing:0.5,textShadow:'0 2px 8px rgba(0,0,0,0.5)'}}>
                      {amt}
                    </span>
                }
                {/* Date */}
                <span style={{position:'absolute',bottom:5,left:0,right:0,textAlign:'center',
                  fontFamily:'Barlow Condensed,sans-serif',fontWeight:700,
                  fontSize:'clamp(11px,1.6vw,15px)',
                  color: state==='active' ? 'rgba(245,197,24,0.6)' : state==='open' ? '#fff' : 'rgba(255,255,255,0.55)'}}>
                  {d.getDate()}. {MONTH_SHORT[d.getMonth()]}
                </span>
              </div>
            );
          })}

          {/* Finale card — spans remaining cols */}
          <div style={{
            gridColumn: `span ${cols===7 ? 4 : cols===4 ? 2 : 3}`,
            position:'relative',
            background:'linear-gradient(135deg,#0d1a33 0%,#0f2952 50%,#0d1a33 100%)',
            border: activeDayNum>=39 ? '2px solid #f5c518' : '2px solid #1c3a65',
            borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',
            gap:10,padding:'10px 16px',
            cursor: activeDayNum>=39 ? 'pointer' : 'default',
            opacity: activeDayNum<39 ? 0.7 : 1,
            animation:'cardIn 0.4s ease 1.0s both',
            boxShadow: activeDayNum>=39 ? '0 0 30px rgba(245,197,24,.15)' : 'none'
          }}>
            <span style={{fontSize:'clamp(24px,4vw,36px)',zIndex:1}}>🏟️</span>
            <div style={{zIndex:1,overflow:'hidden'}}>
              <div style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:700,
                fontSize:'clamp(10px,1.5vw,14px)',letterSpacing:2,textTransform:'uppercase',
                color:'#fff',whiteSpace:'nowrap'}}>
                Dan {finaleInfo.day} · {finaleInfo.date}
              </div>
              <div style={{fontFamily:'Oswald,sans-serif',fontWeight:800,
                fontSize:'clamp(18px,3.5vw,30px)',
                color: activeDayNum>=39 ? '#f5c518' : 'rgba(245,197,24,0.5)',
                textTransform:'uppercase',letterSpacing:2,lineHeight:1}}>
                {finaleInfo.title}
              </div>
              <div style={{fontFamily:'Barlow Condensed,sans-serif',
                fontSize:'clamp(10px,1.3vw,13px)',color:'rgba(255,255,255,0.8)',
                letterSpacing:0.5,marginTop:3,whiteSpace:'pre-line',lineHeight:1.3}}>
                {finaleInfo.venue}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary rules */}
      {data.showSummaryRules && (
        <div style={{margin:'0 12px',background:'#111f3a',border:'1px solid #1c3a65',
          borderRadius:14,padding:'18px 20px'}}>
          <p style={{fontFamily:'Oswald,sans-serif',fontWeight:700,fontSize:16,
            textAlign:'center',color:'#fff',marginBottom:10,fontStyle:'italic'}}>
            Pravila promocije "Put do Finala — SP 2026"
          </p>
          <p style={{fontFamily:'Barlow,sans-serif',fontSize:13,
            color:'rgba(255,255,255,0.7)',lineHeight:1.8,textAlign:'center'}}>
            Promocija <strong style={{color:'#f5c518'}}>Put do Finala</strong> uključuje 39 dnevnih promocija od <strong style={{color:'#f5c518'}}>11.06.2026.</strong> do <strong style={{color:'#f5c518'}}>19.07.2026.</strong><br/>
            Svaki dan se otvara jedno polje kalendara s nazivom i detaljima promocije.<br/>
            Osvoji besplatne oklade svih 39 dana, a na kraju promocije,<br/>
            igrači koji su sudjelovali barem <strong style={{color:'#f5c518'}}>38 od 39 dana</strong> osvajaju dodatnih <strong style={{color:'#f5c518'}}>39 € besplatnih oklada</strong>!
          </p>
        </div>
      )}
    </div>
  );
}

const defaultRules = [
  "U promociji sudjeluju samo listići uplaćeni putem online računa igrača.",
  "Besplatne oklade je moguće osvojiti samo jednom u danu i dodjeljuju se samo za prvi odigrani listić od 5 € ili više. Sistemski i multi tip listići ne ulaze u promociju.",
  "Besplatne oklade se dodjeljuju igraču automatski odmah nakon prvog uplaćenog listića koji zadovoljava uvjete promocije. Listići uplaćeni besplatnim okladama ne ulaze u promociju.",
  "S dodijeljenim besplatnim okladama moguće je igrati sportske listiće s minimalno 3 para s minimalnim tečajem 1,40 po paru te se može uplatiti odjednom ili rasporediti na više listića.",
  "Sistemske i multi tip listiće nije moguće igrati s besplatnim okladama.",
  "Moguće je klađenje na prematch, live događaje i kombinaciju prematch i live događaja.",
  "Vrijeme odigravanja besplatnih oklada je 7 dana od dana dodjeljivanja.",
  "Igračima koji su sudjelovali u barem 38 od 39 dana promocije, dodatne besplatne oklade od 39 € bit će dodijeljene u nedjelju 20.07.2026. do 12:00h.",
  "Priređivač zadržava pravo ograničiti sudjelovanje u slučaju prijevremene isplate (Cash Out) listića uključenih u promociju.",
];

// ═══════════════════════════════════════
// CALENDAR EDITOR — PropEdit za calendar blok
// ═══════════════════════════════════════
function CalendarPropEdit({ block, onChange }) {
  const d = block.data || {};
  const set = (k, v) => onChange({ ...block, data: { ...d, [k]: v } });
  const [tab, setTab] = useState("general"); // general | days | finale | rules
  const amounts = d.promoAmounts || Array(38).fill("2€");

  const ist = { width:"100%",background:"rgba(0,0,0,.3)",border:"1px solid rgba(255,255,255,.05)",
    borderRadius:8,padding:"7px 10px",color:"#edf0f7",fontSize:13,fontFamily:"inherit",outline:"none" };
  const lst = { display:"block",fontSize:10,fontWeight:700,color:"#4a5670",
    marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em" };
  const tabStyle = (t) => ({
    flex:1,padding:"7px 4px",borderRadius:6,fontSize:10,fontWeight:700,cursor:"pointer",
    border:"1px solid " + (tab===t ? "#f5c518" : "rgba(255,255,255,.05)"),
    background: tab===t ? "rgba(245,197,24,.08)" : "transparent",
    color: tab===t ? "#f5c518" : "#8d99b0",fontFamily:"inherit"
  });

  return (
    <div>
      {/* Tabs */}
      <div style={{display:"flex",gap:3,marginBottom:12}}>
        {[{k:"general",l:"📅 Opće"},{k:"days",l:"🎁 Dani"},{k:"finale",l:"🏟 Finale"},{k:"rules",l:"📜 Pravila"}].map(x=>(
          <button key={x.k} onClick={()=>setTab(x.k)} style={tabStyle(x.k)}>{x.l}</button>
        ))}
      </div>

      {tab==="general" && (
        <div>
          <div style={{marginBottom:10}}>
            <label style={lst}>Datum početka</label>
            <input type="date" value={d.startDate||"2026-06-11"} onChange={e=>set("startDate",e.target.value)} style={ist} />
          </div>
          <div style={{marginBottom:10}}>
            <label style={lst}>Broj kolona grida (7=desktop, 4=mobile)</label>
            <div style={{display:"flex",gap:4}}>
              {[4,7].map(c=>(
                <button key={c} onClick={()=>set("cols",c)} style={{
                  flex:1,padding:"8px",borderRadius:6,cursor:"pointer",fontFamily:"inherit",
                  border:"1px solid "+((d.cols||7)===c?"#f5c518":"rgba(255,255,255,.05)"),
                  background:(d.cols||7)===c?"rgba(245,197,24,.08)":"transparent",
                  color:(d.cols||7)===c?"#f5c518":"#8d99b0",fontSize:12,fontWeight:700
                }}>{c} kolone</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <label style={lst}>Preview dan (koji dan se prikazuje aktivan u editoru)</label>
            <input type="number" min={1} max={39} value={d.previewDay||1}
              onChange={e=>set("previewDay",parseInt(e.target.value)||1)} style={ist} />
          </div>
          <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            <input type="checkbox" id="showRules" checked={!!d.showSummaryRules}
              onChange={e=>set("showSummaryRules",e.target.checked)}
              style={{width:16,height:16,accentColor:"#f5c518"}} />
            <label htmlFor="showRules" style={{...lst,marginBottom:0,textTransform:"none",fontSize:12,color:"#edf0f7"}}>
              Prikaži sažetak pravila ispod kalendara
            </label>
          </div>
        </div>
      )}

      {tab==="days" && (
        <div>
          <div style={{fontSize:11,color:"#8d99b0",marginBottom:10,lineHeight:1.5}}>
            Unesi nagradu za svaki od 38 dana (npr. "2€", "5€", "3€").
            Dan 39 = Finale (posebna kartica).
          </div>
          {/* Quick fill */}
          <div style={{display:"flex",gap:4,marginBottom:10}}>
            <button onClick={()=>set("promoAmounts",Array(38).fill("2€"))} style={{flex:1,padding:"6px",borderRadius:6,
              border:"1px dashed rgba(245,197,24,.2)",background:"rgba(245,197,24,.03)",color:"#f5c518",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
              Sve 2€
            </button>
            <button onClick={()=>{
              const v=["2€","3€","4€","5€","3€","2€","3€","2€","5€","4€","4€","3€","2€","5€","5€","4€","3€","2€","2€","5€","3€","4€","3€","2€","5€","4€","3€","4€","2€","5€","3€","3€","4€","2€","2€","5€","3€","4€"];
              set("promoAmounts",v);
            }} style={{flex:1,padding:"6px",borderRadius:6,
              border:"1px dashed rgba(74,158,255,.2)",background:"rgba(74,158,255,.03)",color:"#4a9eff",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
              Originalne vrijednosti
            </button>
          </div>
          <div style={{maxHeight:300,overflowY:"auto",paddingRight:4}}>
            {amounts.map((amt,i)=>{
              const d2=dayDate(d.startDate?new Date(d.startDate):new Date(2026,5,11),i+1);
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <span style={{fontSize:11,color:"#4a5670",width:28,flexShrink:0,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                    D{i+1}
                  </span>
                  <span style={{fontSize:11,color:"#8d99b0",width:40,flexShrink:0}}>
                    {d2.getDate()}.{d2.getMonth()+1}.
                  </span>
                  <input value={amt} onChange={e=>{
                    const n=[...amounts]; n[i]=e.target.value; set("promoAmounts",n);
                  }} style={{...ist,flex:1,fontSize:12,padding:"5px 8px"}} placeholder="2€" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="finale" && (
        <div>
          <div style={{marginBottom:10}}>
            <label style={lst}>Dan broj</label>
            <input value={(d.finaleInfo||{}).day||"39"} onChange={e=>set("finaleInfo",{...(d.finaleInfo||{}),day:e.target.value})} style={ist} />
          </div>
          <div style={{marginBottom:10}}>
            <label style={lst}>Datum</label>
            <input value={(d.finaleInfo||{}).date||"19. srpnja"} onChange={e=>set("finaleInfo",{...(d.finaleInfo||{}),date:e.target.value})} style={ist} />
          </div>
          <div style={{marginBottom:10}}>
            <label style={lst}>Naslov (npr. "FINALE")</label>
            <input value={(d.finaleInfo||{}).title||"FINALE"} onChange={e=>set("finaleInfo",{...(d.finaleInfo||{}),title:e.target.value})} style={ist} />
          </div>
          <div style={{marginBottom:10}}>
            <label style={lst}>Lokacija (naziv stadiona, grad)</label>
            <textarea value={(d.finaleInfo||{}).venue||"MetLife Stadium\nNew York / New Jersey"} rows={3}
              onChange={e=>set("finaleInfo",{...(d.finaleInfo||{}),venue:e.target.value})} style={{...ist,resize:"vertical"}} />
          </div>
        </div>
      )}

      {tab==="rules" && (
        <div>
          <div style={{fontSize:11,color:"#8d99b0",marginBottom:8,lineHeight:1.5}}>
            Pravila koja se prikazuju na stranici detalja dana.
          </div>
          {(d.rules||defaultRules).map((r,i)=>(
            <div key={i} style={{display:"flex",gap:4,marginBottom:4}}>
              <textarea value={r} rows={2} onChange={e=>{
                const n=[...(d.rules||defaultRules)]; n[i]=e.target.value; set("rules",n);
              }} style={{...ist,resize:"vertical",flex:1,fontSize:12}} />
              <button onClick={()=>{
                const n=[...(d.rules||defaultRules)]; n.splice(i,1); set("rules",n);
              }} style={{background:"transparent",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",
                borderRadius:6,padding:"0 8px",cursor:"pointer",fontSize:12,alignSelf:"flex-start",paddingTop:6,paddingBottom:6}}>✕</button>
            </div>
          ))}
          <button onClick={()=>set("rules",[...(d.rules||defaultRules),"Novo pravilo"])}
            style={{width:"100%",marginTop:4,padding:7,borderRadius:6,border:"1px dashed rgba(245,197,24,.2)",
              background:"rgba(245,197,24,.03)",color:"#f5c518",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
            + Dodaj pravilo
          </button>
          <button onClick={()=>set("rules",[...defaultRules])}
            style={{width:"100%",marginTop:4,padding:7,borderRadius:6,border:"1px dashed rgba(74,158,255,.2)",
              background:"rgba(74,158,255,.03)",color:"#4a9eff",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
            ↺ Resetiraj na originalna pravila
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OSTATAK CMS-a (kopiran i proširen iz page.js)
// ═══════════════════════════════════════════════════════

const TEMPLATES = [
  { id:"bonus", name:"Bonus Landing", icon:"🎁", desc:"Bonus s iznosom i uvjetima", color:"#22c55e",
    blocks:[{type:"hero",data:{title:"NAZIV BONUSA",subtitle:"Podnaslov"}},{type:"amount",data:{amount:"100",suffix:" €",label:"Bonus",desc:"Opis"}},{type:"cta",data:{text:"PREUZMI BONUS"}},{type:"rules",data:{text:"Uvjeti promocije..."}}] },
  { id:"sport", name:"Sportski Event", icon:"⚽", desc:"Promocija za sportske događaje", color:"#4a9eff",
    blocks:[{type:"hero",data:{title:"SPORTSKA PROMOCIJA",subtitle:"Opis eventa"}},{type:"steps",data:{items:[{icon:"⚽",title:"KORAK 1",text:"Opis"},{icon:"🎁",title:"KORAK 2",text:"Opis"}]}},{type:"table",data:{headers:["Uvjet","Nagrada"],rows:[["Uvjet 1","Nagrada 1"]]}},{type:"cta",data:{text:"KLADI SE"}}] },
  { id:"casino", name:"Casino Promo", icon:"🎰", desc:"Casino bonus ili turnir", color:"#a855f7",
    blocks:[{type:"hero",data:{title:"CASINO PROMOCIJA",subtitle:"Opis"}},{type:"amount",data:{amount:"500",suffix:" €",label:"Nagradni fond",desc:"Za top igrače"}},{type:"countdown",data:{label:"Do kraja promocije"}},{type:"cta",data:{text:"IGRAJ SADA"}}] },
  { id:"calendar", name:"Advent Kalendar", icon:"📅", desc:"Put do Finala / daily promo calendar", color:"#f5c518",
    blocks:[{type:"calendar",data:{
      startDate:"2026-06-11",cols:7,previewDay:1,showSummaryRules:true,
      promoAmounts:["2€","3€","4€","5€","3€","2€","3€","2€","5€","4€","4€","3€","2€","5€","5€","4€","3€","2€","2€","5€","3€","4€","3€","2€","5€","4€","3€","4€","2€","5€","3€","3€","4€","2€","2€","5€","3€","4€"],
      finaleInfo:{day:"39",date:"19. srpnja",title:"FINALE",venue:"MetLife Stadium\nNew York / New Jersey"},
      rules:defaultRules
    }}] },
  { id:"info", name:"Info stranica", icon:"📄", desc:"Pravila, uvjeti, FAQ", color:"#6b7280",
    blocks:[{type:"hero",data:{title:"NASLOV",subtitle:""}},{type:"text",data:{text:"Sadržaj..."}},{type:"checks",data:{items:["Stavka 1","Stavka 2"]}}] },
  { id:"empty", name:"Prazna stranica", icon:"📝", desc:"Kreni od nule", color:"#475569", blocks:[] },
];

const BT = [
  { type:"hero",    label:"Hero Banner",    icon:"🖼️", color:"#f59e0b" },
  { type:"text",    label:"Tekst",          icon:"📝", color:"#3b82f6" },
  { type:"amount",  label:"Promo iznos",    icon:"💰", color:"#22c55e" },
  { type:"cta",     label:"Gumb (CTA)",     icon:"🔘", color:"#4a9eff" },
  { type:"checks",  label:"Checklist",      icon:"✅", color:"#10b981" },
  { type:"steps",   label:"Koraci",         icon:"👣", color:"#f97316" },
  { type:"table",   label:"Tablica",        icon:"📊", color:"#8b5cf6" },
  { type:"countdown",label:"Odbrojavanje",  icon:"⏰", color:"#ef4444" },
  { type:"rules",   label:"Pravila",        icon:"📜", color:"#6b7280" },
  { type:"divider", label:"Razdjelnik",     icon:"➖", color:"#475569" },
  { type:"calendar",label:"Advent Kalendar",icon:"📅", color:"#f5c518" },
];

const EMOJIS = ["🎰","🎁","⚽","🎯","⭐","🏆","💰","👑","⚡","🔄","🎲","📅","🏅","💎","🔥","🏟️"];
const GRADS  = ["linear-gradient(135deg,#0a3520,#1a5a35)","linear-gradient(135deg,#0d1540,#1a2b6e)","linear-gradient(135deg,#1a0a30,#2d1b69)","linear-gradient(135deg,#3a2a00,#5a4a10)","linear-gradient(135deg,#0a1a3a,#1a3a6a)","linear-gradient(135deg,#2a1a00,#5a3a10)","linear-gradient(135deg,#0a2a2a,#1a4a4a)","linear-gradient(135deg,#2a0a2a,#4a1a4a)"];

const initPages=[
  {id:"p1",title:"Uvjeti Free Bonusi",slug:"uvjeti-free-bonusi",content:"Promocija vrijedi za nove igrače."},
  {id:"p2",title:"Opća pravila",slug:"opca-pravila",content:"Admiral Bet zadržava pravo izmjene uvjeta."},
];
const initPromos=[
  {id:1,t:"PUT DO FINALA – SP 2026",s:"put-do-finala",c:"kladenje",status:"published",badge:"LIVE",grad:"linear-gradient(135deg,#0d1a33,#1a3d6e)",emoji:"🏆",d:"Svaki dan otvori novo polje i osvoji besplatne oklade! 39 dana, 39 nagrada!",cta:"Više",
    blocks:[
      {id:"b-pdf-hero",type:"hero",data:{title:"PUT DO FINALA",subtitle:"Svjetsko Prvenstvo 2026 · 11.06. – 19.07."}},
      {id:"b-pdf-cal",type:"calendar",data:{
        startDate:"2026-06-11",cols:7,previewDay:1,showSummaryRules:true,
        promoAmounts:["2€","3€","4€","5€","3€","2€","3€","2€","5€","4€","4€","3€","2€","5€","5€","4€","3€","2€","2€","5€","3€","4€","3€","2€","5€","4€","3€","4€","2€","5€","3€","3€","4€","2€","2€","5€","3€","4€"],
        finaleInfo:{day:"39",date:"19. srpnja",title:"FINALE",venue:"MetLife Stadium\nNew York / New Jersey"},
        rules:defaultRules
      }},
    ]
  },
  {id:2,t:"FREE BONUSI",s:"free-bonusi",c:"casino",status:"published",badge:"HOT",grad:GRADS[0],emoji:"🎰",d:"100 besplatnih vrtnji + 10 € bonusa BEZ UPLATE!",cta:"Više",
    blocks:[{id:"b1",type:"hero",data:{title:"FREE BONUSI",subtitle:"samo za tebe"}},{id:"b2",type:"amount",data:{amount:"1000",label:"Bonus dobrodošlice",desc:"100% na prvu uplatu",suffix:" €"}},{id:"b3",type:"checks",data:{items:["100 besplatnih vrtnji","10 € bonusa","10 € besplatnih oklada"]}},{id:"b4",type:"cta",data:{text:"REGISTRIRAJ SE",detailsMode:"page",detailsPageId:"p1"}}]},
  {id:3,t:"TJEDNA MISIJA",s:"tjedna-misija",c:"kladenje",status:"published",grad:GRADS[3],emoji:"🎯",d:"Min. 4 para dnevno — osvoji oklade!",cta:"Više",
    blocks:[{id:"b12",type:"steps",data:{items:[{icon:"⚽",title:"KLADI SE",text:"Min. 4 para, tečaj 1.40, uplata 5 €"},{icon:"🎁",title:"OSVOJI",text:"Besplatne oklade ponedjeljak!"}]}},{id:"b13",type:"table",data:{headers:["BROJ DANA","NAGRADA"],rows:[["3-4","5 €"],["5-6","10 €"],["7","15 €"]]}},{id:"b14",type:"cta",data:{text:"KLADI SE SADA",detailsMode:"page",detailsPageId:"p2"}}]},
];

// ── helpers ──
const ist={width:"100%",background:"rgba(0,0,0,.3)",border:"1px solid rgba(255,255,255,.05)",borderRadius:8,padding:"8px 10px",color:"#edf0f7",fontSize:14,fontFamily:"inherit",outline:"none"};
const lst={display:"block",fontSize:10,fontWeight:700,color:"#4a5670",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"};
const abtn={padding:"8px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,.05)",background:"transparent",color:"#8d99b0",fontSize:12,cursor:"pointer",fontWeight:600,fontFamily:"inherit",flex:1,textAlign:"center"};
const toSlug=(s)=>s.toLowerCase().replace(/[čć]/g,"c").replace(/[šs]/g,"s").replace(/[žz]/g,"z").replace(/đ/g,"d").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

// ── Scroll Reveal ──
function Rv({children,delay=0}){
  const ref=useRef(null);const[v,setV]=useState(false);
  useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true)},{threshold:0.1});if(ref.current)o.observe(ref.current);return()=>o.disconnect();},[]);
  return <div ref={ref} style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",transition:"opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1)",transitionDelay:delay+"s"}}>{children}</div>;
}

// ── Animated Counter ──
function AC({v,suffix}){
  const[c,setC]=useState(0);const num=parseInt(String(v).replace(/[^0-9]/g,""))||0;
  const ref=useRef(null);const[vis,setVis]=useState(false);
  useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setVis(true)},{threshold:0.3});if(ref.current)o.observe(ref.current);return()=>o.disconnect();},[]);
  useEffect(()=>{if(!vis)return;let s=0;const step=num/100;const t=setInterval(()=>{s+=step;if(s>=num){setC(num);clearInterval(t);}else{setC(Math.floor(s));}},16);return()=>clearInterval(t);},[vis,num]);
  return <span ref={ref}>{c.toLocaleString()}{suffix||""}</span>;
}

// ── Countdown ──
function CD({label}){
  const[t,setT]=useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{const tgt=Date.now()+259200000+50400000;const tick=()=>{const df=Math.max(0,tgt-Date.now());setT({d:Math.floor(df/86400000),h:Math.floor((df%86400000)/3600000),m:Math.floor((df%3600000)/60000),s:Math.floor((df%60000)/1000)});};tick();const id=setInterval(tick,1000);return()=>clearInterval(id);},[]);
  return(
    <div style={{padding:"24px 18px",textAlign:"center"}}>
      {label&&<div style={{fontSize:10,color:"#8d99b0",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:700}}>{label}</div>}
      <div style={{display:"flex",justifyContent:"center",gap:8}}>
        {[{v:t.d,l:"DANA"},{v:t.h,l:"SATI"},{v:t.m,l:"MIN"},{v:t.s,l:"SEK"}].map((x,i)=>(
          <div key={i} style={{background:"linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.2))",borderRadius:12,padding:"14px 16px",minWidth:58,border:"1px solid rgba(245,197,24,.08)"}}>
            <div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:28,fontWeight:800,color:"#f5c518",lineHeight:1}}>{String(x.v).padStart(2,"0")}</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,.3)",marginTop:6,letterSpacing:"0.12em",fontWeight:700}}>{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Block Renderer ──
function RB({block,inEditor}){
  const d=block.data||{};
  const[showDetails,setShowDetails]=useState(false);

  if(block.type==="calendar") return <CalendarBlock data={d} inEditor={inEditor} />;

  if(block.type==="hero") return(
    <div style={{position:"relative",overflow:"hidden",minHeight:d.imageUrl?200:140}}>
      {d.imageUrl&&<img src={d.imageUrl} alt="" style={{width:"100%",height:200,objectFit:"cover",display:"block"}}/>}
      <div style={{background:d.imageUrl?"linear-gradient(to top,rgba(6,9,26,.95) 10%,rgba(6,9,26,.4) 60%,transparent)":"linear-gradient(135deg,rgba(245,197,24,.04),rgba(74,158,255,.04))",padding:d.imageUrl?"40px 20px 24px":"44px 20px",textAlign:"center",position:d.imageUrl?"absolute":"relative",bottom:0,left:0,right:0}}>
        <div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:26,fontWeight:900,letterSpacing:"0.01em",textShadow:"0 2px 20px rgba(0,0,0,.5)",lineHeight:1.2}}>{d.title||"Naslov"}</div>
        {d.subtitle&&<div style={{fontSize:14,color:"rgba(255,255,255,.5)",marginTop:8,fontWeight:500}}>{d.subtitle}</div>}
        <div style={{width:40,height:3,borderRadius:2,background:"linear-gradient(90deg,#f5c518,rgba(245,197,24,.2))",margin:"14px auto 0"}}/>
      </div>
    </div>
  );

  if(block.type==="text") return <div style={{padding:"18px 20px",fontSize:14,color:"rgba(255,255,255,.65)",lineHeight:1.8}}>{d.text||"Tekst..."}</div>;

  if(block.type==="amount") return(
    <div style={{textAlign:"center",padding:"32px 20px",borderRadius:20,background:"linear-gradient(160deg,rgba(245,197,24,.08),rgba(245,197,24,.02),rgba(74,158,255,.03))",border:"1px solid rgba(245,197,24,.1)",margin:"14px 18px",position:"relative",overflow:"hidden"}}>
      <div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:48,fontWeight:800,color:"#f5c518",lineHeight:1,letterSpacing:"-0.02em"}}><AC v={d.amount||"100"} suffix={d.suffix||""}/></div>
      <div style={{fontSize:16,fontWeight:700,marginTop:10}}>{d.label||""}</div>
      <div style={{fontSize:12,color:"#8d99b0",marginTop:4}}>{d.desc||""}</div>
    </div>
  );

  if(block.type==="cta"){
    const linkedPage=(block.data?.detailsPageId&&block._pages)?block._pages.find(pg=>pg.id===block.data.detailsPageId):null;
    const hasDetails=d.detailsText||d.detailsUrl||linkedPage;
    return(
      <div style={{padding:"20px 18px",textAlign:"center"}}>
        <button style={{background:"linear-gradient(135deg,#4a9eff,#2d7ad6)",color:"#fff",border:"none",padding:"16px 40px",borderRadius:12,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit",width:"100%",maxWidth:360,letterSpacing:"0.04em",boxShadow:"0 6px 24px rgba(74,158,255,.3)",textTransform:"uppercase"}}>{d.text||"KLIKNI"}</button>
        <div onClick={e=>{e.stopPropagation();if(hasDetails)setShowDetails(!showDetails);}} style={{fontSize:11,color:hasDetails?"#4a9eff":"#4a5670",marginTop:12,textDecoration:"underline",textUnderlineOffset:3,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}}>
          Više detalja i uvjeti promocije {hasDetails&&<span style={{fontSize:8,transition:"transform .2s",transform:showDetails?"rotate(180deg)":"none"}}>▼</span>}
        </div>
        {showDetails&&(d.detailsText||linkedPage)&&(
          <div style={{marginTop:12,padding:"18px",borderRadius:14,background:"linear-gradient(135deg,rgba(255,255,255,.03),rgba(0,0,0,.1))",border:"1px solid rgba(255,255,255,.05)",textAlign:"left",animation:"fadeIn .3s"}}>
            {linkedPage&&<div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:15,fontWeight:700,marginBottom:10,color:"#f5c518"}}>{linkedPage.title}</div>}
            <div style={{fontSize:13,color:"rgba(255,255,255,.55)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{linkedPage?linkedPage.content:d.detailsText}</div>
          </div>
        )}
      </div>
    );
  }

  if(block.type==="checks") return(
    <div style={{padding:"14px 20px"}}>
      {(d.items||[]).map((x,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,padding:"10px 14px",background:"rgba(34,197,94,.04)",borderRadius:10,border:"1px solid rgba(34,197,94,.08)"}}>
          <div style={{width:28,height:28,borderRadius:8,background:"rgba(34,197,94,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>✓</div>
          <span style={{fontSize:14,lineHeight:1.5,color:"rgba(255,255,255,.85)"}}>{x}</span>
        </div>
      ))}
    </div>
  );

  if(block.type==="steps") return(
    <div style={{padding:"14px 18px"}}>
      {(d.items||[]).map((s,i)=>(
        <div key={i} style={{display:"flex",gap:14,padding:"16px",marginBottom:8,background:"linear-gradient(135deg,rgba(245,197,24,.03),rgba(0,0,0,.1))",borderRadius:14,border:"1px solid rgba(245,197,24,.08)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:"linear-gradient(to bottom,#f5c518,rgba(245,197,24,.1))",borderRadius:"0 2px 2px 0"}}/>
          <div style={{width:48,height:48,borderRadius:14,flexShrink:0,background:"linear-gradient(135deg,rgba(245,197,24,.1),rgba(245,197,24,.04))",border:"1px solid rgba(245,197,24,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{s.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:15,fontWeight:700,color:"#f5c518",marginBottom:4}}>{s.title}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.6)",lineHeight:1.65}}>{s.text}</div>
          </div>
          <div style={{position:"absolute",top:8,right:10,fontSize:10,color:"rgba(245,197,24,.25)",fontFamily:"Barlow Condensed,sans-serif",fontWeight:800}}>{String(i+1).padStart(2,"0")}</div>
        </div>
      ))}
    </div>
  );

  if(block.type==="table") return(
    <div style={{padding:"12px 18px"}}>
      <div style={{borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,.06)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{(d.headers||[]).map((h,i)=><th key={i} style={{padding:"14px 16px",textAlign:"center",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:12,letterSpacing:"0.04em",textTransform:"uppercase",background:"linear-gradient(180deg,rgba(245,197,24,.08),rgba(245,197,24,.03))",color:"#f5c518",borderBottom:"2px solid rgba(245,197,24,.12)"}}>{h}</th>)}</tr></thead>
          <tbody>{(d.rows||[]).map((r,ri)=><tr key={ri} style={{background:ri%2===0?"rgba(0,0,0,.08)":"transparent"}}>{r.map((c,ci)=><td key={ci} style={{padding:"13px 16px",textAlign:"center",borderTop:"1px solid rgba(255,255,255,.03)",fontSize:ci===r.length-1?16:14,color:ci===r.length-1?"#f5c518":"rgba(255,255,255,.75)",fontWeight:ci===r.length-1?800:500}}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );

  if(block.type==="countdown") return <CD label={d.label}/>;

  if(block.type==="rules") return(
    <div style={{padding:"14px 18px",margin:"8px 18px",borderRadius:12,background:"linear-gradient(135deg,rgba(255,255,255,.02),rgba(0,0,0,.08))",border:"1px solid rgba(255,255,255,.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{fontSize:14}}>📜</span>
        <span style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:13,fontWeight:700,color:"rgba(255,255,255,.5)"}}>PRAVILA PROMOCIJE</span>
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.8}}>{d.text||"..."}</div>
    </div>
  );

  if(block.type==="divider") return <div style={{padding:"8px 24px"}}><div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(245,197,24,.15),transparent)"}}/></div>;

  return null;
}

// ── Field ──
function Field({l,k,multi,ph,value,onFieldChange}){
  return(<div style={{marginBottom:10}}>
    <label style={lst}>{l}</label>
    {multi?<textarea value={value||""} onChange={e=>onFieldChange(k,e.target.value)} rows={3} placeholder={ph} style={{...ist,resize:"vertical"}}/>
          :<input value={value||""} onChange={e=>onFieldChange(k,e.target.value)} placeholder={ph} style={ist}/>}
  </div>);
}

// ── PropEdit ──
function PropEdit({block,onChange,pages,onCreatePage}){
  const d=block.data||{};
  const set=(k,v)=>onChange({...block,data:{...d,[k]:v}});
  const[creating,setCreating]=useState(false);
  const[newPageTitle,setNewPageTitle]=useState("");
  const[newPageContent,setNewPageContent]=useState("");

  if(block.type==="calendar") return <CalendarPropEdit block={block} onChange={onChange}/>;

  if(block.type==="hero") return<>
    <Field l="Naslov" k="title" value={d.title} onFieldChange={set}/>
    <Field l="Podnaslov" k="subtitle" value={d.subtitle} onFieldChange={set}/>
    <div style={{marginBottom:10}}><label style={lst}>Hero slika</label>
      <input value={d.imageUrl||""} onChange={e=>set("imageUrl",e.target.value)} placeholder="https://..." style={ist}/>
      <div style={{display:"flex",gap:6,marginTop:6}}>
        <label style={{flex:1,padding:"10px 0",borderRadius:8,border:"1px dashed rgba(245,197,24,.2)",background:"rgba(245,197,24,.03)",color:"#f5c518",fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"center"}}>
          📁 Upload<input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>set("imageUrl",ev.target.result);r.readAsDataURL(f);}}/>
        </label>
        {d.imageUrl&&<button onClick={()=>set("imageUrl","")} style={{padding:"10px 14px",borderRadius:8,border:"1px solid rgba(239,68,68,.2)",background:"transparent",color:"#ef4444",fontSize:12,cursor:"pointer"}}>✕</button>}
      </div>
      {d.imageUrl&&<img src={d.imageUrl} alt="" style={{width:"100%",height:60,objectFit:"cover",borderRadius:8,marginTop:6}}/>}
    </div>
  </>;

  if(block.type==="text") return <Field l="Tekst" k="text" multi value={d.text} onFieldChange={set}/>;
  if(block.type==="amount") return<><Field l="Iznos" k="amount" ph="100" value={d.amount} onFieldChange={set}/><Field l="Sufiks" k="suffix" ph=" €" value={d.suffix} onFieldChange={set}/><Field l="Naziv" k="label" value={d.label} onFieldChange={set}/><Field l="Opis" k="desc" value={d.desc} onFieldChange={set}/></>;

  if(block.type==="cta"){
    const mode=d.detailsMode||"inline";
    return<>
      <Field l="Tekst gumba" k="text" ph="KLIKNI" value={d.text} onFieldChange={set}/>
      <Field l="Link gumba (URL)" k="url" ph="https://admiral.hr/..." value={d.url} onFieldChange={set}/>
      <div style={{marginBottom:10}}>
        <label style={lst}>Način prikaza detalja</label>
        <div style={{display:"flex",gap:3,marginBottom:6}}>
          {[{k:"inline",l:"📄 Inline"},{k:"page",l:"📑 Stranica"},{k:"link",l:"🔗 URL"}].map(x=>(
            <button key={x.k} onClick={()=>set("detailsMode",x.k)} style={{flex:1,padding:"7px 4px",borderRadius:6,border:"1px solid "+(mode===x.k?"#4a9eff":"rgba(255,255,255,.05)"),background:mode===x.k?"rgba(74,158,255,.08)":"transparent",color:mode===x.k?"#4a9eff":"#8d99b0",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{x.l}</button>
          ))}
        </div>
      </div>
      {mode==="inline"&&<Field l="Tekst detalja/uvjeta" k="detailsText" multi ph="Pravila i uvjeti..." value={d.detailsText} onFieldChange={set}/>}
      {mode==="link"&&<Field l="URL stranice s detaljima" k="detailsUrl" ph="https://..." value={d.detailsUrl} onFieldChange={set}/>}
      {mode==="page"&&(<div>
        <label style={lst}>Odaberi stranicu</label>
        {(pages||[]).map(pg=>(
          <button key={pg.id} onClick={()=>set("detailsPageId",pg.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:"1px solid "+(d.detailsPageId===pg.id?"#4a9eff":"rgba(255,255,255,.05)"),background:d.detailsPageId===pg.id?"rgba(74,158,255,.06)":"transparent",cursor:"pointer",fontFamily:"inherit",color:"#edf0f7",marginBottom:4,textAlign:"left"}}>
            <span style={{fontSize:14}}>📄</span>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{pg.title}</div><div style={{fontSize:9,color:"#4a5670"}}>/info/{pg.slug}</div></div>
            {d.detailsPageId===pg.id&&<span style={{color:"#4a9eff",fontSize:14}}>✓</span>}
          </button>
        ))}
        {!creating?<button onClick={()=>setCreating(true)} style={{width:"100%",padding:"10px",borderRadius:8,border:"1px dashed rgba(34,197,94,.2)",background:"rgba(34,197,94,.03)",color:"#22c55e",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>+ Kreiraj novu stranicu</button>
        :<div style={{padding:10,borderRadius:10,background:"rgba(34,197,94,.04)",border:"1px solid rgba(34,197,94,.12)",marginTop:4}}>
          <div style={{fontSize:11,fontWeight:700,color:"#22c55e",marginBottom:8}}>Nova stranica s uvjetima</div>
          <input value={newPageTitle} onChange={e=>setNewPageTitle(e.target.value)} placeholder="Naslov" style={{...ist,marginBottom:6}}/>
          <textarea value={newPageContent} onChange={e=>setNewPageContent(e.target.value)} placeholder="Sadržaj..." rows={4} style={{...ist,resize:"vertical",marginBottom:6}}/>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>{if(!newPageTitle)return;const pg=onCreatePage(newPageTitle,newPageContent);set("detailsPageId",pg.id);setCreating(false);setNewPageTitle("");setNewPageContent("");}} style={{flex:1,padding:"8px",borderRadius:6,border:"none",background:"#22c55e",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Kreiraj i poveži</button>
            <button onClick={()=>setCreating(false)} style={{padding:"8px 12px",borderRadius:6,border:"1px solid rgba(255,255,255,.05)",background:"transparent",color:"#8d99b0",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Odustani</button>
          </div>
        </div>}
      </div>)}
    </>;
  }

  if(block.type==="countdown") return <Field l="Natpis" k="label" value={d.label} onFieldChange={set}/>;
  if(block.type==="rules") return <Field l="Pravila" k="text" multi value={d.text} onFieldChange={set}/>;

  if(block.type==="checks"){
    const items=d.items||[];
    return<div>
      <label style={lst}>Stavke</label>
      {items.map((item,i)=>(
        <div key={i} style={{display:"flex",gap:4,marginBottom:4}}>
          <input value={item} onChange={e=>{const n=[...items];n[i]=e.target.value;set("items",n);}} style={{...ist,flex:1}}/>
          <button onClick={()=>set("items",items.filter((_,j)=>j!==i))} style={{background:"transparent",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",borderRadius:6,padding:"0 8px",cursor:"pointer",fontSize:14}}>✕</button>
        </div>
      ))}
      <button onClick={()=>set("items",[...items,"Nova stavka"])} style={{...abtn,width:"100%",marginTop:4,borderStyle:"dashed",color:"#22c55e",borderColor:"rgba(34,197,94,.2)"}}>+ Dodaj stavku</button>
    </div>;
  }

  if(block.type==="steps"){
    const items=d.items||[];
    return<div>
      <label style={lst}>Koraci</label>
      {items.map((step,i)=>(
        <div key={i} style={{background:"rgba(0,0,0,.15)",borderRadius:8,padding:8,marginBottom:6,border:"1px solid rgba(255,255,255,.03)"}}>
          <div style={{display:"flex",gap:4,marginBottom:4}}>
            <input value={step.icon||""} onChange={e=>{const n=[...items];n[i]={...n[i],icon:e.target.value};set("items",n);}} style={{...ist,width:44,textAlign:"center",padding:"8px 4px"}} placeholder="🎁"/>
            <input value={step.title||""} onChange={e=>{const n=[...items];n[i]={...n[i],title:e.target.value};set("items",n);}} style={{...ist,flex:1}} placeholder="Naslov"/>
            <button onClick={()=>set("items",items.filter((_,j)=>j!==i))} style={{background:"transparent",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",borderRadius:6,padding:"0 8px",cursor:"pointer"}}>✕</button>
          </div>
          <input value={step.text||""} onChange={e=>{const n=[...items];n[i]={...n[i],text:e.target.value};set("items",n);}} style={ist} placeholder="Opis"/>
        </div>
      ))}
      <button onClick={()=>set("items",[...items,{icon:"📌",title:"Novi korak",text:""}])} style={{...abtn,width:"100%",marginTop:4,borderStyle:"dashed",color:"#f97316",borderColor:"rgba(249,115,22,.2)"}}>+ Dodaj korak</button>
    </div>;
  }

  if(block.type==="table"){
    const headers=d.headers||["Stupac 1","Stupac 2"];const rows=d.rows||[];
    return<div>
      <label style={lst}>Zaglavlja</label>
      <div style={{display:"flex",gap:4,marginBottom:8}}>{headers.map((h,i)=><input key={i} value={h} onChange={e=>{const n=[...headers];n[i]=e.target.value;set("headers",n);}} style={{...ist,flex:1,fontSize:12}}/>)}</div>
      <label style={lst}>Redovi</label>
      {rows.map((row,ri)=>(
        <div key={ri} style={{display:"flex",gap:4,marginBottom:4}}>
          {row.map((cell,ci)=><input key={ci} value={cell} onChange={e=>{const n=rows.map(r=>[...r]);n[ri][ci]=e.target.value;set("rows",n);}} style={{...ist,flex:1,fontSize:12}}/>)}
          <button onClick={()=>set("rows",rows.filter((_,j)=>j!==ri))} style={{background:"transparent",border:"1px solid rgba(239,68,68,.2)",color:"#ef4444",borderRadius:6,padding:"0 6px",cursor:"pointer",fontSize:12}}>✕</button>
        </div>
      ))}
      <button onClick={()=>set("rows",[...rows,headers.map(()=>"")])} style={{...abtn,width:"100%",marginTop:4,borderStyle:"dashed",color:"#8b5cf6",borderColor:"rgba(139,92,247,.2)"}}>+ Dodaj red</button>
    </div>;
  }

  return <div style={{fontSize:12,color:"#4a5670"}}>Nema dodatnih opcija.</div>;
}

const BLOCK_DEFAULTS={
  hero:{title:"NASLOV PROMOCIJE",subtitle:"Podnaslov"},
  text:{text:"Unesite tekst promocije ovdje."},
  amount:{amount:"100",suffix:" €",label:"Bonus",desc:"Za nove igrače"},
  cta:{text:"SAZNAJ VIŠE",detailsMode:"inline",detailsText:"Ovdje unesite detalje i uvjete promocije."},
  checks:{items:["Prva pogodnost","Druga pogodnost","Treća pogodnost"]},
  steps:{items:[{icon:"1️⃣",title:"PRVI KORAK",text:"Opis"},{icon:"2️⃣",title:"DRUGI KORAK",text:"Nagrada"}]},
  table:{headers:["Uvjet","Nagrada"],rows:[["Uvjet 1","Nagrada 1"],["Uvjet 2","Nagrada 2"]]},
  countdown:{label:"Do kraja promocije"},
  rules:{text:"Ovdje unesite pravila."},
  divider:{},
  calendar:{startDate:"2026-06-11",cols:7,previewDay:1,showSummaryRules:true,
    promoAmounts:Array(38).fill("2€"),
    finaleInfo:{day:"39",date:"19. srpnja",title:"FINALE",venue:"MetLife Stadium\nNew York / New Jersey"},
    rules:defaultRules},
};

function DeleteBtn({onDelete}){
  const[confirm,setConfirm]=useState(false);
  useEffect(()=>{if(confirm){const t=setTimeout(()=>setConfirm(false),3000);return()=>clearTimeout(t);}},[confirm]);
  return<button onClick={()=>{if(confirm)onDelete();else setConfirm(true);}} style={{width:"100%",padding:"12px",borderRadius:10,border:"1px solid "+(confirm?"rgba(239,68,68,.4)":"rgba(239,68,68,.2)"),background:confirm?"rgba(239,68,68,.12)":"rgba(239,68,68,.06)",color:"#ef4444",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:8,transition:"all .2s"}}>
    {confirm?"⚠️ Klikni ponovo za potvrdu brisanja":"🗑 Obriši promociju"}
  </button>;
}

// ═══ EDITOR ═══
function Editor({promo,onSave,onBack,onDelete,pages,onCreatePage}){
  const[blocks,setBlocks]=useState((promo.blocks||[]).map((b,i)=>({...b,id:b.id||("b"+Date.now()+i)})));
  const[sel,setSel]=useState(null);
  const[sheet,setSheet]=useState(null);
  const[saved,setSaved]=useState(false);
  const[dirty,setDirty]=useState(false);
  const[pvMode,setPvMode]=useState("mobile");
  const[title,setTitle]=useState(promo.t);
  const[desc,setDesc]=useState(promo.d||"");
  const[cat,setCat]=useState(promo.c||"casino");
  const[slug,setSlug]=useState(promo.s||"");
  const[autoSlug,setAutoSlug]=useState(!promo.s||promo.s.startsWith("nova-"));
  const[ctaTxt,setCtaTxt]=useState(promo.cta||"Više");
  const[emoji,setEmoji]=useState(promo.emoji||"🎁");
  const[status,setStatus]=useState(promo.status||"draft");
  const[cardImage,setCardImage]=useState(promo.cardImage||"");
  const[desktopImage,setDesktopImage]=useState(promo.desktopImage||"");
  const[mobileImage,setMobileImage]=useState(promo.mobileImage||"");
  const[history,setHistory]=useState([]);
  const[future,setFuture]=useState([]);
  const[showExitWarn,setShowExitWarn]=useState(false);

  const markDirty=()=>{if(!dirty)setDirty(true);};
  const changeTitle=(v)=>{setTitle(v);markDirty();if(autoSlug)setSlug(toSlug(v));};
  const pushHistory=(prev)=>{setHistory(h=>[...h.slice(-20),prev]);setFuture([]);};
  const undo=()=>{if(history.length===0)return;const prev=history[history.length-1];setHistory(h=>h.slice(0,-1));setFuture(f=>[...f,blocks]);setBlocks(prev);};
  const redo=()=>{if(future.length===0)return;const next=future[future.length-1];setFuture(f=>f.slice(0,-1));setHistory(h=>[...h,blocks]);setBlocks(next);};
  const add=(type)=>{pushHistory(blocks);const nb={type,id:"b"+Date.now(),data:{...(BLOCK_DEFAULTS[type]||{})}};setBlocks(prev=>[...prev,nb]);setSheet(null);setSel(nb.id);markDirty();setTimeout(()=>setSheet("edit"),150);};
  const rm=(id)=>{pushHistory(blocks);setBlocks(prev=>prev.filter(b=>b.id!==id));if(sel===id){setSel(null);setSheet(null);}markDirty();};
  const mv=(id,dir)=>{pushHistory(blocks);setBlocks(prev=>{const i=prev.findIndex(b=>b.id===id);if((dir===-1&&i===0)||(dir===1&&i===prev.length-1))return prev;const nb=[...prev];[nb[i],nb[i+dir]]=[nb[i+dir],nb[i]];return nb;});markDirty();};
  const upd=(id,u)=>{setBlocks(prev=>prev.map(b=>b.id===id?u:b));markDirty();};
  const selB=blocks.find(b=>b.id===sel);
  const save=()=>{onSave({...promo,t:title,d:desc,c:cat,s:slug,cta:ctaTxt,emoji,status,cardImage,desktopImage,mobileImage,blocks});setSaved(true);setDirty(false);setTimeout(()=>setSaved(false),2000);};
  const handleBack=()=>{if(dirty){setShowExitWarn(true);}else{onBack();}};

  const sidebarJSX=(<>
    <div style={{padding:"10px 12px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:11,fontWeight:700,color:"#f5c518"}}>BLOKOVI ({blocks.length})</span>
      <div style={{display:"flex",gap:4}}>
        <button onClick={undo} disabled={history.length===0} style={{background:"none",border:"none",color:history.length?"#8d99b0":"#2a3040",cursor:history.length?"pointer":"default",fontSize:14,padding:2}} title="Undo">↩</button>
        <button onClick={redo} disabled={future.length===0} style={{background:"none",border:"none",color:future.length?"#8d99b0":"#2a3040",cursor:future.length?"pointer":"default",fontSize:14,padding:2}} title="Redo">↪</button>
      </div>
    </div>
    <div style={{flex:1,overflow:"auto",padding:8}}>
      {blocks.map(b=>{const def=BT.find(x=>x.type===b.type)||{};return(
        <div key={b.id} onClick={()=>{setSel(b.id);setSheet(null);}} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 8px",borderRadius:7,cursor:"pointer",marginBottom:2,background:sel===b.id?"rgba(245,197,24,.06)":"transparent",border:"1px solid "+(sel===b.id?"rgba(245,197,24,.12)":"transparent")}}>
          <span style={{fontSize:13}}>{def.icon}</span>
          <span style={{flex:1,fontSize:11,fontWeight:500,color:"#edf0f7"}}>{def.label}</span>
          <button onClick={e=>{e.stopPropagation();mv(b.id,-1);}} style={{background:"none",border:"none",color:"#4a5670",fontSize:9,cursor:"pointer",padding:2}}>▲</button>
          <button onClick={e=>{e.stopPropagation();mv(b.id,1);}} style={{background:"none",border:"none",color:"#4a5670",fontSize:9,cursor:"pointer",padding:2}}>▼</button>
          <button onClick={e=>{e.stopPropagation();rm(b.id);}} style={{background:"none",border:"none",color:"#ef4444",fontSize:10,cursor:"pointer",padding:2,opacity:0.5}}>✕</button>
        </div>
      );})}
      <button onClick={()=>setSheet("add")} style={{width:"100%",padding:8,background:"rgba(255,255,255,.02)",border:"1px dashed rgba(255,255,255,.06)",borderRadius:7,color:"#8d99b0",fontSize:11,cursor:"pointer",fontWeight:600,marginTop:6,fontFamily:"inherit"}}>+ Dodaj blok</button>
    </div>
    {selB&&<div style={{borderTop:"1px solid rgba(255,255,255,.05)",padding:10,maxHeight:"45vh",overflow:"auto"}}>
      <div style={{fontSize:10,fontWeight:700,color:"#4a5670",marginBottom:6,textTransform:"uppercase"}}>Svojstva</div>
      <PropEdit block={selB} onChange={u=>upd(selB.id,u)} pages={pages} onCreatePage={onCreatePage}/>
    </div>}
  </>);

  return(<div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#06091a",position:"relative"}}>
    {/* Toolbar */}
    <div style={{display:"flex",alignItems:"center",padding:"8px 12px",background:"rgba(15,26,53,.75)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,.05)",gap:6,position:"sticky",top:0,zIndex:60}}>
      <button onClick={handleBack} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",color:"#edf0f7",cursor:"pointer",fontSize:18,padding:"6px 12px",borderRadius:8,fontWeight:700,minWidth:44,minHeight:36}}>←</button>
      <input value={title} onChange={e=>changeTitle(e.target.value)} style={{flex:1,background:"transparent",border:"none",color:"#edf0f7",fontSize:14,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,outline:"none",minWidth:0}}/>
      {dirty&&<span style={{width:8,height:8,borderRadius:"50%",background:"#f59e0b",flexShrink:0}} title="Nespremljene promjene"/>}
      <button onClick={undo} disabled={history.length===0} style={{background:"none",border:"1px solid rgba(255,255,255,.05)",color:history.length?"#8d99b0":"#2a3040",cursor:history.length?"pointer":"default",fontSize:14,padding:"6px 8px",borderRadius:8}} title="Undo">↩</button>
      <button onClick={redo} disabled={future.length===0} style={{background:"none",border:"1px solid rgba(255,255,255,.05)",color:future.length?"#8d99b0":"#2a3040",cursor:future.length?"pointer":"default",fontSize:14,padding:"6px 8px",borderRadius:8}} title="Redo">↪</button>
      <div style={{display:"flex",border:"1px solid rgba(255,255,255,.05)",borderRadius:6,overflow:"hidden"}}>
        {[{k:"mobile",i:"📱"},{k:"tablet",i:"📟"},{k:"desktop",i:"🖥"}].map(m=>(
          <button key={m.k} onClick={()=>setPvMode(m.k)} style={{background:pvMode===m.k?"rgba(245,197,24,.1)":"transparent",border:"none",color:pvMode===m.k?"#f5c518":"#4a5670",fontSize:11,padding:"5px 7px",cursor:"pointer"}} title={m.k}>{m.i}</button>
        ))}
      </div>
      <button onClick={()=>setSheet("settings")} style={{background:"none",border:"1px solid rgba(255,255,255,.05)",color:"#8d99b0",cursor:"pointer",fontSize:14,padding:"6px 10px",borderRadius:8}}>⚙</button>
      <button onClick={save} style={{padding:"7px 14px",borderRadius:8,border:"none",background:saved?"#22c55e":"#f5c518",color:"#06091a",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}}>{saved?"✓ OK":"Spremi"}</button>
    </div>

    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      {/* Desktop sidebar */}
      <div className="ed-sidebar" style={{width:270,background:"#0a1228",borderRight:"1px solid rgba(255,255,255,.05)",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>
        {sidebarJSX}
      </div>
      {/* Preview */}
      <div style={{flex:1,overflow:"auto",padding:12,display:"flex",justifyContent:"center",alignItems:"flex-start"}} onClick={()=>{if(sheet==="add")setSheet(null);}}>
        <div style={{width:"100%",maxWidth:pvMode==="desktop"?1100:pvMode==="tablet"?768:420,background:"#0a1228",borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,.05)",transition:"max-width .4s cubic-bezier(.16,1,.3,1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",background:"rgba(0,0,0,.3)",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#ef4444"}}/><span style={{width:7,height:7,borderRadius:"50%",background:"#f59e0b"}}/><span style={{width:7,height:7,borderRadius:"50%",background:"#22c55e"}}/>
            <span style={{flex:1,margin:"0 8px",background:"rgba(255,255,255,.04)",borderRadius:4,padding:"3px 8px",fontSize:9,color:"#4a5670",textAlign:"center"}}>admiral.hr/info/{slug}</span>
            <span style={{fontSize:9,color:"#4a5670",fontWeight:600}}>{pvMode==="desktop"?"1100px":pvMode==="tablet"?"768px":"420px"}</span>
          </div>
          <div style={{minHeight:300,paddingBottom:60}}>
            {blocks.length===0?(
              <div onClick={e=>{e.stopPropagation();setSheet("add");}} style={{padding:"60px 20px",textAlign:"center",cursor:"pointer"}}>
                <div style={{width:56,height:56,borderRadius:16,background:"rgba(245,197,24,.06)",border:"2px dashed rgba(245,197,24,.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:28,color:"#f5c518"}}>+</div>
                <div style={{fontSize:16,fontWeight:700,color:"#8d99b0"}}>Dodaj prvi blok</div>
              </div>
            ):blocks.map(b=>(
              <div key={b.id} onClick={e=>{e.stopPropagation();setSel(b.id);setSheet("edit");}} style={{cursor:"pointer",border:sel===b.id?"2px solid #f5c518":"2px solid transparent",background:sel===b.id?"rgba(245,197,24,.02)":"transparent",position:"relative"}}>
                <RB block={{...b,_pages:pages}} inEditor={true}/>
                {sel===b.id&&<div style={{position:"absolute",top:4,left:4,zIndex:5}}><span style={{background:"#f5c518",color:"#06091a",padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:800}}>{(BT.find(x=>x.type===b.type)||{}).icon} {(BT.find(x=>x.type===b.type)||{}).label}</span></div>}
              </div>
            ))}
            {blocks.length>0&&<div onClick={e=>{e.stopPropagation();setSheet("add");}} style={{padding:14,textAlign:"center",cursor:"pointer",border:"2px dashed rgba(255,255,255,.06)",margin:"8px 12px",borderRadius:10,color:"#4a5670",fontSize:13,fontWeight:600}}>+ Dodaj blok</div>}
          </div>
        </div>
      </div>
    </div>

    {/* FAB mobile */}
    <button className="ed-fab" onClick={()=>setSheet(sheet==="add"?null:"add")} style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:16,background:"#f5c518",border:"none",cursor:"pointer",zIndex:80,boxShadow:"0 6px 24px rgba(245,197,24,.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{fontSize:28,color:"#06091a",fontWeight:300,transform:sheet==="add"?"rotate(45deg)":"none",transition:"transform .3s",display:"block",lineHeight:1}}>+</span>
    </button>

    {/* Backdrop */}
    {sheet&&<div onClick={()=>{setSel(null);setSheet(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:89,animation:"fadeIn .2s"}}/>}

    {/* Sheet: Edit */}
    {sheet==="edit"&&selB&&(<div key={"edit-"+sel} style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a1228",borderTopLeftRadius:20,borderTopRightRadius:20,zIndex:90,maxHeight:"75vh",display:"flex",flexDirection:"column",border:"1px solid rgba(255,255,255,.05)",borderBottom:"none",animation:"sheetUp .3s cubic-bezier(.16,1,.3,1)"}}>
      <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.15)",margin:"10px auto 6px"}}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 18px 10px"}}><div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:16,fontWeight:800}}>{(BT.find(x=>x.type===selB.type)||{}).icon} {(BT.find(x=>x.type===selB.type)||{}).label}</div><button onClick={()=>{setSel(null);setSheet(null);}} style={{background:"none",border:"none",color:"#8d99b0",fontSize:18,cursor:"pointer"}}>✕</button></div>
      <div style={{display:"flex",gap:4,padding:"0 18px 10px",flexWrap:"wrap"}}>
        <button onClick={()=>mv(sel,-1)} style={abtn}>▲</button><button onClick={()=>mv(sel,1)} style={abtn}>▼</button>
        <button onClick={()=>{const i=blocks.findIndex(b=>b.id===sel);if(i>=0){const copy={...blocks[i],id:"b"+Date.now(),data:{...blocks[i].data}};setBlocks(prev=>{const nb=[...prev];nb.splice(i+1,0,copy);return nb;});}}} style={abtn}>📋</button>
        <button onClick={()=>rm(sel)} style={{...abtn,borderColor:"rgba(239,68,68,.2)",color:"#ef4444"}}>🗑</button>
      </div>
      <div style={{overflow:"auto",padding:"0 18px 24px",flex:1}}><PropEdit block={selB} onChange={u=>upd(selB.id,u)} pages={pages} onCreatePage={onCreatePage}/></div>
    </div>)}

    {/* Sheet: Add */}
    {sheet==="add"&&(<div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a1228",borderTopLeftRadius:20,borderTopRightRadius:20,zIndex:90,maxHeight:"60vh",display:"flex",flexDirection:"column",border:"1px solid rgba(255,255,255,.05)",borderBottom:"none",animation:"sheetUp .3s cubic-bezier(.16,1,.3,1)"}}>
      <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.15)",margin:"10px auto 6px"}}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 18px 12px"}}><div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:16,fontWeight:800}}>Dodaj blok</div><button onClick={()=>setSheet(null)} style={{background:"none",border:"none",color:"#8d99b0",fontSize:18,cursor:"pointer"}}>✕</button></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"0 18px 24px",overflow:"auto"}}>
        {BT.map(bt=>(<button key={bt.type} onClick={()=>add(bt.type)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"14px 6px",borderRadius:12,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",cursor:"pointer",fontFamily:"inherit",color:"#edf0f7"}}>
          <div style={{width:38,height:38,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:bt.color+"18",border:"1px solid "+bt.color+"30"}}>{bt.icon}</div>
          <div style={{fontSize:10,fontWeight:600,color:"#8d99b0",textAlign:"center"}}>{bt.label}</div>
        </button>))}
      </div>
    </div>)}

    {/* Sheet: Settings */}
    {sheet==="settings"&&(<div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a1228",borderTopLeftRadius:20,borderTopRightRadius:20,zIndex:90,maxHeight:"80vh",display:"flex",flexDirection:"column",border:"1px solid rgba(255,255,255,.05)",borderBottom:"none",animation:"sheetUp .3s cubic-bezier(.16,1,.3,1)"}}>
      <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.15)",margin:"10px auto 6px"}}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 18px 12px"}}><div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:16,fontWeight:800}}>⚙ Postavke promocije</div><button onClick={()=>setSheet(null)} style={{background:"none",border:"none",color:"#8d99b0",fontSize:18,cursor:"pointer"}}>✕</button></div>
      <div style={{overflow:"auto",padding:"0 18px 24px",flex:1}}>
        <div style={{marginBottom:10}}><label style={lst}>Opis</label><textarea value={desc} onChange={e=>{setDesc(e.target.value);markDirty();}} rows={2} style={{...ist,resize:"vertical"}}/></div>
        <div style={{marginBottom:10}}><label style={lst}>URL slug {autoSlug&&<span style={{color:"#22c55e",fontSize:9}}>(auto)</span>}</label>
          <input value={slug} onChange={e=>{setSlug(e.target.value);setAutoSlug(false);markDirty();}} style={ist}/>
          <div style={{fontSize:10,color:"#4a5670",marginTop:4}}>admiral.hr/info/<b style={{color:"#8d99b0"}}>{slug||"..."}</b></div>
        </div>
        <div style={{marginBottom:10}}><label style={lst}>CTA tekst</label><input value={ctaTxt} onChange={e=>{setCtaTxt(e.target.value);markDirty();}} style={ist}/></div>
        <div style={{marginBottom:10}}><label style={lst}>Kategorija</label>
          <div style={{display:"flex",gap:6}}>{[{k:"casino",l:"Casino",c:"#22c55e"},{k:"kladenje",l:"Klađenje",c:"#4a9eff"}].map(x=>(
            <button key={x.k} onClick={()=>{setCat(x.k);markDirty();}} style={{flex:1,padding:"10px",borderRadius:8,border:"1px solid "+(cat===x.k?x.c:"rgba(255,255,255,.05)"),background:cat===x.k?x.c+"12":"transparent",color:cat===x.k?x.c:"#8d99b0",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{x.l}</button>
          ))}</div>
        </div>
        <div style={{marginBottom:10}}><label style={lst}>Status</label>
          <div style={{display:"flex",gap:6}}>{[{k:"published",l:"Objavljena",c:"#22c55e"},{k:"draft",l:"Skica",c:"#f59e0b"}].map(x=>(
            <button key={x.k} onClick={()=>{setStatus(x.k);markDirty();}} style={{flex:1,padding:"10px",borderRadius:8,border:"1px solid "+(status===x.k?x.c:"rgba(255,255,255,.05)"),background:status===x.k?x.c+"12":"transparent",color:status===x.k?x.c:"#8d99b0",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{x.l}</button>
          ))}</div>
        </div>
        <div style={{marginBottom:10}}><label style={lst}>Emoji</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{EMOJIS.map(e=>(
            <button key={e} onClick={()=>{setEmoji(e);markDirty();}} style={{width:36,height:36,borderRadius:8,border:emoji===e?"2px solid #f5c518":"1px solid rgba(255,255,255,.05)",background:emoji===e?"rgba(245,197,24,.08)":"transparent",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{e}</button>
          ))}</div>
        </div>
        <div style={{marginBottom:10,padding:"12px",borderRadius:10,background:"rgba(65,136,254,.04)",border:"1px solid rgba(65,136,254,.12)"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#4188FE",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Slike promocije</div>
          <div style={{marginBottom:8}}><label style={lst}>Slika za karticu</label><input value={cardImage} onChange={e=>{setCardImage(e.target.value);markDirty();}} placeholder="https://..." style={ist}/>{cardImage&&<img src={cardImage} alt="" style={{width:"100%",height:50,objectFit:"cover",borderRadius:6,marginTop:4}}/>}</div>
          <div style={{marginBottom:8}}><label style={lst}>Desktop banner</label><input value={desktopImage} onChange={e=>{setDesktopImage(e.target.value);markDirty();}} placeholder="https://..." style={ist}/>{desktopImage&&<img src={desktopImage} alt="" style={{width:"100%",height:50,objectFit:"cover",borderRadius:6,marginTop:4}}/>}</div>
          <div><label style={lst}>Mobilni banner</label><input value={mobileImage} onChange={e=>{setMobileImage(e.target.value);markDirty();}} placeholder="https://..." style={ist}/>{mobileImage&&<img src={mobileImage} alt="" style={{width:"100%",height:50,objectFit:"cover",borderRadius:6,marginTop:4}}/>}</div>
        </div>
        <DeleteBtn onDelete={()=>onDelete(promo.id)}/>
      </div>
    </div>)}

    {/* Exit warning */}
    {showExitWarn&&(<>
      <div onClick={()=>setShowExitWarn(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:95,animation:"fadeIn .2s"}}/>
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#0a1228",borderRadius:16,padding:"24px",border:"1px solid rgba(255,255,255,.08)",zIndex:96,width:"90%",maxWidth:340,animation:"fadeIn .2s"}}>
        <div style={{fontSize:18,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>Nespremljene promjene</div>
        <div style={{fontSize:13,color:"#8d99b0",lineHeight:1.6,marginBottom:16}}>Imate promjene koje nisu spremljene. Što želite učiniti?</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{save();setTimeout(onBack,200);}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"#f5c518",color:"#06091a",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Spremi i izađi</button>
          <button onClick={()=>{setShowExitWarn(false);onBack();}} style={{flex:1,padding:"10px",borderRadius:8,border:"1px solid rgba(239,68,68,.2)",background:"transparent",color:"#ef4444",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Odbaci</button>
        </div>
        <button onClick={()=>setShowExitWarn(false)} style={{width:"100%",padding:"8px",borderRadius:8,border:"none",background:"transparent",color:"#8d99b0",fontSize:12,cursor:"pointer",fontFamily:"inherit",marginTop:6}}>Nastavi uređivanje</button>
      </div>
    </>)}

    <style>{globalCSS}</style>
  </div>);
}

// ═══ ADMIN ═══
function Admin({promos,onEdit,onPlayer,onAdd,onDuplicate,pages}){
  const[search,setSearch]=useState("");
  const[tpl,setTpl]=useState(null);
  const filtered=promos.filter(p=>p.t.toLowerCase().includes(search.toLowerCase()));

  return(<div style={{padding:"16px 14px",maxWidth:800,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <div><div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:26,fontWeight:800}}>Admiral CMS</div><div style={{fontSize:12,color:"#8d99b0",marginTop:2}}>{promos.length} promocija · {(pages||[]).length} stranica</div></div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={onPlayer} style={{...abtn,flex:"none"}}>👁 Player</button>
        <button onClick={()=>setTpl("pick")} style={{padding:"8px 14px",borderRadius:8,border:"none",background:"#f5c518",color:"#06091a",fontSize:12,cursor:"pointer",fontWeight:800,fontFamily:"inherit"}}>+ Nova</button>
      </div>
    </div>

    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
      {[{l:"Casino",v:promos.filter(p=>p.c==="casino").length,i:"🎰",c:"#22c55e"},{l:"Klađenje",v:promos.filter(p=>p.c==="kladenje").length,i:"⚽",c:"#4a9eff"},{l:"Objavljene",v:promos.filter(p=>p.status==="published").length,i:"✅",c:"#f5c518"},{l:"Stranice",v:(pages||[]).length,i:"📄",c:"#a855f7"}].map((s,i)=>(
        <div key={i} style={{background:"#111d3a",borderRadius:14,padding:"14px 14px 10px",border:"1px solid rgba(255,255,255,.05)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:s.c,opacity:0.5}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:28,fontWeight:800,lineHeight:1}}>{s.v}</div><div style={{fontSize:10,color:"#8d99b0",fontWeight:600,marginTop:4}}>{s.l}</div></div>
            <span style={{fontSize:20}}>{s.i}</span>
          </div>
        </div>
      ))}
    </div>

    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Pretraži promocije..." style={{...ist,marginBottom:12}}/>
    <div style={{fontSize:10,fontWeight:700,color:"#4a5670",textTransform:"uppercase",marginBottom:6,padding:"0 4px"}}>Promocije ({filtered.length})</div>

    {filtered.map(p=>(
      <div key={p.id} onClick={()=>onEdit(p)} style={{display:"flex",alignItems:"center",padding:"10px 12px",background:"#111d3a",borderRadius:10,border:"1px solid rgba(255,255,255,.05)",gap:10,marginBottom:4,cursor:"pointer"}}>
        <div style={{width:44,height:32,borderRadius:8,flexShrink:0,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{p.emoji}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.t}</div>
          <div style={{fontSize:10,color:"#4a5670",marginTop:1}}>{(p.blocks||[]).length} blokova · {p.c}</div>
        </div>
        <span style={{padding:"2px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:p.status==="published"?"rgba(34,197,94,.1)":"rgba(245,158,11,.1)",color:p.status==="published"?"#22c55e":"#f59e0b"}}>{p.status==="published"?"Live":"Skica"}</span>
        <button onClick={e=>{e.stopPropagation();onDuplicate(p);}} style={{background:"none",border:"1px solid rgba(255,255,255,.05)",color:"#8d99b0",fontSize:11,padding:"4px 8px",borderRadius:6,cursor:"pointer"}} title="Dupliciraj">📋</button>
        <span style={{color:"#4a5670",fontSize:14}}>›</span>
      </div>
    ))}

    <div style={{marginTop:20,marginBottom:8,fontSize:14,fontWeight:800,color:"#8d99b0",fontFamily:"Barlow Condensed,sans-serif"}}>Stranice s uvjetima ({(pages||[]).length})</div>
    {(pages||[]).map(pg=>(
      <div key={pg.id} style={{display:"flex",alignItems:"center",padding:"10px 12px",background:"#111d3a",borderRadius:10,border:"1px solid rgba(255,255,255,.05)",gap:10,marginBottom:4}}>
        <span style={{fontSize:14}}>📄</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{pg.title}</div>
          <div style={{fontSize:10,color:"#4a5670",marginTop:1}}>/info/{pg.slug}</div>
        </div>
        <span style={{padding:"2px 6px",borderRadius:4,fontSize:9,fontWeight:700,background:"rgba(74,158,255,.1)",color:"#4a9eff"}}>Info</span>
      </div>
    ))}

    {/* Template Picker */}
    {tpl&&(<>
      <div onClick={()=>setTpl(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:89,animation:"fadeIn .2s"}}/>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a1228",borderTopLeftRadius:20,borderTopRightRadius:20,zIndex:90,maxHeight:"70vh",display:"flex",flexDirection:"column",border:"1px solid rgba(255,255,255,.05)",borderBottom:"none",animation:"sheetUp .3s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.15)",margin:"10px auto 6px"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 18px 14px"}}><div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:18,fontWeight:800}}>Odaberi predložak</div><button onClick={()=>setTpl(null)} style={{background:"none",border:"none",color:"#8d99b0",fontSize:18,cursor:"pointer"}}>✕</button></div>
        <div style={{overflow:"auto",padding:"0 18px 24px"}}>
          {TEMPLATES.map(t=>(
            <button key={t.id} onClick={()=>{setTpl(null);onAdd(t);}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 12px",borderRadius:12,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",cursor:"pointer",fontFamily:"inherit",color:"#edf0f7",marginBottom:6,textAlign:"left"}}>
              <div style={{width:46,height:46,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,background:t.color+"15",border:"1px solid "+t.color+"30",flexShrink:0}}>{t.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700}}>{t.name}</div><div style={{fontSize:11,color:"#8d99b0",marginTop:2}}>{t.desc}</div></div>
              <span style={{fontSize:10,color:"#4a5670"}}>{t.blocks.length} blokova</span>
            </button>
          ))}
        </div>
      </div>
    </>)}
    <style>{globalCSS}</style>
  </div>);
}

// ═══ PLAYER VIEW ═══
function Player({promos,pages,onAdmin}){
  const[f,setF]=useState("sve");
  const[sel,setSel]=useState(null);
  const pub=promos.filter(p=>p.status==="published");
  const sorted=[...pub].sort((a,b)=>(a.c==="casino"?-1:1)-(b.c==="casino"?-1:1));
  const list=f==="sve"?sorted:sorted.filter(p=>p.c===f);
  const pr=useRef(null);
  const sP=()=>{pr.current=setTimeout(onAdmin,2000);};
  const eP=()=>{clearTimeout(pr.current);};

  if(sel){
    const heroBlock=sel.blocks?.find(b=>b.type==="hero");
    const heroTitle=heroBlock?.data?.title||sel.t;
    const heroSubtitle=heroBlock?.data?.subtitle;
    const contentBlocks=(sel.blocks||[]).filter(b=>b.type!=="hero");
    const ctaBlock=contentBlocks.find(b=>b.type==="cta");
    const nonCtaBlocks=contentBlocks.filter(b=>b.type!=="cta");
    const fallbackImg=heroBlock?.data?.imageUrl;
    const deskImg=sel.desktopImage||fallbackImg;
    const mobImg=sel.mobileImage||fallbackImg;

    return(<div style={{minHeight:"100vh",background:"#0C092A",fontFamily:"Barlow,sans-serif"}}>
      <style>{`.pv-dimg{display:block}.pv-mimg{display:none}@media(max-width:767px){.pv-dimg{display:none !important}.pv-mimg{display:block !important}}`}</style>
      <div style={{padding:"12px 16px 0"}}>
        <button onClick={()=>setSel(null)} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"10px 18px",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:700,fontFamily:"inherit",minWidth:44,minHeight:44,display:"inline-flex",alignItems:"center",gap:6}}>← Natrag</button>
      </div>
      <div style={{maxWidth:1100,margin:"16px auto 0",padding:"0 16px"}}>
        {(deskImg||mobImg)?(<>
          {deskImg&&<div className="pv-dimg" style={{borderRadius:8,overflow:"hidden"}}><img src={deskImg} alt="" style={{width:"100%",display:"block"}}/></div>}
          {mobImg&&<div className="pv-mimg" style={{borderRadius:8,overflow:"hidden"}}><img src={mobImg} alt="" style={{width:"100%",display:"block"}}/></div>}
        </>):(
          <div style={{borderRadius:8,overflow:"hidden",height:200,background:sel.grad,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:64}}>{sel.emoji}</span>
          </div>
        )}
      </div>
      {/* For calendar promo — no separate title, calendar has its own header */}
      {!(sel.blocks||[]).some(b=>b.type==="calendar")&&(
        <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 20px 8px",textAlign:"center"}}>
          <h1 style={{fontFamily:"Barlow,sans-serif",fontSize:28,fontWeight:700,lineHeight:1.2,color:"#fff",margin:0,textTransform:"uppercase"}}>{heroTitle}</h1>
          {heroSubtitle&&<p style={{fontSize:16,color:"rgba(255,255,255,.7)",marginTop:14,fontWeight:500,lineHeight:1.6}}>{heroSubtitle}</p>}
        </div>
      )}
      <div style={{maxWidth:800,margin:"0 auto",padding:"8px 16px 60px"}}>
        {nonCtaBlocks.map((b,i)=><Rv key={b.id||i} delay={i*.06}><RB block={{...b,_pages:pages}}/></Rv>)}
        {ctaBlock&&<Rv delay={nonCtaBlocks.length*.06}><RB block={{...ctaBlock,_pages:pages}}/></Rv>}
      </div>
    </div>);
  }

  return(<>
    <style>{`.pv-grid{display:grid;grid-template-columns:1fr;gap:12px}@media(min-width:576px){.pv-grid{grid-template-columns:repeat(2,1fr)}}@media(min-width:992px){.pv-grid{grid-template-columns:repeat(3,1fr)}}@media(min-width:1600px){.pv-grid{grid-template-columns:repeat(4,1fr);gap:14px}}.pv-card{background:#0D1A3C;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;height:100%;transition:transform .2s}.pv-card:hover{transform:translateY(-2px)}`}</style>
    <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:"#0F0D25",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:20,cursor:"pointer",color:"#fff"}}>☰</span>
        <div onMouseDown={sP} onMouseUp={eP} onTouchStart={sP} onTouchEnd={eP} style={{fontFamily:"Barlow,sans-serif",fontSize:24,fontWeight:800,letterSpacing:"0.04em",cursor:"pointer",userSelect:"none",WebkitUserSelect:"none",color:"#fff"}}>ADMIRAL</div>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <button style={{padding:"6px 20px",borderRadius:32,border:"none",background:"#4fbf24",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"Barlow,sans-serif",textTransform:"uppercase"}}>Uplata</button>
        <button style={{padding:"6px 16px",borderRadius:32,border:"1px solid #fff",background:"transparent",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"Barlow,sans-serif",textTransform:"uppercase"}}>Prijava</button>
      </div>
    </header>
    <div style={{background:"#002157",display:"flex",justifyContent:"center",gap:20}}>
      <div style={{padding:"10px 0",fontSize:16,fontWeight:500,color:"rgba(255,255,255,.5)",cursor:"pointer"}}>Nagrade</div>
      <div style={{padding:"10px 0",fontSize:16,fontWeight:500,color:"#fff",cursor:"pointer",position:"relative"}}>Promocije<div style={{position:"absolute",bottom:0,left:0,width:"100%",height:4,background:"#4188FE",borderRadius:"10px 10px 0 0"}}/></div>
    </div>
    <div style={{margin:"0 auto",padding:"24px 8px 60px",fontFamily:"Barlow,sans-serif",background:"#0C092A"}}>
      <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:24}}>{[{k:"sve",l:"Sve"},{k:"casino",l:"Casino"},{k:"kladenje",l:"Klađenje"}].map(x=>(
        <button key={x.k} onClick={()=>setF(x.k)} style={{padding:"7px 16px",borderRadius:4,border:f===x.k?"2px solid #2B80FF":"1px solid rgba(255,255,255,.8)",background:"transparent",color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"Barlow,sans-serif"}}>{x.l}</button>
      ))}</div>
      <div className="pv-grid">{list.map((p,idx)=>{
        const cardImg=p.cardImage||p.blocks?.find(b=>b.type==="hero"&&b.data?.imageUrl)?.data?.imageUrl;
        return(<Rv key={p.id} delay={idx*.03}>
          <div className="pv-card" onClick={()=>setSel(p)}>
            <div style={{position:"relative",paddingTop:cardImg?0:"56.25%",overflow:"hidden"}}>
              {cardImg?<img src={cardImg} alt="" style={{width:"100%",display:"block"}}/>
              :<div style={{position:"absolute",inset:0,background:p.grad,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:56,filter:"drop-shadow(0 4px 12px rgba(0,0,0,.3))"}}>{p.emoji}</span></div>}
            </div>
            <div style={{padding:"16px 16px 8px",flex:1,display:"flex",flexDirection:"column"}}>
              <h2 style={{fontFamily:"Barlow,sans-serif",fontSize:18,fontWeight:700,margin:"0 0 10px",textTransform:"uppercase",lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",color:"#fff"}}>{p.t}</h2>
              <p style={{fontSize:13,color:"rgba(255,255,255,.7)",lineHeight:1.65,margin:0,flex:1,display:"-webkit-box",WebkitLineClamp:4,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.d}</p>
            </div>
            <div style={{padding:"8px 16px 16px",textAlign:"center"}}>
              <button style={{width:"80%",padding:"10px 0",borderRadius:32,border:"none",background:"#4188FE",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Barlow,sans-serif"}}>{p.cta||"Više"}</button>
              <div style={{marginTop:10,fontSize:13,color:"rgba(255,255,255,.45)",cursor:"pointer"}}>Više detalja i uvjeti promocije</div>
            </div>
          </div>
        </Rv>);
      })}</div>
    </div>
  </>);
}


// ═══ MAIN — Connected to Supabase ═══
export default function App() {
  const [mode, setMode] = useState("player");
  const [promos, setPromos] = useState([]);
  const [pages, setPages] = useState([]);
  const [editP, setEditP] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    async function load() {
      const [promosRes, pagesRes] = await Promise.all([
        supabase.from("promotions").select("*").order("created_at", { ascending: false }),
        supabase.from("promo_pages").select("*").order("created_at", { ascending: true }),
      ]);
      const dbPromos = (promosRes.data || []).map(p => ({
        id: p.id, t: p.title, s: p.slug, d: p.description, c: p.category,
        status: p.status, emoji: p.emoji, grad: p.gradient, cta: p.cta_text,
        badge: p.badge || "", blocks: p.blocks || [],
        cardImage: p.card_image || "", desktopImage: p.desktop_image || "", mobileImage: p.mobile_image || "",
      }));
      setPromos(dbPromos);
      setPages(pagesRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const show = (m) => { setToast(m); setTimeout(() => setToast(null), 2500); };
  const edit = (p) => { setEditP(p); setMode("editor"); };

  // Save to Supabase
  const save = async (u) => {
    const row = { title: u.t, slug: u.s, description: u.d, category: u.c, status: u.status,
      emoji: u.emoji, gradient: u.grad, cta_text: u.cta, badge: u.badge || "",
      card_image: u.cardImage || "", desktop_image: u.desktopImage || "", mobile_image: u.mobileImage || "",
      blocks: u.blocks, updated_at: new Date().toISOString() };
    if (typeof u.id === "string" && u.id.length > 10) {
      await supabase.from("promotions").update(row).eq("id", u.id);
    } else {
      const { data } = await supabase.from("promotions").insert(row).select().single();
      if (data) u.id = data.id;
    }
    setPromos(prev => {
      const exists = prev.find(p => p.id === u.id);
      return exists ? prev.map(p => p.id === u.id ? u : p) : [u, ...prev];
    });
    show("Spremljeno u bazu!");
  };

  // Delete from Supabase
  const del = async (id) => {
    if (typeof id === "string" && id.length > 10) {
      await supabase.from("promotions").delete().eq("id", id);
    }
    setPromos(prev => prev.filter(p => p.id !== id));
    setMode("admin");
    show("Promocija obrisana iz baze");
  };

  // Create page in Supabase
  const createPage = async (title, content) => {
    const slug = toSlug(title);
    const { data } = await supabase.from("promo_pages").insert({ title, slug, content }).select().single();
    const pg = data || { id: "p" + Date.now(), title, slug, content };
    setPages(prev => [...prev, pg]);
    show("Stranica kreirana u bazi!");
    return pg;
  };

  // Duplicate
  const dup = async (p) => {
    const np = { ...p, id: undefined, t: p.t + " (kopija)", s: toSlug(p.t + " kopija"), status: "draft",
      blocks: (p.blocks || []).map((b, i) => ({ ...b, id: "d" + Date.now() + i, data: { ...b.data } })) };
    await save(np);
    show("Promocija duplicirana!");
    edit(np);
  };

  // Add from template
  const addFromTpl = async (tpl) => {
    const np = { t: "Nova " + tpl.name, s: "nova-" + Date.now(), c: "casino", status: "draft",
      grad: GRADS[Math.floor(Math.random() * GRADS.length)], emoji: tpl.icon, d: "Opis promocije...",
      cta: "Više", badge: "", blocks: tpl.blocks.map((b, i) => ({ ...b, id: "nb" + Date.now() + i, data: { ...b.data } })) };
    await save(np);
    edit(np);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06091a", color: "#edf0f7", fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 28, fontWeight: 800, color: "#f5c518" }}>ADMIRAL CMS</div>
      <div style={{ fontSize: 13, color: "#8d99b0" }}>Učitavanje iz baze podataka...</div>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(245,197,24,.15)", borderTop: "3px solid #f5c518", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#06091a", color: "#edf0f7", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
@keyframes particleFloat{0%{transform:translateY(0) scale(1);opacity:.3}100%{transform:translateY(-20px) scale(1.5);opacity:.05}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 8px rgba(245,197,24,.15)}50%{box-shadow:0 0 20px rgba(245,197,24,.3)}}
@keyframes badgePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
      `}</style>
      {mode === "editor" && editP ? <Editor promo={editP} onSave={save} onBack={() => setMode("admin")} onDelete={del} pages={pages} onCreatePage={createPage} /> : mode === "admin" ? <Admin promos={promos} onEdit={edit} onPlayer={() => setMode("player")} onAdd={addFromTpl} onDuplicate={dup} pages={pages} /> : <Player promos={promos} pages={pages} onAdmin={() => { setMode("admin"); show("CMS Admin aktiviran"); }} />}
      {toast && <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", padding: "10px 20px", background: "#22c55e", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,.4)", zIndex: 1000, animation: "fadeIn .3s" }}>{"✓ "}{toast}</div>}
    </div>
  );
}
