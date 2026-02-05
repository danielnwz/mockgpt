import { useState, useEffect } from 'react';
import { X, Save, Sparkles, Download, Plus, Trash2, Code2, Search, Globe, ImagePlus, FileUp, BarChart3, Target, Zap, Palette, User, Settings, Wrench, ChevronDown, Users, Info, ArrowLeft, Bot, PenTool } from 'lucide-react';
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

type CreationStep = 'initial' | 'ai-input' | 'form';

export function AssistantEditor({ assistant, onSave, onCancel }: AssistantEditorProps) {
  // State for creation flow
  const [creationStep, setCreationStep] = useState<CreationStep>(assistant ? 'form' : 'initial');
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingConfig, setIsGeneratingConfig] = useState(false);

  // Form State
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

  // Reset state when assistant prop changes (to handle switching between create/edit)
  useEffect(() => {
    if (assistant) {
      setCreationStep('form');
      setName(assistant.name);
      setDescription(assistant.description);
      setIcon(assistant.icon);
      setSystemPrompt(assistant.systemPrompt);
      setResponseBehavior(assistant.responseBehavior);
      setAllowedTools(assistant.allowedTools);
      setSelectedDepartments(assistant.publishedDepartments || []);
      setQuickPrompts(assistant.quickPrompts || []);
    } else {
      // If we are creating new, we might be in the middle of a flow, so don't reset unless explicitly navigating
      // optimization: we assume the parent unmounts and remounts or we manually reset if needed. 
      // For now, let's keep the step if we are already in the component.
    }
  }, [assistant]);


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

    // Simulate AI generation for system prompt
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

  const handleGenerateConfigFromDescription = () => {
    if (!aiDescription.trim()) return;
    setIsGeneratingConfig(true);

    // Simulate AI generation for entire configuration
    setTimeout(() => {
      // Simple heuristics for demo purposes
      const descLower = aiDescription.toLowerCase();

      let generatedName = "New Assistant";
      if (descLower.includes("math")) generatedName = "Math Tutor";
      else if (descLower.includes("code") || descLower.includes("program")) generatedName = "Coding Helper";
      else if (descLower.includes("write") || descLower.includes("edit")) generatedName = "Writing Assistant";
      else if (descLower.includes("travel")) generatedName = "Travel Planner";

      let generatedIcon = "🤖";
      if (descLower.includes("math")) generatedIcon = "🧮";
      else if (descLower.includes("code")) generatedIcon = "💻";
      else if (descLower.includes("write")) generatedIcon = "✍️";
      else if (descLower.includes("travel")) generatedIcon = "✈️";

      const tools = [];
      if (descLower.includes("code") || descLower.includes("python")) tools.push('code_interpreter');
      if (descLower.includes("image") || descLower.includes("picture")) tools.push('image_generation');
      if (descLower.includes("search") || descLower.includes("internet")) tools.push('search');

      setName(generatedName);
      setDescription(aiDescription); // Use the user's description
      setIcon(generatedIcon);
      setAllowedTools(tools);
      setSystemPrompt(`You are ${generatedName}, an AI assistant designed to help with: ${aiDescription}.\n\nProvide clear, concise, and helpful responses.`);

      setIsGeneratingConfig(false);
      setCreationStep('form');
    }, 2000);
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

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <div className="h-full flex">
      {/* Settings Panel (Left Side) - Slide In */}
      <div className="w-1/2 border-r overflow-y-auto bg-card thin-scrollbar animate-in slide-in-from-left-20 duration-500 ease-out">

        {/* Step: Initial Choice */}
        {creationStep === 'initial' && (
          <div className="px-10 py-12 flex flex-col min-h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Create Assistant</h2>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-lg space-y-4">
                <button
                  onClick={() => setCreationStep('form')}
                  className="w-full group relative p-6 bg-card border-2 border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300 text-left flex items-start gap-4"
                >
                  <div className="mt-1 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Create Manually</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Start from scratch. Define tools, behavior, and prompts yourself.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setCreationStep('ai-input')}
                  className="w-full group relative p-6 bg-gradient-to-br from-primary/5 to-purple-500/5 border-2 border-primary/20 rounded-xl hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-300 text-left flex items-start gap-4"
                >
                  <div className="mt-1 w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">Generate with AI</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Describe your needs and let AI generate the configuration.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: AI Input */}
        {creationStep === 'ai-input' && (
          <div className="px-10 py-12 flex flex-col min-h-full">
            <div className="flex items-center gap-2 mb-8">
              <button
                onClick={() => setCreationStep('initial')}
                className="p-2 -ml-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Describe Assistant</h2>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="flex gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-primary">AI Generator</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Describe what you want this assistant to do, who it's for, and how it should behave.
                </p>
              </div>

              <div className="relative flex-1 min-h-[150px] flex flex-col">
                <textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="e.g., I need a Python coding tutor that explains concepts simply to beginners and provides examples. It should be encouraging and patient."
                  className="w-full flex-1 p-6 text-base bg-card border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none shadow-sm transition-all mb-4"
                  autoFocus
                />

                {/* Example Ideas */}
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Friendly Math Tutor for high schoolers",
                      "Senior React Code Reviewer",
                      "Creative Story Writer for fantasy"
                    ].map((idea) => (
                      <button
                        key={idea}
                        onClick={() => setAiDescription(idea)}
                        className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-lg border border-transparent hover:border-primary/20 transition-all text-left"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleGenerateConfigFromDescription}
                  disabled={!aiDescription.trim() || isGeneratingConfig}
                  className="btn-primary w-full py-4 text-base shadow-lg shadow-primary/25"
                >
                  {isGeneratingConfig ? (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Generating Configuration...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Generate Assistant
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Form (Existing) */}
        {creationStep === 'form' && (
          <div className="px-10 py-12">
            <div className="flex items-center justify-between mb-6 relative">
              <div className="context-halo -translate-x-6 -translate-y-4" />
              <div className="flex items-center gap-3">
                {!assistant && (
                  <button
                    onClick={() => setCreationStep('initial')}
                    className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title="Back to mode selection"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="type-title text-foreground">
                  {assistant ? 'Edit Assistant' : 'Create New Assistant'}
                </h2>
              </div>
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
        )}
      </div>

      {/* Preview Panel or Transparent Blur - Fade In */}
      <div className={`animate-in fade-in duration-700 ease-out transition-all duration-500 ${creationStep === 'initial' ? 'w-1/2 bg-background/30 backdrop-blur-md' : 'w-1/2 bg-background border-l'}`}>
        {creationStep === 'initial' ? (
          <div className="h-full w-full flex items-center justify-center">
            {/* The background is now handled by the overlay + backdrop-blur, showing the actual app behind it.
                 We can add a subtle hint text or just leave it clean. */}
          </div>
        ) : (
          <div className="h-full flex flex-col animate-in fade-in duration-500">
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
        )}
      </div>

    </div>
  );
}
