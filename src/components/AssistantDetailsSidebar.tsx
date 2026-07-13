import { Assistant, AssistantReport, AssistantReportReason, UserRole } from '../types';
import { exportAssistantData } from './AssistantDetailsPage';
import { Star, Edit, Copy, Download, Trash2, Info, Sparkles, Zap, FileUp, X, MoreVertical, MessageSquare, ChevronDown, Flag, EyeOff, AlertTriangle, type LucideIcon } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { departments } from '../data/departments';
import { findLLMModelById } from '../data/llmModels';
import { cn } from './ui/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';

interface AssistantDetailsSidebarProps {
    assistant: Assistant;
    userAssistants: Assistant[];
    onClose: () => void;
    onSelectAssistant: (assistant: Assistant) => void;
    onEditAssistant?: (assistant: Assistant) => void;
    onDuplicateAssistant?: (assistant: Assistant) => void;
    onDeleteAssistant?: (assistantId: string) => void;
    subscribedIds: string[];
    showStartConversationButton?: boolean;
    onToggleSubscribe?: (assistantId: string) => void;
    currentUserRole?: UserRole;
    adminMode?: boolean;
    reportsForAssistant?: AssistantReport[];
    onReportAssistant?: (assistantId: string, reason: AssistantReportReason, comment?: string) => void;
}

