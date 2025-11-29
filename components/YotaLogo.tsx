import React from 'react';

export const YotaLogo = ({ className = "" }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 380 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="YOTA Logo"
    >
      {/* Icon Segments - Abstract Representation */}
      <g transform="translate(5, 5) scale(0.9)">
        {/* Top Left Orange */}
        <path d="M25 18 C 22 20 19 23 18 26 L 5 19 C 8 14 12 9 17 6 L 25 18 Z" fill="#FA4515"/>
        <path d="M38 13 C 34 14 30 15 27 18 L 20 6 C 25 2 30 -0 36 -1 L 38 13 Z" fill="#FA4515"/>
        
        {/* Top Right Yellow */}
        <path d="M51 15 C 48 13 45 12 41 12 V -2 C 47 -2 53 -0 58 2 L 51 15 Z" fill="#FFC658"/>
        <path d="M63 22 C 61 19 58 17 55 15 L 61 2 C 67 5 71 9 75 14 L 63 22 Z" fill="#FFC658"/>
        <path d="M68 34 C 67 30 66 27 63 24 L 75 16 C 79 21 82 26 83 32 L 68 34 Z" fill="#FFC658"/>
        
        {/* Bottom Right Teal */}
        <path d="M66 47 C 67 44 67 40 66 36 L 81 33 C 82 39 82 45 81 51 L 66 47 Z" fill="#00A88F"/>
        <path d="M57 58 C 59 55 61 51 61 48 L 76 50 C 75 56 73 62 69 67 L 57 58 Z" fill="#00A88F"/>
        <path d="M44 64 C 47 63 50 61 52 58 L 64 66 C 60 71 56 74 51 77 L 44 64 Z" fill="#00A88F"/>

        {/* Bottom Left Dark */}
        <path d="M30 64 C 33 65 37 65 40 64 L 44 78 C 38 80 33 80 28 78 L 30 64 Z" fill="#006680"/>
        <path d="M19 58 C 22 60 25 61 28 62 L 25 77 C 19 75 14 73 9 69 L 19 58 Z" fill="#006680"/>
        <path d="M13 47 C 14 50 16 53 18 56 L 9 67 C 5 63 2 59 0 53 L 13 47 Z" fill="#006680"/>
        <path d="M13 36 C 12 40 12 44 13 47 L -1 50 C -2 44 -2 38 -1 32 L 13 36 Z" fill="#006680"/>
      </g>

      {/* YOTA Text */}
      <text x="100" y="58" fontFamily="sans-serif" fontWeight="bold" fontSize="56" fill="#006680">YOTA</text>
      
      {/* Divider */}
      <line x1="265" y1="10" x2="265" y2="70" stroke="#006680" strokeWidth="2"/>

      {/* Subtext */}
      <g transform="translate(280, 25)">
          <text y="0" fontFamily="sans-serif" fontSize="13" fill="#006680">Youth Opportunity</text>
          <text y="16" fontFamily="sans-serif" fontSize="13" fill="#006680">& Transformation</text>
          <text y="32" fontFamily="sans-serif" fontSize="13" fill="#006680">in Africa</text>
      </g>
    </svg>
  );
};