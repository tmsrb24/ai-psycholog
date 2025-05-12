# AI Psycholog

Webová aplikace pro psychologickou podporu s využitím umělé inteligence.

## Funkce

- Chatovací rozhraní s AI asistentem
- Možnost výběru témat (úzkost, deprese, vztahy, stres, sebevědomí)
- Nastavení osobnosti asistenta (podporující, praktický, analytický, mentor, kouč, mediátor)
- Nastavení délky odpovědí (krátké, střední, dlouhé)
- Ukládání historie konverzací
- Analýza nálady v konverzaci
- Gamifikační prvky (odznaky, série dnů)
- Podpora tmavého režimu

## Technologie

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

## Instalace a spuštění

1. Naklonujte repozitář
   ```bash
   git clone https://github.com/tmsrb24/ai-psycholog.git
   cd ai-psycholog
   ```

2. Nainstalujte závislosti
   ```bash
   npm install
   ```

3. Spusťte vývojový server
   ```bash
   npm run dev
   ```

4. Otevřete [http://localhost:3000](http://localhost:3000) ve vašem prohlížeči

## Nasazení na Vercel

### Důležité: Nastavení Environment Variables

Pro správné fungování aplikace na Vercel je potřeba nastavit environment variables v Dashboardu Vercel:

1. Přihlaste se do [Vercel Dashboard](https://vercel.com/)
2. Vyberte váš projekt `ai-psycholog`
3. Přejděte do sekce "Settings" > "Environment Variables"
4. Přidejte následující proměnnou:
   - Název: `ANTHROPIC_API_KEY`
   - Hodnota: Váš API klíč z Anthropic (Claude)
   - Prostředí: Production, Preview, Development (všechny)

5. Klikněte na "Save" pro uložení proměnné

### Automatické nasazení pomocí GitHub Actions

Projekt je nakonfigurován pro automatické nasazení na Vercel pomocí GitHub Actions. Pro správné fungování je potřeba nastavit následující secrets v GitHub repozitáři:

1. Přejděte do nastavení GitHub repozitáře
2. Vyberte "Settings" > "Secrets and variables" > "Actions"
3. Přidejte následující secrets:
   - `VERCEL_TOKEN`: Váš Vercel token (získáte v [Vercel Dashboard](https://vercel.com/account/tokens))
   - `VERCEL_ORG_ID`: ID vaší organizace na Vercel (získáte v URL Vercel Dashboard)
   - `VERCEL_PROJECT_ID`: ID vašeho projektu na Vercel (získáte v nastavení projektu)

Po nastavení těchto secrets bude každý push do větve `main` automaticky nasazen na Vercel.

### Manuální nasazení

Pokud preferujete manuální nasazení, můžete použít Vercel CLI:

```bash
vercel
```

Pro produkční nasazení použijte:

```bash
vercel --prod
```

## Struktura projektu

- `/components` - React komponenty
- `/pages` - Next.js stránky a API endpointy
- `/styles` - CSS styly
- `/types` - TypeScript typy

## Licence

MIT
