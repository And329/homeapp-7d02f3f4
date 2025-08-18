import React from 'react';

interface TikTokIconProps {
  className?: string;
}

const TikTokIcon: React.FC<TikTokIconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-1.183-.11 6.44 6.44 0 0 0-6.44 6.44 6.44 6.44 0 0 0 13.09 1.139V9.313a8.168 8.168 0 0 0 4.766 1.516v-3.4a4.795 4.795 0 0 1-.99-.743z"/>
  </svg>
);

export default TikTokIcon;