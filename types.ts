// Define the Message type with strict role values
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: Date;
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

export interface UserProfileData {
  name: string;
  avatar: string | null;
  preferences: {
    responseLength: ResponseLength;
    communicationStyle: CommunicationStyle;
    notificationFrequency: NotificationFrequency;
  };
}
