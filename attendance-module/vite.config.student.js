import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Student app — runs on http://localhost:5175
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        // Serve student.html instead of index.html
        {
            name: 'serve-student-html',
            configureServer(server) {
                server.middlewares.use((req, _res, next) => {
                    if (req.url === '/' || req.url === '/index.html') {
                        req.url = '/student.html';
                    }
                    next();
                });
            },
        },
    ],
    server: {
        port: 5175,
        host: "0.0.0.0",
        strictPort: false,
    },
    cacheDir: 'node_modules/.vite-student',
});
