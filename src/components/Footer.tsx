import React from 'react';
import { Youtube, Instagram, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-20">
      <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-neutral-100">
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
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Learn, Build, Grow.
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 justify-center">
          <a
            href="https://www.youtube.com/channel/UC81LtJSjn6ZBwFadGUw57lw"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <Youtube className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-neutral-400 font-mono px-2">
        <p>© {new Date().getFullYear()} Amidia AI & Tech. All rights reserved.</p>
      </div>
    </footer>
  );
};

