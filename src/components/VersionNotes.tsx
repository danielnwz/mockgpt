import { ArrowLeft, Sparkles } from 'lucide-react';

interface VersionNotesProps {
  onBack: () => void;
}

export function VersionNotes({ onBack }: VersionNotesProps) {
  return (
    <div className="h-full flex flex-col bg-card/60 backdrop-blur-sm">
      <div className="px-8 py-6 bg-card border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="type-title text-foreground">What is new</h2>
            <p className="type-muted mt-1">Version notes for MUCGPT</p>
          </div>
          <button
            onClick={onBack}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="space-y-6 max-w-3xl">
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              Version 1.0.0
            </div>
            <ul className="mt-3 list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Initial MUCGPT demo release</li>
              <li>Assistant discovery, chat, and editor flows</li>
              <li>Custom quick prompts and live preview</li>
              <li>Improved home grid layout and assistant cards</li>
            </ul>
          </div>

          <div className="surface-card p-5">
            <div className="text-sm font-semibold text-foreground">Coming next</div>
            <ul className="mt-3 list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>More assistant templates</li>
              <li>Expanded analytics and history view</li>
              <li>Refined theme controls</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
