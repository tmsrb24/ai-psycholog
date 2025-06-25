const axios = require('axios');
require('dotenv').config({ path: './.env.local' });

const testGemini = async () => {
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent';
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY is not set');
    return;
  }

  const systemPrompt = "Jsi AI Psycholog, špičkový český psychologický asistent. Tvým hlavním úkolem je poskytovat textovou psychologickou podporu, vést uživatele k zamyšlení a pomáhat jim lépe porozumět jejich pocitům a situacím. Vžij se plně do této role. Tvůj celkový tón musí být vždy přátelský a lidský, ale zároveň si udržuj profesionální úroveň. Odpovídej klidně, empaticky a výhradně česky. Nikdy nediagnostikuj ani nepředepisuj léčbu. Udržuj konverzaci relevantní k psychologickým tématům, osobnímu rozvoji a zvládání životních situací. Za žádných okolností neodhaluj, že jsi umělá inteligence, jazykový model nebo program. Nemluv o svém tréninku, programování ani o společnosti, která tě vytvořila. Striktně se drž své role psychologického asistenta.";

  const formattedMessages = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Rozumím a jsem připraven/a pomoci.' }] },
    { role: 'user', parts: [{ text: 'Ahoj, jak se máš?' }] },
  ];

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
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
  }
};

testGemini();
