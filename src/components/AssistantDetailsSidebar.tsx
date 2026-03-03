import { Assistant } from '../types';
import { exportAssistantData } from './AssistantDetailsPage';
import { Star, Edit, Copy, Download, Trash2, Info, Sparkles, Zap, FileUp, X, MoreVertical, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
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
}: AssistantDetailsSidebarProps) {
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { t } = useTranslation();

    const isOwner = userAssistants.some(a => a.id === assistant.id);

    return (
        <div className="bg-card w-full h-full overflow-y-auto flex flex-col">
            <div className="p-6 space-y-8 min-w-[300px] max-w-[400px] flex-grow">
                {/* Panel Header */}
                <div className="flex flex-col items-center text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-24 h-24 rounded-3xl bg-background border border-border shadow-sm flex items-center justify-center text-5xl mb-4">
                        {assistant.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{assistant.name}</h2>
                    <div className="flex flex-col gap-2 mt-2 items-center">
                        <div className="flex gap-2">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                                {assistant.responseBehavior === 'creative' ? '🎨 Creative' :
                                    assistant.responseBehavior === 'precise' ? '🎯 Precise' : '⚖️ Balanced'}
                            </span>
                            {assistant.deletedByOwner && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Deleted by owner
                                </span>
                            )}
                            {subscribedIds.includes(assistant.id) && (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> Subscribed
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            {assistant.responseBehavior === 'creative' && 'Prefers imaginative and shorter responses.'}
                            {assistant.responseBehavior === 'precise' && 'Focuses on factual and detailed accuracy.'}
                            {assistant.responseBehavior === 'balanced' && 'Maintains a neutral and informative tone.'}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex relative shadow-md shadow-primary/20 rounded-lg group">
                    {showStartConversationButton && (
                        <button
                            onClick={() => onSelectAssistant(assistant)}
                            className="btn-primary w-full py-3 text-base flex-1 rounded-r-none border-none hover:bg-primary/90 focus:ring-0 transition-colors shadow-none"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Start Conversation
                            </div>
                        </button>
                    )}

                    {/* Vertical divider */}
                    {showStartConversationButton && <div className="w-px bg-primary-foreground/20 z-10 my-1.5" />}

                    <button
                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                        className={`btn-primary px-3 py-3 border-none hover:bg-primary/90 focus:ring-0 focus:bg-primary/80 transition-colors shadow-none active:bg-primary/80 ${showStartConversationButton ? 'rounded-l-none' : 'w-full rounded-lg'}`}
                        aria-label="More options"
                    >
                        {showStartConversationButton ? (
                            <MoreVertical className="w-5 h-5" />
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <MoreVertical className="w-4 h-4" /> Options
                            </div>
                        )}
                    </button>

                    {showMoreOptions && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMoreOptions(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 surface-popover z-30 p-1.5 rounded-xl text-sm bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5">

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
                        </>
                    )}
                </div>

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

                {/* Details */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" /> About
                        </h3>
                        <p className="text-foreground leading-relaxed text-sm">
                            {assistant.description}
                        </p>
                    </div>

                    {assistant.allowedTools.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Enabled Tools
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {assistant.allowedTools.map((tool) => (
                                    <span key={tool} className={`text-xs px-2.5 py-1 rounded-md border font-medium ${getToolColor(tool)}`}>
                                        {formatToolName(tool)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {assistant.quickPrompts && assistant.quickPrompts.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Quick Prompts
                            </h3>
                            <div className="space-y-2">
                                {assistant.quickPrompts.map((prompt, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground italic hover:bg-muted transition-colors cursor-default">
                                        "{prompt}"
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {assistant.systemPrompt && (
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FileUp className="w-4 h-4" /> System Prompt
                            </h3>
                            <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs text-muted-foreground border border-border overflow-x-auto max-h-60">
                                {assistant.systemPrompt}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
