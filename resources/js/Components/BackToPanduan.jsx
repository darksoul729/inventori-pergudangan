import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function BackToPanduan() {
    const { props } = usePage();
    const flash = props?.flash || {};
    const redirected = useRef(false);

    // Set flag when arriving from panduan-setup
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (params.get('from') === 'panduan-setup') {
            sessionStorage.setItem('from_panduan', '1');
        }
    }, []);

    // Auto-redirect back when success or status flash detected
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (redirected.current) return;
        if (!sessionStorage.getItem('from_panduan')) return;

        if (flash?.success || flash?.status) {
            redirected.current = true;
            sessionStorage.removeItem('from_panduan');
            setTimeout(() => router.visit('/panduan-setup'), 600);
        }
    }, [flash?.success, flash?.status]);

    return null;
}
