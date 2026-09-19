import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, ShieldCheck, Sparkles, Calendar, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactSectionProps {
  initialInterest?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ initialInterest = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    format: initialInterest || 'Integrated 60-90s Segment',
    budget: '$10k - $25k',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div id="contact-section" className="w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
        <div>
          <div className="dynamic-island-pill mb-3">
            <span className="text-sm">📫</span>
            <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
              DIRECT INQUIRIES
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950">
            Partner With Us
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-2xl">
            Let's discuss integration slots, creative custom narratives, or long-term brand ambassadorships.
          </p>
        </div>

        <div className="dynamic-island-subtle self-start md:self-auto">
          <span>⚡</span>
          <span>Avg Response Time: &lt; 4 hours</span>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
        {/* Left Column: Direct info & highlights */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-neutral-950 tracking-tight">
              Why Partner With Amidia AI & Tech?
            </h3>
            
            <ul className="space-y-4 text-sm text-neutral-700">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-2xs">
                  ✓
                </div>
                <div>
                  <strong className="text-neutral-950 block font-bold">Authentic Developer Credibility</strong>
                  Full live-coded demonstrations, benchmark testing, and transparent product evaluations that viewers trust implicitly.
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-2xs">
                  ✓
                </div>
                <div>
                  <strong className="text-neutral-950 block font-bold">Verified C-Level & Senior Tech Reach</strong>
                  82% of audience consists of software engineers, VP of Engineering, and startup founders with direct procurement budgets.
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-2xs">
                  ✓
                </div>
                <div>
                  <strong className="text-neutral-950 block font-bold">Permanent Evergreen Compounds</strong>
                  Videos continue generating high-intent organic impressions, backlink equity, and conversions for years.
                </div>
              </li>
            </ul>

            <div className="pt-4 border-t border-neutral-200/80 flex flex-col gap-2">
              <span className="text-xs font-mono text-neutral-500 font-semibold">Direct Agent / Business Representation:</span>
              <a
                href="mailto:actiongreenscreen@gmail.com"
                className="text-sm sm:text-base font-mono font-bold text-neutral-950 hover:text-emerald-700 transition-colors flex items-center gap-2"
              >
                actiongreenscreen@gmail.com
                <ArrowUpRight className="w-4 h-4 text-neutral-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Inquiry Form */}
        <div className="lg:col-span-7 liquid-glass-elevated rounded-3xl p-6 sm:p-8 lg:p-10">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-950 tracking-tight">
                Inquiry Received
              </h3>
              <p className="text-neutral-600 text-sm max-w-md mx-auto">
                Thank you for reaching out. We will review your product fit and deliver full rate card details and available calendar dates shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2 rounded-full liquid-glass-pill text-neutral-900 text-xs font-bold hover:bg-white transition-all cursor-pointer"
              >
                Submit another inquiry
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-neutral-700">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Lin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl liquid-glass-input text-neutral-950 placeholder-neutral-400 text-sm outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-neutral-700">Company / Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Cloud"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl liquid-glass-input text-neutral-950 placeholder-neutral-400 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-neutral-700">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl liquid-glass-input text-neutral-950 placeholder-neutral-400 text-sm outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-neutral-700">Target Collaboration Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl liquid-glass-input text-neutral-950 text-sm outline-none transition-all cursor-pointer"
                  >
                    <option value="Integrated 60-90s Segment">Integrated 60-90s Mid-Roll</option>
                    <option value="Dedicated Deep-Dive Video">Dedicated Deep-Dive Video</option>
                    <option value="Multi-Month Ambassador Series">Multi-Month Ambassador Series</option>
                    <option value="Keynote / Custom Advisory">Keynote / Custom Advisory</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-neutral-700">Campaign Timeline / Product Overview</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us briefly about your product, key launch dates, or campaign targets..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl liquid-glass-input text-neutral-950 placeholder-neutral-400 text-sm outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-neutral-950 text-white font-extrabold text-sm tracking-wide hover:bg-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-white/20"
              >
                <span>Send Collaboration Request</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
