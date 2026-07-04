/* ═══════════════════════════════════════════════════════
   গ্রন্থকানন — লাইভ বুক লোডার
   অ্যাডমিন প্যানেল থেকে "সব সেভ করুন" চাপলেই Firebase-এর
   bookList আপডেট হয় — এই স্ক্রিপ্ট সেটা সাইটে লাইভ দেখায়।
   Firebase-এ কিছু না থাকলে/নেট না থাকলে book.js-ই চলে।
═══════════════════════════════════════════════════════ */
(function () {
    var DBURL = 'https://gronthokanon-8573e-default-rtdb.firebaseio.com/bookList.json';

    window.GK_BOOKS_LIVE = fetch(DBURL)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
            var arr = null;
            if (Array.isArray(data)) arr = data.filter(Boolean);
            else if (data && typeof data === 'object') arr = Object.values(data).filter(Boolean);
            if (arr && arr.length && typeof books !== 'undefined' && Array.isArray(books)) {
                /* একই অ্যারে-তে বদল — সব পেজের রেফারেন্স ঠিক থাকে */
                books.length = 0;
                arr.forEach(function (b) { books.push(b); });
                return true;
            }
            return false;
        })
        .catch(function () { return false; });
})();
