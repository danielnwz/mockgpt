import { useState, useRef, useEffect } from 'react';
import { Send, Settings, ChevronDown, ShieldCheck } from 'lucide-react';
import { Chat, Assistant, ResponseBehavior } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface ChatWindowProps {
  chat: Chat;
  assistant?: Assistant;
  onSendMessage: (content: string) => void;
  onBack: () => void;
  onUpdateChat?: (chat: Chat) => void;
  onEditAssistant?: (assistant: Assistant) => void;

  privateMode: boolean;
  onEnableSecureMode?: () => void;
}

export function ChatWindow({ chat, assistant, onSendMessage, onUpdateChat, onEditAssistant, privateMode, onEnableSecureMode }: ChatWindowProps) {
  const { t } = useTranslation();

  const getLLMModels = () => {
    const allModels = [
      { id: 'gpt-4', name: 'GPT-4 (Standard)', description: 'Most capable model for complex tasks and reasoning.', publicOnly: true },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective model for everyday tasks.', publicOnly: true },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Strong performance on creative and open-ended tasks.', publicOnly: true },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance for enterprise workloads.', publicOnly: true },
      { id: 'llama-3-70b', name: 'MUC-GPT Secure', description: 'Hosted by IT-Referat. Certified for internal data (VS-NfD).', privateAllowed: true },
      { id: 'mistral-large', name: 'MUC-Mistral Large', description: 'High-performance model for German language tasks. Hosted on municipal servers.', privateAllowed: true },
    ];

    if (privateMode) {
      return allModels.filter(m => m.privateAllowed);
    }
    return allModels;
  };

  const getResponseBehaviors = (): { value: ResponseBehavior; label: string; description: string }[] => [
    { value: 'precise', label: t('precise'), description: t('preciseDescription') },
    { value: 'balanced', label: t('balanced'), description: t('balancedDescription') },
    { value: 'creative', label: t('creative'), description: t('creativeDescription') },
  ];
  const [input, setInput] = useState('');
  const [showLLMMenu, setShowLLMMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(chat.llmModel || 'gpt-4');
  const [chatResponseBehavior, setChatResponseBehavior] = useState<ResponseBehavior>(
    chat.responseBehavior || assistant?.responseBehavior || 'balanced'
  );
  const [chatSystemPrompt, setChatSystemPrompt] = useState(
    chat.systemPrompt || assistant?.systemPrompt || 'You are a helpful AI assistant.'
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleLLMChange = (modelId: string) => {
    // Check if the selected model is consistent with the current mode
    const selectedModel = getLLMModels().find(m => m.id === modelId);

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
    if (onUpdateChat) {
      onUpdateChat({
        ...chat,
        responseBehavior: chatResponseBehavior,
        systemPrompt: chatSystemPrompt,
      });
    }
    setShowSettings(false);
  };

  return (
    <div className="h-full flex flex-col bg-card/80 backdrop-blur-sm">
      {/* Chat Header with Assistant Info */}
      {assistant && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-transparent">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{assistant.icon}</span>
            <div>
              <h2 className="type-section text-foreground">{assistant.name}</h2>
              <p className="type-muted">{assistant.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* LLM Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLLMMenu(!showLLMMenu)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors border font-medium ${privateMode
                  ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                  : 'bg-secondary/40 text-secondary-foreground border-border hover:bg-secondary/60'
                  }`}
                title={t('selectAIModel')}
              >
                {privateMode && <ShieldCheck className="w-4 h-4" />}
                {getLLMModels().find(m => m.id === selectedLLM)?.name || (privateMode ? 'MUC-GPT Secure' : 'GPT-4 (Standard)')}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showLLMMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLLMMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-card border border rounded-lg shadow-lg z-20 py-2">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-semibold text-foreground">{t('selectAIModel')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('chooseAIForChat')}</p>
                    </div>
                    {getLLMModels().map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleLLMChange(model.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors ${selectedLLM === model.id ? 'bg-accent/50' : ''
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{model.name}</span>
                              {selectedLLM === model.id && (
                                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => {
                if (onEditAssistant && assistant) {
                  onEditAssistant(assistant);
                } else {
                  setShowSettings(true);
                }
              }}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Simple Chat Header (no assistant) */}
      {!assistant && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-transparent">
          <h2 className="type-section text-foreground">{t('chat')}</h2>
          <div className="flex items-center gap-2">
            {/* LLM Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLLMMenu(!showLLMMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary/40 text-secondary-foreground rounded-lg hover:bg-secondary/60 transition-colors border border-border font-medium"
                title={t('selectAIModel')}
              >
                {getLLMModels().find(m => m.id === selectedLLM)?.name}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showLLMMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLLMMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-card border border rounded-lg shadow-lg z-20 py-2">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-semibold text-foreground">{t('selectAIModel')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('chooseAIForChat')}</p>
                    </div>
                    {getLLMModels().map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleLLMChange(model.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors ${selectedLLM === model.id ? 'bg-accent/50' : ''
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{model.name}</span>
                              {selectedLLM === model.id && (
                                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                    Try a quick prompt below or start typing.
                  </p>

                  {/* Quick Prompts */}
                  {assistant.quickPrompts && assistant.quickPrompts.length > 0 && (
                    <div className="mt-6 w-full max-w-2xl">
                      <div className="text-center space-y-2 mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Pick one to start</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {assistant.quickPrompts.map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setInput(prompt);
                            }}
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

        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'
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
              className={`max-w-2xl rounded-2xl px-5 py-3 ${message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
                }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div
                className={`text-xs mt-2 ${message.role === 'user' ? 'opacity-80' : 'text-muted-foreground'
                  }`}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center text-primary-foreground text-xl shadow-md">
                👤
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('typeYourMessage')}
            className="flex-1 px-4 py-3 rounded-xl border border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-5 h-5" />
            <span>{t('send')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
