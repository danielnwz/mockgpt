import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Assistant, Message } from '../types';

interface ChatPreviewProps {
  assistant: Assistant;
}

export function ChatPreview({ assistant }: ChatPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Reset preview when assistant changes
    setMessages([]);
  }, [assistant.name, assistant.description]);

  const handleSubmit = (e: React.FormEvent, messageContent?: string) => {
    e.preventDefault();
    const content = messageContent || input.trim();
    if (!content) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a preview response with the following settings:\n\n• Response Behavior: ${assistant.responseBehavior}\n• Tools: ${assistant.allowedTools.join(', ') || 'None'}\n\nSystem Prompt: "${assistant.systemPrompt}"\n\nIn production, this would connect to your LLM endpoint with these exact parameters.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 800);
  };

  const handleQuickPrompt = (prompt: string) => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent, prompt);
  };

  return (
    <div className="h-full flex flex-col bg-card/80 backdrop-blur-sm">
      {/* Preview Header */}
      <div className="surface-panel px-6 py-4 bg-accent/50">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{assistant.icon || '🤖'}</span>
          <div>
            <h3 className="type-section text-foreground">{assistant.name || 'Unnamed Assistant'}</h3>
            <p className="type-muted">
              {assistant.description || 'No description'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && assistant.quickPrompts && assistant.quickPrompts.length > 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-xl text-center space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quick Prompts</p>
                <h4 className="text-lg font-semibold text-foreground">Try one to start the preview</h4>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {assistant.quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="group rounded-2xl border bg-card px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-foreground">{prompt}</span>
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        ↗
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm">
                {assistant.icon || '🤖'}
              </div>
            )}
            <div
              className={`max-w-md rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground text-sm">
                U
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border p-4 bg-card">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Test your assistant..."
            className="flex-1 px-3 py-2 text-sm border border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
