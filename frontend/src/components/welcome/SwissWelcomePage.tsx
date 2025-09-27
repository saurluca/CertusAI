import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppStore } from '../../store';
import SwissGovLogo from '../icons/SwissGovLogo';
import SwissScalesIcon from '../icons/SwissScalesIcon';

interface SwissWelcomePageProps {
  onComplete?: () => void;
}

const SwissWelcomePage: React.FC<SwissWelcomePageProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, isProcessing } = useAppStore();
  const navigate = useNavigate();

  // Dil değiştirme için state
  const languages = useMemo(() => ['de', 'fr', 'it', 'en'] as const, []);
  const [autoLanguageIndex, setAutoLanguageIndex] = useState(0);
  const [isAutoLanguageMode, setIsAutoLanguageMode] = useState(false);

  // Manuel dil değiştirme fonksiyonu
  const handleLanguageChange = (lang: string) => {
    // Animasyon tamamlanana kadar manuel dil değişikliğini engelle
    if (showContent) {
      setLanguage(lang);
      setIsAutoLanguageMode(false); // Manuel seçim yapıldığında otomatik modu durdur
    }
  };

  const handleSkip = () => {
    console.log('Skip button clicked');
    if (onComplete) {
      console.log('Calling onComplete callback');
      onComplete();
    } else {
      console.log('No onComplete callback, navigating to /home');
      navigate('/home');
    }
  };

  // Main prompt state and handlers
  const [prompt, setPrompt] = useState('');

  const handleAnalyze = async () => {
    const q = prompt.trim();
    if (!q || isProcessing) return;
    // Navigate to Home with query params so SwissMainLayout chat runs Swiss Law RAG automatically
    const params = new URLSearchParams({ question: q, language: currentLanguage || 'de' });
    // If embedded in HomePage, switch out of welcome screen first
    if (onComplete) {
      onComplete();
    }
    navigate(`/home?${params.toString()}`);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleAnalyze();
    }
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Otomatik dil değiştirme fonksiyonu
  const switchToNextLanguage = useCallback(() => {
    if (isAutoLanguageMode) {
      const nextIndex = (autoLanguageIndex + 1) % languages.length;
      setAutoLanguageIndex(nextIndex);
      setLanguage(languages[nextIndex]);
    }
  }, [isAutoLanguageMode, autoLanguageIndex, setLanguage, languages]);

  // Animasyon süresince dili sabit tut (Swiss German)
  // Animasyon tamamlandıktan sonra otomatik dil değiştirme modunu başlat
  useEffect(() => {
    if (showContent && !isAutoLanguageMode) {
      // Animasyon tamamlandıktan sonra 1 saniye bekle ve sonra otomatik modu başlat
      const initialTimer = setTimeout(() => {
        setIsAutoLanguageMode(true);
      }, 1000);
      return () => clearTimeout(initialTimer);
    }
  }, [showContent, isAutoLanguageMode]);

  // 3 saniyede bir dil değiştir
  useEffect(() => {
    if (isAutoLanguageMode) {
      const interval = setInterval(switchToNextLanguage, 3000);
      return () => clearInterval(interval);
    }
  }, [isAutoLanguageMode, switchToNextLanguage]);

  // Reset animation state when component mounts
  useEffect(() => {
    setCurrentStep(0);
    setShowContent(false);
    setIsAutoLanguageMode(false);
    setAutoLanguageIndex(0);
    // Animasyon süresince dili Swiss German olarak sabit tut
    setLanguage('de');
  }, [setLanguage]);

  // Professional sequential animation timing
  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 800);
    const timer2 = setTimeout(() => setCurrentStep(2), 2000);
    const timer3 = setTimeout(() => setCurrentStep(3), 3500);
    const timer4 = setTimeout(() => setCurrentStep(4), 4800);
    const timer5 = setTimeout(() => {
      setShowContent(true);
    }, 6200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  // Swiss design constants
  const smoothEasing = [0.25, 0.46, 0.45, 0.94] as const;
  const redColor = '#FF0000';
  const darkGray = '#1C1C1C';

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Swiss Grid Background */}
      <div className="absolute inset-0 opacity-40" style={{ zIndex: 1 }}>
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-gray-300 h-full" />
          ))}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen px-8 flex items-center justify-center">
        <div className="max-w-4xl w-full text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{
              scale: currentStep >= 1 ? 1 : 0.8,
              opacity: currentStep >= 1 ? 1 : 0,
              y: currentStep >= 1 ? 0 : 30
            }}
            transition={{ duration: 1.5, ease: smoothEasing }}
            className="mb-12"
          >
            <div className="relative inline-block">
              <SwissGovLogo size={140} className="drop-shadow-xl" />
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.8, ease: smoothEasing }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                style={{
                  background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                }}
              />
            </div>
          </motion.div>

          {/* Justice Scales Icon (animated) */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: currentStep >= 2 ? 1 : 0, y: currentStep >= 2 ? 0 : 20, scale: currentStep >= 2 ? 1 : 0.95 }}
            transition={{ duration: 0.8, ease: smoothEasing }}
            className="mb-6 flex items-center justify-center"
          >
            <SwissScalesIcon size={56} variant="idle" stroke="#E60000" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{
              opacity: currentStep >= 2 ? 1 : 0,
              y: currentStep >= 2 ? 0 : 40,
              scale: currentStep >= 2 ? 1 : 0.9
            }}
            transition={{ duration: 1.2, ease: smoothEasing }}
            className="mb-8"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold tracking-tight"
              style={{ color: darkGray, fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {['C', 'e', 'r', 't', 'u', 's', 'A', 'i'].map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + (index * 0.1), ease: smoothEasing }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </motion.h1>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: currentStep >= 3 ? 1 : 0,
              y: currentStep >= 3 ? 0 : 30,
              scale: currentStep >= 3 ? 1 : 0.95
            }}
            transition={{ duration: 1.0, ease: smoothEasing }}
            className="mb-12"
          >
            <div className="space-y-2">
              <motion.p
                className="text-xl md:text-2xl font-medium tracking-wide"
                style={{ color: darkGray, fontFamily: 'Inter, system-ui, sans-serif' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: currentStep >= 3 ? 1 : 0,
                  scale: currentStep >= 3 ? 1 : 0.95
                }}
                transition={{ duration: 0.8, delay: 0.5, ease: smoothEasing }}
                key={currentLanguage} // Dil değiştiğinde yeniden animasyon için
              >
                {t('welcome.tagline')}
              </motion.p>
            </div>
          </motion.div>

          {/* Red Line */}
          <motion.div
            initial={{ width: 0, opacity: 0, scaleX: 0 }}
            animate={{
              width: currentStep >= 4 ? '100%' : 0,
              opacity: currentStep >= 4 ? 1 : 0,
              scaleX: currentStep >= 4 ? 1 : 0
            }}
            transition={{ duration: 1.5, ease: smoothEasing }}
            className="mb-16 w-full max-w-2xl px-8 mx-auto"
          >
            <div
              className="h-1 w-full rounded-full mx-auto"
              style={{ backgroundColor: redColor }}
            />
          </motion.div>

          {/* Interactive Elements */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{
              opacity: showContent ? 1 : 0,
              y: showContent ? 0 : 50,
              scale: showContent ? 1 : 0.95
            }}
            transition={{ duration: 1.2, ease: smoothEasing }}
            className="w-full max-w-2xl px-8 mx-auto"
          >
            <div className="space-y-10">
              {/* Input Field */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{
                  scale: showContent ? 1 : 0.9,
                  opacity: showContent ? 1 : 0,
                  y: showContent ? 0 : 20
                }}
                transition={{ duration: 1.0, delay: 0.8, ease: smoothEasing }}
                className="max-w-2xl mx-auto"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('welcome.inputPlaceholder')}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-swiss-red transition-all duration-300 shadow-lg"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', pointerEvents: 'auto' }}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalyze}
                    className="absolute right-2 top-2 px-6 py-2 bg-swiss-red text-white rounded-lg font-medium transition-all duration-300 hover:bg-swiss-red-dark shadow-md"
                    style={{ pointerEvents: 'auto' }}
                  >
                    {t('welcome.analyzeButton')}
                  </motion.button>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{
                  opacity: showContent ? 1 : 0,
                  y: showContent ? 0 : 30,
                  scale: showContent ? 1 : 0.95
                }}
                transition={{ duration: 1.0, delay: 1.0, ease: smoothEasing }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/home')}
                  className="px-8 py-4 bg-white border-2 border-swiss-red text-swiss-red rounded-xl font-medium transition-all duration-300 hover:bg-swiss-red hover:text-white shadow-lg hover:shadow-xl"
                  style={{ pointerEvents: 'auto' }}
                  key={`upload-${currentLanguage}`}
                >
                  {t('welcome.uploadButton')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/home')}
                  className="px-8 py-4 bg-swiss-red text-white rounded-xl font-medium transition-all duration-300 hover:bg-swiss-red-dark shadow-lg hover:shadow-xl"
                  style={{ pointerEvents: 'auto' }}
                  key={`search-${currentLanguage}`}
                >
                  {t('welcome.searchButton')}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Made in Switzerland Badge - Bottom Center */}
      <motion.div
        className="absolute bottom-6  transform  z-40 "
        style={{ left: '50% !important', transform: 'translateX(-50%) !important' }}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: currentStep >= 4 ? 1 : 0,
          y: currentStep >= 4 ? 0 : 20,
          scale: currentStep >= 4 ? 1 : 0.95
        }}
        transition={{ duration: 0.6, delay: 0.2, ease: smoothEasing }}
      >
        <div className="flex items-center space-x-3 px-6 py-3 bg-white/90 backdrop-blur-md rounded-full">
          <span
            className="text-sm md:text-base font-medium tracking-wide"
            style={{
              color: darkGray,
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
            key={`made-in-${currentLanguage}`}
          >
            {t('welcome.madeInSwitzerland')}
          </span>
          <div className="flex items-center space-x-2">
            {/* Styled Swiss flag (same style as header/footer) */}
            <span
              className="relative overflow-hidden inline-block border border-slate-200 rounded-[2px]"
              style={{ width: '16px', height: '16px' }}
              aria-label="Switzerland"
              title="Switzerland"
            >
              <span className="absolute inset-0 bg-swiss-red" />
              {/* Horizontal bar of the cross */}
              <span className="absolute bg-white" style={{ width: '62%', height: '24%', left: '19%', top: '38%' }} />
              {/* Vertical bar of the cross */}
              <span className="absolute bg-white" style={{ width: '24%', height: '62%', left: '38%', top: '19%' }} />
            </span>
            <div className="switzerland-map-icon"></div>
          </div>
        </div>
      </motion.div>

      {/* Skip Welcome Button */}
      <motion.button
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: currentStep >= 2 ? 1 : 0, y: currentStep >= 2 ? 0 : -30 }}
        transition={{ duration: 0.8, delay: 0.5, ease: smoothEasing }}
        onClick={handleSkip}
        className="absolute top-8 right-8 px-4 py-2 text-sm font-medium text-gray-600 hover:text-swiss-red transition-all duration-300 border border-gray-300 rounded-lg hover:border-swiss-red hover:shadow-md cursor-pointer z-50"
        type="button"
        style={{ pointerEvents: 'auto' }}
      >
        {t('welcome.skipButton')}
      </motion.button>

      {/* Country Flag Language Toggle - Swiss, French, Italian, British */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: currentStep >= 3 ? 1 : 0, scale: currentStep >= 3 ? 1 : 0.8 }}
        transition={{ duration: 0.8, delay: 0.6, ease: smoothEasing }}
        className="absolute top-8 left-8 flex space-x-3 z-50"
        style={{ zIndex: 999 }}
      >
        {[
          {
            lang: 'CH',
            flagType: 'british',
            colors: ['#FF0000', '#FFFFFF']
          },
          {
            lang: 'FR',
            colors: ['#002395', '#FFFFFF', '#ED2939'],
            textColor: '#000000'
          },
          {
            lang: 'IT',
            colors: ['#009246', '#FFFFFF', '#CE2B37'],
            textColor: '#000000'
          },
          {
            lang: 'EN',
            flagType: 'image',
            flagUrl: 'https://flagcdn.com/w320/gb.png',
            textColor: '#000000'
          }
        ].map((item, index) => (
          <motion.div
            key={item.lang}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{
              opacity: currentStep >= 3 ? 1 : 0,
              y: currentStep >= 3 ? 0 : -20,
              scale: currentStep >= 3 ? 1 : 0.8
            }}
            transition={{ duration: 0.6, delay: 1.0 + (index * 0.1), ease: smoothEasing }}
            className="w-14 h-10 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-swiss-red hover:shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center relative overflow-hidden"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100,
              pointerEvents: 'auto'
            }}
            onClick={() => handleLanguageChange(item.lang.toLowerCase())}
            title={`Switch to ${item.lang}`}
          >
            {/* Flag Background */}
            <div className="absolute inset-0">
              {item.flagType === 'image' ? (
                /* Image-based Flag */
                <img
                  src={item.flagUrl}
                  alt={`${item.lang} flag`}
                  className="w-full h-full object-cover rounded"
                  style={{ zIndex: 1 }}
                />
              ) : item.flagType === 'swiss' ? (
                /* Swiss Flag */
                <div className="w-full h-full bg-swiss-red flex items-center justify-center relative">
                  {/* Swiss Cross */}
                  <div className="absolute bg-white" style={{
                    width: '60%',
                    height: '20%',
                    left: '20%',
                    top: '40%'
                  }}></div>
                  <div className="absolute bg-white" style={{
                    width: '20%',
                    height: '60%',
                    left: '40%',
                    top: '20%'
                  }}></div>
                </div>
              ) : item.flagType === 'british' ? (
                /* British Flag - Clean Red Ensign Style */
                <div className="w-full h-full bg-red-700 flex items-center justify-center relative">
                  {/* British cross design */}
                  <div className="absolute bg-white" style={{
                    width: '60%',
                    height: '20%',
                    left: '20%',
                    top: '40%'
                  }}></div>
                  <div className="absolute bg-white" style={{
                    width: '20%',
                    height: '60%',
                    left: '40%',
                    top: '20%'
                  }}></div>
                  {/* Additional cross elements for British flag character */}
                  <div className="absolute bg-white" style={{
                    width: '40%',
                    height: '12%',
                    left: '30%',
                    top: '44%'
                  }}></div>
                  <div className="absolute bg-white" style={{
                    width: '12%',
                    height: '40%',
                    left: '44%',
                    top: '30%'
                  }}></div>
                </div>
              ) : item.colors ? (
                /* Standard tri-color flags */
                <div
                  className="w-full h-full"
                  style={{
                    background: item.lang === 'FR' || item.lang === 'IT'
                      ? `linear-gradient(to right, ${item.colors[0]} 0%, ${item.colors[0]} 33.33%, ${item.colors[1]} 33.33%, ${item.colors[1]} 66.66%, ${item.colors[2]} 66.66%, ${item.colors[2]} 100%)`
                      : `linear-gradient(to bottom, ${item.colors[0]} 0%, ${item.colors[0]} 33.33%, ${item.colors[1]} 33.33%, ${item.colors[1]} 66.66%, ${item.colors[2]} 66.66%, ${item.colors[2]} 100%)`
                  }}
                ></div>
              ) : (
                /* Fallback for flags without colors */
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">{item.lang}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default SwissWelcomePage;
