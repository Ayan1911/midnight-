/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    wasm()
  ],
  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-network-provider',
      '@midnight-ntwrk/dapp-connector-api',
      '@midnight-ntwrk/dapp-connector-proof-provider'
    ],
    include: ['object-inspect']
  },
  build: {
    target: 'esnext' // Required for top-level await support in ZK Wasm
  },
  server: {
    port: 3000,
    host: true
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
});
