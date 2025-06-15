import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { supabase } from '../../lib/supabaseClient';
import { Message } from '../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = await getSession({ req });
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Fetch all chat sessions for the user
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('messages')
      .eq('user_id', session.user.id);

    if (sessionsError) throw sessionsError;

    if (!sessions || sessions.length === 0) {
      return res.status(200).json({
        messageCount: 0,
        wordCount: 0,
        sessionCount: 0,
        averageSessionLength: 0,
        sentimentTrend: [],
        commonTopics: [],
      });
    }

    let totalMessages = 0;
    let totalWords = 0;
    const sessionCount = sessions.length;
    
    // A very basic sentiment simulation
    const sentimentTrend: { date: string, sentiment: number }[] = [];
    const topicKeywords = {
        anxiety: ['úzkost', 'strach', 'panika', 'bojim se'],
        relationships: ['vztah', 'partner', 'rodina', 'přítel', 'přítelkyně'],
        depression: ['deprese', 'smutek', 'smutný', 'bezmoc'],
        stress: ['stres', 'tlak', 'nestíhám', 'přetížený'],
        selfEsteem: ['sebevědomí', 'hodnota', 'nedostatečný', 'sebeúcta'],
    };
    const commonTopics: { topic: string, count: number }[] = [];

    sessions.forEach(session => {
      const messages: Message[] = session.messages || [];
      const userMessages = messages.filter(m => m.role === 'user');
      totalMessages += userMessages.length;
      
      let sessionSentiment = 0;
      let date = new Date().toISOString().split('T')[0]; // fallback date

      userMessages.forEach(msg => {
        totalWords += msg.content.split(' ').length;
        if (msg.timestamp) {
            date = new Date(msg.timestamp).toISOString().split('T')[0];
        }
        // Simplified sentiment logic
        if (msg.content.includes('šťastný') || msg.content.includes('super')) sessionSentiment++;
        if (msg.content.includes('smutný') || msg.content.includes('špatný')) sessionSentiment--;

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            keywords.forEach(keyword => {
                if (msg.content.toLowerCase().includes(keyword)) {
                    const existingTopic = commonTopics.find(t => t.topic === topic);
                    if (existingTopic) {
                        existingTopic.count++;
                    } else {
                        commonTopics.push({ topic, count: 1 });
                    }
                }
            });
        });
      });

      if(userMessages.length > 0) {
          sentimentTrend.push({ date, sentiment: sessionSentiment / userMessages.length });
      }
    });

    const averageSessionLength = totalMessages / sessionCount;

    res.status(200).json({
      messageCount: totalMessages,
      wordCount: totalWords,
      sessionCount,
      averageSessionLength: parseFloat(averageSessionLength.toFixed(1)),
      sentimentTrend,
      commonTopics: commonTopics.sort((a, b) => b.count - a.count).slice(0, 3),
    });

  } catch (error: any) {
    console.error('Error fetching user insights:', error);
    res.status(500).json({ error: 'Failed to fetch user insights', details: error.message });
  }
}
