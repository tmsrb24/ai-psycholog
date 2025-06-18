import { SupabaseClient } from '@supabase/supabase-js';

const crisisKeywords = ["chci se zabít", "nechci žít", "ukončit život", "sebevražda", "zabít se"];

export const checkForCrisis = (message: string): boolean => {
  return crisisKeywords.some(keyword => message.toLowerCase().includes(keyword));
};

export const getCrisisResponse = (): string => {
  return "Je mi moc líto, že se takhle cítíš. Vypadá to, že procházíš opravdu těžkým obdobím. Chtěl/a bych tě ujistit, že na to nemusíš být sám/sama. Existují lidé, kteří ti chtějí a mohou pomoci. Prosím, zvaž kontaktování některé z linek důvěry, jsou tu pro tebe nonstop a anonymně: Linka bezpečí 116 111, Linka první psychické pomoci 116 123. Pokud jsi v bezprostředním ohrožení, neváhej prosím zavolat na 155 nebo 112.";
};

export const saveCrisisMessage = async (supabaseAdmin: SupabaseClient, sessionId: string, content: string) => {
  await supabaseAdmin
    .from('chat_messages')
    .insert({ session_id: sessionId, role: 'assistant', content, metadata: { isCrisis: true } });
};
