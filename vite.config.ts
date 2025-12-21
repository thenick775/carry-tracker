import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  base: './',
  plugins: [
    react(),
    visualizer(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Every Day Carry Tracker',
        short_name: 'EDCTracker',
        description:
          'A web app that helps you visualize, track, and analyze your every day carry',
        background_color: '#09090b',
        theme_color: '#09090b',
        icons: [
          { src: 'icon-48x48.png', sizes: '48x48', type: 'image/png' },
          { src: 'icon-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: 'icon-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: 'icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-48x48.png',
            sizes: '48x48',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: [
            'react',
            'react-dom',
            'react-dom/client',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            'scheduler'
          ],
          recharts: [
            'recharts',
            'd3-array',
            'd3-scale',
            'd3-shape',
            'd3-format'
          ],
          mantine: [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/notifications',
            '@mantine/dropzone',
            '@mantine/dates',
            '@mantine/form'
          ],
          dexie: ['dexie', 'dexie-export-import', 'dexie-react-hooks'],
          motion: ['motion', 'motion/react'],
          ui: [
            'react-icons',
            'react-icons/tb',
            'react-icons/fa',
            '@tanstack/react-virtual',
            'dayjs',
            'dayjs/plugin/utc',
            'dayjs/plugin/timezone',
            'dayjs/plugin/isBetween',
            'react-masonry-css',
            'randomcolor'
          ]
        }
      },
      onwarn: (warning, defaultHandler) => {
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
          warning.message.includes('use client')
        ) {
          return;
        }
        defaultHandler(warning);
      }
    }
  }
});
