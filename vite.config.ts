import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { POST, GET } from './src/api/playerData.js'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    {
      name: 'player-data-api',
      configureServer(server) {
        server.middlewares.use('/api/player-data', async (req, res, next) => {
          try {
            const protocol = (req.socket as any).encrypted ? 'https' : 'http';
            const host = req.headers.host || 'localhost';
            const url = `${protocol}://${host}${req.url}`;
            
            let body: string | null = null;
            if (req.method === 'POST') {
              const chunks = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              body = Buffer.concat(chunks).toString();
            }

            const fetchReq = {
              method: req.method,
              json: async () => body ? JSON.parse(body) : {},
              url: url
            };

            let response: any;
            if (req.method === 'POST') {
              response = await POST(fetchReq);
            } else if (req.method === 'GET') {
              response = await GET(fetchReq);
            } else {
              res.writeHead(405, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            // Extract headers from Fetch Response
            const headers: Record<string, string> = {};
            if (response.headers && typeof response.headers.forEach === 'function') {
              response.headers.forEach((value: string, key: string) => {
                headers[key] = value;
              });
            }

            const resData = await response.json();
            res.writeHead(response.status || 200, headers);
            res.end(JSON.stringify(resData));
          } catch (err: any) {
            console.error('API Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error', details: err?.message || 'Unknown error' }));
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Allow Vite to be accessed on the local network
  server: {
    host: true,
    port: 5173, // You can change the port if needed
  },

  // Allow Render to access the preview server
  preview: {
    allowedHosts: ["bingo-0gwl.onrender.com"],
    host: true,
    port: 5173, // Using default or PORT env
  },
})
