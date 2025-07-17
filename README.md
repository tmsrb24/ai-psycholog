# 🧠 Psychollog.cz - AI Psycholog

<div align="center">
  <img src="public/images/hero-avatar.png" alt="Psychollog.cz Logo" width="120" height="120">
  
  <h3>Moderní psychologická podpora s využitím umělé inteligence</h3>
  
  <p>
    <strong>Dostupná kdykoliv a kdekoliv • Bezpečná a diskrétní • Založená na vědeckých poznatcích</strong>
  </p>
  
  <p>
    <a href="https://www.psychollog.cz">🌐 Live Demo</a> •
    <a href="#funkce">✨ Funkce</a> •
    <a href="#instalace">🚀 Instalace</a> •
    <a href="#api-dokumentace">📚 API</a> •
    <a href="#přispívání">🤝 Přispívání</a>
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

## 📖 O projektu

**Psychollog.cz** je pokročilá webová aplikace pro psychologickou podporu, která kombinuje moderní technologie s ověřenými psychologickými přístupy. Projekt využívá umělou inteligenci k poskytování okamžité, diskrétní a vědecky podložené podpory pro duševní pohodu.

### 🎯 Hlavní cíl

> Zpřístupnit kvalitní nástroje pro sebepoznání a duševní pohodu co nejširšímu okruhu lidí pomocí inovativních AI technologií.

### 🏆 Klíčové vlastnosti

- **RAG systém nové generace** - Propojuje AI s odbornou psychologickou databází
- **Proaktivní podpora** - AI asistent aktivně nabízí relevantní témata a cvičení
- **Bezpečnostní systém** - Trojstupňový proces validace odpovědí
- **Krizová intervence** - Automatická detekce a reakce na krizové situace
- **Multijazyčnost** - Podpora češtiny, angličtiny a ukrajinštiny

---

## ✨ Funkce

### 🤖 AI Asistent
- **Inteligentní chatbot** s pokročilým porozuměním češtiny
- **Personalizace** - Volba pohlaví, jména a stylu komunikace
- **Tematické zaměření** - Úzkost, deprese, vztahy, stres, sebevědomí
- **Osobnostní styly** - Podporující, praktický, analytický, mentor
- **Flexibilní délka odpovědí** - Krátké, střední, dlouhé

### 📊 Analýza a tracking
- **Analýza nálady** v reálném čase
- **Sledování pokroku** s grafickými přehledy
- **Osobní deník** s možností exportu
- **Gamifikace** - Odznaky, série dnů, statistiky

### 🛡️ Bezpečnost a soukromí
- **End-to-end šifrování** konverzací
- **Anonymní použití** - Žádné sdílení dat s třetími stranami
- **Krizová detekce** - Automatické rozpoznání nebezpečných situací
- **Linka důvěry** - Přímé propojení s linkami pomoci

### 🎨 Uživatelské rozhraní
- **Moderní design** s animacemi (Framer Motion)
- **Tmavý/světlý režim** podle preference
- **Responzivní design** - Optimalizované pro všechna zařízení
- **PWA podpora** - Instalace jako nativní aplikace
- **Hlasový výstup** - Text-to-Speech v češtině

---

## 🏗️ Technologie

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

---

## 🚀 Instalace

### Předpoklady
- Node.js 18.0+
- npm nebo yarn
- Git

### Krok za krokem

1. **Klonování repozitáře**
   ```bash
   git clone https://github.com/tmsrb24/ai-psycholog.git
   cd ai-psycholog
   ```

2. **Instalace závislostí**
   ```bash
   npm install
   # nebo
   yarn install
   ```

3. **Nastavení environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Vyplňte následující proměnné:
   ```env
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # OAuth (volitelné)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Email (volitelné)
   EMAIL_FROM=noreply@psychollog.cz
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

4. **Spuštění databáze**
   ```bash
   # Pokud používáte lokální Supabase
   npx supabase start
   
   # Pro produkci - setup v Supabase Dashboard
   ```

5. **Spuštění vývojového serveru**
   ```bash
   npm run dev
   ```

6. **Otevření v prohlížeči**
   ```
   http://localhost:3000
   ```

---

## 📁 Struktura projektu

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

---

## 🌐 Nasazení

### Vercel (Doporučeno)

1. **Připojte GitHub repozitář**
   ```bash
   # Automatické nasazení z GitHub
   # https://vercel.com/new
   ```

2. **Nastavte environment variables**
   ```bash
   # V Vercel Dashboard > Settings > Environment Variables
   # Zkopírujte všechny proměnné z .env.local
   ```

3. **Deploy**
   ```bash
   # Automatické při push do main branch
   git push origin main
   ```

### Manuální nasazení

```bash
# Build pro produkci
npm run build

