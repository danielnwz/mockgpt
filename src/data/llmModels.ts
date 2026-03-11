export interface LLMModel {
  id: string;
  name: string;
  description: string;
  publicOnly?: boolean;
  privateAllowed?: boolean;
  costInput: number;
  costOutput: number;
  knowledgeCutoff: string;
  provider: string;
  location: string;
  maxInput: number;
}

const LLM_MODELS: LLMModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4 (Standard)',
    description: 'Most capable model for complex tasks and reasoning.',
    publicOnly: true,
    costInput: 0.03,
    costOutput: 0.06,
    knowledgeCutoff: 'Apr 2024',
    provider: 'OpenAI',
    location: 'USA (Azure EU)',
    maxInput: 128000,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective model for everyday tasks.',
    publicOnly: true,
    costInput: 0.0005,
    costOutput: 0.0015,
    knowledgeCutoff: 'Sep 2021',
    provider: 'OpenAI',
    location: 'USA (Azure EU)',
    maxInput: 16385,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Strong performance on creative and open-ended tasks.',
    publicOnly: true,
    costInput: 0.015,
    costOutput: 0.075,
    knowledgeCutoff: 'Aug 2024',
    provider: 'Anthropic',
    location: 'USA (AWS EU)',
    maxInput: 200000,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Balanced performance for enterprise workloads.',
    publicOnly: true,
    costInput: 0.003,
    costOutput: 0.015,
    knowledgeCutoff: 'Aug 2024',
    provider: 'Anthropic',
    location: 'USA (AWS EU)',
    maxInput: 200000,
  },
  {
    id: 'llama-3-70b',
    name: 'MUC-GPT Secure',
    description: 'Hosted by IT-Referat. Certified for internal data (VS-NfD).',
    privateAllowed: true,
    costInput: 0,
    costOutput: 0,
    knowledgeCutoff: 'Dec 2023',
    provider: 'LHM / IT-Referat',
    location: 'Munich (On-Premise)',
    maxInput: 8192,
  },
  {
    id: 'mistral-large',
    name: 'MUC-Mistral Large',
    description: 'High-performance model for German language tasks. Hosted on municipal servers.',
    privateAllowed: true,
    costInput: 0,
    costOutput: 0,
    knowledgeCutoff: 'Nov 2023',
    provider: 'LHM / IT-Referat',
    location: 'Munich (On-Premise)',
    maxInput: 32000,
  },
];

export const getAllLLMModels = (): LLMModel[] => LLM_MODELS;

export const getAvailableLLMModels = (privateMode: boolean): LLMModel[] => {
  if (privateMode) {
    return LLM_MODELS.filter((model) => model.privateAllowed);
  }
  return LLM_MODELS;
};

export const findLLMModelById = (modelId?: string): LLMModel | undefined => {
  if (!modelId) return undefined;
  return LLM_MODELS.find((model) => model.id === modelId);
};

export const getFallbackLLMModelId = (privateMode: boolean): string => {
  return getAvailableLLMModels(privateMode)[0]?.id || 'gpt-4';
};
