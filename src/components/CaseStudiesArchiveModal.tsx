import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ArrowUpRight, Sparkles } from 'lucide-react';
import { CaseStudy } from '../types';
import { ClientLogo } from './ClientLogo';
import { soundFX } from '../utils/audio';

interface CaseStudiesArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseStudies: CaseStudy[];
  onSelectCaseStudy: (study: CaseStudy) => void;
}

const CATEGORIES = [
  'All',
  'AI & Automation',
  'Executive Tools',
  'Fintech',
  'Developer Infrastructure',
  'Enterprise Scale',
] as const;

export const CaseStudiesArchiveModal: React.FC<CaseStudiesArchiveModalProps> = ({
  isOpen,
  onClose,
  caseStudies,
  onSelectCaseStudy,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredStudies = caseStudies.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            soundFX.playClick(600);
            onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-6xl max-h-[92vh] liquid-glass-elevated rounded-[32px] sm:rounded-[44px] shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="px-6 sm:px-10 py-6 border-b border-neutral-200/80 bg-white/80 backdrop-blur-2xl sticky top-0 z-20 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="dynamic-island-subtle mb-1">
                  <span>📂</span>
                  <span className="text-white font-mono">ARCHIVE & EXPLORER</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  All Partnerships
                </h1>
              </div>

              <button
                id="close-archive-btn"
                onClick={() => {
                  soundFX.playClick(600);
                  onClose();
                }}
                className="w-10 h-10 rounded-full liquid-glass-pill hover:bg-neutral-900 hover:text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar & Search */}
            <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      soundFX.playClick(900);
                      setSelectedCategory(cat);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'liquid-glass-pill text-neutral-700 hover:bg-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search partnerships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-full liquid-glass-input text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="p-6 sm:p-10 overflow-y-auto">
            {filteredStudies.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-neutral-500 text-sm">
                  No partnerships matched your filter criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudies.map((study) => (
                  <motion.div
                    key={study.id}
                    layout
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      soundFX.playClick(1000);
                      onSelectCaseStudy(study);
                      onClose();
                    }}
                    className="liquid-glass hover:liquid-glass-elevated rounded-[28px] p-6 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="w-full aspect-video rounded-2xl bg-neutral-900 overflow-hidden mb-4 border border-white/80 relative shadow-2xs">
                        <img
                          src={study.imageSrc}
                          alt={study.imageAlt}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white">
                          {study.indexNumber}
                        </div>
                      </div>

                      {/* Header */}
                      <ClientLogo
                        name={study.clientName}
                        type={study.clientLogoType}
                        isLight={true}
                        className="mb-2"
                      />

                      <h2 className="text-base font-bold text-neutral-900 line-clamp-2 mb-1.5 group-hover:text-black">
                        {study.title}
                      </h2>

                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {study.summary}
                      </p>
                    </div>

                    {/* Stats & Link */}
                    <div className="pt-4 mt-4 border-t border-neutral-200/80 flex items-center justify-between">
                      <div>
                        {study.metrics && study.metrics[0] ? (
                          <>
                            <span className="text-lg font-black text-neutral-900 font-mono">
                              {study.metrics[0]?.value}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-medium block">
                              {study.metrics[0]?.label}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            Partner Breakdown
                          </span>
                        )}
                      </div>

                      <span className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
