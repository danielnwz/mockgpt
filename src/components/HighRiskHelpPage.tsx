import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Info,
  Landmark,
  ListChecks,
  Users,
  XCircle,
} from 'lucide-react';

interface HighRiskHelpPageProps {
  onBack: () => void;
}

const navItems = [
  { id: 'overview', label: 'Überblick' },
  { id: 'why', label: 'Warum relevant?' },
  { id: 'areas', label: 'Anwendungsbereiche' },
  { id: 'support', label: 'Entscheiden oder unterstützen' },
  { id: 'check', label: 'Prüfung' },
  { id: 'legal', label: 'Rechtliche Grundlage' },
];

const areas = [
  {
    title: 'Beschäftigung und Personalentscheidungen',
    icon: Users,
    summary: 'Betrifft Bewerbungen, Auswahl, Bewertung, Beförderung, Aufgabenverteilung und Kündigungen.',
    notAllowed: [
      'Bewerbende automatisch sortieren, bewerten oder vorfiltern',
      'Eignung, Leistung oder Verhalten von Mitarbeitenden automatisiert einschätzen',
      'Empfehlungen für Einstellung, Beförderung, Abmahnung oder Kündigung erzeugen',
    ],
    allowed: [
      'Stellenanzeigen sprachlich überarbeiten',
      'Interviewleitfäden ohne Kandidatenbewertung vorbereiten',
      'Allgemeine HR-Prozesse erklären oder Checklisten formulieren',
    ],
  },
  {
    title: 'Bildung und Berufsbildung',
    icon: GraduationCap,
    summary: 'Betrifft Zulassung, Bewertung, Prüfungen, Lernfortschritt und Zugang zu Bildungsangeboten.',
    notAllowed: [
      'Schülerinnen, Schüler oder Studierende für Auswahlverfahren einstufen',
      'Prüfungsleistungen oder Lernverhalten entscheidungsrelevant bewerten',
      'Empfehlungen über Zulassung, Versetzung oder Förderbedarf ableiten',
    ],
    allowed: [
      'Unterrichtsmaterialien entwerfen',
      'Lerninhalte erklären und Übungsfragen erstellen',
      'Feedbacktexte vorbereiten, wenn Menschen die Bewertung treffen',
    ],
  },
  {
    title: 'Öffentliche Leistungen und Gesundheitsdienste',
    icon: HeartPulse,
    summary: 'Betrifft Zugang zu Leistungen, Priorisierung, Anspruchsprüfung und sensible Versorgungskontexte.',
    notAllowed: [
      'Anspruch auf Sozialleistungen, Zuschüsse oder Wohnraum bewerten',
      'Menschen für Gesundheitsdienste oder öffentliche Angebote priorisieren',
      'Entscheidungen über Zugang zu essenziellen Diensten vorbereiten',
    ],
    allowed: [
      'Allgemeine Informationen zu Verfahren erklären',
      'Formulare sprachlich verständlicher machen',
      'Nicht bindende Orientierung für interne Dokumentation geben',
    ],
  },
  {
    title: 'Migration, Asyl und Grenzkontrolle',
    icon: Landmark,
    summary: 'Betrifft Aufenthalt, Asyl, Einreise, Risikobewertung und behördliche Einzelfallentscheidungen.',
    notAllowed: [
      'Asylanträge oder Aufenthaltsfälle bewerten',
      'Personen für Grenzkontrollen oder Prüfungen priorisieren',
      'Risiko- oder Glaubwürdigkeitsbewertungen über Personen erstellen',
    ],
    allowed: [
      'Allgemeine Verfahrensinformationen zusammenfassen',
      'Mehrsprachige Hinweise sprachlich vereinfachen',
      'Interne Wissensartikel ohne Einzelfallbewertung erstellen',
    ],
  },
];

const resultStates = [
  {
    title: 'Keine auffälligen Hinweise gefunden',
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100',
    text: 'Die Anweisungen enthalten keine offensichtlichen Hinweise auf unzulässige Hochrisiko-Anwendungsfälle. Die eigene Prüfung des Einsatzkontexts bleibt erforderlich.',
  },
  {
    title: 'Möglicher Hochrisiko-Anwendungsfall erkannt',
    icon: AlertTriangle,
    className: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100',
    text: 'Die Anweisungen enthalten Begriffe oder Aufgaben, die auf sensible Entscheidungen über Menschen hindeuten können.',
  },
  {
    title: 'Manuelle Prüfung empfohlen',
    icon: HelpCircle,
    className: 'border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/20 dark:text-sky-100',
    text: 'Der Zweck ist nicht eindeutig. Prüfen Sie, ob der Assistent Entscheidungen nur vorbereitet, erklärt oder tatsächlich beeinflusst.',
  },
];

