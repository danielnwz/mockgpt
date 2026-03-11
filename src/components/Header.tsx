import { Moon, Sun, HelpCircle, MessageSquare, Globe, Leaf, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';

import { FAQModal } from './FAQModal';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  privateMode: boolean;
}

export function Header({ darkMode, onToggleDarkMode, privateMode }: HeaderProps) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [showFAQ, setShowFAQ] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as any);
    setShowLanguageMenu(false);
  };

  return (
    <>
      <header className={`h-14 border-b flex items-center justify-between px-6 transition-colors duration-500 ${privateMode
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-primary text-white border-primary dark:bg-[#4f7b72] dark:border-[#4f7b72]'
        }`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${privateMode ? 'bg-white text-primary' : 'bg-white/10 border border-white/20'
            }`}>
            <Leaf className={`w-5 h-5 ${privateMode ? 'text-primary' : 'text-white'}`} />
          </div>
          <h1 className="type-section text-primary-foreground">MOCKGPT</h1>

          {privateMode ? (
            <div className="relative group/pill">
              <div className="flex items-center gap-1.5 ml-4 bg-white/20 px-3 py-1 rounded-full border border-white/20 cursor-help">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-semibold text-white tracking-wide uppercase">Secure & Private</span>
              </div>
              <div className="absolute left-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-xl p-4 opacity-0 invisible group-hover/pill:opacity-100 group-hover/pill:visible transition-all duration-200 z-50">
                <div className="flex items-start gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Secure & Private Mode</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Your data is processed on certified municipal servers. Safe for internal documents, personal data, and confidential information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group/pill">
              <div className="flex items-center gap-1.5 ml-4 bg-amber-200 px-3 py-1 rounded-full border border-amber-100 shadow-sm cursor-help">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-900" />
                <span className="text-xs font-semibold text-amber-900 tracking-wide uppercase">No sensitive data</span>
              </div>
              <div className="absolute left-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-xl p-4 opacity-0 invisible group-hover/pill:opacity-100 group-hover/pill:visible transition-all duration-200 z-50">
                <div className="flex items-start gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Standard Workspace — No Data Protection</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Requests are processed by external AI providers. Do <strong className="text-foreground">not</strong> enter personal data, passwords, internal documents, or any confidential information.
                    </p>
                    <p className="text-xs text-primary mt-2 font-medium">
                      Switch to Secure Mode for sensitive data →
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAbout(true)}
            className="group btn-ghost btn-sm text-white hover:bg-white/10"
            title="About MUCGPT"
          >
            <BookOpen className="w-5 h-5 text-white" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm transition-all duration-200 group-hover:max-w-[140px] text-white/90">
              About MUCGPT
            </span>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="group btn-ghost btn-sm text-white hover:bg-white/10"
              title="Change language"
            >
              <Globe className="w-5 h-5 text-white" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm uppercase transition-all duration-200 group-hover:max-w-[60px] text-white/90">
                {language}
              </span>
            </button>

            {showLanguageMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowLanguageMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 surface-popover z-20 py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-3 ${language === lang.code ? 'bg-primary/10 text-primary' : 'text-popover-foreground'
                        }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={onToggleDarkMode}
            className="group btn-ghost btn-sm text-white hover:bg-white/10"
            title={darkMode ? t('lightMode') : t('darkMode')}
          >
            {darkMode ? (
              <>
                <Moon className="w-5 h-5 text-white" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm transition-all duration-200 group-hover:max-w-[60px] text-white/90">
                  Dark
                </span>
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 text-white" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm transition-all duration-200 group-hover:max-w-[60px] text-white/90">
                  Light
                </span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowFAQ(true)}
            className="group btn-ghost btn-sm text-white hover:bg-white/10"
            title={t('help')}
          >
            <HelpCircle className="w-5 h-5 text-white" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm transition-all duration-200 group-hover:max-w-[60px] text-white/90">
              FAQ
            </span>
          </button>

          <button
            onClick={() => setShowFeedback(true)}
            className="group btn-ghost btn-sm text-white hover:bg-white/10"
            title={t('feedback')}
          >
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm transition-all duration-200 group-hover:max-w-[90px] text-white/90">
              Feedback
            </span>
          </button>
        </div>
      </header>

      {/* FAQ Modal */}
      {showFAQ && (
        <FAQModal onClose={() => setShowFAQ(false)} />
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFeedback(false)}>
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('sendFeedback')}</h2>
            <textarea
              placeholder={t('feedbackPlaceholder')}
              rows={5}
              className="w-full px-4 py-3 border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  alert(t('feedbackThankYou'));
                  setShowFeedback(false);
                }}
                className="btn-primary flex-1"
              >
                {t('submit')}
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                className="btn-ghost"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAbout(false)}>
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('aboutMUCGPT')}</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>{t('aboutDescription')}</p>
              <p><strong>{t('features')}</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('featureCustomAssistants')}</li>
                <li>{t('featureConfigureBehavior')}</li>
                <li>{t('featureShareAssistants')}</li>
                <li>{t('featureOrganizeConversations')}</li>
              </ul>
              <p className="text-sm text-muted-foreground/70 mt-4">{t('version')}</p>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="btn-primary btn-lg w-full mt-6"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

