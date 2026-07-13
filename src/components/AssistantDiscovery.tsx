import { Star, Plus, Search, FileUp, X, Check, ChevronDown, Trash2, Lock, Users, Globe2 } from 'lucide-react';
import { Assistant, AssistantReport, AssistantReportReason, UserRole } from '../types';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { ImportAssistantModal } from './ImportAssistantModal';
import { AssistantDetailsSidebar } from './AssistantDetailsSidebar';

type SortBy = 'subscriptions' | 'title' | 'updated' | 'lastUsed';
type PersonalFilter = 'all' | 'owned' | 'subscribed';

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
  currentUserRole: UserRole;
  adminMode: boolean;
  reports: AssistantReport[];
  onReportAssistant: (assistantId: string, reason: AssistantReportReason, comment?: string) => void;
}

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
  currentUserRole,
  adminMode,
  reports,
  onReportAssistant,
}: AssistantDiscoveryProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [personalSortBy, setPersonalSortBy] = useState<SortBy>('updated');
  const [communitySortBy, setCommunitySortBy] = useState<SortBy>('updated');
  const [openSortMenu, setOpenSortMenu] = useState<'personal' | 'community' | null>(null);
  const [personalFilter, setPersonalFilter] = useState<PersonalFilter>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [personalExpanded, setPersonalExpanded] = useState(false);
  const personalSectionRef = useRef<HTMLElement | null>(null);
  const communitySectionRef = useRef<HTMLElement | null>(null);

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


  const uniqueAssistants = assistants.filter((assistant, index, list) =>
    list.findIndex((item) => item.id === assistant.id) === index
  );

  const reportsByAssistant = reports.reduce<Record<string, AssistantReport[]>>((acc, report) => {
    acc[report.assistantId] = [...(acc[report.assistantId] || []), report];
    return acc;
  }, {});



  const matchesSearch = (assistant: Assistant) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      assistant.name.toLowerCase().includes(query) ||
      assistant.description.toLowerCase().includes(query) ||
      assistant.createdBy.toLowerCase().includes(query) ||
      assistant.allowedTools.some(tool => formatToolName(tool).toLowerCase().includes(query))
    );
  };

  const sortAssistants = (items: Assistant[], sortBy: SortBy) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'title') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'subscriptions') {
        return (b.subscriptionCount || 0) - (a.subscriptionCount || 0);
      }
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });
  };

  const isOwnedAssistant = (assistant: Assistant) => assistant.createdBy === 'user';
  const isImportedAssistant = (assistant: Assistant) =>
    userAssistants.some((userAssistant) => userAssistant.id === assistant.id) && !isOwnedAssistant(assistant);
  const isSubscribedAssistant = (assistant: Assistant) =>
    subscribedIds.includes(assistant.id) || isImportedAssistant(assistant);

  const canViewAssistant = (assistant: Assistant) => {
    if (assistant.deletedByOwner || assistant.moderationHidden) return false;
    return assistant.isPublic || isOwnedAssistant(assistant) || isSubscribedAssistant(assistant);
  };


  const discoverableAssistants = uniqueAssistants.filter((assistant) =>
    canViewAssistant(assistant) && matchesSearch(assistant)
  );

  const ownedAssistants = sortAssistants(
    discoverableAssistants.filter((assistant) => isOwnedAssistant(assistant)),
    personalSortBy
  );
  const subscribedAssistants = sortAssistants(
    discoverableAssistants.filter((assistant) =>
      !isOwnedAssistant(assistant) &&
      isSubscribedAssistant(assistant)
    ),
    personalSortBy
  );
  const communityAssistants = sortAssistants(
    discoverableAssistants.filter((assistant) =>
      !isOwnedAssistant(assistant) &&
      !isSubscribedAssistant(assistant)
    ),
    communitySortBy
  );

  const personalAssistants =
    personalFilter === 'owned'
      ? ownedAssistants
      : personalFilter === 'subscribed'
        ? subscribedAssistants
        : [...ownedAssistants, ...subscribedAssistants];
  const personalLimit = 6;
  const visiblePersonalAssistants = personalExpanded || searchQuery
    ? personalAssistants
    : personalAssistants.slice(0, personalLimit);
  const hiddenPersonalCount = personalAssistants.length - visiblePersonalAssistants.length;
  const hasAnyResults = personalAssistants.length > 0 || communityAssistants.length > 0;

  const getSortLabel = (option: SortBy) => {
    if (option === 'subscriptions') return 'Subscriptions';
    if (option === 'lastUsed') return 'Last used';
    if (option === 'title') return 'Title';
    return 'Last updated';
  };

  const renderSortControl = (
    menu: 'personal' | 'community',
    value: SortBy,
    onChange: (nextSort: SortBy) => void,
    options: SortBy[] = ['updated', 'subscriptions', 'title']
  ) => (
    <div className="relative z-20 flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => setOpenSortMenu(openSortMenu === menu ? null : menu)}
        className="flex min-w-[150px] items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:border-primary/50"
      >
        <span className="font-medium text-foreground">{getSortLabel(value)}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openSortMenu === menu ? 'rotate-180' : ''}`} />
      </button>

      {openSortMenu === menu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpenSortMenu(null)} />
          <div className="surface-popover absolute right-0 top-full z-30 mt-2 w-48 py-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpenSortMenu(null);
                }}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span>{getSortLabel(option)}</span>
                {value === option && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const gridClassName = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${selectedAssistant ? 'lg:grid-cols-2 xl:grid-cols-3' : ''
    } gap-3 sm:gap-4 transition-all duration-300`;

  const formatSubscriberCount = (count?: number) => {
    if (count === undefined) return null;
    if (count <= 0) return null;
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return count.toLocaleString();
  };

  const getAssistantMeta = (assistant: Assistant) => {
    const author = isOwnedAssistant(assistant) ? 'You' : assistant.createdBy;
    if (!assistant.isPublic) {
      return { author, status: 'Private', statusType: 'private' as const };
    }

    const subscriberCount = formatSubscriberCount(assistant.subscriptionCount);
    if (subscriberCount) {
      return { author, status: subscriberCount, statusType: 'subscribers' as const };
    }

    return { author, status: 'Public', statusType: 'public' as const };
  };

  const renderAssistantCard = (assistant: Assistant) => {
    const isOwn = isOwnedAssistant(assistant);
    const isSubbed = isSubscribedAssistant(assistant);
    const meta = getAssistantMeta(assistant);

    return (
      <div
        key={assistant.id}
        onClick={() => setSelectedAssistant(assistant)}
        className={`group relative flex min-h-[124px] cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md ${selectedAssistant?.id === assistant.id
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border/70'
          } ${assistant.deletedByOwner ? 'opacity-70 grayscale-[0.2]' : ''}`}
      >
        <div className="flex h-full flex-col px-3.5 pb-2.5 pt-3">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/15 text-[1.1rem] ring-1 ring-slate-200/80 dark:ring-slate-600/35 ${assistant.deletedByOwner ? 'grayscale' : ''}`}>
                {assistant.icon}
              </div>
              <h3 className="line-clamp-2 min-w-0 text-sm font-semibold leading-5 text-foreground group-hover:text-primary" title={assistant.name}>
                {assistant.name}
              </h3>
            </div>
            {!isOwn && (
              <button
                type="button"
                aria-label={isSubbed ? t('unsubscribe') : t('subscribe')}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSubscribe(assistant.id);
                }}
                className={`shrink-0 rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100 ${isSubbed
                  ? 'text-yellow-500'
                  : 'text-muted-foreground/40 hover:text-yellow-500'
                  }`}
              >
                <Star className={`h-4 w-4 ${isSubbed ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          <p className="mb-2 line-clamp-2 text-xs leading-4 text-muted-foreground">
            {assistant.description}
          </p>


          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/20 pt-2.5 text-[11px] leading-4 text-muted-foreground/35">
            <span className="min-w-0 truncate">{meta.author}</span>
            {meta.status && (
              <span className="inline-flex shrink-0 items-center gap-1">
                {meta.statusType === 'private' && <Lock className="h-3 w-3" />}
                {meta.statusType === 'subscribers' && <Users className="h-3 w-3" />}
                {meta.statusType === 'public' && <Globe2 className="h-3 w-3" />}
                {meta.status}
              </span>
            )}
          </div>

          {assistant.deletedByOwner && (
            <div className="mt-2 flex items-center justify-end text-[11px] text-muted-foreground">
              <span className="inline-flex shrink-0 items-center gap-1 font-medium">
                <Trash2 className="h-3 w-3" /> Deleted
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-full overflow-hidden bg-background/50">
      <div className="thin-scrollbar h-full w-full flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1180px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mb-1 text-3xl font-bold tracking-tight text-foreground">
                Assistant Library
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Your own assistants first, subscriptions next, and the community below.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                className="btn border border-border/70 bg-card/60 text-muted-foreground shadow-none transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground"
              >
                <FileUp className="h-4 w-4" />
                {t('import')}
              </button>
              <button onClick={onCreateNew} className="btn-primary shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30">
                <Plus className="h-5 w-5" />
                {t('createNew')}
              </button>
            </div>
          </div>

          <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-border bg-background px-4 py-2.5 sm:relative sm:mx-0 sm:border-none sm:bg-transparent sm:px-0">
            <div className="flex flex-col gap-4">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchAssistants')}
                  className="w-full rounded-xl border border-border/70 bg-card/70 py-2.5 pl-10 pr-10 text-sm outline-none shadow-none transition-all placeholder:text-muted-foreground hover:border-primary/30 focus:border-primary/60 focus:bg-background"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-accent"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6 pb-20">
            <section ref={personalSectionRef} className="scroll-mt-28">
              <div className="mb-3 flex flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Personal assistants</h2>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex w-fit rounded-lg border border-border bg-muted/30 p-1">
                    {([
                      ['all', 'All'],
                      ['owned', 'Created'],
                      ['subscribed', t('subscribed')],
                    ] as const).map(([filterValue, label]) => (
                      <button
                        key={filterValue}
                        type="button"
                        onClick={() => {
                          setPersonalFilter(filterValue);
                          setPersonalExpanded(false);
                        }}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${personalFilter === filterValue
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    {renderSortControl('personal', personalSortBy, setPersonalSortBy, ['lastUsed', 'updated', 'subscriptions', 'title'])}
                  </div>
                </div>
              </div>

              {visiblePersonalAssistants.length > 0 ? (
                <>
                  <div className={gridClassName}>
                    {visiblePersonalAssistants.map(renderAssistantCard)}
                  </div>
                  {(hiddenPersonalCount > 0 || (personalExpanded && !searchQuery && personalAssistants.length > personalLimit)) && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      {hiddenPersonalCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => setPersonalExpanded(true)}
                          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
                        >
                          Show more personal assistants
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPersonalExpanded(false)}
                          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
                        >
                          Show less
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-card/60 px-5 py-8 text-center">
                  <h3 className="text-sm font-semibold text-foreground">No personal assistants found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Create one or subscribe to a community assistant.</p>
                </div>
              )}
            </section>

            <section ref={communitySectionRef} className="scroll-mt-28 border-t border-border/80 pt-5">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">Community assistants</h2>
                  </div>
                </div>
                {renderSortControl('community', communitySortBy, setCommunitySortBy)}
              </div>

              {communityAssistants.length > 0 ? (
                <div className={gridClassName}>
                  {communityAssistants.map(renderAssistantCard)}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-card/60 px-5 py-8 text-center">
                  <h3 className="text-sm font-semibold text-foreground">No community assistants found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Try a different search term.</p>
                </div>
              )}
            </section>

            {!hasAnyResults && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted/40">
                  <Search className="h-9 w-9 text-muted-foreground/60" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{t('noAssistantsFound')}</h3>
                <p className="mx-auto max-w-sm text-muted-foreground">{t('tryAdjusting')}</p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="btn-secondary mt-6"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`h-full overflow-y-auto border-l border-border bg-card transition-all duration-300 ease-in-out ${selectedAssistant ? 'w-[400px] translate-x-0 opacity-100' : 'w-0 translate-x-full border-none opacity-0'
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
            currentUserRole={currentUserRole}
            adminMode={adminMode}
            reportsForAssistant={reportsByAssistant[selectedAssistant.id] || []}
            onReportAssistant={onReportAssistant}
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












