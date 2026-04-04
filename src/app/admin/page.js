'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pages: 0, campaigns: 0, templates: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [pagesRes, templatesRes] = await Promise.all([
          supabase.from('pages').select('id, type, views, status'),
          supabase.from('templates').select('id'),
        ]);
        
        const pages = pagesRes.data || [];
        const templates = templatesRes.data || [];
        
        setStats({
          pages: pages.length,
          campaigns: pages.filter(p => p.type === 'kampanja').length,
          templates: templates.length,
          views: pages.reduce((sum, p) => sum + (p.views || 0), 0),
        });
      } catch (err) {
        console.error('Error loading stats:', err);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const statCards = [
    { label: 'UKUPNO STRANICA', value: stats.pages, icon: '☰' },
    { label: 'AKTIVNE KAMPANJE', value: stats.campaigns, icon: '⚡' },
    { label: 'PREGLEDI', value: stats.views.toLocaleString('hr-HR'), icon: '◉' },
    { label: 'PREDLOŠCI', value: stats.templates, icon: '❒' },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white font-oswald tracking-wider mb-1">Dashboard</h1>
        <p className="text-sm text-[#8b95a5]">Pregled Admiral CMS sustava</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3.5 mb-7 flex-wrap">
        {statCards.map((s, i) => (
          <div key={i} className="bg-admiral-card rounded-[14px] p-5 border border-white/5 flex-1 min-w-[170px]">
            <div className="flex justify-between mb-2.5">
              <span className="text-[11px] text-[#8b95a5] font-medium tracking-wide">{s.label}</span>
              <span className="text-lg opacity-50">{s.icon}</span>
            </div>
            <div className="text-[26px] font-bold text-white font-oswald">
              {loading ? '...' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Active campaign */}
      <div className="bg-gradient-to-r from-admiral-accent/10 to-admiral-card rounded-2xl p-6 border border-admiral-accent/20 mb-7">
        <div className="inline-flex items-center gap-1.5 bg-admiral-accent/10 border border-admiral-accent/20 px-3 py-1 rounded-md mb-3 text-[11px] text-admiral-accent font-semibold tracking-wider">
          ⚡ AKTIVNA KAMPANJA
        </div>
        <h2 className="text-xl font-bold text-white font-oswald mb-1.5">Put do Finala — FIFA SP 2026</h2>
        <p className="text-sm text-[#8b95a5] mb-4 max-w-lg">
          39 dana, 39 besplatnih oklada. Advent-kalendar promocija za Svjetsko Prvenstvo. Počinje 11. lipnja.
        </p>
        <div className="flex gap-2.5">
          <Link
            href="/info/put-do-finala"
            className="bg-gradient-to-r from-admiral-accent to-[#d4a80f] text-admiral-dark px-5 py-2.5 rounded-[10px] text-[13px] font-bold font-oswald tracking-wider no-underline hover:brightness-110 transition-all"
          >
            POGLEDAJ PREVIEW →
          </Link>
          <Link
            href="/admin/campaigns"
            className="bg-white/5 border border-white/10 text-[#c8d4e6] px-5 py-2.5 rounded-[10px] text-[13px] font-medium no-underline hover:bg-white/10 transition-all"
          >
            Uredi kampanju
          </Link>
        </div>
      </div>

      {/* CMS Comparison */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-red-500/5 rounded-[14px] p-5 border border-red-500/10">
          <div className="text-xs font-bold text-red-400 mb-3 tracking-wider">❌ STARI CMS (Core Aplikacije)</div>
          {['Nema JavaScript podrške', 'Ograničena veličina sadržaja', 'Rigidni predlošci (max 7 dana)', 'Svaka promjena = developer', 'Samo statički HTML+CSS'].map((t, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-[13px] text-[#8b95a5]">
              <span className="text-red-400">✕</span> {t}
            </div>
          ))}
        </div>
        <div className="bg-green-500/5 rounded-[14px] p-5 border border-green-500/10">
          <div className="text-xs font-bold text-admiral-green mb-3 tracking-wider">✅ NOVI CMS (Next.js + Supabase)</div>
          {['Puna podrška za HTML, CSS i JS', 'Neograničena veličina sadržaja', '6+ prilagodljivih predložaka', 'Admin panel za samostalno upravljanje', 'Dinamički sadržaj, SEO, animacije'].map((t, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-[13px] text-[#c8d4e6]">
              <span className="text-admiral-green">✓</span> {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
