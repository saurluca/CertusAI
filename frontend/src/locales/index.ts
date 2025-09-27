import { de } from './de';
import { fr } from './fr';
import { it } from './it';
import { en } from './en';

export const translations = {
  de,
  fr,
  it,
  en,
};

export type TranslationKey = keyof typeof de;
export type LanguageCode = keyof typeof translations;

export const getTranslation = (language: LanguageCode, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to German if translation not found
      value = translations.de;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
        if (value === undefined) break;
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
};

export { de, fr, it, en };
