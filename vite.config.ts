/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  resolve: {
    dedupe: [
      '@midnight-ntwrk/compact-runtime',
      '@midnightntwrk/onchain-runtime-v4'
    ],
    alias: {
      '@midnight-ntwrk/compact-runtime': path.resolve(__dirname, 'node_modules/@midnight-ntwrk/compact-runtime/dist/index.js'),
      '@midnightntwrk/onchain-runtime-v4': path.resolve(__dirname, 'node_modules/@midnightntwrk/onchain-runtime-v4/midnight_onchain_runtime_wasm.js')
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    wasm(),
    nodePolyfills({
      globals: { Buffer: true },
      protocolImports: true,
    })
  ],
  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-network-provider',
      '@midnightntwrk/onchain-runtime-v4',
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
