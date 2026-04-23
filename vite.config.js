import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return;
                    }

                    if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/@inertiajs/react/')) {
                        return 'vendor-react';
                    }

                    if (id.includes('/leaflet/') || id.includes('/react-leaflet/')) {
                        return 'vendor-maps';
                    }

                    if (id.includes('/recharts/')) {
                        return 'vendor-charts';
                    }

                    if (id.includes('/exceljs/') || id.includes('/file-saver/')) {
                        return 'vendor-export';
                    }

                    if (id.includes('/@headlessui/react/')) {
                        return 'vendor-ui';
                    }
                },
            },
        },
    },
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});
