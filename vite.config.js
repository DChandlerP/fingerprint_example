import { resolve } from 'path';
import { defineConfig } from 'vite';
import { glob } from 'glob';

export default defineConfig({
    build: {
        rollupOptions: {
            input: glob.sync('*.html').reduce((entries, file) => {
                const name = file.replace(/\.html$/, '');
                entries[name] = resolve(__dirname, file);
                return entries;
            }, {}),
            output: {
                manualChunks: {
                    'vendor-lucide': ['lucide'],
                    'vendor-charts': ['chart.js', 'chartjs-adapter-date-fns', 'date-fns'],
                    'vendor-crypto': ['crypto-js', 'jsencrypt'],
                    'vendor-fingerprint': ['@fingerprintjs/fingerprintjs']
                }
            }
        }
    }
});
