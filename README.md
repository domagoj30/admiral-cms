# Admiral CMS — Proof of Concept

Novi CMS sustav za Admiral Bet — zamjena za ograničeni Core Aplikacije CMS.

**Tech stack:** Next.js 14 + Supabase + Tailwind CSS  
**Demo kampanja:** Put do Finala — FIFA SP 2026  

---

## 🚀 Setup — Korak po korak

### 1. GitHub

1. Idi na **github.com** i napravi račun (ako nemaš)
2. Klikni zeleni gumb **"New"** (ili idi na github.com/new)
3. Nazovi repozitorij: `admiral-cms`
4. Označi ga kao **Public**
5. Klikni **"Create repository"**
6. GitHub će ti pokazati upute — za sada ih ignoriraj, vratit ćemo se na to

### 2. Supabase (baza podataka)

1. Idi na **supabase.com** i napravi račun (besplatno)
2. Klikni **"New Project"**
3. Naziv: `admiral-cms`
4. Lozinka baze: zapamti ju (ili generiraj)
5. Region: **EU West** (najbliži Hrvatskoj)
6. Klikni **"Create new project"** — čekaj ~2 minute
7. Kad se projekt kreira, idi na **Settings** > **API** 
8. Tamo ćeš vidjeti:
   - **Project URL** (npr. `https://xxxx.supabase.co`)
   - **anon public key** (dugi string)
   - Zapiši oboje — trebat će nam

#### 2a. Kreiranje tablica

1. U Supabase projektu idi na **SQL Editor** (lijevi izbornik)
2. Klikni **"New query"**
3. Kopiraj CIJELI sadržaj datoteke `supabase-schema.sql` iz ovog projekta
4. Zalijepi ga u SQL Editor
5. Klikni **"Run"**
6. Trebao bi vidjeti poruku o uspješnom izvršenju
7. Idi na **Table Editor** — trebale bi se pojaviti tablice: `templates`, `pages`, `campaign_days`

#### 2b. Disable RLS za demo (VAŽNO!)

Za demo prezentaciju, trebamo omogućiti pristup bez autentikacije:

1. Idi na **Authentication** > **Policies**
2. Za svaku tablicu (`templates`, `pages`, `campaign_days`):
   - Klikni na tablicu
   - Ako RLS smeta, najlakše je otići na **Table Editor** > klikni tablicu > gore desno **RLS Disabled/Enabled** toggle
   - Za demo ga stavi na **Disabled**

> ⚠️ U produkciji bi RLS bio UKLJUČEN s pravilnim politikama. Za demo ga gasimo radi jednostavnosti.

### 3. Vercel (hosting)

1. Idi na **vercel.com** i registriraj se **koristeći GitHub račun** (važno!)
2. Klikni **"Add New..."** > **"Project"**
3. Odaberi svoj `admiral-cms` repozitorij iz liste
4. Prije nego klikneš Deploy, dodaj **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = tvoj Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tvoj Supabase anon key
5. Klikni **"Deploy"**
6. Za ~1-2 minute dobit ćeš javni URL (npr. `admiral-cms.vercel.app`)

### 4. Upload koda na GitHub

Postoje dva načina:

#### Način A: Preko GitHub web sučelja (najlakši)

1. Idi na svoj repozitorij na GitHubu
2. Klikni **"uploading an existing file"** (ili "Add file" > "Upload files")
3. Povuci (drag & drop) SVE datoteke i mape iz ovog ZIP-a u browser
4. Klikni **"Commit changes"**
5. Vercel će automatski pokrenuti deploy

#### Način B: Preko terminala (ako imaš Git instaliran)

```bash
cd admiral-cms
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TVOJ-USERNAME/admiral-cms.git
git branch -M main
git push -u origin main
```

---

## 📁 Struktura projekta

```
admiral-cms/
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout
│   │   ├── page.js            # Homepage (redirect na /admin)
│   │   ├── globals.css         # Globalni stilovi + animacije
│   │   ├── admin/
│   │   │   ├── layout.js      # Admin sidebar + navigacija
│   │   │   ├── page.js        # Dashboard
│   │   │   ├── pages/
│   │   │   │   └── page.js    # Upravljanje stranicama (CRUD)
│   │   │   ├── templates/
│   │   │   │   └── page.js    # Pregled predložaka
│   │   │   └── campaigns/
│   │   │       └── page.js    # Upravljanje kampanjama
│   │   └── info/
│   │       └── [slug]/
│   │           └── page.js    # Javne stranice (/info/put-do-finala itd.)
│   └── lib/
│       └── supabase.js        # Supabase konekcija
├── supabase-schema.sql         # SQL za kreiranje tablica
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## 🎯 Što pokazati šefovima

1. **Dashboard** (`/admin`) — pregled sustava, usporedba starog vs novog CMS-a
2. **Stranice** (`/admin/pages`) — kreiranje, objava, brisanje stranica IZ BAZE u realnom vremenu
3. **Predlošci** (`/admin/templates`) — 6 modularnih predložaka vs 1 rigidni u starom CMS-u
4. **Kampanje** (`/admin/campaigns`) — upravljanje 39 dana "Put do Finala" kampanje
5. **Preview** (`/info/put-do-finala`) — kako izgleda kampanja za igrače

**Ključne poruke:**
- Svi podaci su u bazi — promjene su TRENUTNE, bez rebuilda
- Predlošci podržavaju JS, animacije, date-aware logiku — sve što stari CMS ne može
- Admin panel je jednostavan — marketing tim može samostalno upravljati
- Sustav je skalabilan — isti princip za Advent kalendar, turnirske tablice, landing page-ove

---

## ⚡ Lokalni development (opcionalno)

```bash
npm install
cp .env.local.example .env.local
# Uredi .env.local s Supabase podacima
npm run dev
# Otvori http://localhost:3000
```
