const CACHE = 'ourdedication-v3';
const SHELL = ['./index.html','./book.js','./books-live.js','./firebase-config.js','./book-placeholder.svg','./od-theme.css'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Firebase কল কখনো cache/intercept করা হবে না
  if(url.includes('firebaseio.com') || url.includes('googleapis.com') || url.includes('firebasedatabase.app')) return;
  if(e.request.method !== 'GET') return;
  // অন্য সাইটের ফাইল (বইয়ের কভার ছবি, ফন্ট, CDN) ক্যাশ করা হয় না — এগুলো জমে ফোনের স্টোরেজ ভরে ফেলত
  if(new URL(url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(cached => cached || caches.match('./index.html')))
  );
});
