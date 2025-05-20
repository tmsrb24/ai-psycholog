// Define the Message type with strict role values
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  isCrisis?: boolean; // Přidána volitelná vlastnost
}

// Define the API response type
export interface ApiResponse {
  role: string;
  content: string;
  isCrisis?: boolean;
  sentiment?: {
    score: number;
    comparative: number;
  };
  estimatedReadingTime?: number;
}

// User profile types
export type ResponseLength = 'short' | 'medium' | 'long';
export type CommunicationStyle = 'formal' | 'casual';
export type NotificationFrequency = 'none' | 'daily' | 'weekly';
export type AssistantGender = 'male' | 'female';

export interface UserProfileData {
  name: string;
  avatar_url: string | null; // Změněno z avatar na avatar_url
  preferences: {
    responseLength: ResponseLength;
    communicationStyle: CommunicationStyle;
    notificationFrequency: NotificationFrequency;
    assistantGender?: AssistantGender;
    assistantName?: string;
  };
}
