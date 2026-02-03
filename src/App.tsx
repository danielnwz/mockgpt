import { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import { ChatWindow } from './components/ChatWindow';
import { AssistantDiscovery } from './components/AssistantDiscovery';
import { AssistantEditor } from './components/AssistantEditor';
import { Sidebar } from './components/Sidebar';


import { Header } from './components/Header';
import { VersionNotes } from './components/VersionNotes';
import { SecureModeIntroModal } from './components/SecureModeIntroModal';
import { Assistant, Chat, Message } from './types';
import { getRecommendedAssistants, getCommunityAssistants } from './data/assistants';
import { LanguageProvider } from './contexts/LanguageContext';

type View = 'home' | 'chat' | 'discovery' | 'editor' | 'version';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  const [darkMode, setDarkMode] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSecureIntro, setShowSecureIntro] = useState(false);

  const [assistants, setAssistants] = useState<Assistant[]>(() => {
    const saved = localStorage.getItem('assistants');
    return saved ? JSON.parse(saved) : [];
  });
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [privateMode, setPrivateMode] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('termsAccepted');
    if (!accepted) {
      setShowTerms(true);
    }

    const syncViewWithPath = () => {
      if (window.location.pathname === '/version') {
        setCurrentView('version');
      }
    };

    syncViewWithPath();
    window.addEventListener('popstate', syncViewWithPath);
    return () => window.removeEventListener('popstate', syncViewWithPath);
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
    setShowTerms(false);
  };

  const navigateToVersion = () => {
    window.history.pushState({}, '', '/version');
    setCurrentView('version');
  };

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('home');
  };

  const handleStartChat = (message: string, assistant?: Assistant) => {
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

    // Remove from favorites if it's there
    if (favorites.includes(assistantId)) {
      const updatedFavorites = favorites.filter(id => id !== assistantId);
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  };


  const handleToggleFavorite = (assistantId: string) => {
    const updatedFavorites = favorites.includes(assistantId)
      ? favorites.filter(id => id !== assistantId)
      : [...favorites, assistantId];
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
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
                  // @ts-ignore - Prop will be added in next step
                  privateMode={privateMode}
                  onEnableSecureMode={handleEnableSecureMode}
                />
              )}

              {currentView === 'discovery' && (
                <AssistantDiscovery
                  assistants={allAssistants}
                  userAssistants={userAssistants}
                  onSelectAssistant={(assistant) => handleStartChat('', assistant)}
                  onEditAssistant={handleEditAssistant}
                  onDeleteAssistant={handleDeleteAssistant}
                  onCreateNew={() => {
                    setEditingAssistant(null);
                    setCurrentView('editor');
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  favorites={favorites}
                />
              )}

              {currentView === 'editor' && (
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
              )}

              {currentView === 'version' && (
                <VersionNotes onBack={navigateHome} />
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
