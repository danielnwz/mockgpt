import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { ChatWindow } from './components/ChatWindow';
import { AssistantDiscovery } from './components/AssistantDiscovery';
import { AssistantEditor } from './components/AssistantEditor';
import { Sidebar } from './components/Sidebar';


import { Header } from './components/Header';
import { VersionNotes } from './components/VersionNotes';
import { SecureModeIntroModal } from './components/SecureModeIntroModal';
import { ChatInputConceptsPage } from './components/ChatInputConceptsPage';
import { Assistant, Chat, Message } from './types';
import { getRecommendedAssistants, getCommunityAssistants, getOwnedAssistants, getSubscribedAssistants } from './data/assistants';
import { findLLMModelById, getFallbackLLMModelId } from './data/llmModels';
import { LanguageProvider } from './contexts/LanguageContext';

type View = 'home' | 'chat' | 'discovery' | 'editor' | 'version' | 'chat-input-concepts';

const normalizePathname = (pathname: string) =>
  pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;

const routeMatches = (pathname: string, route: string) =>
  normalizePathname(pathname).endsWith(route);

const appPath = (route: '/' | '/version' | '/chat-input-concepts') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (route === '/') return base ? `${base}/` : '/';
  return `${base}${route}`;
};

const getDefaultSubscribedIds = (): string[] =>
  [
    ...getSubscribedAssistants(),
    ...getRecommendedAssistants().slice(0, 5),
    ...getCommunityAssistants()
      .filter((assistant) => !assistant.deletedByOwner)
      .slice(0, 7),
  ].map((assistant) => assistant.id);

