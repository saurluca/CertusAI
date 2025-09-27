import React from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SwissGovLogo from '../icons/SwissGovLogo';

const SwissHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, supportedLanguages } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="swiss-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <button 
            onClick={() => navigate('/')}
            className="swiss-logo group flex items-center space-x-3"
          >
            <SwissGovLogo 
              size={52} 
              className="group-hover:scale-105 transition-transform duration-300"
            />
            <div className="leading-tight">
              <h1 className="text-2xl font-bold text-slate-800 group-hover:text-swiss-red transition-colors leading-tight">
                CertusAi
              </h1>
              <p className="text-sm text-slate-600 -mt-1">{t('header.subtitle')}</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/welcome')}
              className="text-slate-700 hover:text-swiss-red transition-colors"
            >
              {t('nav.welcome') || 'Welcome'}
            </button>
            <button
              onClick={() => navigate('/home')}
              className="text-slate-700 hover:text-swiss-red transition-colors"
            >
              {t('nav.home')}
            </button>
            <button 
              onClick={() => navigate('/analysis')}
              className="text-slate-700 hover:text-swiss-red transition-colors"
            >
              {t('nav.analysis')}
            </button>
            <button 
              onClick={() => navigate('/data-plus')}
              className="text-slate-700 hover:text-swiss-red transition-colors"
            >
              Data+
            </button>
            {/* Admin link removed */}
          </nav>

          {/* Language Selector and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Selector - match Welcome page flags */}
            <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
              {/* CH -> de */}
              <button
                className={`w-8 h-6 rounded-md border ${currentLanguage === 'de' ? 'bg-white border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'} relative overflow-hidden`}
                onClick={() => setLanguage('de')}
                title="Deutsch"
              >
                <div className="absolute inset-0 bg-swiss-red flex items-center justify-center">
                  <div className="absolute bg-white" style={{ width: '60%', height: '20%', left: '20%', top: '40%' }}></div>
                  <div className="absolute bg-white" style={{ width: '20%', height: '60%', left: '40%', top: '20%' }}></div>
                </div>
              </button>
              {/* FR */}
              <button
                className={`w-8 h-6 rounded-md border ${currentLanguage === 'fr' ? 'bg-white border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'} overflow-hidden`}
                onClick={() => setLanguage('fr')}
                title="Français"
              >
                <div className="w-full h-full" style={{ background: 'linear-gradient(to right, #002395 0%, #002395 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #ED2939 66.66%, #ED2939 100%)' }}></div>
              </button>
              {/* IT */}
              <button
                className={`w-8 h-6 rounded-md border ${currentLanguage === 'it' ? 'bg-white border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'} overflow-hidden`}
                onClick={() => setLanguage('it')}
                title="Italiano"
              >
                <div className="w-full h-full" style={{ background: 'linear-gradient(to right, #009246 0%, #009246 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #CE2B37 66.66%, #CE2B37 100%)' }}></div>
              </button>
              {/* EN (GB flag image for simplicity) */}
              <button
                className={`w-8 h-6 rounded-md border ${currentLanguage === 'en' ? 'bg-white border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'} overflow-hidden`}
                onClick={() => setLanguage('en')}
                title="English"
              >
                <img src="https://flagcdn.com/w80/gb.png" alt="GB" className="w-full h-full object-cover" loading="lazy" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <nav className="flex flex-col space-y-2">
              <a href="/welcome" className="px-3 py-2 text-slate-700 hover:text-swiss-red hover:bg-slate-50 rounded-md transition-colors">
                {t('nav.welcome') || 'Welcome'}
              </a>
              <a href="/home" className="px-3 py-2 text-slate-700 hover:text-swiss-red hover:bg-slate-50 rounded-md transition-colors">
                {t('nav.home')}
              </a>
              <a href="/analysis" className="px-3 py-2 text-slate-700 hover:text-swiss-red hover:bg-slate-50 rounded-md transition-colors">
                {t('nav.analysis')}
              </a>
              <a href="/search" className="px-3 py-2 text-slate-700 hover:text-swiss-red hover:bg-slate-50 rounded-md transition-colors">
                {t('nav.search')}
              </a>
              <a href="/data-plus" className="px-3 py-2 text-slate-700 hover:text-swiss-red hover:bg-slate-50 rounded-md transition-colors">Data+</a>
              {/* Admin link removed */}
              <a href="/test" className="px-3 py-2 text-slate-700 hover:text-swiss-red hover:bg-slate-50 rounded-md transition-colors">
                {t('nav.test')}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default SwissHeader;
