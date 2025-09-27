import React from 'react';

interface SwissCastleIconProps {
  className?: string;
  size?: number;
  color?: string;
}

// Simple castle/fort silhouette with Swiss cross on the gate
const SwissCastleIcon: React.FC<SwissCastleIconProps> = ({ className, size = 32, color = '#e4273b' }) => {
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
      {/* Castle body */}
      <path
        d="M8 26V16l6 4 6-4 6 4 6-4 6 4 6-4 6 4v10h-6v22H14V26H8z"
        fill={color}
      />
      {/* Merlons */}
      <path d="M12 14h6v4h-6v-4zm12 0h6v4h-6v-4zm12 0h6v4h-6v-4zm12 0h6v4h-6v-4z" fill={color} />
      {/* Gate with Swiss cross */}
      <rect x="26" y="34" width="12" height="14" rx="2" fill="#ffffff" opacity="0.95" />
      <rect x="31" y="36" width="2" height="10" fill={color} />
      <rect x="28" y="41" width="8" height="2" fill={color} />
    </svg>
  );
};

export default SwissCastleIcon;
