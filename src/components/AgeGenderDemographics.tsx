import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Globe2,
  Users2,
  Laptop,
  TrendingUp,
  BarChart3,
  ImageIcon,
} from 'lucide-react';
import { StudioScreenshot } from '../types';

interface AnalyticsSliderProps {
  className?: string;
  screenshots?: StudioScreenshot[];
  onOpenScreenshot?: (screenshot: StudioScreenshot) => void;
}

export interface SectionDef {
  id: string;
  title: string;
  shortLabel: string;
  category: 'demographics' | 'devices' | 'geography' | 'reach' | 'retention';
  icon: React.ElementType;
  screenshotFileName?: string;
}

export const SECTIONS: SectionDef[] = [
  {
    id: 'age-gender',
    title: 'Age & Gender',
    shortLabel: 'Age & Gender',
    category: 'demographics',
    icon: Users2,
    screenshotFileName: 'Audience Demographics',
  },
  {
    id: 'devices',
    title: 'Device Type',
    shortLabel: 'Device Type',
    category: 'devices',
    icon: Laptop,
    screenshotFileName: 'Device Type Analytics',
  },
  {
    id: 'geography',
    title: 'Top Geography',
    shortLabel: 'Geography',
    category: 'geography',
    icon: Globe2,
    screenshotFileName: 'Audience Geography',
  },
  {
    id: 'reach-growth',
    title: 'Audience Reach & Growth',
    shortLabel: 'Reach & Growth',
    category: 'reach',
    icon: TrendingUp,
    screenshotFileName: 'Monthly Audience & Growth',
  },
  {
    id: 'content-retention',
    title: 'Content Performance & CTR',
    shortLabel: 'Watch Time & CTR',
    category: 'retention',
    icon: BarChart3,
    screenshotFileName: 'Average View Duration & CTR',
  },
];

