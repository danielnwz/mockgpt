import { useState } from 'react';
import { X, Save, Sparkles, Download, Plus, Trash2, Code2, Search, Globe, ImagePlus, FileUp, BarChart3, Target, Zap, Palette, User, Settings, Wrench, ChevronDown, Users, Info } from 'lucide-react';
import { Assistant, ResponseBehavior } from '../types';
import { ChatPreview } from './ChatPreview';
import { DepartmentTree } from './DepartmentTree';
import { departments } from '../data/departments';

interface AssistantEditorProps {
  assistant: Assistant | null;
  onSave: (assistant: Omit<Assistant, 'id' | 'createdBy' | 'isPublic'> | Assistant) => void;
  onCancel: () => void;
}

const AVAILABLE_TOOLS = [
  { id: 'code_interpreter', label: 'Code Interpreter', icon: Code2 },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'web_browser', label: 'Web Browser', icon: Globe },
  { id: 'image_generation', label: 'Image Generation', icon: ImagePlus },
  { id: 'file_upload', label: 'File Upload', icon: FileUp },
  { id: 'data_analysis', label: 'Data Analysis', icon: BarChart3 },
];

const EMOJI_OPTIONS = ['🤖', '💻', '✍️', '🔬', '🌍', '📊', '📱', '🧮', '🏥', '💼', '✈️', '🎨', '🎵', '🍳', '⚽', '📚'];

const RESPONSE_BEHAVIORS: { value: ResponseBehavior; label: string; description: string; icon: any }[] = [
  { value: 'precise', label: 'Precise', description: 'Focused and accurate responses with minimal creativity', icon: Target },
  { value: 'balanced', label: 'Balanced', description: 'A good mix of accuracy and creativity', icon: Zap },
  { value: 'creative', label: 'Creative', description: 'More varied and imaginative responses', icon: Palette },
];

