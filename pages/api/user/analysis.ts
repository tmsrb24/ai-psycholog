import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '../../../lib/supabaseClient';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  if (!token || !token.sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = token.sub;
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId);

    if (sessionsError) throw sessionsError;

    const sessionIds = sessions.map(s => s.id);

    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .select('content, timestamp')
      .in('session_id', sessionIds);

    if (messagesError) throw messagesError;
    
    const { data: user, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('session_count')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const messageCount = messages.length;
    const wordCount = messages.reduce((acc: number, msg: { content: string }) => acc + msg.content.split(' ').length, 0);
    const sessionCount = user.session_count;
    const averageSessionLength = sessionCount > 0 ? Math.round(messageCount / sessionCount) : 0;

    // This is a placeholder for a more sophisticated topic analysis
    const commonTopics = [
      { topic: 'Stres', count: 10 },
      { topic: 'Úzkost', count: 5 },
      { topic: 'Vztahy', count: 3 },
    ];

    const sentiment = new (require('sentiment'))();
    const sentimentScores = messages.map(msg => sentiment.analyze(msg.content).score);
    const averageSentiment = sentimentScores.length > 0 ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length : 0;

    res.status(200).json({
      messageCount,
      wordCount,
      sessionCount,
      averageSessionLength,
      commonTopics,
      averageSentiment,
    });
  } catch (error) {
    console.error('Error fetching user analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
