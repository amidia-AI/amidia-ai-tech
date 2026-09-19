import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface ArtworkFrameProps {
  imageSrc: string;
  imageAlt: string;
  className?: string;
  onClick?: () => void;
}

export const ArtworkFrame: React.FC<ArtworkFrameProps> = ({
  imageSrc,
  imageAlt,
  className = '',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['9deg', '-9deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-9deg', '9deg']);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className={`relative select-none ${className}`}
      onClick={onClick}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative w-full aspect-square bg-[#17171a] rounded-[28px] sm:rounded-[32px] md:rounded-[36px] overflow-hidden shadow-2xl border border-white/10 group cursor-pointer"
      >
        {/* Soft atmospheric ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-neutral-900 to-neutral-800 opacity-90 transition-opacity" />

        {/* 4K Visual Artwork */}
        <motion.img
          src={imageSrc}
          alt={imageAlt}
          referrerPolicy="no-referrer"
          className="relative z-10 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Dynamic Specular Sheen Glare */}
        {isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay opacity-35"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 65%)`,
            }}
          />
        )}

        {/* Inner rim light reflection */}
        <div className="pointer-events-none absolute inset-0 rounded-[28px] sm:rounded-[32px] md:rounded-[36px] ring-1 ring-inset ring-white/15" />
      </motion.div>
    </div>
  );
};
