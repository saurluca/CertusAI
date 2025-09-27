import React from 'react';

interface SwissCheeseIconProps {
  className?: string;
  size?: number;
  color?: string; // main cheese color
  holeColor?: string;
}

// Simple Swiss cheese wedge with holes
const SwissCheeseIcon: React.FC<SwissCheeseIconProps> = ({
  className,
  size = 32,
  color = '#F8D24B', // swiss cheese yellow
  holeColor = '#E9B949',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Wedge body */}
      <path
        d="M6 26l26-12c1.5-.7 3.3-.7 4.8 0L58 26v20c0 1.7-1.3 3-3 3H9c-1.7 0-3-1.3-3-3V26z"
        fill={color}
      />
      {/* Edge/face */}
      <path d="M6 26l26 12 26-12" fill={color} opacity="0.9" />
      {/* Holes */}
      <circle cx="20" cy="36" r="3.5" fill={holeColor} />
      <circle cx="34" cy="30" r="2.5" fill={holeColor} />
      <circle cx="44" cy="38" r="4" fill={holeColor} />
      <circle cx="28" cy="42" r="2" fill={holeColor} />
    </svg>
  );
};

export default SwissCheeseIcon;
