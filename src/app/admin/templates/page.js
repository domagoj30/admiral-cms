'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('templates').select('*');
      setTemplates(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white font-oswald tracking-wider mb-1">Predlošci</h1>
        <p className="text-sm text-[#8b95a5]">Modularni predlošci — bez ograničenja</p>
      </div>

      {loading ? (
        <div className="text-[#5a6577]">Učitavanje...</div>
      ) : (
        <div className="grid grid-cols-3 gap-3.5">
          {templates.map(t => (
            <div
              key={t.id}
              className="bg-admiral-card rounded-[14px] p-5 border border-white/5 cursor-pointer transition-all duration-300 hover:border-admiral-accent/20 hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{t.icon}</div>
              <div className="text-[15px] font-bold text-white font-oswald mb-1.5">{t.name}</div>
              <div className="text-xs text-[#8b95a5] leading-relaxed mb-3">{t.description}</div>
              <div className="text-[10px] text-admiral-accent bg-admiral-accent/10 px-2 py-0.5 rounded inline-block font-medium">
                {t.supports}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 p-4 rounded-xl bg-admiral-accent/[0.04] border border-admiral-accent/20 text-[13px] text-[#8b95a5] leading-relaxed">
        <strong className="text-admiral-accent">Za prezentaciju:</strong> Stari CMS ima samo 1 predložak
        ("Obični tekst, plava pozadina") s ograničenim HTML+CSS bez JavaScripta.
        Novi sustav nudi {templates.length}+ specijaliziranih predložaka.
      </div>
    </div>
  );
}
