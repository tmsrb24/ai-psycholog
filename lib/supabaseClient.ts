import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL not found. Did you forget to set NEXT_PUBLIC_SUPABASE_URL in your .env.local file?");
}

if (!supabaseAnonKey) {
  throw new Error("Supabase anon key not found. Did you forget to set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file?");
}

// Klient pro použití na straně klienta (frontend)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Klient pro použití na straně serveru (API routes) s administrátorskými právy
// Tento klient by se měl používat pouze v server-side kódu, kde je service_role klíč bezpečný.
let supabaseAdminSingleton: SupabaseClient | null = null;

export const getSupabaseAdmin = (): SupabaseClient => {
  if (supabaseAdminSingleton) {
    return supabaseAdminSingleton;
  }

  if (!supabaseServiceRoleKey) {
    // V produkci by toto mělo být fatální chyba, ale pro lokální vývoj můžeme fallbacknout na anon klienta s varováním,
    // i když to pak nemusí obcházet RLS.
    // Pro Vercel by tato proměnná měla být vždy nastavena.
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to anon client for admin operations. RLS might not be bypassed.");
    // V tomto případě by bylo lepší vyhodit chybu, pokud service_role je absolutně nutný.
    // throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. This is required for admin operations.");
    // Prozatím, pokud není service key, vrátíme standardního klienta, ale operace mohou selhat na RLS.
    // Lepší je zajistit, aby service key byl VŽDY dostupný na serveru.
    // Pokud service_role_key není dostupný, vyhodíme chybu, aby se problém řešil.
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. This is required for server-side admin operations.");
  }
  
  supabaseAdminSingleton = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // autoRefreshToken: false, // Není potřeba pro service_role
      // persistSession: false // Není potřeba pro service_role
    }
  });
  return supabaseAdminSingleton;
};

// Pro jednoduchost můžeme exportovat přímo instanci, pokud jsme si jisti, že kód běží jen na serveru
// a proměnná je dostupná. Ale getSupabaseAdmin() je bezpečnější pro lazy initialization.
// export const supabaseAdmin = getSupabaseAdmin(); // Toto by se volalo při importu, což nemusí být ideální.
