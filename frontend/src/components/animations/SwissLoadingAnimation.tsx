import React from 'react';

interface SwissLoadingAnimationProps {
  type: 'cow' | 'train' | 'cross' | 'cable-car' | 'cheese';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SwissLoadingAnimation: React.FC<SwissLoadingAnimationProps> = ({
  type,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const renderAnimation = () => {
    switch (type) {
      case 'cow':
        return (
          <div className={`${sizeClasses[size]} ${className}`}>
            <div className="w-full h-full bg-swiss-red rounded-full animate-cow-walk relative overflow-hidden">
              {/* Alpine Cow SVG */}
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-white"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
          </div>
        );

      case 'train':
        return (
          <div className={`${sizeClasses[size]} ${className}`}>
            <div className="w-full h-full bg-swiss-red rounded-lg animate-train-move relative overflow-hidden">
              {/* Swiss Train SVG */}
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-white"
                fill="currentColor"
              >
                <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM8 10.5V9h8v1.5H8z"/>
              </svg>
            </div>
          </div>
        );

      case 'cross':
        return (
          <div className={`${sizeClasses[size]} ${className}`}>
            <div className="w-full h-full bg-swiss-red rounded-lg animate-swiss-cross flex items-center justify-center">
              {/* Swiss Cross SVG */}
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-white"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
        );

      case 'cable-car':
        return (
          <div className={`${sizeClasses[size]} ${className}`}>
            <div className="w-full h-full bg-gradient-to-b from-swiss-red to-swiss-red-dark rounded-lg animate-cable-car flex items-center justify-center">
              {/* Cable Car SVG */}
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-white"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        );

      case 'cheese':
        return (
          <div className={`${sizeClasses[size]} ${className}`}>
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full animate-cheese-roll flex items-center justify-center">
              {/* Swiss Cheese SVG */}
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-yellow-800"
                fill="currentColor"
              >
                <circle cx="8" cy="8" r="1"/>
                <circle cx="16" cy="8" r="1"/>
                <circle cx="8" cy="16" r="1"/>
                <circle cx="16" cy="16" r="1"/>
                <circle cx="12" cy="12" r="1"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center">
      {renderAnimation()}
    </div>
  );
};

// Loading Screen Component
interface SwissLoadingScreenProps {
  type: 'document-analysis' | 'legal-search' | 'ai-processing' | 'file-upload';
  message?: string;
}

export const SwissLoadingScreen: React.FC<SwissLoadingScreenProps> = ({
  type,
  message
}) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'document-analysis':
        return {
          animation: 'cow' as const,
          title: 'Dokumentenanalyse',
          description: 'Analysiere Ihr Rechtsdokument...',
          message: message || 'Unsere KI durchsucht Ihr Dokument nach rechtlichen Aspekten.'
        };
      case 'legal-search':
        return {
          animation: 'train' as const,
          title: 'Rechtssuche',
          description: 'Suche nach ähnlichen Fällen...',
          message: message || 'Durchsuche unsere Datenbank nach relevanten Urteilen.'
        };
      case 'ai-processing':
        return {
          animation: 'cross' as const,
          title: 'KI-Verarbeitung',
          description: 'Verarbeite Ihre Anfrage...',
          message: message || 'Qwen AI und Swisscom Apertus analysieren Ihre Frage.'
        };
      case 'file-upload':
        return {
          animation: 'cable-car' as const,
          title: 'Datei-Upload',
          description: 'Lade Datei hoch...',
          message: message || 'Ihre Datei wird sicher hochgeladen und verarbeitet.'
        };
      default:
        return {
          animation: 'cross' as const,
          title: 'Lädt...',
          description: 'Bitte warten...',
          message: message || 'Verarbeite Ihre Anfrage.'
        };
    }
  };

  const config = getLoadingConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-glacier-blue to-snow-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-swiss-lg p-8 max-w-md w-full text-center">
        {/* Animation */}
        <div className="mb-6 flex justify-center">
          <SwissLoadingAnimation type={config.animation} size="lg" />
        </div>

        {/* Content */}
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          {config.title}
        </h2>
        <p className="text-slate-600 mb-4">
          {config.description}
        </p>
        <p className="text-sm text-slate-500">
          {config.message}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 bg-swiss-red rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-swiss-red rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-swiss-red rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SwissLoadingAnimation;
