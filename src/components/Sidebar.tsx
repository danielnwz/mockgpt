import {
  Home,
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  History,
  Sparkles,
  Pencil,
  Lock,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Chat, Assistant } from '../types';
import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

type View = 'home' | 'chat' | 'discovery' | 'editor' | 'assistants' | 'version';

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
}: SidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showGlobalHistory, setShowGlobalHistory] = useState(false);
  const { t } = useTranslation();

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
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              currentChatId === chat.id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
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
      className={`${collapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 cursor-ew-resize relative z-20`}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('input')) {
          onToggleCollapse();
        }
      }}
    >
      <nav className="flex-1 overflow-y-auto p-2 pt-4 thin-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.id === 'assistants' ? currentView === 'discovery' : currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive
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
          className={`w-full flex items-center py-3 rounded-lg transition-all duration-300 ${
            collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3'
          } ${
            privateMode
              ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          }`}
        >
          {privateMode ? (
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-primary" />
          ) : (
            <Lock className="w-5 h-5 flex-shrink-0 text-muted-foreground" />
          )}

          {!collapsed && (
            <div className="flex-1 text-left">
              <span className={`text-sm font-medium block ${privateMode ? 'text-primary' : 'text-foreground'}`}>
                {privateMode ? 'Secure Workspace' : 'Open Mode'}
              </span>
              <span className="text-[10px] text-muted-foreground block leading-tight">
                {privateMode ? 'For sensitive data' : 'For general tasks'}
              </span>
            </div>
          )}

          {!collapsed && (
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${
                privateMode ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  privateMode ? 'left-[18px]' : 'left-0.5'
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
                  <p className="text-sm font-semibold text-foreground">Open Mode - No Data Protection</p>
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

      <div className="p-3 pt-1 border-t border-sidebar-border bg-sidebar">
        <button
          onClick={onToggleCollapse}
          className="w-full p-2 hover:bg-sidebar-accent rounded-lg transition-colors flex items-center justify-center"
          title={collapsed ? t('expandSidebar') : t('collapseSidebar')}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
          )}
        </button>
      </div>
    </aside>
  );
}
