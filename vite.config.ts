import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self' https://api.sociobot.in; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; manifest-src 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; worker-src 'self'; upgrade-insecure-requests",
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const publicShell = [
  '/', '/privacy/', '/terms/', '/404.html', '/offline.html', '/manifest.webmanifest', '/favicon.svg', '/apple-touch-icon.png',
  '/assets/hero-archive.a969e117.avif', '/assets/hero-archive.616a017b.webp', '/assets/hero-archive.19baff82.jpg',
  '/assets/social-card.jpg',
  '/assets/icon-192.a8387931.png', '/assets/icon-512.bb33bb12.png', '/assets/icon-maskable.81a05710.png',
];

function offlineWorker(): Plugin {
  return {
    name: 'offline-worker',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const generatedAssets = Object.entries(bundle)
        .filter(([file, output]) => !file.endsWith('.html') && !file.endsWith('.map') && (output.type === 'asset' || output.code.trim().length > 0))
        .map(([file]) => `/${file}`);
      const shell = [...new Set([...publicShell, ...generatedAssets])].sort();
      const fingerprint = createHash('sha256').update(shell.join('\n'));
      Object.entries(bundle).sort(([left], [right]) => left.localeCompare(right)).forEach(([file, output]) => {
        fingerprint.update(file);
        fingerprint.update(output.type === 'chunk' ? output.code : output.source);
      });
      fingerprint.update(readFileSync('public/manifest.webmanifest'));
      fingerprint.update(readFileSync('public/offline.html'));
      const version = fingerprint.digest('hex').slice(0, 12);
      const source = `const CACHE = 'dossier-shell-${version}';
const SHELL = ${JSON.stringify(shell)};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('dossier-shell-') && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED', cache: CACHE }));
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.searchParams.has('network-check')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch {
      if (event.request.mode === 'navigate') return (await cache.match('/')) || (await cache.match('/offline.html')) || Response.error();
      return Response.error();
    }
  })());
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  plugins: [offlineWorker()],
  server: { headers: securityHeaders },
  preview: { headers: securityHeaders },
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        app: 'index.html',
        notFound: '404.html',
        privacy: 'privacy/index.html',
        terms: 'terms/index.html',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: ({ names }) => names.some((name) => name.endsWith('.css')) ? 'assets/app-[hash][extname]' : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
