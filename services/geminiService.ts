import axios from 'axios';
import { Message } from '../types/chat';
import { UserProfileData } from '../types/user';
import { searchPubMedRAG } from '../lib/ragPubMedService';
import { validateAIResponse } from '../lib/responseValidation';

type TopicKey = 'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | 'general';
type PersonalityKey = 'supportive' | 'practical' | 'analytical' | 'neutral';
type ResponseLength = 'short' | 'medium' | 'long';

const TOPIC_PROMPTS: Record<TopicKey, string> = {
  general: "Tvým hlavním zaměřením je obecná psychologická pohoda a podpora osobního rozvoje. Pomáhej uživatelům prozkoumávat jejich pocity a myšlenky v bezpečném prostředí.",
  anxiety: "Jsi expert na zvládání úzkosti. Tvým úkolem je poskytovat klidné, praktické a vědecky podložené rady. Aktivně nabízej techniky jako kognitivně-behaviorální přístupy, mindfulness, dechová cvičení a strategie pro zvládání panických atak.",
  relationships: "Jsi specialista na vztahovou terapii. Pomáhej řešit problémy v komunikaci, konflikty a budovat zdravější vztahy. Poskytuj vyvážené, nestranné a praktické rady.",
  depression: "Jsi odborník na podporu při depresivních stavech. Poskytuj hluboce empatické, chápavé a praktické rady. Zdůrazňuj význam malých kroků a sebepéče. Vždy jemně připomínej možnost a důležitost odborné pomoci, pokud je to vhodné.",
  stress: "Jsi specialista na zvládání stresu. Nabízej konkrétní a praktické techniky pro redukci stresu, zlepšení time managementu a dosažení work-life balance. Pomáhej identifikovat stresory a budovat odolnost.",
  selfEsteem: "Jsi expert na budování zdravého sebevědomí a pozitivního sebeobrazu. Poskytuj podporující a praktické rady pro zlepšení sebehodnoty, překonání negativního vnitřního dialogu a stanovování osobních cílů."
};

const PERSONALITY_PROMPTS: Record<PersonalityKey, string> = {
  neutral: "Tvůj komunikační styl je vyvážený, objektivní a věcný. Soustředíš se na fakta a logické argumenty, přičemž si zachováváš profesionální odstup.",
  supportive: "Tvůj komunikační styl je mimořádně empatický, vřelý, laskavý a trpělivý. Aktivně projevuj porozumění a soucit. Používej hodně povzbuzujících slov, ujištění a validuj pocity uživatele. Vytvářej atmosféru bezpečí a důvěry.",
  practical: "Tvůj komunikační styl je přímý, strukturovaný a zaměřený na konkrétní řešení. Nabízej jasné, akční kroky, strategie a praktické tipy. Buď stručný a efektivní, ale stále citlivý k potřebám uživatele.",
  analytical: "Tvůj komunikační styl je hloubkový, zvídavý a reflektivní. Pomáhej uživatelům porozumět příčinám jejich problémů a hlubším souvislostem. Kladeš podnětné otázky, které vedou k sebereflexi a vhledu."
};

const CORE_INSTRUCTIONS = "Jsi AI Psycholog, špičkový český psychologický asistent. Tvým hlavním úkolem je poskytovat textovou psychologickou podporu, vést uživatele k zamyšlení a pomáhat jim lépe porozumět jejich pocitům a situacím. Vžij se plně do této role. Tvůj celkový tón musí být vždy přátelský a lidský, ale zároveň si udržuj profesionální úroveň. Odpovídej klidně, empaticky a výhradně česky. Nikdy nediagnostikuj ani nepředepisuj léčbu. Udržuj konverzaci relevantní k psychologickým tématům, osobnímu rozvoji a zvládání životních situací. Za žádných okolností neodhaluj, že jsi umělá inteligence, jazykový model nebo program. Nemluv o svém tréninku, programování ani o společnosti, která tě vytvořila. Striktně se drž své role psychologického asistenta.";

