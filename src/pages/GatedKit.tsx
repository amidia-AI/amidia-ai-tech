import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Video,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  Send,
  Lightbulb,
  Ban,
  Scale,
  FileSignature,
  Copy,
  Check,
  X,
  Play,
} from 'lucide-react';
import { StudioScreenshot, VideoIdea } from '../types';
import { ClientLogo } from '../components/ClientLogo';
import { AgeGenderDemographics } from '../components/AgeGenderDemographics';
import { fetchPublicVideos, YouTubeVideoItem } from '../services/youtube';
import { appleEase, fadeInUp, staggerContainer, softSpring, springBounce, appleScale } from '../utils/motion';

interface GatedKitData {
  brandName: string;
  company?: string;
  preparedMonthYear: string;
  expiresAt?: string;
  screenshots: StudioScreenshot[];
  videoIdeas?: VideoIdea[];
  rateCard: {
    dedicatedVideo: string;
    integratedSegment: string;
    commercialUsageRights60Day: string;
  };
  turnaround: string;
  availability: string;
  retentionAndCtr: {
    retention: string;
    ctr: string;
  };
}

export const DEFAULT_VERIFIED_SCREENSHOTS: StudioScreenshot[] = [
  {
    id: 'proof-age-gender',
    label: 'YouTube Studio Age & Gender Demographics Proof',
    imageUrl: '/age-gender.jpeg',
    category: 'demographics',
    monthYear: '',
    createdAt: '2026-09-19T08:00:00.000Z',
  },
  {
    id: 'proof-geography',
    label: 'YouTube Studio Top Geography & Country Distribution Proof',
    imageUrl: '/geography.jpeg',
    category: 'geography',
    monthYear: '',
    createdAt: '2026-09-19T08:00:00.000Z',
  },
  {
    id: 'proof-monthly-audience',
    label: 'YouTube Studio Monthly Audience Reach & Growth Proof',
    imageUrl: '/monthly-audience.jpeg',
    category: 'reach',
    monthYear: '',
    createdAt: '2026-09-19T08:00:00.000Z',
  },
  {
    id: 'proof-avd',
    label: 'YouTube Studio Average View Duration & Retention Proof',
    imageUrl: '/avd.jpeg',
    category: 'retention',
    monthYear: '',
    createdAt: '2026-09-19T08:00:00.000Z',
  },
  {
    id: 'proof-cta',
    label: 'YouTube Studio Impressions Click-Through Rate (CTR) Proof',
    imageUrl: '/cta.jpeg',
    category: 'retention',
    monthYear: '',
    createdAt: '2026-09-19T08:00:00.000Z',
  },
];

