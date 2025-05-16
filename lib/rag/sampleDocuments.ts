import { Document } from './types';
import { ragService } from './ragService';

/**
 * Sample documents for the RAG system
 * These documents contain information about various psychological topics
 */
export const sampleDocuments: Document[] = [
  {
    id: 'anxiety-overview',
    content: `Úzkost je přirozená emocionální reakce na stres nebo nebezpečí. Když se však úzkost stává chronickou nebo nepřiměřenou situaci, může se jednat o úzkostnou poruchu. Mezi běžné příznaky patří nervozita, pocit nebezpečí, zvýšená tepová frekvence, rychlé dýchání, pocení, třes, potíže se soustředěním a problémy se spánkem. Úzkostné poruchy jsou léčitelné kombinací psychoterapie (zejména kognitivně-behaviorální terapie), relaxačních technik, změn životního stylu a v některých případech medikace.`,
    metadata: {
      title: 'Úzkost - přehled',
      category: 'anxiety',
      tags: ['úzkost', 'příznaky', 'léčba']
    }
  },
  {
    id: 'anxiety-coping',
    content: `Pro zvládání úzkosti existuje mnoho účinných strategií. Mezi ně patří: 1) Dechová cvičení - hluboké, pomalé dýchání může snížit fyzické příznaky úzkosti. 2) Progresivní svalová relaxace - postupné napínání a uvolňování svalových skupin. 3) Mindfulness a meditace - zaměření na přítomný okamžik bez hodnocení. 4) Pravidelné cvičení - fyzická aktivita pomáhá uvolňovat napětí a zlepšuje náladu. 5) Omezení kofeinu a alkoholu - tyto látky mohou zhoršovat úzkost. 6) Dostatečný spánek - nedostatek spánku může zhoršovat úzkostné stavy. 7) Kognitivní restrukturalizace - identifikace a změna negativních myšlenkových vzorců.`,
    metadata: {
      title: 'Strategie zvládání úzkosti',
      category: 'anxiety',
      tags: ['úzkost', 'zvládání', 'techniky']
    }
  },
  {
    id: 'depression-overview',
    content: `Deprese je duševní onemocnění charakterizované přetrvávajícím smutkem, ztrátou zájmu o aktivity, které byly dříve příjemné, a neschopností vykonávat každodenní činnosti. Může zahrnovat pocity beznaděje, bezcennosti, viny, poruchy spánku a chuti k jídlu, únavu a potíže s koncentrací. Deprese není jen "špatná nálada" a nelze ji překonat "silnou vůlí". Je to komplexní stav, který vyžaduje odbornou pomoc. Léčba obvykle zahrnuje psychoterapii, medikaci (antidepresiva) nebo jejich kombinaci. Včasná intervence může výrazně zlepšit prognózu.`,
    metadata: {
      title: 'Deprese - přehled',
      category: 'depression',
      tags: ['deprese', 'příznaky', 'léčba']
    }
  },
  {
    id: 'depression-coping',
    content: `Při zvládání deprese mohou pomoci následující strategie: 1) Vyhledání odborné pomoci - psycholog nebo psychiatr může poskytnout účinnou léčbu. 2) Pravidelná fyzická aktivita - i mírné cvičení může zlepšit náladu díky uvolňování endorfinů. 3) Stanovení realistických cílů - rozdělení velkých úkolů na menší, zvládnutelné kroky. 4) Sociální podpora - udržování kontaktu s přáteli a rodinou. 5) Vyhýbání se izolaci - i když je to těžké, sociální interakce jsou důležité. 6) Strukturovaný denní režim - pravidelný spánek, jídlo a aktivity. 7) Mindfulness a relaxační techniky - pomáhají snížit stres a zlepšit přítomný okamžik. 8) Vyhýbání se alkoholu a drogám - tyto látky mohou zhoršit příznaky deprese.`,
    metadata: {
      title: 'Strategie zvládání deprese',
      category: 'depression',
      tags: ['deprese', 'zvládání', 'techniky']
    }
  },
  {
    id: 'relationships-communication',
    content: `Efektivní komunikace je základem zdravých vztahů. Zahrnuje jasné vyjadřování vlastních potřeb a pocitů, aktivní naslouchání druhým a respektování jejich perspektivy. Techniky efektivní komunikace zahrnují: 1) Používání "já" výroků místo obviňování ("Cítím se zraněný, když..." místo "Ty vždycky..."). 2) Reflektivní naslouchání - parafrázování toho, co druhý řekl, abyste ukázali, že rozumíte. 3) Ověřování porozumění - ujištění se, že jste správně pochopili sdělení druhého. 4) Neverbální komunikace - udržování očního kontaktu, otevřená řeč těla. 5) Vhodné načasování - výběr vhodné doby pro důležité rozhovory. 6) Respektování hranic - uznání práva druhého na soukromí a vlastní prostor.`,
    metadata: {
      title: 'Efektivní komunikace ve vztazích',
      category: 'relationships',
      tags: ['vztahy', 'komunikace', 'dovednosti']
    }
  },
  {
    id: 'relationships-conflict',
    content: `Konflikty jsou přirozenou součástí všech vztahů, ale způsob jejich řešení může vztah buď posílit, nebo oslabit. Zdravé řešení konfliktů zahrnuje: 1) Zaměření na problém, ne na osobu - vyhýbání se osobním útokům. 2) Naslouchání perspektivě druhého - snaha o pochopení jeho pohledu. 3) Kompromis - hledání řešení, které částečně uspokojí obě strany. 4) Vyjadřování potřeb a pocitů bez obviňování. 5) Vyhýbání se eskalaci - rozpoznání, kdy je potřeba udělat přestávku. 6) Odpuštění - schopnost nechat minulé konflikty za sebou. 7) Zaměření na řešení - hledání konkrétních kroků k nápravě situace. 8) Respektování rozdílů - uznání, že odlišné názory jsou normální.`,
    metadata: {
      title: 'Řešení konfliktů ve vztazích',
      category: 'relationships',
      tags: ['vztahy', 'konflikty', 'řešení']
    }
  },
  {
    id: 'stress-overview',
    content: `Stres je přirozená fyzická a psychická reakce na životní požadavky. Krátkodobý stres může být motivující, ale chronický stres může vést k vážným zdravotním problémům, včetně kardiovaskulárních onemocnění, poruch imunitního systému, úzkosti a deprese. Mezi běžné příznaky stresu patří bolesti hlavy, napětí svalů, únava, poruchy spánku, podrážděnost a potíže se soustředěním. Stres může být způsoben mnoha faktory, včetně pracovního tlaku, finančních problémů, vztahových konfliktů, velkých životních změn a každodenních starostí. Rozpoznání zdrojů stresu je prvním krokem k jeho efektivnímu zvládání.`,
    metadata: {
      title: 'Stres - přehled',
      category: 'stress',
      tags: ['stres', 'příznaky', 'příčiny']
    }
  },
  {
    id: 'stress-management',
    content: `Efektivní zvládání stresu zahrnuje různé techniky a změny životního stylu: 1) Identifikace stresorů - rozpoznání situací, které způsobují stres. 2) Fyzická aktivita - pravidelné cvičení pomáhá uvolňovat napětí a zlepšuje náladu. 3) Relaxační techniky - hluboké dýchání, progresivní svalová relaxace, meditace. 4) Zdravá strava - vyvážená strava podporuje odolnost vůči stresu. 5) Dostatečný spánek - nedostatek spánku zhoršuje stres. 6) Stanovení hranic - naučit se říkat "ne" a delegovat úkoly. 7) Časový management - plánování a stanovení priorit. 8) Sociální podpora - sdílení starostí s důvěryhodnými lidmi. 9) Koníčky a volnočasové aktivity - věnování času činnostem, které přinášejí radost. 10) Profesionální pomoc - vyhledání terapeuta, pokud je stres nezvladatelný.`,
    metadata: {
      title: 'Techniky zvládání stresu',
      category: 'stress',
      tags: ['stres', 'zvládání', 'techniky']
    }
  },
  {
    id: 'self-esteem-overview',
    content: `Sebevědomí (sebeúcta) je celkové subjektivní hodnocení vlastní hodnoty. Zdravé sebevědomí zahrnuje realistické vnímání vlastních silných stránek a omezení, přijetí sebe sama a pocit vlastní hodnoty nezávisle na vnějších okolnostech. Nízké sebevědomí může vést k negativnímu sebehodnocení, přehnané sebekritice, sociální úzkosti a depresi. Může být ovlivněno mnoha faktory, včetně dětských zkušeností, sociálního srovnávání, úspěchů a neúspěchů, tělesného obrazu a zpětné vazby od druhých. Sebevědomí není fixní a může se v průběhu života měnit.`,
    metadata: {
      title: 'Sebevědomí - přehled',
      category: 'self-esteem',
      tags: ['sebevědomí', 'sebeúcta', 'sebehodnocení']
    }
  },
  {
    id: 'self-esteem-building',
    content: `Pro budování zdravého sebevědomí lze využít následující strategie: 1) Identifikace a zpochybnění negativních přesvědčení o sobě - rozpoznání a změna iracionálních myšlenek. 2) Zaměření na silné stránky - uvědomění si vlastních schopností a úspěchů. 3) Stanovení a dosahování realistických cílů - postupné budování pocitu kompetence. 4) Péče o sebe - fyzická aktivita, zdravá strava, dostatečný odpočinek. 5) Asertivita - vyjadřování vlastních potřeb a stanovení zdravých hranic. 6) Přijetí nedokonalostí - uznání, že chyby a nedostatky jsou součástí lidské zkušenosti. 7) Omezení srovnávání s ostatními - každý má jedinečnou cestu. 8) Obklopení se podporujícími lidmi - trávení času s těmi, kteří oceňují vaši hodnotu. 9) Pozitivní afirmace - pravidelné připomínání vlastních pozitivních vlastností.`,
    metadata: {
      title: 'Budování zdravého sebevědomí',
      category: 'self-esteem',
      tags: ['sebevědomí', 'budování', 'techniky']
    }
  }
];

/**
 * Initialize the RAG system with sample documents
 */
export async function initializeRagWithSamples(): Promise<void> {
  console.log('Initializing RAG system with sample documents...');
  await ragService.addDocuments(sampleDocuments);
  console.log(`Added ${sampleDocuments.length} sample documents to the RAG system`);
}
