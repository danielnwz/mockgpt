import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Mic,
  Plus,
  X,
  FileUp,
  Paperclip,
  Check,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Slider } from './ui/slider';

type ComposerToolId = string;

type ComposerToolLeaf = {
  id: ComposerToolId;
  label: string;
};

type ComposerToolSingle = ComposerToolLeaf & {
  type: 'tool';
};

type ComposerToolGroup = {
  id: string;
  type: 'group';
  label: string;
  tools: ComposerToolLeaf[];
};

type ComposerToolItem = ComposerToolSingle | ComposerToolGroup;

export const COMPOSER_TOOL_ITEMS: ComposerToolItem[] = [
  {
    type: 'group',
    id: 'jira',
    label: 'Jira',
    tools: [
      { id: 'jira_search_issues', label: 'Search Issues' },
      { id: 'jira_get_issue', label: 'Get Issue' },
      { id: 'jira_create_issue', label: 'Create Issue' },
      { id: 'jira_update_issue', label: 'Update Issue' },
      { id: 'jira_add_comment', label: 'Add Comment' },
      { id: 'jira_manage_sprints', label: 'Manage Sprints' },
    ],
  },
  {
    type: 'group',
    id: 'confluence',
    label: 'Confluence',
    tools: [
      { id: 'confluence_search_pages', label: 'Search Pages' },
      { id: 'confluence_read_page', label: 'Read Page' },
      { id: 'confluence_create_page', label: 'Create Page' },
      { id: 'confluence_update_page', label: 'Update Page' },
      { id: 'confluence_manage_comments', label: 'Manage Comments' },
      { id: 'confluence_browse_space', label: 'Browse Spaces' },
    ],
  },
  { type: 'tool', id: 'search', label: 'Search' },
  { type: 'tool', id: 'web_browser', label: 'Web Browser' },
  { type: 'tool', id: 'code_interpreter', label: 'Code Interpreter' },
  { type: 'tool', id: 'file_upload', label: 'File Upload' },
  { type: 'tool', id: 'data_analysis', label: 'Data Analysis' },
  { type: 'tool', id: 'image_generation', label: 'Image Generation' },
];

const isComposerToolGroup = (item: ComposerToolItem): item is ComposerToolGroup => item.type === 'group';

const getComposerItemToolIds = (item: ComposerToolItem): ComposerToolId[] => (
  isComposerToolGroup(item) ? item.tools.map((tool) => tool.id) : [item.id]
);

const TOOL_PICKER_VIEWPORT_PADDING = 16;
const MAX_VISIBLE_ACTIVE_TOOL_CHIPS = 2;

export interface ChatComposerProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  privateMode?: boolean;
  /** If provided, only these tool IDs (or group IDs) are shown */
  allowedTools?: string[];
  /** Pass to show the reasoning control */
  reasoningLevel?: number;
  reasoningOptions?: Array<{ value: number; label: string }>;
  onReasoningChange?: (level: number) => void;
  reasoningLabel?: string;
}

