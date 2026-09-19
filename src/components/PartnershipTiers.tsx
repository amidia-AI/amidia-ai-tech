import React from 'react';
import { Video, Sparkles, Zap, Shield, Check, Clock, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Tier {
  id: string;
  name: string;
  badge: string;
  popular?: boolean;
  description: string;
  turnaround: string;
  features: string[];
  deliverables: string;
}

const TIERS: Tier[] = [
  {
    id: 'integrated',
    name: 'Integrated 60-90s Segment',
    badge: 'High Conversion',
    popular: true,
    description: 'A seamless, organically scripted mid-roll integration showcasing your product directly within high-impact technical workflow videos.',
    turnaround: '5-7 business days',
    features: [
      '60-90s Dedicated mid-roll sponsorship segment',
      'Verbal CTA & pinned link in top description comment',
      'Permanent evergreen inclusion (never removed)',
      'Direct link tracking & UTM conversion attribution',
      'Pre-screening rough cut approval before publish',
    ],
    deliverables: '1 YouTube Video Integration + Social Reposts',
  },
  {
    id: 'dedicated',
    name: 'Dedicated Deep-Dive Video',
    badge: 'Maximum Authority',
    popular: false,
    description: 'An entire 12-18 minute video built around solving a core problem with your platform, architecture, or software product.',
    turnaround: '10-14 business days',
    features: [
      'Full 100% video dedicated to your product/solution',
      'Custom technical architecture diagrams & live demos',
      'Exclusive category sponsor lock for 30 days',
      'Cutdowns formatted for X / LinkedIn / Shorts',
      'Full commercial usage rights for your marketing team',
    ],
    deliverables: '1 Full Dedicated Video + 3 Short-Form Cutdowns',
  },
  {
    id: 'campaign',
    name: 'Multi-Month Ambassador Series',
    badge: 'Brand Moat',
    popular: false,
    description: 'Strategic multi-video narrative establishing your brand as the industry-standard developer/enterprise tool across our entire ecosystem.',
    turnaround: 'Custom Schedule',
    features: [
      '3x Dedicated Videos + 6x Mid-roll integrations',
      'Live Q&A Keynote / Podcast Guest Appearance',
      'Newsletter feature to 48,000+ technical leaders',
      'Discord community AMA & dedicated sponsor channel',
      'Custom bespoke enterprise lead generation funnels',
    ],
    deliverables: 'Full Omnichannel Quarterly Campaign',
  },
];

interface PartnershipTiersProps {
  onSelectTier?: (tierName: string) => void;
}

export const PartnershipTiers: React.FC<PartnershipTiersProps> = ({ onSelectTier }) => {
  const scrollToContact = (tierName: string) => {
    if (onSelectTier) onSelectTier(tierName);
    const contactElem = document.getElementById('contact-section');
    contactElem?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
        <div>
          <div className="dynamic-island-pill mb-3">
            <span className="text-sm">💎</span>
            <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
              COLLABORATION FORMATS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950">
            Partnership Options
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-2xl">
            Flexible collaboration packages crafted to deliver verifiable ROI, high-quality developer mindshare, and long-term brand equity.
          </p>
        </div>

        <div className="dynamic-island-subtle self-start md:self-auto">
          <span>⚡</span>
          <span>Booking Q4 2026 Integrations</span>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
              tier.popular
                ? 'liquid-glass-elevated ring-2 ring-neutral-950 shadow-xl'
                : 'liquid-glass hover:liquid-glass-elevated hover:scale-[1.01]'
            }`}
          >
            <div>
              {/* Top pill & Name */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  className="dynamic-island-subtle text-[11px]"
                >
                  <span>⚡</span>
                  <span className="text-white font-mono">{tier.badge}</span>
                </span>
                <span className="text-xs font-mono font-medium text-neutral-500">
                  {tier.turnaround}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950 tracking-tight mb-3">
                {tier.name}
              </h3>

              <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                {tier.description}
              </p>

              {/* Deliverable Badge */}
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 text-xs font-mono text-neutral-800 mb-6 shadow-2xs">
                <span className="text-neutral-500 block text-[10px] uppercase tracking-wider mb-0.5 font-semibold">Package Scope:</span>
                <strong className="text-neutral-950">{tier.deliverables}</strong>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => scrollToContact(tier.name)}
              className={`w-full py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98 ${
                tier.popular
                  ? 'bg-neutral-950 text-white hover:bg-black shadow-[0_8px_20px_rgba(0,0,0,0.18)]'
                  : 'liquid-glass-pill hover:bg-white text-neutral-900'
              }`}
            >
              <span>Inquire for {tier.name.split(' ')[0]}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
