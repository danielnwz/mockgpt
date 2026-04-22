import { useEffect, useState } from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import { Assistant } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { ChatComposer } from './ChatComposer';

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
  const [welcomeMsg, setWelcomeMsg] = useState({ greeting: '', message: '' });

  useEffect(() => {
    // Pick a random welcome message on mount/refresh
    const messages = getWelcomeMessages();
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setWelcomeMsg(randomMsg);
  }, [getWelcomeMessages]);

  const visibleGridAssistants = recommendedAssistants.slice(0, 5);

  const renderAssistantCard = (assistant: Assistant, index?: number) => (
    <button
      key={assistant.id}
      onClick={() => onStartChat('', assistant)}
      className="surface-card-premium group relative flex flex-col p-5 cursor-pointer animate-fade-up text-left"
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

  const greetingParts = welcomeMsg.greeting.trim().split(' ');
  const greetingEmoji = greetingParts.length > 1 && !greetingParts[greetingParts.length - 1].match(/[a-zA-Z]/) ? greetingParts.pop() : '';
  const greetingText = greetingParts.join(' ');

  return (
    <div className="h-full overflow-y-auto thin-scrollbar">
      <div className="min-h-full flex flex-col items-center justify-start px-6 pt-14 pb-8 lg:px-8 lg:pt-20 lg:pb-10 bg-transparent">
        <div className="w-full max-w-6xl space-y-8 flex-1">
          <div className="relative text-center space-y-3 pt-6 lg:pt-10">
            <div className="context-halo" />
            <h1 className="type-display pb-1 flex items-center justify-center gap-2">
              <span className="text-gradient-premium">{greetingText}</span>
              {greetingEmoji && <span className="inline-block text-foreground drop-shadow-sm">{greetingEmoji}</span>}
            </h1>
            <p className="text-xl text-muted-foreground">
              {welcomeMsg.message}
            </p>
          </div>

          <div className="mx-auto w-full max-w-3xl">
            <ChatComposer
              onSubmit={(msg) => onStartChat(msg)}
              placeholder={t('startConversation')}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="type-section text-foreground flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-foreground" />
                {t('lastUsed')}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleGridAssistants.map((assistant, index) => renderAssistantCard(assistant, index))}
                <button
                  onClick={onOpenAssistants || onDiscoverAll}
                  className="surface-card-premium group relative flex flex-col p-5 cursor-pointer animate-fade-up text-left"
                  style={{ animationDelay: `${visibleGridAssistants.length * 60}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/14 via-primary/6 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-[1]">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Compass className="w-5 h-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 border border-primary/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Explore
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1.5">All assistants</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-relaxed">Browse and manage your full assistant list.</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      <span>Open directory</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="w-full max-w-6xl mt-24 lg:mt-32">
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
    </div>
  );
}
