import React, { useState, useEffect, useRef } from 'react';
import PetayuAIModal from './PetayuAIModal';
import { Sparkles, X } from 'lucide-react';

const BUBBLE_SIZE = 64;
const EDGE_PADDING = 20;
const DRAG_THRESHOLD = 8;

// ─── Matching External-styled AI SVG Icon ───────────────────────────────────
const PetayuIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="white" fillOpacity="0.9" />
        <circle cx="12" cy="12" r="3" fill="white" />
        <path d="M12 5V7M12 17V19M5 12H7M17 12H19M7.05 7.05L8.46 8.46M15.54 15.54L16.95 16.95M7.05 16.95L8.46 15.54M15.54 8.46L16.95 7.05" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export default function FloatingBubble() {
    const [position, setPosition] = useState(() => {
        try {
            const saved = localStorage.getItem('petayu_bubble_pos');
            return saved ? JSON.parse(saved) : { x: typeof window !== 'undefined' ? window.innerWidth - 90 : 0, y: typeof window !== 'undefined' ? window.innerHeight - 100 : 0 };
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

    const [isHovering, setIsHovering] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
        setIsHovering(false); // Disable hover effect while dragging
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

    const handleHoverMove = (e) => {
        if (isDragging) return;
        
        // Calculate coordinate relative to the *static* state position, NOT the moving rect
        // to prevent jittering when the element tilts under the cursor
        const size = window.innerWidth >= 640 ? 64 : 56; // sm:w-16 (64px) vs w-14 (56px)
        const centerX = position.x + size / 2;
        const centerY = position.y + size / 2;
        
        let x = e.clientX - centerX;
        let y = e.clientY - centerY;

        // Soft constraint to avoid extreme flips
        const maxDist = 45;
        x = Math.max(-maxDist, Math.min(x, maxDist));
        y = Math.max(-maxDist, Math.min(y, maxDist));

        setMousePos({ x, y });
    };

    const handleMouseEnter = () => !isDragging && setIsHovering(true);
    const handleMouseLeave = () => {
        setIsHovering(false);
        setMousePos({ x: 0, y: 0 });
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
            
            const maxX = window.innerWidth - BUBBLE_SIZE;
            const maxY = window.innerHeight - BUBBLE_SIZE;
            
            const newX = Math.max(0, Math.min(point.x - dragState.offsetX, maxX));
            const newY = Math.max(0, Math.min(point.y - dragState.offsetY, maxY));
            setPosition({ x: newX, y: newY });
        };

        const handlePointerUp = () => {
            if (isDragging) {
                setIsDragging(false);
                
                let snapX = positionRef.current.x;
                const maxX = window.innerWidth - BUBBLE_SIZE - EDGE_PADDING;
                
                if (positionRef.current.x + BUBBLE_SIZE / 2 > window.innerWidth / 2) {
                    snapX = maxX;
                } else {
                    snapX = EDGE_PADDING;
                }
                
                const snapY = Math.max(EDGE_PADDING, Math.min(positionRef.current.y, window.innerHeight - BUBBLE_SIZE - EDGE_PADDING));

                const finalPosition = { x: snapX, y: snapY };
                setPosition(finalPosition);
                localStorage.setItem('petayu_bubble_pos', JSON.stringify(finalPosition));
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
            setPosition(prev => {
                const maxX = window.innerWidth - BUBBLE_SIZE - EDGE_PADDING;
                const snapX = prev.x > window.innerWidth / 2 ? maxX : EDGE_PADDING;
                return {
                    x: snapX,
                    y: Math.max(EDGE_PADDING, Math.min(prev.y, window.innerHeight - BUBBLE_SIZE - EDGE_PADDING)),
                };
            });
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClick = () => {
        if (!hasMovedRef.current && !hasMoved) setIsModalOpen(true);
    };

    // Magnetic 3D transform based on active mouse position
    // Gentler rotation divisor and scale for a smooth premium feel
    const magneticTransform = (isHovering && !isDragging) 
        ? `perspective(800px) rotateX(${-mousePos.y / 2.5}deg) rotateY(${mousePos.x / 2.5}deg) translate(${mousePos.x / 5}px, ${mousePos.y / 5}px) scale(1.05)` 
        : (isDragging ? 'rotate(-10deg) scale(1.15)' : 'scale(1)');

    const innerParallax = (isHovering && !isDragging)
        ? `translate(${mousePos.x / 8}px, ${mousePos.y / 8}px)`
        : 'translate(0px, 0px)';

    // Transition styles: Using 0.15s ease-out during hover completely absorbs the jitter, while 0.5s is used for snapping back
    const transformStyle = {
        transform: magneticTransform,
        transition: isDragging ? 'none' : (isHovering ? 'transform 0.15s ease-out' : 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)')
    };

    const innerTransformStyle = {
        transform: innerParallax,
        transition: isDragging ? 'none' : (isHovering ? 'transform 0.15s ease-out' : 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)')
    };

    return (
        <>
            <div
                ref={bubbleRef}
                className={`fixed z-[9999] select-none ${isDragging ? 'cursor-grabbing opacity-90' : 'cursor-pointer active:scale-95'}`}
                style={{ 
                    left: `${position.x}px`, 
                    top: `${position.y}px`, 
                    touchAction: 'none',
                    transition: isDragging ? 'none' : 'left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                onMouseMove={handleHoverMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                aria-label="Buka PETAYU AI"
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setIsModalOpen(true);
                    }
                }}
            >
                <div className="relative group">
                    {/* Glassy Aura */}
                    <div 
                        className={`absolute -inset-4 rounded-full bg-indigo-500/10 blur-2xl transition-all duration-500 ${isDragging ? 'opacity-100 scale-125' : (isHovering ? 'opacity-100 scale-125' : 'opacity-0')}`} 
                    />

                    {/* Ring Glow */}
                    <div 
                        className={`absolute -inset-0.5 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 blur-md transition-opacity duration-300 ${isDragging ? 'opacity-40' : (isHovering ? 'opacity-100' : 'opacity-20')}`} 
                    />

                    {/* Main Bubble */}
                    <div 
                        className="sm:w-16 sm:h-16 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(89,50,201,0.25)] relative overflow-hidden bg-white border border-slate-100"
                        style={transformStyle}
                    >
                        {/* Gradient Layer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700 opacity-90" />

                        <PetayuIcon 
                            className="sm:w-8 sm:h-8 w-7 h-7 text-white relative z-10 drop-shadow-lg" 
                            style={innerTransformStyle}
                        />

                        {/* Online Pulse */}
                        <div 
                            className="absolute top-1 right-1 sm:top-2 sm:right-2 sm:w-3.5 sm:h-3.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-lg"
                            style={innerTransformStyle}
                        >
                            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                        </div>

                        {/* Sparkle decorative */}
                        <Sparkles className={`absolute -bottom-1 -left-1 w-5 h-5 text-white/20 transition-all duration-500 ${isDragging ? 'scale-0' : 'scale-100 opacity-100 group-hover:rotate-12'}`} />
                    </div>

                    {/* Tooltip Note: Hides dynamically based on position so it doesn't overflow screen end */}
                    {!isDragging && (
                        <div className={`hidden sm:block absolute ${position.x > window.innerWidth / 2 ? 'right-full mr-4' : 'left-full ml-4'} top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-slate-800 text-[11px] font-black uppercase tracking-[0.15em] px-4 py-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 ${position.x > window.innerWidth / 2 ? 'translate-x-4 group-hover:translate-x-0' : '-translate-x-4 group-hover:translate-x-0'} pointer-events-none whitespace-nowrap border border-slate-100`}>
                            <span className="text-indigo-600 mr-2">✦</span> PETAYU AI
                        </div>
                    )}
                </div>
            </div>

            <PetayuAIModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
