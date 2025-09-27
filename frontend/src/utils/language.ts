import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, Language } from '../types';

/**
 * Language utility functions for CertusAI
 */

export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export const getLanguageName = (code: string): string => {
  const language = getLanguageByCode(code);
  return language ? language.name : 'Unknown';
};

export const getLanguageFlag = (code: string): string => {
  const language = getLanguageByCode(code);
  return language ? language.flag : 'https://flagcdn.com/w320/un.png'; // UN flag as fallback
};

export const isValidLanguageCode = (code: string): boolean => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
};

export const getDefaultLanguage = (): string => {
  return DEFAULT_LANGUAGE;
};

export const getSupportedLanguages = (): Language[] => {
  return [...SUPPORTED_LANGUAGES];
};

/**
 * Language-specific text content
 * This can be expanded for full i18n support
 */
export const getLanguageText = (code: string, key: string): string => {
  const texts: Record<string, Record<string, string>> = {
    de: {
      'nav.home': 'Hauptseite',
      'nav.analysis': 'Analyse',
      'nav.search': 'Suche',
      'nav.admin': 'Admin',
      'upload.text': 'Text eingeben',
      'upload.file': 'Datei hochladen',
      'analysis.title': 'Analyse-Ergebnisse',
      'search.title': 'Rechtsdatenbank durchsuchen',
      'admin.title': 'Admin Dashboard',
    },
    fr: {
      'nav.home': 'Page principale',
      'nav.analysis': 'Analyse',
      'nav.search': 'Recherche',
      'nav.admin': 'Admin',
      'upload.text': 'Saisir du texte',
      'upload.file': 'Télécharger un fichier',
      'analysis.title': 'Résultats d\'analyse',
      'search.title': 'Rechercher dans la base de données juridique',
      'admin.title': 'Tableau de bord Admin',
    },
    it: {
      'nav.home': 'Pagina principale',
      'nav.analysis': 'Analisi',
      'nav.search': 'Ricerca',
      'nav.admin': 'Admin',
      'upload.text': 'Inserisci testo',
      'upload.file': 'Carica file',
      'analysis.title': 'Risultati dell\'analisi',
      'search.title': 'Cerca nel database legale',
      'admin.title': 'Dashboard Admin',
    },
    en: {
      'nav.home': 'Home',
      'nav.analysis': 'Analysis',
      'nav.search': 'Search',
      'nav.admin': 'Admin',
      'upload.text': 'Enter text',
      'upload.file': 'Upload file',
      'analysis.title': 'Analysis Results',
      'search.title': 'Search Legal Database',
      'admin.title': 'Admin Dashboard',
    },
  };

  return texts[code]?.[key] || texts[DEFAULT_LANGUAGE]?.[key] || key;
};
