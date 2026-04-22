import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Settings,
  ChevronDown,
  ShieldCheck,
  Info,
  MapPin,
  Copy,
  RotateCcw,
  Check,
  Ellipsis,
} from 'lucide-react';
import { Chat, Assistant, ResponseBehavior } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { AssistantDetailsSidebar } from './AssistantDetailsSidebar';
import { findLLMModelById, getAvailableLLMModels, getFallbackLLMModelId } from '../data/llmModels';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChatComposer } from './ChatComposer';


function responseBehaviorToSpectrum(behavior: ResponseBehavior) {
  switch (behavior) {
    case 'precise':
      return 1;
    case 'creative':
      return 3;
    case 'balanced':
    default:
      return 2;
  }
}

function spectrumToResponseBehavior(value: number): ResponseBehavior {
  if (value <= 1) return 'precise';
  if (value === 2) return 'balanced';
  return 'creative';
}

interface ChatWindowProps {
  chat: Chat;
  assistant?: Assistant;
  onSendMessage: (content: string) => void;
  onBack: () => void;
  onUpdateChat?: (chat: Chat) => void;
  onEditAssistant?: (assistant: Assistant) => void;
  onDuplicateAssistant?: (assistant: Assistant) => void;
  onDeleteAssistant?: (assistantId: string) => void;
  onToggleSubscribe?: (assistantId: string) => void;
  userAssistants?: Assistant[];
  subscribedIds?: string[];

  privateMode: boolean;
  onEnableSecureMode?: () => void;
}

