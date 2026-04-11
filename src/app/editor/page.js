"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ═══════════════════════════════════════════════════════════
// ADMIRAL CMS v5 — ULTIMATE EDITION
// Template Picker • Full Block Editing • Scroll Reveal
// Promo Settings • Status Toggle • Delete • Search
// ═══════════════════════════════════════════════════════════

// ── Templates ──
const TEMPLATES = [
  { id: "bonus", name: "Bonus Landing", icon: "🎁", desc: "Bonus s iznosom i uvjetima", color: "#22c55e",
    blocks: [{ type: "hero", data: { title: "NAZIV BONUSA", subtitle: "Podnaslov" } }, { type: "amount", data: { amount: "100", suffix: " €", label: "Bonus", desc: "Opis" } }, { type: "cta", data: { text: "PREUZMI BONUS" } }, { type: "rules", data: { text: "Uvjeti promocije..." } }] },
  { id: "sport", name: "Sportski Event", icon: "⚽", desc: "Promocija za sportske događaje", color: "#4a9eff",
    blocks: [{ type: "hero", data: { title: "SPORTSKA PROMOCIJA", subtitle: "Opis eventa" } }, { type: "steps", data: { items: [{ icon: "⚽", title: "KORAK 1", text: "Opis" }, { icon: "🎁", title: "KORAK 2", text: "Opis" }] } }, { type: "table", data: { headers: ["Uvjet", "Nagrada"], rows: [["Uvjet 1", "Nagrada 1"], ["Uvjet 2", "Nagrada 2"]] } }, { type: "cta", data: { text: "KLADI SE" } }] },
  { id: "casino", name: "Casino Promo", icon: "🎰", desc: "Casino bonus ili turnir", color: "#a855f7",
    blocks: [{ type: "hero", data: { title: "CASINO PROMOCIJA", subtitle: "Opis" } }, { type: "amount", data: { amount: "500", suffix: " €", label: "Nagradni fond", desc: "Za top igrače" } }, { type: "countdown", data: { label: "Do kraja promocije" } }, { type: "cta", data: { text: "IGRAJ SADA" } }] },
  { id: "info", name: "Info stranica", icon: "📄", desc: "Pravila, uvjeti, FAQ", color: "#6b7280",
    blocks: [{ type: "hero", data: { title: "NASLOV", subtitle: "" } }, { type: "text", data: { text: "Sadržaj informativne stranice..." } }, { type: "checks", data: { items: ["Stavka 1", "Stavka 2", "Stavka 3"] } }] },
  { id: "empty", name: "Prazna stranica", icon: "📝", desc: "Kreni od nule", color: "#475569", blocks: [] },
];

// ── Block types ──
const BT = [
  { type: "hero", label: "Hero Banner", icon: "🖼️", color: "#f59e0b" },
  { type: "text", label: "Tekst", icon: "📝", color: "#3b82f6" },
  { type: "amount", label: "Promo iznos", icon: "💰", color: "#22c55e" },
  { type: "cta", label: "Gumb (CTA)", icon: "🔘", color: "#4a9eff" },
  { type: "checks", label: "Checklist", icon: "✅", color: "#10b981" },
  { type: "steps", label: "Koraci", icon: "👣", color: "#f97316" },
  { type: "table", label: "Tablica", icon: "📊", color: "#8b5cf6" },
  { type: "countdown", label: "Odbrojavanje", icon: "⏰", color: "#ef4444" },
  { type: "rules", label: "Pravila", icon: "📜", color: "#6b7280" },
  { type: "divider", label: "Razdjelnik", icon: "➖", color: "#475569" },
];

const EMOJIS = ["🎰", "🎁", "⚽", "🎯", "⭐", "🏆", "💰", "👑", "⚡", "🔄", "🎲", "🃏", "🎮", "🏅", "💎", "🔥"];
const GRADS = ["linear-gradient(135deg,#0a3520,#1a5a35)", "linear-gradient(135deg,#0d1540,#1a2b6e)", "linear-gradient(135deg,#1a0a30,#2d1b69)", "linear-gradient(135deg,#3a2a00,#5a4a10)", "linear-gradient(135deg,#0a1a3a,#1a3a6a)", "linear-gradient(135deg,#2a1a00,#5a3a10)", "linear-gradient(135deg,#0a2a2a,#1a4a4a)", "linear-gradient(135deg,#2a0a2a,#4a1a4a)"];

// ── Pages (uvjeti, pravila, info stranice) ──
const initPages = [
  { id: "p1", title: "Uvjeti Free Bonusi", slug: "uvjeti-free-bonusi", content: "Promocija vrijedi za nove igrače koji se registriraju na Admiral Bet platformi.\n\n• 100 besplatnih vrtnji dodjeljuje se automatski nakon registracije\n• 10 € bonusa aktivira se uz prvu uplatu\n• 10 € besplatnih oklada može se koristiti na sportsko klađenje\n• 100% bonus dobrodošlice do 1.000 € uz prvu uplatu\n\nMinimalna uplata: 10 €\nBonus mora biti preokrenut 35x prije isplate.\nPromocija traje do opoziva." },
  { id: "p2", title: "Uvjeti Bonus Dobrodošlice", slug: "uvjeti-bonus-dobrodoslice", content: "Casino bonus dobrodošlice od 100% do 1.000 €.\n\nUvjeti:\n• Minimalna uplata: 10 €\n• Potrebno prihvatiti promociju prije prve uplate\n• Vrijedi za uplate karticom (Visa, Mastercard, Maestro), uplatnicom i Poslovnica+\n• Bonus se mora preokreti 35x\n• Maksimalna oklada s bonusom: 5 €" },
  { id: "p3", title: "Uvjeti Tjedna Misija", slug: "uvjeti-tjedna-misija", content: "Promocija traje od ponedjeljka do nedjelje.\n\nUvjeti za sudjelovanje:\n• Dnevno uplati barem jedan sportski listić\n• Minimalno 4 para s minimalnim tečajem 1.40 po paru\n• Minimalna uplata 5 €\n\nNagrade:\n• 3-4 dana: 5 € besplatnih oklada\n• 5-6 dana: 10 € besplatnih oklada\n• 7 dana: 15 € besplatnih oklada\n\nBesplatne oklade dodjeljuju se ponedjeljkom do 12:00h." },
  { id: "p4", title: "Opća pravila promocija", slug: "opca-pravila", content: "Admiral Bet zadržava pravo da određene korisničke račune isključi iz promocije, promijeni uvjete, ukine ili na bilo koji drugi način izmijeni promociju u bilo kojem trenutku.\n\nSva ostala pravila sadržana su u uputama za odigravanje besplatnih oklada i općim uvjetima korištenja." },
];

