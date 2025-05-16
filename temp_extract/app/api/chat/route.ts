import { NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body?.messages || [];
  const userMessage = messages.at(-1)?.content || '';

  // 🚨 Bezpečnostní detekce krizové zprávy
  const krizovaSlova = ["chci se zabít", "nechci žít", "ukončit život"];
  const krizovaZprava = krizovaSlova.some(slovo => userMessage.toLowerCase().includes(slovo));

  if (krizovaZprava) {
    return NextResponse.json({
      role: "assistant",
      content:
        "Je mi moc líto, že se takhle cítíš. Nejsi na to sám – doporučuji zavolat na Linku první psychické pomoci (📞 116 123) nebo Linku bezpečí (📞 116 111). Mluvím s tebou dál, ale bezpečí je teď nejdůležitější."
    });
  }

  // 🧠 Kontextová paměť (např. posledních 3 zpráv)
  const context = messages.slice(-3).map(m => ({ role: m.role, parts: [{ text: m.content }] }));

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: context,
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 800
      }
    })
  });

  const data = await res.json();
  const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Omlouvám se, momentálně nedokážu odpovědět.";

  return NextResponse.json({
    role: "assistant",
    content: output
  });
}
