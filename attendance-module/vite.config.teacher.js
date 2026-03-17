import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Teacher app — runs on http://localhost:5174
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        // Serve teacher.html instead of index.html
        {
            name: 'serve-teacher-html',
            configureServer(server) {
                server.middlewares.use((req, _res, next) => {
                    if (req.url === '/' || req.url === '/index.html') {
                        req.url = '/teacher.html';
                    }
                    next();
                });
            },
        },
    ],
    server: {
        port: 5174,
        host: "0.0.0.0",
        strictPort: false,
    },
    cacheDir: 'node_modules/.vite-teacher',
});
