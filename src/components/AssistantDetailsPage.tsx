import { ArrowLeft, MessageSquare, Edit, Trash2, Zap, Info, Star, Sparkles } from 'lucide-react';
import { Assistant } from '../types';

interface AssistantDetailsPageProps {
    assistant: Assistant;
    onBack: () => void;
    onStartChat: (assistant: Assistant) => void;
    onEdit: (assistant: Assistant) => void;
    onDelete: (assistantId: string) => void;
    isFavorite: boolean;
    onToggleFavorite: (assistantId: string) => void;
    isUserAssistant: boolean;
}

// Helper function to format tool names (reused or imported if shared)
const formatToolName = (tool: string): string => {
    return tool
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

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

export function AssistantDetailsPage({
    assistant,
    onBack,
    onStartChat,
    onEdit,
    onDelete,
    isFavorite,
    onToggleFavorite,
    isUserAssistant
}: AssistantDetailsPageProps) {

    return (
        <div className="h-full flex flex-col bg-background animate-in fade-in duration-300 overflow-y-auto">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 flex items-center gap-4 p-4 border-b border-border bg-background/80 backdrop-blur-md">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-foreground truncate flex-1">
                    Assistant Details
                </h1>
                <button
                    onClick={() => onToggleFavorite(assistant.id)}
                    className={`p-2 rounded-full transition-colors border ${isFavorite
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-500'
                            : 'hover:bg-accent border-transparent text-muted-foreground'
                        }`}
                >
                    <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full p-6 lg:p-10 space-y-8">

                {/* Header Block */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-3xl bg-card border border-border shadow-sm flex items-center justify-center text-6xl md:text-7xl">
                        {assistant.icon}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{assistant.name}</h1>
                                <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                                    {assistant.responseBehavior} behavior
                                </span>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                {assistant.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                onClick={() => onStartChat(assistant)}
                                className="btn-primary py-2.5 px-6 shadow-md shadow-primary/20 text-base"
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Start Conversation
                                </div>
                            </button>

                            {isUserAssistant && (
                                <>
                                    <button
                                        onClick={() => onEdit(assistant)}
                                        className="btn-secondary px-5"
                                    >
                                        <Edit className="w-4 h-4 mr-2" /> Edit Config
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Delete ${assistant.name}?`)) onDelete(assistant.id);
                                        }}
                                        className="btn-ghost text-destructive hover:bg-destructive/10 px-5"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-border">
                    {/* Left Column: Tools & Quick Prompts */}
                    <div className="space-y-8">
                        {assistant.allowedTools.length > 0 && (
                            <div className="bg-card rounded-xl border p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Enabled Tools
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {assistant.allowedTools.map((tool) => (
                                        <span key={tool} className={`text-sm px-3 py-1.5 rounded-md border font-medium ${getToolColor(tool)}`}>
                                            {formatToolName(tool)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {assistant.quickPrompts && assistant.quickPrompts.length > 0 && (
                            <div className="bg-card rounded-xl border p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Quick Prompts</h3>
                                <div className="space-y-3">
                                    {assistant.quickPrompts.map((prompt, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-background border border-border/60 text-sm text-foreground italic hover:border-primary/40 transition-colors">
                                            "{prompt}"
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: System Prompt (Wide) */}
                    <div className="lg:col-span-2 space-y-8">
                        {assistant.systemPrompt && (
                            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Zap className="w-4 h-4" /> System Prompt
                                    </h3>
                                </div>
                                <div className="p-6 overflow-x-auto bg-[#1e1e1e] dark:bg-black">
                                    <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap leading-loose">
                                        {assistant.systemPrompt}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-xl p-6 flex gap-4 items-start">
                            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">About this Assistant</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                                    This assistant is configured to act as <strong>{assistant.name}</strong>.
                                    It has access to specific tools tailored for its role.
                                    Start a chat to see it in action.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
