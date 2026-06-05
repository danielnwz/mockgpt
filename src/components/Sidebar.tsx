import {
  Home,
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  History,
  Sparkles,
  Pencil,
  DoorOpen,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sun,
  Moon,
  HelpCircle,
  MessageSquare,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react';
import { Chat, Assistant } from '../types';
import { useState } from 'react';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import { FAQModal } from './FAQModal';
import logo from '../img/edelweiss_pride.svg';

type View = 'home' | 'chat' | 'discovery' | 'editor' | 'assistants' | 'version' | 'chat-input-concepts' | 'tutorials';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentView: View;
  onNavigate: (view: View) => void;
  chats: Chat[];
  assistants: Assistant[];
  currentChatId?: string;
  activeAssistantId?: string;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
  onNewChat: () => void;
  privateMode: boolean;
  onTogglePrivateMode: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  showAssistantIcons: boolean;
  onToggleAssistantIcons: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  currentView,
  onNavigate,
  chats,
  assistants,
  currentChatId,
  activeAssistantId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onNewChat,
  privateMode,
  onTogglePrivateMode,
  darkMode,
  onToggleDarkMode,
  showAssistantIcons,
  onToggleAssistantIcons,
}: SidebarProps) {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showGlobalHistory, setShowGlobalHistory] = useState(false);

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const languages = [
    { code: 'de', name: 'Deutsch', flag: <img src="https://flagcdn.com/w20/de.png" alt="DE" className="w-4 h-3 object-cover rounded-sm" /> },
    { code: 'en', name: 'English', flag: <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-4 h-3 object-cover rounded-sm" /> },
    { code: 'bar', name: 'Bayrisch', flag: <span className="text-sm leading-none">🥨</span> },
    { code: 'fr', name: 'Französisch', flag: <img src="https://flagcdn.com/w20/fr.png" alt="FR" className="w-4 h-3 object-cover rounded-sm" /> },
    { code: 'uk', name: 'Ukrainisch', flag: <img src="https://flagcdn.com/w20/ua.png" alt="UA" className="w-4 h-3 object-cover rounded-sm" /> },
  ];

  const assistantById = new Map(assistants.map((assistant) => [assistant.id, assistant]));
  const activeAssistant = activeAssistantId ? assistantById.get(activeAssistantId) : undefined;

  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const assistantChats = activeAssistantId
    ? sortedChats.filter((chat) => chat.assistantId === activeAssistantId)
    : [];
  const globalChats = sortedChats;
  const isAssistantContext = currentView === 'chat' && Boolean(activeAssistantId);
  const showCollapsedExpandButton = collapsed && isSidebarHovered;

  const navItems = [
    { id: 'home' as const, icon: Home, label: t('home') },
    { id: 'assistants' as const, icon: Sparkles, label: t('assistants') },
    { id: 'newchat' as const, icon: MessageSquarePlus, label: t('newChat') },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'newchat') {
      onNewChat();
      return;
    }
    onNavigate(id as View);
  };

  const renderChatList = (chatList: Chat[]) => (
    <div className="space-y-1">
      {chatList.map((chat) => (
        <div
          key={chat.id}
          className="relative group"
          onMouseEnter={() => setHoveredChat(chat.id)}
          onMouseLeave={() => setHoveredChat(null)}
        >
          <button
            onClick={() => onSelectChat(chat)}
            className={`w-full flex items-center gap-3 pl-3 py-3 rounded-lg transition-colors overflow-hidden ${currentChatId === chat.id
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              } ${hoveredChat === chat.id && !collapsed ? 'pr-16' : 'pr-3'}`}
            title={collapsed ? chat.title : undefined}
          >
            {currentChatId === chat.id && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-sidebar-primary" />
            )}
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-sidebar-accent/60 text-sm">
              {assistantById.get(chat.assistantId || '')?.icon || 'AI'}
            </span>
            {!collapsed && (
              <>
                {editingChatId === chat.id ? (
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const trimmed = editingTitle.trim();
                        if (trimmed) {
                          onRenameChat(chat.id, trimmed);
                        }
                        setEditingChatId(null);
                      }
                      if (e.key === 'Escape') {
                        setEditingChatId(null);
                      }
                    }}
                    onBlur={() => {
                      const trimmed = editingTitle.trim();
                      if (trimmed) {
                        onRenameChat(chat.id, trimmed);
                      }
                      setEditingChatId(null);
                    }}
                    className="flex-1 bg-transparent border border-sidebar-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                ) : (
                  <span className="truncate flex-1 text-left text-sm">{chat.title}</span>
                )}
              </>
            )}
          </button>

          {!collapsed && hoveredChat === chat.id && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingChatId(chat.id);
                  setEditingTitle(chat.title);
                }}
                className="p-1.5 hover:bg-accent rounded transition-colors"
                title={t('edit')}
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="p-1.5 hover:bg-destructive/20 rounded transition-colors"
                title={t('deleteChat')}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          )}

        </div>
      ))}
    </div>
  );

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 relative z-20`}
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
    >
      <div
        className={`h-14 flex items-center border-b border-sidebar-border flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'justify-between px-4 gap-3'
          }`}
      >
        {collapsed ? (
          showCollapsedExpandButton ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-5 h-5 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              title={t('expandSidebar')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <img src={logo} alt="MOCKGPT" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
          )
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <img src={logo} alt="MOCKGPT" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
              <h1 className="type-section text-sidebar-foreground truncate">MOCKGPT</h1>
            </div>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors flex-shrink-0 flex items-center justify-center"
              title={t('collapseSidebar')}
            >
              <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 pt-4 thin-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.id === 'assistants' ? currentView === 'discovery' : currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-sidebar-primary" />}
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div
          className={`mt-3 mb-4 border-t border-sidebar-border/80 ${collapsed ? 'mx-2' : 'mx-1'}`}
          aria-hidden="true"
        />

        {chats.length > 0 && (
          <div>
            {!collapsed && (
              <div className="px-3 py-2 flex items-center gap-2 type-label text-muted-foreground">
                <History className="w-3 h-3" />
                {t('chatHistory')}
              </div>
            )}

            {isAssistantContext && !collapsed ? (
              <div className="space-y-2">
                <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/20 overflow-hidden">
                  <div className="px-3 py-2 flex items-center justify-between bg-sidebar/60 backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground min-w-0">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-sidebar-accent text-sm">
                        {activeAssistant?.icon || 'AI'}
                      </span>
                      <span className="truncate">{activeAssistant?.name || t('thisAssistant')}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sidebar-accent text-muted-foreground">
                      {assistantChats.length}
                    </span>
                  </div>
                  <div className="p-1">
                    {assistantChats.length > 0 ? (
                      renderChatList(assistantChats)
                    ) : (
                      <p className="px-3 py-2 text-xs text-muted-foreground">{t('noChatsForAssistant')}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGlobalHistory((prev) => !prev);
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors"
                  >
                    <span>{t('allChats')}</span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sidebar-accent">{globalChats.length}</span>
                      {showGlobalHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {showGlobalHistory && (
                    <div className="p-1 border-t border-sidebar-border/70 bg-sidebar/40">
                      {renderChatList(globalChats)}
                    </div>
                  )}
                </div>
              </div>
            ) : isAssistantContext && collapsed ? (
              renderChatList(assistantChats.length > 0 ? assistantChats : globalChats)
            ) : (
              renderChatList(globalChats)
            )}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border relative group/mode">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePrivateMode();
          }}
          className={`w-full flex items-center py-3 rounded-lg transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'
            } ${privateMode
              ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
        >
          {privateMode ? (
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-primary" />
          ) : (
            <DoorOpen className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
          )}

          {!collapsed && (
            <div className="flex-1 text-left">
              <span className={`text-sm font-medium block ${privateMode ? 'text-primary' : 'text-foreground'}`}>
                {privateMode ? 'Secure Workspace' : 'Standard Workspace'}
              </span>
              <span className="text-[10px] text-muted-foreground block leading-tight">
                {privateMode ? 'For sensitive data' : 'For general tasks'}
              </span>
            </div>
          )}

          {!collapsed && (
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${privateMode ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${privateMode ? 'left-[18px]' : 'left-0.5'
                  }`}
              />
            </div>
          )}
        </button>

        {!collapsed && (
          <div className="absolute left-3 right-3 bottom-full mb-2 bg-card border border-border rounded-xl shadow-xl p-4 opacity-0 invisible group-hover/mode:opacity-100 group-hover/mode:visible transition-all duration-200 z-50 pointer-events-none">
            {privateMode ? (
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Secure & Private Mode</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Your data is processed on certified municipal servers. Safe for internal documents, personal data, and confidential information.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Standard Workspace - No Data Protection</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Requests are processed by external AI providers. Do <strong className="text-foreground">not</strong> enter personal data, passwords, or confidential information.
                  </p>
                  <p className="text-xs text-primary mt-2 font-medium">Click to switch to Secure Mode {'->'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-sidebar-border bg-sidebar relative">
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettingsMenu(!showSettingsMenu);
            }}
            className={`flex items-center gap-3 p-2 hover:bg-sidebar-accent rounded-lg transition-colors ${collapsed ? 'w-full justify-center' : 'w-full justify-start'}`}
            title={collapsed ? 'Daniel N.' : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-medium shadow-sm">
              DN
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col items-start overflow-hidden flex-1">
                  <span className="text-sm font-medium text-sidebar-foreground truncate w-full text-left">Daniel N.</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-sidebar-foreground/50 flex-shrink-0" />
              </>
            )}
          </button>
        </div>

        {showSettingsMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setShowSettingsMenu(false); setShowLanguageMenu(false); }} />
            <div className={`absolute bottom-full mb-2 ${collapsed ? 'left-2 w-56' : 'left-2 right-2 min-w-[200px]'} bg-card border border-border rounded-xl shadow-xl z-50 overflow-visible flex flex-col py-1`}>
              {/* Appearance & Preferences */}
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDarkMode();
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-4 h-4 text-muted-foreground flex items-center justify-center">
                    <Sun className={`absolute w-4 h-4 transition-all duration-300 ${darkMode ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                    <Moon className={`absolute w-4 h-4 transition-all duration-300 ${darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
                  </div>
                  <span>{darkMode ? t('darkMode') || 'Dark Mode' : t('lightMode') || 'Light Mode'}</span>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors duration-300 relative flex items-center shadow-inner ${darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${darkMode ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                </div>
              </button>

              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAssistantIcons();
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{t('assistantIcons')}</span>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors duration-300 relative flex items-center shadow-inner ${showAssistantIcons ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${showAssistantIcons ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                </div>
              </button>

              <div className="relative">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left" onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }}>
                  <span className="text-lg leading-none w-4 flex justify-center">{languages.find(l => l.code === language)?.flag || '🌐'}</span>
                  <span className="flex-1">{languages.find(l => l.code === language)?.name || language.toUpperCase()}</span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showLanguageMenu ? 'rotate-90' : ''}`} />
                </button>
                {showLanguageMenu && (
                  <div className="absolute left-full top-0 ml-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                    {languages.map(lang => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code as any); setShowLanguageMenu(false); setShowSettingsMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left">
                        <span className="text-lg">{lang.flag}</span> {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="my-1 border-t border-border" />

              {/* Learning & Support */}
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left" onClick={() => { onNavigate('tutorials' as any); setShowSettingsMenu(false); }}>
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                Tutorials
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left" onClick={() => { setShowFAQ(true); setShowSettingsMenu(false); }}>
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                {t('help') || 'FAQ'}
              </button>

              <div className="my-1 border-t border-border" />

              {/* Feedback & Community */}
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left" onClick={() => window.open('https://example.com/feature-voting', '_blank')}>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                Feature Voting
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left" onClick={() => { setShowFeedback(true); setShowSettingsMenu(false); }}>
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                {t('feedback') || 'Feedback'}
              </button>
            </div>
          </>
        )}
      </div>

      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} />}

      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFeedback(false)}>
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('sendFeedback') || 'Send Feedback'}</h2>
            <textarea
              placeholder={t('feedbackPlaceholder') || 'Your feedback...'}
              rows={5}
              className="w-full px-4 py-3 border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { alert(t('feedbackThankYou') || 'Thank you!'); setShowFeedback(false); }} className="btn-primary flex-1">{t('submit') || 'Submit'}</button>
              <button onClick={() => setShowFeedback(false)} className="btn-ghost">{t('cancel') || 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