export function ChatComposer({
  onSubmit,
  placeholder = 'Type a message...',
  privateMode = false,
  allowedTools,
  reasoningLevel,
  reasoningOptions,
  onReasoningChange,
  reasoningLabel,
}: ChatComposerProps) {
  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [isToolPickerOpen, setIsToolPickerOpen] = useState(false);
  const [expandedToolGroups, setExpandedToolGroups] = useState<Record<string, boolean>>({});
  const [activeTools, setActiveTools] = useState<ComposerToolId[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableComposerItems = useMemo<ComposerToolItem[]>(() => {
    if (!allowedTools?.length) return COMPOSER_TOOL_ITEMS;

    return COMPOSER_TOOL_ITEMS.flatMap<ComposerToolItem>((item): ComposerToolItem[] => {
      if (isComposerToolGroup(item)) {
        if (allowedTools.includes(item.id)) return [item];
        const allowed = item.tools.filter((tool) => allowedTools.includes(tool.id));
        return allowed.length > 0 ? [{ ...item, tools: allowed }] : [];
      }
      return allowedTools.includes(item.id) ? [item] : [];
    });
  }, [allowedTools]);

  useEffect(() => {
    if (allowedTools?.length) {
      setActiveTools(availableComposerItems.flatMap((item) => getComposerItemToolIds(item)));
      return;
    }
    const standalone = availableComposerItems.filter((item): item is ComposerToolSingle => item.type === 'tool');
    setActiveTools(standalone.slice(0, Math.min(3, standalone.length)).map((tool) => tool.id));
  }, [availableComposerItems, allowedTools]);

  const activeToolSet = useMemo(() => new Set(activeTools), [activeTools]);

  const activeComposerItems = useMemo<Array<{ item: ComposerToolItem; activeCount: number }>>(() => (
    availableComposerItems
      .map((item) => ({
        item,
        activeCount: getComposerItemToolIds(item).filter((id) => activeToolSet.has(id)).length,
      }))
      .filter(({ activeCount }) => activeCount > 0)
  ), [availableComposerItems, activeToolSet]);

  const visibleActiveItems = useMemo(() => activeComposerItems.slice(0, MAX_VISIBLE_ACTIVE_TOOL_CHIPS), [activeComposerItems]);
  const hiddenActiveItems = useMemo(() => activeComposerItems.slice(MAX_VISIBLE_ACTIVE_TOOL_CHIPS), [activeComposerItems]);

  useEffect(() => {
    setExpandedToolGroups((current) => {
      const next: Record<string, boolean> = {};
      availableComposerItems.forEach((item) => {
        if (!isComposerToolGroup(item)) return;
        const activeCount = getComposerItemToolIds(item).filter((id) => activeToolSet.has(id)).length;
        next[item.id] = current[item.id] ?? activeCount > 0;
      });
      return next;
    });
  }, [availableComposerItems, activeToolSet]);

  const toggleComposerToolIds = (toolIds: ComposerToolId[]) => {
    setActiveTools((current) => {
      const next = new Set(current);
      const shouldEnable = toolIds.some((id) => !next.has(id));
      toolIds.forEach((id) => (shouldEnable ? next.add(id) : next.delete(id)));
      const ordered = availableComposerItems.flatMap((item) => getComposerItemToolIds(item));
      return ordered.filter((id) => next.has(id));
    });
  };

  const toggleComposerTool = (toolId: ComposerToolId) => toggleComposerToolIds([toolId]);

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    const attachmentSummary = selectedFiles.length > 0
      ? `\n\nAttached files:\n${selectedFiles.map((f) => `- ${f.name}`).join('\n')}`
      : '';
    const content = `${trimmedInput}${attachmentSummary}`.trim();
    if (!content) return;
    onSubmit(content);
    setInput('');
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles((current) => {
      const existingKeys = new Set(current.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      return [...current, ...files.filter((f) => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`))];
    });
  };

  const removeFile = (fileToRemove: File) => {
    setSelectedFiles((current) => current.filter((f) => (
      !(f.name === fileToRemove.name && f.size === fileToRemove.size && f.lastModified === fileToRemove.lastModified)
    )));
  };

  const hasTypedInput = input.trim().length > 0;
  const showReasoning = reasoningOptions != null && onReasoningChange != null && reasoningLevel != null;

  return (
    <div>
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelection} />

      {/* Tool chips bar */}
      {availableComposerItems.length > 0 && (
        <div className="mb-2">
          <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 py-1">

            {/* Visible active chips */}
            {visibleActiveItems.map(({ item, activeCount }) => {
              if (!isComposerToolGroup(item)) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleComposerTool(item.id)}
                    className="group inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-border/80 bg-card/95 px-3 text-xs font-medium text-primary shadow-sm shadow-black/5 transition-colors hover:border-primary/25 hover:bg-card"
                  >
                    <span>{item.label}</span>
                    <span className="inline-flex h-4 w-0 items-center justify-center overflow-hidden rounded-full text-muted-foreground opacity-0 transition-all duration-200 group-hover:ml-0.5 group-hover:w-4 group-hover:opacity-100">
                      <X className="h-3 w-3" />
                    </span>
                  </button>
                );
              }

              const activeGroupToolIds = item.tools.filter((t) => activeToolSet.has(t.id)).map((t) => t.id);
              return (
                <HoverCard key={item.id} openDelay={100} closeDelay={120}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toggleComposerToolIds(activeGroupToolIds)}
                    className="group inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-border/80 bg-card/95 px-3 text-xs font-medium text-primary shadow-sm shadow-black/5 transition-colors hover:border-primary/25 hover:bg-card"
                    >
                      <span>{item.label}</span>
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
                        {activeCount}
                      </span>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent align="start" className="w-80 rounded-[1.1rem] border-border/80 bg-popover/95 p-3 shadow-lg shadow-black/10 backdrop-blur-xl">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{activeCount} of {item.tools.length} tools active</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleComposerToolIds(getComposerItemToolIds(item))}
                        className="inline-flex shrink-0 items-center rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/25 hover:text-primary"
                      >
                        {activeCount === item.tools.length ? 'Disable all' : 'Enable all'}
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {item.tools.map((tool) => {
                        const isActive = activeToolSet.has(tool.id);
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => toggleComposerTool(tool.id)}
                            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${isActive ? 'border-primary/20 bg-primary/[0.06] text-foreground' : 'border-transparent bg-background/20 text-foreground hover:border-border/80 hover:bg-accent/30'}`}
                          >
                            <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? 'bg-primary' : 'bg-border'}`}>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{tool.label}</p>
                            </div>
                            {isActive && (
                              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}

            {/* +N more chip */}
            {hiddenActiveItems.length > 0 && (
              <HoverCard openDelay={100} closeDelay={120}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-8 shrink-0 items-center rounded-full border border-dashed border-border bg-background/70 px-3 text-xs font-medium text-primary transition-colors hover:border-primary/20 hover:bg-card"
                  >
                    <span>+{hiddenActiveItems.length} more</span>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="start" className="w-80 rounded-[1.1rem] border-border/80 bg-popover/95 p-3 shadow-lg shadow-black/10 backdrop-blur-xl">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">More active tools</p>
                  </div>
                  <div className="space-y-1.5">
                    {hiddenActiveItems.map(({ item, activeCount }) => {
                      if (!isComposerToolGroup(item)) {
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleComposerTool(item.id)}
                            className="flex w-full items-center gap-3 rounded-lg border border-transparent bg-background/20 px-3 py-2 text-left text-foreground transition-colors hover:border-border/80 hover:bg-accent/30"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                            </div>
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        );
                      }
                      const activeGroupToolIds = item.tools.filter((t) => activeToolSet.has(t.id)).map((t) => t.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleComposerToolIds(activeGroupToolIds)}
                          className="flex w-full items-center gap-3 rounded-lg border border-transparent bg-background/20 px-3 py-2 text-left text-foreground transition-colors hover:border-border/80 hover:bg-accent/30"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
                                {activeCount}
                              </span>
                            </div>
                          </div>
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}

            {/* +Tool picker */}
            <Popover open={isToolPickerOpen} onOpenChange={setIsToolPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-primary bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-3 w-3" />
                  <span>Tool</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                collisionPadding={TOOL_PICKER_VIEWPORT_PADDING}
                className="w-[23.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.35rem] border-border/80 bg-popover/95 p-0 shadow-xl shadow-black/10 backdrop-blur-xl"
              >
                <div className="border-b border-border/60 px-4 pb-3 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Available Tools</p>
                </div>
                <div className="max-h-[68vh] space-y-2 overflow-y-auto p-2.5">
                  {availableComposerItems.map((item) => {
                    if (isComposerToolGroup(item)) {
                      const groupToolIds = getComposerItemToolIds(item);
                      const activeCount = groupToolIds.filter((id) => activeToolSet.has(id)).length;
                      const isFullyActive = activeCount === groupToolIds.length;
                      const isGroupExpanded = expandedToolGroups[item.id] ?? false;
                      return (
                        <Collapsible
                          key={item.id}
                          open={isGroupExpanded}
                          onOpenChange={(open) => setExpandedToolGroups((c) => ({ ...c, [item.id]: open }))}
                          className={`rounded-[1rem] border transition-colors ${activeCount > 0 ? 'border-primary/20 bg-primary/[0.05]' : 'border-border/70 bg-muted/20 hover:border-border'}`}
                        >
                          <div className="flex items-center gap-3 px-3 py-2.5">
                            <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${activeCount > 0 ? 'bg-primary' : 'bg-border'}`}></div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                                <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                  {activeCount}/{groupToolIds.length}
                                </span>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleComposerToolIds(groupToolIds)}
                                className={`inline-flex h-8 items-center rounded-full border px-2.5 text-[11px] font-medium transition-colors ${activeCount > 0 ? 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15' : 'border-border/80 bg-background/80 text-foreground hover:border-primary/25 hover:text-primary'}`}
                              >
                                {isFullyActive ? 'Disable all' : 'Enable all'}
                              </button>
                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-background/80 text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary"
                                  aria-label={isGroupExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                                >
                                  <ChevronDown className={`h-4 w-4 transition-transform ${isGroupExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent>
                            <div className="ml-4 mr-3 border-l border-border/70 pl-3 pb-3 pt-1">
                              <div className="grid gap-1.5">
                              {item.tools.map((tool) => {
                                const isActive = activeToolSet.has(tool.id);
                                return (
                                  <button
                                    key={tool.id}
                                    type="button"
                                    onClick={() => toggleComposerTool(tool.id)}
                                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${isActive ? 'border-primary/20 bg-primary/[0.06] text-foreground' : 'border-transparent bg-background/10 text-foreground hover:border-border/80 hover:bg-accent/30'}`}
                                  >
                                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? 'bg-primary' : 'bg-border'}`}>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-foreground">{tool.label}</p>
                                    </div>
                                    {isActive && (
                                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground">
                                        <Check className="h-3 w-3" />
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    }

                    const isActive = activeToolSet.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleComposerTool(item.id)}
                        className={`flex w-full items-center gap-3 rounded-[0.95rem] border px-3 py-2 text-left transition-colors ${isActive ? 'border-primary/20 bg-primary/[0.06] text-foreground' : 'border-border/50 bg-card/70 text-foreground hover:border-border hover:bg-accent/30'}`}
                      >
                        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? 'bg-primary' : 'bg-border'}`}>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                        </div>
                        {isActive && (
                          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Input card */}
      <div className="relative rounded-[1.25rem] border border-border/80 bg-card/80 backdrop-blur-xl px-4 py-3 shadow-lg shadow-black/5 transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-xl focus-within:shadow-primary/5">
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {selectedFiles.map((file) => (
              <button
                key={`${file.name}-${file.size}-${file.lastModified}`}
                type="button"
                onClick={() => removeFile(file)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                title={`Remove ${file.name}`}
              >
                <FileUp className="h-3 w-3" />
                <span className="max-w-40 truncate">{file.name}</span>
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={privateMode ? 'Type a secure message...' : placeholder}
            rows={isInputExpanded ? 6 : 2}
            style={{ resize: 'none' }}
            className={`thin-scrollbar w-full border-0 bg-transparent pb-10 pr-10 text-[15px] leading-relaxed text-foreground outline-none transition-all placeholder:text-muted-foreground ${isInputExpanded ? 'min-h-[400px]' : 'min-h-[48px] max-h-[220px]'}`}
          />
          <button
            type="button"
            onClick={() => setIsInputExpanded((prev) => !prev)}
            className="absolute right-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground shadow-sm"
            title={isInputExpanded ? 'Collapse input' : 'Expand input'}
          >
            {isInputExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/30 text-foreground transition-all duration-300 hover:bg-accent hover:text-primary shadow-sm hover:shadow"
            title="Add files"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            {showReasoning && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 shadow-sm"
                  >
                    <span>Reasoning: {reasoningLabel}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 rounded-2xl border-border bg-popover p-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reasoning Spectrum</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{reasoningLabel}</p>
                    </div>
                    <Slider
                      value={[reasoningLevel!]}
                      min={0}
                      max={3}
                      step={1}
                      onValueChange={([value]) => onReasoningChange!(value)}
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      {reasoningOptions!.map((option) => (
                        <span key={option.value}>{option.label}</span>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold shadow-sm transition-all duration-300 ${hasTypedInput
                ? 'bg-primary text-primary-foreground hover:shadow-md hover:shadow-primary/30 hover:-translate-y-0.5'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
              }`}
              title={hasTypedInput ? 'Send' : 'Voice input'}
            >
              {hasTypedInput ? <Send className="h-4 w-4 ml-1" /> : <Mic className="h-4 w-4 ml-1" />}
              <span>{hasTypedInput ? 'Send' : 'Speak'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
