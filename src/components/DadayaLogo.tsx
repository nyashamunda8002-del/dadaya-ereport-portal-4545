import React from 'react';

export const DADAYA_REAL_LOGO_URL = '/assets/aistudio/dadaya_crest_transparent.png';

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
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 ${sizeClass} ${className}`}
      >
        <img
          src={DADAYA_REAL_LOGO_URL}
          alt="Dadaya High School Official Crest"
          className="w-full h-full object-contain select-none filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
          loading="eager"
        />
      </div>
    );
  }

  // When on light backgrounds
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClass} ${className}`}>
      <img
        src={DADAYA_REAL_LOGO_URL}
        alt="Dadaya High School Official Crest"
        className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)] select-none transition-transform hover:scale-105"
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
  subtextColor = 'text-blue-200',
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
              inverted ? 'text-white' : 'text-[#082B63]'
            } ${currentSize.title}`}
          >
            DADAYA HIGH SCHOOL
          </span>
          <span
            className={`font-semibold tracking-[0.16em] uppercase leading-none mt-0.5 ${currentSize.sub} ${
              inverted ? subtextColor : 'text-[#1557B0]'
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
