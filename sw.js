/* ═══════════════════════════════════════════════
   গ্রন্থকানন — Service Worker (PWA)
   • পেজ (HTML) সবসময় তাজা নেট থেকে; নেট না থাকলে শেষবার দেখা কপি
   • JS/CSS/ছবি: নেট থেকে আনে, কিন্তু নেট ধীর হলে (৩.৫ সেকেন্ডে না এলে)
     ক্যাশে থাকা কপি সাথে সাথে দেখায় — ধীর মোবাইল নেটে সাইট আটকে থাকে না
   • Firebase/বাইরের সাইট কখনো ক্যাশ করে না — সবসময় লাইভ
   নতুন ভার্সনে CACHE-এর নামটা বদলালেই পুরনো ক্যাশ মুছে যায়।
═══════════════════════════════════════════════ */
const CACHE = 'gronthokanon-v4';
const SLOW_MS = 3500;
const SHELL = [
  './index.html',
  './common.css',
  './common.js',
  './book.js',
  './gkbooks-live.js',
  './gksearch.js',
  './firebase-config.js',
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
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== 'gk-booklist').map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isPage = req.mode === 'navigate';
  /* book.html?id=… হাজারটা আলাদা কপি না রেখে পেজের একটাই কপি রাখি (বই নিজে book.js থেকে আসে) */
  const key = isPage ? new Request(url.origin + url.pathname) : req;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const network = fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') cache.put(key, res.clone()).catch(() => {});
      return res;
    });

    if (!isPage) {
      const cached = await cache.match(key);
      if (cached) {
        const slow = new Promise(r => setTimeout(() => r(cached), SLOW_MS));
        return Promise.race([network.catch(() => cached), slow]);
      }
    }
    try {
      return await network;
    } catch (err) {
      const hit = await cache.match(key, { ignoreSearch: true });
      if (hit) return hit;
      if (isPage) { const home = await cache.match('./index.html'); if (home) return home; }
      return Response.error();
    }
  })());
});
