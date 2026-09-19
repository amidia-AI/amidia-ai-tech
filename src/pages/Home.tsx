import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Video,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  Layers,
  ShieldCheck,
  Mail,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Calendar,
  Play,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { AppleCard } from '../components/AppleCard';
import { Link } from 'react-router-dom';
import { fetchPublicVideos, YouTubeVideoItem } from '../services/youtube';
import {
  appleEase,
  fadeInUp,
  staggerContainer,
  staggerFast,
  appleScale,
  springBounce,
  softSpring,
} from '../utils/motion';

export function Home() {
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videoList = await fetchPublicVideos();
        if (videoList && videoList.length > 0) {
          setVideos(videoList);
        }
      } catch (err) {
        console.warn('Notice loading public YouTube videos:', err);
      } finally {
        setLoadingVideos(false);
      }
    };

    loadVideos();
  }, []);

  const copyEmailAddress = async () => {
    try {
      await navigator.clipboard?.writeText('sajid@amidia.in');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Clipboard is unavailable (insecure context or denied permission) - the address stays visible on the button.
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white overflow-x-hidden">
      {/* High-Performance GPU Ambient Azure Canvas (subtle cerulean warmth, eliminating pale look) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-12%,rgba(14,165,233,0.09),rgba(250,250,250,0)_75%)]"
      />

      <Navbar />

      <main className="relative z-10">
        {/* ========================================================= */}
        {/* 1. HERO SECTION (APPLE KEYNOTE STYLE) */}
        {/* ========================================================= */}
        <section
          id="hero"
          className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-32 sm:pt-44 2xl:pt-52 pb-20 2xl:pb-28 text-center space-y-6 2xl:space-y-8 transform-gpu"
        >
          {/* Top Capsule Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.04, y: -1 }}
            transition={{ duration: 0.6, ease: appleEase }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50/80 border border-sky-200/90 text-sky-950 text-xs font-semibold tracking-wide shadow-xs cursor-default select-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span>YouTube Creator: Engineering, AI &amp; Business Automations</span>
          </motion.div>

          {/* Primary Apple-style Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: appleEase }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-neutral-950 tracking-tight leading-[1.08] max-w-4xl mx-auto"
          >
            Developer Workflows, AI Guides &amp; Business Automations.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: appleEase }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 font-normal leading-relaxed"
          >
            Amidia creates thorough, technical video guides breaking down modern AI tools, production developer workflows, business automations, and practical software engineering architecture.
          </motion.p>

          {/* Interactive Core Themes Pill Tags */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: appleEase }}
            className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto pt-1"
          >
            {[
              { label: 'AI Agents & Automation', icon: Cpu },
              { label: 'Full-Stack Architecture', icon: Layers },
              { label: 'TypeScript & Next.js', icon: Code2 },
              { label: 'Developer Tooling', icon: Terminal },
            ].map((tag) => {
              const Icon = tag.icon;
              return (
                <motion.span
                  key={tag.label}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springBounce}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-neutral-200/90 text-neutral-700 text-xs font-medium shadow-xs hover:border-sky-300 hover:text-sky-950 transition-colors cursor-default select-none"
                >
                  <Icon className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{tag.label}</span>
                </motion.span>
              );
            })}
          </motion.div>

          {/* Interactive Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: appleEase }}
            className="pt-3 flex flex-col items-center justify-center gap-3.5"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
              {/* Primary Action Button: Solid Black (Secondary Color) */}
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                onClick={() => scrollTo('request-kit')}
                className="relative group overflow-hidden w-full sm:w-auto px-7 py-3.5 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {/* Apple-style subtle light sheen reflection on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                <span>Request Full Media Kit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              {/* Secondary Button: Crisp White */}
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                onClick={() => scrollTo('videos')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
              >
                View Recent Videos
              </motion.button>
            </div>

            {/* Monthly Sponsor Availability Pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03, y: -1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-300/80 text-emerald-800 text-xs font-semibold shadow-xs cursor-default"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Status: Accepting 2–3 sponsors/month</span>
              <span className="text-emerald-400">•</span>
              <span className="text-emerald-950 font-bold bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">1 slot remaining</span>
            </motion.div>
          </motion.div>
        </section>

        {/* ========================================================= */}
        {/* 2. VERIFIED VIDEO SHOWCASE (PUBLIC VIEW COUNTS ONLY) */}
        {/* ========================================================= */}
        <section id="videos" className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 2xl:py-24 space-y-8 2xl:space-y-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-sky-50 border border-sky-200/90 text-sky-800 text-xs font-semibold mb-2">
                Production Portfolio
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
                Featured Technical &amp; Business Guides
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
                Real videos produced for the Amidia channel featuring verifiable public view counts, practical business applications, AI agent automations, and hands-on code breakdowns.
              </p>
            </div>

            <motion.a
              whileHover={{ scale: 1.04, x: 2 }}
              whileTap={{ scale: 0.96 }}
              href="https://www.youtube.com/@amidia-ai-tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-sky-600 font-semibold transition-colors"
            >
              <span>Visit YouTube Channel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </motion.a>
          </motion.div>

          {loadingVideos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-neutral-200 rounded-3xl h-60 animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {videos.map((vid, idx) => (
                <motion.div
                  key={vid.id}
                  variants={fadeInUp}
                  custom={idx}
                  whileHover={{ y: -6, transition: { duration: 0.3, ease: appleEase } }}
                >
                  <AppleCard className="h-full">
                    <a
                      href={`https://www.youtube.com/watch?v=${vid.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col h-full cursor-pointer"
                    >
                      <div className="relative aspect-video bg-neutral-100 overflow-hidden">
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        />
                        {/* Play button hover overlay with Apple fluid spring */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <motion.div
                            initial={false}
                            className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-white/60 shadow-xl flex items-center justify-center text-neutral-950 group-hover:scale-110 transition-transform duration-300"
                          >
                            <Play className="w-5 h-5 fill-neutral-950 translate-x-0.5" />
                          </motion.div>
                        </div>
                        {vid.duration && (
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                            {vid.duration}
                          </div>
                        )}
                        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold text-white flex items-center gap-1.5 border border-white/10 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>
                            {vid.viewCount
                              ? `${Number(vid.viewCount).toLocaleString()} views`
                              : 'Watch on YouTube'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-1.5 flex-1 flex flex-col justify-start">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block">
                          {vid.publishedAt
                            ? new Date(vid.publishedAt).toLocaleDateString()
                            : 'Recent Upload'}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-950 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                          {vid.title}
                        </h3>
                      </div>
                    </a>
                  </AppleCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 3. SPONSORSHIP FORMATS (APPLE BENTO GRID SHOWCASE) */}
        {/* ========================================================= */}
        <section id="formats" className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-16 2xl:py-24 space-y-8 2xl:space-y-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            className="text-center space-y-2 max-w-2xl mx-auto"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-sky-50 border border-sky-200/90 text-sky-800 text-xs font-semibold">
              Sponsorship Formats
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
              Sponsorship Formats
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Tailored video sponsorships designed to showcase developer tools, SaaS platforms, and AI-powered business software in real production workflows, solving concrete engineering and business challenges without fluff.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
          >
            {/* Format 1: Dedicated Video (Azure Accent Card) */}
            <motion.div variants={fadeInUp} custom={0}>
              <AppleCard
                className="p-7 sm:p-8 flex flex-col justify-between h-full group bg-gradient-to-b from-sky-50/25 to-white border-sky-200/90 hover:border-sky-400 hover:shadow-[0_12px_36px_rgba(2,132,199,0.08)]"
                spotlightColor="rgba(2, 132, 199, 0.08)"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <motion.div
                      whileHover={{ rotate: 8, scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 shadow-xs"
                    >
                      <Video className="w-5 h-5" />
                    </motion.div>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold uppercase tracking-wider">
                      Flagship Format
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-950">Dedicated Deep-Dive Video</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    A complete 10–18 minute standalone guide dedicated entirely to your platform, developer SDK, or business AI solution. We build a full, end-to-end working application or automated workflow demonstrating real production utility and business value.
                  </p>
                  <div className="pt-2 space-y-2 text-xs text-neutral-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Complete setup &amp; live architecture coding</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Custom GitHub repository &amp; business templates included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Pinned comment + description top links</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-sky-100/80 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => scrollTo('request-kit')}
                    className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-white transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Inquire About Availability</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </AppleCard>
            </motion.div>

            {/* Format 2: Integrated Segment */}
            <motion.div variants={fadeInUp} custom={1}>
              <AppleCard className="p-7 sm:p-8 flex flex-col justify-between h-full group">
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-950 shadow-xs"
                  >
                    <Layers className="w-5 h-5" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-neutral-950">Integrated Segment (60–90s)</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    A high-retention 60 to 90-second mid-roll organically woven into a broader technical or business automation topic (e.g. AI agents, workflow scaling, authentication, or cloud deployment).
                  </p>
                  <div className="pt-2 space-y-2 text-xs text-neutral-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Contextual problem-to-solution narrative</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>On-screen product walkthrough + clear CTA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Dedicated UTM tracking link in description</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => scrollTo('request-kit')}
                    className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-white transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Inquire About Availability</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </AppleCard>
            </motion.div>
          </motion.div>
        </section>

        {/* ========================================================= */}
        {/* 4. WHO THIS CHANNEL IS FOR: APPLE BENTO AUDIENCE CARDS */}
        {/* ========================================================= */}
        <section className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-14 2xl:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            className="bg-white border border-neutral-200/90 rounded-3xl p-8 sm:p-12 2xl:p-16 space-y-8 2xl:space-y-10 shadow-sm"
          >
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-sky-50 border border-sky-200/90 text-sky-800 text-xs font-semibold mb-2">
                Audience Profile
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
                Who This Channel Is For
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
                The Amidia audience consists of active builders, software engineers, tech founders, and business operators who watch specifically to evaluate modern AI tools and implement scalable business systems.
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2"
            >
              <motion.div
                variants={fadeInUp}
                custom={0}
                whileHover={{ y: -6, transition: { duration: 0.3, ease: appleEase } }}
                className="group p-6 rounded-2xl bg-gradient-to-b from-sky-50/50 to-white border border-sky-200/80 space-y-3 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-neutral-950 text-sm font-bold">
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.15 }}
                      transition={springBounce}
                      className="w-7 h-7 rounded-lg bg-sky-100/80 flex items-center justify-center text-sky-600 shadow-xs"
                    >
                      <Code2 className="w-4 h-4" />
                    </motion.div>
                    <span>Developers &amp; Engineers</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Programmers looking for pragmatic implementations of TypeScript, Next.js, Python AI scripts, and modern API architectures.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {['TypeScript', 'Next.js', 'APIs'].map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-sky-200/80 text-sky-800 group-hover:border-sky-300 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                custom={1}
                whileHover={{ y: -6, transition: { duration: 0.3, ease: appleEase } }}
                className="group p-6 rounded-2xl bg-neutral-50/80 border border-neutral-200/70 space-y-3 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-neutral-950 text-sm font-bold">
                    <motion.div
                      whileHover={{ rotate: -12, scale: 1.15 }}
                      transition={springBounce}
                      className="w-7 h-7 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-xs"
                    >
                      <Briefcase className="w-4 h-4" />
                    </motion.div>
                    <span>Founders &amp; Business Operators</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Entrepreneurs, agency owners, and tech leaders looking to leverage AI agents, automate business workflows, and scale software-driven ventures.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {['AI Agents', 'Automation', 'Workflows'].map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-emerald-200/80 text-emerald-800 group-hover:border-emerald-300 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                custom={2}
                whileHover={{ y: -6, transition: { duration: 0.3, ease: appleEase } }}
                className="group p-6 rounded-2xl bg-neutral-50/80 border border-neutral-200/70 space-y-3 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-neutral-950 text-sm font-bold">
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.15 }}
                      transition={springBounce}
                      className="w-7 h-7 rounded-lg bg-purple-100/80 flex items-center justify-center text-purple-600 shadow-xs"
                    >
                      <Cpu className="w-4 h-4" />
                    </motion.div>
                    <span>AI &amp; Automation Evaluators</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Engineers and decision-makers seeking honest breakdowns of LLM providers, agentic frameworks, dev assistance tools, and modern business productivity setups.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {['LLMs', 'Benchmarking', 'SaaS'].map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-purple-200/80 text-purple-800 group-hover:border-purple-300 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ========================================================= */}
        {/* 5. REQUEST FULL MEDIA KIT CTA (APPLE PROMINENT CARD) */}
        {/* ========================================================= */}
        <section id="request-kit" className="max-w-3xl 2xl:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-20 2xl:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={appleScale}
            className="relative bg-white border border-neutral-200/90 rounded-3xl p-8 sm:p-14 2xl:p-16 shadow-xl space-y-8 text-center overflow-hidden"
          >
            {/* Subtle Apple-style Ambient Spotlight behind card with gentle breathing glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-sky-200/50 via-sky-100/20 to-transparent blur-3xl pointer-events-none animate-pulse" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/90 text-sky-950 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Gated Partner Access</span>
              </div>

              {/* Booking Availability Notice with Live Radar Beacon */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300/80 text-emerald-800 text-xs font-semibold shadow-xs cursor-default"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Accepting 2–3 sponsors/month</span>
                <span className="text-emerald-400">•</span>
                <span className="text-emerald-950 font-bold bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">1 slot remaining</span>
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight">
                  Want the full sponsorship media kit?
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
                  For private analytics, audience demographics, business &amp; developer reach, verified rate cards, and YouTube Studio proofs, request access by email.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                {/* Primary Action: mailto:sajid@amidia.in */}
                <motion.a
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  href="mailto:sajid@amidia.in?subject=Sponsorship%20Media%20Kit%20Request"
                  className="relative group overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                  <Mail className="w-4 h-4" />
                  <span>Request Full Media Kit</span>
                </motion.a>

                {/* Copy Email Button with Apple Spring Pop Feedback */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  onClick={copyEmailAddress}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-200"
                  title="Copy email to clipboard"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copiedEmail ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 text-emerald-700 font-bold"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Copied sajid@amidia.in</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 text-neutral-700"
                      >
                        <Copy className="w-4 h-4 text-neutral-500" />
                        <span>Copy sajid@amidia.in</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                <span>Verified partner token links are dispatched directly — no account or login required for sponsors.</span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-neutral-200 bg-white py-12 2xl:py-16 px-4 sm:px-6 lg:px-8 2xl:px-12 text-center text-xs text-neutral-500">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center justify-center gap-1">
            <Link
              to="/admin"
              title="Protected Management Portal"
              className="text-neutral-400 hover:text-neutral-700 transition-colors inline-block cursor-default select-none focus:outline-none"
              tabIndex={0}
              aria-label="Admin Portal"
            >
              ©
            </Link>
            <span>{new Date().getFullYear()} Amidia AI &amp; Tech. All rights reserved.</span>
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://www.youtube.com/@amidia-ai-tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-neutral-950 font-semibold transition-colors"
            >
              YouTube: @amidia-ai-tech
            </a>
            <span>•</span>
            <a
              href="mailto:sajid@amidia.in"
              className="text-neutral-700 hover:text-neutral-950 font-semibold transition-colors"
            >
              sajid@amidia.in
            </a>
            <span className="text-neutral-300 select-none">•</span>
            {/* Discrete hidden portal dot at the very bottom corner */}
            <Link
              to="/admin"
              title="System Portal"
              aria-label="System Portal"
              className="w-1.5 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-500 transition-all opacity-40 hover:opacity-100 cursor-pointer"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
