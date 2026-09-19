// Apple-inspired GPU-accelerated motion timing & fluid animation variants
// Uses Apple's signature easeOutExpo deceleration curve [0.16, 1, 0.3, 1]
// Designed specifically for 60/120fps stutter-free hardware-accelerated scrolling

export const appleEase = [0.16, 1, 0.3, 1] as const;

export const springBounce = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
} as const;

export const softSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
} as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: custom * 0.08,
      ease: appleEase,
    },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

export const appleScale = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: custom * 0.06,
      ease: appleEase,
    },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    transition: {
      duration: 0.2,
      ease: appleEase,
    },
  },
};

