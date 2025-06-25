// app/api/mood/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../pages/api/auth/[...nextauth]"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { score, note } = await req.json();
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('mood_log')
    .upsert({ user_id: session.user.id, score, note });       // unique(user,day) zajistí update
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get('range') || '30';

  const { data, error } = await supabase
    .from('mood_log')
    .select('log_date, score')
    .eq('user_id', session.user.id)
    .order('log_date', { ascending: false })
    .limit(parseInt(range));

  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json(data);
}
