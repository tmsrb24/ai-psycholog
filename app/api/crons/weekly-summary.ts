export const runtime = 'edge';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: users } = await supabase.from('auth.users').select('id, email');
  const lastWeek = new Date(Date.now() - 7*24*60*60*1000);
  for (const u of users!) {
    const { data } = await supabase
      .from('mood_log')
      .select('score')
      .eq('user_id', u.id)
      .gte('log_date', lastWeek.toISOString().slice(0,10));
    if (!data?.length) continue;
    const avg = data.reduce((a,b)=>a+b.score,0)/data.length;
    await resend.emails.send({
      to: u.email,
      from: 'no-reply@psychollog.cz',
      subject: 'Váš týdenní přehled nálady',
      html: `<p>Průměrná nálada: ${avg.toFixed(1)} / 5</p>`
    });
  }
}
