import { useState } from 'react';
import { ArrowLeft, Sparkles, Wand2, Wrench, ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
//  DATA
//  → Einfach ein neues Objekt oben in das Array einfügen, fertig.
// ─────────────────────────────────────────────────────────────────────────────

interface Change {
  type: 'new' | 'improved' | 'fixed';
  text: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  changes: Change[];
}

const releases: Release[] = [
  {
    version: '1.4',
    date: '15. Mai 2026',
    title: 'Assistenten schneller finden',
    changes: [
      { type: 'new',      text: 'Empfohlene Assistenten werden nun prominenter in der Übersicht angezeigt.' },
      { type: 'improved', text: 'Karten zeigen alle wichtigen Infos auf einen Blick – übersichtlicher und klarer.' },
      { type: 'fixed',    text: 'Lange Beschreibungen brechen das Layout nicht mehr.' },
    ],
  },
  {
    version: '1.3',
    date: '30. April 2026',
    title: 'Angenehmeres Schreiben im Chat',
    changes: [
      { type: 'improved', text: 'Der Eingabebereich bleibt beim Schreiben stabiler – auch bei langen Prompts.' },
      { type: 'new',      text: 'Neue Schnellaktionen im Chat helfen bei häufigen Aufgaben.' },
      { type: 'fixed',    text: 'Mehrzeilige Eingaben verursachen keine visuellen Sprünge mehr.' },
    ],
  },
  {
    version: '1.2',
    date: '16. April 2026',
    title: 'Sicherheitsmodus besser erklärt',
    changes: [
      { type: 'improved', text: 'Der Sicherheitsmodus wird jetzt verständlicher erklärt – weniger Fachbegriffe.' },
      { type: 'new',      text: 'Kurzeinführung erscheint vor der ersten Aktivierung des Sicherheitsmodus.' },
    ],
  },
  {
    version: '1.0',
    date: '11. März 2026',
    title: 'Erste MucGPT Demo-Version',
    changes: [
      { type: 'new', text: 'Chat mit Assistenten ist jetzt verfügbar.' },
      { type: 'new', text: 'Eigene Assistenten können erstellt und angepasst werden.' },
      { type: 'new', text: 'Neue Startseite mit empfohlenen Einstiegspunkten.' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  BADGE
// ─────────────────────────────────────────────────────────────────────────────

const badgeConfig = {
  new:      { label: 'Neu',        Icon: Sparkles, colorClass: 'changelog-badge-new' },
  improved: { label: 'Verbessert', Icon: Wand2,    colorClass: 'changelog-badge-improved' },
  fixed:    { label: 'Gefixt',     Icon: Wrench,   colorClass: 'changelog-badge-fixed' },
} as const;

function Badge({ type }: { type: Change['type'] }) {
  const { label, Icon, colorClass } = badgeConfig[type];
  return (
    <span className={`changelog-badge ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  RELEASE ENTRY
// ─────────────────────────────────────────────────────────────────────────────

interface ReleaseEntryProps {
  release: Release;
  isOpen: boolean;
  onToggle: () => void;
}

function ReleaseEntry({ release, isOpen, onToggle }: ReleaseEntryProps) {
  return (
    <div className="changelog-row">
      {/* Left column: date + dot */}
      <div className="changelog-left">
        <time className="changelog-date">{release.date}</time>
        <div className="changelog-dot" />
      </div>

      {/* Right column: card */}
      <div className={`changelog-card ${isOpen ? 'changelog-card-open' : ''}`}>
        <button
          className="changelog-header"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <div className="changelog-header-left">
            <span className="changelog-version">v{release.version}</span>
            <span className="changelog-title">{release.title}</span>
          </div>
          <ChevronDown
            className="changelog-chevron"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        <div className={`changelog-body ${isOpen ? 'changelog-body-open' : ''}`}>
          <ul className="changelog-list">
            {release.changes.map((change, i) => (
              <li key={i} className="changelog-list-item">
                <Badge type={change.type} />
                <span className="changelog-change-text">{change.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

interface VersionNotesProps {
  onBack: () => void;
}

export function VersionNotes({ onBack }: VersionNotesProps) {
  // Accordion: store the open version string (or null)
  const [openVersion, setOpenVersion] = useState<string | null>(releases[0].version);

  function toggle(version: string) {
    setOpenVersion((prev) => (prev === version ? null : version));
  }

  return (
    <div className="h-full overflow-y-auto thin-scrollbar">
      <div className="changelog-page">

        {/* Page header with back button */}
        <div className="changelog-topbar">
          <button onClick={onBack} className="btn-ghost btn-sm changelog-back-btn">
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </button>
        </div>

        {/* Hero */}
        <div className="changelog-hero">
          <h1 className="changelog-hero-title">Was ist neu?</h1>
          <p className="changelog-hero-sub">
            Alle Neuerungen, Verbesserungen und Bugfixes im Überblick.
          </p>
        </div>

        {/* Timeline */}
        <div className="changelog-timeline">
          {releases.map((release) => (
            <ReleaseEntry
              key={release.version}
              release={release}
              isOpen={openVersion === release.version}
              onToggle={() => toggle(release.version)}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
