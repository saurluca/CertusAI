import React from 'react';

interface SwissPlusIconProps {
  size?: number;
  color?: string;
  variant?: 'idle' | 'loading';
  swarmCount?: number;
  className?: string;
}

/**
 * SwissPlusIcon
 * - idle: single Swiss-style plus rotating slowly
 * - loading: swarm of plus signs orbiting, pulsing, scaling
 */
const SwissPlusIcon: React.FC<SwissPlusIconProps> = ({
  size = 24,
  color = '#FF0000',
  variant = 'idle',
  swarmCount = 6,
  className = '',
}) => {
  if (variant === 'loading') {
    const items = Array.from({ length: swarmCount });
    const radius = size * 0.9; // orbit radius
    return (
      <div
        className={`relative swiss-plus-swarm ${className}`}
        style={{ width: size * 2, height: size * 2 }}
        aria-label="Loading"
        role="status"
      >
        {/* center plus */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,0,0.35))' }}
        >
          <PlusShape size={size * 0.8} color={color} className="animate-plus-breathe" />
        </div>
        {/* orbiting pluses */}
        {items.map((_, i) => {
          const angle = (i / swarmCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const delay = `${(i * 0.12).toFixed(2)}s`;
          return (
            <div
              key={i}
              className="absolute animate-plus-orbit"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                animationDelay: delay,
              }}
            >
              <PlusShape size={Math.max(10, size * 0.45)} color={color} className="animate-plus-pulse" style={{ animationDelay: delay }} />
            </div>
          );
        })}
      </div>
    );
  }

  // idle variant
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex items-center justify-center animate-plus-spin" style={{ filter: 'drop-shadow(0 0 4px rgba(255,0,0,0.3))' }}>
        <PlusShape size={size} color={color} />
      </div>
    </div>
  );
};

const PlusShape: React.FC<{ size: number; color: string; className?: string; style?: React.CSSProperties }> = ({ size, color, className = '', style }) => {
  const barW = Math.max(2, Math.floor(size / 5));
  const barL = size;
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, ...style }}>
      {/* horizontal bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: barL,
          height: barW,
          background: color,
          transform: 'translateY(-50%)',
          borderRadius: Math.max(1, Math.floor(barW / 3)),
        }}
      />
      {/* vertical bar */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: barW,
          height: barL,
          background: color,
          transform: 'translateX(-50%)',
          borderRadius: Math.max(1, Math.floor(barW / 3)),
        }}
      />
    </div>
  );
};

export default SwissPlusIcon;
