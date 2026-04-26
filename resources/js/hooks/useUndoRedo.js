import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export function useUndoRedo(initialState) {
    const [history, setHistory] = useState([initialState]);
    const [index, setIndex] = useState(0);
    const skipRef = useRef(false);

    const setState = useCallback((nextState) => {
        if (skipRef.current) {
            skipRef.current = false;
            return;
        }
        setHistory((prev) => {
            const current = prev[index];
            const resolved = typeof nextState === 'function' ? nextState(current) : nextState;
            const next = prev.slice(0, index + 1);
            next.push(resolved);
            if (next.length > MAX_HISTORY) next.shift();
            return next;
        });
        setIndex((prev) => {
            const next = prev + 1;
            return Math.min(next, MAX_HISTORY - 1);
        });
    }, [index]);

    const undo = useCallback(() => {
        setIndex((prev) => {
            if (prev <= 0) return prev;
            skipRef.current = true;
            return prev - 1;
        });
    }, []);

    const redo = useCallback(() => {
        setIndex((prev) => {
            if (prev >= history.length - 1) return prev;
            skipRef.current = true;
            return prev + 1;
        });
    }, [history.length]);

    const canUndo = index > 0;
    const canRedo = index < history.length - 1;

    return {
        state: history[index] ?? initialState,
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
    };
}
