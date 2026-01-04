import React from 'react';

export const MediPulseLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heartGradientApp" x1="10" y1="10" x2="90" y2="90">
        <stop offset="0%" stopColor="#1e3a8a" /> {/* Brand Blue */}
        <stop offset="50%" stopColor="#2dd4bf" /> {/* Teal */}
        <stop offset="100%" stopColor="#84cc16" /> {/* Brand Lime */}
      </linearGradient>
      <linearGradient id="ringGradientApp" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#84cc16" stopOpacity="0.8"/>
      </linearGradient>
    </defs>
    
    {/* Outer Ring */}
    <circle cx="50" cy="50" r="46" stroke="url(#ringGradientApp)" strokeWidth="3" />
    
    {/* Heart Shape */}
    <path 
      d="M50 88C50 88 18 65 18 38C18 25 28 18 38 18C45 18 50 24 50 24C50 24 55 18 62 18C72 18 82 25 82 38C82 65 50 88 50 88Z" 
      fill="url(#heartGradientApp)" 
    />
    
    {/* ECG Pulse Line (White) */}
    <path 
      d="M28 50H38L44 32L54 68L62 44L68 50H76" 
      stroke="aqua" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <circle cx="76" cy="50" r="3" fill="white" />
  </svg>
);
