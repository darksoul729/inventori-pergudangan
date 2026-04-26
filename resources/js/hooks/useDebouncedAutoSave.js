import { useEffect, useRef } from 'react';

export function useDebouncedAutoSave(callback, deps, delay = 2000) {
    const timeoutRef = useRef(null);
    const pendingRef = useRef(false);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback();
            pendingRef.current = false;
        }, delay);
        pendingRef.current = true;

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, deps);

    return { isPending: () => pendingRef.current };
}
