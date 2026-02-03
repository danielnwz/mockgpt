import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, setLanguage as setI18nLanguage, getLanguage, t as i18nT, getWelcomeMessages as i18nGetWelcomeMessages } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => getLanguage());

  const setLanguage = (lang: Language) => {
    setI18nLanguage(lang);
    setLanguageState(lang);
  };

  useEffect(() => {
    // Initialize language from localStorage
    const saved = getLanguage();
    if (saved !== language) {
      setLanguageState(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Custom hook for reactive translations
export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: Parameters<typeof i18nT>[0]) => {
    return i18nT(key, language);
  };

  const getWelcomeMessages = () => {
    return i18nGetWelcomeMessages(language);
  };

  return { t, getWelcomeMessages, language };
}
