import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import swissMap from '../../swissMap.png';
import mountains from '../../mountains.png';

const SwissFooter: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  return (
    <footer className="swiss-footer relative overflow-hidden border-t-2 border-swiss-red">
      {/* Subtle full-height grey background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-100/80 to-slate-200/60" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto py-6 md:py-8">
        {/* Decorative Swiss map bottom-left (subtle) */}
        <img
          src={swissMap}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute bottom-0 left-10 md:left-16 w-36 md:w-44 opacity-20 mix-blend-multiply"
          style={{ filter: 'grayscale(100%)' }}
        />
        {/* Decorative mountains bottom-right (subtle) */}
        <img
          src={mountains}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute bottom-[-6px] md:bottom-[-8px] right-6 md:right-12 w-40 md:w-52 opacity-15 md:opacity-20 mix-blend-multiply"
          style={{ filter: 'grayscale(100%)' }}
        />
        <div className="swiss-footer-brand">
          <span>{t('footer.madeIn')}</span>
          {/* Replace emoji with the same Swiss flag style used in the header language selector */}
          <span className="inline-flex items-center justify-center align-middle">
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
          </span>
          <div className="switzerland-map-icon"></div>
        </div>
        
        <div className="text-xs text-slate-500 mb-2">
          {t('footer.tagline')}
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
          <a href="#" className="hover:text-slate-700 transition-colors">
            {t('footer.privacy')}
          </a>
          <a href="#" className="hover:text-slate-700 transition-colors">
            {t('footer.imprint')}
          </a>
          <a href="#" className="hover:text-slate-700 transition-colors">
            {t('footer.terms')}
          </a>
          <a href="#" className="hover:text-slate-700 transition-colors">
            {t('footer.contact')}
          </a>
        </div>
        
        <div className="mt-3 text-xs text-slate-400">
          © {currentYear} CertusAi. {t('footer.rights')} | 
          <span className="ml-1">{t('footer.poweredBy')}</span>
        </div>
      </div>
    </footer>
  );
};

export default SwissFooter;
