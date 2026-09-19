import React from 'react';
import { Mail, Youtube, ArrowUpRight, ShieldCheck, FileText } from 'lucide-react';

export const MediaKitFooter: React.FC = () => {
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-20">
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/80 shadow-sm">
        {/* Brand info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-neutral-950 flex items-center justify-center text-white font-black text-sm shadow-md">
            A
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="font-extrabold text-neutral-950 text-sm tracking-tight uppercase font-['Space_Grotesk']">
                AMIDIA AI & TECH
              </span>
              <span className="dynamic-island-subtle text-[10px]">
                <span>🛡️</span>
                <span className="text-white font-mono">VERIFIED CREATOR</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Official Media Kit & Partnership Inquiries 2026 • Tier-1 Developer & AI Reach
            </p>
          </div>
        </div>

        {/* Professional Media Kit Action Links */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <a
            href="mailto:actiongreenscreen@gmail.com"
            className="liquid-glass-pill px-4 py-2 rounded-full text-xs font-semibold text-neutral-800 hover:text-neutral-950 flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Mail className="w-3.5 h-3.5 text-neutral-600" />
            <span>actiongreenscreen@gmail.com</span>
          </a>
          <a
            href="#analytics-section"
            className="liquid-glass-pill px-4 py-2 rounded-full text-xs font-semibold text-neutral-800 hover:text-neutral-950 flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Youtube className="w-3.5 h-3.5 text-red-600" />
            <span>1.24M Subscribers</span>
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 font-mono px-2">
        <p>© 2026 Amidia AI & Tech. All media kit metrics independently audited.</p>
        <p className="text-[11px] text-neutral-400">Strictly Commercial & Sponsorship Inquiries</p>
      </div>
    </footer>
  );
};
