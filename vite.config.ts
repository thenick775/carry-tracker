// eslint-disable-next-line import/no-unresolved
import babel from '@rolldown/plugin-babel';
// eslint-disable-next-line import/no-unresolved
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import {
  coverageConfigDefaults,
  defineConfig as defineVitestConfig
  // eslint-disable-next-line import/no-unresolved
} from 'vitest/config';

// eslint-disable-next-line import/no-default-export
export default defineVitestConfig({
  base: './',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    passWithNoTests: true,
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      reporter: ['text', 'html', 'json-summary', 'json'],
      reportsDirectory: './coverage',
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/test/**',
        '**/*.d.ts',
        '**/.DS_Store'
      ]
    }
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()]
    }),
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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](?:react|react-dom|scheduler)([\\/]|$)/
            },
            {
              name: 'recharts',
              test: /node_modules[\\/](?:recharts|d3-array|d3-scale|d3-shape|d3-format)([\\/]|$)/
            },
            {
              name: 'mantine-core',
              test: /node_modules[\\/](?:@mantine[\\/](?:core))([\\/]|$)/
            },
            {
              name: 'mantine',
              test: /node_modules[\\/](?:@mantine[\\/](?:hooks|notifications|dropzone|dates|form))([\\/]|$)/
            },
            {
              name: 'dexie',
              test: /node_modules[\\/](?:dexie|dexie-export-import|dexie-react-hooks)([\\/]|$)/
            },
            {
              name: 'motion',
              test: /node_modules[\\/](?:motion|framer-motion)([\\/]|$)/
            },
            {
              name: 'ui',
              test: /node_modules[\\/](?:react-icons|@tanstack|dayjs|react-masonry-css|randomcolor)([\\/]|$)/
            }
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