const initPromos = [
  { id: 1, t: "FREE BONUSI", s: "free-bonusi", c: "casino", status: "published", badge: "HOT", grad: GRADS[0], emoji: "🎰", d: "100 besplatnih vrtnji + 10 € bonusa + 10 € oklada BEZ UPLATE!", cta: "Više", blocks: [{ id: "b1", type: "hero", data: { title: "FREE BONUSI", subtitle: "samo za tebe" } }, { id: "b2", type: "amount", data: { amount: "1000", label: "Bonus dobrodošlice", desc: "100% na prvu uplatu", suffix: " €" } }, { id: "b3", type: "checks", data: { items: ["100 besplatnih vrtnji", "10 € bonusa", "10 € besplatnih oklada", "100% bonus do 1.000 €"] } }, { id: "b4", type: "cta", data: { text: "REGISTRIRAJ SE", detailsMode: "page", detailsPageId: "p1" } }, { id: "b5", type: "rules", data: { text: "Promocija vrijedi za nove igrače." } }] },
  { id: 2, t: "100% BONUS DOBRODOŠLICE", s: "bonus-dobrodoslice", c: "casino", status: "published", badge: "NOVO", grad: GRADS[1], emoji: "🎁", d: "Do 1.000 € bonusa. Min. uplata 10 €.", cta: "Prihvaćam", blocks: [{ id: "b6", type: "hero", data: { title: "BONUS DOBRODOŠLICE", subtitle: "100% do 1.000 €" } }, { id: "b7", type: "amount", data: { amount: "1000", label: "Casino bonus", desc: "Min. uplata 10 €", suffix: " €" } }, { id: "b8", type: "table", data: { headers: ["Uplata", "Bonus", "Ukupno"], rows: [["10 €", "10 €", "20 €"], ["100 €", "100 €", "200 €"], ["1.000 €", "1.000 €", "2.000 €"]] } }, { id: "b9", type: "cta", data: { text: "PRIHVAĆAM", detailsMode: "page", detailsPageId: "p2" } }] },
  { id: 3, t: "SPORT BONUS", s: "sport-bonus", c: "kladenje", status: "published", grad: GRADS[2], emoji: "⚽", d: "Besplatne oklade dobrodošlice!", cta: "Više", blocks: [{ id: "b10", type: "checks", data: { items: ["Besplatne oklade", "Casino paket do 1.000 €", "Pobjednik od starta!"] } }, { id: "b11", type: "cta", data: { text: "REGISTRIRAJ SE", detailsMode: "inline", detailsText: "Promocija vrijedi za nove igrače.\n\nBesplatne oklade dobrodošlice dodjeljuju se nakon registracije i prve uplate.\n\nCasino paket dobrodošlice od 100% do 1.000 € aktivira se uz prvu uplatu.\n\nMinimalna uplata: 10 €. Bonus se mora preokreti 35x prije isplate." } }] },
  { id: 4, t: "TJEDNA MISIJA", s: "tjedna-misija", c: "kladenje", status: "published", grad: GRADS[3], emoji: "🎯", d: "Min. 4 para dnevno — osvoji oklade!", cta: "Više", blocks: [{ id: "b12", type: "steps", data: { items: [{ icon: "⚽", title: "KLADI SE", text: "Min. 4 para, tečaj 1.40, uplata 5 €" }, { icon: "🎁", title: "OSVOJI", text: "Besplatne oklade ponedjeljak!" }] } }, { id: "b13", type: "table", data: { headers: ["BROJ DANA", "NAGRADA"], rows: [["3-4", "5 €"], ["5-6", "10 €"], ["7", "15 €"]] } }, { id: "b14", type: "cta", data: { text: "KLADI SE SADA", detailsMode: "page", detailsPageId: "p3" } }] },
  { id: 5, t: "SUPER NAGRADNI PAR", s: "super-par", c: "kladenje", status: "published", grad: GRADS[4], emoji: "⭐", d: "Do 50 € besplatnih oklada!", cta: "Više", blocks: [{ id: "b15", type: "amount", data: { amount: "50", label: "Besplatne oklade", desc: "Za kvalificirani listić", suffix: " €" } }, { id: "b15c", type: "cta", data: { text: "ODIGRAJ", detailsMode: "inline", detailsText: "U promociji sudjeluje prvi uplaćeni sportski listić s uplatom od 10 € ili više, na kojem se nalazi Super nagradni par te minimalno 4 para s ukupnim tečajem 5,00 ili većim." } }] },
  { id: 6, t: "TJEDNI TURNIR", s: "tjedni-turnir", c: "casino", status: "published", grad: GRADS[5], emoji: "🏆", d: "8.500 € za 200 igrača!", cta: "Više", blocks: [{ id: "b16", type: "amount", data: { amount: "8500", label: "Tjedni fond", desc: "200 igrača", suffix: " €" } }, { id: "b17", type: "countdown", data: { label: "Do kraja turnira" } }, { id: "b17c", type: "cta", data: { text: "IGRAJ SADA", detailsMode: "page", detailsPageId: "p4" } }] },
  { id: 7, t: "CASHBACK 15%", s: "cashback-15", c: "casino", status: "draft", grad: GRADS[6], emoji: "💰", d: "15% Cashback do 300 €!", cta: "Više", blocks: [] },
  { id: 8, t: "ADMIRAL PREDNOST", s: "admiral-prednost", c: "kladenje", status: "published", grad: GRADS[7], emoji: "⚡", d: "2 gola razlike = dobitna oklada!", cta: "Više", blocks: [{ id: "b18", type: "cta", data: { text: "KLADI SE", detailsMode: "inline", detailsText: "Promocija traje od 30.10.2025. do opoziva.\n\nOdnosi se na nogometne utakmice iz Hrvatske 1. lige, Liga petice, Lige prvaka, Europske lige i Konferencijske lige.\n\nOklada na pobjedu momčadi koja povede s 2 gola razlike odmah je dobitna!" } }] },
];

// ── Scroll Reveal ──
function Rv({ children, delay = 0 }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(20px)", transition: "opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1)", transitionDelay: delay + "s" }}>{children}</div>;
}

// ── Floating Particles ──
function Particles({ n = 8, color = "rgba(245,197,24,.2)" }) {
  const particles = useRef(Array.from({ length: n }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 3 + 1, d: Math.random() * 6 + 4, dl: Math.random() * 4
  }))).current;
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    {particles.map((p, i) => <div key={i} style={{
      position: "absolute", left: p.x + "%", top: p.y + "%",
      width: p.s, height: p.s, borderRadius: "50%", background: color,
      animation: "particleFloat " + p.d + "s ease-in-out infinite alternate",
      animationDelay: p.dl + "s",
    }} />)}
  </div>;
}

// ── Animated counter ──
function AC({ v, suffix }) {
  const [c, setC] = useState(0);
  const num = parseInt(String(v).replace(/[^0-9]/g, "")) || 0;
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);
  useEffect(() => { if (!vis) return; let s = 0; const step = num / 100; const t = setInterval(() => { s += step; if (s >= num) { setC(num); clearInterval(t); } else { setC(Math.floor(s)); } }, 16); return () => clearInterval(t); }, [vis, num]);
  return <span ref={ref}>{c.toLocaleString()}{suffix || ""}</span>;
}

function CD({ label }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => { const tgt = Date.now() + 259200000 + 50400000; const tick = () => { const df = Math.max(0, tgt - Date.now()); setT({ d: Math.floor(df / 86400000), h: Math.floor((df % 86400000) / 3600000), m: Math.floor((df % 3600000) / 60000), s: Math.floor((df % 60000) / 1000) }); }; tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  return (
    <div style={{ padding: "24px 18px", textAlign: "center" }}>
      {label && <div style={{ fontSize: 10, color: "#8d99b0", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700 }}>{label}</div>}
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {[{ v: t.d, l: "DANA" }, { v: t.h, l: "SATI" }, { v: t.m, l: "MIN" }, { v: t.s, l: "SEK" }].map((x, i) => (
          <div key={i} style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.2) 100%)", borderRadius: 12, padding: "14px 16px", minWidth: 58, border: "1px solid rgba(245,197,24,.08)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(245,197,24,.25), transparent)" }} />
            <div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 28, fontWeight: 800, color: "#f5c518", lineHeight: 1 }}>{String(x.v).padStart(2, "0")}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)", marginTop: 6, letterSpacing: "0.12em", fontWeight: 700 }}>{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Block Renderer — Premium Visual Quality ──
