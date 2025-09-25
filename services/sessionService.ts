import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfileData } from '../types/user';

type TopicKey = 'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | 'general';
type PersonalityKey = 'supportive' | 'practical' | 'analytical' | 'neutral';
type ResponseLength = 'short' | 'medium' | 'long';

interface CreateSessionParams {
  userId: string;
  userMessageContent: string;
  topicKey: TopicKey;
  personalityKey: PersonalityKey;
  responseLength: ResponseLength | undefined;
  assistantGender: 'male' | 'female' | undefined;
  assistantName: string | undefined;
  userProfile: UserProfileData | undefined;
}

export const getOrCreateSession = async (
  supabaseAdmin: SupabaseClient,
  sessionId: string | undefined,
  params: CreateSessionParams
): Promise<string> => {
  if (sessionId) {
    return sessionId;
  }

  const {
    userId,
    userMessageContent,
    topicKey,
    personalityKey,
    responseLength,
    userProfile,
    assistantGender,
    assistantName,
  } = params;

  const sessionTitle = userMessageContent.substring(0, 70) + (userMessageContent.length > 70 ? '...' : '');
  const sessionMetadata = {
    topic: topicKey,
    personality: personalityKey,
    responseLength,
    assistantGender: assistantGender || userProfile?.preferences?.assistantGender,
    assistantName: assistantName || userProfile?.preferences?.assistantName,
  };

  const { data: newSession, error: sessionError } = await supabaseAdmin
    .from('chat_sessions')
    .insert({ user_id: userId, title: sessionTitle, metadata: sessionMetadata })
    .select('id')
    .single();

  if (sessionError) {
    console.error('Error creating new chat session:', sessionError);
    throw sessionError;
  }

  console.log(`New chat session created: ${newSession.id}`);
  return newSession.id;
};

export const saveUserMessage = async (
  supabaseAdmin: SupabaseClient,
  sessionId: string,
  content: string
) => {
  await supabaseAdmin
    .from('chat_messages')
    .insert({ session_id: sessionId, role: 'user', content });
};
