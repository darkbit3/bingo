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
          if (req.method === 'POST') {
            return POST(req);
          } else if (req.method === 'GET') {
            return GET(req);
          } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
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
