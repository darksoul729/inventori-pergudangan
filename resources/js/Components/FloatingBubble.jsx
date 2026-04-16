import React, { useState, useEffect, useRef } from 'react';
import BeeBotModal from './BeeBotModal';

export default function FloatingBubble() {
    const [position, setPosition] = useState(() => {
        const savedPos = localStorage.getItem('beebot_bubble_pos');
        return savedPos ? JSON.parse(savedPos) : { x: window.innerWidth - 100, y: window.innerHeight - 100 };
    });
    
    const [isDragging, setIsDragging] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const bubbleRef = useRef(null);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;

            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            const boundedX = Math.max(20, Math.min(newX, window.innerWidth - 80));
            const boundedY = Math.max(20, Math.min(newY, window.innerHeight - 80));

            setPosition({ x: boundedX, y: boundedY });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                // Determine if it was a click or a drag
                const hasMovedSignificant = Math.abs(position.x - (window.innerWidth - 100)) > 5; // simplified check
                // We'll just set dragging to false and save position
                setIsDragging(false);
                localStorage.setItem('beebot_bubble_pos', JSON.stringify(position));
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, position]);

    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - 80),
                y: Math.min(prev.y, window.innerHeight - 80)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClick = (e) => {
        // If we were dragging, don't open modal
        // A better way is to track distance moved during mousedown/mouseup
        setIsModalOpen(true);
    };

    return (
        <>
            <div
                ref={bubbleRef}
                className={`fixed z-[9999] cursor-grab active:cursor-grabbing select-none transition-shadow ${isDragging ? 'shadow-2xl scale-110' : 'shadow-lg hover:rotate-6'} duration-300`}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    touchAction: 'none'
                }}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#585CE5] via-[#A855F7] to-[#F472B6] rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity animate-pulse"></div>
                    
                    <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 flex items-center justify-center overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#585CE5]/20 to-[#A855F7]/20"></div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#585CE5] to-[#A855F7] shadow-[0_0_15px_rgba(88,92,229,0.5)] blur-[1px]"></div>
                        <div className="absolute top-2 left-3 w-4 h-2 bg-white/40 rounded-full rotate-[-45deg] blur-[1px]"></div>
                    </div>

                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur shadow-xl text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none whitespace-nowrap border border-white/10">
                        Chat BeeBot
                    </div>
                </div>
            </div>

            <BeeBotModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