export function ChatWindow({
  chat,
  assistant,
  onSendMessage,
  onUpdateChat,
  onEditAssistant,
  onDuplicateAssistant,
  onDeleteAssistant,
  onToggleSubscribe,
  userAssistants = [],
  subscribedIds = [],
  privateMode,
  onEnableSecureMode
}: ChatWindowProps) {
  const { t } = useTranslation();

  const llmModels = useMemo(() => getAvailableLLMModels(privateMode), [privateMode]);

  const getResponseBehaviors = (): { value: ResponseBehavior; label: string; description: string }[] => [
    { value: 'precise', label: t('precise'), description: t('preciseDescription') },
    { value: 'balanced', label: t('balanced'), description: t('balancedDescription') },
    { value: 'creative', label: t('creative'), description: t('creativeDescription') },
  ];
  const reasoningOptions = useMemo(() => [
    { value: 0, label: 'Off' },
    { value: 1, label: 'Fast' },
    { value: 2, label: 'Balanced' },
    { value: 3, label: 'Thorough' },
  ], []);
  const [showLLMMenu, setShowLLMMenu] = useState(false);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAssistantDetails, setShowAssistantDetails] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(
    chat.llmModel || assistant?.defaultLlmModel || getFallbackLLMModelId(privateMode)
  );
  const selectedModel = useMemo(
    () => llmModels.find((model) => model.id === selectedLLM) || findLLMModelById(selectedLLM),
    [llmModels, selectedLLM]
  );
  const [chatResponseBehavior, setChatResponseBehavior] = useState<ResponseBehavior>(
    chat.responseBehavior || assistant?.responseBehavior || 'balanced'
  );
  const [reasoningLevel, setReasoningLevel] = useState(() =>
    responseBehaviorToSpectrum(chat.responseBehavior || assistant?.responseBehavior || 'balanced')
  );
  const [chatSystemPrompt, setChatSystemPrompt] = useState(
    chat.systemPrompt || assistant?.systemPrompt || 'You are a helpful AI assistant.'
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rewriteQuickPrompts = [
    { value: 'shorter', label: t('rewriteShorter') },
    { value: 'formal', label: t('rewriteFormal') },
    { value: 'informal', label: t('rewriteInformal') },
    { value: 'longer', label: t('rewriteLonger') },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  useEffect(() => {
    const preferredModel = chat.llmModel || assistant?.defaultLlmModel || getFallbackLLMModelId(privateMode);
    const nextModel = llmModels.some((model) => model.id === preferredModel)
      ? preferredModel
      : getFallbackLLMModelId(privateMode);

    setSelectedLLM(nextModel);

    if (onUpdateChat && chat.llmModel !== nextModel) {
      onUpdateChat({ ...chat, llmModel: nextModel });
    }
  }, [assistant?.defaultLlmModel, chat, chat.llmModel, llmModels, onUpdateChat, privateMode]);

  useEffect(() => {
    const nextBehavior = chat.responseBehavior || assistant?.responseBehavior || 'balanced';
    setChatResponseBehavior(nextBehavior);
    setReasoningLevel(responseBehaviorToSpectrum(nextBehavior));
    setChatSystemPrompt(chat.systemPrompt || assistant?.systemPrompt || 'You are a helpful AI assistant.');
  }, [assistant?.id, chat.id]);

  const reasoningLabel = useMemo(
    () => reasoningOptions.find((option) => option.value === reasoningLevel)?.label || reasoningOptions[0].label,
    [reasoningLevel, reasoningOptions]
  );
  const contextWindow = useMemo(() => {
    const maxTokens = selectedModel?.maxInput || 1;
    const textParts = [
      chatSystemPrompt,
      ...chat.messages.map((message) => message.content),
    ];
    const totalCharacters = textParts.join('\n').length;
    const estimatedTokens = Math.max(1, Math.ceil(totalCharacters / 4));
    const usagePercent = Math.min(100, Math.round((estimatedTokens / maxTokens) * 100));

    return {
      estimatedTokens,
      maxTokens,
      usagePercent,
    };
  }, [chat.messages, chatSystemPrompt, selectedModel?.maxInput]);

  const contextWindowTone = useMemo(() => {
    if (contextWindow.usagePercent >= 90) {
      return {
        surface: 'border-destructive/20 bg-card/92 hover:border-destructive/35',
        fill: 'from-destructive/80 to-destructive',
        accent: 'text-destructive',
      };
    }
    if (contextWindow.usagePercent >= 75) {
      return {
        surface: 'border-amber-500/20 bg-card/92 hover:border-amber-500/35',
        fill: 'from-amber-400 to-amber-500',
        accent: 'text-amber-600 dark:text-amber-300',
      };
    }
    return {
      surface: 'border-border/80 bg-card/92 hover:border-primary/25',
      fill: 'from-primary/70 to-primary',
      accent: 'text-primary',
    };
  }, [contextWindow.usagePercent]);
  const contextWindowBadge = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`group inline-flex h-10 min-w-[108px] items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-[1px] hover:shadow-md ${contextWindowTone.surface}`}
          title="Approximate context window usage"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/75">
              <svg className="h-5 w-5 -rotate-90" viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.14"
                  strokeWidth="2.5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={50.265}
                  strokeDashoffset={50.265 - (50.265 * contextWindow.usagePercent) / 100}
                  className={contextWindowTone.accent}
                />
              </svg>
            </div>
            <span className={`shrink-0 text-[11px] font-semibold ${contextWindowTone.accent}`}>
              {contextWindow.usagePercent}%
            </span>
          </div>
          <Info className="h-3 w-3 shrink-0 text-muted-foreground opacity-80 transition-colors group-hover:text-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 rounded-2xl border-border bg-popover p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Context window</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Think of it as the model&apos;s short-term memory. It is the maximum amount of text the AI can consider at once.
            </p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              It includes the current session context: system instructions, chat history, your draft message, and selected file names.
            </p>
            <p>
              When usage gets close to the limit, the indicator turns amber and then red because older content is more likely to fall out of the window.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-3 text-xs text-muted-foreground">
            Approximation only. Actual usage depends on the model and the amount of content in the conversation and attached files.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const updateReasoningLevel = (value: number) => {
    setReasoningLevel(value);
    const nextBehavior = spectrumToResponseBehavior(value);
    setChatResponseBehavior(nextBehavior);

    if (onUpdateChat && chat.responseBehavior !== nextBehavior) {
      onUpdateChat({ ...chat, responseBehavior: nextBehavior });
    }
  };

  const handleLLMChange = (modelId: string) => {
    // Check if the selected model is consistent with the current mode
    const selectedModel = findLLMModelById(modelId);

    // If selecting a private-allowed model (and we are NOT in private mode), switch to private mode
    if (selectedModel?.privateAllowed && !privateMode && onEnableSecureMode) {
      onEnableSecureMode();
    }

    setSelectedLLM(modelId);
    setShowLLMMenu(false);
    if (onUpdateChat) {
      onUpdateChat({ ...chat, llmModel: modelId });
    }
  };

  const handleSaveSettings = () => {
    setReasoningLevel(responseBehaviorToSpectrum(chatResponseBehavior));
    if (onUpdateChat) {
      onUpdateChat({
        ...chat,
        responseBehavior: chatResponseBehavior,
        systemPrompt: chatSystemPrompt,
      });
    }
    setShowSettings(false);
  };

  const isOwner = assistant && (userAssistants?.some(a => a.id === assistant.id) || assistant.createdBy === 'user');
  const hasExamplePrompts = Boolean(assistant?.examplePrompts?.length);
  const handleStartWithExample = (prompt: string) => {
    onSendMessage(prompt);
  };

  const handleQuickFollowUp = (prompt: string) => {
    onSendMessage(prompt);
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      window.setTimeout(() => {
        setCopiedMessageId((current) => (current === messageId ? null : current));
      }, 1600);
    } catch {
      // Clipboard can be unavailable in some browser contexts.
      setCopiedMessageId(null);
    }
  };

  const getPreviousUserPrompt = (messageIndex: number) => {
    for (let i = messageIndex - 1; i >= 0; i -= 1) {
      if (chat.messages[i].role === 'user') {
        return chat.messages[i].content;
      }
    }
    return null;
  };

  const handleRegenerate = (messageIndex: number) => {
    const previousUserPrompt = getPreviousUserPrompt(messageIndex);
    if (!previousUserPrompt) return;
    onSendMessage(previousUserPrompt);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card/80 backdrop-blur-sm relative transition-all duration-300">
        {/* Chat Header with Assistant Info */}
        {assistant && (
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/60 bg-transparent">
            <div
              className="flex items-center gap-2.5 flex-1 cursor-pointer hover:bg-accent/40 rounded-lg px-2 py-1.5 -ml-2 transition-colors group"
              onClick={() => setShowAssistantDetails(true)}
            >
              <span className="text-[1.7rem] leading-none group-hover:scale-105 transition-transform">{assistant.icon}</span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">{assistant.name}</h2>
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-md leading-snug">{assistant.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contextWindowBadge}
              {/* LLM Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLLMMenu(!showLLMMenu)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors border font-medium ${privateMode
                    ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                    : 'bg-secondary/40 text-secondary-foreground border-border hover:bg-secondary/60'
                    }`}
                  title={t('selectAIModel')}
                >
                  {privateMode && <ShieldCheck className="w-4 h-4" />}
                  {llmModels.find(m => m.id === selectedLLM)?.name || (privateMode ? 'MUC-GPT Secure' : 'GPT-4 (Standard)')}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showLLMMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => { setShowLLMMenu(false); setShowModelDetails(false); }} />
                    <div className={`absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-20 transition-all duration-200 ${showModelDetails ? 'w-[480px]' : 'w-80'}`}>
                      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{t('selectAIModel')}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t('chooseAIForChat')}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowModelDetails(!showModelDetails); }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${showModelDetails ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                          <Info className="w-3 h-3" />
                          {showModelDetails ? 'Simple' : 'Details'}
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto thin-scrollbar">
                        {llmModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => handleLLMChange(model.id)}
                            className={`w-full px-4 py-3 text-left hover:bg-accent/60 transition-colors border-b border-border/30 last:border-0 ${selectedLLM === model.id ? 'bg-accent/40' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-foreground">{model.name}</span>
                              {selectedLLM === model.id && (
                                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{model.description}</p>
                            {showModelDetails && (
                              <div className="mt-2.5 rounded-lg bg-muted/20 border border-border/30 overflow-hidden">
                                <div className="grid grid-cols-2 gap-px bg-border/20">
                                  <div className="bg-card/80 px-3 py-2">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">Input cost</span>
                                    <span className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded ${model.costInput === 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                                      {model.costInput === 0 ? '✓ Free' : `$${model.costInput}/1K`}
                                    </span>
                                  </div>
                                  <div className="bg-card/80 px-3 py-2">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">Output cost</span>
                                    <span className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded ${model.costOutput === 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                                      {model.costOutput === 0 ? '✓ Free' : `$${model.costOutput}/1K`}
                                    </span>
                                  </div>
                                  <div className="bg-card/80 px-3 py-2">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">Knowledge</span>
                                    <span className="text-[11px] font-semibold text-foreground">{model.knowledgeCutoff}</span>
                                  </div>
                                  <div className="bg-card/80 px-3 py-2">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">Max input</span>
                                    <span className="text-[11px] font-mono font-semibold text-foreground">{(model.maxInput).toLocaleString()} tok</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-card/60 border-t border-border/20">
                                  <MapPin className="w-3 h-3 text-primary/50 flex-shrink-0" />
                                  <span className="text-[10px] text-muted-foreground">{model.provider}</span>
                                  <span className="text-muted-foreground/30">·</span>
                                  <span className="text-[10px] font-medium text-foreground">{model.location}</span>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isOwner ? (
                <button
                  onClick={() => {
                    if (onEditAssistant && assistant) {
                      onEditAssistant(assistant);
                    } else {
                      setShowSettings(true);
                    }
                  }}
                  className="p-1.5 hover:bg-accent rounded-lg transition-colors border border-transparent hover:border-border"
                  title="Edit Assistant"
                >
                  <Settings className="w-4.5 h-4.5 text-muted-foreground" />
                </button>
              ) : (
                <button
                  onClick={() => setShowAssistantDetails(true)}
                  className={`p-1.5 hover:bg-accent rounded-lg transition-colors border ${showAssistantDetails ? 'bg-accent border-border text-foreground' : 'border-transparent hover:border-border text-muted-foreground'}`}
                  title="Assistant Info"
                >
                  <Info className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Simple Chat Header (no assistant) */}
        {!assistant && (
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/60 bg-transparent">
            <h2 className="text-lg font-semibold text-foreground">{t('chat')}</h2>
            <div className="flex items-center gap-2">
              {contextWindowBadge}
              {/* LLM Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLLMMenu(!showLLMMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary/40 text-secondary-foreground rounded-lg hover:bg-secondary/60 transition-colors border border-border font-medium"
                  title={t('selectAIModel')}
                >
                  {llmModels.find(m => m.id === selectedLLM)?.name || (privateMode ? 'MUC-GPT Secure' : 'GPT-4 (Standard)')}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showLLMMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => { setShowLLMMenu(false); setShowModelDetails(false); }} />
                    <div className={`absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-20 transition-all duration-200 ${showModelDetails ? 'w-[480px]' : 'w-80'}`}>
                      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{t('selectAIModel')}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t('chooseAIForChat')}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowModelDetails(!showModelDetails); }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${showModelDetails ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                        >
                          <Info className="w-3 h-3" />
                          {showModelDetails ? 'Simple' : 'Details'}
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto thin-scrollbar">
                        {llmModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => handleLLMChange(model.id)}
                            className={`w-full px-4 py-3 text-left hover:bg-accent/60 transition-colors border-b border-border/30 last:border-0 ${selectedLLM === model.id ? 'bg-accent/40' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-foreground">{model.name}</span>
                              {selectedLLM === model.id && (
                                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{model.description}</p>
                            {showModelDetails && (
                              <div className="mt-2.5 rounded-lg bg-muted/20 border border-border/30 overflow-hidden">
                                <div className="grid grid-cols-2 gap-px bg-border/20">
                                  <div className="bg-card/80 px-3 py-2">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">Input cost</span>
                                    <span className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded ${model.costInput === 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                                      {model.costInput === 0 ? '✓ Free' : `$${model.costInput}/1K`}
                                    </span>
                                  </div>
                                  <div className="bg-card/80 px-3 py-2">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">Output cost</span>
                                    <span className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded ${model.costOutput === 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                                      {model.costOutput === 0 ? '✓ Free' : `$${model.costOutput}/1K`}
                                    </span>
                                  </div>
                                  <div className="bg-card/80 px-3 py-2">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">Knowledge</span>
                                    <span className="text-[11px] font-semibold text-foreground">{model.knowledgeCutoff}</span>
                                  </div>
                                  <div className="bg-card/80 px-3 py-2">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-semibold block mb-1">Max input</span>
                                    <span className="text-[11px] font-mono font-semibold text-foreground">{(model.maxInput).toLocaleString()} tok</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-card/60 border-t border-border/20">
                                  <MapPin className="w-3 h-3 text-primary/50 flex-shrink-0" />
                                  <span className="text-[10px] text-muted-foreground">{model.provider}</span>
                                  <span className="text-muted-foreground/30">·</span>
                                  <span className="text-[10px] font-medium text-foreground">{model.location}</span>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
            <div className="bg-card rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1 mb-5">
                <h2 className="type-title text-foreground">{t('chatSettings')}</h2>
                <p className="text-xs text-muted-foreground">{t('customizeAIResponses')}</p>
              </div>

              <div className="space-y-6">
                {/* Response Behavior */}
                <div className="surface-card bg-card/70 p-4">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('responseStyle')}
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">{t('chooseResponseCreativity')}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {getResponseBehaviors().map((behavior) => (
                      <button
                        key={behavior.value}
                        onClick={() => setChatResponseBehavior(behavior.value)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${chatResponseBehavior === behavior.value
                          ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                          }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{behavior.label}</span>
                          {chatResponseBehavior === behavior.value && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={`text-xs text-center ${chatResponseBehavior === behavior.value ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                            {behavior.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('customInstructions')}
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">{t('tellAIHowToBehave')}</p>
                  <textarea
                    value={chatSystemPrompt}
                    onChange={(e) => setChatSystemPrompt(e.target.value)}
                    placeholder={t('customInstructionsPlaceholder')}
                    rows={6}
                    className="w-full px-4 py-3 border border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-background text-foreground text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn-ghost btn-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="btn-primary btn-lg"
                >
                  {t('saveChanges')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-6">
          {chat.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <div className="text-center space-y-4 max-w-2xl">
                {assistant && (
                  <>
                    <span className="text-6xl animate-fade-up">{assistant.icon}</span>
                    <h2 className="text-2xl text-foreground animate-fade-up" style={{ animationDelay: '60ms' }}>
                      {assistant.name}
                    </h2>
                    <p className="text-sm text-muted-foreground/70 mt-1 animate-fade-up" style={{ animationDelay: '120ms' }}>
                      {hasExamplePrompts ? 'Choose an example to start or type your own message.' : 'Start typing to begin.'}
                    </p>

                    {/* Example Prompts */}
                    {assistant.examplePrompts && assistant.examplePrompts.length > 0 && (
                      <div className="mt-6 w-full max-w-2xl">
                        <div className="text-center space-y-2 mb-4">
                          <h3 className="text-lg font-semibold text-foreground">Example Messages</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {assistant.examplePrompts.map((prompt, index) => (
                            <button
                              key={index}
                              onClick={() => handleStartWithExample(prompt)}
                              className="group rounded-2xl border bg-primary/10 px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-up"
                              style={{ animationDelay: `${index * 60}ms` }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-sm font-medium text-foreground">{prompt}</span>
                                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                  ↗
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {!assistant && (
                  <>
                    <div className="text-5xl mb-4">💬</div>
                    <h2 className="text-xl text-foreground mb-2">Ready to chat?</h2>
                    <p className="text-muted-foreground">Start the conversation by typing a message below!</p>
                  </>
                )}
              </div>
            </div>
          )}

          {chat.messages.map((message, index) => {
            const isAssistant = message.role === 'assistant';
            const previousUserPrompt = getPreviousUserPrompt(index);
            const canRegenerate = Boolean(previousUserPrompt);
            const isLatestAssistant = isAssistant && index === chat.messages.length - 1;

            return (
              <div
                key={message.id}
                className={`group flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                {message.role === 'assistant' && assistant && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-lg">
                    {assistant.icon}
                  </div>
                )}
                {message.role === 'assistant' && !assistant && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xl shadow-md">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-2xl px-5 py-3 relative ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/90 border border-border/45 text-secondary-foreground shadow-sm backdrop-blur-sm'
                    }`}
                >
                  {isAssistant && (
                    <div className="absolute right-2 top-2 z-20 flex items-center gap-1 group/actions">
                      <div className="relative flex items-center gap-1 rounded-md border border-border/55 bg-background px-1 py-1 shadow-md opacity-0 translate-x-1 pointer-events-none transition-all group-hover/actions:opacity-100 group-hover/actions:translate-x-0 group-hover/actions:pointer-events-auto focus-within:opacity-100 focus-within:translate-x-0 focus-within:pointer-events-auto">
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                          title={t('copyMessage')}
                        >
                          {copiedMessageId === message.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleRegenerate(index)}
                          disabled={!canRegenerate}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                          title={t('regenerate')}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/45 bg-background/85 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
                            title="More actions"
                          >
                            <Ellipsis className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={6} className="w-44">
                          <DropdownMenuLabel className="text-xs">{t('messageActions')}</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleCopyMessage(message.id, message.content)}>
                            <Copy className="w-3.5 h-3.5" />
                            {t('copyMessage')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleRegenerate(index)} disabled={!canRegenerate}>
                            <RotateCcw className="w-3.5 h-3.5" />
                            {t('regenerate')}
                          </DropdownMenuItem>
                          {isLatestAssistant && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-xs">{t('quickRewrite')}</DropdownMenuLabel>
                              {rewriteQuickPrompts.map((prompt) => (
                                <DropdownMenuItem key={`${message.id}-${prompt.value}`} onSelect={() => handleQuickFollowUp(prompt.label)}>
                                  {prompt.label}
                                </DropdownMenuItem>
                              ))}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center text-primary-foreground text-xl shadow-md">
                    👤
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-6">
          <div className="mx-auto max-w-4xl">
            <ChatComposer
              onSubmit={onSendMessage}
              placeholder={privateMode ? (t('typeSecureMessage') || 'Type a secure message...') : (t('typeStandardMessage') || 'Type a message...')}
              privateMode={privateMode}
              allowedTools={assistant?.allowedTools}
              reasoningLevel={reasoningLevel}
              reasoningOptions={reasoningOptions}
              onReasoningChange={updateReasoningLevel}
              reasoningLabel={reasoningLabel}
            />
          </div>
        </div>
      </div>

      {/* Assistant Details Sidebar */}
      {assistant && (
        <div
          className={`bg-card border-l border-border h-full overflow-y-auto transition-all duration-300 ease-in-out ${showAssistantDetails ? 'w-[400px] translate-x-0 opacity-100' : 'w-0 translate-x-full opacity-0 border-none'
            }`}
        >
          {showAssistantDetails && (
            <AssistantDetailsSidebar
              assistant={assistant}
              userAssistants={userAssistants}
              subscribedIds={subscribedIds}
              onClose={() => setShowAssistantDetails(false)}
              onSelectAssistant={() => setShowAssistantDetails(false)}
              onEditAssistant={onEditAssistant}
              onDuplicateAssistant={onDuplicateAssistant}
              onDeleteAssistant={onDeleteAssistant}
              onToggleSubscribe={onToggleSubscribe}
              showStartConversationButton={false}
            />
          )}
        </div>
      )}
    </div>
  );
}
