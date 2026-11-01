export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  careerField?: string;
  extractedResume?: string;
}

export type ToneType = 'professional' | 'modern' | 'executive' | 'creative';
export type CareerLevel = 'fresher' | 'mid' | 'senior' | 'career-changer' | 'executive';

export interface ChatSettings {
  tone: ToneType;
  careerLevel: CareerLevel;
  defaultCareerField: string;
  autoExtractResume: boolean;
}
