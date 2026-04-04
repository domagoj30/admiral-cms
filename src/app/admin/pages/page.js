'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const typeIcons = { kampanja: '⚡', promocija: '🎯', info: '📄' };
const statusStyles = {
  published: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Objavljeno' },
  draft: { bg: 'bg-admiral-accent/10', text: 'text-admiral-accent', label: 'Skica' },
  scheduled: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Zakazano' },
};

export default function PagesPage() {
  const [pages, setPages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '', type: 'info', template_id: 'info-stranica' });
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadPages();
    loadTemplates();
  }, []);

  async function loadPages() {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false });
    setPages(data || []);
    setLoading(false);
  }

  async function loadTemplates() {
    const { data } = await supabase.from('templates').select('*');
    setTemplates(data || []);
  }

  async function createPage(e) {
    e.preventDefault();
    const { error } = await supabase.from('pages').insert([{
      ...newPage,
      status: 'draft',
      content: '<h1>' + newPage.title + '</h1><p>Sadržaj stranice...</p>',
    }]);
    if (!error) {
      setShowForm(false);
      setNewPage({ title: '', slug: '', type: 'info', template_id: 'info-stranica' });
      loadPages();
    }
  }

  async function deletePage(id) {
    if (!confirm('Obrisati stranicu?')) return;
    await supabase.from('pages').delete().eq('id', id);
    loadPages();
  }

  async function toggleStatus(page) {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    await supabase.from('pages').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', page.id);
    loadPages();
  }

  const filtered = filter === 'all' ? pages : pages.filter(p => p.type === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white font-oswald tracking-wider mb-1">Stranice</h1>
          <p className="text-sm text-[#8b95a5]">Upravljanje svim stranicama ({pages.length})</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-admiral-accent to-[#d4a80f] text-admiral-dark px-5 py-2.5 rounded-[10px] text-[13px] font-bold font-oswald tracking-wider border-none cursor-pointer hover:brightness-110 transition-all"
        >
          + NOVA STRANICA
        </button>
      </div>

      {/* New page form */}
      {showForm && (
        <form onSubmit={createPage} className="bg-admiral-card rounded-[14px] p-5 border border-admiral-accent/20 mb-5">
          <div className="grid grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Naslov stranice"
              value={newPage.title}
              onChange={e => setNewPage({ ...newPage, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '') })}
              className="bg-admiral-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a6577] outline-none focus:border-admiral-accent/50"
              required
            />
            <input
              type="text"
              placeholder="slug (auto)"
              value={newPage.slug}
              onChange={e => setNewPage({ ...newPage, slug: e.target.value })}
              className="bg-admiral-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a6577] outline-none focus:border-admiral-accent/50"
              required
            />
            <select
              value={newPage.type}
              onChange={e => setNewPage({ ...newPage, type: e.target.value })}
              className="bg-admiral-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
            >
              <option value="info">Info</option>
              <option value="promocija">Promocija</option>
              <option value="kampanja">Kampanja</option>
            </select>
            <button
              type="submit"
              className="bg-admiral-accent text-admiral-dark rounded-lg px-4 py-2 text-sm font-bold cursor-pointer hover:brightness-110"
            >
              Kreiraj
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-1.5 mb-4">
        {[
          { id: 'all', label: 'Sve' },
          { id: 'kampanja', label: '⚡ Kampanje' },
          { id: 'promocija', label: '🎯 Promocije' },
          { id: 'info', label: '📄 Info' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-all ${
              filter === f.id
                ? 'bg-admiral-accent/10 border-admiral-accent/20 text-admiral-accent'
                : 'bg-white/[0.03] border-white/5 text-[#8b95a5] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-admiral-card rounded-[14px] border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_130px_90px_80px_60px] px-4 py-2.5 border-b border-white/5 text-[10px] font-semibold text-[#5a6577] tracking-wide">
          <span>STRANICA</span><span>STATUS</span><span>PREDLOŽAK</span><span>AŽURIRANO</span><span className="text-right">PREGLEDI</span><span></span>
        </div>
        {loading ? (
          <div className="px-4 py-8 text-center text-[#5a6577]">Učitavanje...</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#5a6577]">Nema stranica</div>
        ) : (
          filtered.map(page => {
            const s = statusStyles[page.status] || statusStyles.draft;
            return (
              <div key={page.id} className="grid grid-cols-[1fr_100px_130px_90px_80px_60px] items-center px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{typeIcons[page.type] || '📄'}</span>
                  <div>
                    <div className="text-[13px] font-semibold text-white">{page.title}</div>
                    <Link href={`/info/${page.slug}`} className="text-[11px] text-[#5a6577] hover:text-admiral-accent no-underline">
                      /info/{page.slug}
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(page)}
                  className={`text-[10px] font-semibold ${s.bg} ${s.text} px-2 py-0.5 rounded cursor-pointer border-none`}
                >
                  {s.label}
                </button>
                <span className="text-xs text-[#8b95a5]">{page.template_id}</span>
                <span className="text-xs text-[#8b95a5]">
                  {new Date(page.updated_at).toLocaleDateString('hr-HR')}
                </span>
                <span className="text-xs text-[#8b95a5] text-right">
                  {page.views > 0 ? page.views.toLocaleString('hr-HR') : '—'}
                </span>
                <button
                  onClick={() => deletePage(page.id)}
                  className="text-[#5a6577] hover:text-red-400 cursor-pointer border-none bg-transparent text-sm transition-colors"
                  title="Obriši"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
