import React from 'react';
import amidiaLogoImg from '../assets/images/amidia logo.png';

interface AmidiaLogoProps {
  className?: string;
  alt?: string;
}

export const AmidiaLogo: React.FC<AmidiaLogoProps> = ({
  className = 'w-8 h-8 sm:w-9 sm:h-9',
  alt = 'Amidia Logo',
}) => {
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 select-none flex items-center justify-center bg-white ${className}`}
    >
      <img
        src={amidiaLogoImg}
        alt={alt}
        className="w-full h-full object-cover rounded-full"
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
