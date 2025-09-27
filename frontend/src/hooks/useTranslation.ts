import { useAppStore } from '../store';
import { getTranslation, LanguageCode } from '../locales';

export const useTranslation = () => {
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  
  const t = (key: string): string => {
    return getTranslation(currentLanguage as LanguageCode, key);
  };
  
  return { t, currentLanguage };
};
