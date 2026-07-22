import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Settings,
  PanelRightOpen,
  Copy,
  RotateCcw,
  Check,
  Ellipsis,
  Pencil,
} from 'lucide-react';
import { Chat, Assistant, ResponseBehavior, AssistantReport, AssistantReportReason, UserRole } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { AssistantDetailsSidebar } from './AssistantDetailsSidebar';
import { findLLMModelById, getAvailableLLMModels, getFallbackLLMModelId } from '../data/llmModels';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
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
  transcriptionReady?: boolean;
  transcriptionRecording?: boolean;
  onVoiceInput?: () => void;
  onOpenTranscriptionSettings?: () => void;
  currentUserRole?: UserRole;
  adminMode?: boolean;
  reports?: AssistantReport[];
  onReportAssistant?: (assistantId: string, reason: AssistantReportReason, comment?: string) => void;
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
  onEnableSecureMode,
  transcriptionReady,
  transcriptionRecording,
  onVoiceInput,
  onOpenTranscriptionSettings,
  currentUserRole = 'user',
  adminMode = false,
  reports = [],
  onReportAssistant,
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
  const [plainTextMessageIds, setPlainTextMessageIds] = useState<Record<string, boolean>>({});
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
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
    setPlainTextMessageIds({});
    setEditingMessageId(null);
    setEditingValue('');
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
        surface: 'bg-destructive/[0.07] hover:bg-destructive/[0.11]',
        fill: 'from-destructive/80 to-destructive',
        accent: 'text-destructive',
      };
    }
    if (contextWindow.usagePercent >= 75) {
      return {
        surface: 'bg-amber-500/[0.09] hover:bg-amber-500/[0.14]',
        fill: 'from-amber-400 to-amber-500',
        accent: 'text-amber-600 dark:text-amber-300',
      };
    }
    return {
      surface: 'bg-background/70 hover:bg-accent/60',
      fill: 'from-primary/70 to-primary',
      accent: 'text-primary',
    };
  }, [contextWindow.usagePercent]);
  const contextWindowBadge = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`group inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-2.5 text-left text-xs font-semibold transition-colors ${contextWindowTone.surface}`}
          title="Approximate context window usage"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              <svg className="h-[18px] w-[18px] -rotate-90" viewBox="0 0 24 24" aria-hidden="true">
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
            <span className={`hidden shrink-0 text-[11px] font-semibold sm:inline ${contextWindowTone.accent}`}>
              Context
            </span>
            <span className={`shrink-0 text-[11px] font-semibold tabular-nums ${contextWindowTone.accent}`}>
              {contextWindow.usagePercent}%
            </span>
          </div>
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

  const hasStarterPrompts = Boolean(assistant?.starterPrompts?.length);
  const conversationControl = assistant ? (
    <button
      type="button"
      onClick={() => setShowAssistantDetails(true)}
      className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg bg-background/70 px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      title={`Assistant details: ${assistant.name}`}
      aria-label={`Open assistant details for ${assistant.name}`}
    >
      <PanelRightOpen className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Assistant</span>
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setShowSettings(true)}
      className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg bg-background/70 px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
      title={t('chatSettings')}
      aria-label={t('chatSettings')}
    >
      <Settings className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{t('chatSettings')}</span>
    </button>
  );

  const handleStartWithStarterPrompt = (promptText: string) => {
    onSendMessage(promptText);
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

  const handleStartEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingValue(content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingValue('');
  };

  const handleSubmitEdit = () => {
    const trimmed = editingValue.trim();
    setEditingMessageId(null);
    setEditingValue('');
    if (trimmed) {
      onSendMessage(trimmed);
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

  const toggleMessageTextMode = (messageId: string) => {
    setPlainTextMessageIds((current) => ({
      ...current,
      [messageId]: !current[messageId],
    }));
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card/80 backdrop-blur-sm relative transition-all duration-300">
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

        {/* Chat Header */}
        <header className="border-b border-border/55 bg-card/80 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                {assistant && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base">
                    {assistant.icon}
                  </span>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-sm font-semibold text-foreground">
                    {assistant?.name || chat.title || t('chat')}
                  </h1>
                  {assistant?.description && (
                    <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">
                      {assistant.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {contextWindowBadge}
              {conversationControl}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-5">
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
                      {hasStarterPrompts ? 'Choose a starter prompt to begin or type your own message.' : 'Start typing to begin.'}
                    </p>

                    {/* Starter Prompts */}
                    {assistant.starterPrompts && assistant.starterPrompts.length > 0 && (
                      <div className="mt-6 w-full max-w-2xl">
                        <div className="text-center space-y-2 mb-4">
                          <h3 className="text-lg font-semibold text-foreground">Starter Prompts</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {assistant.starterPrompts.map((starterPrompt, index) => (
                            <button
                              key={index}
                              onClick={() => handleStartWithStarterPrompt(starterPrompt.prompt)}
                              className="group rounded-2xl border bg-primary/10 px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-up flex flex-col gap-1"
                              style={{ animationDelay: `${index * 60}ms` }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-sm font-semibold text-foreground">{starterPrompt.title}</span>
                                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                  ↗
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground line-clamp-2">{starterPrompt.prompt}</span>
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
            const isPlainTextMode = Boolean(plainTextMessageIds[message.id]);

            if (!isAssistant) {
              const isEditing = editingMessageId === message.id;

              // User message — quiet, right-aligned bubble, no avatar.
              return (
                <div key={message.id} className="group -mt-2 flex justify-end">
                  {isEditing ? (
                    // Inline edit — message becomes an editable field with actions.
                    <div className="w-full max-w-[80%]">
                      <div className="rounded-3xl rounded-br-lg bg-muted px-4 py-3">
                        <textarea
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitEdit();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                          rows={Math.min(8, Math.max(2, editingValue.split('\n').length))}
                          className="thin-scrollbar w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground outline-none"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="inline-flex h-8 items-center rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitEdit}
                          disabled={!editingValue.trim()}
                          className="inline-flex h-8 items-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
                        >
                          {t('send')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex max-w-[80%] flex-col items-end gap-1">
                      <div className="rounded-3xl rounded-br-lg bg-muted px-4 py-2.5 text-foreground">
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100">
                        <button
                          onClick={() => handleStartEdit(message.id, message.content)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title={t('editAndResend')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title={t('copyMessage')}
                        >
                          {copiedMessageId === message.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Assistant message — plain text, full width, no bubble.
            return (
              <div key={message.id} className="group flex flex-col gap-1.5">
                <div className="text-[15px] leading-7 text-foreground">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Action bar — space is always reserved (no layout movement).
                    Latest reply stays visible; older replies only fade in on hover. */}
                <div
                  className={`flex h-8 items-center gap-0.5 transition-opacity duration-150 ${
                    isLatestAssistant
                      ? 'opacity-100'
                      : 'opacity-0 focus-within:opacity-100 group-hover:opacity-100'
                  }`}
                >
                  <button
                    onClick={() => handleCopyMessage(message.id, message.content)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title={t('copyMessage')}
                  >
                    {copiedMessageId === message.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                  {isLatestAssistant && (
                    <button
                      onClick={() => handleRegenerate(index)}
                      disabled={!canRegenerate}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                      title={t('regenerate')}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="More actions"
                      >
                        <Ellipsis className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={6} className="w-44">
                      <DropdownMenuItem onSelect={() => toggleMessageTextMode(message.id)}>
                        <Check className={`w-3.5 h-3.5 ${isPlainTextMode ? 'opacity-100' : 'opacity-0'}`} />
                        {isPlainTextMode ? 'Formatted View' : 'Plain Text View'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Quick rewrite chips on the latest reply */}
                {isLatestAssistant && (
                  <div className="flex flex-wrap items-center gap-2">
                    {rewriteQuickPrompts.map((prompt) => (
                      <button
                        key={`${message.id}-${prompt.value}`}
                        type="button"
                        onClick={() => handleQuickFollowUp(prompt.label)}
                        className="inline-flex h-7 items-center rounded-full border border-border bg-transparent px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                        title={t('quickRewrite')}
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-6 pt-2 sm:px-6">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <div className="min-w-0 flex-1">
              <ChatComposer
                onSubmit={onSendMessage}
                placeholder={privateMode ? (t('typeSecureMessage') || 'Type a secure message...') : (t('typeStandardMessage') || 'Type a message...')}
                privateMode={privateMode}
                allowedTools={assistant?.allowedTools}
                reasoningLevel={reasoningLevel}
                reasoningOptions={reasoningOptions}
                onReasoningChange={updateReasoningLevel}
                reasoningLabel={reasoningLabel}
                transcriptionReady={transcriptionReady}
                transcriptionRecording={transcriptionRecording}
                onVoiceInput={onVoiceInput}
                onOpenTranscriptionSettings={onOpenTranscriptionSettings}
                llmModels={llmModels}
                selectedLlmModelId={selectedLLM}
                onLlmModelChange={handleLLMChange}
              />
            </div>
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
              currentUserRole={currentUserRole}
              adminMode={adminMode}
              reportsForAssistant={reports.filter((report) => report.assistantId === assistant.id)}
              onReportAssistant={onReportAssistant}
            />
          )}
        </div>
      )}
    </div>
  );
}


