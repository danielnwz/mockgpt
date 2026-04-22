import { Star, Plus, Search, FileUp, X, Check, ChevronDown, Trash2 } from 'lucide-react';
import { Assistant } from '../types';
import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { ImportAssistantModal } from './ImportAssistantModal';
import { AssistantDetailsSidebar } from './AssistantDetailsSidebar';

interface AssistantDiscoveryProps {
  assistants: Assistant[];
  userAssistants: Assistant[];
  onSelectAssistant: (assistant: Assistant) => void;
  onEditAssistant: (assistant: Assistant) => void;
  onDeleteAssistant: (assistantId: string) => void;
  onDuplicateAssistant: (assistant: Assistant) => void;
  onCreateNew: () => void;
  onToggleSubscribe: (assistantId: string) => void;
  subscribedIds: string[];
}

// Helper function to format tool names
const formatToolName = (tool: string): string => {
  return tool
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function AssistantDiscovery({
  assistants,
  userAssistants,
  onSelectAssistant,
  onEditAssistant,
  onDeleteAssistant,
  onDuplicateAssistant,
  onCreateNew,
  onToggleSubscribe,
  subscribedIds,
}: AssistantDiscoveryProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'yours' | 'subscribed'>('subscribed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [sortBy, setSortBy] = useState<'subscriptions' | 'title' | 'updated'>('subscriptions');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Close panel when pressing escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAssistant(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleImport = () => {
    setShowImportModal(true);
  };

  const handleImportComplete = (importedData: Assistant) => {
    setShowImportModal(false);
    onDuplicateAssistant(importedData);
  };

  const filteredAssistants = assistants.filter((assistant) => {
    // Hide soft-deleted assistants from the "all" view
    if (filter === 'all' && assistant.deletedByOwner) return false;

    if (filter === 'yours' && assistant.createdBy !== 'user') return false;

    // Subscriptions: Should contain explicit subscriptions OR any imported assistants (in userAssistants but not created by user)
    const isImported = userAssistants.some(ua => ua.id === assistant.id) && assistant.createdBy !== 'user';
    if (filter === 'subscribed' && !subscribedIds.includes(assistant.id) && !isImported) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        assistant.name.toLowerCase().includes(query) ||
        assistant.description.toLowerCase().includes(query) ||
        assistant.allowedTools.some(tool => formatToolName(tool).toLowerCase().includes(query))
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'title') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'updated') {
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    } else {
      // subscriptions (default to 0 if undefined)
      return (b.subscriptionCount || 0) - (a.subscriptionCount || 0);
    }
  });

  return (
    <div className="h-full flex relative overflow-hidden bg-background/50">
      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto w-full thin-scrollbar">
        <div className="max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
                Discover Assistants
              </h1>
              <p className="text-muted-foreground text-lg">
                Supercharge your workflow with specialized AI agents.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleImport} className="btn-secondary shadow-sm">
                <FileUp className="w-4 h-4 mr-2" />
                Import
              </button>
              <button onClick={onCreateNew} className="btn-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Create New
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="sticky top-0 z-10 bg-background py-3 mb-5 border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:border-none sm:relative">
            <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
              {/* Search Bar - Flex Grow */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, description, or tools..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-border/60 hover:border-primary/50 focus:border-primary bg-background outline-none shadow-sm transition-all placeholder:text-gray-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Controls Group */}
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center flex-shrink-0">
                {/* Filters */}
                <div className="flex gap-2 p-1 bg-muted/20 rounded-xl overflow-x-auto no-scrollbar">
                  {(['all', 'subscribed', 'yours'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-all whitespace-nowrap ${filter === f
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                      {f === 'subscribed' ? t('subscribed') : t(f as any)}
                    </button>
                  ))}
                </div>

                {/* Separator - Visible on Desktop */}
                <div className="hidden sm:block w-px h-8 bg-border" />

                {/* Sort Dropdown */}
                <div className="relative flex-shrink-0 z-20">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium whitespace-nowrap hidden lg:inline">Sort by:</span>
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="flex items-center gap-2 px-3 py-2 bg-card border border-input rounded-lg hover:border-primary/50 transition-colors min-w-[140px] justify-between text-sm shadow-sm"
                    >
                      <span className="font-medium text-foreground">
                        {sortBy === 'subscriptions' ? 'Subscriptions' :
                          sortBy === 'title' ? 'Title' : 'Last updated'}
                      </span>
                      {showSortMenu ? <ChevronDown className="w-4 h-4 text-muted-foreground rotate-180 transition-transform" /> : <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />}
                    </button>
                  </div>

                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 surface-popover z-30 py-1 rounded-lg shadow-xl border animate-in fade-in zoom-in-95 duration-100">
                        {(['subscriptions', 'title', 'updated'] as const).map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setSortBy(option);
                              setShowSortMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between text-sm group"
                          >
                            <span>
                              {option === 'subscriptions' ? 'Subscriptions' :
                                option === 'title' ? 'Title' : 'Last updated'}
                            </span>
                            {sortBy === option && <Check className="w-4 h-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Assistant Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${selectedAssistant ? 'lg:grid-cols-2 xl:grid-cols-3' : ''
            } gap-4 sm:gap-6 pb-20 transition-all duration-300`}>
            {filteredAssistants.map((assistant) => {
              const isSubbed = subscribedIds.includes(assistant.id);
              return (
                <div
                  key={assistant.id}
                  onClick={() => setSelectedAssistant(assistant)}
                  className={`group relative flex flex-col bg-card rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${selectedAssistant?.id === assistant.id
                    ? 'border-primary ring-1 ring-primary shadow-lg shadow-primary/10 scale-[1.02]'
                    : 'border-border/50 hover:border-primary/40 shadow-sm hover:shadow-lg hover:-translate-y-0.5'
                    } ${assistant.deletedByOwner ? 'opacity-70 grayscale-[0.2]' : ''}`}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Card body */}
                  <div className="relative z-[1] p-5 pb-3 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ${assistant.deletedByOwner ? 'grayscale' : ''}`}>
                        {assistant.icon}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSubscribe(assistant.id);
                        }}
                        className={`p-1.5 rounded-full transition-all duration-200 ${isSubbed ? 'text-yellow-400 bg-yellow-400/10 scale-110' : 'text-muted-foreground/20 hover:text-yellow-400 hover:bg-yellow-400/10 opacity-0 group-hover:opacity-100'
                          }`}
                      >
                        <Star className={`w-4 h-4 ${isSubbed ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {assistant.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                      {assistant.description}
                    </p>
                  </div>

                  {assistant.deletedByOwner && (
                    <div className="relative z-[1] px-5 pb-4">
                      <div className="flex items-center justify-end text-[11px] text-muted-foreground min-h-[16px]">
                        <span className="flex items-center gap-1.5 font-medium text-muted-foreground/80" title="Deleted by Owner">
                          <Trash2 className="w-3 h-3" /> Deleted by owner
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredAssistants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No assistants found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We couldn't find any assistants matching your current filters. Try adjusting your search or category.
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-6 btn-secondary"
                >
                  View All Assistants
                </button>
              )}
            </div>
          )}
        </div>
      </div>



      {/* Side Panel */}
      <div
        className={`bg-card border-l border-border h-full overflow-y-auto transition-all duration-300 ease-in-out ${selectedAssistant ? 'w-[400px] translate-x-0 opacity-100' : 'w-0 translate-x-full opacity-0 border-none'
          }`}
      >
        {selectedAssistant && (
          <AssistantDetailsSidebar
            assistant={selectedAssistant}
            userAssistants={userAssistants}
            subscribedIds={subscribedIds}
            onClose={() => setSelectedAssistant(null)}
            onSelectAssistant={onSelectAssistant}
            onEditAssistant={onEditAssistant}
            onDuplicateAssistant={onDuplicateAssistant}
            onDeleteAssistant={onDeleteAssistant}
            onToggleSubscribe={onToggleSubscribe}
          />
        )}
      </div>

      {showImportModal && (
        <ImportAssistantModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportComplete}
        />
      )}
    </div>
  );
}
