import { Home, MessageSquarePlus, ChevronLeft, ChevronRight, Trash2, History, Sparkles, Pencil, Lock, ShieldCheck } from 'lucide-react';
import { Chat, Assistant } from '../types';
import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

// Updated View type to match App.tsx more closely (though 'assistants' is mapped to 'discovery')
type View = 'home' | 'chat' | 'discovery' | 'editor' | 'assistants' | 'version';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentView: View;
  onNavigate: (view: View) => void;
  chats: Chat[];
  assistants: Assistant[];
  currentChatId?: string;
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
  const { t } = useTranslation();
  const assistantById = new Map(assistants.map((assistant) => [assistant.id, assistant]));

  const navItems = [
    { id: 'home' as const, icon: Home, label: t('home') },
    { id: 'assistants' as const, icon: Sparkles, label: t('assistants') },
    { id: 'newchat' as const, icon: MessageSquarePlus, label: t('newChat') },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'newchat') {
      onNewChat();
    } else {
      onNavigate(id as View);
    }
  };

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 cursor-ew-resize relative z-20`}
      onClick={(e) => {
        // Only toggle if the click wasn't on a button or input
        if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('input')) {
          onToggleCollapse();
        }
      }}
    >
      <nav className="flex-1 overflow-y-auto p-2 pt-4 thin-scrollbar">
        {/* Navigation Items */}
        <div className="space-y-1 mb-4">
          {navItems.map((item) => {
            const isActive =
              item.id === 'assistants'
                ? currentView === 'discovery'
                : currentView === item.id;
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
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-sidebar-primary" />
                )}
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Chat History */}
        {chats.length > 0 && (
          <div>
            {!collapsed && (
              <div className="px-3 py-2 flex items-center gap-2 type-label text-muted-foreground">
                <History className="w-3 h-3" />
                {t('chatHistory')}
              </div>
            )}
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredChat(chat.id)}
                  onMouseLeave={() => setHoveredChat(null)}
                >
                  <button
                    onClick={() => onSelectChat(chat)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${currentChatId === chat.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }`}
                    title={collapsed ? chat.title : undefined}
                  >
                    {currentChatId === chat.id && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-sidebar-primary" />
                    )}
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-sidebar-accent/60 text-sm">
                      {assistantById.get(chat.assistantId || '')?.icon || '🤖'}
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
                          <span className="truncate flex-1 text-left text-sm">
                            {chat.title}
                          </span>
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
          </div>
        )}
      </nav>

      {/* Private Mode Toggle */}
      <div className="p-3 border-t border-sidebar-border relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePrivateMode();
          }}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group ${privateMode
            ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          title={privateMode ? "Switch to Standard Mode" : "Switch to Secure Workspace"}
        >
          {privateMode ? (
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-primary animate-pulse" />
          ) : (
            <Lock className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-foreground" />
          )}

          {!collapsed && (
            <div className="flex-1 text-left">
              <span className={`text-sm font-medium block ${privateMode ? 'text-primary' : 'text-foreground'}`}>
                {privateMode ? 'Secure Workspace' : 'Standard Mode'}
              </span>
              <span className="text-[10px] text-muted-foreground block leading-tight">
                {privateMode ? 'For sensitive data' : 'For general tasks'}
              </span>
            </div>
          )}

          {!collapsed && (
            <div className={`w-8 h-4 rounded-full relative transition-colors ${privateMode ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${privateMode ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
          )}
        </button>
      </div>

      {/* Collapse Toggle Button at Bottom */}
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
