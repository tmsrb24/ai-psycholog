#  Psychollog.cz 

<div align="center">
  <img src="public/images/hero-avatar.png" alt="Psychollog.cz Logo" width="120" height="120">
  
  <h3>Moderní psychologická podpora s využitím umělé inteligence</h3>
  
  <p>
    <strong>Dostupná kdykoliv a kdekoliv • Bezpečná a diskrétní • Založená na vědeckých poznatcích</strong>
  </p>
  

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase" alt="Supabase">
    <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google" alt="Google Gemini">
  </p>
</div>

---

##  O projektu

**Psychollog.cz** je pokročilá webová aplikace pro psychologickou podporu, která kombinuje moderní technologie s ověřenými psychologickými přístupy. Projekt využívá umělou inteligenci k poskytování okamžité, diskrétní a vědecky podložené podpory pro duševní pohodu.

###  Hlavní cíl

> Zpřístupnit kvalitní nástroje pro sebepoznání a duševní pohodu co nejširšímu okruhu lidí pomocí inovativních AI technologií.

###  Klíčové vlastnosti

- **RAG systém** - Propojuje AI s odbornou psychologickou databází
- **Proaktivní podpora** - AI asistent aktivně nabízí relevantní témata a cvičení
- **Bezpečnostní systém** - Trojstupňový proces validace odpovědí
- **Krizová intervence** - Automatická detekce a reakce na krizové situace
- **Multijazyčnost** - Podpora češtiny, angličtiny a ukrajinštiny

---

##  Funkce

###  AI Asistent
- **Inteligentní chatbot** s pokročilým porozuměním češtiny
- **Personalizace** - Volba pohlaví, jména a stylu komunikace
- **Tematické zaměření** - Úzkost, deprese, vztahy, stres, sebevědomí
- **Osobnostní styly** - Podporující, praktický, analytický, mentor
- **Flexibilní délka odpovědí** - Krátké, střední, dlouhé

###  Analýza a tracking
- **Analýza nálady** v reálném čase
- **Sledování pokroku** s grafickými přehledy
- **Osobní deník** s možností exportu
- **Gamifikace** - Odznaky, série dnů, statistiky

###  Bezpečnost a soukromí
- **End-to-end šifrování** konverzací
- **Anonymní použití** - Žádné sdílení dat s třetími stranami
- **Krizová detekce** - Automatické rozpoznání nebezpečných situací
- **Linka důvěry** - Přímé propojení s linkami pomoci

###  Uživatelské rozhraní
- **Moderní design** s animacemi (Framer Motion)
- **Tmavý/světlý režim** podle preference
- **Responzivní design** - Optimalizované pro všechna zařízení
- **PWA podpora** - Instalace jako nativní aplikace
- **Hlasový výstup** - Text-to-Speech v češtině

---

##  Technologie

### Frontend
- **Next.js 15** - React framework s SSR/SSG
- **TypeScript 5.0** - Typová bezpečnost
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Framer Motion** - Pokročilé animace
- **React Query** - Správa server state
- **Next-i18next** - Internationalizace

### Backend & AI
- **Google Gemini 1.5 Pro** - Pokročilý jazykový model
- **Supabase** - BaaS s PostgreSQL
- **NextAuth.js** - Autentizace a autorizace
- **Xenova Transformers** - Lokální embeddings
- **RAG Pipeline** - Retrieval-Augmented Generation

### Infrastruktura
- **Vercel** - Deployment a hosting
- **Vercel Analytics** - Monitoring výkonu
- **PubMed API** - Vědecké články
- **SendGrid** - Email služby



##  Struktura projektu

```
ai-psycholog/
├── 📁 components/          # React komponenty
│   ├── 📁 chat/           # Chat specifické komponenty
│   ├── 📁 layouts/        # Layout komponenty
│   ├── 📁 mood/           # Mood tracking komponenty
│   └── 📁 ui/             # UI komponenty
├── 📁 pages/              # Next.js stránky a API routes
│   ├── 📁 api/            # API endpointy
│   ├── 📁 auth/           # Autentizace stránky
│   └── 📄 index.tsx       # Hlavní stránka
├── 📁 lib/                # Utility knihovny
│   ├── 📁 rag/            # RAG systém
│   └── 📄 supabaseClient.ts
├── 📁 services/           # Business logika
│   ├── 📄 geminiService.ts
│   └── 📄 crisisService.ts
├── 📁 styles/             # CSS styly
├── 📁 types/              # TypeScript typy
├── 📁 public/             # Statické soubory
└── 📄 README.md
```


Copyright (c) 2024 Tomáš Srb


