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

export type TranscriptionModelId = 'whisper-small' | 'whisper-large-v3-turbo';

export interface TranscriptionSettings {
  enabled: boolean;
  modelId: TranscriptionModelId;
  downloadedModelIds: TranscriptionModelId[];
}

export interface StarterPrompt {
  title: string;
  prompt: string;
}

export type UserRole = 'user' | 'admin' | 'moderator';

export type ReportStatus = 'open' | 'reviewed' | 'dismissed';

export type AssistantReportReason =
  | 'inappropriate'
  | 'unsafe'
  | 'privacy'
  | 'spam'
  | 'other';

export interface AssistantReport {
  id: string;
  assistantId: string;
  reason: AssistantReportReason;
  comment?: string;
  reportedBy: string;
  createdAt: string;
  status: ReportStatus;
}

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
  starterPrompts?: StarterPrompt[];
  quickPrompts?: string[];
  defaultLlmModel?: string;
  updatedAt?: string;
  subscriptionCount?: number;
  version?: string;
  deletedByOwner?: boolean;
  moderationHidden?: boolean;
}

export interface Department {
  id: string;
  name: string;
  children?: Department[];
}


