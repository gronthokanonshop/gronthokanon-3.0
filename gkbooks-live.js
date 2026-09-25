/* ═══════════════════════════════════════════════════════
   গ্রন্থকানন — লাইভ বুক লোডার (v3: ভার্সন-ভিত্তিক)

   আগে: প্রতিটা নতুন ভিজিটর আর প্রতি ৫ মিনিটে Firebase থেকে পুরো
   bookList (২ MB+, কম্প্রেস ছাড়া) টেনে আনা হতো — যদিও book.js-এ
   একই লিস্ট আগেই এসে গেছে। মোবাইল নেটে এটাই সাইট স্লো করত।

   এখন: অ্যাডমিন যখনই কোনো বই সেভ করে, Firebase-এ
   siteConfig/bookListVer (একটা ছোট টাইমস্ট্যাম্প) বদলায়। book.js
   ডাউনলোডের সময় সেই ভার্সন ফাইলের ভেতরে বসে যায় (GK_BOOKS_VER)।
   সাইট শুধু ওই ছোট সংখ্যাটা মেলায়:
     • মিলে গেলে → book.js-ই সর্বশেষ, আর কিছু নামাতে হয় না
     • না মিললে → পুরো লিস্ট একবার নামিয়ে সেই ভার্সন দিয়ে ক্যাশ করে
       রাখে, পরের পেজগুলোতে আর নামায় না
   বই যত বাড়ুক, সাধারণ ভিজিটরের কাছে বাড়তি কোনো ডাউনলোড নেই।
═══════════════════════════════════════════════════════ */
(function () {
    var BASE = 'https://gronthokanon-8573e-default-rtdb.firebaseio.com/';
    var VER_KEY = 'gk_booklist_ver_chk';   /* {v, t} — ভার্সন চেক ৬০ সেকেন্ড মনে রাখা */
    var CACHE_NAME = 'gk-booklist';
    var VER_TTL = 60 * 1000;
    var fileVer = (typeof GK_BOOKS_VER !== 'undefined') ? GK_BOOKS_VER : null;

    /* পুরনো localStorage ক্যাশ (১-২ MB) মুছে জায়গা খালি করি */
    try { localStorage.removeItem('gk_booklist_cache_v1'); localStorage.removeItem('gk_booklist_cache_v2'); } catch (e) {}

    function applyBooks(arr) {
        if (arr && arr.length && typeof books !== 'undefined' && Array.isArray(books)) {
            /* একই অ্যারে-তে বদল — সব পেজের রেফারেন্স ঠিক থাকে */
            books.length = 0;
            arr.forEach(function (b) {
                if (b && (!b.img || !/^https?:\/\//.test(b.img))) b.img = 'book-placeholder.svg';
                books.push(b);
            });
            return true;
        }
        return false;
    }

    function toArr(data) {
        if (Array.isArray(data)) return data.filter(Boolean);
        if (data && typeof data === 'object') return Object.values(data).filter(Boolean);
        return null;
    }

    function getVer() {
        try {
            var c = JSON.parse(localStorage.getItem(VER_KEY) || 'null');
            if (c && Date.now() - c.t < VER_TTL) return Promise.resolve(c.v);
        } catch (e) {}
        return fetch(BASE + 'siteConfig/bookListVer.json')
            .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
            .then(function (v) {
                try { localStorage.setItem(VER_KEY, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {}
                return v;
            });
    }

    /* Cache API — async, বড় ডাটা রাখা যায়, মেইন থ্রেড আটকায় না */
    function cacheUrl(ver) { return '/__gk_booklist__/' + ver; }
    function readCache(ver) {
        if (!window.caches) return Promise.resolve(null);
        return caches.open(CACHE_NAME)
            .then(function (c) { return c.match(cacheUrl(ver)); })
            .then(function (r) { return r ? r.json() : null; })
            .catch(function () { return null; });
    }
    function writeCache(ver, arr) {
        if (!window.caches) return;
        caches.open(CACHE_NAME).then(function (c) {
            /* শুধু সর্বশেষ ভার্সনটা রাখি */
            return c.keys().then(function (keys) {
                return Promise.all(keys.map(function (k) { return c.delete(k); }));
            }).then(function () {
                return c.put(cacheUrl(ver), new Response(JSON.stringify(arr), { headers: { 'Content-Type': 'application/json' } }));
            });
        }).catch(function () {});
    }

    function fetchFull(ver) {
        return fetch(BASE + 'bookList.json')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                var arr = toArr(data);
                if (!arr || !arr.length) return false;
                writeCache(ver, arr);
                return applyBooks(arr);
            });
    }

    window.GK_BOOKS_LIVE = getVer().then(function (ver) {
        /* ভার্সন এখনো সেট হয়নি, বা book.js-এর সাথে মিলে গেছে → book.js-ই সর্বশেষ */
        if (ver === null || ver === undefined || ver === fileVer) return false;
        return readCache(ver).then(function (arr) {
            if (arr && arr.length) return applyBooks(arr);
            return fetchFull(ver);
        });
    }).catch(function () { return false; });
})();