function Section({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-b border-border py-8 last:border-b-0">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>}
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function HighRiskHelpPage({ onBack }: HighRiskHelpPageProps) {
  const [activeSection, setActiveSection] = useState(navItems[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0.1, 0.4] },
    );

    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </button>

        <div className="mt-5 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Auf dieser Seite</p>
                <nav className="mt-2 space-y-1" aria-label="Hilfeseite Navigation">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                        activeSection === item.id
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <main className="min-w-0 max-w-4xl">
            <div className="mt-4">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Hochrisiko-Anwendungsfälle in MUCGPT</h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
                  MUCGPT darf nicht für bestimmte KI-Anwendungen eingesetzt werden, die Entscheidungen oder Bewertungen über Menschen maßgeblich beeinflussen. Diese Seite hilft Ihnen, den geplanten Einsatz eines Assistenten einzuordnen.
              </p>
            </div>

            <nav className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden" aria-label="Hilfeseite Navigation">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <Section id="overview" title="Überblick">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-foreground">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">Kurz gesagt</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Ein Assistent darf erklären, formulieren, zusammenfassen oder bei Arbeitsschritten unterstützen. Er darf aber nicht dafür eingesetzt werden, bindende Entscheidungen, Rankings oder Einstufungen über Menschen mit erheblichen Auswirkungen zu treffen oder vorzubereiten.
                  </p>
                  </div>
                </div>
              </div>
            </Section>

            <Section id="why" title="Warum ist das relevant?">
              <p>
                Einige KI-Nutzungen können Menschen stark betreffen, etwa bei Bewerbung, Bildung, öffentlichen Leistungen, Gesundheitsdiensten oder Migration. Deshalb müssen solche Einsatzzwecke besonders vorsichtig geprüft werden.
              </p>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-foreground">
                <p className="font-semibold">Nicht jedes Thema ist automatisch unzulässig</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Entscheidend ist, ob der Assistent wichtige Entscheidungen über Personen beeinflusst. Ein Textentwurf, eine Erklärung oder eine neutrale Checkliste ist etwas anderes als eine Bewertung, Auswahl oder Priorisierung von Menschen.
              </p>
              </div>
            </Section>

            <Section id="areas" title="Betroffene Anwendungsbereiche">
              <div className="space-y-3">
                {areas.map((area, index) => {
                  const Icon = area.icon;
                  return (
                    <details key={area.title} className="group rounded-lg border border-border bg-card" open={index === 0}>
                      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 marker:hidden">
                        <span className="rounded-md bg-primary/10 p-2 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-foreground">{area.title}</span>
                          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{area.summary}</span>
                        </span>
                        <span className="text-muted-foreground transition-transform group-open:rotate-180">⌄</span>
                      </summary>
                      <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2">
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-destructive">
                            <XCircle className="h-4 w-4" />
                            Nicht zulässig
                          </div>
                          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                            {area.notAllowed.map((item) => (
                              <li key={item} className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            Unterstützende Nutzung möglich
                          </div>
                          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                            {area.allowed.map((item) => (
                              <li key={item} className="flex gap-2">
                                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-600" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </Section>

            <Section id="support" title="Entscheiden oder unterstützen?">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <XCircle className="h-5 w-5 text-destructive" />
                    Kritisch
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Der Assistent bewertet Personen, erzeugt Rangfolgen, empfiehlt Entscheidungen oder priorisiert Fälle mit Auswirkungen auf Zugang, Chancen oder Rechte.
                </p>
                </div>
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Unterstützend
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Der Assistent erklärt Inhalte, verbessert Sprache, erstellt neutrale Vorlagen oder hilft bei allgemeinen Arbeitsschritten, ohne Personen zu bewerten oder Entscheidungen vorzubereiten.
                </p>
                </div>
              </div>
            </Section>

            <Section id="check" title="So funktioniert die Prüfung der Anweisungen">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['1', 'Anweisungen lesen', 'Die Prüfung betrachtet den System Prompt des Assistenten.'],
                  ['2', 'Hinweise erkennen', 'Sie sucht nach Formulierungen zu Bewertung, Auswahl, Priorisierung oder sensiblen Einsatzfeldern.'],
                  ['3', 'Einordnung anzeigen', 'Das Ergebnis unterstützt Ihre Entscheidung, ersetzt sie aber nicht.'],
                ].map(([step, title, text]) => (
                  <div key={step} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{step}</div>
                    <p className="mt-3 font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4 text-foreground">
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Die Prüfung ist eine Orientierungshilfe</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Der tatsächliche Einsatz des Assistenten bleibt entscheidend. Eine unauffällige Prüfung bedeutet nicht automatisch, dass jeder spätere Einsatz zulässig ist.
                  </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground">Was bedeuten die Prüfergebnisse?</h3>
                <div className="mt-3 grid gap-3">
                  {resultStates.map((state) => {
                    const Icon = state.icon;
                    return (
                      <div key={state.title} className={`rounded-lg border p-3 ${state.className}`}>
                        <div className="flex items-start gap-3">
                          <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">{state.title}</p>
                            <p className="mt-1 text-sm opacity-90">{state.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Was soll ich bei einer Warnung tun?
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Prüfen Sie, ob der Assistent Personen bewertet, vergleicht, auswählt oder priorisiert.</li>
                  <li>Entfernen Sie entscheidungsrelevante Aufgaben aus den Anweisungen.</li>
                  <li>Klären Sie unklare Fälle vor Veröffentlichung mit einer zuständigen Stelle.</li>
                </ul>
              </div>
            </Section>

            <Section id="legal" title="Rechtliche Grundlage">
              <p>
                Grundlage sind interne Nutzungsregeln für MUCGPT und die Anforderungen der EU-KI-Verordnung zu Hochrisiko-Anwendungsfällen. Diese Hilfeseite ersetzt keine Rechtsberatung, sondern dient der praktischen Einordnung beim Erstellen von Assistenten.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href="https://artificialintelligenceact.eu/annex/3/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  Anhang III der EU-KI-Verordnung öffnen
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </Section>
          </main>
        </div>
      </div>
    </div>
  );
}
