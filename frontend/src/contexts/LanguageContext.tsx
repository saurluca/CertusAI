import React, { createContext, useContext } from 'react';
import { useAppStore } from '../store';
import { SUPPORTED_LANGUAGES } from '../types';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentLanguage, setLanguage } = useAppStore();

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
