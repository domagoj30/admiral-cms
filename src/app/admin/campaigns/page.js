'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const phaseColors = {
  gs: '#00c853', r32: '#26A69A', r16: '#4990e1',
  qf: '#1a3d6e', sf: '#f5c518', tp: '#ff2e00', fin: '#f5c518',
};
const phaseNames = {
  gs: 'Grupna faza', r32: 'Šesnaestina finala', r16: 'Osmina finala',
  qf: 'Četvrtfinale', sf: 'Polufinale', tp: '3. mjesto', fin: 'Finale',
};

export default function CampaignsPage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('campaign_days')
        .select('*')
        .order('day_number', { ascending: true });
      setDays(data || []);
      setLoading(false);
    }
    load();
  }, []);

  function shortPromo(val) {
    if (!val) return '?';
    if (val.includes('FINALE')) return '🏆';
    if (val.includes('100%')) return '100%';
    if (val.includes('CASHBACK') || val.includes('CASH')) return 'CB';
    return val;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-oswald tracking-wider mb-1">Kampanje</h1>
          <p className="text-sm text-[#8b95a5]">Upravljanje kampanjom "Put do Finala"</p>
        </div>
        <Link
          href="/info/put-do-finala"
          className="bg-gradient-to-r from-admiral-accent to-[#d4a80f] text-admiral-dark px-5 py-2.5 rounded-[10px] text-[13px] font-bold font-oswald tracking-wider no-underline hover:brightness-110 transition-all"
        >
          OTVORI PREVIEW →
        </Link>
      </div>

      {/* Campaign info */}
      <div className="bg-admiral-card rounded-[14px] p-5 border border-white/5 mb-4">
        <div className="grid grid-cols-4 gap-4">
          {[
            { l: 'Naziv', v: 'Put do Finala — SP 2026' },
            { l: 'Trajanje', v: '11.06. — 19.07.2026.' },
            { l: 'Ukupno dana', v: `${days.length} dana` },
            { l: 'Status', v: 'Spremno za lansiranje' },
          ].map((item, i) => (
            <div key={i}>
              <div className="text-[10px] text-[#5a6577] mb-0.5 font-medium tracking-wide">{item.l}</div>
              <div className="text-sm text-white font-semibold">{item.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Day grid */}
      <div className="bg-admiral-card rounded-[14px] p-4 border border-white/5">
        <div className="text-[13px] font-semibold text-white mb-3">Dnevne promocije — pregled i upravljanje</div>
        
        {loading ? (
          <div className="text-[#5a6577] py-4 text-center">Učitavanje iz baze...</div>
        ) : (
          <>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
              {days.map(day => {
                const color = phaseColors[day.phase] || '#f5c518';
                const short = shortPromo(day.promo_value);
                return (
                  <div
                    key={day.day_number}
                    className="aspect-square rounded-md flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{
                      background: color + '18',
                      border: `1px solid ${color}44`,
                    }}
                  >
                    <span className="text-[7px] font-semibold text-[#5a6577]">D{day.day_number}</span>
                    <span
                      className="font-bold text-center leading-tight"
                      style={{ color, fontSize: short.length > 3 ? 7 : 10 }}
                    >
                      {short}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Phase legend */}
            <div className="flex gap-3 mt-3 flex-wrap">
              {Object.entries(phaseNames).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1 text-[10px] text-[#8b95a5]">
                  <div className="w-[7px] h-[7px] rounded-sm" style={{ background: phaseColors[k] }} />
                  {v}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Data source note */}
      <div className="mt-4 p-4 rounded-xl bg-admiral-accent/[0.04] border border-admiral-accent/20 text-[13px] text-[#8b95a5] leading-relaxed">
        <strong className="text-admiral-accent">Live podaci:</strong> Svi dani se čitaju iz Supabase baze u realnom vremenu.
        Promjene u bazi odmah se reflektiraju na stranici — bez rebuilda, bez developera.
      </div>
    </div>
  );
}
