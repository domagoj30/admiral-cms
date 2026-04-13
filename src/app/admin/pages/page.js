'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ promos: 0, pages: 0, published: 0, drafts: 0, templates: 0, views: 0 });
  const [recentPromos, setRecentPromos] = useState([]);
  const [recentPages, setRecentPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [promosRes, pagesRes, templatesRes, promoPages] = await Promise.all([
          supabase.from('promotions').select('*').order('updated_at', { ascending: false }),
          supabase.from('pages').select('id, title, slug, type, status, views, updated_at').order('updated_at', { ascending: false }),
          supabase.from('templates').select('id'),
          supabase.from('promo_pages').select('*').order('created_at', { ascending: false }),
        ]);

        const promos = promosRes.data || [];
        const pages = pagesRes.data || [];
        const templates = templatesRes.data || [];
        const pp = promoPages.data || [];

        setStats({
          promos: promos.length,
          pages: pages.length + pp.length,
          published: promos.filter(p => p.status === 'published').length,
          drafts: promos.filter(p => p.status === 'draft').length,
          templates: templates.length,
          views: pages.reduce((sum, p) => sum + (p.views || 0), 0),
        });

        setRecentPromos(promos.slice(0, 5));
        setRecentPages(pages.slice(0, 3));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'upravo';
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString('hr-HR');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white font-oswald tracking-wider mb-1">Dashboard</h1>
          <p className="text-sm text-[#8b95a5]">
            {loading ? 'Učitavanje...' : `${stats.promos} promocija · ${stats.pages} stranica`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/editor"
            className="bg-gradient-to-r from-admiral-accent to-[#d4a80f] text-admiral-dark px-4 py-2 rounded-[10px] text-[12px] font-bold font-oswald tracking-wider no-underline hover:brightness-110 transition-all"
          >
            ✦ VISUAL EDITOR
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'PROMOCIJE', value: stats.promos, icon: '🎯', color: '#f5c518', accent: 'rgba(245,197,24,0.08)' },
          { label: 'OBJAVLJENE', value: stats.published, icon: '✓', color: '#00c853', accent: 'rgba(0,200,83,0.08)' },
          { label: 'SKICE', value: stats.drafts, icon: '✎', color: '#f59e0b', accent: 'rgba(245,158,11,0.08)' },
          { label: 'STRANICE', value: stats.pages, icon: '☰', color: '#4a9eff', accent: 'rgba(74,158,255,0.08)' },
        ].map((s, i) => (
          <div key={i} className="bg-admiral-card rounded-[12px] p-4 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: s.color, opacity: 0.6 }} />
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-[#5a6577] font-semibold tracking-wider">{s.label}</span>
              <span className="text-sm w-6 h-6 rounded-md flex items-center justify-center" style={{ background: s.accent, color: s.color }}>{s.icon}</span>
            </div>
            <div className="text-[28px] font-bold text-white font-oswald leading-none">
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-4">

        {/* Recent Promotions — 2/3 width */}
        <div className="col-span-2 bg-admiral-card rounded-[14px] border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center px-5 py-3.5 border-b border-white/5">
            <span className="text-[11px] font-bold text-[#8b95a5] tracking-wider">POSLJEDNJE PROMOCIJE</span>
            <Link href="/editor" className="text-[10px] text-admiral-accent no-underline hover:underline font-semibold">
              Sve promocije →
            </Link>
          </div>
          {loading ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#5a6577]">Učitavanje...</div>
          ) : recentPromos.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <div className="text-[#5a6577] text-[13px] mb-3">Nema promocija</div>
              <Link href="/editor" className="text-admiral-accent text-[12px] no-underline hover:underline font-semibold">
                Kreiraj prvu promociju →
              </Link>
            </div>
          ) : (
            recentPromos.map((p, i) => (
              <Link key={p.id} href="/editor" className="no-underline">
                <div className={`flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer ${i < recentPromos.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="w-9 h-9 rounded-[8px] flex-shrink-0 flex items-center justify-center text-base" style={{ background: p.gradient || 'linear-gradient(135deg,#0d1540,#1a2b6e)' }}>
                    {p.emoji || '🎯'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">{p.title}</div>
                    <div className="text-[10px] text-[#5a6577] mt-0.5">
                      {p.category === 'casino' ? 'Casino' : 'Klađenje'} · {((p.blocks && typeof p.blocks === 'object') ? (Array.isArray(p.blocks) ? p.blocks.length : 0) : 0)} blokova
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] text-[#5a6577]">{timeAgo(p.updated_at)}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {p.status === 'published' ? 'Live' : 'Skica'}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Right Column — Quick Actions + Info */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-admiral-card rounded-[14px] border border-white/5 p-4">
            <span className="text-[10px] font-bold text-[#5a6577] tracking-wider block mb-3">BRZE AKCIJE</span>
            <div className="space-y-2">
              <Link href="/editor" className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[8px] bg-admiral-accent/8 border border-admiral-accent/15 no-underline hover:bg-admiral-accent/12 transition-colors">
                <span className="text-sm">✦</span>
                <span className="text-[12px] font-semibold text-admiral-accent">Nova promocija</span>
              </Link>
              <Link href="/admin/pages" className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[8px] bg-white/[0.02] border border-white/5 no-underline hover:bg-white/[0.04] transition-colors">
                <span className="text-sm">☰</span>
                <span className="text-[12px] font-medium text-[#c8d4e6]">Upravljaj stranicama</span>
              </Link>
              <Link href="/admin/campaigns" className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[8px] bg-white/[0.02] border border-white/5 no-underline hover:bg-white/[0.04] transition-colors">
                <span className="text-sm">⚡</span>
                <span className="text-[12px] font-medium text-[#c8d4e6]">Kampanje</span>
              </Link>
              <Link href="/admin/templates" className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[8px] bg-white/[0.02] border border-white/5 no-underline hover:bg-white/[0.04] transition-colors">
                <span className="text-sm">❒</span>
                <span className="text-[12px] font-medium text-[#c8d4e6]">Predlošci</span>
              </Link>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-admiral-card rounded-[14px] border border-white/5 p-4">
            <span className="text-[10px] font-bold text-[#5a6577] tracking-wider block mb-3">SUSTAV</span>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#8b95a5]">Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[11px] text-green-400 font-medium">Aktivan</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#8b95a5]">Predlošci</span>
                <span className="text-[11px] text-white font-medium">{loading ? '—' : stats.templates}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#8b95a5]">Baza</span>
                <span className="text-[11px] text-[#c8d4e6] font-medium">Supabase</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#8b95a5]">Hosting</span>
                <span className="text-[11px] text-[#c8d4e6] font-medium">Vercel</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#8b95a5]">Verzija</span>
                <span className="text-[11px] text-[#c8d4e6] font-medium">v5.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
