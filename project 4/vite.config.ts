import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-hot-toast'],
          'vendor-ui': ['@supabase/supabase-js', 'framer-motion', 'lucide-react'],
          'vendor-chart': ['chart.js', 'react-chartjs-2'],
          'vendor-date': ['date-fns'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-3d': ['@react-three/drei', '@react-three/fiber', '@react-three/postprocessing', 'three']
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const id = chunkInfo.facadeModuleId || '';
          if (id.includes('node_modules')) {
            return 'vendor/[name].[hash].js';
          }
          return 'assets/[name].[hash].js';
        },
        // Optimize asset names
        assetFileNames: (assetInfo) => {
          const { name } = assetInfo;
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'assets/images/[name].[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      }
    }
  },
  define: {
    'process.env': {}
  }
});