import { AlertTriangle, CheckCircle2, Download, Mic, RotateCcw } from 'lucide-react';
import { TranscriptionModelId, TranscriptionSettings } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';

const TRANSCRIPTION_MODELS: Array<{
  id: TranscriptionModelId;
  name: string;
  size: string;
  description: string;
}> = [
  {
    id: 'whisper-small',
    name: 'Whisper Small',
    size: '~220 MB',
    description: 'Faster setup for most day-to-day dictation.',
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'Whisper Large v3 Turbo',
    size: '~560 MB',
    description: 'Higher quality for longer or noisier input.',
  },
];

interface TranscriptionSettingsDialogProps {
  open: boolean;
  settings: TranscriptionSettings;
  onOpenChange: (open: boolean) => void;
  onSettingsChange: (settings: TranscriptionSettings) => void;
}

export function TranscriptionSettingsDialog({
  open,
  settings,
  onOpenChange,
  onSettingsChange,
}: TranscriptionSettingsDialogProps) {
  const selectedModel = TRANSCRIPTION_MODELS.find((model) => model.id === settings.modelId) || TRANSCRIPTION_MODELS[0];
  const isSelectedModelDownloaded = settings.downloadedModelIds.includes(settings.modelId);
  const isReady = settings.enabled && isSelectedModelDownloaded;

  const updateSettings = (patch: Partial<TranscriptionSettings>) => {
    onSettingsChange({ ...settings, ...patch });
  };

  const handleDownload = () => {
    if (isSelectedModelDownloaded) {
      return;
    }

    updateSettings({
      downloadedModelIds: [...settings.downloadedModelIds, settings.modelId],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[34rem] gap-5 rounded-2xl border-border bg-card p-0 shadow-2xl">
        <DialogHeader className="border-b border-border px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mic className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">Transcription</DialogTitle>
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
                  Beta
                </span>
              </div>
              <DialogDescription>Set up local voice input for chat prompts.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-5 pb-5">
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="text-xs leading-relaxed">
              Beta feature: transcription quality is not validated and may vary with language,
              audio quality, and local hardware. The model runs fully in your browser.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Enable transcription</p>
              <p className="mt-1 text-xs text-muted-foreground">
                When ready, the microphone button starts voice input directly.
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
              aria-label="Enable transcription"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Model</p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  isReady
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isReady && <CheckCircle2 className="h-3 w-3" />}
                {isReady ? 'Ready' : isSelectedModelDownloaded ? 'Downloaded' : 'Download needed'}
              </span>
            </div>

            <RadioGroup
              value={settings.modelId}
              onValueChange={(modelId) => updateSettings({ modelId: modelId as TranscriptionModelId })}
              className="gap-2 rounded-xl border border-border bg-background/45 p-2"
            >
              {TRANSCRIPTION_MODELS.map((model) => {
                const downloaded = settings.downloadedModelIds.includes(model.id);
                return (
                  <label
                    key={model.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-accent/50"
                  >
                    <RadioGroupItem value={model.id} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{model.name}</span>
                      <span className="block text-xs text-muted-foreground">{model.size} · {model.description}</span>
                    </span>
                    {downloaded && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        ready
                      </span>
                    )}
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-background px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-default disabled:border-border disabled:text-muted-foreground disabled:hover:bg-background"
              disabled={isSelectedModelDownloaded}
            >
              {isSelectedModelDownloaded ? <RotateCcw className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              {isSelectedModelDownloaded ? 'Re-download' : `Download ${selectedModel.name}`}
            </button>

            <span className="text-xs font-medium text-muted-foreground">
              {isReady ? 'Voice input is ready' : 'Set up a downloaded model to start speaking'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
