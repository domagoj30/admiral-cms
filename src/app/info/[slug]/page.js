'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const phaseColors = {
  gs: '#00c853', r32: '#26A69A', r16: '#4990e1',
  qf: '#1a3d6e', sf: '#f5c518', tp: '#ff2e00', fin: '#f5c518',
};

const mShort = ['sij','velj','ožu','tra','svi','lip','srp','kol','ruj','lis','stu','pro'];

// ═══════════════════════════════════
// PUT DO FINALA — Calendar Component
// ═══════════════════════════════════
function PutDoFinalaCalendar({ days }) {
  const wrapperRef = useRef(null);
  const gridRef = useRef(null);

  // Calculate active day based on current date (demo: day 1)
  const DEMO_ACTIVE = 1;

  // Scroll to show 3 rows
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const grid = gridRef.current;
    if (!wrapper || !grid) return;
    const setHeight = () => {
      const cards = grid.querySelectorAll('[data-dc]');
      if (!cards.length) return;
      const rect = cards[0].getBoundingClientRect();
      if (rect.height === 0) return;
      const gap = 10;
      wrapper.style.maxHeight = ((rect.height + gap) * 3) + 'px';
    };
    const timer = setTimeout(setHeight, 200);
    const ro = new ResizeObserver(setHeight);
    ro.observe(grid);
    return () => { clearTimeout(timer); ro.disconnect(); };
  }, [days]);

  if (!days.length) return <div className="text-center text-[#5a6577] py-8">Učitavanje kampanje...</div>;

  const lastRowCards = (days.length - 1) % 7; // -1 because finale is separate
  const finaleSpan = lastRowCards === 0 ? 7 : (7 - lastRowCards);
  const finaleDay = days.find(d => d.day_number === 39);
  const regularDays = days.filter(d => d.day_number < 39);

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 5 }}>
      {/* Floating deco */}
      {[
        { top: 20, left: -8, size: 50, emoji: '⚽', anim: 'floatA 6s ease-in-out infinite' },
        { top: '50%', right: -8, size: 45, emoji: '⚽', anim: 'floatB 7s ease-in-out infinite' },
        { bottom: '40%', left: -5, size: 40, emoji: '🏆', anim: 'floatA 5s ease-in-out infinite 1s' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', ...(b.top !== undefined ? { top: b.top } : {}), ...(b.bottom !== undefined ? { bottom: b.bottom } : {}),
          ...(b.left !== undefined ? { left: b.left } : {}), ...(b.right !== undefined ? { right: b.right } : {}),
          width: b.size, height: b.size, borderRadius: '50%',
          border: '2px solid rgba(245,197,24,0.15)',
          background: 'radial-gradient(circle at 35% 35%,rgba(245,197,24,0.08),transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: b.size * 0.45, animation: b.anim, pointerEvents: 'none', zIndex: 2,
        }}>{b.emoji}</div>
      ))}

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <h2 style={{
          fontFamily: "'Oswald',sans-serif", fontWeight: 700,
          fontSize: 28, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6,
          background: 'linear-gradient(135deg,#f5c518,#ffd700,#fff5a0,#f5c518)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'shimmer 3s linear infinite',
        }}>🏆 Put do Finala 🏆</h2>
        <p style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14,
          color: 'rgba(200,212,230,0.4)', letterSpacing: 2,
        }}>
          Klikni na aktivan dan i otkrij dnevnu promociju · 11.06. — 19.07.2026.
        </p>
      </div>

      {/* Scroll wrapper */}
      <div ref={wrapperRef} style={{
        overflowY: 'auto', overflowX: 'hidden',
        scrollBehavior: 'smooth', scrollbarWidth: 'thin',
        marginBottom: 14, paddingRight: 4,
      }}>
        {/* Grid */}
        <div ref={gridRef} style={{
          display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10,
        }}>
          {regularDays.map(day => {
            const isActive = day.day_number === DEMO_ACTIVE;
            const isOpen = day.day_number < DEMO_ACTIVE;
            const isLocked = day.day_number > DEMO_ACTIVE;
            const phase = day.phase;
            const d = new Date(day.date);
            const dd = d.getDate();
            const mm = d.getMonth();

            let promoDisplay = day.promo_value || '';
            if (promoDisplay.includes('100%')) promoDisplay = '100%<br>BESPLATNE<br>OKLADE';
            else if (promoDisplay.includes('CASH')) promoDisplay = 'CASH<br>BACK<br>DAN';

            return (
              <div key={day.day_number} data-dc style={{
                position: 'relative', aspectRatio: '1',
                background: isLocked ? 'rgba(8,14,30,0.9)'
                  : isActive ? 'linear-gradient(145deg,#0f2952,#0d1a33)'
                  : '#111f3a',
                border: isActive ? '2px solid #f5c518'
                  : isLocked ? '1px solid rgba(28,58,101,0.15)'
                  : '1px solid #1c3a65',
                borderRadius: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: isLocked ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 22px rgba(245,197,24,0.2),0 0 44px rgba(245,197,24,0.08),inset 0 0 20px rgba(245,197,24,0.05)' : 'none',
                animation: isActive ? 'activeGlow 2.5s ease-in-out infinite' : undefined,
              }}>
                {!isLocked && (
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%,rgba(26,61,110,0.15) 0%,transparent 70%)' }} />
                )}
                {!isLocked && (
                  <div style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: phaseColors[phase] }} />
                )}
                <span style={{
                  fontFamily: "'Barlow Condensed',sans-serif", fontWeight: isActive ? 700 : 600,
                  fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                  color: isActive ? '#f5c518' : isLocked ? 'rgba(200,212,230,0.2)' : 'rgba(200,212,230,0.55)',
                  position: 'absolute', top: 6, left: 0, right: 0, textAlign: 'center',
                }}>Dan {day.day_number}</span>

                {isLocked ? (
                  <>
                    <span style={{ fontSize: 24, opacity: 0.15 }}>🔒</span>
                    <span style={{
                      fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 500,
                      fontSize: 9, color: 'rgba(200,212,230,0.2)',
                      position: 'absolute', bottom: 5, left: 0, right: 0, textAlign: 'center',
                    }}>{dd}.{mShort[mm]}</span>
                  </>
                ) : (
                  <>
                    <span style={{
                      fontFamily: "'Oswald',sans-serif", fontWeight: 700,
                      fontSize: promoDisplay.includes('<br>') ? 11 : 24,
                      color: isActive ? '#fff' : 'rgba(200,212,230,0.9)',
                      textAlign: 'center', lineHeight: 1.1, textTransform: 'uppercase',
                      letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      position: 'relative', zIndex: 2,
                    }} dangerouslySetInnerHTML={{ __html: promoDisplay }} />
                    <span style={{
                      fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 500,
                      fontSize: 10, color: isActive ? 'rgba(245,197,24,0.5)' : 'rgba(200,212,230,0.4)',
                      position: 'absolute', bottom: 5, left: 0, right: 0, textAlign: 'center',
                    }}>{dd}.{mShort[mm]}</span>
                  </>
                )}

                {isActive && (
                  <span style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    background: '#f5c518', color: '#080e1e',
                    fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                    fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase',
                    padding: '2px 8px', borderRadius: '0 0 6px 6px',
                  }}>DANAS</span>
                )}
              </div>
            );
          })}

          {/* Finale card */}
          <div style={{
            gridColumn: `span ${finaleSpan}`,
            background: 'linear-gradient(135deg,#0d1a33 0%,#0f2952 50%,#0d1a33 100%)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, overflow: 'hidden', padding: '8px 14px',
            border: '2px solid rgba(28,58,101,0.3)', opacity: 0.45, cursor: 'default', position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%,rgba(245,197,24,0.05) 0%,transparent 60%)' }} />
            <span style={{ fontSize: 20, position: 'relative', zIndex: 2 }}>🏟️</span>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, color: 'rgba(200,212,230,0.4)', letterSpacing: 2, fontWeight: 600, textTransform: 'uppercase' }}>
                Dan 39 · 19. srpnja
              </div>
              <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, fontWeight: 700, color: '#f5c518', letterSpacing: 2, textTransform: 'uppercase' }}>
                Finale
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, color: 'rgba(200,212,230,0.25)', letterSpacing: 1 }}>
                MetLife Stadium · New York / New Jersey
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { k: 'gs', l: 'Grupna faza' }, { k: 'r32', l: 'Šesnaestina finala' }, { k: 'r16', l: 'Osmina finala' },
          { k: 'qf', l: 'Četvrtfinale' }, { k: 'sf', l: 'Polufinale' }, { k: 'fin', l: 'Finale' },
        ].map(item => (
          <div key={item.k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8b95a5' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: phaseColors[item.k] }} /> {item.l}
          </div>
        ))}
      </div>

      {/* Rules */}
      <div style={{
        background: 'rgba(15,41,82,0.2)', borderRadius: 14, padding: 24,
        border: '1px solid rgba(28,58,101,0.3)', marginBottom: 20,
      }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 15, fontWeight: 600, color: 'rgba(200,212,230,0.6)', textAlign: 'center', marginBottom: 12, fontStyle: 'italic' }}>
          Pravila promocije "Put do Finala — SP 2026"
        </div>
        <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: 14, color: 'rgba(200,212,230,0.5)', lineHeight: 1.8, textAlign: 'center' }}>
          Promocija <strong style={{ color: '#f5c518', fontWeight: 600 }}>Put do Finala</strong> uključuje 39 dnevnih promocija od <strong style={{ color: '#f5c518' }}>11.06.2026.</strong> do <strong style={{ color: '#f5c518' }}>19.07.2026.</strong><br />
          Svaki dan se otvara jedno polje kalendara s nazivom i detaljima promocije.<br />
          Igrači koji sudjeluju barem <strong style={{ color: '#f5c518' }}>38 od 39 dana</strong> osvajaju dodatnih <strong style={{ color: '#f5c518' }}>39 € besplatnih oklada</strong>!
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '18px 16px 28px', borderTop: '1px solid rgba(28,58,101,0.2)' }}>
        <p style={{ fontSize: 10, color: 'rgba(200,212,230,0.15)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
          Promocija vrijedi od 11.06. do 19.07.2026. Sudjelovanje podliježe općim uvjetima Admiral Bet-a.
          Besplatne oklade nemaju novčanu vrijednost i ne mogu se isplatiti. 18+ | Igrajte odgovorno.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// GENERIC PAGE RENDERER
// ═══════════════════════════════════
function GenericPage({ page }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: "'Oswald',sans-serif", fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
        {page.title}
      </h1>
      <div
        style={{ color: '#c8d4e6', fontSize: 16, lineHeight: 1.8 }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}

// ═══════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════
export default function InfoPage() {
  const params = useParams();
  const slug = params.slug;
  const [page, setPage] = useState(null);
  const [campaignDays, setCampaignDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      // Load page
      const { data: pageData } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!pageData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPage(pageData);

      // If campaign calendar, load days
      if (pageData.template_id === 'kampanja-kalendar') {
        const { data: daysData } = await supabase
          .from('campaign_days')
          .select('*')
          .eq('page_id', pageData.id)
          .order('day_number', { ascending: true });
        setCampaignDays(daysData || []);
      }

      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5a6577' }}>
        Učitavanje...
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#080e1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#5a6577' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 18 }}>Stranica nije pronađena</div>
        <Link href="/admin" style={{ color: '#f5c518', marginTop: 12, fontSize: 14 }}>← Natrag na Admin</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080e1e' }}>
      {/* Back to admin bar */}
      <div style={{ padding: '12px 20px' }}>
        <Link
          href="/admin"
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            color: '#8b95a5', padding: '8px 16px', borderRadius: 8,
            fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          ← Natrag na Admin
        </Link>
      </div>

      {/* Hero banner area for campaigns */}
      {page.template_id === 'kampanja-kalendar' && (
        <div style={{
          position: 'relative', width: '100%', aspectRatio: '16/7', maxHeight: 420, overflow: 'hidden',
          background: 'linear-gradient(135deg,#0a1a35 0%,#0d2548 30%,#162d52 60%,#0a1a35 100%)',
        }}>
          <div style={{ position: 'absolute', top: '20%', left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,197,24,0.08) 0%,transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '10%', right: '20%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle,rgba(100,150,255,0.05) 0%,transparent 70%)' }} />
          {page.hero_image && (
            <img src={page.hero_image} alt={page.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(to bottom,transparent 0%,#080e1e 100%)' }} />
        </div>
      )}

      {/* Render based on template */}
      {page.template_id === 'kampanja-kalendar' ? (
        <div style={{ marginTop: -60 }}>
          <PutDoFinalaCalendar days={campaignDays} />
        </div>
      ) : (
        <GenericPage page={page} />
      )}
    </div>
  );
}
