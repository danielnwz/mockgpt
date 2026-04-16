import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Mic,
  Plus,
  X,
  Search,
  Code2,
  FileUp,
  BarChart3,
  ImagePlus,
  Paperclip,
  BookOpen,
  BriefcaseBusiness,
  Settings,
  Info,
  Globe,
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
  icon: typeof Search;
  description: string;
};

type ComposerToolSingle = ComposerToolLeaf & {
  type: 'tool';
};

type ComposerToolGroup = {
  id: string;
  type: 'group';
  label: string;
  icon: typeof Search;
  description: string;
  tools: ComposerToolLeaf[];
};

type ComposerToolItem = ComposerToolSingle | ComposerToolGroup;

export const COMPOSER_TOOL_ITEMS: ComposerToolItem[] = [
  {
    type: 'group',
    id: 'jira',
    label: 'Jira',
    icon: BriefcaseBusiness,
    description: 'Issue, sprint, and workflow tools from the Jira MCP server.',
    tools: [
      { id: 'jira_search_issues', label: 'Search Issues', icon: Search, description: 'Find issues, bugs, epics, and tasks.' },
      { id: 'jira_get_issue', label: 'Get Issue', icon: Search, description: 'Open issue details, status, and assignees.' },
      { id: 'jira_create_issue', label: 'Create Issue', icon: Plus, description: 'Create new tickets directly from chat.' },
      { id: 'jira_update_issue', label: 'Update Issue', icon: Settings, description: 'Edit issue fields, transitions, and metadata.' },
      { id: 'jira_add_comment', label: 'Add Comment', icon: Info, description: 'Post updates and follow-ups on issues.' },
      { id: 'jira_manage_sprints', label: 'Manage Sprints', icon: BarChart3, description: 'Inspect boards, sprints, and delivery progress.' },
    ],
  },
  {
    type: 'group',
    id: 'confluence',
    label: 'Confluence',
    icon: BookOpen,
    description: 'Knowledge base tools from the Confluence MCP server.',
    tools: [
      { id: 'confluence_search_pages', label: 'Search Pages', icon: Search, description: 'Search knowledge base pages and spaces.' },
      { id: 'confluence_read_page', label: 'Read Page', icon: BookOpen, description: 'Open page content and summaries.' },
      { id: 'confluence_create_page', label: 'Create Page', icon: Plus, description: 'Draft new documentation pages.' },
      { id: 'confluence_update_page', label: 'Update Page', icon: Settings, description: 'Edit existing pages and publish updates.' },
      { id: 'confluence_manage_comments', label: 'Manage Comments', icon: Info, description: 'Read and add comments on pages.' },
      { id: 'confluence_browse_space', label: 'Browse Spaces', icon: Globe, description: 'Navigate spaces, hierarchies, and docs.' },
    ],
  },
  { type: 'tool', id: 'search', label: 'Search', icon: Search, description: 'Search the web and retrieve external information.' },
  { type: 'tool', id: 'web_browser', label: 'Web Browser', icon: Globe, description: 'Open and inspect pages directly in the chat flow.' },
  { type: 'tool', id: 'code_interpreter', label: 'Code Interpreter', icon: Code2, description: 'Run code, transform data, and generate results.' },
  { type: 'tool', id: 'file_upload', label: 'File Upload', icon: FileUp, description: 'Attach local files and use them as chat context.' },
  { type: 'tool', id: 'data_analysis', label: 'Data Analysis', icon: BarChart3, description: 'Analyze tabular data, trends, and datasets.' },
  { type: 'tool', id: 'image_generation', label: 'Image Generation', icon: ImagePlus, description: 'Create new images from text prompts.' },
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
                const ToolIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleComposerTool(item.id)}
                    className="group inline-flex h-7 shrink-0 items-center rounded-full border border-primary/20 bg-primary/[0.08] px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/[0.14]"
                  >
                    <ToolIcon className="h-3 w-3" />
                    <span className="ml-1.5">{item.label}</span>
                    <span className="inline-flex h-4 w-0 items-center justify-center overflow-hidden rounded-full bg-primary/12 text-[12px] font-semibold leading-none opacity-0 transition-all duration-200 group-hover:ml-1 group-hover:w-4 group-hover:opacity-100">
                      X
                    </span>
                  </button>
                );
              }

              const activeGroupToolIds = item.tools.filter((t) => activeToolSet.has(t.id)).map((t) => t.id);
              const GroupIcon = item.icon;
              return (
                <HoverCard key={item.id} openDelay={100} closeDelay={120}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      onClick={() => toggleComposerToolIds(activeGroupToolIds)}
                      className="group inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.08] px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/[0.14]"
                    >
                      <GroupIcon className="h-3 w-3" />
                      <span>{item.label}</span>
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                        {activeCount}
                      </span>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent align="start" className="w-80 rounded-2xl border-border bg-popover p-3">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{activeCount} of {item.tools.length} tools active</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleComposerToolIds(getComposerItemToolIds(item))}
                        className="inline-flex shrink-0 items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        {activeCount === item.tools.length ? 'Disable all' : 'Enable all'}
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {item.tools.map((tool) => {
                        const ToolIcon = tool.icon;
                        const isActive = activeToolSet.has(tool.id);
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => toggleComposerTool(tool.id)}
                            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${isActive ? 'border-primary/30 bg-primary/10 text-primary' : 'border-transparent bg-transparent text-foreground hover:bg-accent/60'}`}
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              <ToolIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>{tool.label}</p>
                              <p className={`text-xs ${isActive ? 'text-primary/80' : 'text-muted-foreground'}`}>{tool.description}</p>
                            </div>
                            {isActive && <Check className="h-4 w-4 text-primary" />}
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
                    className="inline-flex h-7 shrink-0 items-center rounded-full border border-primary/20 bg-primary/[0.06] px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/[0.12]"
                  >
                    <span>+{hiddenActiveItems.length} more</span>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent align="start" className="w-80 rounded-2xl border-border bg-popover p-3">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">More active tools</p>
                    <p className="mt-1 text-xs text-muted-foreground">Hidden from the composer bar to keep the layout stable.</p>
                  </div>
                  <div className="space-y-1.5">
                    {hiddenActiveItems.map(({ item, activeCount }) => {
                      if (!isComposerToolGroup(item)) {
                        const ToolIcon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleComposerTool(item.id)}
                            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left text-foreground transition-colors hover:bg-accent/60"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                              <ToolIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        );
                      }
                      const GroupIcon = item.icon;
                      const activeGroupToolIds = item.tools.filter((t) => activeToolSet.has(t.id)).map((t) => t.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleComposerToolIds(activeGroupToolIds)}
                          className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left text-foreground transition-colors hover:bg-accent/60"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <GroupIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{item.label}</p>
                              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
                                {activeCount}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{activeCount} tools active</p>
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
                  className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-primary bg-primary px-2.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-3 w-3" />
                  <span>Tool</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                collisionPadding={TOOL_PICKER_VIEWPORT_PADDING}
                className="w-[26rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-border bg-popover p-0"
              >
                <div className="border-b border-border/60 px-4 pb-3 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Available Tools</p>
                </div>
                <div className="max-h-[70vh] space-y-2 overflow-y-auto p-2">
                  {availableComposerItems.map((item) => {
                    if (isComposerToolGroup(item)) {
                      const groupToolIds = getComposerItemToolIds(item);
                      const activeCount = groupToolIds.filter((id) => activeToolSet.has(id)).length;
                      const isFullyActive = activeCount === groupToolIds.length;
                      const GroupIcon = item.icon;
                      const isGroupExpanded = expandedToolGroups[item.id] ?? false;
                      return (
                        <Collapsible
                          key={item.id}
                          open={isGroupExpanded}
                          onOpenChange={(open) => setExpandedToolGroups((c) => ({ ...c, [item.id]: open }))}
                          className={`rounded-2xl border p-3 transition-colors ${activeCount > 0 ? 'border-primary/25 bg-primary/[0.05]' : 'border-border/70 bg-background/40'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activeCount > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              <GroupIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-semibold ${activeCount > 0 ? 'text-primary' : 'text-foreground'}`}>{item.label}</p>
                                <span className={`inline-flex min-w-10 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${activeCount > 0 ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  {activeCount}/{groupToolIds.length}
                                </span>
                              </div>
                              <p className={`mt-1 text-xs ${activeCount > 0 ? 'text-primary/80' : 'text-muted-foreground'}`}>{item.description}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleComposerToolIds(groupToolIds)}
                                className={`inline-flex h-8 items-center rounded-full border px-2.5 text-[11px] font-medium transition-colors ${activeCount > 0 ? 'border-primary/25 bg-primary/10 text-primary hover:bg-primary/15' : 'border-border bg-background text-foreground hover:border-primary/30 hover:text-primary'}`}
                              >
                                {isFullyActive ? 'Disable all' : 'Enable all'}
                              </button>
                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                                  aria-label={isGroupExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                                >
                                  <ChevronDown className={`h-4 w-4 transition-transform ${isGroupExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className="pt-3">
                            <div className="grid gap-1.5">
                              {item.tools.map((tool) => {
                                const ToolIcon = tool.icon;
                                const isActive = activeToolSet.has(tool.id);
                                return (
                                  <button
                                    key={tool.id}
                                    type="button"
                                    onClick={() => toggleComposerTool(tool.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${isActive ? 'border-primary/30 bg-primary/10 text-primary' : 'border-transparent bg-transparent text-foreground hover:bg-accent/60'}`}
                                  >
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                      <ToolIcon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>{tool.label}</p>
                                      <p className={`text-xs ${isActive ? 'text-primary/80' : 'text-muted-foreground'}`}>{tool.description}</p>
                                    </div>
                                    {isActive && <Check className="h-4 w-4 text-primary" />}
                                  </button>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    }

                    const ToolIcon = item.icon;
                    const isActive = activeToolSet.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleComposerTool(item.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${isActive ? 'border-primary/30 bg-primary/10 text-primary' : 'border-transparent bg-transparent text-foreground hover:bg-accent/60'}`}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <ToolIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>{item.label}</p>
                          <p className={`text-xs ${isActive ? 'text-primary/80' : 'text-muted-foreground'}`}>{item.description}</p>
                        </div>
                        {isActive && <Check className="h-4 w-4 text-primary" />}
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
