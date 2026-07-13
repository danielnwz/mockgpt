import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, EyeOff, Lock, Pencil, Search, ShieldCheck, Trash2, Users, XCircle } from 'lucide-react';
import { Assistant, AssistantReport, ReportStatus } from '../types';
import { Badge } from './ui/badge';

interface AdminReportsPageProps {
  assistants: Assistant[];
  reports: AssistantReport[];
  onBack: () => void;
  onUpdateReportStatus: (reportId: string, status: ReportStatus) => void;
  onHideAssistant: (assistantId: string) => void;
  onEditAssistant: (assistant: Assistant) => void;
  onDeleteAssistant: (assistantId: string) => void;
  onSelectAssistant: (assistant: Assistant) => void;
}

type VisibilityFilter = 'all' | 'reported' | 'private' | 'public' | 'hidden';

const reasonLabels: Record<AssistantReport['reason'], string> = {
  inappropriate: 'Unpassende Inhalte',
  unsafe: 'Unsicheres Verhalten',
  privacy: 'Datenschutz',
  spam: 'Spam oder irrefuehrend',
  other: 'Sonstiges',
};

const reportStateLabels: Record<ReportStatus, string> = {
  open: 'Offen',
  reviewed: 'Geprueft',
  dismissed: 'Unbegruendet',
};

const formatCreator = (createdBy: string) => createdBy === 'user' ? 'Daniel N.' : createdBy;