const createMockChats = (subscribedAssistantIds: string[]): Chat[] => {
  if (subscribedAssistantIds.length === 0) return [];

  const templates = [
    ['Tax deadline checklist', 'What documents should I collect before filing my tax return?', 'Start with income statements, deductible expense receipts, and insurance contribution records.'],
    ['SEO title ideas', 'Give me 5 SEO-friendly title options for a React performance guide.', 'I can provide options centered on Core Web Vitals, bundle size, and measurable speed gains.'],
    ['Expense category review', 'Can commuting costs and home office equipment be claimed together?', 'Usually yes as separate categories, if each has valid documentation and meets limits.'],
    ['Article keyword clustering', 'Cluster these keywords into 3 topic groups for one blog series.', 'I will group them by search intent so each article targets one primary intent.'],
    ['Freelance invoice wording', 'Draft a cleaner invoice note for late payment reminders.', 'Use clear due dates, payment methods, and a polite escalation timeline.'],
    ['VAT quick check', 'Do I need to add VAT for this digital consulting service?', 'That depends on buyer location and B2B/B2C status; I can map your case quickly.'],
    ['Landing page meta tags', 'Write a title + meta description for a SaaS analytics page.', 'I will keep the title concise and add a benefit-focused description with action wording.'],
    ['Quarterly tax estimate', 'How should I estimate my quarterly prepayments?', 'Use prior-year totals, adjust for expected income shifts, and track variance monthly.'],
    ['Internal link opportunities', 'Suggest internal links for a post about React memoization.', 'Link to rendering basics, profiling guides, and state management content.'],
    ['Receipt categorization', 'Classify these receipts into deductible and non-deductible buckets.', 'I can categorize by business purpose and flag ambiguous items for review.'],
    ['Backlink outreach draft', 'Write a short backlink outreach email for a technical case study.', 'I will keep it short, personalized, and focused on evidence-based value.'],
    ['Business trip deduction', 'What can I deduct from a two-day business trip?', 'Typical categories include transport, accommodation, meal rules, and trip-related fees.'],
    ['Content refresh plan', 'Create a 30-day refresh plan for old blog posts.', 'I will prioritize high-impression pages first, then optimize CTR and intent match.'],
    ['Home office allocation', 'How do I split rent and utilities for home office use?', 'Apply a consistent area-based method and retain supporting calculations.'],
    ['SERP competitor summary', 'Summarize what top 5 pages do better than ours.', 'I can compare structure, topical depth, and intent coverage to identify gaps.'],
    ['Mileage log template', 'Create a simple mileage log format I can use weekly.', 'I will provide a compact template with date, route, purpose, and distance fields.'],
    ['Title tag cleanup', 'Which pages have title tags that are too long?', 'I can list candidates and suggest concise replacements under common pixel limits.'],
    ['Depreciation question', 'Can I depreciate a new laptop bought mid-year?', 'Yes in many cases; method and first-year amount depend on local tax rules.'],
    ['Keyword cannibalization', 'I think two posts target the same keyword. What now?', 'We can merge, redirect, or differentiate intent and headings to reduce overlap.'],
    ['Client meal deduction', 'How much of a client dinner can usually be deducted?', 'A reduced deductible percentage often applies, with documentation requirements.'],
    ['Schema markup review', 'Check if FAQ schema makes sense for this product page.', 'Use FAQ schema only when visible Q&A exists and matches page intent.'],
    ['Deduction deadline', 'What is the deadline to submit missing receipts?', 'Best practice is immediate filing support, but formal windows vary by authority.'],
    ['Blog brief generator', 'Generate a brief for an article on React suspense patterns.', 'I will include angle, target reader, outline, and references to avoid fluff.'],
    ['Tax office reply draft', 'Draft a response to a tax office request for clarification.', 'Keep it factual, point-by-point, and attach evidence in the same order as questions.'],
  ] as const;

  const baseTimestamp = new Date('2026-03-11T18:00:00.000Z').getTime();

  return templates.map(([title, userContent, assistantContent], index) => {
    const assistantId = subscribedAssistantIds[index % subscribedAssistantIds.length];
    const createdAtMs = baseTimestamp - index * 1000 * 60 * 38;
    const updatedAtMs = createdAtMs + 1000 * 22;

    return {
      id: `mock-chat-${index + 1}`,
      title,
      assistantId,
      messages: [
        {
          id: `mock-chat-${index + 1}-user-1`,
          role: 'user',
          content: userContent,
          timestamp: new Date(createdAtMs).toISOString(),
        },
        {
          id: `mock-chat-${index + 1}-assistant-1`,
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(updatedAtMs).toISOString(),
        },
      ],
      createdAt: new Date(createdAtMs).toISOString(),
      updatedAt: new Date(updatedAtMs).toISOString(),
      llmModel: 'gpt-4.1-mini',
    };
  });
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  const [darkMode, setDarkMode] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSecureIntro, setShowSecureIntro] = useState(false);

  const [assistants, setAssistants] = useState<Assistant[]>(() => {
    const saved = localStorage.getItem('assistants');
    const mockAssistants = [...getOwnedAssistants(), ...getSubscribedAssistants()];

    if (saved) {
      const parsed = JSON.parse(saved);
      const mockIds = new Set(mockAssistants.map(a => a.id));
      const filteredParsed = parsed.filter((a: Assistant) => !mockIds.has(a.id));
      return [...mockAssistants, ...filteredParsed];
    }
    return mockAssistants;
  });
  const [chats, setChats] = useState<Chat[]>(() => {
    const savedSubscribed = localStorage.getItem('subscribedAssistants');
    const initialSubscribedIds = savedSubscribed ? JSON.parse(savedSubscribed) : getDefaultSubscribedIds();
    return createMockChats(initialSubscribedIds);
  });
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [subscribedIds, setSubscribedIds] = useState<string[]>(() =>
    getDefaultSubscribedIds()
  );

  const [privateMode, setPrivateMode] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('termsAccepted');
    if (!accepted) {
      setShowTerms(true);
    }

    const syncViewWithPath = () => {
      const pathname = window.location.pathname;
      if (routeMatches(pathname, '/version')) {
        setCurrentView('version');
        return;
      }
      if (routeMatches(pathname, '/chat-input-concepts')) {
        setCurrentView('chat-input-concepts');
        return;
      }
      setCurrentView('home');
    };

    syncViewWithPath();
    window.addEventListener('popstate', syncViewWithPath);
    return () => window.removeEventListener('popstate', syncViewWithPath);
  }, []);

  useEffect(() => {
    const seededSubscribedIds = getDefaultSubscribedIds();
    setSubscribedIds(seededSubscribedIds);
    localStorage.setItem('subscribedAssistants', JSON.stringify(seededSubscribedIds));

    const seededChats = createMockChats(seededSubscribedIds);
    setChats(seededChats);
    setCurrentChat(null);
    localStorage.setItem('chats', JSON.stringify(seededChats));
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
    setShowTerms(false);
  };

  const navigateToVersion = () => {
    window.history.pushState({}, '', appPath('/version'));
    setCurrentView('version');
  };

  const navigateHome = () => {
    window.history.pushState({}, '', appPath('/'));
    setCurrentView('home');
  };

  const handleStartChat = (message: string, assistant?: Assistant) => {
    const configuredModel = assistant?.defaultLlmModel;
    const canUseConfiguredModel = configuredModel
      ? (!privateMode || Boolean(findLLMModelById(configuredModel)?.privateAllowed))
      : false;
    const initialLlmModel = canUseConfiguredModel
      ? configuredModel
      : getFallbackLLMModelId(privateMode);

    const newChat: Chat = {
      id: Date.now().toString(),
      title: message.slice(0, 50) || `Chat with ${assistant?.name || 'Assistant'}`,
      assistantId: assistant?.id,
      messages: message ? [
        {
          id: Date.now().toString(),
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
      ] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      llmModel: initialLlmModel,
      // Add a flag to track if this chat was created in private mode, if we want persistence later
      // isPrivate: privateMode 
    };

    // Simulate AI response
    if (message) {
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistant?.systemPrompt
            ? `Hello! I'm ${assistant.name}. ${assistant.description} How can I help you today?`
            : 'Hello! How can I help you today?',
          timestamp: new Date().toISOString(),
        };
        newChat.messages.push(aiMessage);
        setCurrentChat({ ...newChat });
        const updatedChats = [newChat, ...chats];
        setChats(updatedChats);
        localStorage.setItem('chats', JSON.stringify(updatedChats));
      }, 500);
    }

    setCurrentChat(newChat);
    setCurrentView('chat');
  };

  const handleSendMessage = (content: string) => {
    if (!currentChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
      updatedAt: new Date().toISOString(),
      title: currentChat.title || content.slice(0, 50),
    };

    setCurrentChat(updatedChat);

    // Simulate AI response
    setTimeout(() => {
      const assistant = assistants.find(a => a.id === currentChat.assistantId) ||
        getRecommendedAssistants().find(a => a.id === currentChat.assistantId);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a simulated response from ${assistant?.name || 'the assistant'}. ${privateMode ? '[SECURE MODE: LOGGING DISABLED]' : ''} In a real application, this would connect to your hosted LLM with the configured settings (response behavior: ${assistant?.responseBehavior || updatedChat.responseBehavior || 'balanced'}).`,
        timestamp: new Date().toISOString(),
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
      };

      setCurrentChat(finalChat);

      const chatIndex = chats.findIndex(c => c.id === currentChat.id);
      const updatedChats = [...chats];
      if (chatIndex >= 0) {
        updatedChats[chatIndex] = finalChat;
      } else {
        updatedChats.unshift(finalChat);
      }
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
    }, 800);
  };

  const handleUpdateChat = (chat: Chat) => {
    setCurrentChat(chat);
    const chatIndex = chats.findIndex(c => c.id === chat.id);
    const updatedChats = [...chats];
    if (chatIndex >= 0) {
      updatedChats[chatIndex] = chat;
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
    }
  };

  const handleCreateAssistant = (assistant: Omit<Assistant, 'id' | 'createdBy' | 'isPublic'>) => {
    const newAssistant: Assistant = {
      ...assistant,
      id: Date.now().toString(),
      createdBy: 'user',
      isPublic: false,
      subscriptionCount: 0,
      updatedAt: new Date().toISOString(),
    };
    const updatedAssistants = [...assistants, newAssistant];
    setAssistants(updatedAssistants);
    localStorage.setItem('assistants', JSON.stringify(updatedAssistants));
    setCurrentView('discovery');
  };

  const handleDuplicateAssistant = (assistantToDuplicate: Assistant) => {
    const duplicatedName = assistantToDuplicate.name.endsWith(' (Copy)')
      ? assistantToDuplicate.name
      : `${assistantToDuplicate.name} (Copy)`;

    const newAssistant: Assistant = {
      ...assistantToDuplicate,
      id: Date.now().toString(),
      name: duplicatedName,
      createdBy: 'user',
      isPublic: false,
      subscriptionCount: 0,
      updatedAt: new Date().toISOString(),
      version: undefined,
      publishedDepartments: undefined
    };

    const updatedAssistants = [...assistants, newAssistant];
    setAssistants(updatedAssistants);
    localStorage.setItem('assistants', JSON.stringify(updatedAssistants));

    // Open editor with the new duplicated assistant
    setEditingAssistant(newAssistant);
    setCurrentView('editor');
  };

  const handleEditAssistant = (assistant: Assistant) => {
    setEditingAssistant(assistant);
    setCurrentView('editor');
  };

  const handleUpdateAssistant = (updated: Assistant) => {
    const updatedAssistants = assistants.map(a =>
      a.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : a
    );
    setAssistants(updatedAssistants);
    localStorage.setItem('assistants', JSON.stringify(updatedAssistants));
  };

  const handleDeleteAssistant = (assistantId: string) => {
    const updatedAssistants = assistants.filter(a => a.id !== assistantId);
    setAssistants(updatedAssistants);
    localStorage.setItem('assistants', JSON.stringify(updatedAssistants));

    // Remove from subscribed if it's there
    if (subscribedIds.includes(assistantId)) {
      const updatedSubscribed = subscribedIds.filter(id => id !== assistantId);
      setSubscribedIds(updatedSubscribed);
      localStorage.setItem('subscribedAssistants', JSON.stringify(updatedSubscribed));
    }
  };


  const handleToggleSubscribe = (assistantId: string) => {
    const updatedSubscribed = subscribedIds.includes(assistantId)
      ? subscribedIds.filter(id => id !== assistantId)
      : [...subscribedIds, assistantId];
    setSubscribedIds(updatedSubscribed);
    localStorage.setItem('subscribedAssistants', JSON.stringify(updatedSubscribed));
  };

  const handleSelectChat = (chat: Chat) => {
    setCurrentChat(chat);
    setCurrentView('chat');
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);
    localStorage.setItem('chats', JSON.stringify(updatedChats));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
      setCurrentView('home');
    }
  };

  const allAssistants = [...getRecommendedAssistants(), ...getCommunityAssistants(), ...assistants];
  const userAssistants = assistants;

  const handleTogglePrivateMode = () => {
    if (!privateMode) {
      handleEnableSecureMode();
    } else {
      setPrivateMode(false);
    }
  };

  const handleEnableSecureMode = () => {
    if (privateMode) return;

    // Trying to enable secure mode
    const hasSeenIntro = localStorage.getItem('hasSeenSecureIntro');
    if (!hasSeenIntro) {
      setShowSecureIntro(true);
      return;
    }
    setPrivateMode(true);
  };

  const handleConfirmSecureMode = () => {
    localStorage.setItem('hasSeenSecureIntro', 'true');
    setShowSecureIntro(false);
    setPrivateMode(true);
  };


  return (
    <LanguageProvider>
      <div className={`${darkMode ? 'dark' : ''} ${privateMode ? 'private' : ''}`}>
        <div className="flex flex-col h-screen bg-background transition-colors duration-500">
          <Header
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            // @ts-ignore - Prop will be added in next step
            privateMode={privateMode}
          />

          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              currentView={currentView}
              onNavigate={(view) => {
                if (view === 'home') {
                  navigateHome();
                  setCurrentChat(null);
                } else if (view === 'assistants') {
                  setCurrentView('discovery');
                } else {
                  setCurrentView(view as View);
                }
              }}
              chats={chats}
              assistants={allAssistants}
              currentChatId={currentChat?.id}
              activeAssistantId={currentChat?.assistantId}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              onRenameChat={(chatId, title) => {
                const chatIndex = chats.findIndex(c => c.id === chatId);
                if (chatIndex === -1) return;
                const updatedChats = [...chats];
                updatedChats[chatIndex] = { ...updatedChats[chatIndex], title };
                setChats(updatedChats);
                localStorage.setItem('chats', JSON.stringify(updatedChats));
                if (currentChat?.id === chatId) {
                  setCurrentChat({ ...currentChat, title });
                }
              }}
              onNewChat={() => handleStartChat('')}
              // @ts-ignore - Prop will be added in next step
              privateMode={privateMode}
              // @ts-ignore - Prop will be added in next step
              onTogglePrivateMode={handleTogglePrivateMode}
            />


            <main className="flex-1 overflow-hidden">
              {currentView === 'home' && !currentChat && (
                <HomePage
                  onStartChat={handleStartChat}
                  recommendedAssistants={getRecommendedAssistants()}
                  onDiscoverAll={() => setCurrentView('discovery')}
                  onOpenAssistants={() => {
                    setCurrentView('discovery');
                  }}
                  onOpenTerms={() => setShowTerms(true)}
                  onOpenVersion={navigateToVersion}
                />
              )}

              {currentView === 'chat' && currentChat && (
                <ChatWindow
                  chat={currentChat}
                  assistant={allAssistants.find(a => a.id === currentChat.assistantId)}
                  onSendMessage={handleSendMessage}
                  onBack={() => setCurrentView('home')}
                  onUpdateChat={handleUpdateChat}
                  onEditAssistant={handleEditAssistant}
                  onDuplicateAssistant={handleDuplicateAssistant}
                  onDeleteAssistant={handleDeleteAssistant}
                  onToggleSubscribe={handleToggleSubscribe}
                  userAssistants={userAssistants}
                  subscribedIds={subscribedIds}
                  // @ts-ignore - Prop will be added in next step
                  privateMode={privateMode}
                  onEnableSecureMode={handleEnableSecureMode}
                />
              )}

              {(currentView === 'discovery' || currentView === 'editor') && (
                <div className="relative h-full w-full">
                  <AssistantDiscovery
                    assistants={allAssistants}
                    userAssistants={userAssistants}
                    onSelectAssistant={(assistant) => handleStartChat('', assistant)}
                    onEditAssistant={handleEditAssistant}
                    onDeleteAssistant={handleDeleteAssistant}
                    onDuplicateAssistant={handleDuplicateAssistant}
                    onCreateNew={() => {
                      setEditingAssistant(null);
                      setCurrentView('editor');
                    }}
                    onToggleSubscribe={handleToggleSubscribe}
                    subscribedIds={subscribedIds}
                  />

                  {currentView === 'editor' && (
                    <div className="absolute inset-0 z-50">
                      <AssistantEditor
                        assistant={editingAssistant}
                        onSave={(assistant) => {
                          if (editingAssistant) {
                            handleUpdateAssistant(assistant as Assistant);
                          } else {
                            handleCreateAssistant(assistant);
                          }
                        }}
                        onCancel={() => setCurrentView('discovery')}
                      />
                    </div>
                  )}
                </div>
              )}

              {currentView === 'version' && (
                <VersionNotes onBack={navigateHome} />
              )}

              {currentView === 'chat-input-concepts' && (
                <ChatInputConceptsPage />
              )}
            </main>
          </div>
        </div>
      </div>

      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Terms of Use</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                This is a placeholder Terms of Use text for the MUCGPT demo. By using this
                application, you agree to use it responsibly and acknowledge that responses
                are generated by AI and may be inaccurate.
              </p>
              <p>
                Do not share sensitive data. The application is provided as-is for demo
                purposes only.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAcceptTerms}
                className="btn-primary flex-1"
              >
                Accept Terms
              </button>
              {localStorage.getItem('termsAccepted') && (
                <button
                  onClick={() => setShowTerms(false)}
                  className="btn-ghost"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showSecureIntro && (
        <SecureModeIntroModal onClose={handleConfirmSecureMode} />
      )}
    </LanguageProvider>
  );
}