export function AgeGenderDemographics({
  className = '',
  screenshots = [],
  onOpenScreenshot,
}: AnalyticsSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const activeSection = SECTIONS[currentIdx];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : SECTIONS.length - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIdx((prev) => (prev < SECTIONS.length - 1 ? prev + 1 : 0));
  };

  const handleSelectSection = (idx: number) => {
    setDirection(idx > currentIdx ? 1 : -1);
    setCurrentIdx(idx);
  };

  // Dedicated default mapping to authentic YouTube Studio screenshot proofs in public/
  const DEFAULT_SECTION_SCREENSHOTS: Record<string, { label: string; imageUrl: string }> = {
    'age-gender': {
      label: 'YouTube Studio Age & Gender Demographics Proof',
      imageUrl: '/age-gender.jpeg',
    },
    'devices': {
      label: 'YouTube Studio Demographics & Viewer Platforms Proof',
      imageUrl: '/age-gender.jpeg',
    },
    'geography': {
      label: 'YouTube Studio Top Geography & Country Distribution Proof',
      imageUrl: '/geography.jpeg',
    },
    'reach-growth': {
      label: 'YouTube Studio Monthly Audience Reach & Growth Proof',
      imageUrl: '/monthly-audience.jpeg',
    },
    'content-retention': {
      label: 'YouTube Studio Average View Duration & Retention Proof',
      imageUrl: '/avd.jpeg',
    },
  };

  const defaultAsset = DEFAULT_SECTION_SCREENSHOTS[activeSection.id];

  // Find matching uploaded screenshot if available in screenshots array, or use default authentic asset
  const matchingScreenshot =
    screenshots.find(
      (s) =>
        s.category === activeSection.category ||
        s.label?.toLowerCase().includes(activeSection.shortLabel.toLowerCase()) ||
        s.label?.toLowerCase().includes(activeSection.category)
    ) ||
    (defaultAsset
      ? {
          id: `default-${activeSection.id}`,
          monthYear: currentMonthYear,
          label: defaultAsset.label,
          imageUrl: defaultAsset.imageUrl,
          category: activeSection.category,
          createdAt: new Date().toISOString(),
        }
      : undefined);

  const handleOpenScreenshot = () => {
    if (matchingScreenshot && onOpenScreenshot) {
      onOpenScreenshot(matchingScreenshot);
    } else {
      setShowScreenshotModal(true);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Container Card */}
      <div className="relative bg-gradient-to-b from-sky-50/70 via-sky-50/15 to-white border border-sky-200/90 rounded-3xl p-5 sm:p-7 shadow-xs overflow-hidden">
        {/* Subtle decorative azure background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Bubbles / Section Pills & Navigation Controls */}
        <div className="space-y-3.5 pb-5 border-b border-neutral-100 relative z-10">
          {/* Controls Bar: Current Section Badge, View Screenshot Button, & Arrow Buttons */}
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2.5">
              <motion.span
                key={activeSection.id}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="p-2 rounded-xl bg-neutral-950 text-white shadow-xs"
              >
                <activeSection.icon className="w-4 h-4 text-sky-400" />
              </motion.span>
              <div>
                <motion.h3
                  key={activeSection.id + '-title'}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-base sm:text-lg font-black text-neutral-950 tracking-tight"
                >
                  {activeSection.title}
                </motion.h3>
                <span className="text-[11px] font-mono text-neutral-500">
                  Section {currentIdx + 1} of {SECTIONS.length}
                </span>
              </div>
            </div>

            {/* Actions: View Screenshot & Prev/Next Arrows */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpenScreenshot}
                className="px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>View Screenshot</span>
              </motion.button>

              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-neutral-200/70">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handlePrev}
                  aria-label="Previous section"
                  className="w-7 h-7 rounded-full bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleNext}
                  aria-label="Next section"
                  className="w-7 h-7 rounded-full bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Section Bubbles (Pills) Bar - Animated sliding active indicator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            {SECTIONS.map((sec, idx) => {
              const isActive = idx === currentIdx;
              const SecIcon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSelectSection(idx)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBubblePill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-neutral-950 shadow-xs"
                    />
                  )}
                  <SecIcon
                    className={`w-3.5 h-3.5 relative z-10 ${
                      isActive ? 'text-sky-400' : 'text-neutral-500'
                    }`}
                  />
                  <span className="relative z-10">{sec.shortLabel}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse relative z-10" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content Area - Concise, Straight-to-the-Point, Animated */}
        <div className="pt-4 min-h-[190px] flex flex-col justify-center relative z-10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* 1. AGE & GENDER */}
            {currentIdx === 0 && (
              <motion.div
                key="age-gender"
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center"
              >
                <div className="md:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold mb-1">
                    <span>Age Distribution</span>
                    <span className="font-mono font-bold text-neutral-900">73.7% Aged 18–34</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-800">18–24 years</span>
                      <span className="font-mono font-bold text-neutral-950">37.1%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '37.1%' }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-800">25–34 years</span>
                      <span className="font-mono font-bold text-neutral-950">36.6%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '36.6%' }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                        className="h-full rounded-full bg-sky-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-800">35–44 years</span>
                      <span className="font-mono font-semibold text-neutral-700">12.7%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '12.7%' }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="h-full rounded-full bg-neutral-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-neutral-500">Other (13–17, 45+)</span>
                      <span className="font-mono text-neutral-500">13.6%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '13.6%' }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                        className="h-full rounded-full bg-neutral-300"
                      />
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="md:col-span-5 bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex justify-between text-xs font-semibold text-neutral-700">
                    <span>Gender Ratio</span>
                    <span className="font-mono text-neutral-500">100% Total</span>
                  </div>

                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-neutral-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '96.6%' }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-neutral-900"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '3.4%' }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                      className="h-full bg-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white border border-neutral-200/80 rounded-xl p-2">
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Male</span>
                      <span className="text-lg font-black text-neutral-950 font-mono">96.6%</span>
                    </div>
                    <div className="bg-white border border-neutral-200/80 rounded-xl p-2">
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Female &amp; Other</span>
                      <span className="text-lg font-black text-neutral-700 font-mono">3.4%</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 2. DEVICE TYPE */}
            {currentIdx === 1 && (
              <motion.div
                key="devices"
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>Watch Time by Device</span>
                  <span className="font-mono font-bold text-sky-700">63.0% Computer (Workstation / Desktop)</span>
                </div>

                {/* Multi-segment device bar */}
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-neutral-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '63.0%' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-neutral-950"
                    title="Computer: 63.0%"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '24.7%' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                    className="h-full bg-sky-500"
                    title="Mobile: 24.7%"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '7.5%' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="h-full bg-indigo-500"
                    title="TV: 7.5%"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '4.7%' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                    className="h-full bg-purple-400"
                    title="Tablet: 4.7%"
                  />
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center"
                  >
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block">Computer</span>
                    <span className="text-xl font-black text-neutral-950 font-mono">63.0%</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center"
                  >
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block">Mobile</span>
                    <span className="text-xl font-black text-neutral-950 font-mono">24.7%</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center"
                  >
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block">TV</span>
                    <span className="text-xl font-black text-neutral-950 font-mono">7.5%</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center"
                  >
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block">Tablet</span>
                    <span className="text-xl font-black text-neutral-950 font-mono">4.7%</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* 3. TOP GEOGRAPHY */}
            {currentIdx === 2 && (
              <motion.div
                key="geography"
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>Top Views by Geographic Region (Last 28 Days)</span>
                  <span className="font-mono text-sky-700 font-bold">37.0% United States • Global Devs</span>
                </div>

                {/* Multi-segment geographic bar */}
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-neutral-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '37.0%' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-sky-600"
                    title="United States: 37.0%"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '8.0%' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                    className="h-full bg-indigo-500"
                    title="India: 8.0%"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '2.0%' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className="h-full bg-emerald-500"
                    title="Bangladesh: 2.0%"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '53.0%' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                    className="h-full bg-neutral-400"
                    title="Global Tech Hubs (UK, CA, EU, etc.): 53.0%"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 rounded-xl bg-sky-50/50 border border-sky-200/80 space-y-1"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-sky-950">United States</span>
                      <span className="text-base font-black text-sky-950 font-mono">37.0%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-sky-200/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '37.0%' }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-sky-600 rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-sky-800/80 font-medium block">Top Purchasing Power</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-neutral-900">India</span>
                      <span className="text-base font-black text-neutral-950 font-mono">8.0%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '8.0%' }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium block">Core Dev Ecosystem</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-neutral-900">Bangladesh</span>
                      <span className="text-base font-black text-neutral-950 font-mono">2.0%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '2.0%' }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium block">Emerging Tech Hub</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-neutral-900">Global Tech</span>
                      <span className="text-base font-black text-neutral-950 font-mono">53.0%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '53.0%' }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                        className="h-full bg-neutral-500 rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium block">UK, EU, Canada &amp; Others</span>
                  </motion.div>
                </div>

                {/* Subtitles note */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-600">
                  <span className="font-medium">Direct Technical English Audience:</span>
                  <span className="font-mono text-neutral-800">English Native &amp; Professional Devs (100%)</span>
                </div>
              </motion.div>
            )}

            {/* 4. AUDIENCE REACH & GROWTH */}
            {currentIdx === 3 && (
              <motion.div
                key="reach-growth"
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>Monthly Discovery &amp; Expansion</span>
                  <span className="font-mono font-bold text-emerald-700">+8.0K Subscribers (+826%)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center"
                  >
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Monthly Audience</span>
                    <span className="text-xl font-black text-neutral-950 font-mono mt-0.5 block">288.9K</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">Active unique viewers</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center"
                  >
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">New Viewers</span>
                    <span className="text-xl font-black text-sky-600 font-mono mt-0.5 block">89.1%</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">Algorithm discovery</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-center"
                  >
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Non-Subscriber Watch Time</span>
                    <span className="text-xl font-black text-neutral-950 font-mono mt-0.5 block">96.9%</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">Massive organic reach</span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* 5. CONTENT PERFORMANCE & CTR */}
            {currentIdx === 4 && (
              <motion.div
                key="content-retention"
                custom={direction}
                initial={{ opacity: 0, x: direction * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -30 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>Engagement &amp; Retention (Last 28 Days)</span>
                  <span className="font-mono text-neutral-600">Avg Duration: 3:14</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80"
                  >
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Avg View Duration</span>
                    <span className="text-xl font-black text-neutral-950 font-mono mt-0.5 block">3:14</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">Stable retention across videos</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80"
                  >
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Click-Through Rate (CTR)</span>
                    <span className="text-xl font-black text-neutral-950 font-mono mt-0.5 block">6.6%</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">High technical curiosity</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80"
                  >
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Top Video Reach</span>
                    <span className="text-xl font-black text-sky-600 font-mono mt-0.5 block">581.6K</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">Claude Code video views</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Screenshot Modal / Lightbox Placeholder */}
      <AnimatePresence>
        {showScreenshotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowScreenshotModal(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xl text-neutral-900 cursor-default"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-950">
                    {matchingScreenshot?.label || `${activeSection.title} — Studio Screenshot`}
                  </h4>
                  <p className="text-xs text-neutral-500">Monthly Analytics Screenshot</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScreenshotModal(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {matchingScreenshot?.imageUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-neutral-200">
                    <img
                      src={matchingScreenshot.imageUrl}
                      alt={matchingScreenshot.label}
                      className="w-full h-auto max-h-[70vh] object-contain bg-neutral-950"
                    />
                  </div>
                ) : (
                  <div className="p-10 border-2 border-dashed border-neutral-200 rounded-2xl text-center space-y-3 bg-neutral-50/60">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center mx-auto shadow-xs">
                      <ImageIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-neutral-900">
                        {activeSection.title} Screenshot
                      </h5>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        This authentic YouTube Studio screenshot will appear here once you upload it in the Admin panel.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowScreenshotModal(false)}
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer"
                      >
                        Close Preview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
