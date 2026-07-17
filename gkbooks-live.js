/* ═══════════════════════════════════════════════════════
   গ্রন্থকানন — লাইভ বুক লোডার
   অ্যাডমিন প্যানেল থেকে বই সেভ করলেই Firebase-এর bookList
   আপডেট হয় — এই স্ক্রিপ্ট সেটা সাইটে লাইভ দেখায়।
   Firebase-এ কিছু না থাকলে/নেট না থাকলে book.js-ই চলে।

   পারফরম্যান্স: আগে প্রতিটা পেজ-লোডে পুরো বইয়ের লিস্ট Firebase
   থেকে টেনে আনা হতো, বারবার — একই ভিজিটর ৫ মিনিটের মধ্যে
   একাধিক পেজ ঘুরলেও প্রতিবার পুরো ডাটা আবার ডাউনলোড হতো, যা
   সাইট স্লো করে দিত। এখন ৫ মিনিটের জন্য localStorage-এ
   ক্যাশ রাখা হয় — ক্যাশ থাকলে সাথে সাথেই দেখানো হয়, সাথে
   ব্যাকগ্রাউন্ডে নতুন ডাটা টেনে ক্যাশ আপডেট করে রাখা হয়।
═══════════════════════════════════════════════════════ */
(function () {
    var DBURL = 'https://gronthokanon-8573e-default-rtdb.firebaseio.com/bookList.json';
    var CACHE_KEY = 'gk_booklist_cache_v1';
    var CACHE_TTL = 5 * 60 * 1000; // ৫ মিনিট

    function applyBooks(arr) {
        if (arr && arr.length && typeof books !== 'undefined' && Array.isArray(books)) {
            /* একই অ্যারে-তে বদল — সব পেজের রেফারেন্স ঠিক থাকে */
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
        /* তাজা ক্যাশ আছে — সাথে সাথে দেখাও, নেটওয়ার্ক কল লাগবে না */
        window.GK_BOOKS_LIVE = Promise.resolve(applyBooks(cached.d));
    } else if (cached) {
        /* ক্যাশ আছে কিন্তু পুরনো (৫ মিনিটের বেশি) — পুরনোটা দেখিয়ে
           ব্যাকগ্রাউন্ডে আপডেট করো (স্টেল-হোয়াইল-রিভ্যালিডেট) */
        applyBooks(cached.d);
        window.GK_BOOKS_LIVE = Promise.resolve(true);
        fetchFresh();
    } else {
        /* কোনো ক্যাশ নেই — নতুন করে আনতেই হবে */
        window.GK_BOOKS_LIVE = fetchFresh();
    }
})();
