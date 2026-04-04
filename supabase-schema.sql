-- =============================================
-- Admiral CMS — Database Schema
-- Run this in Supabase SQL Editor (supabase.com > your project > SQL Editor)
-- =============================================

-- Templates table
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📄',
  supports TEXT DEFAULT 'HTML, CSS',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  template_id TEXT REFERENCES templates(id),
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'promocija', 'kampanja')),
  content TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  meta_keywords TEXT DEFAULT '',
  hero_image TEXT DEFAULT '',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign days table (for Put do Finala etc.)
CREATE TABLE campaign_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  phase TEXT DEFAULT 'gs',
  promo_type TEXT DEFAULT '',
  promo_value TEXT DEFAULT '',
  content TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_days ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for frontend)
CREATE POLICY "Public read templates" ON templates FOR SELECT USING (true);
CREATE POLICY "Public read published pages" ON pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public read campaign days" ON campaign_days FOR SELECT USING (true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Admin full access templates" ON templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access pages" ON pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access campaign days" ON campaign_days FOR ALL USING (auth.role() = 'authenticated');

-- Insert default templates
INSERT INTO templates (id, name, description, icon, supports) VALUES
  ('promo-standard', 'Promocija — Standard', 'Jednostavna promo stranica s hero slikom, tekstom i CTA', '🎯', 'HTML, CSS, JS'),
  ('kampanja-kalendar', 'Kampanja — Kalendar', 'Advent-style kalendar s dnevnim otključavanjem', '📅', 'HTML, CSS, JS, date-aware'),
  ('promo-sport', 'Promocija — Sport', 'Sportska promocija s live kvotama i tablicama', '⚽', 'HTML, CSS, JS, API'),
  ('info-stranica', 'Info stranica', 'Standardna informativna stranica (pravila, FAQ, uvjeti)', '📄', 'HTML, CSS'),
  ('kampanja-turnir', 'Kampanja — Turnir', 'Turnirska tablica s grupama, knockoutom i predikcijama', '🏆', 'HTML, CSS, JS, real-time'),
  ('landing-page', 'Landing Page', 'Konverzijska stranica s A/B testiranjem', '🚀', 'HTML, CSS, JS, tracking');

-- Insert sample pages
INSERT INTO pages (slug, title, status, template_id, type, content, meta_description) VALUES
  ('put-do-finala', 'Put do Finala — SP 2026', 'published', 'kampanja-kalendar', 'kampanja', '', '39 dana besplatnih oklada za FIFA SP 2026'),
  ('bonus-dobrodoslice', 'Bonus dobrodošlice 100€', 'published', 'promo-standard', 'promocija', '<h1>Bonus dobrodošlice</h1><p>Registriraj se i osvoji do 100€ bonusa na prvu uplatu!</p>', 'Osvoji bonus dobrodošlice do 100€'),
  ('free-bet-petak', 'Free Bet petak — HNL', 'published', 'promo-standard', 'promocija', '<h1>Free Bet petak</h1><p>Svaki petak osvoji 10€ besplatne oklade na HNL utakmice.</p>', 'Besplatna oklada svaki petak'),
  ('cashback-casino', 'Casino Cashback 15%', 'published', 'promo-standard', 'promocija', '<h1>Casino Cashback</h1><p>Povrat 15% gubitaka svaki tjedan, do 50€.</p>', 'Tjedni casino cashback 15%'),
  ('pravila-kladenja', 'Pravila sportskog klađenja', 'published', 'info-stranica', 'info', '<h1>Pravila</h1><p>Ovdje će biti pravila sportskog klađenja.</p>', 'Pravila sportskog klađenja Admiral Bet'),
  ('faq', 'Često postavljana pitanja', 'published', 'info-stranica', 'info', '<h1>FAQ</h1><p>Najčešća pitanja i odgovori.</p>', 'Često postavljana pitanja');

-- Insert Put do Finala campaign days
DO $$
DECLARE
  page_uuid UUID;
  day_date DATE := '2026-06-11';
  phases TEXT[] := ARRAY[
    'gs','gs','gs','gs','gs','gs','gs','gs','gs','gs','gs','gs','gs','gs','gs','gs','gs',
    'r32','r32','r32','r32','r32','r32',
    'r16','r16','r16','r16',
    'qf','qf','qf','qf',
    'sf','sf','sf','sf','sf','sf',
    'tp','fin'
  ];
  promos TEXT[] := ARRAY[
    '2€','3€','4€','5€','100% BESPLATNE OKLADE','CASHBACK DAN',
    '3€','2€','5€','100% BESPLATNE OKLADE','4€','3€',
    '2€','CASHBACK DAN','5€','4€','3€','100% BESPLATNE OKLADE',
    '2€','5€','3€','4€','CASHBACK DAN','2€',
    '5€','100% BESPLATNE OKLADE','3€','4€','2€','5€',
    'CASHBACK DAN','3€','4€','100% BESPLATNE OKLADE','2€','5€',
    '3€','4€','FINALE 39€'
  ];
BEGIN
  SELECT id INTO page_uuid FROM pages WHERE slug = 'put-do-finala';
  
  FOR i IN 1..39 LOOP
    INSERT INTO campaign_days (page_id, day_number, date, phase, promo_type, promo_value)
    VALUES (
      page_uuid,
      i,
      day_date + (i - 1),
      phases[i],
      CASE 
        WHEN promos[i] LIKE '%€' THEN 'free_bet'
        WHEN promos[i] LIKE '%BESPLATNE%' THEN 'free_spins'
        WHEN promos[i] LIKE '%CASHBACK%' THEN 'cashback'
        WHEN promos[i] LIKE '%FINALE%' THEN 'finale'
        ELSE 'other'
      END,
      promos[i]
    );
  END LOOP;
END $$;
