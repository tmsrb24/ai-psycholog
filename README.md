# AI Psycholog

Chatbot pro psychologickou podporu v češtině s využitím AI.

## Funkce

- 💬 **Chatovací rozhraní** - Intuitivní a přehledné rozhraní pro konverzaci
- 🧠 **Pokročilá AI** - Využívá Claude od Anthropic pro kvalitní a empatické odpovědi v češtině
- 🚨 **Detekce krizových situací** - Automaticky rozpozná potenciálně krizové situace a nabídne kontakty na odbornou pomoc
- 📚 **Tematičtí průvodci** - Specializované režimy pro různá témata (úzkost, vztahy, deprese, stres, sebevědomí)
- 👤 **Personalizace** - Možnost výběru osobnosti asistenta (podporující, praktický, analytický)
- 🔊 **Text-to-Speech** - Možnost nechat si odpovědi přečíst nahlas
- 📝 **Ukládání historie** - Možnost ukládat a načítat předchozí konverzace

## Instalace

1. Naklonujte repozitář:
   ```bash
   git clone https://github.com/tmsrb24/ai-psycholog.git
   cd ai-psycholog
   ```

2. Nainstalujte závislosti:
   ```bash
   npm install
   ```

3. Vytvořte soubor `.env.local` v kořenovém adresáři a přidejte svůj Anthropic API klíč:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

4. Spusťte vývojový server:
   ```bash
   npm run dev
   ```

5. Otevřete [http://localhost:3000](http://localhost:3000) ve vašem prohlížeči.

## Technologie

- **Frontend**: Next.js, React, TailwindCSS
- **API**: Anthropic Claude API
- **Funkce**: Text-to-Speech, detekce krizových situací, ukládání historie

## Struktura projektu

- `/pages` - Next.js stránky
  - `/api` - API endpointy
  - `/index.tsx` - Hlavní stránka s chatem
- `/styles` - CSS styly
- `/public` - Statické soubory

## Použití

### Témata

Aplikace nabízí specializované režimy pro různá témata:
- **Úzkost** - Průvodce pro zvládání úzkosti a úzkostných stavů
- **Vztahy** - Průvodce pro řešení vztahových problémů
- **Deprese** - Průvodce pro zvládání depresivních stavů
- **Stres** - Průvodce pro zvládání stresu
- **Sebevědomí** - Průvodce pro budování zdravého sebevědomí

### Osobnosti asistenta

Můžete si vybrat z různých osobností asistenta:
- **Podporující** - Empatický a chápavý přístup
- **Praktický** - Zaměřený na konkrétní řešení
- **Analytický** - Hloubkový a reflektivní přístup

### Text-to-Speech

Kliknutím na ikonu reproduktoru u zprávy asistenta si můžete nechat odpověď přečíst nahlas.

### Historie konverzací

Pokud máte zapnuté ukládání historie, můžete:
- Ukládat aktuální konverzaci
- Načítat předchozí konverzace
- Mazat uložené konverzace

## Licence

MIT

## Plánovaná vylepšení

V budoucích verzích plánujeme implementovat následující vylepšení:

### 1. UX / UI vylepšení

- **Responzivní design** - Optimalizace pro mobilní prohlížeče, tablety i desktop
- **Témata / skinning** - Světlý/tmavý režim, volba barevné palety
- **Avataři a animace** - Malý empatický avatar, „psací" indikátor, mikro-animace při odeslání
- **Stavové indikátory** - Zobrazování % načítání, odhadovaná délka odpovědi, počet znaků
- **Uživatelské profily** - Jméno, ikonka, možnost vrátit se k předchozím sezením

### 2. Rozšíření AI logiky

- **Více rolí / osobností** - Kromě „empatického psychologa" nabídnout i „mentora", „mediátora", „kouče"
- **Fine-tuning na českých datech** - Doladit LLM na anonymizovaných rozhovorech skutečných terapeutů
- **RAG pro české zdroje** - Připojit články, knihy, cizelované odpovědi – zlepšit přesnost odborných informací
- **Sentiment analýza** - Před zodpovězením dotazu nejprve zanalyzovat náladu a podle toho volit styl odpovědi
- **Detekce opakujících se vzorců** - Upozornit uživatele, když se vrací ke stejnému tématu (možnost journalingu)

### 3. Nové funkce

- **Krizové zóny** - Pokud uživatel zmíní sebepoškození či sebevraždu, okamžitě nabídnout linky pomoci + zavřít citlivou smyčku
- **Ukládání a prohlížení historie** - Seřazení podle témat, export do PDF, soukromé poznámky
- **Denní/týdenní shrnutí** - Autogenerované reporty o náladách, pokroku, doporučených cvičeních
- **Tematické moduly** - Mini-kurzy na úzkost, stres, sebevědomí – strukturované lekce s AI průvodcem
- **Gamifikace** - Odznaky za pravidelnou aktivitu, milníky („10 sezení"), motivační zprávy

### 4. Hlas a multimodalita

- **Text-to-Speech / Speech-to-Text** - Umožnit mluvenou konverzaci (Whisper + ElevenLabs / Web Speech API)
- **Video-avatar** - Jednoduchý 2D/3D avatar, který „mluví" s uživatelem (SadTalker, Live2D)
- **Multimodální vstup** - Uživatel nahraje krátké video či audio, AI nabídne analýzu tónu hlasu či výrazu obličeje

### 5. Personalizace a adaptace

- **Profilové nastavení** - Oblíbený styl komunikace, délka odpovědí, četnost check-inů
- **Adaptive learning** - AI se učí z předchozí historie a upravuje strategii (více otázek vs. návrh cvičení)
- **Remindery a úkoly** - Integrovat připomínky (automations) pro dechová cvičení, journaling, meditace

### 6. Architektura a provoz

- **CI/CD pipeline** - GitHub Actions test + lint + deployment na Vercel/Railway
- **Container orchestrace** - Docker + systemd / PM2 / Kubernetes pro škálování backendu
- **Monitoring a logging** - Prometheus + Grafana pro latence API, využití tokenů, chybovost
- **Rate-limiting & auth** - Zabezpečit endpointy, API klíče pro klienty, ochrana proti DoS