export function GatedKit() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<GatedKitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [is404, setIs404] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<StudioScreenshot | null>(null);
  const [sponsorVideos, setSponsorVideos] = useState<YouTubeVideoItem[]>([]);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyEmailAddress = async () => {
    try {
      await navigator.clipboard?.writeText('sajid@amidia.in');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Clipboard is unavailable (insecure context or denied permission) - the address stays visible on the button.
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedScreenshot(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const activeScreenshots: StudioScreenshot[] =
    data?.screenshots && data.screenshots.length > 0
      ? data.screenshots
      : DEFAULT_VERIFIED_SCREENSHOTS.map((s) => ({ ...s, monthYear: currentMonthYear }));

  useEffect(() => {
    const fetchKit = async () => {
      if (!token) {
        setIs404(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/kit/${token}`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.success) {
            setData(resData);
            return;
          }
        }

        // Resilient fallback for static deployments (Cloudflare Pages, Vercel, Netlify)
        const localTokensStr = localStorage.getItem('amidia_gated_tokens');
        if (localTokensStr) {
          const localTokens = JSON.parse(localTokensStr);
          const matched = Array.isArray(localTokens)
            ? localTokens.find((t: any) => (t.token === token || t.id === token) && !t.revoked)
            : null;

          if (matched) {
            const expTime = matched.expiresAt ? new Date(matched.expiresAt).getTime() : Infinity;
            if (isNaN(expTime) || expTime >= Date.now()) {
              const localScreenshots = JSON.parse(localStorage.getItem('amidia_studio_screenshots') || '[]');
              const localIdeas = JSON.parse(localStorage.getItem('amidia_video_ideas') || '[]');
              const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

              setData({
                brandName: matched.brandName || matched.company || 'Partner Brand',
                company: matched.company || matched.brandName || '',
                preparedMonthYear: monthYear,
                expiresAt: matched.expiresAt,
                screenshots: localScreenshots.map((s: any) => ({ ...s, monthYear })),
                videoIdeas: localIdeas,
                rateCard: {
                  dedicatedVideo: `$${matched.dedicatedPrice || 1200}`,
                  integratedSegment: `$${matched.integratedPrice || 600}`,
                  commercialUsageRights60Day: `+$${matched.commercialUsagePrice || 350}`,
                },
                turnaround: '5-7 business days for Integrated, 10-14 business days for Dedicated',
                availability: 'Accepting 2–3 sponsors/month • 1 slot remaining',
                retentionAndCtr: {
                  retention: '[NEEDS REAL DATA]',
                  ctr: '[NEEDS REAL DATA]',
                },
              });
              return;
            }
          }
        }

        setIs404(true);
      } catch (err) {
        console.error('Error fetching gated kit:', err);
        // Secondary try from localStorage
        try {
          const localTokensStr = localStorage.getItem('amidia_gated_tokens');
          if (localTokensStr) {
            const localTokens = JSON.parse(localTokensStr);
            const matched = Array.isArray(localTokens)
              ? localTokens.find((t: any) => (t.token === token || t.id === token) && !t.revoked)
              : null;
            if (matched) {
              const localScreenshots = JSON.parse(localStorage.getItem('amidia_studio_screenshots') || '[]');
              const localIdeas = JSON.parse(localStorage.getItem('amidia_video_ideas') || '[]');
              const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              setData({
                brandName: matched.brandName || matched.company || 'Partner Brand',
                company: matched.company || matched.brandName || '',
                preparedMonthYear: monthYear,
                expiresAt: matched.expiresAt,
                screenshots: localScreenshots.map((s: any) => ({ ...s, monthYear })),
                videoIdeas: localIdeas,
                rateCard: {
                  dedicatedVideo: `$${matched.dedicatedPrice || 1200}`,
                  integratedSegment: `$${matched.integratedPrice || 600}`,
                  commercialUsageRights60Day: `+$${matched.commercialUsagePrice || 350}`,
                },
                turnaround: '5-7 business days for Integrated, 10-14 business days for Dedicated',
                availability: 'Accepting 2–3 sponsors/month • 1 slot remaining',
                retentionAndCtr: {
                  retention: '[NEEDS REAL DATA]',
                  ctr: '[NEEDS REAL DATA]',
                },
              });
              return;
            }
          }
        } catch (e) {}

        setIs404(true);
      } finally {
        setLoading(false);
      }
    };
    
    const loadVideos = async () => {
      try {
        const videoList = await fetchPublicVideos();
        if (videoList && videoList.length > 0) {
          const found = videoList.filter(v => {
            const desc = v.description.toLowerCase();
            const title = v.title.toLowerCase();
            const combined = desc + " " + title;
            return combined.includes('topview') || combined.includes('coderabbit') || combined.includes('abacus');
          });
          setSponsorVideos(found);
        }
      } catch (err) {
        console.warn('Notice loading public YouTube videos:', err);
      }
    };
    
    fetchKit();
    loadVideos();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-neutral-200 border-t-neutral-950 animate-spin" />
        <p className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">
          Verifying security token...
        </p>
      </div>
    );
  }

  // Real 404 on bad or expired token
  if (is404 || !data) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col justify-center items-center py-16 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-neutral-200 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-900 flex items-center justify-center mb-6">
            <Lock className="w-6 h-6" />
          </div>

          <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">
            HTTP 404 — Not Found
          </span>
          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight mb-2">
            Media Kit Link Expired or Invalid
          </h1>
          <p className="text-xs text-neutral-600 mb-8 leading-relaxed">
            This private media kit token is either expired, has been revoked, or does not exist. To request a fresh access link, please contact us by email at <span className="font-semibold text-neutral-900">sajid@amidia.in</span>.
          </p>

          <Link
            to="/"
            className="w-full py-3.5 px-5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Media Kit</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Background Soft Subtle Ambient Azure Glow (eliminates pale look without overdoing it) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[520px] bg-gradient-to-b from-sky-100/40 via-sky-50/15 to-transparent blur-[140px]" />
      </div>

      {/* Top Floating Security Pill (Dark Navbar style as Secondary Accent) */}
      <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 bg-[#161616] text-white px-4 py-2 rounded-full border border-neutral-800 shadow-[0_16px_40px_rgba(0,0,0,0.2)] text-xs">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-semibold text-neutral-200">
            Private Media Kit Gated View
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-300 font-mono text-[11px]">
            {data.brandName}
          </span>
        </div>
      </div>

      <main className="relative z-10 max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-24 sm:pt-28 2xl:pt-36 pb-24 2xl:pb-32 space-y-12 2xl:space-y-16">
        {/* Header Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center space-y-4 pt-6"
        >
          <motion.div
            variants={fadeInUp}
            custom={0}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50/90 border border-sky-200/90 text-sky-950 text-xs font-semibold tracking-wide shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Confidential Partner Briefing</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            custom={1}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-neutral-950 tracking-tight leading-[1.1]"
          >
            Prepared for {data.brandName}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            custom={2}
            className="text-sm sm:text-base text-neutral-600 font-medium"
          >
            {currentMonthYear} • Amidia AI &amp; Tech Sponsorship Architecture
          </motion.p>

          <motion.div
            variants={fadeInUp}
            custom={3}
            whileHover={{ scale: 1.03 }}
            transition={softSpring}
            className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300/80 text-emerald-800 text-xs font-semibold mt-2 shadow-xs cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Status: Accepting 2–3 sponsors/month</span>
            <span className="text-emerald-400">•</span>
            <span className="text-emerald-900 font-bold bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
              1 slot remaining
            </span>
          </motion.div>
        </motion.section>

        {/* Past Sponsor Integrations */}
        {sponsorVideos.length > 0 && (
          <section className="space-y-4 pt-4 pb-8 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-950 tracking-tight flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>Recent Sponsored Work</span>
                </h2>
                <p className="text-xs text-neutral-600 mt-0.5">
                  See how we seamlessly integrate our partners into high-performing technical content.
                </p>
              </div>
            </div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4"
            >
              {sponsorVideos.map((vid, idx) => {
                let brandTag = '';
                const combined = (vid.title + " " + vid.description).toLowerCase();
                if (combined.includes('abacus')) brandTag = 'Abacus AI';
                else if (combined.includes('coderabbit')) brandTag = 'CodeRabbit';
                else if (combined.includes('topview')) brandTag = 'TopView AI';
                
                return (
                  <motion.a
                    key={vid.id}
                    variants={fadeInUp}
                    custom={idx}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={softSpring}
                    href={`https://www.youtube.com/watch?v=${vid.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col bg-gradient-to-b from-sky-50/50 via-white to-white border border-sky-200/80 rounded-2xl overflow-hidden hover:border-sky-400 hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-video bg-neutral-100 overflow-hidden">
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-current ml-0.5 text-neutral-950" />
                        </div>
                      </div>
                      {brandTag && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded flex items-center bg-indigo-600 text-[9px] font-bold text-white uppercase tracking-wider shadow-xs">
                          Sponsored by {brandTag}
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-start">
                      <h3 className="text-xs font-bold text-neutral-900 leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors">
                        {vid.title}
                      </h3>
                    </div>
                  </motion.a>
                );
              })}
            </motion.div>
          </section>
        )}

        {/* Analytics (Placed Above Pricing) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-950 tracking-tight flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
              <span>
                <span className="text-sky-500 font-extrabold">Analytics</span> updated every month
              </span>
            </h2>
          </div>

          <AgeGenderDemographics
            screenshots={activeScreenshots}
            onOpenScreenshot={(s) => setSelectedScreenshot(s)}
          />
        </section>

        {/* Section 1: Exact Rate Card - Each card with distinct color identity */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-950 tracking-tight flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-neutral-950" />
              <span>Commercial Rate Card</span>
            </h2>
            <span className="text-xs text-neutral-500 font-mono">Guaranteed 30-day quote</span>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {/* Rate 1: Dedicated Video (Azure Sky Accent Card) */}
            <motion.div
              variants={fadeInUp}
              custom={0}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={springBounce}
              className="relative bg-gradient-to-b from-sky-50/70 via-sky-50/20 to-white border border-sky-300/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-sky-500 hover:shadow-[0_16px_40px_rgba(2,132,199,0.14)] transition-all group overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-3 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs"
                >
                  <span>★</span>
                  <span>Full Feature</span>
                </motion.div>
                <h3 className="text-lg font-bold text-neutral-950">Dedicated Deep-Dive Video</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  A standalone 10–18 minute comprehensive build or review focusing 100% on your developer tool, SDK, or AI workflow.
                </p>
                <div className="pt-4 border-t border-sky-100">
                  <div className="text-3xl font-black text-sky-950 font-mono tracking-tight">{data.rateCard.dedicatedVideo}</div>
                  <span className="text-[11px] text-sky-700/80 font-medium">flat rate per produced video</span>
                </div>
              </div>
              <div className="space-y-4 pt-6 relative z-10">
                <ul className="space-y-2.5 text-xs text-neutral-700 border-t border-sky-100 pt-4">
                  <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Full product installation &amp; architecture walk-through</span>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Pinned top comment + link in top 2 lines of description</span>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Permanent indexation on Amidia channel</span>
                  </motion.li>
                </ul>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`mailto:sajid@amidia.in?subject=Amidia%20Booking%20—%20Dedicated%20Video%20(${encodeURIComponent(data.brandName)})`}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                >
                  <span>Inquire for Dedicated Video</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </motion.a>
              </div>
            </motion.div>

            {/* Rate 2: Integrated Segment (Royal Indigo / Violet Card) */}
            <motion.div
              variants={fadeInUp}
              custom={1}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={springBounce}
              className="relative bg-gradient-to-b from-indigo-50/70 via-indigo-50/20 to-white border border-indigo-300/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500 hover:shadow-[0_16px_40px_rgba(99,102,241,0.14)] transition-all group overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-200/40 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-3 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs"
                >
                  <span>High Impact</span>
                </motion.div>
                <h3 className="text-lg font-bold text-neutral-950">Integrated Segment (60–90s)</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  A seamless mid-roll or organic problem-solving showcase embedded directly into a major architectural tutorial.
                </p>
                <div className="pt-4 border-t border-indigo-100">
                  <div className="text-3xl font-black text-indigo-950 font-mono tracking-tight">{data.rateCard.integratedSegment}</div>
                  <span className="text-[11px] text-indigo-700/80 font-medium">flat rate per segment placement</span>
                </div>
              </div>
              <div className="space-y-4 pt-6 relative z-10">
                <ul className="space-y-2.5 text-xs text-neutral-700 border-t border-indigo-100 pt-4">
                  <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Native transition matching video narrative</span>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Dedicated CTA slide + custom referral coupon/link</span>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Pinned comment with direct UTM parameters</span>
                  </motion.li>
                </ul>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`mailto:sajid@amidia.in?subject=Amidia%20Booking%20—%20Integrated%20Segment%20(${encodeURIComponent(data.brandName)})`}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                >
                  <span>Inquire for Integrated Segment</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </motion.a>
              </div>
            </motion.div>

            {/* Rate 3: Commercial Usage Rights (Warm Amber Card) */}
            <motion.div
              variants={fadeInUp}
              custom={2}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={springBounce}
              className="relative bg-gradient-to-b from-amber-50/70 via-amber-50/20 to-white border border-amber-300/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-amber-500 hover:shadow-[0_16px_40px_rgba(245,158,11,0.14)] transition-all group overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-3 relative z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs"
                >
                  <span>Add-On</span>
                </motion.div>
                <h3 className="text-lg font-bold text-neutral-950">Commercial Usage Rights</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  60-day paid advertising &amp; whitelisting rights to cut, run, and repurpose video segments on your brand social channels and landing pages.
                </p>
                <div className="pt-4 border-t border-amber-100">
                  <div className="text-3xl font-black text-amber-950 font-mono tracking-tight">{data.rateCard.commercialUsageRights60Day}</div>
                  <span className="text-[11px] text-amber-750 font-medium">add-on license</span>
                </div>
              </div>
              <div className="space-y-4 pt-6 relative z-10">
                <ul className="space-y-2.5 text-xs text-neutral-700 border-t border-amber-100 pt-4">
                  <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Clean 4K raw video file delivery</span>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>No creator watermarks on raw cut</span>
                  </motion.li>
                  <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Meta / LinkedIn / X advertising permission</span>
                  </motion.li>
                </ul>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`mailto:sajid@amidia.in?subject=Amidia%20Booking%20—%20Commercial%20Usage%20Rights%20(${encodeURIComponent(data.brandName)})`}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                >
                  <span>Add Usage Rights</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Section: Upcoming Video Concepts & Sponsorship Opportunities */}
        {data.videoIdeas && data.videoIdeas.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950 tracking-tight flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                <span>Upcoming Video Ideas (Open for Sponsorship)</span>
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                Topics currently in pre-production or research. If your product solves a problem related to one of these titles, let us know to lock in a sponsorship.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {data.videoIdeas.map((idea, idx) => (
                <motion.div
                  key={idea.id}
                  variants={fadeInUp}
                  custom={idx}
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={softSpring}
                  className={`relative rounded-2xl p-5 transition-all flex flex-col justify-between shadow-xs overflow-hidden ${
                    idea.isBooked
                      ? 'bg-neutral-50/80 border border-neutral-200'
                      : 'bg-gradient-to-b from-sky-50/60 via-sky-50/15 to-white border border-sky-200/90 hover:border-sky-400 hover:shadow-[0_12px_30px_rgba(2,132,199,0.1)]'
                  }`}
                >
                  {!idea.isBooked && (
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-200/30 rounded-full blur-xl pointer-events-none" />
                  )}
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-2">
                      {idea.isBooked ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          🔒 Booked
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                          </span>
                          Open for Sponsorship
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-bold leading-snug ${idea.isBooked ? 'text-neutral-700' : 'text-neutral-950'}`}>
                      {idea.title}
                    </h3>
                    {idea.description && (
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {idea.description}
                      </p>
                    )}
                  </div>
                  <div className="pt-4 mt-2 border-t border-neutral-100 flex items-center justify-between">
                    {idea.isBooked ? (
                      <>
                        <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                          Booked for Sponsorship
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-200/70 text-neutral-600 font-semibold">
                          Slot Reserved
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          Available for Sponsorship
                        </span>
                        <motion.a
                          whileHover={{ x: 2 }}
                          href={`mailto:sajid@amidia.in?subject=${encodeURIComponent(
                            `Amidia Partnership: Sponsorship for "${idea.title}" (${data.brandName})`
                          )}`}
                          className="text-xs font-bold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1 cursor-pointer transition-colors group/link"
                        >
                          <span>Request this video</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                        </motion.a>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Section 3: Standard Turnaround Times & Deliverables Checklist */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            transition={softSpring}
            className="relative bg-gradient-to-b from-sky-50/70 via-sky-50/15 to-white border border-sky-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-200/35 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2 relative z-10">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Standard Turnaround Times</span>
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed relative z-10">
              We operate on an agile, predictable production cycle ensuring your engineering campaign hits product release timelines with zero drama.
            </p>
            <div className="space-y-2.5 pt-2 text-xs relative z-10">
              <motion.div whileHover={{ x: 4, scale: 1.01 }} className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-sky-100 shadow-xs transition-transform">
                <span className="text-neutral-700 font-medium">Integrated Segment (60–90s)</span>
                <span className="font-bold text-neutral-950 font-mono">5–7 Business Days</span>
              </motion.div>
              <motion.div whileHover={{ x: 4, scale: 1.01 }} className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-sky-100 shadow-xs transition-transform">
                <span className="text-neutral-700 font-medium">Dedicated Build Video (10–18m)</span>
                <span className="font-bold text-neutral-950 font-mono">10–14 Business Days</span>
              </motion.div>
              <motion.div whileHover={{ x: 4, scale: 1.01 }} className="flex items-center justify-between p-3 rounded-xl bg-white/90 border border-sky-100 shadow-xs transition-transform">
                <span className="text-neutral-700 font-medium">Sponsor Feedback &amp; Revisions</span>
                <span className="font-bold text-neutral-950 font-mono">48 Hours Turnaround</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={softSpring}
            className="relative bg-gradient-to-b from-sky-50/70 via-sky-50/15 to-white border border-sky-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-200/35 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2 relative z-10">
              <FileCheck className="w-4 h-4 text-sky-600" />
              <span>Standard Deliverables Checklist</span>
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed relative z-10">
              Every partnership includes full pre-publication review and verifiable campaign assets.
            </p>
            <ul className="space-y-2.5 pt-2 text-xs text-neutral-700 relative z-10">
              <motion.li whileHover={{ x: 4 }} className="flex items-start gap-2.5 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Private unlisted preview link sent 48 hours prior to public release</span>
              </motion.li>
              <motion.li whileHover={{ x: 4 }} className="flex items-start gap-2.5 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>One round of factual/technical edits included in rate card</span>
              </motion.li>
              <motion.li whileHover={{ x: 4 }} className="flex items-start gap-2.5 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Custom UTM link placement in top two lines of YouTube description</span>
              </motion.li>
              <motion.li whileHover={{ x: 4 }} className="flex items-start gap-2.5 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Pinned comment highlighting brand offer/code for minimum 30 days</span>
              </motion.li>
            </ul>
          </motion.div>
        </section>

        {/* Section: Partnership Requirements & Terms */}
        <motion.section
          whileHover={{ y: -2 }}
          transition={softSpring}
          className="relative bg-gradient-to-b from-sky-50/70 via-sky-50/15 to-white border border-sky-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-sky-200/35 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-950">Partnership Terms &amp; Production Requirements</h3>
              <p className="text-xs text-neutral-600 mt-0.5">Clear guidelines to protect brand ROI, audience trust, and production timelines.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 text-xs">
            {/* Term 1: 50/50 Payment Split */}
            <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-4 rounded-2xl bg-white/90 border border-sky-100 shadow-xs space-y-1.5 transition-all">
              <div className="flex items-center gap-2 text-neutral-950 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>50/50 Payment Split</span>
              </div>
              <p className="text-neutral-600 leading-relaxed pl-4">
                50% deposit upfront to lock the production and calendar slot, with the remaining 50% due upon unlisted draft approval prior to public release.
              </p>
            </motion.div>

            {/* Term 2: No Whitelisting */}
            <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-4 rounded-2xl bg-white/90 border border-sky-100 shadow-xs space-y-1.5 transition-all">
              <div className="flex items-center gap-2 text-neutral-950 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>No Whitelisting</span>
              </div>
              <p className="text-neutral-600 leading-relaxed pl-4">
                We do not offer channel whitelisting or ad-account access under any circumstances to preserve audience integrity and channel security.
              </p>
            </motion.div>

            {/* Term 3: Content Reuse / Repurposing */}
            <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-4 rounded-2xl bg-white/90 border border-sky-100 shadow-xs space-y-1.5 transition-all">
              <div className="flex items-center gap-2 text-neutral-950 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Usage &amp; Repurposing Rights</span>
              </div>
              <p className="text-neutral-600 leading-relaxed pl-4">
                No content reuse or paid repurposing rights included by default. 60-day digital usage rights can be added for an extra licensing fee upon request.
              </p>
            </motion.div>

            {/* Term 4: Contract with Payment Protection */}
            <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-4 rounded-2xl bg-white/90 border border-sky-100 shadow-xs space-y-1.5 transition-all">
              <div className="flex items-center gap-2 text-neutral-950 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Contract &amp; Payment Protection</span>
              </div>
              <p className="text-neutral-600 leading-relaxed pl-4">
                A formal contract is strictly required with an explicit payment clause and standard protection terms (including video unlist policies for defaulted or non-payment).
              </p>
            </motion.div>

            {/* Term 5: Creative Format / Live Reaction (Full width on md) */}
            <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-4 rounded-2xl bg-white/90 border border-sky-100 shadow-xs space-y-1.5 md:col-span-2 transition-all">
              <div className="flex items-center gap-2 text-neutral-950 font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Creative Format: Authentic Live Reactions</span>
              </div>
              <p className="text-neutral-600 leading-relaxed pl-4">
                I strongly prefer trying the product on camera with genuine live reactions and honest hands-on demonstration over rigid, fully scripted reads. However, scripted reads can be accommodated if the brand supplies clear talking points or video reference examples.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Section 4: Next Steps & Booking Inquiry (Black secondary emphasis card) */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={appleScale}
          className="relative bg-neutral-950 text-white border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl overflow-hidden"
        >
          {/* Ambient Spotlight */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-sky-400/25 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Direct Production Access</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to secure a campaign slot for {data.brandName}?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
              Reply directly to your personalized access email or reach out to initiate project scoping and lock in your target publishing date.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <motion.a
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              href={`mailto:sajid@amidia.in?subject=Amidia%20Partnership%20Booking%20—%20${encodeURIComponent(data.brandName)}`}
              className="relative group overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-neutral-950 text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-100"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-neutral-200/40 to-transparent pointer-events-none" />
              <Send className="w-4 h-4" />
              <span>Confirm Booking via Email</span>
            </motion.a>

            {/* Copy Email Button with Tactile Feedback */}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={copyEmailAddress}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-800"
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
                    className="flex items-center gap-2 text-emerald-400 font-bold"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied sajid@amidia.in</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 text-neutral-300"
                  >
                    <Copy className="w-4 h-4 text-neutral-400" />
                    <span>Copy sajid@amidia.in</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.section>
      </main>

      {/* Screenshot Modal Lightbox with Smooth Spring Animation */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelectedScreenshot(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={springBounce}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xl cursor-default"
            >
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-950">{selectedScreenshot.label}</h4>
                  <p className="text-xs text-neutral-500 font-medium">{currentMonthYear}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedScreenshot(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </motion.button>
              </div>
              <div className="p-2 bg-neutral-950 flex items-center justify-center">
                <img
                  src={selectedScreenshot.imageUrl}
                  alt={selectedScreenshot.label}
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