const buildSystemPrompt = (
  topicKey: TopicKey,
  personalityKey: PersonalityKey,
  responseLength: ResponseLength | undefined,
  userProfile: UserProfileData | undefined
): string => {
  let systemPrompt = CORE_INSTRUCTIONS;
  let specificInstructions = "";

  if (userProfile?.preferences?.assistantGender) {
    specificInstructions += ` Jsi ${userProfile.preferences.assistantGender === 'male' ? 'muž' : 'žena'}.`;
  }
  if (userProfile?.preferences?.assistantName) {
    specificInstructions += ` Tvé jméno je ${userProfile.preferences.assistantName}. Používej toto jméno, když mluvíš o sobě nebo když se tě na něj někdo zeptá.`;
  }
  
  specificInstructions += ` ${PERSONALITY_PROMPTS[personalityKey]}`;
  specificInstructions += ` ${TOPIC_PROMPTS[topicKey]}`;
  
  if (responseLength) {
    specificInstructions += ` Preferuješ odpovědi, které jsou spíše ${responseLength === 'short' ? 'krátké a výstižné' : responseLength === 'medium' ? 'středně dlouhé a vyvážené' : 'delší, detailnější a propracovanější'}.`;
  }
  
  systemPrompt += specificInstructions;
  console.log("Final System Prompt for POST:", systemPrompt);
  return systemPrompt;
};

const formatMessagesForGemini = async (
  messages: Message[],
  systemPrompt: string,
  userMessageContent: string
): Promise<any[]> => {
  const formattedMessages: any[] = [];
  formattedMessages.push({ role: 'user', parts: [{ text: systemPrompt }] });
  formattedMessages.push({ role: 'model', parts: [{ text: 'Rozumím a jsem připraven/a pomoci.' }] });

  const historyMessages = messages.slice(0, -1); 
  historyMessages.filter(m => m.role === 'user' || m.role === 'assistant')
          .forEach(msg => {
            formattedMessages.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }]
            });
          });
  
  let ragContextString = "";
  const pubmedResults = await searchPubMedRAG(userMessageContent, 2);
  if (pubmedResults && pubmedResults.length > 0) {
    ragContextString = "\n\nPro tvou informaci, zde jsou některé relevantní úryvky z odborných článků, které by ti mohly pomoci lépe odpovědět (tyto informace neukazuj přímo uživateli, ale použij je k formulaci odpovědi):\n";
    pubmedResults.forEach(chunk => {
      ragContextString += `Zdroj: ${chunk.source}\nÚryvek: ${chunk.chunkText}\n\n`;
    });
    if (ragContextString.length > 3000) {
        ragContextString = ragContextString.substring(0, 3000) + "... (kontext zkrácen)";
    }
  }
  const userMessageWithContext = ragContextString ? `${userMessageContent}${ragContextString}` : userMessageContent;
  formattedMessages.push({ role: 'user', parts: [{ text: userMessageWithContext }] });

  return formattedMessages;
};

export const getGeminiResponse = async (
  messages: Message[],
  topicKey: TopicKey,
  personalityKey: PersonalityKey,
  responseLength: ResponseLength | undefined,
  userProfile: UserProfileData | undefined,
  userMessageContent: string
): Promise<{ content: string; estimatedReadingTime: number }> => {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return {
      content: `Dobrý den! (Simulovaná odpověď - API klíč chybí)`,
      estimatedReadingTime: 3,
    };
  }

  const systemPrompt = buildSystemPrompt(topicKey, personalityKey, responseLength, userProfile);
  const formattedMessages = await formatMessagesForGemini(messages, systemPrompt, userMessageContent);
  
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

  try {
    const response = await axios({
      method: 'post',
      url: `${GEMINI_API_URL}?key=${geminiApiKey}`,
      headers: { 'Content-Type': 'application/json' },
      data: { 
        contents: formattedMessages, 
        generationConfig: { 
          temperature: 0.75,
          topK: 40, 
          topP: 0.95, 
          maxOutputTokens: 1024
        } 
      }
    });
    const geminiData = response.data;
    if (geminiData.error) throw new Error(geminiData.error.message || 'Gemini API error');
    
    let responseContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Omlouvám se, momentálně nedokážu odpovědět.";
    
    const validationResult = validateAIResponse(responseContent);
    if (!validationResult.isValid) {
      console.warn(`AI Response Validation Failed: ${validationResult.issue}. Original: "${responseContent}". Suggestion: "${validationResult.suggestion}"`);
      if (validationResult.issue?.includes("undesirable phrase")) {
         responseContent = "Prosím, soustřeďme se na vaši situaci. Jak vám mohu dnes pomoci v rámci mé role psychologického asistenta?";
      } else {
        responseContent = validationResult.suggestion || "Omlouvám se, došlo k interní chybě. Zkuste to prosím znovu.";
      }
    }
    
    return {
      content: responseContent,
      estimatedReadingTime: Math.ceil(responseContent.length / 1000 * 60 / 200),
    };
  } catch (apiError: any) {
    console.error('Error calling Gemini API:', apiError.response?.data || apiError.message);
    const errorContent = `Omlouvám se, problém s AI. (Chyba: ${apiError?.message || 'Neznámá chyba'})`;
    return {
      content: errorContent,
      estimatedReadingTime: 3,
    };
  }
};
