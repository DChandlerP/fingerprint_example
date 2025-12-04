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
            }, {})
        }
    }
});
