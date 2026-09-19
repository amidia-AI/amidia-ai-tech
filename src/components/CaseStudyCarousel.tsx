import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { CaseStudy } from '../types';
import { ArtworkFrame } from './ArtworkFrame';
import { ClientLogo } from './ClientLogo';

interface CaseStudyCarouselProps {
  caseStudies: CaseStudy[];
  onSelectCaseStudy: (study: CaseStudy) => void;
  onExploreAll: () => void;
}

export const CaseStudyCarousel: React.FC<CaseStudyCarouselProps> = ({
  caseStudies,
  onSelectCaseStudy,
  onExploreAll,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const activeStudy = caseStudies[currentIndex];
  const prevIndex = (currentIndex - 1 + caseStudies.length) % caseStudies.length;
  const nextIndex = (currentIndex + 1) % caseStudies.length;

  const prevStudy = caseStudies[prevIndex];
  const nextStudy = caseStudies[nextIndex];

  // Navigate next
  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % caseStudies.length);
  };

  // Navigate prev
  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + caseStudies.length) % caseStudies.length);
  };

  // Dot click
  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 28 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 80 : -80,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 28 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      },
    }),
  };

  return (
    <div className="w-full relative">
      {/* Header Eyebrow Badge & Title */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="dynamic-island-pill mb-3"
          >
            <span className="text-sm">🤝</span>
            <span className="text-xs font-mono font-semibold text-neutral-400">
              {activeStudy.indexNumber || '001'}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
            <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
              RECENT SPONSORSHIPS & PARTNERS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950"
          >
            Brands I've Worked With
          </motion.h2>
          <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs sm:text-sm font-mono text-neutral-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Updated Monthly
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-bold">
              ⚡ Strictly Limited to 2 Partnerships / Month
            </span>
          </div>
        </div>

        {/* Explore all button in header */}
        <button
          onClick={onExploreAll}
          className="apple-capsule hover:scale-105 active:scale-95 cursor-pointer self-start md:self-auto shadow-xs hover:bg-white transition-all text-xs sm:text-sm"
        >
          <Layers className="w-4 h-4 text-[#0071e3]" />
          <span>View All {caseStudies.length} Partnerships</span>
        </button>
      </div>

      {/* Carousel Visual Stage with 3D Side Previews */}
      <div className="relative z-10 flex items-center justify-center my-4 sm:my-8">
        {/* Left Arrow Button */}
        <button
          id="carousel-prev-button"
          onClick={handlePrev}
          aria-label="Previous case study"
          className="absolute left-0 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full liquid-glass hover:bg-white text-neutral-900 flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>

        {/* Right Arrow Button */}
        <button
          id="carousel-next-button"
          onClick={handleNext}
          aria-label="Next case study"
          className="absolute right-0 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full liquid-glass hover:bg-white text-neutral-900 flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 -mr-0.5" />
        </button>

        {/* Left Peeking Card (Desktop) */}
        <div
          onClick={handlePrev}
          className="hidden xl:block absolute -left-12 2xl:-left-16 w-[360px] opacity-40 hover:opacity-80 cursor-pointer filter blur-[0.5px] hover:blur-none transition-all duration-300 pointer-events-auto"
          style={{ transform: 'translateX(-30%) scale(0.85)' }}
        >
          <div className="liquid-glass rounded-3xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-neutral-900 overflow-hidden shrink-0 border border-white/80">
              <img
                src={prevStudy.imageSrc}
                alt={prevStudy.imageAlt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="truncate">
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-1">
                {prevStudy.clientName}
              </p>
              <p className="text-sm font-bold text-neutral-900 line-clamp-2">
                {prevStudy.title}
              </p>
            </div>
          </div>
        </div>

        {/* Right Peeking Card (Desktop) */}
        <div
          onClick={handleNext}
          className="hidden xl:block absolute -right-12 2xl:-right-16 w-[360px] opacity-40 hover:opacity-80 cursor-pointer filter blur-[0.5px] hover:blur-none transition-all duration-300 pointer-events-auto"
          style={{ transform: 'translateX(30%) scale(0.85)' }}
        >
          <div className="liquid-glass rounded-3xl p-5 shadow-lg flex items-center gap-4">
            <div className="truncate flex-1">
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-1">
                {nextStudy.clientName}
              </p>
              <p className="text-sm font-bold text-neutral-900 line-clamp-2">
                {nextStudy.title}
              </p>
              <p className="text-xs font-semibold text-blue-700 mt-1 flex items-center gap-1">
                <span>Verified Deliverable</span>
              </p>
            </div>
            <div className="w-24 h-24 rounded-2xl bg-neutral-900 overflow-hidden shrink-0 border border-white/80">
              <img
                src={nextStudy.imageSrc}
                alt={nextStudy.imageAlt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Center Stage Main Card Container */}
        <div className="w-full max-w-4xl px-2 sm:px-6">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={activeStudy.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -60 || velocity.x < -400) {
                  handleNext();
                } else if (swipe > 60 || velocity.x > 400) {
                  handlePrev();
                }
              }}
              className="liquid-glass-elevated rounded-3xl sm:rounded-[36px] p-6 sm:p-8 lg:p-10 transition-all duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
                {/* Left Column: 3D Artwork Tile */}
                <div className="md:col-span-5 flex justify-center">
                  <ArtworkFrame
                    imageSrc={activeStudy.imageSrc}
                    imageAlt={activeStudy.imageAlt}
                    onClick={() => onSelectCaseStudy(activeStudy)}
                    className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-none"
                  />
                </div>

                {/* Right Column: Information, Typography & Metrics */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-5 sm:space-y-6">
                  {/* Client Logo & Category */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <ClientLogo
                        name={activeStudy.clientName}
                        type={activeStudy.clientLogoType}
                        isLight={true}
                      />
                      <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/95 text-neutral-800 border border-neutral-200/90 font-bold inline-flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
                        {activeStudy.category}
                      </span>
                    </div>

                    {/* Main Title */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-950 leading-snug">
                      {activeStudy.title}
                    </h3>

                    {/* Subtitle / Summary */}
                    <p className="mt-2 text-sm sm:text-base text-neutral-600 font-normal leading-relaxed">
                      {activeStudy.summary}
                    </p>

                    {/* Read More Link Button */}
                    <button
                      id={`read-more-btn-${activeStudy.id}`}
                      onClick={() => {
                        onSelectCaseStudy(activeStudy);
                      }}
                      className="inline-flex items-center gap-2 mt-4 group text-sm sm:text-base font-bold text-neutral-950 hover:text-black transition-colors focus:outline-none cursor-pointer"
                    >
                      <span className="underline decoration-neutral-300 underline-offset-4 group-hover:decoration-black transition-all">
                        Read Integration Breakdown
                      </span>
                      <span className="w-6 h-6 rounded-full bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white flex items-center justify-center transition-all">
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  </div>

                  {/* Tags & Partnership Scope Row */}
                  <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {activeStudy.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100/90 text-neutral-800 text-xs font-mono font-medium border border-neutral-200/70"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-mono text-neutral-500 font-semibold">
                      {activeStudy.fullStory.timeline}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Carousel Pagination Indicators */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 mt-6">
        {caseStudies.map((_, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              id={`carousel-dot-${idx}`}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="p-1 focus:outline-none group cursor-pointer"
            >
              {isActive ? (
                <motion.div
                  layoutId="activePill"
                  className="h-2 w-7 sm:w-9 rounded-full bg-neutral-950 shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              ) : (
                <div className="h-2 w-2 rounded-full bg-neutral-300 group-hover:bg-neutral-400 transition-colors" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
