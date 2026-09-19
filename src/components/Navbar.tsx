import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { appleEase } from '../utils/motion';
import { AmidiaLogo } from './AmidiaLogo';

interface NavbarProps {
  onExploreAll?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onExploreAll }) => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const elem = document.getElementById(id);
    elem?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: appleEase }}
      className="fixed top-3 sm:top-6 left-0 right-0 z-50 flex flex-col items-center px-3 sm:px-4 pointer-events-none transform-gpu"
    >
      <motion.div
        layout
        className="pointer-events-auto flex items-center gap-2 sm:gap-4 md:gap-6 bg-[#161616]/95 text-white p-1.5 sm:p-2 pl-2.5 sm:pl-3 pr-2 sm:pr-2.5 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.38),0_2px_8px_rgba(0,0,0,0.2)] border border-white/12 backdrop-blur-xl transition-all max-w-[calc(100vw-1.5rem)] w-fit"
      >
        {/* Left Circular Cropped Website Logo -> Home / Admin Portal */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          title="Amidia"
          className="group flex items-center gap-1.5 sm:gap-2 shrink-0 pr-0.5"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 cursor-pointer shadow-sm focus:outline-none ring-1 ring-white/20 hover:ring-sky-400/80 transition-all"
          >
            <AmidiaLogo className="w-full h-full" />
          </motion.div>
          <span className="font-bold text-xs sm:text-sm text-white tracking-tight">Amidia</span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-0.5 sm:gap-1.5 text-xs sm:text-sm font-medium text-neutral-200">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => scrollTo('hero')}
            className="hidden md:inline-block px-2.5 sm:px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap"
          >
            Overview
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => scrollTo('videos')}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap text-xs"
          >
            Videos
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => scrollTo('formats')}
            className="hidden sm:inline-block px-2.5 sm:px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all cursor-pointer whitespace-nowrap"
          >
            Formats
          </motion.button>
        </nav>

        {/* Right CTA Capsule Pill & Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* White Pill Button with subtle azure accent */}
          <motion.button
            whileHover={{ scale: 1.05, y: -0.5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={() => scrollTo('request-kit')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-neutral-950 text-xs sm:text-[13px] font-semibold tracking-tight hover:bg-neutral-100 hover:shadow-[0_0_16px_rgba(14,165,233,0.35)] transition-all shadow-sm shrink-0 cursor-pointer whitespace-nowrap"
          >
            Request Kit
          </motion.button>

          {/* Mobile Menu Hamburger Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </motion.button>

          {/* If an authorized admin happens to be signed in on this browser */}
          {!loading && user && isAdmin && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={signOut}
              title="Sign Out Admin"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-all cursor-pointer border border-white/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Sign Out</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: appleEase }}
            className="pointer-events-auto mt-2 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-xs bg-[#161616]/95 border border-white/15 backdrop-blur-2xl rounded-2xl p-2.5 shadow-2xl flex flex-col gap-1 text-sm md:hidden"
          >
            <button
              onClick={() => scrollTo('hero')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-neutral-200 hover:text-white hover:bg-white/10 font-medium transition-colors cursor-pointer text-xs"
            >
              Overview
            </button>
            <button
              onClick={() => scrollTo('videos')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-neutral-200 hover:text-white hover:bg-white/10 font-medium transition-colors cursor-pointer text-xs"
            >
              Featured Videos
            </button>
            <button
              onClick={() => scrollTo('formats')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-neutral-200 hover:text-white hover:bg-white/10 font-medium transition-colors cursor-pointer text-xs"
            >
              Sponsorship Formats
            </button>
            <button
              onClick={() => scrollTo('request-kit')}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 font-medium transition-colors cursor-pointer text-xs"
            >
              Request Full Media Kit
            </button>

            {!loading && user && isAdmin && (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 rounded-xl text-red-400 hover:bg-red-500/10 font-medium transition-colors cursor-pointer text-xs flex items-center gap-2 border-t border-white/10 mt-1 pt-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
