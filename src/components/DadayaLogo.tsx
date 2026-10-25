import React from 'react';

export const DADAYA_REAL_LOGO_URL = '/assets/aistudio/Screenshot_2026-08-11_160504_e18d926d.png';

interface DadayaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  inverted?: boolean;
  subtextColor?: string;
}

export const DadayaCrest: React.FC<{
  sizeClass?: string;
  inverted?: boolean;
  className?: string;
}> = ({ sizeClass = 'w-12 h-12', inverted = false, className = '' }) => {
  if (inverted) {
    // When on dark green/colored backgrounds, enclose in an elegant circular medallion badge
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-full bg-white p-1 shadow-md border-2 border-emerald-400/80 ring-2 ring-emerald-950/40 ${sizeClass} ${className}`}
      >
        <img
          src={DADAYA_REAL_LOGO_URL}
          alt="Dadaya High School Official Crest"
          className="w-full h-full object-contain select-none"
          loading="eager"
        />
      </div>
    );
  }

  // When on light backgrounds (white report card, cards), mix-blend-multiply dissolves any off-white boundary
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClass} ${className}`}>
      <img
        src={DADAYA_REAL_LOGO_URL}
        alt="Dadaya High School Official Crest"
        className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-xs select-none"
        loading="eager"
      />
    </div>
  );
};

export const DadayaLogo: React.FC<DadayaLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  inverted = false,
  subtextColor = 'text-emerald-200',
}) => {
  const sizeMap = {
    sm: { crest: 'w-8 h-8', title: 'text-sm', sub: 'text-[8.5px]' },
    md: { crest: 'w-11 h-11', title: 'text-base sm:text-lg', sub: 'text-[9.5px]' },
    lg: { crest: 'w-16 h-16', title: 'text-2xl', sub: 'text-xs' },
    xl: { crest: 'w-24 h-24', title: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <DadayaCrest sizeClass={currentSize.crest} inverted={inverted} />
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-serif-school font-black tracking-wider leading-tight ${
              inverted ? 'text-white' : 'text-[#064e3b]'
            } ${currentSize.title}`}
          >
            DADAYA HIGH SCHOOL
          </span>
          <span
            className={`font-semibold tracking-[0.18em] uppercase leading-none mt-0.5 ${currentSize.sub} ${
              inverted ? subtextColor : 'text-emerald-800'
            }`}
          >
            EDUCATION FOR LIFE • IMFUNDO YEMPILO
          </span>
        </div>
      )}
    </div>
  );
};

export default DadayaLogo;
