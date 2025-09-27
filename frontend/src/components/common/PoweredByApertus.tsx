import React from 'react';

interface PoweredByApertusProps {
  className?: string;
  position?: 'fixed' | 'absolute' | 'static' | 'relative';
  variant?: 'bottom-right' | 'center';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

const PoweredByApertus: React.FC<PoweredByApertusProps> = ({ className = '', position = 'absolute', variant = 'bottom-right', size = 'md', href = 'https://www.swiss-ai.org/apertus' }) => {
  const containerClass =
    variant === 'center'
      ? `${position} inset-0 z-30 pointer-events-none select-none flex items-center justify-center`
      : `${position} bottom-5 right-5 z-30 pointer-events-none select-none`;
  const pad = size === 'lg' ? 'px-5 py-3' : size === 'sm' ? 'px-2.5 py-1' : 'px-4 py-2';
  const titleSize = size === 'lg' ? 'text-base' : size === 'sm' ? 'text-[10px]' : 'text-sm';
  const brandSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-xs' : 'text-base';
  return (
    <div
      className={`${containerClass} ${className}`}
      aria-label="Powered by Apertus AI"
      title="Powered by Apertus AI"
    >
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`pointer-events-auto inline-flex items-center gap-3 rounded-xl bg-white/92 backdrop-blur border border-slate-200 shadow-md ${pad}`}
      >
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-swiss-red text-white text-[12px] font-bold tracking-wide" aria-hidden="true">AI</span>
        <span className="flex flex-col leading-tight">
          <span className={`uppercase tracking-[0.18em] text-slate-500 ${titleSize}`} style={{ fontWeight: 600 }}>powered by</span>
          <span className={`${brandSize} font-semibold tracking-[0.06em] text-slate-900`} style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}>APERTUS AI</span>
        </span>
      </a>
    </div>
  );
};

export default PoweredByApertus;
