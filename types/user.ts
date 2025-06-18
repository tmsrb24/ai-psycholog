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
