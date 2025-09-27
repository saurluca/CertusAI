import React from 'react';

export interface SwissScalesIconProps {
  size?: number;
  variant?: 'idle' | 'loading';
  stroke?: string;
  fill?: string;
  className?: string;
}

/**
 * SwissScalesIcon
 * Minimalist, solid scales of justice with subtle optional animation.
 * - idle: gentle swing of the beam
 * - loading: faster swing + subtle pulse on pans
 */
const SwissScalesIcon: React.FC<SwissScalesIconProps> = ({
  size = 20,
  variant = 'idle',
  stroke = '#111111',
  fill = '#111111',
  className = '',
}) => {
  const isLoading = variant === 'loading';
  const swingClass = isLoading ? 'scales-swing-fast' : 'scales-swing';
  const panClass = isLoading ? 'scales-pan scales-pan-pulse' : 'scales-pan';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Top knob */}
      <circle cx="32" cy="8" r="4" fill={fill} />

      {/* Beam (subtle arc) */}
      <g className={swingClass} style={{ transformOrigin: '32px 12px' }}>
        <path d="M10 18 C 20 8, 44 8, 54 18" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Connection rings */}
        <circle cx="18" cy="18" r="3" fill={fill} />
        <circle cx="46" cy="18" r="3" fill={fill} />

        {/* Chains */}
        <path d="M18 18 V 30" stroke={stroke} strokeWidth="2.2" />
        <path d="M46 18 V 30" stroke={stroke} strokeWidth="2.2" />

        {/* Pans (semi-circles) */}
        <g className={panClass}>
          <path d="M10 30 H 26 A 8 8 0 0 1 10 30 Z" fill={fill} />
        </g>
        <g className={panClass}>
          <path d="M38 30 H 54 A 8 8 0 0 1 38 30 Z" fill={fill} />
        </g>
      </g>

      {/* Pillar (solid) */}
      <path d="M29 18 H35 V46 L32 52 L29 46 Z" fill={fill} />

      {/* Base (rounded pedestal) */}
      <path d="M16 56 C16 50, 48 50, 48 56 C48 60, 16 60, 16 56 Z" fill={fill} />
      <rect x="18" y="60" width="28" height="3" rx="1.5" fill={fill} />
    </svg>
  );
};

export default SwissScalesIcon;
