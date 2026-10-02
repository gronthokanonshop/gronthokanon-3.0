/* ═══════════════════════════════════════════════════════
   OurDedication — লাইভ বুক লোডার
   অ্যাডমিন প্যানেল থেকে বই/পণ্য সেভ করলেই Firebase-এর bookList
   আপডেট হয় — এই স্ক্রিপ্ট সেটা সাইটে লাইভ দেখায়, book.js রিআপলোড
   না করেই। Firebase-এ কিছু না থাকলে/নেট না থাকলে book.js-ই চলে।

   পারফরম্যান্স: ৫ মিনিটের জন্য localStorage-এ ক্যাশ রাখা হয় —
   ক্যাশ থাকলে সাথে সাথেই দেখানো হয়, ব্যাকগ্রাউন্ডে নতুন ডাটা
   টেনে ক্যাশ আপডেট করে রাখা হয় (stale-while-revalidate)।

   এই ফাইলটা firebase-config.js এর *পরে* লোড করতে হবে
   (সেখান থেকে window.OD_DB_URL পাওয়া যায়)।
═══════════════════════════════════════════════════════ */
(function () {
    if (!window.OD_DB_URL) return; // firebase-config.js এখনো বসানো হয়নি
    var DBURL = window.OD_DB_URL.replace(/\/$/, '') + '/bookList.json';
    var CACHE_KEY = 'od_booklist_cache_v1';
    var CACHE_TTL = 5 * 60 * 1000; // ৫ মিনিট

    function applyBooks(arr) {
        if (arr && arr.length && typeof books !== 'undefined' && Array.isArray(books)) {
            books.length = 0;
            arr.forEach(function (b) { books.push(b); });
            return true;
        }
        return false;
    }

    function readCache() {
        try {
            var raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            if (obj && Array.isArray(obj.d) && obj.d.length) return obj;
        } catch (e) {}
        return null;
    }

    function writeCache(arr) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: arr })); } catch (e) {}
    }

    function fetchFresh() {
        return fetch(DBURL)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                var arr = null;
                if (Array.isArray(data)) arr = data.filter(Boolean);
                else if (data && typeof data === 'object') arr = Object.values(data).filter(Boolean);
                if (arr && arr.length) {
                    writeCache(arr);
                    return applyBooks(arr);
                }
                return false;
            })
            .catch(function () { return false; });
    }

    var cached = readCache();
    if (cached && (Date.now() - cached.t) < CACHE_TTL) {
        window.OD_BOOKS_LIVE = Promise.resolve(applyBooks(cached.d));
    } else if (cached) {
        applyBooks(cached.d);
        window.OD_BOOKS_LIVE = Promise.resolve(true);
        fetchFresh();
    } else {
        window.OD_BOOKS_LIVE = fetchFresh();
    }
})();
