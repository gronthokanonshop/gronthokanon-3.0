/* ═══════════════════════════════════════════════
   গ্রন্থকানন — Service Worker (PWA)
   হালকা offline সাপোর্ট: অ্যাপ-শেল ক্যাশ করে, বাকি সব
   network-first (তাজা ডেটা আগে, নেট না থাকলে ক্যাশ)।
═══════════════════════════════════════════════ */
const CACHE = 'gronthokanon-v1';
const SHELL = [
  './index.html',
  './common.css',
  './common.js',
  './book.js',
  './logo.png',
  './book-placeholder.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Firebase/এক্সটার্নাল API কখনো ক্যাশ করব না — সবসময় লাইভ
  if (url.origin !== self.location.origin) return;
  if (url.href.includes('firebaseio.com') || url.href.includes('googleapis.com')) return;

  // network-first: তাজা কনটেন্ট আগে, ব্যর্থ হলে ক্যাশ থেকে
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
