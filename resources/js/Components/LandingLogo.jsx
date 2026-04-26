import React from 'react';

export default function LandingLogo({ className = "w-10 h-10" }) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Hexagon Background */}
            <path d="M50 5 L90 28 L90 72 L50 95 L10 72 L10 28 Z" fill="url(#hexGrad)" />
            {/* Inner cutout to make it look like a thick border */}
            <path d="M50 18 L78 34 L78 66 L50 82 L22 66 L22 34 Z" fill="#ffffff" />
            
            {/* Bottom dark flap */}
            <path d="M50 82 L78 66 L90 72 L50 95 Z" fill="#310a6a" />
            {/* Right dark side */}
            <path d="M78 66 L78 34 L90 28 L90 72 Z" fill="#4c1d95" opacity="0.6"/>

            {/* Wind Waves (Left side blowing in) */}
            <path d="M -10 50 Q 5 35 20 50 T 45 50" stroke="url(#windGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M -5 65 Q 10 50 25 65 T 50 65" stroke="url(#windGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 0 80 Q 15 65 30 80 T 55 80" stroke="url(#windGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
            
            {/* 3D Box Inside */}
            <g transform="translate(0, 4)">
                {/* Front face */}
                <path d="M40 40 L60 40 L60 60 L40 60 Z" stroke="#310a6a" strokeWidth="3" fill="none" strokeLinejoin="round"/>
                {/* Top face */}
                <path d="M40 40 L50 32 L70 32 L60 40 Z" stroke="#310a6a" strokeWidth="3" fill="none" strokeLinejoin="round"/>
                {/* Right face */}
                <path d="M60 40 L70 32 L70 52 L60 60 Z" stroke="#310a6a" strokeWidth="3" fill="none" strokeLinejoin="round"/>
                {/* Box tape/line */}
                <path d="M40 50 L60 50" stroke="#310a6a" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M60 46 L70 38" stroke="#310a6a" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </g>

            <defs>
                <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
                <linearGradient id="windGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
            </defs>
        </svg>
    );
}