export function AdminReportsPage({
  assistants,
  reports,
  onBack,
  onUpdateReportStatus,
  onHideAssistant,
  onEditAssistant,
  onDeleteAssistant,
  onSelectAssistant,
}: AdminReportsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');

  const uniqueAssistants = useMemo(
    () => assistants.filter((assistant, index, list) =>
      list.findIndex((item) => item.id === assistant.id) === index
    ),
    [assistants]
  );

  const reportsByAssistant = useMemo(() => reports.reduce<Record<string, AssistantReport[]>>((acc, report) => {
    acc[report.assistantId] = [...(acc[report.assistantId] || []), report];
    return acc;
  }, {}), [reports]);

  const visibleAssistants = uniqueAssistants
    .filter((assistant) => {
      const query = searchQuery.trim().toLowerCase();
      const assistantReports = reportsByAssistant[assistant.id] || [];
      const openReports = assistantReports.filter((report) => report.status === 'open');

      const matchesSearch = !query ||
        assistant.name.toLowerCase().includes(query) ||
        assistant.description.toLowerCase().includes(query) ||
        formatCreator(assistant.createdBy).toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (visibilityFilter === 'reported') return openReports.length > 0;
      if (visibilityFilter === 'private') return !assistant.isPublic;
      if (visibilityFilter === 'public') return assistant.isPublic;
      if (visibilityFilter === 'hidden') return Boolean(assistant.deletedByOwner || assistant.moderationHidden);
      return true;
    })
    .sort((a, b) => {
      const aOpen = (reportsByAssistant[a.id] || []).filter((report) => report.status === 'open').length;
      const bOpen = (reportsByAssistant[b.id] || []).filter((report) => report.status === 'open').length;
      if (aOpen !== bOpen) return bOpen - aOpen;
      return a.name.localeCompare(b.name);
    });

  const openCount = reports.filter((report) => report.status === 'open').length;

  const updateReportsForAssistant = (assistantId: string, status: ReportStatus) => {
    (reportsByAssistant[assistantId] || [])
      .filter((report) => report.status === 'open')
      .forEach((report) => onUpdateReportStatus(report.id, status));
  };

  const handleDeleteAssistant = (assistant: Assistant) => {
    const confirmed = window.confirm(`Assistent "${assistant.name}" wirklich loeschen?`);
    if (!confirmed) return;
    onDeleteAssistant(assistant.id);
  };

  return (
    <div className="h-full overflow-y-auto bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 border-b border-border/80 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin mode
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Assistant Moderation</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Gesamtsicht auf alle Assistenten, inklusive privater und ausgeblendeter Eintraege.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="h-8 px-3">
              {visibleAssistants.length} Assistenten
            </Badge>
            <Badge variant="outline" className="h-8 border-amber-200 bg-amber-50 px-3 text-amber-700 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-300">
              {openCount} offene Meldungen
            </Badge>
            <button type="button" onClick={onBack} className="btn-secondary">
              Zurueck
            </button>
          </div>
        </header>

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border/70 bg-card/70 p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Assistenten, Beschreibung oder Ersteller suchen"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
            />
          </div>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as VisibilityFilter)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/60"
          >
            <option value="all">Alle Assistenten</option>
            <option value="reported">Gemeldet</option>
            <option value="private">Privat</option>
            <option value="public">Oeffentlich</option>
            <option value="hidden">Ausgeblendet oder geloescht</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="grid grid-cols-[minmax(150px,0.75fr)_minmax(0,1.8fr)_minmax(112px,0.55fr)_minmax(132px,0.65fr)_minmax(280px,1fr)] gap-4 border-b border-border/70 bg-muted/25 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Name</span>
            <span>Beschreibung</span>
            <span>Ersteller</span>
            <span>Zugriff</span>
            <span>Moderation</span>
          </div>

          {visibleAssistants.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
              <h2 className="text-sm font-semibold text-foreground">Keine Assistenten gefunden</h2>
              <p className="mt-1 text-sm text-muted-foreground">Suche oder Filter anpassen.</p>
            </div>
          ) : visibleAssistants.map((assistant) => {
            const assistantReports = reportsByAssistant[assistant.id] || [];
            const openReports = assistantReports.filter((report) => report.status === 'open');
            const latestReport = assistantReports[0];
            const latestOpenReport = openReports[0];

            return (
              <article key={assistant.id} className="grid grid-cols-[minmax(150px,0.75fr)_minmax(0,1.8fr)_minmax(112px,0.55fr)_minmax(132px,0.65fr)_minmax(280px,1fr)] gap-4 border-b border-border/50 px-4 py-4 last:border-b-0">
                <button type="button" onClick={() => onSelectAssistant(assistant)} className="flex min-w-0 items-center gap-3 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-xl ring-1 ring-border/70">
                    {assistant.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{assistant.name}</span>
                    {assistant.version && <span className="text-xs text-muted-foreground">v{assistant.version}</span>}
                  </span>
                </button>

                <button type="button" onClick={() => onSelectAssistant(assistant)} className="text-left">
                  <p className="line-clamp-3 text-sm leading-6 text-foreground/85">{assistant.description}</p>
                </button>

                <div className="flex items-center text-sm text-foreground">
                  <span className="truncate">{formatCreator(assistant.createdBy)}</span>
                </div>

                <div className="flex flex-wrap content-start items-start gap-1.5">
                  <Badge variant="outline" className={assistant.isPublic ? '' : 'bg-muted/40'}>
                    {assistant.isPublic ? <Users className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {assistant.isPublic ? 'Oeffentlich' : 'Privat'}
                  </Badge>
                  {assistant.moderationHidden && (
                    <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <EyeOff className="h-3 w-3" /> Ausgeblendet
                    </Badge>
                  )}
                  {assistant.deletedByOwner && (
                    <Badge variant="outline">Vom Owner geloescht</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {openReports.length > 0 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-200">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" /> {openReports.length} offen
                      </div>
                      {latestOpenReport && (
                        <p className="mt-1 line-clamp-2 text-amber-700 dark:text-amber-200/80">
                          {reasonLabels[latestOpenReport.reason]}{latestOpenReport.comment ? `: ${latestOpenReport.comment}` : ''}
                        </p>
                      )}
                    </div>
                  ) : latestReport ? (
                    <p className="text-sm text-muted-foreground">
                      Letzte Meldung: {reportStateLabels[latestReport.status]}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Keine offenen Meldungen</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEditAssistant(assistant)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Bearbeiten
                    </button>
                    <button
                      type="button"
                      onClick={() => updateReportsForAssistant(assistant.id, 'reviewed')}
                      disabled={openReports.length === 0}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Als geprueft markieren
                    </button>
                    <button
                      type="button"
                      onClick={() => updateReportsForAssistant(assistant.id, 'dismissed')}
                      disabled={openReports.length === 0}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Als unbegruendet markieren
                    </button>
                    <button
                      type="button"
                      onClick={() => onHideAssistant(assistant.id)}
                      disabled={assistant.moderationHidden}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-500/35 dark:bg-amber-500/10 dark:text-amber-200"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Fuer andere ausblenden
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssistant(assistant)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Loeschen
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