export function AssistantEditor({ assistant, onSave, onCancel }: AssistantEditorProps) {
  const [name, setName] = useState(assistant?.name || '');
  const [description, setDescription] = useState(assistant?.description || '');
  const [icon, setIcon] = useState(assistant?.icon || '🤖');
  const [systemPrompt, setSystemPrompt] = useState(
    assistant?.systemPrompt || 'You are a helpful AI assistant.'
  );
  const [responseBehavior, setResponseBehavior] = useState<ResponseBehavior>(
    assistant?.responseBehavior || 'balanced'
  );
  const [allowedTools, setAllowedTools] = useState<string[]>(
    assistant?.allowedTools || []
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    assistant?.publishedDepartments || []
  );
  const [quickPrompts, setQuickPrompts] = useState<string[]>(
    assistant?.quickPrompts || []
  );
  const [newQuickPrompt, setNewQuickPrompt] = useState('');
  const [draggedPromptIndex, setDraggedPromptIndex] = useState<number | null>(null);
  const [openSections, setOpenSections] = useState({
    basic: true,
    behavior: true,
    tools: true,
    prompts: true,
    access: true,
    actions: true,
  });

  const handleToggleTool = (toolId: string) => {
    setAllowedTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  };

  const handleGenerateSystemPrompt = () => {
    if (!description.trim()) {
      alert('Please add a description first. The AI will use it to generate an appropriate system prompt.');
      return;
    }

    setIsGeneratingPrompt(true);

    // Simulate AI generation
    setTimeout(() => {
      const generatedPrompt = `You are ${name || 'an AI assistant'} specialized in ${description}. 
\nYour primary responsibilities include:
- Providing accurate and helpful information related to ${description}
- Adapting your communication style to the user's needs
- Asking clarifying questions when necessary
- Being transparent about your limitations
\nApproach each interaction with expertise while remaining approachable and easy to understand.`;

      setSystemPrompt(generatedPrompt);
      setIsGeneratingPrompt(false);
    }, 1500);
  };

  const handleToggleDepartment = (departmentId: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(departmentId)
        ? prev.filter((id) => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedDepartments(ids);
  };

  const handleDragStart = (index: number) => {
    setDraggedPromptIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPromptIndex === null || draggedPromptIndex === index) return;

    const newPrompts = [...quickPrompts];
    const draggedItem = newPrompts[draggedPromptIndex];
    newPrompts.splice(draggedPromptIndex, 1);
    newPrompts.splice(index, 0, draggedItem);

    setQuickPrompts(newPrompts);
    setDraggedPromptIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedPromptIndex(null);
  };

  const handleSave = () => {
    if (!name.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const assistantData = {
      name: name.trim(),
      description: description.trim(),
      icon,
      systemPrompt: systemPrompt.trim(),
      responseBehavior,
      allowedTools,
      publishedDepartments: selectedDepartments,
      quickPrompts,
      // If departments are selected, we consider it "published" or "shared".
      // If no departments, it stays private (unless it was already public? Logic here depends on requirements).
      // Let's assume selecting departments makes it public to those departments.
      isPublic: selectedDepartments.length > 0,
    };

    if (assistant) {
      onSave({ ...assistant, ...assistantData });
    } else {
      onSave({ ...assistantData, isPublic: selectedDepartments.length > 0 } as any);
    }
  };

  const handleExport = () => {
    const assistantData = {
      name: name.trim(),
      description: description.trim(),
      icon,
      systemPrompt: systemPrompt.trim(),
      responseBehavior,
      allowedTools,
      publishedDepartments: selectedDepartments,
      quickPrompts,
    };

    const dataStr = JSON.stringify(assistantData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.trim() || 'assistant'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const previewAssistant: Assistant = {
    id: 'preview',
    name,
    description,
    icon,
    systemPrompt,
    responseBehavior,
    allowedTools,
    quickPrompts,
    createdBy: 'user',
    isPublic: false,
  };

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-full flex">
      {/* Settings Panel */}
      <div className="w-1/2 border-r overflow-y-auto bg-card/60 backdrop-blur-sm thin-scrollbar">
        <div className="px-10 py-12">
          <div className="flex items-center justify-between mb-6 relative">
            <div className="context-halo -translate-x-6 -translate-y-4" />
            <h2 className="type-title text-foreground">
              {assistant ? 'Edit Assistant' : 'Create New Assistant'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="relative surface-card">
              <button
                type="button"
                onClick={() => toggleSection('basic')}
                className="w-full flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Basic Information</h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.basic ? 'rotate-180' : ''}`} />
              </button>
              <div
                className="px-6 pb-6 space-y-8 overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                style={{
                  maxHeight: openSections.basic ? '2000px' : '0px',
                  opacity: openSections.basic ? 1 : 0,
                }}
              >

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Icon
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-16 h-16 text-4xl bg-secondary rounded-xl hover:bg-secondary/80 transition-colors flex items-center justify-center"
                    >
                      {icon}
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-full mt-2 p-3 bg-card border border rounded-xl shadow-lg z-10 grid grid-cols-8 gap-2">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setIcon(emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-2xl hover:bg-accent rounded p-1 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Code Assistant"
                    className="w-full px-4 py-2 border border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this assistant does"
                    rows={3}
                    className="w-full px-4 py-2 border border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Behavior & Configuration Section */}
            <div className="relative surface-card">
              <button
                type="button"
                onClick={() => toggleSection('behavior')}
                className="w-full flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Behavior & Configuration</h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.behavior ? 'rotate-180' : ''}`} />
              </button>
              <div
                className="px-6 pb-6 space-y-8 overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                style={{
                  maxHeight: openSections.behavior ? '2000px' : '0px',
                  opacity: openSections.behavior ? 1 : 0,
                }}
              >

                {/* System Prompt with AI Generation */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-muted-foreground">
                      System Prompt <span className="text-destructive">*</span>
                    </label>
                    <button
                      onClick={handleGenerateSystemPrompt}
                      disabled={isGeneratingPrompt || !description.trim()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-500 transition-all duration-200 shadow-md"
                      title={!description.trim() ? 'Add a description first' : 'Generate with AI'}
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGeneratingPrompt ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                  {!description.trim() && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Add a description to use AI-generated system prompts
                    </p>
                  )}
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Define the assistant's behavior and personality"
                    rows={6}
                    className="w-full px-4 py-3 border border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono text-sm bg-background text-foreground"
                  />
                </div>

                {/* Response Behavior */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Response Behavior
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">Choose how the assistant responds to users</p>
                  <div className="grid grid-cols-3 gap-4">
                    {RESPONSE_BEHAVIORS.map((behavior) => {
                      const Icon = behavior.icon;
                      const isSelected = responseBehavior === behavior.value;
                      return (
                        <button
                          key={behavior.value}
                          onClick={() => setResponseBehavior(behavior.value)}
                          className={`relative px-4 py-4 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-start gap-3 ${isSelected
                            ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-semibold">{behavior.label}</span>
                            {isSelected && (
                              <svg className="w-4 h-4 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed text-left ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                            {behavior.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Tools & Features Section */}
            <div className="relative surface-card">
              <button
                type="button"
                onClick={() => toggleSection('tools')}
                className="w-full flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Tools & Features</h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.tools ? 'rotate-180' : ''}`} />
              </button>
              <div
                className="px-6 pb-6 space-y-8 overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                style={{
                  maxHeight: openSections.tools ? '2000px' : '0px',
                  opacity: openSections.tools ? 1 : 0,
                }}
              >

                {/* Allowed Tools */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Allowed Tools
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">Select which tools this assistant can use</p>
                  <div className="grid grid-cols-2 gap-4">
                    {AVAILABLE_TOOLS.map((tool) => {
                      const Icon = tool.icon;
                      const isSelected = allowedTools.includes(tool.id);
                      return (
                        <button
                          key={tool.id}
                          onClick={() => handleToggleTool(tool.id)}
                          className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${isSelected
                            ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-left flex-1">{tool.label}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="surface-card">
              <button
                type="button"
                onClick={() => toggleSection('prompts')}
                className="w-full flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Quick Prompts</h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.prompts ? 'rotate-180' : ''}`} />
              </button>
              <div
                className="px-6 pb-6 overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                style={{
                  maxHeight: openSections.prompts ? '2000px' : '0px',
                  opacity: openSections.prompts ? 1 : 0,
                }}
              >
                <p className="text-xs text-muted-foreground mb-3">Add suggested prompts for users. Drag to reorder.</p>
                <div className="flex flex-col gap-3">
                  {quickPrompts.map((prompt, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`group flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-lg border-2 border-transparent hover:border-primary/20 transition-all ${draggedPromptIndex === index ? 'opacity-40 scale-95' : 'hover:shadow-sm'
                        }`}
                    >
                      <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => {
                          const newPrompts = [...quickPrompts];
                          newPrompts[index] = e.target.value;
                          setQuickPrompts(newPrompts);
                        }}
                        className="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                      />
                      <button
                        onClick={() => {
                          const newPrompts = quickPrompts.filter((_, i) => i !== index);
                          setQuickPrompts(newPrompts);
                        }}
                        className="flex-shrink-0 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        title="Delete prompt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 px-3 py-2 bg-accent/30 rounded-lg border-2 border-dashed border-primary/30">
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={newQuickPrompt}
                      onChange={(e) => setNewQuickPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newQuickPrompt.trim()) {
                          setQuickPrompts([...quickPrompts, newQuickPrompt.trim()]);
                          setNewQuickPrompt('');
                        }
                      }}
                      placeholder="Add a new quick prompt..."
                      className="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                    />
                    <button
                      onClick={() => {
                        if (newQuickPrompt.trim()) {
                          setQuickPrompts([...quickPrompts, newQuickPrompt.trim()]);
                          setNewQuickPrompt('');
                        }
                      }}
                      disabled={!newQuickPrompt.trim()}
                      className="btn-primary btn-icon disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add prompt"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Access & Visibility */}
            <div className="surface-card">
              <button
                type="button"
                onClick={() => toggleSection('access')}
                className="w-full flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Access & Visibility</h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.access ? 'rotate-180' : ''}`} />
              </button>
              <div
                className="px-6 pb-6 overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                style={{
                  maxHeight: openSections.access ? '2000px' : '0px',
                  opacity: openSections.access ? 1 : 0,
                }}
              >
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Select which departments can access this assistant. Leave empty for private use only.
                  </p>
                  <div className="border border-border/50 rounded-lg p-4 bg-background/50 max-h-96 overflow-y-auto thin-scrollbar">
                    <DepartmentTree
                      departments={departments}
                      selectedDepartments={selectedDepartments}
                      onToggleDepartment={handleToggleDepartment}
                      onSelectionChange={handleSelectionChange}
                    />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    {selectedDepartments.length === 0
                      ? "Visible only to you"
                      : `Will be visible to ${selectedDepartments.length} department${selectedDepartments.length !== 1 ? 's' : ''}`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="surface-card">
              <button
                type="button"
                onClick={() => toggleSection('actions')}
                className="w-full flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Actions</h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.actions ? 'rotate-180' : ''}`} />
              </button>
              <div
                className="px-6 pb-6 space-y-3 overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                style={{
                  maxHeight: openSections.actions ? '2000px' : '0px',
                  opacity: openSections.actions ? 1 : 0,
                }}
              >
                {/* Primary Action */}
                <button
                  onClick={handleSave}
                  className="btn-primary btn-lg w-full shadow-md hover:shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {assistant ? 'Update Assistant' : 'Create Assistant'}
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleExport}
                    className="btn-secondary w-full"
                  >
                    <Download className="w-4 h-4" />
                    Export Configuration
                  </button>
                </div>

                {/* Cancel */}
                <div className="text-center pt-2">
                  <button
                    onClick={onCancel}
                    className="text-sm text-muted-foreground hover:text-foreground underline decoration-dotted underline-offset-4 hover:decoration-solid transition-all"
                  >
                    Cancel and discard changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 bg-card/70 backdrop-blur-sm">
        <div className="h-full flex flex-col">
          <div className="px-8 py-6 bg-card border-b">
            <h3 className="text-2xl font-bold text-foreground">Live Preview</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Test your assistant configuration in real-time
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPreview assistant={previewAssistant} />
          </div>
        </div>
      </div>

    </div>
  );
}
