import { Star, Edit, Plus, Search, FileUp, X, Info, Trash2, Sparkles, Zap, MessageSquare, Check, ChevronDown } from 'lucide-react';
import { Assistant } from '../types';
import { useState, useEffect } from 'react';

interface AssistantDiscoveryProps {
  assistants: Assistant[];
  userAssistants: Assistant[];
  onSelectAssistant: (assistant: Assistant) => void;
  onEditAssistant: (assistant: Assistant) => void;
  onDeleteAssistant: (assistantId: string) => void;
  onCreateNew: () => void;
  onToggleFavorite: (assistantId: string) => void;
  favorites: string[];
}

// Helper function to format tool names
const formatToolName = (tool: string): string => {
  return tool
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get color classes for tools
const getToolColor = (tool: string): string => {
  const colors: Record<string, string> = {
    'web-search': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    'code-interpreter': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
    'image-generation': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800',
    'file-upload': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800',
    'data-analysis': 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-800',
    'document-search': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
    'api-call': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800',
  };
  return colors[tool] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700';
};

export function AssistantDiscovery({
  assistants,
  userAssistants,
  onSelectAssistant,
  onEditAssistant,
  onDeleteAssistant,
  onCreateNew,
  onToggleFavorite,
  favorites,
}: AssistantDiscoveryProps) {
  const [filter, setFilter] = useState<'all' | 'recommended' | 'yours' | 'favorites'>('favorites');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [sortBy, setSortBy] = useState<'subscriptions' | 'title' | 'updated'>('subscriptions');
  const [showSortMenu, setShowSortMenu] = useState(false);

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
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            alert(`Imported: ${imported.name} (Simulation)`);
          } catch (error) {
            alert('Failed to import.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredAssistants = assistants.filter((assistant) => {
    if (filter === 'recommended' && assistant.createdBy !== 'system') return false;
    if (filter === 'yours' && assistant.createdBy !== 'user') return false;
    if (filter === 'favorites' && !favorites.includes(assistant.id)) return false;

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
        <div className="max-w-[1800px] mx-auto p-4 sm:p-8 lg:p-12">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
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
          <div className="sticky top-0 z-10 bg-background py-4 mb-6 border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:border-none sm:relative">
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
                  {(['all', 'recommended', 'favorites', 'yours'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-all whitespace-nowrap ${filter === f
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                      {f}
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
              const isFav = favorites.includes(assistant.id);
              return (
                <div
                  key={assistant.id}
                  onClick={() => setSelectedAssistant(assistant)}
                  className={`group relative flex flex-col p-4 bg-card rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${selectedAssistant?.id === assistant.id
                    ? 'border-primary ring-1 ring-primary shadow-lg scale-[1.02]'
                    : 'border-border/50 hover:border-primary/50 shadow-sm hover:shadow-md'
                    }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-[1]">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-lg bg-background shadow-inner flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                        {assistant.icon}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(assistant.id);
                        }}
                        className={`p-1.5 rounded-full transition-colors ${isFav ? 'text-yellow-400 bg-yellow-400/10' : 'text-muted-foreground/30 hover:text-yellow-400 hover:bg-yellow-400/10'
                          }`}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                      {assistant.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-10 leading-relaxed">
                      {assistant.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {assistant.allowedTools.slice(0, 2).map((tool) => (
                        <span key={tool} className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md border ${getToolColor(tool)}`}>
                          {formatToolName(tool)}
                        </span>
                      ))}
                      {assistant.allowedTools.length > 2 && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                          +{assistant.allowedTools.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
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
          <div className="p-6 space-y-8 min-w-[400px]">
            {/* Panel Header */}
            <div className="flex flex-col items-center text-center relative">
              <button
                onClick={() => setSelectedAssistant(null)}
                className="absolute top-0 right-0 p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-24 h-24 rounded-3xl bg-background border border-border shadow-sm flex items-center justify-center text-5xl mb-4">
                {selectedAssistant.icon}
              </div>
              <h2 className="text-2xl font-bold text-foreground">{selectedAssistant.name}</h2>
              <div className="flex flex-col gap-2 mt-2 items-center">
                <div className="flex gap-2">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                    {selectedAssistant.responseBehavior === 'creative' ? '🎨 Creative' :
                      selectedAssistant.responseBehavior === 'precise' ? '🎯 Precise' : '⚖️ Balanced'}
                  </span>
                  {favorites.includes(selectedAssistant.id) && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Favorite
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {selectedAssistant.responseBehavior === 'creative' && 'Prefers imaginative and shorter responses.'}
                  {selectedAssistant.responseBehavior === 'precise' && 'Focuses on factual and detailed accuracy.'}
                  {selectedAssistant.responseBehavior === 'balanced' && 'Maintains a neutral and informative tone.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onSelectAssistant(selectedAssistant)}
                className="btn-primary w-full py-3 shadow-md shadow-primary/20 text-base"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Start Conversation
                </div>
              </button>

              {userAssistants.some(a => a.id === selectedAssistant.id) && (
                <div className="flex gap-3">
                  <button
                    onClick={() => onEditAssistant(selectedAssistant)}
                    className="btn-secondary flex-1 justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${selectedAssistant.name}?`)) {
                        onDeleteAssistant(selectedAssistant.id);
                        setSelectedAssistant(null);
                      }
                    }}
                    className="btn-ghost text-destructive hover:bg-destructive/10 flex-1 justify-center border border-border/50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" /> About
                </h3>
                <p className="text-foreground leading-relaxed text-sm">
                  {selectedAssistant.description}
                </p>
              </div>

              {selectedAssistant.allowedTools.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Enabled Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAssistant.allowedTools.map((tool) => (
                      <span key={tool} className={`text-xs px-2.5 py-1 rounded-md border font-medium ${getToolColor(tool)}`}>
                        {formatToolName(tool)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAssistant.quickPrompts && selectedAssistant.quickPrompts.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Quick Prompts
                  </h3>
                  <div className="space-y-2">
                    {selectedAssistant.quickPrompts.map((prompt, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground italic hover:bg-muted transition-colors cursor-default">
                        "{prompt}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAssistant.systemPrompt && (
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileUp className="w-4 h-4" /> System Prompt
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs text-muted-foreground border border-border overflow-x-auto max-h-60">
                    {selectedAssistant.systemPrompt}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
