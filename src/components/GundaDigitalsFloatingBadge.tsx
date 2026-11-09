import React, { useState } from 'react';
import { X, ArrowDown } from 'lucide-react';

export const GundaDigitalsFloatingBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // High-visibility official Gunda Digitals brand logo
  const logoSrc = '/assets/aistudio/Screenshot_2026-11-06_123731_2827c500.png';

  return (
    <>
      {/* Floating Pill Trigger Button with Enlarged High-Visibility Logo */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="no-print fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-30 flex items-center gap-2.5 sm:gap-3 pl-1.5 sm:pl-2 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-white/95 hover:bg-white text-slate-800 rounded-full shadow-xl hover:shadow-2xl border-2 border-slate-200/90 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
        title="Official Development Credit · Gunda Digitals"
        aria-label="Gunda Digitals"
      >
        {/* Enlarged, Easily Identified Logo Container */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center bg-[#0d121d] shrink-0 border-2 border-[#1557B0]/30 shadow-md group-hover:border-[#1557B0] transition-colors p-1">
          <img
            src={logoSrc}
            alt="Gunda Digitals Logo"
            className="w-full h-full object-contain filter contrast-125"
          />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs sm:text-sm font-black tracking-tight text-[#082B63] group-hover:text-[#1557B0] transition-colors leading-tight">
            Gunda Digitals
          </span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
            Portal Developer
          </span>
        </div>
      </button>

      {/* Credit Modal matching uploaded template */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          {/* Backdrop click dismiss */}
          <div
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 overflow-hidden text-center animate-in zoom-in-95 duration-200">
            {/* Top Close 'X' Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Logo Image (Prominent & Clear) */}
            <div className="mx-auto mt-1 w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-800 bg-[#0d121d] flex items-center justify-center p-2">
              <img
                src={logoSrc}
                alt="Gunda Digitals Official Logo"
                className="w-full h-full object-contain filter contrast-125 select-none"
              />
            </div>

            {/* OFFICIAL DEVELOPMENT CREDIT Pill */}
            <div className="mt-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#EBF3FE] text-[#1A73E8] text-[11px] sm:text-xs font-extrabold tracking-wider uppercase">
                OFFICIAL DEVELOPMENT CREDIT
              </span>
            </div>

            {/* Headline */}
            <h3 className="mt-3.5 text-xl sm:text-2xl font-black text-[#0B2B61] leading-tight tracking-tight">
              Built with innovation. Powered by technology.
            </h3>

            {/* Description Subtitle */}
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              The Dadaya High School E-Report Portal was developed by Gunda Digitals.
            </p>

            {/* Subtle Divider */}
            <div className="my-4 border-t border-slate-100" />

            {/* Project Leadership & Development Cards */}
            <div className="space-y-2.5 text-left">
              {/* Lead Developer / CTO: Nyasha Munda (Top) */}
              <div className="bg-[#F4F8FD] rounded-2xl p-3.5 border border-blue-50/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[#1A73E8] tracking-wider uppercase">
                    LEAD DEVELOPER
                  </div>
                  <div className="text-base font-black text-[#0B2B61] mt-0.5">
                    Nyasha Munda
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-blue-100/70 shadow-2xs">
                  Chief Technology Officer
                </span>
              </div>

              {/* Project Director: Wayne Dambudzo */}
              <div className="bg-[#F4F8FD] rounded-2xl p-3.5 border border-blue-50/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[#1A73E8] tracking-wider uppercase">
                    PROJECT DIRECTOR
                  </div>
                  <div className="text-base font-black text-[#0B2B61] mt-0.5">
                    Wayne Dambudzo
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-blue-100/70 shadow-2xs">
                  Executive Director
                </span>
              </div>
            </div>

            {/* Close Button with Down Arrow Icon */}
            <div className="relative mt-5 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 bg-[#0B2B61] hover:bg-[#1557B0] text-white font-bold text-sm rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GundaDigitalsFloatingBadge;
