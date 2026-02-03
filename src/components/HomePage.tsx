import { useState, useEffect } from 'react';
import { Send, Compass } from 'lucide-react';
import { Assistant } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface HomePageProps {
  onStartChat: (message: string, assistant?: Assistant) => void;
  recommendedAssistants: Assistant[];
  onDiscoverAll?: () => void;
  onOpenAssistants?: () => void;
  onOpenTerms?: () => void;
  onOpenVersion?: () => void;
}

export function HomePage({
  onStartChat,
  recommendedAssistants,
  onDiscoverAll,
  onOpenAssistants,
  onOpenTerms,
  onOpenVersion,
}: HomePageProps) {
  const { t, getWelcomeMessages } = useTranslation();
  const [message, setMessage] = useState('');
  const [welcomeMsg, setWelcomeMsg] = useState({ greeting: '', message: '' });

  useEffect(() => {
    // Pick a random welcome message on mount/refresh
    const messages = getWelcomeMessages();
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setWelcomeMsg(randomMsg);
  }, [getWelcomeMessages]);

  const visibleGridAssistants = recommendedAssistants.slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onStartChat(message.trim());
      setMessage('');
    }
  };

  const renderAssistantCard = (assistant: Assistant, index?: number) => (
    <button
      key={assistant.id}
      onClick={() => onStartChat('', assistant)}
      className="group relative flex flex-col p-4 bg-card rounded-xl border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden animate-fade-up text-left"
      style={index !== undefined ? { animationDelay: `${index * 60}ms` } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-[1]">
        <div className="flex justify-between items-start mb-3">
          <div className="w-10 h-10 rounded-lg bg-background shadow-inner flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
            {assistant.icon}
          </div>
        </div>

        <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
          {assistant.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 h-10 leading-relaxed">
          {assistant.description}
        </p>
      </div>
    </button>
  );

  return (
    <div className="min-h-full flex flex-col items-center justify-start p-8 bg-transparent">
      <div className="w-full max-w-6xl space-y-8 flex-1 mt-10">
        <div className="relative text-center space-y-3 mt-10">
          <div className="context-halo -translate-x-10 -translate-y-6" />
          <h1 className="type-display text-foreground">{welcomeMsg.greeting}</h1>
          <p className="text-xl text-muted-foreground">
            {welcomeMsg.message}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-3xl">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('startConversation')}
            className="w-full px-6 py-4 pr-14 rounded-2xl border bg-card text-card-foreground shadow-lg focus:outline-none focus:ring-2 focus:ring-ring text-lg"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary btn-icon disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="type-section text-foreground">{t('recommendedForYou')}</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleGridAssistants.map((assistant, index) => renderAssistantCard(assistant, index))}
              <button
                onClick={onOpenAssistants || onDiscoverAll}
                className="group relative flex flex-col p-4 bg-card/80 rounded-xl border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden animate-fade-up text-left"
                style={{ animationDelay: `${visibleGridAssistants.length * 60}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-[1]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      <Compass className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">All assistants</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-relaxed">Browse and manage your full assistant list.</p>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="w-full max-w-6xl mt-10">
        <div className="border-t border-border/60 pt-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
              Core v1.0.0
            </span>
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
              Frontend v1.0.0
            </span>
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
              Assistant v1.0.0
            </span>
            <button
              onClick={() => onOpenVersion?.()}
              className="ml-2 btn-secondary btn-sm"
            >
              What is new?
            </button>
            <div className="ml-auto">
              <button
                onClick={() => onOpenTerms?.()}
                className="btn-ghost btn-sm"
              >
                Terms of use
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