// Helper function to format tool names
const formatToolName = (tool: string): string => {
    return tool
        .split(/[-_]/)
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

const flattenDepartments = (items: typeof departments): { id: string; name: string }[] => {
    const result: { id: string; name: string }[] = [];
    const visit = (nodes: typeof departments) => {
        nodes.forEach((node) => {
            result.push({ id: node.id, name: node.name });
            if (node.children?.length) {
                visit(node.children);
            }
        });
    };
    visit(items);
    return result;
};

type SectionKey = 'about' | 'systemPrompt' | 'responseStyle' | 'tools' | 'starterPrompts' | 'quickPrompts' | 'technical';

interface SidebarSectionProps {
    title: string;
    icon: LucideIcon;
    open: boolean;
    onToggle: () => void;
    children: ReactNode;
    className?: string;
}

function SidebarSection({ title, icon: Icon, open, onToggle, children, className }: SidebarSectionProps) {
    return (
        <section className={cn('py-3', className)}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between text-left gap-3"
            >
                <span className="text-[11px] font-semibold text-foreground dark:text-foreground uppercase tracking-[0.08em] flex items-center gap-2">
                    <Icon className="w-4 h-4" /> {title}
                </span>
                <ChevronDown
                    className={cn(
                        'w-4 h-4 text-foreground/80 dark:text-foreground/85 transition-transform',
                        open ? 'rotate-180' : 'rotate-0'
                    )}
                />
            </button>
            {open && <div className="mt-3 animate-fade-up text-sm text-foreground/90 dark:text-foreground leading-relaxed">{children}</div>}
        </section>
    );
}

export function AssistantDetailsSidebar({
    assistant,
    userAssistants,
    subscribedIds,
    onClose,
    onSelectAssistant,
    onEditAssistant,
    onDuplicateAssistant,
    onDeleteAssistant,
    onToggleSubscribe,
    showStartConversationButton = true,
    currentUserRole = 'user',
    adminMode = false,
    reportsForAssistant = [],
    onReportAssistant,
}: AssistantDetailsSidebarProps) {
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState<AssistantReportReason>('inappropriate');
    const [reportComment, setReportComment] = useState('');
    const [reportSubmitted, setReportSubmitted] = useState(false);
    const optionsButtonRef = useRef<HTMLButtonElement | null>(null);
    const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
        about: true,
        systemPrompt: false,
        responseStyle: false,
        tools: true,
        starterPrompts: false,
        quickPrompts: false,
        technical: false,
    });
    const departmentMap = flattenDepartments(departments).reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = item.name;
        return acc;
    }, {});
    const publishedDepartmentNames = (assistant.publishedDepartments || []).map((id) => departmentMap[id] || id);
    const defaultLlmModelName = findLLMModelById(assistant.defaultLlmModel)?.name || assistant.defaultLlmModel || '-';
    const behaviorMeta = assistant.responseBehavior === 'creative'
        ? {
            summary: 'Open-ended and creative responses.',
        }
        : assistant.responseBehavior === 'precise'
            ? {
                summary: 'Direct and factual responses.',
            }
            : {
                summary: 'Practical and balanced responses.',
            };
    const openReports = reportsForAssistant.filter((report) => report.status === 'open');
    const canReportAssistant = Boolean(onReportAssistant) && !adminMode;
    const isPrivilegedUser = currentUserRole === 'admin' || currentUserRole === 'moderator';

    const handleSubmitReport = () => {
        if (!onReportAssistant) return;
        onReportAssistant(assistant.id, reportReason, reportComment);
        setReportSubmitted(true);
        setReportComment('');
        setShowReportDialog(false);
    };

    const toggleSection = (key: SectionKey) => {
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };
    const handleToggleMoreOptions = () => {
        if (!showMoreOptions && optionsButtonRef.current) {
            const rect = optionsButtonRef.current.getBoundingClientRect();
            const menuWidth = 192; // w-48
            const viewportPadding = 12;
            const maxLeft = window.innerWidth - menuWidth - viewportPadding;
            setMenuPosition({
                top: rect.bottom + 8,
                left: Math.min(maxLeft, Math.max(viewportPadding, rect.right - menuWidth)),
            });
        }
        setShowMoreOptions((prev) => !prev);
    };

    return (
        <div className="bg-card w-full h-full overflow-y-auto thin-scrollbar">
            <div className="p-6 space-y-7 min-w-[300px] max-w-[400px]">
                <section className="relative overflow-hidden rounded-3xl border border-border/55 bg-gradient-to-b from-secondary/20 via-card to-card px-5 pt-6 pb-5 shadow-sm">
                    <div className="pointer-events-none absolute -top-10 -right-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 hover:bg-accent/70 rounded-full transition-colors text-muted-foreground/90 dark:text-foreground/80"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-3xl bg-card border border-border/45 flex items-center justify-center text-5xl mb-4">
                            {assistant.icon}
                        </div>
                        <h2 className="text-[1.75rem] font-semibold text-foreground leading-[1.18] tracking-[-0.015em]">{assistant.name}</h2>
                        <div className="flex flex-wrap justify-center gap-2 mt-3 items-center">
                            {assistant.deletedByOwner && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground dark:text-foreground/80 border border-border/70 flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Deleted by owner
                                </span>
                            )}
                            {subscribedIds.includes(assistant.id) && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> Subscribed
                                </span>
                            )}
                            {openReports.length > 0 && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200 dark:border-amber-500/35 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> {openReports.length} open report{openReports.length === 1 ? '' : 's'}
                                </span>
                            )}
                            {assistant.moderationHidden && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 flex items-center gap-1">
                                    <EyeOff className="w-3 h-3" /> Hidden
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 flex relative shadow-md shadow-primary/15 rounded-xl group overflow-hidden">
                        {showStartConversationButton && (
                            <button
                                onClick={() => onSelectAssistant(assistant)}
                                className="btn-primary w-full py-3 text-base flex-1 rounded-none border-none hover:bg-primary/90 focus:ring-0 transition-colors shadow-none"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Start Conversation
                                </div>
                            </button>
                        )}

                        {showStartConversationButton && <div className="w-px bg-primary-foreground/20 z-10 my-1.5" />}

                        {showStartConversationButton && (
                            <button
                                ref={optionsButtonRef}
                                onClick={handleToggleMoreOptions}
                                className="btn-primary px-3 py-3 border-none hover:bg-primary/90 focus:ring-0 focus:bg-primary/80 transition-colors shadow-none active:bg-primary/80 rounded-none"
                                aria-label="More options"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        )}

                        {showStartConversationButton && showMoreOptions && (
                            typeof document !== 'undefined' && menuPosition && createPortal(
                                <>
                                    <div className="fixed inset-0 z-[100]" onClick={() => setShowMoreOptions(false)} />
                                    <div
                                        className="fixed w-48 surface-popover z-[110] p-1.5 rounded-xl text-sm bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5"
                                        style={{ top: menuPosition.top, left: menuPosition.left }}
                                    >

                                        {onEditAssistant && userAssistants.some(a => a.id === assistant.id) && (
                                            <button
                                                onClick={() => {
                                                    onEditAssistant(assistant);
                                                    setShowMoreOptions(false);
                                                }}
                                                className="w-full px-3 py-2 text-left hover:bg-accent/50 rounded-md text-foreground transition-all flex items-center gap-3 group"
                                            >
                                                <Edit className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <span className="font-medium">Edit</span>
                                            </button>
                                        )}

                                        {onDuplicateAssistant && (
                                            <button
                                                onClick={() => {
                                                    onDuplicateAssistant(assistant);
                                                    setShowMoreOptions(false);
                                                }}
                                                className="w-full px-3 py-2 text-left hover:bg-accent/50 rounded-md text-foreground transition-all flex items-center gap-3 group"
                                            >
                                                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <span className="font-medium">Duplicate</span>
                                            </button>
                                        )}

                                        {onToggleSubscribe && (
                                            <button
                                                onClick={() => {
                                                    onToggleSubscribe(assistant.id);
                                                    setShowMoreOptions(false);
                                                }}
                                                className="w-full px-3 py-2 text-left hover:bg-accent/50 rounded-md text-foreground transition-all flex items-center gap-3 group"
                                            >
                                                <Star className={`w-4 h-4 ${subscribedIds.includes(assistant.id) ? 'fill-current text-yellow-500' : 'text-muted-foreground group-hover:text-yellow-500'} transition-colors`} />
                                                <span className="font-medium">{subscribedIds.includes(assistant.id) ? 'Unsubscribe' : 'Subscribe'}</span>
                                            </button>
                                        )}

                                        {canReportAssistant && (
                                            <button
                                                onClick={() => {
                                                    setShowReportDialog(true);
                                                    setShowMoreOptions(false);
                                                }}
                                                className="w-full px-3 py-2 text-left hover:bg-accent/50 rounded-md text-foreground transition-all flex items-center gap-3 group"
                                            >
                                                <Flag className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                                                <span className="font-medium">Report assistant</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                exportAssistantData(assistant);
                                                setShowMoreOptions(false);
                                            }}
                                            className="w-full px-3 py-2 text-left hover:bg-accent/50 rounded-md text-foreground transition-all flex items-center gap-3 group"
                                        >
                                            <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="font-medium">Export</span>
                                        </button>

                                        {onDeleteAssistant && userAssistants.some(a => a.id === assistant.id) && (
                                            <>
                                                <div className="h-px bg-border/50 my-1 mx-1" />
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteDialog(true);
                                                        setShowMoreOptions(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-destructive/10 text-destructive rounded-md transition-all flex items-center gap-3 group"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="font-medium">Delete</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </>,
                                document.body
                            )
                        )}
                    </div>
                </section>

                {onDeleteAssistant && (
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{assistant.name}" and all of its associated data. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        onDeleteAssistant(assistant.id);
                                        setShowDeleteDialog(false);
                                        onClose();
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                {showReportDialog && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4" onClick={() => setShowReportDialog(false)}>
                        <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-4 flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                    <Flag className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Report assistant</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Tell moderators what should be reviewed.</p>
                                </div>
                            </div>

                            <label className="mb-2 block text-sm font-medium text-foreground">Reason</label>
                            <select
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value as AssistantReportReason)}
                                className="mb-4 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/60"
                            >
                                <option value="inappropriate">Inappropriate content</option>
                                <option value="unsafe">Unsafe behavior</option>
                                <option value="privacy">Privacy concern</option>
                                <option value="spam">Spam or misleading</option>
                                <option value="other">Other</option>
                            </select>

                            <label className="mb-2 block text-sm font-medium text-foreground">Comment</label>
                            <textarea
                                value={reportComment}
                                onChange={(e) => setReportComment(e.target.value)}
                                rows={4}
                                placeholder="Optional context for moderators"
                                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
                            />

                            <div className="mt-5 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowReportDialog(false)} className="btn-ghost">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleSubmitReport} className="btn-primary">
                                    Submit report
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {reportSubmitted && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/10 dark:text-emerald-300">
                        Report submitted. Moderators can review it in admin mode.
                    </div>
                )}

                {isPrivilegedUser && adminMode && openReports.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-200">
                        This assistant has open moderation reports. Use the reported assistants page to update status or hide it.
                    </div>
                )}
                <div className="rounded-2xl bg-card/30 divide-y divide-border/45">
                    <SidebarSection
                        title="About"
                        icon={Info}
                        open={expandedSections.about}
                        onToggle={() => toggleSection('about')}
                    >
                        <p>{assistant.description}</p>
                    </SidebarSection>

                    {assistant.systemPrompt && (
                        <SidebarSection
                            title="System Prompt"
                            icon={FileUp}
                            open={expandedSections.systemPrompt}
                            onToggle={() => toggleSection('systemPrompt')}
                        >
                            <div className="rounded-xl bg-muted/35 ring-1 ring-border/60 p-4 overflow-x-auto max-h-60">
                                <pre className="font-mono text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                    {assistant.systemPrompt}
                                </pre>
                            </div>
                        </SidebarSection>
                    )}

                    <SidebarSection
                        title="Response Style"
                        icon={Info}
                        open={expandedSections.responseStyle}
                        onToggle={() => toggleSection('responseStyle')}
                    >
                        <p>{behaviorMeta.summary}</p>
                    </SidebarSection>

                    {assistant.allowedTools.length > 0 && (
                        <SidebarSection
                            title="Enabled Tools"
                            icon={Sparkles}
                            open={expandedSections.tools}
                            onToggle={() => toggleSection('tools')}
                        >
                            <div className="flex flex-wrap gap-2">
                                {assistant.allowedTools.map((tool) => (
                                    <span key={tool} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getToolColor(tool)}`}>
                                        {formatToolName(tool)}
                                    </span>
                                ))}
                            </div>
                        </SidebarSection>
                    )}

                    {assistant.quickPrompts && assistant.quickPrompts.length > 0 && (
                        <SidebarSection
                            title="Quick Prompts"
                            icon={Zap}
                            open={expandedSections.quickPrompts}
                            onToggle={() => toggleSection('quickPrompts')}
                        >
                            <div className="space-y-2">
                                {assistant.quickPrompts.map((prompt, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-muted/40 text-sm text-foreground/90 italic hover:bg-muted/70 transition-colors cursor-default">
                                        "{prompt}"
                                    </div>
                                ))}
                            </div>
                        </SidebarSection>
                    )}

                    {assistant.starterPrompts && assistant.starterPrompts.length > 0 && (
                        <SidebarSection
                            title="Starter Prompts"
                            icon={Sparkles}
                            open={expandedSections.starterPrompts}
                            onToggle={() => toggleSection('starterPrompts')}
                        >
                            <div className="space-y-2">
                                {assistant.starterPrompts.map((sp, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors cursor-default flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-foreground">{sp.title}</span>
                                        <span className="text-xs text-foreground/70 italic">"{sp.prompt}"</span>
                                    </div>
                                ))}
                            </div>
                        </SidebarSection>
                    )}

                    <SidebarSection
                        title="Technical & Sharing Details"
                        icon={Info}
                        open={expandedSections.technical}
                        onToggle={() => toggleSection('technical')}
                    >
                        <div className="rounded-xl bg-muted/35 ring-1 ring-border/60 overflow-hidden text-sm">
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 px-4 py-2.5 border-b border-border/55">
                                <span className="text-muted-foreground dark:text-foreground/75">Visibility</span>
                                <span className="text-foreground font-medium">{assistant.isPublic ? 'Public' : 'Private'}</span>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 px-4 py-2.5 border-b border-border/55">
                                <span className="text-muted-foreground dark:text-foreground/75">Version</span>
                                <span className="text-foreground font-medium">{assistant.version ? `v${assistant.version}` : '-'}</span>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 px-4 py-2.5 border-b border-border/55">
                                <span className="text-muted-foreground dark:text-foreground/75">Default model</span>
                                <span className="text-foreground font-medium">{defaultLlmModelName}</span>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 px-4 py-2.5 border-b border-border/55">
                                <span className="text-muted-foreground dark:text-foreground/75">Users</span>
                                <span className="text-foreground font-medium">{(assistant.subscriptionCount || 0).toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 px-4 py-2.5">
                                <span className="text-muted-foreground dark:text-foreground/75">Shared with</span>
                                <span className="text-foreground text-right font-medium">
                                    {assistant.isPublic && publishedDepartmentNames.length === 0
                                        ? 'All'
                                        : publishedDepartmentNames.length > 0
                                            ? publishedDepartmentNames.join(', ')
                                            : '-'}
                                </span>
                            </div>
                        </div>
                    </SidebarSection>
                </div>

            </div>
        </div>
    );
}