function RB({ block }) {
  const d = block.data || {};
  const [showDetails, setShowDetails] = useState(false);

  if (block.type === "hero") return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: d.imageUrl ? 200 : 140 }}>
      {d.imageUrl && <img src={d.imageUrl} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />}
      <div style={{ background: d.imageUrl ? "linear-gradient(to top, rgba(6,9,26,.95) 10%, rgba(6,9,26,.4) 60%, transparent)" : "linear-gradient(135deg, rgba(245,197,24,.04) 0%, rgba(74,158,255,.04) 100%)", padding: d.imageUrl ? "40px 20px 24px" : "44px 20px", textAlign: "center", position: d.imageUrl ? "absolute" : "relative", bottom: 0, left: 0, right: 0 }}>
        <div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 26, fontWeight: 900, letterSpacing: "0.01em", textShadow: "0 2px 20px rgba(0,0,0,.5)", lineHeight: 1.2 }}>{d.title || "Naslov"}</div>
        {d.subtitle && <div style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginTop: 8, fontWeight: 500 }}>{d.subtitle}</div>}
        <div style={{ width: 40, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #f5c518, rgba(245,197,24,.2))", margin: "14px auto 0" }} />
      </div>
    </div>
  );

  if (block.type === "text") return (
    <div style={{ padding: "18px 20px", fontSize: 14, color: "rgba(255,255,255,.65)", lineHeight: 1.8, letterSpacing: "0.01em" }}>
      {d.text || "Tekst..."}
    </div>
  );

  if (block.type === "amount") return (
    <div style={{ textAlign: "center", padding: "32px 20px", borderRadius: 20, background: "linear-gradient(160deg, rgba(245,197,24,.08) 0%, rgba(245,197,24,.02) 50%, rgba(74,158,255,.03) 100%)", border: "1px solid rgba(245,197,24,.1)", margin: "14px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, background: "radial-gradient(circle, rgba(245,197,24,.1) 0%, transparent 50%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -20, right: -20, width: 120, height: 120, background: "radial-gradient(circle, rgba(74,158,255,.06) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 48, fontWeight: 800, color: "#f5c518", lineHeight: 1, position: "relative", letterSpacing: "-0.02em" }}>
        <AC v={d.amount || "100"} suffix={d.suffix || ""} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 10, position: "relative" }}>{d.label || ""}</div>
      <div style={{ fontSize: 12, color: "#8d99b0", marginTop: 4, position: "relative" }}>{d.desc || ""}</div>
    </div>
  );

  if (block.type === "cta") {
    const linkedPage = (block.data?.detailsPageId && block._pages) ? block._pages.find(pg => pg.id === block.data.detailsPageId) : null;
    const hasDetails = d.detailsText || d.detailsUrl || linkedPage;
    return (
      <div style={{ padding: "20px 18px", textAlign: "center" }}>
        <button style={{
          background: "linear-gradient(135deg, #4a9eff 0%, #2d7ad6 100%)",
          color: "#fff", border: "none", padding: "16px 40px", borderRadius: 12,
          fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          width: "100%", maxWidth: 360, letterSpacing: "0.04em",
          boxShadow: "0 6px 24px rgba(74,158,255,.3), inset 0 1px 0 rgba(255,255,255,.15)",
          textTransform: "uppercase",
        }}>{d.text || "KLIKNI"}</button>
        <div onClick={e => { e.stopPropagation(); if (hasDetails) setShowDetails(!showDetails); }} style={{ fontSize: 11, color: hasDetails ? "#4a9eff" : "#4a5670", marginTop: 12, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
          Više detalja i uvjeti promocije {hasDetails && <span style={{ fontSize: 8, transition: "transform .2s", transform: showDetails ? "rotate(180deg)" : "none" }}>{"▼"}</span>}
        </div>
        {showDetails && (d.detailsText || linkedPage) && (
          <div style={{ marginTop: 12, padding: "18px", borderRadius: 14, background: "linear-gradient(135deg, rgba(255,255,255,.03), rgba(0,0,0,.1))", border: "1px solid rgba(255,255,255,.05)", textAlign: "left", animation: "fadeIn .3s" }}>
            {linkedPage && <div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 10, color: "#f5c518" }}>{linkedPage.title}</div>}
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{linkedPage ? linkedPage.content : d.detailsText}</div>
          </div>
        )}
        {showDetails && d.detailsUrl && !d.detailsText && !linkedPage && (
          <div style={{ marginTop: 12, padding: "14px", borderRadius: 12, background: "rgba(0,0,0,.15)", border: "1px solid rgba(255,255,255,.05)", animation: "fadeIn .3s" }}>
            <div style={{ fontSize: 12, color: "#4a9eff" }}>{"🔗 "}{d.detailsUrl}</div>
          </div>
        )}
      </div>
    );
  }

  if (block.type === "checks") return (
    <div style={{ padding: "14px 20px" }}>
      {(d.items || []).map((x, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "10px 14px", background: "rgba(34,197,94,.04)", borderRadius: 10, border: "1px solid rgba(34,197,94,.08)" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,197,94,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{"✓"}</div>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,.85)" }}>{x}</span>
        </div>
      ))}
    </div>
  );

  if (block.type === "steps") return (
    <div style={{ padding: "14px 18px" }}>
      {(d.items || []).map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 14, padding: "16px", marginBottom: 8, background: "linear-gradient(135deg, rgba(245,197,24,.03) 0%, rgba(0,0,0,.1) 100%)", borderRadius: 14, border: "1px solid rgba(245,197,24,.08)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "linear-gradient(to bottom, #f5c518, rgba(245,197,24,.1))", borderRadius: "0 2px 2px 0" }} />
          <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: "linear-gradient(135deg, rgba(245,197,24,.1) 0%, rgba(245,197,24,.04) 100%)", border: "1px solid rgba(245,197,24,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 12px rgba(0,0,0,.2)" }}>{s.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 15, fontWeight: 700, color: "#f5c518", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.65 }}>{s.text}</div>
          </div>
          <div style={{ position: "absolute", top: 8, right: 10, fontSize: 10, color: "rgba(245,197,24,.25)", fontFamily: "Barlow Condensed,sans-serif", fontWeight: 800 }}>{String(i + 1).padStart(2, "0")}</div>
        </div>
      ))}
    </div>
  );

  if (block.type === "table") return (
    <div style={{ padding: "12px 18px" }}>
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{(d.headers || []).map((h, i) => (
              <th key={i} style={{
                padding: "14px 16px", textAlign: "center", fontFamily: "Barlow Condensed,sans-serif",
                fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase",
                background: "linear-gradient(180deg, rgba(245,197,24,.08) 0%, rgba(245,197,24,.03) 100%)",
                color: "#f5c518", borderBottom: "2px solid rgba(245,197,24,.12)",
              }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>{(d.rows || []).map((r, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(0,0,0,.08)" : "transparent" }}>
              {r.map((c, ci) => (
                <td key={ci} style={{
                  padding: "13px 16px", textAlign: "center",
                  borderTop: "1px solid rgba(255,255,255,.03)", fontSize: 14,
                  color: ci === r.length - 1 ? "#f5c518" : "rgba(255,255,255,.75)",
                  fontWeight: ci === r.length - 1 ? 800 : 500,
                  fontFamily: ci === r.length - 1 ? "Barlow Condensed,sans-serif" : "inherit",
                  fontSize: ci === r.length - 1 ? 16 : 14,
                }}>{c}</td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );

  if (block.type === "countdown") return <CD label={d.label} />;

  if (block.type === "rules") return (
    <div style={{ padding: "14px 18px", margin: "8px 18px", borderRadius: 12, background: "linear-gradient(135deg, rgba(255,255,255,.02) 0%, rgba(0,0,0,.08) 100%)", border: "1px solid rgba(255,255,255,.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{"📜"}</span>
        <span style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>PRAVILA PROMOCIJE</span>
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.8 }}>{d.text || "..."}</div>
    </div>
  );

  if (block.type === "divider") return (
    <div style={{ padding: "8px 24px" }}>
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(245,197,24,.15), transparent)" }} />
    </div>
  );

  return null;
}

// ── Styles ──
const ist = { width: "100%", background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 8, padding: "8px 10px", color: "#edf0f7", fontSize: 14, fontFamily: "inherit", outline: "none" };
const lst = { display: "block", fontSize: 10, fontWeight: 700, color: "#4a5670", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" };
const abtn = { padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.05)", background: "transparent", color: "#8d99b0", fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "inherit", flex: 1, textAlign: "center" };

// ── Stable field component — defined OUTSIDE render to prevent re-mounting ──
function Field({ l, k, multi, ph, value, onFieldChange }) {
  return (<div style={{ marginBottom: 10 }}>
    <label style={lst}>{l}</label>
    {multi
      ? <textarea value={value || ""} onChange={e => onFieldChange(k, e.target.value)} rows={3} placeholder={ph} style={{ ...ist, resize: "vertical" }} />
      : <input value={value || ""} onChange={e => onFieldChange(k, e.target.value)} placeholder={ph} style={ist} />}
  </div>);
}

// ── PropEdit with FULL editing for all block types ──
function PropEdit({ block, onChange, pages, onCreatePage }) {
  const d = block.data || {};
  const set = (k, v) => onChange({ ...block, data: { ...d, [k]: v } });
  // All hooks must be at top level — never inside conditionals
  const [creating, setCreating] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageContent, setNewPageContent] = useState("");

  if (block.type === "hero") return <>
    <Field l="Naslov" k="title" value={d.title} onFieldChange={set} />
    <Field l="Podnaslov" k="subtitle" value={d.subtitle} onFieldChange={set} />
    <div style={{ marginBottom: 10 }}><label style={lst}>Hero slika</label>
      <input value={d.imageUrl || ""} onChange={e => set("imageUrl", e.target.value)} placeholder="https://..." style={ist} />
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <label style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px dashed rgba(245,197,24,.2)", background: "rgba(245,197,24,.03)", color: "#f5c518", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>
          {"📁 Upload"}<input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => set("imageUrl", ev.target.result); r.readAsDataURL(f); }} />
        </label>
        {d.imageUrl && <button onClick={() => set("imageUrl", "")} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,.2)", background: "transparent", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>{"✕"}</button>}
      </div>
      {d.imageUrl && <img src={d.imageUrl} alt="" style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 8, marginTop: 6 }} />}
    </div>
  </>;
  if (block.type === "text") return <Field l="Tekst" k="text" multi value={d.text} onFieldChange={set} />;
  if (block.type === "amount") return <><Field l="Iznos" k="amount" ph="100" value={d.amount} onFieldChange={set} /><Field l="Sufiks" k="suffix" ph=" €" value={d.suffix} onFieldChange={set} /><Field l="Naziv" k="label" value={d.label} onFieldChange={set} /><Field l="Opis" k="desc" value={d.desc} onFieldChange={set} /></>;
  if (block.type === "cta") {
    const mode = d.detailsMode || "inline";
    return <>
      <Field l="Tekst gumba" k="text" ph="KLIKNI" value={d.text} onFieldChange={set} />
      <Field l="Link gumba (URL)" k="url" ph="https://admiral.hr/..." value={d.url} onFieldChange={set} />
      <div style={{ marginBottom: 10 }}>
        <label style={lst}>{"Više detalja — način prikaza"}</label>
        <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
          {[{ k: "inline", l: "📄 Inline" }, { k: "page", l: "📑 Stranica" }, { k: "link", l: "🔗 URL" }].map(x => (
            <button key={x.k} onClick={() => set("detailsMode", x.k)} style={{ flex: 1, padding: "7px 4px", borderRadius: 6, border: "1px solid " + (mode === x.k ? "#4a9eff" : "rgba(255,255,255,.05)"), background: mode === x.k ? "rgba(74,158,255,.08)" : "transparent", color: mode === x.k ? "#4a9eff" : "#8d99b0", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{x.l}</button>
          ))}
        </div>
      </div>
      {mode === "inline" && <Field l="Tekst detalja/uvjeta" k="detailsText" multi ph="Pravila i uvjeti koji se prikazuju klikom..." value={d.detailsText} onFieldChange={set} />}
      {mode === "link" && <Field l="URL stranice s detaljima" k="detailsUrl" ph="https://admiral.hr/info/uvjeti-..." value={d.detailsUrl} onFieldChange={set} />}
      {mode === "page" && (<div>
        <label style={lst}>Odaberi stranicu s uvjetima</label>
        {(pages || []).map(pg => (
          <button key={pg.id} onClick={() => set("detailsPageId", pg.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid " + (d.detailsPageId === pg.id ? "#4a9eff" : "rgba(255,255,255,.05)"), background: d.detailsPageId === pg.id ? "rgba(74,158,255,.06)" : "transparent", cursor: "pointer", fontFamily: "inherit", color: "#edf0f7", marginBottom: 4, textAlign: "left" }}>
            <span style={{ fontSize: 14 }}>{"📄"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{pg.title}</div>
              <div style={{ fontSize: 9, color: "#4a5670" }}>/info/{pg.slug}</div>
            </div>
            {d.detailsPageId === pg.id && <span style={{ color: "#4a9eff", fontSize: 14 }}>{"✓"}</span>}
          </button>
        ))}
        {!creating ? (
          <button onClick={() => setCreating(true)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px dashed rgba(34,197,94,.2)", background: "rgba(34,197,94,.03)", color: "#22c55e", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>{"+ Kreiraj novu stranicu s uvjetima"}</button>
        ) : (
          <div style={{ padding: 10, borderRadius: 10, background: "rgba(34,197,94,.04)", border: "1px solid rgba(34,197,94,.12)", marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>{"Nova stranica s uvjetima"}</div>
            <input value={newPageTitle} onChange={e => setNewPageTitle(e.target.value)} placeholder="Naslov (npr. Uvjeti Free Bonusi)" style={{ ...ist, marginBottom: 6 }} />
            <textarea value={newPageContent} onChange={e => setNewPageContent(e.target.value)} placeholder="Sadržaj stranice s uvjetima..." rows={4} style={{ ...ist, resize: "vertical", marginBottom: 6 }} />
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => { if (!newPageTitle) return; const pg = onCreatePage(newPageTitle, newPageContent); set("detailsPageId", pg.id); setCreating(false); setNewPageTitle(""); setNewPageContent(""); }} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: "#22c55e", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{"Kreiraj i poveži"}</button>
              <button onClick={() => setCreating(false)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,.05)", background: "transparent", color: "#8d99b0", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{"Odustani"}</button>
            </div>
          </div>
        )}
      </div>)}
    </>;
  }

  if (block.type === "countdown") return <Field l="Natpis" k="label" value={d.label} onFieldChange={set} />;
  if (block.type === "rules") return <Field l="Pravila" k="text" multi value={d.text} onFieldChange={set} />;

  // ── FULL Checklist editing ──
  if (block.type === "checks") {
    const items = d.items || [];
    return <div>
      <label style={lst}>Stavke checklista</label>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
          <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; set("items", n); }} style={{ ...ist, flex: 1 }} />
          <button onClick={() => set("items", items.filter((_, j) => j !== i))} style={{ background: "transparent", border: "1px solid rgba(239,68,68,.2)", color: "#ef4444", borderRadius: 6, padding: "0 8px", cursor: "pointer", fontSize: 14 }}>{"✕"}</button>
        </div>
      ))}
      <button onClick={() => set("items", [...items, "Nova stavka"])} style={{ ...abtn, width: "100%", marginTop: 4, borderStyle: "dashed", color: "#22c55e", borderColor: "rgba(34,197,94,.2)" }}>+ Dodaj stavku</button>
    </div>;
  }

  // ── FULL Steps editing ──
  if (block.type === "steps") {
    const items = d.items || [];
    return <div>
      <label style={lst}>Koraci</label>
      {items.map((step, i) => (
        <div key={i} style={{ background: "rgba(0,0,0,.15)", borderRadius: 8, padding: 8, marginBottom: 6, border: "1px solid rgba(255,255,255,.03)" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            <input value={step.icon || ""} onChange={e => { const n = [...items]; n[i] = { ...n[i], icon: e.target.value }; set("items", n); }} style={{ ...ist, width: 44, textAlign: "center", padding: "8px 4px" }} placeholder="🎁" />
            <input value={step.title || ""} onChange={e => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; set("items", n); }} style={{ ...ist, flex: 1 }} placeholder="Naslov koraka" />
            <button onClick={() => set("items", items.filter((_, j) => j !== i))} style={{ background: "transparent", border: "1px solid rgba(239,68,68,.2)", color: "#ef4444", borderRadius: 6, padding: "0 8px", cursor: "pointer" }}>{"✕"}</button>
          </div>
          <input value={step.text || ""} onChange={e => { const n = [...items]; n[i] = { ...n[i], text: e.target.value }; set("items", n); }} style={ist} placeholder="Opis koraka" />
        </div>
      ))}
      <button onClick={() => set("items", [...items, { icon: "📌", title: "Novi korak", text: "" }])} style={{ ...abtn, width: "100%", marginTop: 4, borderStyle: "dashed", color: "#f97316", borderColor: "rgba(249,115,22,.2)" }}>+ Dodaj korak</button>
    </div>;
  }

  // ── FULL Table editing ──
  if (block.type === "table") {
    const headers = d.headers || ["Stupac 1", "Stupac 2"];
    const rows = d.rows || [];
    return <div>
      <label style={lst}>Zaglavlja</label>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {headers.map((h, i) => <input key={i} value={h} onChange={e => { const n = [...headers]; n[i] = e.target.value; set("headers", n); }} style={{ ...ist, flex: 1, fontSize: 12 }} />)}
      </div>
      <label style={lst}>Redovi</label>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
          {row.map((cell, ci) => <input key={ci} value={cell} onChange={e => { const n = rows.map(r => [...r]); n[ri][ci] = e.target.value; set("rows", n); }} style={{ ...ist, flex: 1, fontSize: 12 }} />)}
          <button onClick={() => set("rows", rows.filter((_, j) => j !== ri))} style={{ background: "transparent", border: "1px solid rgba(239,68,68,.2)", color: "#ef4444", borderRadius: 6, padding: "0 6px", cursor: "pointer", fontSize: 12 }}>{"✕"}</button>
        </div>
      ))}
      <button onClick={() => set("rows", [...rows, headers.map(() => "")])} style={{ ...abtn, width: "100%", marginTop: 4, borderStyle: "dashed", color: "#8b5cf6", borderColor: "rgba(139,92,247,.2)" }}>+ Dodaj red</button>
    </div>;
  }

  return <div style={{ fontSize: 12, color: "#4a5670" }}>Nema dodatnih opcija.</div>;
}

// ── Default data for new blocks ──
const BLOCK_DEFAULTS = {
  hero: { title: "NASLOV PROMOCIJE", subtitle: "Podnaslov ili kratki opis" },
  text: { text: "Unesite tekst promocije ovdje. Opišite detalje, uvjete i pogodnosti za igrače." },
  amount: { amount: "100", suffix: " €", label: "Bonus", desc: "Za nove igrače" },
  cta: { text: "SAZNAJ VIŠE", detailsMode: "inline", detailsText: "Ovdje unesite detalje i uvjete promocije. Tekst se prikazuje klikom na link ispod gumba bez ponovnog učitavanja stranice." },
  checks: { items: ["Prva pogodnost promocije", "Druga pogodnost promocije", "Treća pogodnost promocije"] },
  steps: { items: [{ icon: "1️⃣", title: "PRVI KORAK", text: "Opišite što igrač treba napraviti" }, { icon: "2️⃣", title: "DRUGI KORAK", text: "Opišite nagradu ili rezultat" }] },
  table: { headers: ["Uvjet", "Nagrada"], rows: [["Uvjet 1", "Nagrada 1"], ["Uvjet 2", "Nagrada 2"]] },
  countdown: { label: "Do kraja promocije" },
  rules: { text: "Ovdje unesite pravila i uvjete promocije." },
  divider: {},
};

const toSlug = (s) => s.toLowerCase().replace(/[čć]/g, "c").replace(/[šs]/g, "s").replace(/[žz]/g, "z").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function DeleteBtn({ onDelete }) {
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (confirm) { const t = setTimeout(() => setConfirm(false), 3000); return () => clearTimeout(t); } }, [confirm]);
  return <button onClick={() => { if (confirm) { onDelete(); } else { setConfirm(true); } }}
    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid " + (confirm ? "rgba(239,68,68,.4)" : "rgba(239,68,68,.2)"), background: confirm ? "rgba(239,68,68,.12)" : "rgba(239,68,68,.06)", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8, transition: "all .2s" }}>
    {confirm ? "⚠️ Klikni ponovo za potvrdu brisanja" : "🗑 Obriši promociju"}
  </button>;
}

// ═══ EDITOR ═══
function Editor({ promo, onSave, onBack, onDelete, pages, onCreatePage }) {
  const [blocks, setBlocks] = useState((promo.blocks || []).map((b, i) => ({ ...b, id: b.id || ("b" + Date.now() + i) })));
  const [sel, setSel] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pvMode, setPvMode] = useState("mobile"); // mobile|tablet|desktop
  const [title, setTitle] = useState(promo.t);
  const [desc, setDesc] = useState(promo.d || "");
  const [cat, setCat] = useState(promo.c || "casino");
  const [slug, setSlug] = useState(promo.s || "");
  const [autoSlug, setAutoSlug] = useState(!promo.s || promo.s.startsWith("nova-"));
  const [ctaTxt, setCtaTxt] = useState(promo.cta || "Više");
  const [emoji, setEmoji] = useState(promo.emoji || "🎁");
  const [status, setStatus] = useState(promo.status || "draft");
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const markDirty = () => { if (!dirty) setDirty(true); };
  const changeTitle = (v) => { setTitle(v); markDirty(); if (autoSlug) setSlug(toSlug(v)); };

  const pushHistory = (prev) => { setHistory(h => [...h.slice(-20), prev]); setFuture([]); };
  const undo = () => { if (history.length === 0) return; const prev = history[history.length - 1]; setHistory(h => h.slice(0, -1)); setFuture(f => [...f, blocks]); setBlocks(prev); };
  const redo = () => { if (future.length === 0) return; const next = future[future.length - 1]; setFuture(f => f.slice(0, -1)); setHistory(h => [...h, blocks]); setBlocks(next); };

  const add = (type) => { pushHistory(blocks); const nb = { type, id: "b" + Date.now(), data: { ...(BLOCK_DEFAULTS[type] || {}) } }; setBlocks(prev => [...prev, nb]); setSheet(null); setSel(nb.id); markDirty(); setTimeout(() => setSheet("edit"), 150); };
  const rm = (id) => { pushHistory(blocks); setBlocks(prev => prev.filter(b => b.id !== id)); if (sel === id) { setSel(null); setSheet(null); } markDirty(); };
  const mv = (id, dir) => { pushHistory(blocks); setBlocks(prev => { const i = prev.findIndex(b => b.id === id); if ((dir === -1 && i === 0) || (dir === 1 && i === prev.length - 1)) return prev; const nb = [...prev]; [nb[i], nb[i + dir]] = [nb[i + dir], nb[i]]; return nb; }); markDirty(); };
  const upd = (id, u) => { setBlocks(prev => prev.map(b => b.id === id ? u : b)); markDirty(); };
  const selB = blocks.find(b => b.id === sel);
  const [showExitWarn, setShowExitWarn] = useState(false);
  const save = () => { onSave({ ...promo, t: title, d: desc, c: cat, s: slug, cta: ctaTxt, emoji, status, blocks }); setSaved(true); setDirty(false); setTimeout(() => setSaved(false), 2000); };
  const handleBack = () => { if (dirty) { setShowExitWarn(true); } else { onBack(); } };

  // Desktop sidebar content — rendered as JSX variable, NOT a component (prevents input focus loss)
  const sidebarJSX = (<>
    <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#f5c518" }}>BLOKOVI ({blocks.length})</span>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={undo} disabled={history.length === 0} style={{ background: "none", border: "none", color: history.length ? "#8d99b0" : "#2a3040", cursor: history.length ? "pointer" : "default", fontSize: 14, padding: 2 }} title="Undo">{"↩"}</button>
        <button onClick={redo} disabled={future.length === 0} style={{ background: "none", border: "none", color: future.length ? "#8d99b0" : "#2a3040", cursor: future.length ? "pointer" : "default", fontSize: 14, padding: 2 }} title="Redo">{"↪"}</button>
      </div>
    </div>
    <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
      {blocks.map(b => { const def = BT.find(x => x.type === b.type) || {}; return (
        <div key={b.id} onClick={() => { setSel(b.id); setSheet(null); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 8px", borderRadius: 7, cursor: "pointer", marginBottom: 2, background: sel === b.id ? "rgba(245,197,24,.06)" : "transparent", border: "1px solid " + (sel === b.id ? "rgba(245,197,24,.12)" : "transparent") }}>
          <span style={{ fontSize: 13 }}>{def.icon}</span>
          <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: "#edf0f7" }}>{def.label}</span>
          <button onClick={e => { e.stopPropagation(); mv(b.id, -1); }} style={{ background: "none", border: "none", color: "#4a5670", fontSize: 9, cursor: "pointer", padding: 2 }}>{"▲"}</button>
          <button onClick={e => { e.stopPropagation(); mv(b.id, 1); }} style={{ background: "none", border: "none", color: "#4a5670", fontSize: 9, cursor: "pointer", padding: 2 }}>{"▼"}</button>
          <button onClick={e => { e.stopPropagation(); rm(b.id); }} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 10, cursor: "pointer", padding: 2, opacity: 0.5 }}>{"✕"}</button>
        </div>);
      })}
      <button onClick={() => setSheet("add")} style={{ width: "100%", padding: 8, background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.06)", borderRadius: 7, color: "#8d99b0", fontSize: 11, cursor: "pointer", fontWeight: 600, marginTop: 6, fontFamily: "inherit" }}>+ Dodaj blok</button>
    </div>
    {selB && <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", padding: 10, maxHeight: "40vh", overflow: "auto" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#4a5670", marginBottom: 6, textTransform: "uppercase" }}>Svojstva</div>
      <PropEdit block={selB} onChange={u => upd(selB.id, u)} pages={pages} onCreatePage={onCreatePage} />
    </div>}
  </>);

  return (<div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#06091a", position: "relative" }}>
    {/* Toolbar */}
    <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", background: "rgba(15,26,53,.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,.05)", gap: 6, position: "sticky", top: 0, zIndex: 60 }}>
      <button onClick={handleBack} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", color: "#edf0f7", cursor: "pointer", fontSize: 18, padding: "6px 12px", borderRadius: 8, fontWeight: 700, minWidth: 44, minHeight: 36 }}>{"←"}</button>
      <input value={title} onChange={e => changeTitle(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", color: "#edf0f7", fontSize: 14, fontFamily: "Barlow Condensed,sans-serif", fontWeight: 700, outline: "none", minWidth: 0 }} />
      {dirty && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} title="Nespremljene promjene" />}
      <button onClick={undo} disabled={history.length === 0} style={{ background: "none", border: "1px solid rgba(255,255,255,.05)", color: history.length ? "#8d99b0" : "#2a3040", cursor: history.length ? "pointer" : "default", fontSize: 14, padding: "6px 8px", borderRadius: 8 }} title="Undo">{"↩"}</button>
      <button onClick={redo} disabled={future.length === 0} style={{ background: "none", border: "1px solid rgba(255,255,255,.05)", color: future.length ? "#8d99b0" : "#2a3040", cursor: future.length ? "pointer" : "default", fontSize: 14, padding: "6px 8px", borderRadius: 8 }} title="Redo">{"↪"}</button>
      <div style={{ display: "flex", border: "1px solid rgba(255,255,255,.05)", borderRadius: 6, overflow: "hidden" }}>
        {[{k:"mobile",i:"📱",w:375},{k:"tablet",i:"📟",w:768},{k:"desktop",i:"🖥",w:1200}].map(m=>(
          <button key={m.k} onClick={()=>setPvMode(m.k)} style={{ background: pvMode===m.k ? "rgba(245,197,24,.1)" : "transparent", border: "none", color: pvMode===m.k ? "#f5c518" : "#4a5670", fontSize: 11, padding: "5px 7px", cursor: "pointer" }} title={m.k}>{m.i}</button>
        ))}
      </div>
      <button onClick={() => setSheet("settings")} style={{ background: "none", border: "1px solid rgba(255,255,255,.05)", color: "#8d99b0", cursor: "pointer", fontSize: 14, padding: "6px 10px", borderRadius: 8 }}>{"⚙"}</button>
      <button onClick={save} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: saved ? "#22c55e" : "#f5c518", color: "#06091a", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", transition: "background .2s" }}>{saved ? "✓ OK" : "Spremi"}</button>
    </div>

    {/* Main area — desktop: sidebar + preview, mobile: preview only */}
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Desktop sidebar — hidden on mobile */}
      <div className="ed-desktop-sidebar" style={{ width: 260, background: "#0a1228", borderRight: "1px solid rgba(255,255,255,.05)", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
        {sidebarJSX}
      </div>

      {/* Preview */}
      <div style={{ flex: 1, overflow: "auto", padding: 12, display: "flex", justifyContent: "center", alignItems: "flex-start" }} onClick={() => { if (sheet === "add") setSheet(null); }}>
      <div style={{ width: "100%", maxWidth: pvMode === "desktop" ? 1200 : pvMode === "tablet" ? 768 : 420, background: "#0a1228", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.05)", transition: "max-width .4s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "rgba(0,0,0,.3)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} /><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b" }} /><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ flex: 1, margin: "0 8px", background: "rgba(255,255,255,.04)", borderRadius: 4, padding: "3px 8px", fontSize: 9, color: "#4a5670", textAlign: "center" }}>admiral.hr/info/{slug}</span>
          <span style={{ fontSize: 9, color: "#4a5670", fontWeight: 600 }}>{pvMode === "desktop" ? "1200px" : pvMode === "tablet" ? "768px" : "420px"}</span>
        </div>
        <div style={{ minHeight: 300, paddingBottom: 80 }}>
          {blocks.length === 0 ? (
            <div onClick={e => { e.stopPropagation(); setSheet("add"); }} style={{ padding: "60px 20px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(245,197,24,.06)", border: "2px dashed rgba(245,197,24,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28, color: "#f5c518" }}>+</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#8d99b0" }}>Dodaj prvi blok</div>
              <div style={{ fontSize: 12, color: "#4a5670", marginTop: 4 }}>Klikni + gumb ili odaberi predložak u postavkama</div>
            </div>
          ) : blocks.map(b => (
            <div key={b.id} onClick={e => { e.stopPropagation(); setSel(b.id); setSheet("edit"); }} style={{ cursor: "pointer", border: sel === b.id ? "2px solid #f5c518" : "2px solid transparent", background: sel === b.id ? "rgba(245,197,24,.02)" : "transparent", position: "relative" }}>
              <RB block={{...b, _pages: pages}} />
              {sel === b.id && <div style={{ position: "absolute", top: 4, left: 4, zIndex: 5 }}><span style={{ background: "#f5c518", color: "#06091a", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800 }}>{(BT.find(x => x.type === b.type) || {}).icon} {(BT.find(x => x.type === b.type) || {}).label}</span></div>}
            </div>
          ))}
          {blocks.length > 0 && <div onClick={e => { e.stopPropagation(); setSheet("add"); }} style={{ padding: 14, textAlign: "center", cursor: "pointer", border: "2px dashed rgba(255,255,255,.06)", margin: "8px 12px", borderRadius: 10, color: "#4a5670", fontSize: 13, fontWeight: 600 }}>+ Dodaj blok</div>}
        </div>
      </div>
    </div>
    </div>{/* end flex main */}

    {/* FAB — mobile only, desktop has sidebar */}
    <button className="ed-mobile-fab" onClick={() => setSheet(sheet === "add" ? null : "add")} style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 16, background: "#f5c518", border: "none", cursor: "pointer", zIndex: 80, boxShadow: "0 6px 24px rgba(245,197,24,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 28, color: "#06091a", fontWeight: 300, transform: sheet === "add" ? "rotate(45deg)" : "none", transition: "transform .3s", display: "block", lineHeight: 1 }}>+</span></button>

    {/* Backdrop */}
    {sheet && <div onClick={() => { setSel(null); setSheet(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 89, animation: "fadeIn .2s" }} />}

    {/* Sheet: Edit block */}
    {sheet === "edit" && selB && (<div key={"edit-" + sel} style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a1228", borderTopLeftRadius: 20, borderTopRightRadius: 20, zIndex: 90, maxHeight: "75vh", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,.05)", borderBottom: "none", animation: "sheetUp .3s cubic-bezier(.16,1,.3,1)" }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.15)", margin: "10px auto 6px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 18px 10px" }}><div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 16, fontWeight: 800 }}>{(BT.find(x => x.type === selB.type) || {}).icon} {(BT.find(x => x.type === selB.type) || {}).label}</div><button onClick={() => { setSel(null); setSheet(null); }} style={{ background: "none", border: "none", color: "#8d99b0", fontSize: 18, cursor: "pointer" }}>{"✕"}</button></div>
      <div style={{ display: "flex", gap: 4, padding: "0 18px 10px", flexWrap: "wrap" }}>
        <button onClick={() => mv(sel, -1)} style={abtn}>{"▲"}</button><button onClick={() => mv(sel, 1)} style={abtn}>{"▼"}</button>
        <button onClick={() => { const i = blocks.findIndex(b => b.id === sel); if (i >= 0) { const copy = { ...blocks[i], id: "b" + Date.now(), data: { ...blocks[i].data } }; setBlocks(prev => { const nb = [...prev]; nb.splice(i + 1, 0, copy); return nb; }); } }} style={abtn}>{"📋"}</button>
        <button onClick={() => rm(sel)} style={{ ...abtn, borderColor: "rgba(239,68,68,.2)", color: "#ef4444" }}>{"🗑"}</button>
      </div>
      <div style={{ overflow: "auto", padding: "0 18px 24px", flex: 1 }}><PropEdit block={selB} onChange={u => upd(selB.id, u)} pages={pages} onCreatePage={onCreatePage} /></div>
    </div>)}

    {/* Sheet: Add block */}
    {sheet === "add" && (<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a1228", borderTopLeftRadius: 20, borderTopRightRadius: 20, zIndex: 90, maxHeight: "60vh", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,.05)", borderBottom: "none", animation: "sheetUp .3s cubic-bezier(.16,1,.3,1)" }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.15)", margin: "10px auto 6px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 18px 12px" }}><div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 16, fontWeight: 800 }}>Dodaj blok</div><button onClick={() => setSheet(null)} style={{ background: "none", border: "none", color: "#8d99b0", fontSize: 18, cursor: "pointer" }}>{"✕"}</button></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: "0 18px 24px", overflow: "auto" }}>{BT.map(bt => (<button key={bt.type} onClick={() => add(bt.type)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 6px", borderRadius: 12, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", cursor: "pointer", fontFamily: "inherit", color: "#edf0f7" }}><div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: bt.color + "18", border: "1px solid " + bt.color + "30" }}>{bt.icon}</div><div style={{ fontSize: 10, fontWeight: 600, color: "#8d99b0" }}>{bt.label}</div></button>))}</div>
    </div>)}

    {/* Sheet: Promo Settings */}
    {sheet === "settings" && (<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a1228", borderTopLeftRadius: 20, borderTopRightRadius: 20, zIndex: 90, maxHeight: "80vh", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,.05)", borderBottom: "none", animation: "sheetUp .3s cubic-bezier(.16,1,.3,1)" }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.15)", margin: "10px auto 6px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 18px 12px" }}><div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 16, fontWeight: 800 }}>{"⚙ Postavke promocije"}</div><button onClick={() => setSheet(null)} style={{ background: "none", border: "none", color: "#8d99b0", fontSize: 18, cursor: "pointer" }}>{"✕"}</button></div>
      <div style={{ overflow: "auto", padding: "0 18px 24px", flex: 1 }}>
        <div style={{ marginBottom: 10 }}><label style={lst}>Opis</label><textarea value={desc} onChange={e => { setDesc(e.target.value); markDirty(); }} rows={2} style={{ ...ist, resize: "vertical" }} /></div>
        <div style={{ marginBottom: 10 }}><label style={lst}>URL slug {autoSlug && <span style={{ color: "#22c55e", fontSize: 9 }}>(auto)</span>}</label>
          <input value={slug} onChange={e => { setSlug(e.target.value); setAutoSlug(false); markDirty(); }} style={ist} />
          <div style={{ fontSize: 10, color: "#4a5670", marginTop: 4 }}>admiral.hr/info/<b style={{ color: "#8d99b0" }}>{slug || "..."}</b></div>
        </div>
        <div style={{ marginBottom: 10 }}><label style={lst}>CTA tekst gumba</label><input value={ctaTxt} onChange={e => { setCtaTxt(e.target.value); markDirty(); }} style={ist} /></div>
        <div style={{ marginBottom: 10 }}><label style={lst}>Kategorija</label>
          <div style={{ display: "flex", gap: 6 }}>{[{ k: "casino", l: "Casino", c: "#22c55e" }, { k: "kladenje", l: "Klađenje", c: "#4a9eff" }].map(x => (
            <button key={x.k} onClick={() => { setCat(x.k); markDirty(); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid " + (cat === x.k ? x.c : "rgba(255,255,255,.05)"), background: cat === x.k ? x.c + "12" : "transparent", color: cat === x.k ? x.c : "#8d99b0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{x.l}</button>
          ))}</div>
        </div>
        <div style={{ marginBottom: 10 }}><label style={lst}>Status</label>
          <div style={{ display: "flex", gap: 6 }}>{[{ k: "published", l: "Objavljena", c: "#22c55e" }, { k: "draft", l: "Skica", c: "#f59e0b" }].map(x => (
            <button key={x.k} onClick={() => { setStatus(x.k); markDirty(); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid " + (status === x.k ? x.c : "rgba(255,255,255,.05)"), background: status === x.k ? x.c + "12" : "transparent", color: status === x.k ? x.c : "#8d99b0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{x.l}</button>
          ))}</div>
        </div>
        <div style={{ marginBottom: 10 }}><label style={lst}>Emoji ikona</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{EMOJIS.map(e => (
            <button key={e} onClick={() => { setEmoji(e); markDirty(); }} style={{ width: 36, height: 36, borderRadius: 8, border: emoji === e ? "2px solid #f5c518" : "1px solid rgba(255,255,255,.05)", background: emoji === e ? "rgba(245,197,24,.08)" : "transparent", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{e}</button>
          ))}</div>
        </div>
        <DeleteBtn onDelete={() => onDelete(promo.id)} />
      </div>
    </div>)}

    {/* Exit warning modal */}
    {showExitWarn && (<>
      <div onClick={() => setShowExitWarn(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 95, animation: "fadeIn .2s" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#0a1228", borderRadius: 16, padding: "24px", border: "1px solid rgba(255,255,255,.08)", zIndex: 96, width: "90%", maxWidth: 340, animation: "fadeIn .2s" }}>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "Barlow Condensed,sans-serif", marginBottom: 8 }}>Nespremljene promjene</div>
        <div style={{ fontSize: 13, color: "#8d99b0", lineHeight: 1.6, marginBottom: 16 }}>Imate promjene koje nisu spremljene. Što želite učiniti?</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { save(); setTimeout(onBack, 200); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#f5c518", color: "#06091a", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Spremi i izađi</button>
          <button onClick={() => { setShowExitWarn(false); onBack(); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid rgba(239,68,68,.2)", background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Odbaci</button>
        </div>
        <button onClick={() => setShowExitWarn(false)} style={{ width: "100%", padding: "8px", borderRadius: 8, border: "none", background: "transparent", color: "#8d99b0", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginTop: 6 }}>Nastavi uređivanje</button>
      </div>
    </>)}

    <style>{`@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.ed-desktop-sidebar{display:none !important}
.ed-mobile-fab{display:flex}
@media(min-width:900px){.ed-desktop-sidebar{display:flex !important}.ed-mobile-fab{display:none !important}}
`}</style>
  </div>);
}

// ═══ ADMIN with Template Picker & Search ═══
function Admin({ promos, onEdit, onPlayer, onAdd, onDuplicate, pages }) {
  const [search, setSearch] = useState("");
  const [tpl, setTpl] = useState(null); // template picker modal
  const filtered = promos.filter(p => p.t.toLowerCase().includes(search.toLowerCase()));

  return (<div style={{ padding: "16px 14px", maxWidth: 800, margin: "0 auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
      <div><div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 26, fontWeight: 800 }}>Admiral CMS</div><div style={{ fontSize: 12, color: "#8d99b0", marginTop: 2 }}>{promos.length} promocija · {(pages||[]).length} stranica</div></div>
      <div style={{ display: "flex", gap: 6 }}><button onClick={onPlayer} style={{ ...abtn, flex: "none" }}>{"👁 Player"}</button><button onClick={() => setTpl("pick")} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#f5c518", color: "#06091a", fontSize: 12, cursor: "pointer", fontWeight: 800, fontFamily: "inherit" }}>+ Nova</button></div>
    </div>

    {/* Stats with sparklines */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 12 }}>
      {[{ l: "Casino", v: promos.filter(p => p.c === "casino").length, i: "🎰", c: "#22c55e", pts: "0,8 15,6 30,9 45,4 60,7 75,3 90,8" },
        { l: "Klađenje", v: promos.filter(p => p.c === "kladenje").length, i: "⚽", c: "#4a9eff", pts: "0,5 15,7 30,4 45,8 60,6 75,9 90,5" },
        { l: "Objavljene", v: promos.filter(p => p.status === "published").length, i: "✅", c: "#f5c518", pts: "0,3 15,5 30,7 45,6 60,8 75,7 90,9" },
        { l: "Stranice", v: (pages||[]).length, i: "📄", c: "#a855f7", pts: "0,4 15,4 30,5 45,5 60,6 75,7 90,7" }
      ].map((s, i) => (
        <div key={i} style={{ background: "#111d3a", borderRadius: 14, padding: "14px 14px 10px", border: "1px solid rgba(255,255,255,.05)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.c, opacity: 0.5 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div><div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.v}</div><div style={{ fontSize: 10, color: "#8d99b0", fontWeight: 600, marginTop: 4 }}>{s.l}</div></div>
            <span style={{ fontSize: 20 }}>{s.i}</span>
          </div>
          <svg width="100%" height="20" viewBox="0 0 90 10" preserveAspectRatio="none" style={{ display: "block", marginTop: 8, opacity: 0.4 }}>
            <polyline points={s.pts} fill="none" stroke={s.c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </div>

    {/* Activity feed */}
    <div style={{ background: "#111d3a", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,.05)", marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#4a5670", textTransform: "uppercase", marginBottom: 8 }}>Nedavna aktivnost</div>
      {[
        { t: "FREE BONUSI ažurirano", time: "Prije 2h", c: "#22c55e" },
        { t: "Nova promocija kreirana", time: "Prije 5h", c: "#4a9eff" },
        { t: "CASHBACK 15% prebačen u skicu", time: "Jučer", c: "#f59e0b" },
      ].map((a, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: i ? "1px solid rgba(255,255,255,.03)" : "none" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.c, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12, color: "#edf0f7" }}>{a.t}</div>
          <div style={{ fontSize: 10, color: "#4a5670" }}>{a.time}</div>
        </div>
      ))}
    </div>

    {/* Search */}
    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={"🔍 Pretraži promocije..."} style={{ ...ist, marginBottom: 12 }} />

    {/* Promo list header */}
    <div style={{ fontSize: 10, fontWeight: 700, color: "#4a5670", textTransform: "uppercase", marginBottom: 6, padding: "0 4px" }}>Promocije ({filtered.length})</div>

    {/* Promo list */}
    {filtered.map(p => (
      <div key={p.id} onClick={() => onEdit(p)} style={{ display: "flex", alignItems: "center", padding: "10px 12px", background: "#111d3a", borderRadius: 10, border: "1px solid rgba(255,255,255,.05)", gap: 10, marginBottom: 4, cursor: "pointer" }}>
        <div style={{ width: 44, height: 32, borderRadius: 8, flexShrink: 0, background: p.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{p.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.t}</div>
          <div style={{ fontSize: 10, color: "#4a5670", marginTop: 1 }}>{(p.blocks || []).length} blokova · {p.c}</div>
        </div>
        <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: p.status === "published" ? "rgba(34,197,94,.1)" : "rgba(245,158,11,.1)", color: p.status === "published" ? "#22c55e" : "#f59e0b" }}>{p.status === "published" ? "Live" : "Skica"}</span>
        <button onClick={e => { e.stopPropagation(); onDuplicate(p); }} style={{ background: "none", border: "1px solid rgba(255,255,255,.05)", color: "#8d99b0", fontSize: 11, padding: "4px 8px", borderRadius: 6, cursor: "pointer" }} title="Dupliciraj">{"📋"}</button>
        <span style={{ color: "#4a5670", fontSize: 14 }}>{"›"}</span>
      </div>
    ))}

    {/* Pages section */}
    <div style={{ marginTop: 20, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 14, fontWeight: 800, color: "#8d99b0" }}>Stranice s uvjetima ({(pages || []).length})</div>
    </div>
    {(pages || []).map(pg => (
      <div key={pg.id} style={{ display: "flex", alignItems: "center", padding: "10px 12px", background: "#111d3a", borderRadius: 10, border: "1px solid rgba(255,255,255,.05)", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 14 }}>{"📄"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pg.title}</div>
          <div style={{ fontSize: 10, color: "#4a5670", marginTop: 1 }}>/info/{pg.slug}</div>
        </div>
        <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: "rgba(74,158,255,.1)", color: "#4a9eff" }}>Info</span>
      </div>
    ))}

    {/* Template Picker Modal */}
    {tpl && (<>
      <div onClick={() => setTpl(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 89, animation: "fadeIn .2s" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a1228", borderTopLeftRadius: 20, borderTopRightRadius: 20, zIndex: 90, maxHeight: "70vh", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,.05)", borderBottom: "none", animation: "sheetUp .3s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.15)", margin: "10px auto 6px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 18px 14px" }}><div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 18, fontWeight: 800 }}>Odaberi predložak</div><button onClick={() => setTpl(null)} style={{ background: "none", border: "none", color: "#8d99b0", fontSize: 18, cursor: "pointer" }}>{"✕"}</button></div>
        <div style={{ overflow: "auto", padding: "0 18px 24px" }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => { setTpl(null); onAdd(t); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 12px", borderRadius: 12, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", cursor: "pointer", fontFamily: "inherit", color: "#edf0f7", marginBottom: 6, textAlign: "left" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: t.color + "15", border: "1px solid " + t.color + "30", flexShrink: 0 }}>{t.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div><div style={{ fontSize: 11, color: "#8d99b0", marginTop: 2 }}>{t.desc}</div></div>
              <span style={{ fontSize: 10, color: "#4a5670" }}>{t.blocks.length} blokova</span>
            </button>
          ))}
        </div>
      </div>
    </>)}
    <style>{`@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
  </div>);
}

// ═══ PLAYER VIEW with Scroll Reveals ═══
function Player({ promos, pages, onAdmin }) {
  const [f, setF] = useState("sve");
  const [sel, setSel] = useState(null);
  const [hov, setHov] = useState(null);
  const pub = promos.filter(p => p.status === "published");
  const sorted = [...pub].sort((a, b) => (a.c === "casino" ? -1 : 1) - (b.c === "casino" ? -1 : 1));
  const list = f === "sve" ? sorted : sorted.filter(p => p.c === f);
  const pr = useRef(null);
  const sP = () => { pr.current = setTimeout(onAdmin, 2000); };
  const eP = () => { clearTimeout(pr.current); };

  if (sel) {
    const heroImg = sel.blocks?.find(b => b.type === "hero" && b.data?.imageUrl)?.data?.imageUrl;
    return (<div style={{ minHeight: "100vh", background: "#06091a" }}>
      <div style={{ position: "relative" }}>
        {heroImg ? (<><img src={heroImg} alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #06091a 0%, transparent 40%)" }} /></>
        ) : (<div style={{ height: 200, background: sel.grad, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}><Particles /><span style={{ fontSize: 48, position: "relative", zIndex: 1 }}>{sel.emoji}</span><div style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", position: "relative", zIndex: 1, marginLeft: 12, textShadow: "0 4px 20px rgba(0,0,0,.5)" }}>{sel.t}</div><div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #06091a 0%, transparent 40%)" }} /></div>)}
        <button onClick={() => setSel(null)} style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 16px", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 700, zIndex: 20, fontFamily: "inherit", minWidth: 44, minHeight: 44 }}>{"← Natrag"}</button>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px 48px" }}>
        <Rv><p style={{ fontSize: 14, color: "#8d99b0", textAlign: "center", lineHeight: 1.7, margin: "0 0 24px" }}>{sel.d}</p></Rv>
        {(sel.blocks || []).map((b, i) => <Rv key={b.id || i} delay={i * 0.06}><RB block={{...b, _pages: pages}} /></Rv>)}
      </div>
    </div>);
  }

  return (<>
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.05)", background: "rgba(15,26,53,.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 18, cursor: "pointer", opacity: 0.7 }}>{"☰"}</span><div onMouseDown={sP} onMouseUp={eP} onTouchStart={sP} onTouchEnd={eP} style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "0.06em", cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}>ADMIRAL</div></div>
      <button style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#f5c518", color: "#06091a", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>REGISTRACIJA</button>
    </header>
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 12px 48px" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>{[{ k: "sve", l: "Sve" }, { k: "casino", l: "Casino" }, { k: "kladenje", l: "Klađenje" }].map(x => (<button key={x.k} onClick={() => setF(x.k)} style={{ padding: "8px 22px", borderRadius: 50, border: f === x.k ? "1px solid #edf0f7" : "1px solid rgba(255,255,255,.05)", background: f === x.k ? "rgba(255,255,255,.05)" : "transparent", color: f === x.k ? "#edf0f7" : "#8d99b0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{x.l}</button>))}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>{list.map((p, idx) => {
        const cardImg = p.blocks?.find(b => b.type === "hero" && b.data?.imageUrl)?.data?.imageUrl;
        return (<Rv key={p.id} delay={idx * 0.04}><div onClick={() => setSel(p)} onMouseEnter={() => setHov(p.id)} onMouseLeave={() => setHov(null)} style={{ background: "#111d3a", borderRadius: 16, overflow: "hidden", border: hov === p.id ? "1px solid rgba(245,197,24,.12)" : "1px solid rgba(255,255,255,.05)", cursor: "pointer", transition: "all .3s", display: "flex", flexDirection: "column", transform: hov === p.id ? "translateY(-5px)" : "none", boxShadow: hov === p.id ? "0 14px 44px rgba(0,0,0,.45)" : "none" }}>
          <div style={{ height: 175, position: "relative", overflow: "hidden", background: p.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {cardImg ? <img src={cardImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, transition: "transform .4s", transform: hov === p.id ? "scale(1.08)" : "scale(1)" }} /> : <span style={{ fontSize: 48, position: "relative", zIndex: 1, transition: "transform .4s", transform: hov === p.id ? "scale(1.15)" : "scale(1)" }}>{p.emoji}</span>}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111d3a 0%, transparent 50%)" }} />
            {p.badge && <span style={{ position: "absolute", top: 12, right: 12, padding: "4px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, zIndex: 2, color: "#fff", background: p.badge === "HOT" ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#22c55e,#16a34a)", animation: "badgePulse 2s ease-in-out infinite" }}>{p.badge}</span>}
            <span style={{ position: "absolute", bottom: 10, left: 12, padding: "4px 10px", background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)", borderRadius: 6, fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 600, textTransform: "uppercase", zIndex: 2 }}>{p.c === "casino" ? "Casino" : "Klađenje"}</span>
          </div>
          <div style={{ padding: "14px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontFamily: "Barlow Condensed,sans-serif", fontSize: 17, fontWeight: 800, margin: "0 0 8px" }}>{p.t}</h3>
            <p style={{ fontSize: 13, color: "#8d99b0", lineHeight: 1.55, margin: "0 0 14px", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.d}</p>
            <button style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #4a9eff, #2d7ad6)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(74,158,255,.25)" }}>{p.cta || "Više"}</button>
            <div style={{ fontSize: 11, color: "#4a5670", textAlign: "center", marginTop: 10, textDecoration: "underline" }}>Više detalja i uvjeti promocije</div>
          </div>
        </div></Rv>);
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
