import React, { useState, useEffect, useRef } from 'react';
import AetherAIModal from './AetherAIModal';
import { Sparkles } from 'lucide-react';

const BUBBLE_SIZE = 64;
const EDGE_PADDING = 20;
const DRAG_THRESHOLD = 8;

// ─── Matching External-styled AI SVG Icon ───────────────────────────────────
const AetherIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="white" fillOpacity="0.9" />
        <circle cx="12" cy="12" r="3" fill="white" />
        <path d="M12 5V7M12 17V19M5 12H7M17 12H19M7.05 7.05L8.46 8.46M15.54 15.54L16.95 16.95M7.05 16.95L8.46 15.54M15.54 8.46L16.95 7.05" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export default function FloatingBubble() {
    const [position, setPosition] = useState(() => {
        try {
            const saved = localStorage.getItem('aether_bubble_pos');
            return saved ? JSON.parse(saved) : { x: window.innerWidth - 90, y: window.innerHeight - 100 };
        } catch {
            return { x: window.innerWidth - 90, y: window.innerHeight - 100 };
        }
    });

    const [isDragging, setIsDragging] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dragState, setDragState] = useState(null);
    const [hasMoved, setHasMoved] = useState(false);
    const bubbleRef = useRef(null);
    const hasMovedRef = useRef(false);
    const positionRef = useRef(position);

    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    const getPoint = (event) => {
        const point = event.touches?.[0] || event.changedTouches?.[0] || event;
        return { x: point.clientX, y: point.clientY };
    };

    const handlePointerDown = (event) => {
        const point = getPoint(event);
        setIsDragging(true);
        setHasMoved(false);
        hasMovedRef.current = false;
        setDragState({
            offsetX: point.x - position.x,
            offsetY: point.y - position.y,
            startX: point.x,
            startY: point.y,
            x: position.x,
            y: position.y,
        });
    };

    useEffect(() => {
        const handlePointerMove = (event) => {
            if (!isDragging || !dragState) return;
            const point = getPoint(event);
            const deltaX = point.x - dragState.startX;
            const deltaY = point.y - dragState.startY;

            if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

            event.preventDefault();
            setHasMoved(true);
            hasMovedRef.current = true;
            const newX = Math.max(EDGE_PADDING, Math.min(point.x - dragState.offsetX, window.innerWidth - BUBBLE_SIZE - EDGE_PADDING));
            const newY = Math.max(EDGE_PADDING, Math.min(point.y - dragState.offsetY, window.innerHeight - BUBBLE_SIZE - EDGE_PADDING));
            setPosition({ x: newX, y: newY });
        };

        const handlePointerUp = () => {
            if (isDragging) {
                setIsDragging(false);
                localStorage.setItem('aether_bubble_pos', JSON.stringify(positionRef.current));
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handlePointerMove);
            window.addEventListener('mouseup', handlePointerUp);
            window.addEventListener('touchmove', handlePointerMove, { passive: false });
            window.addEventListener('touchend', handlePointerUp);
        }
        return () => {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
        };
    }, [isDragging, dragState, position]);

    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.max(EDGE_PADDING, Math.min(prev.x, window.innerWidth - BUBBLE_SIZE - EDGE_PADDING)),
                y: Math.max(EDGE_PADDING, Math.min(prev.y, window.innerHeight - BUBBLE_SIZE - EDGE_PADDING)),
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClick = () => {
        if (!hasMovedRef.current && !hasMoved) setIsModalOpen(true);
    };

    return (
        <>
            <div
                ref={bubbleRef}
                className={`fixed z-[9999] select-none ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-pointer hover:scale-105'} transition-all duration-300`}
                style={{ left: `${position.x}px`, top: `${position.y}px`, touchAction: 'none' }}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                aria-label="Buka Aether Intelligence"
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setIsModalOpen(true);
                    }
                }}
            >
                <div className="relative group">
                    {/* Glassy Aura */}
                    <div className="absolute -inset-4 rounded-full bg-indigo-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />

                    {/* Ring Glow */}
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 opacity-20 group-hover:opacity-100 blur-md transition-opacity duration-300" />

                    {/* Main Bubble (Light Theme Design) */}
                    <div className="w-16 h-16 rounded-[24px] flex items-center justify-center shadow-[0_10px_40px_rgba(99,102,241,0.2)] relative overflow-hidden transition-all duration-300 group-hover:rotate-6 bg-white border border-slate-100">
                        {/* Gradient Layer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700 opacity-90" />

                        <AetherIcon className="w-9 h-9 text-white relative z-10 drop-shadow-lg" />

                        {/* Online Pulse */}
                        <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-lg">
                            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                        </div>

                        {/* Sparkle decorative */}
                        <Sparkles className="absolute -bottom-1 -left-1 w-5 h-5 text-white/20" />
                    </div>

                    {/* Light Theme Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-slate-800 text-[11px] font-black uppercase tracking-[0.15em] px-4 py-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none whitespace-nowrap border border-slate-100">
                        <span className="text-indigo-600 mr-2">✦</span> Aether Intelligence
                    </div>
                </div>
            </div>

            <AetherAIModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
