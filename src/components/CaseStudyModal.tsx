import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Cpu, Calendar, Quote, Sparkles } from 'lucide-react';
import { CaseStudy } from '../types';
import { ClientLogo } from './ClientLogo';

interface CaseStudyModalProps {
  study: CaseStudy | null;
  onClose: () => void;
  onSelectNext: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  study,
  onClose,
  onSelectNext,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (study) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [study, onClose]);

  if (!study) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] liquid-glass-elevated rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-200/80 bg-white/80 backdrop-blur-2xl sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <ClientLogo name={study.clientName} type={study.clientLogoType} isLight={true} />
              <span className="hidden sm:inline-block text-xs font-mono text-neutral-400">
                / {study.category}
              </span>
            </div>

            <button
              id="close-modal-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-full liquid-glass-pill hover:bg-neutral-900 hover:text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 sm:p-10 overflow-y-auto space-y-8">
            {/* Header section with 3D Visual Artwork Thumbnail */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 flex justify-center">
                <div className="w-full max-w-[260px] aspect-square rounded-[24px] overflow-hidden bg-neutral-900 shadow-xl border border-white/80">
                  <img
                    src={study.imageSrc}
                    alt={study.imageAlt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="md:col-span-8 space-y-3">
                <div className="dynamic-island-subtle">
                  <span>💡</span>
                  <span className="text-white font-mono">{study.clientIndustry}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {study.title}
                </h1>
                <p className="text-neutral-600 text-base leading-relaxed">
                  {study.fullStory.overview}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-neutral-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {study.fullStory.timeline}
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" /> High-Performance AI Architecture
                  </span>
                </div>
              </div>
            </div>

            {/* Partnership Tags & Scope */}
            {study.metrics && study.metrics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {study.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="liquid-glass-pill rounded-2xl p-5 flex flex-col"
                  >
                    <span className="text-3xl font-black tracking-tight text-neutral-900 font-mono">
                      {metric.value}
                    </span>
                    <span className="text-sm font-bold text-neutral-800 mt-1">
                      {metric.label}
                    </span>
                    {metric.subtext && (
                      <span className="text-xs text-neutral-500 mt-0.5">
                        {metric.subtext}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-neutral-100/70 border border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {study.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-white text-xs font-mono font-semibold text-neutral-800 border border-neutral-200 shadow-2xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Verified Creator Sponsorship
                </span>
              </div>
            )}

            {/* Problem & Solution Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 mb-2">
                  The Core Challenge
                </h2>
                <p className="text-neutral-700 text-sm leading-relaxed">
                  {study.fullStory.challenge}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 shadow-2xs">
                <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 mb-2">
                  The Integration
                </h2>
                <p className="text-neutral-700 text-sm leading-relaxed">
                  {study.fullStory.solution}
                </p>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-3">
                Key Architectural Pillars
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {study.fullStory.architecturePoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl liquid-glass-pill text-sm text-neutral-700"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Testimonial Quote */}
            {study.fullStory.testimonial && (
              <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 text-white relative overflow-hidden">
                <Quote className="w-16 h-16 text-white/10 absolute -bottom-2 -right-2 pointer-events-none" />
                <p className="text-base sm:text-lg italic text-neutral-200 leading-relaxed relative z-10 mb-5">
                  "{study.fullStory.testimonial.quote}"
                </p>
                <div className="flex items-center gap-3 relative z-10">
                  <img
                    src={study.fullStory.testimonial.avatar}
                    alt={study.fullStory.testimonial.author}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <p className="font-bold text-sm text-white">
                      {study.fullStory.testimonial.author}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {study.fullStory.testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tech Stack Pills */}
            <div>
              <h2 className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2.5">
                Technologies Utilized
              </h2>
              <div className="flex flex-wrap gap-2">
                {study.fullStory.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-neutral-100 text-xs font-mono font-medium text-neutral-700 border border-neutral-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Footer Actions */}
          <div className="px-6 sm:px-8 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between sticky bottom-0 z-20">
            <button
              onClick={onClose}
              className="text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              Back to Overview
            </button>

            <button
              id="next-case-study-btn"
              onClick={onSelectNext}
              className="px-5 py-2 rounded-full bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow cursor-pointer"
            >
              Next Partnership →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
