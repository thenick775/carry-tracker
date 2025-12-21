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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const vendorPrefix = 'vendor';
          if (id.includes('node_modules')) {
            if (id.includes('react')) return vendorPrefix + '_react';
            if (id.includes('recharts')) return vendorPrefix + '_recharts';
            if (id.includes('mantine')) return vendorPrefix + '_mantine';
            if (id.includes('dexie')) return vendorPrefix + '_dexie';
            if (id.includes('motion')) return vendorPrefix + '_motion';

            return vendorPrefix;
          }
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
