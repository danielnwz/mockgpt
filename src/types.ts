export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  assistantId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  llmModel?: string;
  responseBehavior?: ResponseBehavior;
  systemPrompt?: string;
}

export type ResponseBehavior = 'precise' | 'balanced' | 'creative';

export interface Assistant {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  responseBehavior: ResponseBehavior;
  allowedTools: string[];
  createdBy: string;
  isPublic: boolean;
  publishedDepartments?: string[];
  quickPrompts?: string[];
  updatedAt?: string;
  subscriptionCount?: number;
}

export interface Department {
  id: string;
  name: string;
  children?: Department[];
}
