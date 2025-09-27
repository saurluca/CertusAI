import React from 'react';

export interface SwissAlpsIconProps {
  size?: number;
  variant?: 'idle' | 'loading';
  className?: string;
  // Accent colors aligned to design palette
  sky?: string; // background sky tint
  mountain?: string; // main mountain body
  snow?: string; // snow caps
  accent?: string; // red accent for Swiss brand
}

/**
 * SwissAlpsIcon
 * Minimal, clean Alps silhouette with subtle animations.
 * - idle: gentle shimmer on snow caps, slow cloud drift
 * - loading: pulsing mountain and faster cloud orbit for feedback
 */
const SwissAlpsIcon: React.FC<SwissAlpsIconProps> = ({
  size = 24,
  variant = 'idle',
  className = '',
  sky = '#F3F4F6', // slate-100
  mountain = '#334155', // slate-700
  snow = '#FFFFFF',
  accent = '#E60000', // swiss red
}) => {
  const isLoading = variant === 'loading';
  const box = size;
  const cloudClass = isLoading ? 'alps-cloud alps-cloud-loading' : 'alps-cloud';
  const snowClass = isLoading ? 'alps-snow alps-snow-loading' : 'alps-snow';
  const pulseClass = isLoading ? 'alps-mountain-pulse' : '';

  return (
    <div className={`relative ${className}`} style={{ width: box, height: box }} aria-hidden="true">
      <svg
        width={box}
        height={box}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={pulseClass}
      >
        {/* soft sky background (optional) */}
        {sky !== 'none' && (
          <rect x="0" y="0" width="100" height="100" rx="16" fill={sky} />
        )}

        {/* far cloud (drifts) */}
        <g className={cloudClass} style={{ animationDelay: '0.2s' }}>
          <ellipse cx="26" cy="24" rx="10" ry="6" fill="#E5E7EB" />
          <ellipse cx="35" cy="24" rx="8" ry="5" fill="#E5E7EB" />
        </g>

        {/* near cloud (drifts) */}
        <g className={cloudClass} style={{ animationDelay: '0.8s' }}>
          <ellipse cx="70" cy="20" rx="9" ry="5.5" fill="#E5E7EB" />
          <ellipse cx="78" cy="20" rx="7" ry="4.5" fill="#E5E7EB" />
        </g>

        {/* main mountain */}
        <g>
          <path d="M10 78 L38 36 L45 46 L55 32 L90 78 Z" fill={mountain} opacity="0.95" />
          {/* accent ridge line */}
          <path d="M38 36 L45 46 L55 32" stroke={accent} strokeWidth="1.8" strokeLinejoin="round" />

          {/* snow caps with subtle shimmer */}
          <path className={snowClass} d="M35 42 L38 36 L42 43 Z" fill={snow} />
          <path className={snowClass} d="M52 38 L55 32 L59 39 Z" fill={snow} />
        </g>

        {/* ground/base shadow */}
        <ellipse cx="50" cy="82" rx="38" ry="6" fill="#D1D5DB" opacity="0.5" />
      </svg>
    </div>
  );
};

export default SwissAlpsIcon;