# Start produkčního serveru
npm run start

# Nebo použijte Vercel CLI
npx vercel --prod
```

---

## 📚 API Dokumentace

### Chat API

#### `POST /api/chat`
Odešle zprávu AI asistentovi

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Jak zvládnout stres?",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "topic": "stress",
  "personality": "supportive",
  "responseLength": "medium"
}
```

**Response:**
```json
{
  "role": "assistant",
  "content": "Stres můžete zvládnout pomocí...",
  "estimatedReadingTime": 45,
  "sessionId": "uuid-session-id"
}
```

#### `GET /api/chat`
Načte historii konverzace

**Response:**
```json
{
  "sessionId": "uuid-session-id",
  "messages": [
    {
      "role": "assistant",
      "content": "Dobrý den, jak vám mohu pomoci?",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Mood API

#### `POST /api/mood`
Uloží náladu uživatele

**Request:**
```json
{
  "mood": "happy",
  "intensity": 4,
  "note": "Dobrý den dnes"
}
```

---

## 🧪 Testování

```bash
# Spuštění testů
npm test

# Testování s watch módem
npm run test:watch

# Coverage report
npm run test:coverage

# E2E testy
npm run test:e2e
```

---

## 🤝 Přispívání

### Jak přispět

1. **Fork repozitář**
2. **Vytvořte feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit změny**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push do branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Otevřete Pull Request**

### Coding Standards

- **TypeScript** - Vždy používejte typy
- **ESLint** - Dodržujte linting pravidla
- **Prettier** - Formátování kódu
- **Conventional Commits** - Standardizované commit zprávy

### Development Scripts

```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Build
npm run build

# Analyze bundle
npm run analyze
```

---

## 🔒 Bezpečnost

### Hlášení bezpečnostních problémů

Pokud najdete bezpečnostní problém, prosím **NEOTEVÍREJTE** veřejný issue. Místo toho:

1. Pošlete email na: **security@psychollog.cz**
2. Popište problém detailně
3. Uveďte kroky k reprodukci
4. Počkejte na naši odpověď

### Bezpečnostní opatření

- **Content Security Policy** - Ochrana proti XSS
- **Rate Limiting** - Ochrana proti spam
- **Input Validation** - Sanitizace vstupů
- **HTTPS Only** - Šifrovaná komunikace
- **Environment Variables** - Bezpečné ukládání tajných klíčů

---

## 📊 Monitoring a Analytics

### Vercel Analytics
- **Performance monitoring**
- **User behavior tracking**
- **Error tracking**

### Supabase Analytics
- **Database performance**
- **API usage**
- **User activity**

---

## 📄 Licence

```
MIT License

Copyright (c) 2024 Tomáš Srb

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Poděkování

- **Google Gemini** - Za pokročilý AI model
- **Supabase** - Za spolehlivou databázovou infrastrukturu
- **Vercel** - Za excellent hosting platform
- **Open Source Community** - Za neocenitelné knihovny

---

## 📞 Kontakt

- **Email**: info@psychollog.cz
- **Web**: https://www.psychollog.cz
- **GitHub**: https://github.com/tmsrb24

---

<div align="center">
  <p><strong>Vytvořeno s ❤️ pro lepší duševní zdraví</strong></p>
  <p>© 2024 Psychollog.cz - Všechna práva vyhrazena</p>
</div>

---

## 🆘 Krizová pomoc

**Pokud jste v krizové situaci, neváhejte kontaktovat:**

- **Linka bezpečí**: 116 111 (nonstop, zdarma)
- **Linka první psychické pomoci**: 116 123 (nonstop, zdarma)
- **Záchranná služba**: 155
- **Tísňová linka**: 112

**Pomoc je vždy dostupná a anonymní.**
