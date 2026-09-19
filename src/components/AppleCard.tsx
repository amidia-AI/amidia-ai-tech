import React, { useRef } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { appleEase } from '../utils/motion';

interface AppleCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const AppleCard: React.FC<AppleCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(0, 0, 0, 0.035)',
  ...motionProps
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !spotlightRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(450px circle at ${x}px ${y}px, ${spotlightColor}, transparent 70%)`;
  };

  const handleMouseEnter = () => {
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '0';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        y: -4,
        transition: { duration: 0.25, ease: appleEase },
      }}
      className={`relative overflow-hidden bg-white border border-neutral-200/90 rounded-3xl transition-shadow duration-300 shadow-xs hover:shadow-md transform-gpu ${className}`}
      {...motionProps}
    >
      {/* Zero-render-overhead cursor spotlight */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0 will-change-[background,opacity]"
      />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </motion.div>
  );
};
