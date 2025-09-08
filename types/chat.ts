// Define the Message type with strict role values
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id?: string; // Přidáno volitelné ID pro zprávy (např. z DB)
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
  code?: string;
}
