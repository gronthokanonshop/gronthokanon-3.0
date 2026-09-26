/* ═══════════════════════════════════════
   গ্রন্থকানন — Common JavaScript
   সব page এ shared হয় এই JS
═══════════════════════════════════════ */

/* ═══ HTML ESCAPE — সব শেয়ার্ড রেন্ডারিং (কার্ট/উইশলিস্ট ড্রয়ার) এখান
   থেকেই escape করে, যেন বইয়ের নাম/ছবির URL-এ থাকা < > " ' & কখনো
   HTML/attribute ভেঙে না দেয়। top-level এ রাখা হলো যেন নিচের সব IIFE
   (closure এর মাধ্যমে) এটা ব্যবহার করতে পারে। ═══ */
function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

/* ═══ স্টক অবস্থা — সব পেজে (হোম, ফিল্টার, সার্চ, বই) ═══
   Firebase-এর stock নোড: stock/{বইয়ের নম্বর} === false মানে স্টক শেষ।
   পেজ লোডের সাথে সাথে একবার আনা হয়, এলে gkOnStockReady() ডাকে যেন কার্ড রিফ্রেশ হয়। */
window.gkStock = window.gkStock || {};
window.gkIsOut = function (idx) { return window.gkStock && window.gkStock[idx] === false; };
window.GK_STOCK_READY = fetch('https://gronthokanon-8573e-default-rtdb.firebaseio.com/stock.json')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
        window.gkStock = d || {};
        if (typeof window.gkOnStockReady === 'function') { try { window.gkOnStockReady(); } catch (e) {} }
        return true;
    })
    .catch(function () { return false; });

/* ═══ DARK MODE ═══ */
function toggleDark() {
    const h = document.documentElement;
    const isDark = h.getAttribute('data-theme') === 'dark';
    h.setAttribute('data-theme', isDark ? 'light' : 'dark');
    const btn = document.getElementById('darkBtn');
    if (btn) btn.innerText = isDark ? '🌙' : '☀️';
    localStorage.setItem('gronthokanon_theme', isDark ? 'light' : 'dark');
}

/* Dark theme auto-apply on page load */
(function () {
    const saved = localStorage.getItem('gronthokanon_theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        /* dark হলে বাটনের আইকনও মিলিয়ে দাও */
        if (saved === 'dark') {
            const btn = document.getElementById('darkBtn');
            if (btn && btn.innerText.trim() === '🌙') btn.innerText = '☀️';
        }
    }
})();

/* ═══ TOAST NOTIFICATION ═══ */
function showToast(msg, color) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.background = color || '#059669';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
}

/* ═══ PAGE NAVIGATION ═══
   আগে fade-out অ্যানিমেশনের জন্য প্রতিটা ক্লিকে ২৪০ms অপেক্ষা করা হতো —
   এখন সাথে সাথে পরের পেজ লোড শুরু হয় (সাইট দ্রুত মনে হয়) */
function navigateTo(url) {
    window.location.href = url;
}

/* ═══ FIX: browser Back করলে যেন blank/সাদা না থাকে ═══ */
/* fade-out এর পর page cache থেকে ফিরলে opacity 0 আটকে থাকত — এখানে reset করা হলো */
window.addEventListener('pageshow', function () {
    document.body.style.animation = 'none';
    document.body.style.opacity = '1';
});

/* ═══ SCROLL TO TOP ═══ */
window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) btn.classList.toggle('show', window.scrollY > 300);
});

/* ═══ হাদিয়া অফারের টার্গেট (৳) — এখানে বদলালেই সব জায়গায় বদলাবে ═══ */
window.GK_GIFT_THRESHOLD = 1000;
/* হোমপেজ সেকশন/ট্যাগের নাম বাংলায় দেখানোর জন্য — ডেটায় ট্যাগ ইংরেজিই থাকে (অ্যাডমিন/ফিল্টার সেভাবেই মেলায়) */
window.GK_TAG_BN = { 'Best Selling': 'সর্বাধিক বিক্রিত', 'Trending': 'এখন জনপ্রিয়', 'New Arrived': 'নতুন এসেছে', 'Pre Order': 'প্রি-অর্ডার', 'Best Writer': 'সেরা লেখকদের বই' };
window.gkTagLabel = function (t) { return (window.GK_TAG_BN && window.GK_TAG_BN[t]) || t; };
/* কার্টে হাদিয়ার অগ্রগতি বার — এই ফাংশনটা কোনো এক সময় হারিয়ে গিয়েছিল (স্টাইল .gk-gift
   রয়ে গিয়েছিল, কিন্তু বার দেখাত না); আবার বসানো হলো */
window.gkGiftBarHTML = function (subtotal) {
    var t = window.GK_GIFT_THRESHOLD || 0;
    subtotal = Number(subtotal) || 0;
    if (!t || subtotal <= 0) return '';
    var bn = function (n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); };
    if (subtotal >= t) return '<div class="gk-gift done"><div class="gk-gift-txt">🎁 অভিনন্দন! এই অর্ডারে আপনি হাদিয়া পাচ্ছেন</div></div>';
    var pct = Math.max(4, Math.min(100, Math.round(subtotal / t * 100)));
    return '<div class="gk-gift"><div class="gk-gift-txt">🎁 আর মাত্র ৳' + bn(t - subtotal) + ' কিনলেই পাচ্ছেন হাদিয়া</div>' +
        '<div class="gk-gift-track"><div class="gk-gift-fill" style="width:' + pct + '%"></div></div></div>';
};

/* ═══ কুপন — বিল্ট-ইন FIRSTORDER + অ্যাডমিন-তৈরি কুপন (Firebase 'coupons') ═══
   টাইপ: 'percent' = % ছাড় | 'taka' = নির্দিষ্ট ৳ ছাড় | 'delivery' = ফ্রি ডেলিভারি */
window.GK_COUPONS = window.GK_COUPONS || { FIRSTORDER: { type: 'percent', value: 5 } };
window.gkCouponInfo = function (code) {
    var c = window.GK_COUPONS && window.GK_COUPONS[String(code || '').toUpperCase()];
    if (!c) return undefined;
    if (typeof c === 'number') return { type: 'percent', value: c }; /* legacy */
    return c;
};
window.gkCouponLabel = function (info) {
    if (!info) return '';
    if (info.type === 'delivery') return 'ফ্রি ডেলিভারি';
    if (info.type === 'delivery_fixed') return '৳' + info.value + ' ডেলিভারি চার্জ';
    if (info.type === 'taka') return '৳' + info.value + ' ছাড়';
    return info.value + '% ডিসকাউন্ট';
};
/* কার্টে কুপনের ছাড়ের হিসাব (delivery টাইপে পণ্যের দামে ছাড় নেই — ডেলিভারি ফ্রি হয় চেকআউটে) */
window.gkCouponDiscAmt = function (sub) {
    var code = localStorage.getItem('gronthokanon_coupon');
    if (!code) return 0;
    var t = localStorage.getItem('gronthokanon_ctype') || 'percent';
    var v = parseInt(localStorage.getItem('gronthokanon_cvalue') || localStorage.getItem('gronthokanon_discount') || '0');
    if (t === 'taka') return Math.min(v, sub);
    if (t === 'percent') return Math.round(sub * v / 100);
    return 0;
};
(function () {
    try {
        if (typeof firebase !== 'undefined' && firebase.database) {
            firebase.database().ref('coupons').get().then(function (s) {
                if (!s.exists()) return;
                var v = s.val() || {};
                Object.keys(v).forEach(function (k) {
                    var c = v[k];
                    if (!c || c.active === false) return;
                    var code = String(k).toUpperCase();
                    if (typeof c.discount === 'number' && c.discount > 0 && c.discount <= 100) {
                        window.GK_COUPONS[code] = { type: 'percent', value: c.discount }; /* পুরনো ফরম্যাট */
                    } else if (c.type === 'delivery') {
                        window.GK_COUPONS[code] = { type: 'delivery', value: 0 };
                    } else if (c.type === 'delivery_fixed' && typeof c.value === 'number' && c.value >= 0) {
                        window.GK_COUPONS[code] = { type: 'delivery_fixed', value: c.value };
                    } else if ((c.type === 'taka' || c.type === 'percent') && typeof c.value === 'number' && c.value > 0) {
                        if (c.type === 'percent' && c.value > 100) return;
                        window.GK_COUPONS[code] = { type: c.type, value: c.value };
                    }
                });
            }).catch(function () {});
        }
    } catch (e) {}
})();

/* ═══ PWA — Service Worker রেজিস্টার (সব পেজে) ═══ */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {});
    });
}

/* ═══ ভাসমান "Contact us" — চাপলে যোগাযোগের কার্ড (WhatsApp / Messenger / কল), সব পেজে ═══ */
(function () {
    var PHONE = '01516-595762', TEL = '+8801516595762';
    var WA = 'https://wa.me/8801516595762?text=' + encodeURIComponent('আসসালামু আলাইকুম, গ্রন্থকানন থেকে একটা বিষয়ে জানতে চাই।');
    var MSGR = 'https://m.me/gronthokanon0943';
    var ARROW = '<svg class="gkc-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    var IC_WA = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.13c-.24.68-1.42 1.3-1.96 1.35-.5.05-1.13.07-1.83-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.26-.29.57-.36.76-.36l.55.01c.18.01.41-.07.64.49.24.57.81 1.99.88 2.13.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.18 1.54 1.92 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.16-.19.69-.81.87-1.08.18-.28.37-.23.62-.14.25.09 1.6.75 1.87.89.28.14.46.21.53.32.07.12.07.68-.17 1.36z"/></svg>';
    var IC_MSGR = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.15.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.99-.88c.17-.07.36-.09.53-.04 1.06.29 2.19.45 3.4.45 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm6 7.46l-2.94 4.67c-.47.74-1.47.93-2.18.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.67c.47-.74 1.47-.93 2.18-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63z"/></svg>';
    var IC_CALL = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12 19.79 19.79 0 0 1 1.88 3.4 2 2 0 0 1 3.88 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.42-1.42a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

    /* বাংলাদেশ সময় শনি–বৃহস্পতি সকাল ৯টা, শুক্রবার বিকাল ৪টা থেকে রাত ১০টা "অনলাইনে", বাকি সময় "অফলাইন" */
    function isOnline() {
        var d = new Date(Date.now() + (new Date().getTimezoneOffset() + 360) * 60000), h = d.getHours();
        return h >= (d.getDay() === 5 ? 16 : 9) && h < 22;
    }
    function row(cls, href, icon, title, sub, blank) {
        return '<a class="gkc-row ' + cls + '" href="' + href + '"' + (blank ? ' target="_blank" rel="noopener"' : '') + '>' +
            '<span class="gkc-ic">' + icon + '</span>' +
            '<span class="gkc-txt"><b>' + title + '</b><small>' + sub + '</small></span>' + ARROW + '</a>';
    }
    function build() {
        if (document.getElementById('gkContact')) return;
        var on = isOnline();
        var d = document.createElement('div');
        d.id = 'gkContact';
        /* চেকআউটে ফর্মের ঘর ঢেকে না দিতে শুধু ছোট গোল আইকন */
        if (/checkout.html$/.test(location.pathname)) d.className = 'gkc-mini';
        d.innerHTML =
            '<div class="gkc-card" role="dialog" aria-label="যোগাযোগ">' +
                '<div class="gkc-head">' +
                    '<img src="logo.png" alt="" class="gkc-logo">' +
                    '<div class="gkc-htxt"><b>গ্রন্থকানন</b>' +
                        '<span class="gkc-status' + (on ? '' : ' off') + '"><i></i>' + (on ? 'অনলাইনে আছি · সাধারণত কয়েক মিনিটে উত্তর' : 'এখন অফলাইন · মেসেজ রাখুন, সকালে উত্তর দেব') + '</span></div>' +
                    '<button type="button" class="gkc-x" aria-label="বন্ধ করুন" onclick="gkToggleContact()">&times;</button>' +
                '</div>' +
                '<div class="gkc-hello">আসসালামু আলাইকুম 👋<br>বই, অর্ডার বা ডেলিভারি নিয়ে যেকোনো প্রশ্ন থাকলে নিচের যেকোনো একটায় যোগাযোগ করুন।</div>' +
                '<div class="gkc-list">' +
                    row('gkc-wa', WA, IC_WA, 'WhatsApp-এ চ্যাট করুন', PHONE, true) +
                    row('gkc-msgr', MSGR, IC_MSGR, 'Messenger-এ মেসেজ দিন', 'Facebook পেজ', true) +
                    row('gkc-call', 'tel:' + TEL, IC_CALL, 'সরাসরি কল করুন', PHONE, false) +
                '</div>' +
                '<div class="gkc-foot">⏰ শনি–বৃহস্পতি সকাল ৯টা · শুক্রবার বিকাল ৪টা — রাত ১০টা</div>' +
            '</div>' +
            '<button type="button" class="gkc-fab" aria-label="Contact us" onclick="gkToggleContact()">' +
                '<span class="gkc-fab-ic">' +
                    '<svg class="ic-chat" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
                    '<svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
                '</span>' +
                '<span class="gkc-fab-txt">Contact us</span>' +
                (on ? '<span class="gkc-dot"></span>' : '') +
            '</button>';
        document.body.appendChild(d);
        /* গ্রন্থকানন সহকারী (চ্যাট) — পছন্দ না হলে শুধু নিচের লাইনটা মুছে দিন */
        var s = document.createElement('script'); s.src = 'gk-assistant.js'; s.defer = true; document.head.appendChild(s);
    }
    if (document.body) build();
    else document.addEventListener('DOMContentLoaded', build);
    /* বাইরে ক্লিক করলে বা Esc চাপলে বন্ধ */
    document.addEventListener('click', function (e) {
        var c = document.getElementById('gkContact');
        if (c && !c.contains(e.target)) c.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { var c = document.getElementById('gkContact'); if (c) c.classList.remove('open'); }
    });
})();
window.gkToggleContact = function () {
    var c = document.getElementById('gkContact');
    if (c) c.classList.toggle('open');
};

/* ═══════════════════════════════════════════════════════════════
   কার্ট — localStorage এ রক্ষা হয় (key: gronthokanon_cart)
   ডেটা মডেল: [{name, price, img}, ...] — প্রতিটা কপি আলাদা এন্ট্রি
   কুপন: gronthokanon_coupon = কোড, gronthokanon_ctype/cvalue = টাইপ ও মূল্য

   এই ব্লকটা সব পেজে (index/book/filter/checkout — common.js থাকলেই)
   একই কার্ট ড্রয়ার সরবরাহ করে। যে পেজ নিজের showCart()/openOrderForm()
   ইত্যাদি আগে থেকেই ডিফাইন করে রেখেছে (এখন শুধু index.html),
   সেখানে এই ফাংশনগুলো ওভাররাইট করে না — শুধু যেসব পেজে এগুলো
   নেই (book/filter/checkout) সেখানে fallback হিসেবে কাজ করে।
═══════════════════════════════════════════════════════════════ */
(function () {
    var LS_CART = 'gronthokanon_cart';
    function readCart() {
        try { return JSON.parse(localStorage.getItem(LS_CART)) || []; } catch (e) { return []; }
    }
    function writeCart(c) {
        try { localStorage.setItem(LS_CART, JSON.stringify(c || [])); } catch (e) {}
        /* পেজের নিজস্ব cartCount/topbar badge থাকলে সেটাও রিফ্রেশ করি */
        try { if (typeof updateCartCount === 'function') updateCartCount(); } catch (e) {}
        try { if (typeof cart !== 'undefined') cart = readCart(); } catch (e) {}
    }

    /* ── প্রিমিয়াম কার্ট ড্রয়ার — হোম / বই / ফিল্টার সব পেজে একই (স্টাইল common.css-এর .gkcb-*) ──
       কুপন এখানে নেই — শুধু চেকআউটে */
    function ensureCartCSS() {}
    var IC_BAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
    var IC_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
    function bnNum(n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); }

    function cartBoxHTML() {
        return '<div id="cartBox" class="gkcb-modal" onclick="if(event.target===this)closeCart()">' +
            '<div class="gkcb-content" role="dialog" aria-label="আপনার ব্যাগ">' +
                '<div class="gkcb-head">' +
                    '<div class="gkcb-title"><span class="gkcb-hic">' + IC_BAG + '</span><div><b>আপনার ব্যাগ</b><small id="gkcbCount"></small></div></div>' +
                    '<button type="button" class="gkcb-close" onclick="closeCart()" aria-label="বন্ধ করুন">&times;</button>' +
                '</div>' +
                '<div id="cartOfferBanner" class="gkcb-gift" style="display:none;"></div>' +
                '<div id="cartItems" class="gkcb-items"></div>' +
                '<div class="gkcb-foot" id="gkcbFoot">' +
                    '<div class="gkcb-row"><span>বইয়ের দাম</span><b>৳<span id="subtotal">0</span></b></div>' +
                    '<div class="gkcb-save" id="gkcbSave" style="display:none;"></div>' +
                    '<button type="button" class="gkcb-order" onclick="openOrderForm()">অর্ডার করুন <span>· ৳<span id="total">0</span></span> →</button>' +
                    '<button type="button" class="gkcb-more" onclick="closeCart()">আরও কিনুন</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function ensureCartBox() {
        if (!document.getElementById('cartBox')) {
            document.body.insertAdjacentHTML('beforeend', cartBoxHTML());
        }
    }

    /* কার্ট পেজেই (checkout.html) কার্ট ড্রয়ার দরকার নেই — ওখানে বাটন চাপলে শুধু ওপরে স্ক্রল করে দেবে */
    function onCheckoutPage() {
        return location.pathname.indexOf('checkout.html') !== -1;
    }
    function bookInfo(name) {
        if (typeof books === 'undefined' || !books) return null;
        for (var i = 0; i < books.length; i++) if (books[i] && books[i].name === name) return books[i];
        return null;
    }

    window.gkCartUpdateUI = function () {
        ensureCartBox();
        var box = document.getElementById('cartItems');
        if (!box) return;
        var c = readCart();
        var subtotal = 0, mrp = 0;
        var foot = document.getElementById('gkcbFoot');
        if (!c.length) {
            box.innerHTML = '<div class="gkcb-empty"><div class="gkcb-empty-ic">' + IC_BAG + '</div><b>আপনার ব্যাগ খালি</b>' +
                '<button type="button" onclick="closeCart()">বই দেখুন</button></div>';
            if (foot) foot.style.display = 'none';
        } else {
            if (foot) foot.style.display = '';
            var grouped = {}, order = [];
            c.forEach(function (item) {
                if (grouped[item.name]) grouped[item.name].qty++;
                else { grouped[item.name] = { price: Number(item.price) || 0, qty: 1, img: item.img || '' }; order.push(item.name); }
            });
            box.innerHTML = order.map(function (name) {
                var item = grouped[name], b = bookInfo(name);
                var orig = b && Number(b.original_price) > item.price ? Number(b.original_price) : 0;
                subtotal += item.price * item.qty;
                mrp += (orig || item.price) * item.qty;
                var safe = escapeHTML(name);
                var link = b ? 'book.html?id=' + encodeURIComponent(b.bid || books.indexOf(b)) : '';
                return '<div class="gkcb-item">' +
                    (link ? '<a href="' + link + '" class="gkcb-img">' : '<span class="gkcb-img">') +
                        '<img src="' + escapeHTML(item.img || 'book-placeholder.svg') + '" alt="" loading="lazy" onerror="this.src=\'book-placeholder.svg\'">' +
                    (link ? '</a>' : '</span>') +
                    '<div class="gkcb-info">' +
                        (link ? '<a href="' + link + '" class="gkcb-name">' + safe + '</a>' : '<span class="gkcb-name">' + safe + '</span>') +
                        (b && (b.author || b.brand) ? '<span class="gkcb-auth">' + escapeHTML(b.author || b.brand) + '</span>' : '') +
                        '<div class="gkcb-price">৳' + bnNum(item.price) + (orig ? ' <s>৳' + bnNum(orig) + '</s>' : '') + '</div>' +
                        '<div class="gkcb-actions">' +
                            '<div class="gkcb-qty">' +
                                '<button type="button" data-name="' + safe + '" onclick="gkCartQty(this.dataset.name,-1)" aria-label="কমান">−</button>' +
                                '<span>' + bnNum(item.qty) + '</span>' +
                                '<button type="button" data-name="' + safe + '" onclick="gkCartQty(this.dataset.name,1)" aria-label="বাড়ান">+</button>' +
                            '</div>' +
                            '<b class="gkcb-line">৳' + bnNum(item.price * item.qty) + '</b>' +
                            '<button type="button" class="gkcb-del" data-name="' + safe + '" onclick="gkCartRemove(this.dataset.name)" aria-label="সরান">' + IC_TRASH + '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
        var count = c.length;
        var bb = document.getElementById('bnavBadge'); if (bb) { bb.innerText = count; bb.classList.toggle('show', count > 0); }
        var cnt = document.getElementById('gkcbCount'); if (cnt) cnt.textContent = count ? bnNum(count) + 'টি বই' : '';
        var elSub = document.getElementById('subtotal'); if (elSub) elSub.innerText = bnNum(subtotal);
        var elTot = document.getElementById('total'); if (elTot) elTot.innerText = bnNum(subtotal);
        var sv = document.getElementById('gkcbSave');
        if (sv) { var s = mrp - subtotal; sv.style.display = s > 0 ? '' : 'none'; sv.innerHTML = s > 0 ? '🎉 আপনি <b>৳' + bnNum(s) + '</b> সাশ্রয় করছেন' : ''; }
        var ob = document.getElementById('cartOfferBanner');
        if (ob) {
            var giftHtml = (count && typeof window.gkGiftBarHTML === 'function') ? window.gkGiftBarHTML(subtotal) : '';
            ob.innerHTML = giftHtml;
            ob.style.display = giftHtml ? 'block' : 'none';
        }
    };
    window.gkCartRemove = function (name) {
        writeCart(readCart().filter(function (i) { return i.name !== name; }));
        if (typeof updateCartUI === 'function') updateCartUI(); else window.gkCartUpdateUI();
    };

    window.renderCouponSection = window.renderCouponSection || function () {
        var sec = document.getElementById('couponSection');
        if (!sec) return;
        var applied = localStorage.getItem('gronthokanon_coupon');
        if (applied) {
            var ct = localStorage.getItem('gronthokanon_ctype') || 'percent';
            var cv = parseInt(localStorage.getItem('gronthokanon_cvalue') || localStorage.getItem('gronthokanon_discount') || '0');
            var label = '🎉 ' + applied + ' — ' + ((typeof window.gkCouponLabel === 'function') ? window.gkCouponLabel({ type: ct, value: cv }) : cv + '% ডিসকাউন্ট');
            sec.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(5,150,105,0.08);border:1.5px dashed #059669;border-radius:8px;">' +
                '<span style="flex:1;font-size:13px;font-weight:700;color:#059669;">' + label + '</span>' +
                '<button onclick="removeCoupon()" style="background:#fee2e2;color:#dc2626;border:none;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;">✕ বাতিল</button></div>';
        } else {
            sec.innerHTML = '<div style="display:flex;gap:6px;">' +
                '<input type="text" id="couponCode" placeholder="কুপন কোড লিখুন" style="flex:1;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;background:var(--card);color:var(--text);font-family:\'Hind Siliguri\',Arial,sans-serif;font-size:13px;outline:none;">' +
                '<button onclick="applyCoupon()" style="background:#059669;color:white;border:none;padding:0 14px;border-radius:8px;cursor:pointer;font-weight:bold;font-size:13px;">Apply</button></div>';
        }
    };
    window.removeCoupon = window.removeCoupon || function () {
        localStorage.removeItem('gronthokanon_coupon');
        localStorage.removeItem('gronthokanon_discount');
        localStorage.removeItem('gronthokanon_ctype');
        localStorage.removeItem('gronthokanon_cvalue');
        showToast('🗑️ কুপন বাতিল হয়েছে', '#6b7280');
        window.gkCartUpdateUI();
        window.renderCouponSection();
    };
    window.applyCoupon = window.applyCoupon || function () {
        var el = document.getElementById('couponCode');
        var code = (el ? el.value : '').trim().toUpperCase();
        var info = (typeof window.gkCouponInfo === 'function') ? window.gkCouponInfo(code) : null;
        if (info) {
            localStorage.setItem('gronthokanon_coupon', code);
            localStorage.setItem('gronthokanon_ctype', info.type);
            localStorage.setItem('gronthokanon_cvalue', String(info.value));
            localStorage.setItem('gronthokanon_discount', String(info.type === 'percent' ? info.value : 0));
            showToast('🎉 ' + window.gkCouponLabel(info) + ' যুক্ত হয়েছে!', '#059669');
            window.gkCartUpdateUI();
            window.renderCouponSection();
        } else {
            showToast('❌ ভুল কুপন কোড!', '#dc2626');
        }
    };
    /* আলাদা নাম — book.html-এর নিজস্ব changeQty(d) (পেজের পরিমাণ বক্স) এটাকে ঢেকে দিত, ফলে কার্টে +/- কাজ করত না */
    window.gkCartQty = function (name, delta) {
        var c = readCart();
        if (delta === 1) {
            var item = c.find(function (i) { return i.name === name; });
            if (item) c.push({ name: item.name, price: item.price, img: item.img });
        } else {
            var idx = -1;
            for (var j = c.length - 1; j >= 0; j--) { if (c[j].name === name) { idx = j; break; } }
            if (idx !== -1) c.splice(idx, 1);
        }
        writeCart(c);
        /* হোমপেজের নিজস্ব updateCartUI থাকলে সেটা (ব্যাজ+ড্রয়ার দুটোই আপডেট করে) */
        if (typeof updateCartUI === "function") updateCartUI(); else window.gkCartUpdateUI();
    };
    window.changeQty = window.changeQty || window.gkCartQty;
    window.gkOpenCart = function () {
        if (onCheckoutPage()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        ensureCartBox();
        window.gkCartUpdateUI();
        var b = document.getElementById('cartBox');
        b.style.display = 'flex';
        document.documentElement.classList.add('gkcb-lock');
    };
    window.gkCloseCart = function () {
        var b = document.getElementById('cartBox');
        if (b) b.style.display = 'none';
        document.documentElement.classList.remove('gkcb-lock');
    };
    window.showCart = window.showCart || window.gkOpenCart;
    window.closeCart = window.closeCart || window.gkCloseCart;
    window.openOrderForm = window.openOrderForm || function () {
        var c = readCart();
        if (!c.length) return showToast('⚠️ কার্ট খালি!', '#dc2626');
        var inp = document.getElementById('couponCode');
        var code = inp ? inp.value.trim() : '';
        var appliedCoupon = localStorage.getItem('gronthokanon_coupon');
        if (!code && !appliedCoupon) {
            localStorage.removeItem('gronthokanon_discount');
            localStorage.removeItem('gronthokanon_coupon');
        }
        window.location.href = 'checkout.html';
    };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && typeof closeCart === 'function') closeCart(); });
})();
/* ══ Meta Pixel — অ্যাডমিন প্যানেল থেকে ID সেট করা যায় (siteConfig/metaPixelId) ══ */
(function () {
    try {
        fetch('https://gronthokanon-8573e-default-rtdb.firebaseio.com/siteConfig/metaPixelId.json')
            .then(function (r) { return r.json(); })
            .then(function (id) {
                if (!id || !/^\d{5,20}$/.test(String(id))) return;
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', String(id));
                fbq('track', 'PageView');
            })
            .catch(function () {});
    } catch (e) {}
})();

/* ═══════════════════════════════════════════════════════════
   অফার পোস্টার পপআপ — siteConfig/offerPopups থেকে চালিত (একাধিক পোস্টার, সর্বোচ্চ ৩টা)।
   ডেটা গঠন (admin-gk09x43.html সেভ করে): { enabled: bool, posters: [ {img,title,sub,link}, ... ] }

   আচরণ (admin-এর বর্ণনা অনুযায়ী): হোমপেজে ঢুকলে ১ম পোস্টার দেখাবে, কাস্টমার অন্য
   পেজে গেলে (book/filter ইত্যাদি) পরের পোস্টারটা দেখাবে — এভাবে পেজ-ভ্রমণ অনুযায়ী
   ঘুরিয়ে ঘুরিয়ে দেখায়। সবগুলো একবার করে দেখানো শেষ হলে ২৪ ঘণ্টা আর দেখাবে না।
   checkout.html-এ কখনো দেখাবে না।

   CSS নিজেই ইনজেক্ট করা হয় (ensureCSS) — কোনো পেজের নিজস্ব CSS-এর উপর নির্ভর করে না।
═══════════════════════════════════════════════════════════ */
(function () {
    var DISMISS_KEY_POSTER = 'gronthokanon_offer_poster_dismiss';
    var IDX_KEY_POSTER = 'gronthokanon_offer_poster_idx';
    var DISMISS_HOURS = 24;

    function getDismissedPoster() {
        try { return JSON.parse(localStorage.getItem(DISMISS_KEY_POSTER) || '{}'); } catch (e) { return {}; }
    }
    function setDismissedPoster() {
        try { localStorage.setItem(DISMISS_KEY_POSTER, JSON.stringify({ t: Date.now() })); } catch (e) {}
    }
    function isPosterDismissed() {
        var d = getDismissedPoster();
        if (!d || !d.t) return false;
        return (Date.now() - d.t) < DISMISS_HOURS * 3600000;
    }
    function getNextIdx() {
        try { return parseInt(localStorage.getItem(IDX_KEY_POSTER) || '0', 10) || 0; } catch (e) { return 0; }
    }
    function setNextIdx(i) {
        try { localStorage.setItem(IDX_KEY_POSTER, String(i)); } catch (e) {}
    }
    function escapeHTML(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function ensureCSS() {
        if (document.getElementById('gkOfferPosterCSS')) return;
        var style = document.createElement('style');
        style.id = 'gkOfferPosterCSS';
        style.textContent =
            '.gk-offer-poster-overlay{position:fixed;inset:0;z-index:99999;background:rgba(15,15,20,.72);' +
            'display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;' +
            'transition:opacity .2s ease;box-sizing:border-box;}' +
            '.gk-offer-poster-overlay.gk-show{opacity:1;}' +
            '.gk-offer-poster-box{position:relative;max-width:420px;width:100%;max-height:88vh;' +
            'overflow:auto;background:#fff;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.35);' +
            'box-sizing:border-box;text-align:center;}' +
            '.gk-offer-poster-close{position:absolute;top:8px;right:8px;width:32px;height:32px;' +
            'border-radius:50%;border:none;background:rgba(0,0,0,.55);color:#fff;font-size:16px;' +
            'line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;}' +
            '.gk-offer-poster-close:hover{background:rgba(0,0,0,.8);}' +
            '.gk-offer-poster-img{display:block;width:100%;max-height:70vh;object-fit:contain;' +
            'border-radius:14px 14px 0 0;box-sizing:border-box;}' +
            '.gk-offer-poster-title{font-size:17px;font-weight:800;padding:14px 16px 2px;color:#111;}' +
            '.gk-offer-poster-sub{font-size:13px;padding:2px 16px 16px;color:#555;}';
        document.head.appendChild(style);
    }

    function buildPosterPopup(config) {
        if (document.getElementById('gkOfferPosterOverlay')) return;
        ensureCSS();
        var overlay = document.createElement('div');
        overlay.className = 'gk-offer-poster-overlay';
        overlay.id = 'gkOfferPosterOverlay';
        overlay.innerHTML =
            '<div class="gk-offer-poster-box">' +
                '<button type="button" class="gk-offer-poster-close" aria-label="বন্ধ করুন">✕</button>' +
                (config.img ? '<img src="' + escapeHTML(config.img) + '" alt="অফার" class="gk-offer-poster-img" style="' + (config.link ? 'cursor:pointer;' : '') + '" />' : '') +
                (config.title ? '<div class="gk-offer-poster-title">' + escapeHTML(config.title) + '</div>' : '') +
                (config.sub ? '<div class="gk-offer-poster-sub">' + escapeHTML(config.sub) + '</div>' : '') +
            '</div>';
        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('gk-show'); });

        function dismiss() {
            overlay.classList.remove('gk-show');
            setTimeout(function () { overlay.remove(); }, 200);
        }

        overlay.addEventListener('click', function (e) { if (e.target === overlay) dismiss(); });
        overlay.querySelector('.gk-offer-poster-close').addEventListener('click', dismiss);

        if (config.img && config.link) {
            overlay.querySelector('.gk-offer-poster-img').addEventListener('click', function () {
                window.location.href = config.link;
            });
        }
    }

    function tryShow() {
        try {
            /* ──── GUARD: চেকআউট পেজে পপআপ দেখাবে না ──── */
            if (location.pathname.indexOf('checkout.html') !== -1 || location.pathname.endsWith('checkout.html')) {
                return;
            }
            if (typeof firebase === 'undefined' || !firebase.database) return;
            if (isPosterDismissed()) return;

            firebase.database().ref('siteConfig/offerPopups').once('value').then(function (snap) {
                var v = snap.val();
                if (!v || v.enabled !== true) return;
                var posters = Array.isArray(v.posters) ? v.posters.filter(Boolean)
                    : (v.posters && typeof v.posters === 'object') ? Object.values(v.posters).filter(Boolean)
                    : [];
                if (!posters.length) return;

                var idx = getNextIdx();
                if (idx >= posters.length) {
                    /* সবগুলো একবার করে দেখানো শেষ — ২৪ ঘণ্টার জন্য বন্ধ, চক্র রিসেট */
                    setDismissedPoster();
                    setNextIdx(0);
                    return;
                }
                var config = posters[idx];
                if (config && config.img) buildPosterPopup(config);
                setNextIdx(idx + 1); /* পরের পেজ-ভ্রমণে পরের পোস্টার */
            }).catch(function () {});
        } catch (e) {}
    }

    function init() { setTimeout(tryShow, 1400); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
/* ═══════════════════════════════════════════════════════════════
   বটম-নেভ + উইশলিস্ট ড্রয়ার + লগইন/রেজিস্টার মোডাল — সব পেজে শেয়ার্ড

   common.js ইনক্লুড করা প্রতিটা পেজেই এখন বটম-নেভ (হোম/কার্ট/উইশলিস্ট/
   ট্র্যাক/লগইন), উইশলিস্ট ড্রয়ার আর অথ মোডাল নিজে থেকেই ইনজেক্ট হয়ে যায় —
   নতুন পেজেও শুধু common.js ইনক্লুড করলেই এগুলো কাজ করবে।

   যে পেজে (এখন শুধু index.html) এই HTML/ফাংশনগুলো আগে থেকেই আছে,
   সেখানে ডুপ্লিকেট বসে না (ID চেক করে) আর ফাংশনও ওভাররাইট হয় না
   (window.X = window.X || function... প্যাটার্নে) — তাই index.html-এর
   বিদ্যমান আচরণ অপরিবর্তিত থাকে।
═══════════════════════════════════════════════════════════════ */
(function () {
    function ensureNavAuthCSS() {
        if (document.getElementById('gkNavAuthCSS')) return;
        var style = document.createElement('style');
        style.id = 'gkNavAuthCSS';
        style.textContent =
            /* ── বটম নেভ ── */
            '.bottom-nav{position:fixed;bottom:0;left:0;right:0;background:rgba(255,255,255,0.97);' +
            'backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-top:1px solid rgba(0,0,0,0.08);' +
            'border-radius:0;box-shadow:0 -2px 16px rgba(0,0,0,0.08);display:flex;justify-content:space-around;' +
            'align-items:center;padding:6px 4px 10px;z-index:998;}' +
            '[data-theme="dark"] .bottom-nav{background:rgba(17,24,39,0.97);border-top-color:rgba(255,255,255,0.07);}' +
            '@media (min-width:768px){.bottom-nav{left:50%;transform:translateX(-50%);width:580px;right:auto;border-radius:0;}}' +
            '.bnav-item{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:6px 14px;' +
            'border-radius:40px;transition:all 0.25s cubic-bezier(0.2,0.8,0.2,1);position:relative;-webkit-tap-highlight-color:transparent;}' +
            '.bnav-item:active{transform:scale(0.86);}' +
            '.bnav-item.active{background:rgba(5,150,105,0.10);}' +
            '.bnav-svg{width:23px;height:23px;stroke:#9ca3af;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;' +
            'transition:stroke 0.22s,fill 0.22s,filter 0.22s;}' +
            '.bnav-item.active .bnav-svg{stroke:#059669;filter:drop-shadow(0 3px 7px rgba(5,150,105,0.38));}' +
            '#bnav-wish.active .bnav-svg{stroke:#ec4899;filter:drop-shadow(0 3px 7px rgba(236,72,153,0.38));}' +
            '#bnav-wish.active .bnav-label{color:#ec4899;}' +
            '.bnav-label{font-size:10px;color:#9ca3af;font-weight:600;transition:color 0.2s;letter-spacing:0.01em;}' +
            '.bnav-item.active .bnav-label{color:#059669;font-weight:700;}' +
            '.bnav-badge{position:absolute;top:0px;right:8px;background:#dc2626;color:white;font-size:9px;font-weight:bold;' +
            'padding:1px 5px;border-radius:20px;display:none;min-width:16px;text-align:center;border:2px solid rgba(255,255,255,0.9);' +
            'box-shadow:0 1px 4px rgba(220,38,38,0.35);}' +
            '.bnav-badge.show{display:block;}' +
            '.bnav-login-pill{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:5px 10px;' +
            'border-radius:40px;transition:all 0.25s;position:relative;-webkit-tap-highlight-color:transparent;}' +
            '.bnav-login-pill:active{transform:scale(0.86);}' +
            '.bnav-login-inner{display:flex;align-items:center;gap:5px;background:linear-gradient(135deg,#059669,#10b981);' +
            'border-radius:22px;padding:7px 14px;box-shadow:0 3px 14px rgba(5,150,105,0.32);transition:all 0.22s;}' +
            '.bnav-login-pill:active .bnav-login-inner{box-shadow:none;transform:scale(0.93);}' +
            '.bnav-login-svg{width:16px;height:16px;stroke:white;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
            '.bnav-login-text{font-size:11px;font-weight:700;color:white;white-space:nowrap;}' +
            'body{padding-bottom:0;}' +
            /* ── উইশলিস্ট ড্রয়ার ── */
            '.wl-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.48);backdrop-filter:blur(4px);' +
            '-webkit-backdrop-filter:blur(4px);z-index:10000;justify-content:flex-end;}' +
            '.wl-content{background:rgba(255,255,255,0.92);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);' +
            'border-left:1px solid rgba(255,255,255,0.5);box-shadow:-8px 0 40px rgba(0,0,0,0.12);width:330px;max-width:92%;' +
            'height:100%;display:flex;flex-direction:column;animation:gkWlSlideIn 0.35s cubic-bezier(0.2,0.8,0.2,1);' +
            'overflow-y:auto;border-radius:24px 0 0 24px;}' +
            '[data-theme="dark"] .wl-content{background:rgba(17,24,39,0.92);border-left-color:rgba(255,255,255,0.08);}' +
            '@keyframes gkWlSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}' +
            /* ── অথ মোডাল ── */
            '.auth-card{background:var(--card);width:100%;max-width:440px;border-radius:24px 24px 0 0;' +
            'padding:0 0 max(24px,env(safe-area-inset-bottom));max-height:92vh;overflow-y:auto;position:relative;' +
            'box-shadow:0 -10px 40px rgba(0,0,0,0.25);animation:gkAuthSlideUp .32s cubic-bezier(.4,0,.2,1);}' +
            '@keyframes gkAuthSlideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}' +
            '.auth-drag-handle{width:36px;height:4px;background:var(--border);border-radius:4px;margin:12px auto 0;}' +
            '.auth-close-btn{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:none;' +
            'background:var(--bg);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;' +
            'transition:background .15s,color .15s;}' +
            '.auth-close-btn:hover{background:#fee2e2;color:#dc2626;}' +
            '.auth-close-btn svg{width:16px;height:16px;}' +
            '.auth-header{text-align:center;padding:22px 24px 4px;}' +
            '.auth-header-logo{width:52px;height:52px;margin:0 auto 10px;border-radius:14px;background:#fff;' +
            'box-shadow:0 4px 16px rgba(5,150,105,0.18),0 0 0 1px rgba(5,150,105,0.1);display:flex;align-items:center;' +
            'justify-content:center;padding:7px;box-sizing:border-box;}' +
            '.auth-header-logo img{width:100%;height:100%;object-fit:contain;}' +
            '.auth-header-title{font-family:"Playfair Display",Georgia,serif;font-size:19px;font-weight:700;color:var(--text);}' +
            '.auth-header-sub{font-size:12.5px;color:var(--text2);margin-top:3px;}' +
            '.auth-tabs{display:flex;position:relative;gap:0;margin:18px 24px 0;background:var(--bg);border-radius:14px;padding:4px;}' +
            '.auth-tab{flex:1;padding:10px 0;background:transparent;border:none;border-radius:11px;' +
            'font-family:"Hind Siliguri",Arial,sans-serif;font-size:13.5px;font-weight:700;color:var(--text2);' +
            'cursor:pointer;position:relative;z-index:1;transition:color .2s;}' +
            '.auth-tab-active{color:#fff;}' +
            '.auth-tab-slider{position:absolute;top:4px;left:4px;width:calc(50% - 4px);height:calc(100% - 8px);' +
            'background:linear-gradient(135deg,#059669,#10b981);border-radius:11px;box-shadow:0 3px 10px rgba(5,150,105,0.35);' +
            'transition:transform .28s cubic-bezier(.4,0,.2,1);}' +
            '.auth-body{padding:18px 24px 4px;}' +
            '.auth-error{display:none;align-items:center;gap:8px;font-size:12.5px;color:#dc2626;background:#fef2f2;' +
            'border:1px solid #fecaca;border-radius:10px;padding:9px 12px;margin-bottom:12px;}' +
            '.auth-error.show{display:flex;}' +
            '.auth-error.ok{color:#059669;background:#ecfdf5;border-color:#a7f3d0;}' +
            '[data-theme="dark"] .auth-error{background:rgba(220,38,38,0.12);border-color:rgba(220,38,38,0.3);}' +
            '[data-theme="dark"] .auth-error.ok{background:rgba(5,150,105,0.14);border-color:rgba(52,211,153,0.3);}' +
            '.auth-input-wrap{position:relative;margin-bottom:11px;}' +
            '.auth-input-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:17px;height:17px;' +
            'color:var(--text2);pointer-events:none;}' +
            '.auth-input{width:100%;padding:12.5px 14px 12.5px 40px;border:1.5px solid var(--border);border-radius:12px;' +
            'background:var(--bg);color:var(--text);font-family:"Hind Siliguri",Arial,sans-serif;font-size:14px;' +
            'outline:none;box-sizing:border-box;transition:border-color .15s,box-shadow .15s;}' +
            '.auth-input::placeholder{color:var(--text2);opacity:.75;}' +
            '.auth-input:focus{border-color:#059669;box-shadow:0 0 0 3px rgba(5,150,105,0.14);}' +
            '.auth-input-pass{padding-right:42px;}' +
            '.auth-pass-toggle{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:30px;height:30px;' +
            'border:none;background:transparent;color:var(--text2);display:flex;align-items:center;justify-content:center;' +
            'cursor:pointer;border-radius:8px;}' +
            '.auth-pass-toggle:hover{color:#059669;background:rgba(5,150,105,0.08);}' +
            '.auth-pass-toggle svg{width:17px;height:17px;}' +
            '.auth-forgot{text-align:right;font-size:12px;color:#059669;font-weight:600;cursor:pointer;margin:-2px 0 14px;}' +
            '.auth-forgot:hover{text-decoration:underline;}' +
            '.auth-btn{width:100%;padding:13.5px;background:linear-gradient(135deg,#059669,#10b981);color:white;' +
            'border:none;border-radius:12px;font-family:"Hind Siliguri",Arial,sans-serif;font-size:15px;font-weight:700;' +
            'cursor:pointer;box-shadow:0 6px 18px rgba(5,150,105,0.3);transition:transform .15s,box-shadow .15s;' +
            'position:relative;display:flex;align-items:center;justify-content:center;gap:8px;}' +
            '.auth-btn:active{transform:scale(.98);}' +
            '.auth-btn:disabled{opacity:.75;cursor:default;}' +
            '.auth-btn .auth-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.4);' +
            'border-top-color:#fff;animation:gkAuthSpin .7s linear infinite;display:none;}' +
            '.auth-btn.loading .auth-spinner{display:inline-block;}' +
            '@keyframes gkAuthSpin{to{transform:rotate(360deg);}}' +
            '.auth-terms{font-size:10.5px;color:var(--text2);text-align:center;line-height:1.6;margin:16px 0 20px;}' +
            '.auth-terms a{color:#059669;text-decoration:none;font-weight:600;}' +
            '.auth-terms a:hover{text-decoration:underline;}' +
            '.auth-divider{display:flex;align-items:center;gap:12px;margin:16px 0 14px;color:var(--text2);font-size:11.5px;}' +
            '.auth-divider::before,.auth-divider::after{content:"";flex:1;height:1px;background:var(--border);}' +
            '.auth-btn-google{width:100%;padding:12px;background:var(--bg);color:var(--text);border:1.5px solid var(--border);' +
            'border-radius:12px;font-family:"Hind Siliguri",Arial,sans-serif;font-size:13.5px;font-weight:700;cursor:pointer;' +
            'display:flex;align-items:center;justify-content:center;gap:10px;transition:border-color .15s,background .15s;}' +
            '.auth-btn-google:hover{border-color:#059669;background:rgba(5,150,105,0.05);}' +
            '.auth-btn-google:disabled{opacity:.6;cursor:default;}' +
            '@media (min-width:768px){#authModal{align-items:center;}.auth-card{border-radius:22px;max-width:400px;' +
            'box-shadow:0 20px 60px rgba(0,0,0,0.3);}.auth-drag-handle{display:none;}}';
        document.head.appendChild(style);
    }

    function bottomNavHTML() {
        return '<div class="bottom-nav" id="gkBottomNav">' +
            '<div class="bnav-item active" id="bnav-home" onclick="bnavActive(\'bnav-home\');gkGoHome()">' +
                '<svg class="bnav-svg" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' +
                '<span class="bnav-label">হোম</span></div>' +
            '<div class="bnav-item" id="bnav-cart" onclick="bnavActive(\'bnav-cart\');showCart()">' +
                '<div style="position:relative;"><svg class="bnav-svg" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
                '<span class="bnav-badge" id="bnavBadge">0</span></div><span class="bnav-label">ব্যাগ</span></div>' +
            '<div class="bnav-item" id="bnav-wish" onclick="bnavActive(\'bnav-wish\');showWishlist()">' +
                '<div style="position:relative;"><svg class="bnav-svg" viewBox="0 0 24 24" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
                '<span class="bnav-badge" id="bnavWishBadge">0</span></div><span class="bnav-label">উইশলিস্ট</span></div>' +
            '<div class="bnav-item" id="bnav-track" onclick="navigateTo(\'track.html\')">' +
                '<svg class="bnav-svg" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' +
                '<span class="bnav-label">ট্র্যাক</span></div>' +
            '<div class="bnav-login-pill" id="bnav-login" onclick="showLoginModal()">' +
                '<div class="bnav-login-inner"><svg class="bnav-login-svg" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '<span class="bnav-login-text">লগইন</span></div><span class="bnav-label" style="color:#059669;margin-top:2px;">একাউন্ট</span></div>' +
            '</div>';
    }

    function wishlistBoxHTML() {
        return '<div id="wishlistBox" class="wl-modal"><div class="wl-content">' +
            '<div style="padding:14px 16px;background:#dc2626;color:#fff;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;">' +
            '<h3 style="margin:0;font-size:17px;"><svg class="eico" viewBox="0 0 24 24" fill="#ec4899"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> উইশলিস্ট</h3>' +
            '<span onclick="closeWishlist()" style="cursor:pointer;font-size:26px;">&times;</span></div>' +
            '<div id="wishlistItems" style="padding:10px;"></div></div></div>';
    }

    function authModalHTML() {
        return '<div id="authModal" style="display:none;position:fixed;inset:0;background:rgba(6,20,15,0.55);' +
            'backdrop-filter:blur(2px);z-index:9999;align-items:flex-end;justify-content:center;" onclick="if(event.target===this)closeAuthModal()">' +
            '<div class="auth-card" onclick="event.stopPropagation()">' +
                '<div class="auth-drag-handle"></div>' +
                '<button class="auth-close-btn" onclick="closeAuthModal()" aria-label="বন্ধ করুন"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
                '<div class="auth-header"><div class="auth-header-logo"><img src="logo.png" alt="গ্রন্থকানন"></div>' +
                    '<div class="auth-header-title">গ্রন্থকানন-এ স্বাগতম</div>' +
                    '<div class="auth-header-sub" id="authHeaderSub">কেনাকাটা চালিয়ে যেতে লগইন করুন</div></div>' +
                '<div class="auth-tabs"><button id="loginTab" class="auth-tab auth-tab-active" onclick="switchTab(\'login\')">লগইন</button>' +
                    '<button id="registerTab" class="auth-tab" onclick="switchTab(\'register\')">রেজিস্টার</button>' +
                    '<div class="auth-tab-slider" id="authTabSlider"></div></div>' +
                '<div class="auth-body"><div id="authError" class="auth-error"></div>' +
                    '<div id="loginForm">' +
                        '<div class="auth-input-wrap"><svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
                        '<input id="loginEmail" type="text" inputmode="email" placeholder="ইমেইল বা মোবাইল নাম্বার" class="auth-input" autocomplete="email"></div>' +
                        '<div class="auth-input-wrap"><svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
                        '<input id="loginPass" type="password" placeholder="পাসওয়ার্ড" class="auth-input auth-input-pass" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')doLogin()">' +
                        '<button type="button" class="auth-pass-toggle" onclick="togglePassVis(\'loginPass\',this)" aria-label="পাসওয়ার্ড দেখুন"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg></button></div>' +
                        '<div class="auth-forgot" onclick="doForgotPassword()">পাসওয়ার্ড ভুলে গেছেন?</div>' +
                        '<button id="loginBtn" onclick="doLogin()" class="auth-btn"><span class="auth-btn-txt">লগইন করুন</span></button></div>' +
                    '<div id="registerForm" style="display:none;">' +
                        '<div class="auth-input-wrap"><svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                        '<input id="regName" type="text" placeholder="আপনার নাম" class="auth-input" autocomplete="name"></div>' +
                        '<div class="auth-input-wrap"><svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
                        '<input id="regEmail" type="email" placeholder="ইমেইল" class="auth-input" autocomplete="email"></div>' +
                        '<div class="auth-input-wrap"><svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
                        '<input id="regPass" type="password" placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" class="auth-input auth-input-pass" autocomplete="new-password" onkeydown="if(event.key===\'Enter\')doRegister()">' +
                        '<button type="button" class="auth-pass-toggle" onclick="togglePassVis(\'regPass\',this)" aria-label="পাসওয়ার্ড দেখুন"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg></button></div>' +
                        '<button id="registerBtn" onclick="doRegister()" class="auth-btn"><span class="auth-btn-txt">রেজিস্টার করুন</span></button></div>' +
                    '<div class="auth-divider"><span>অথবা</span></div>' +
                    '<button type="button" id="googleBtn" onclick="doGoogleLogin()" class="auth-btn-google">' +
                        '<svg viewBox="0 0 48 48" style="width:18px;height:18px;flex-shrink:0;"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>' +
                        '<span>Google দিয়ে চালিয়ে যান</span></button>' +
                    '<p class="auth-terms">চালিয়ে গেলে আপনি আমাদের <a href="terms.html">শর্তাবলী</a> ও <a href="privacy.html">প্রাইভেসি পলিসি</a>-তে সম্মত হচ্ছেন।</p>' +
                '</div></div></div>';
    }

    function injectNavAuth() {
        /* checkout.html-এ বটম নেভিগেশন বার দরকার নেই — কেনাকাটা শেষ করার
           ফোকাস নষ্ট করে, তাই এই পেজে এটা বসানো হয় না */
        var isCheckout = location.pathname.indexOf('checkout.html') !== -1 || location.pathname.endsWith('checkout.html');
        var needsNav = !isCheckout && !document.getElementById('gkBottomNav') && !document.getElementById('bnav-home');
        var needsWL = !document.getElementById('wishlistBox');
        var needsAuth = !document.getElementById('authModal');
        if (needsNav || needsWL || needsAuth) ensureNavAuthCSS();
        if (needsNav) document.body.insertAdjacentHTML('beforeend', bottomNavHTML());
        if (needsWL) document.body.insertAdjacentHTML('beforeend', wishlistBoxHTML());
        if (needsAuth) document.body.insertAdjacentHTML('beforeend', authModalHTML());
        window.gkRefreshBadges();
        try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().onAuthStateChanged(function (user) { window.updateAuthUI(user); });
            }
        } catch (e) {}
    }

    /* ── হোমে ফেরা: index.html-এই হলে স্ক্রল-টপ, নাহলে রিডাইরেক্ট ── */
    window.gkGoHome = window.gkGoHome || function () {
        var onHome = /(^|\/)index\.html$/.test(location.pathname) || /\/$/.test(location.pathname);
        if (onHome && typeof scrollToTop === 'function') { scrollToTop(); }
        else { window.location.href = 'index.html'; }
    };

    window.bnavActive = window.bnavActive || function (id) {
        document.querySelectorAll('.bnav-item').forEach(function (el) { el.classList.remove('active'); });
        var el = document.getElementById(id);
        if (el) el.classList.add('active');
    };

    /* ── ব্যাজ (কার্ট/উইশলিস্ট সংখ্যা) — সরাসরি localStorage থেকে, তাই সব পেজে নির্ভুল ── */
    window.gkRefreshBadges = window.gkRefreshBadges || function () {
        try {
            var c = JSON.parse(localStorage.getItem('gronthokanon_cart')) || [];
            var bb = document.getElementById('bnavBadge');
            if (bb) { bb.innerText = c.length; bb.classList.toggle('show', c.length > 0); }
        } catch (e) {}
        try {
            var w = JSON.parse(localStorage.getItem('gronthokanon_wishlist')) || [];
            var wb = document.getElementById('bnavWishBadge');
            if (wb) { wb.innerText = w.length; wb.classList.toggle('show', w.length > 0); }
            var wc = document.getElementById('wishCount');
            if (wc) wc.innerText = w.length;
        } catch (e) {}
    };
    /* আগে এখানে setInterval(fn, 900) দিয়ে প্রতি ৯০০ms অন্তর forever poll করা
       হতো — পেজ যতক্ষণ খোলা থাকত ততক্ষণ অকারণে ব্যাটারি/CPU খরচ হতো, এমনকি
       কার্ট/উইশলিস্ট কিছুই না বদলালেও। এখন localStorage.setItem/removeItem-কে
       ছোট করে wrap করে event-driven করা হলো — শুধু কার্ট/উইশলিস্ট key বদলালেই
       ব্যাজ রিফ্রেশ হয়, অন্য কোনো localStorage write-এ কিছুই হয় না। অন্য ট্যাবে
       বদল হলে (browser-এর native 'storage' event) সেটাও ধরা হয়। কোনো কারণে
       override ব্যর্থ হলে (পুরনো/রেস্ট্রিক্টেড ব্রাউজার) নিরাপদে আগের polling-এ
       ফিরে যায়, যাতে ব্যাজ কখনো বাসি না থেকে যায়। */
    (function () {
        try {
            var WATCHED = { gronthokanon_cart: 1, gronthokanon_wishlist: 1 };
            var origSet = localStorage.setItem.bind(localStorage);
            var origRemove = localStorage.removeItem.bind(localStorage);
            localStorage.setItem = function (key, value) {
                origSet(key, value);
                if (WATCHED[key]) window.gkRefreshBadges();
            };
            localStorage.removeItem = function (key) {
                origRemove(key);
                if (WATCHED[key]) window.gkRefreshBadges();
            };
            window.addEventListener('storage', function (e) {
                if (WATCHED[e.key]) window.gkRefreshBadges();
            });
            window.gkRefreshBadges(); /* প্রাথমিক পেইন্ট */
        } catch (e) {
            setInterval(function () { window.gkRefreshBadges(); }, 900);
        }
    })();

    /* ── PDF লাইব্রেরি (html2canvas + jsPDF, ~২০০KB) — পেজ লোডে না নামিয়ে শুধু
       কেউ ইনভয়েস/ব্লগ PDF ডাউনলোড চাপলে তখন একবার নামায় ── */
    window.gkLoadPdfLibs = window.gkLoadPdfLibs || (function () {
        var p = null;
        function load(src) {
            return new Promise(function (res, rej) {
                var s = document.createElement('script');
                s.src = src; s.onload = res; s.onerror = function () { p = null; rej(new Error('PDF লাইব্রেরি লোড হয়নি — নেট চেক করুন')); };
                document.head.appendChild(s);
            });
        }
        return function () {
            if (typeof html2canvas !== 'undefined' && window.jspdf) return Promise.resolve();
            if (!p) p = Promise.all([
                load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
                load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
            ]);
            return p;
        };
    })();

    /* ── উইশলিস্ট ড্রয়ার (books/getImg/goToBook যে পেজে সংজ্ঞায়িত আছে, সেখানে পূর্ণ তথ্য দেখাবে) ──
       msg দিলে ড্রয়ারের ভেতরেই উপরে একটা কনফার্মেশন লাইন দেখায় (যোগ/সরানো হয়েছে) —
       আলাদা পপআপের বদলে, যেন ড্রয়ার খোলা থাকা অবস্থায় বার্তাটা আড়ালে না পড়ে */
    window.showWishlist = window.showWishlist || function (msg) {
        injectNavAuth();
        var sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active') && typeof toggleSidebar === 'function') toggleSidebar();
        var wl = [];
        try { wl = JSON.parse(localStorage.getItem('gronthokanon_wishlist')) || []; } catch (e) {}
        var box = document.getElementById('wishlistItems');
        if (!box) return;
        var msgHtml = msg ? '<div style="padding:9px 12px;margin:10px;background:#ecfdf5;border:1.5px solid #6ee7b7;border-radius:8px;color:#065f46;font-size:12.5px;font-weight:700;">' + msg + '</div>' : '';
        if (!wl.length) {
            box.innerHTML = msgHtml + '<div style="text-align:center;padding:60px 20px;color:var(--text2);"><div style="font-size:40px;margin-bottom:10px;">🤍</div><p>উইশলিস্ট খালি</p></div>';
        } else if (typeof books !== 'undefined') {
            /* getImg/goToBook সব পেজে থাকে না (যেমন book.html) — না থাকলে নিজেই ছবি বের করে
               আর বইয়ের পেজে নিয়ে যায়, যাতে সব পেজে হোমের মতো ছবিসহ পূর্ণ তালিকা দেখায় */
            var imgOf = typeof getImg === 'function' ? getImg : function (bk) {
                return (typeof bookImgs !== 'undefined' && bookImgs[bk.name]) || bk.img || 'book-placeholder.svg';
            };
            window.gkWLOpen = window.gkWLOpen || function (idx) {
                if (typeof goToBook === 'function') return goToBook(idx);
                var bk = books[idx];
                window.location.href = 'book.html?id=' + encodeURIComponent((bk && bk.bid) || idx);
            };
            box.innerHTML = msgHtml + wl.map(function (name) {
                var b = books.find(function (bk) { return bk.name === name; });
                if (!b) return '';
                var idx = books.indexOf(b);
                var safeName = escapeHTML(name);
                return '<div style="display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid var(--border);cursor:pointer;" onclick="gkWLOpen(' + idx + ')">' +
                    '<img src="' + escapeHTML(imgOf(b)) + '" style="width:44px;height:58px;object-fit:cover;border-radius:6px;">' +
                    '<div style="flex:1;"><div style="font-size:13px;font-weight:700;color:var(--text);">' + safeName + '</div><div style="font-size:12px;color:#dc2626;font-weight:bold;">৳' + (Number(b.price) || 0) + '</div></div>' +
                    '<button data-name="' + safeName + '" onclick="event.stopPropagation();toggleWL(event,this.dataset.name)" style="background:none;border:none;font-size:18px;cursor:pointer;" onmousedown="event.preventDefault()">❌</button></div>';
            }).join('');
        } else {
            /* এই পেজে বইয়ের ডেটা লোড করা নেই (যেমন checkout.html) — শুধু নাম দেখাও, হোম পেজে বিস্তারিত */
            box.innerHTML = msgHtml + '<div style="padding:16px;">' + wl.map(function (name) {
                return '<div style="padding:10px 4px;border-bottom:1px solid var(--border);font-size:13px;color:var(--text);">' + escapeHTML(name) + '</div>';
            }).join('') + '<button onclick="window.location.href=\'index.html\'" style="width:100%;margin-top:12px;padding:11px;background:#059669;color:#fff;border:none;border-radius:8px;font-family:\'Hind Siliguri\',Arial,sans-serif;font-weight:700;cursor:pointer;">হোম পেজে বিস্তারিত দেখুন</button></div>';
        }
        document.getElementById('wishlistBox').style.display = 'flex';
    };
    window.closeWishlist = window.closeWishlist || function () {
        var b = document.getElementById('wishlistBox');
        if (b) b.style.display = 'none';
    };

    /* ── অথ মোডাল ── */
    window.showLoginModal = window.showLoginModal || function () {
        injectNavAuth();
        document.getElementById('authModal').style.display = 'flex';
    };
    window.closeAuthModal = window.closeAuthModal || function () {
        var m = document.getElementById('authModal');
        if (m) m.style.display = 'none';
        window.setAuthErr('');
    };
    window.switchTab = window.switchTab || function (tab) {
        document.getElementById('loginTab').classList.toggle('auth-tab-active', tab === 'login');
        document.getElementById('registerTab').classList.toggle('auth-tab-active', tab === 'register');
        document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
        var slider = document.getElementById('authTabSlider');
        if (slider) slider.style.transform = tab === 'register' ? 'translateX(100%)' : 'translateX(0)';
        var sub = document.getElementById('authHeaderSub');
        if (sub) sub.innerText = tab === 'register' ? 'নতুন একাউন্ট খুলে কেনাকাটা শুরু করুন' : 'কেনাকাটা চালিয়ে যেতে লগইন করুন';
        window.setAuthErr('');
    };
    window.setAuthBtnLoading = window.setAuthBtnLoading || function (btn, loading, defaultTxt) {
        if (!btn) return;
        btn.disabled = loading;
        btn.classList.toggle('loading', loading);
        var txtEl = btn.querySelector('.auth-btn-txt');
        if (loading) {
            if (!btn.querySelector('.auth-spinner')) {
                var sp = document.createElement('span'); sp.className = 'auth-spinner'; btn.insertBefore(sp, btn.firstChild);
            }
            if (txtEl) txtEl.innerText = 'একটু অপেক্ষা করুন...';
        } else {
            if (txtEl) txtEl.innerText = defaultTxt;
        }
    };
    window.togglePassVis = window.togglePassVis || function (id, btn) {
        var inp = document.getElementById(id); if (!inp) return;
        var showing = inp.type === 'text';
        inp.type = showing ? 'password' : 'text';
        btn.innerHTML = showing
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.62 21.62 0 0 1 5.06-6.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    };
    window.setAuthErr = window.setAuthErr || function (msg, type) {
        var el = document.getElementById('authError'); if (!el) return;
        el.classList.remove('ok');
        if (!msg) { el.classList.remove('show'); el.innerHTML = ''; return; }
        if (type === 'ok') el.classList.add('ok');
        el.innerHTML = '<svg style="width:14px;height:14px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>' + msg + '</span>';
        el.classList.add('show');
    };
    window.updateAuthUI = window.updateAuthUI || function (user) {
        var pill = document.querySelector('.bnav-login-pill .bnav-login-inner');
        var txt = document.querySelector('.bnav-login-pill .bnav-login-text');
        var lbl = document.querySelector('.bnav-login-pill .bnav-label');
        if (!pill) return;
        if (user) {
            txt.innerText = user.displayName ? user.displayName.split(' ')[0] : 'একাউন্ট';
            lbl.innerText = 'লগআউট';
            document.querySelector('.bnav-login-pill').onclick = window.doLogout;
        } else {
            txt.innerText = 'লগইন'; lbl.innerText = 'একাউন্ট';
            document.querySelector('.bnav-login-pill').onclick = window.showLoginModal;
        }
    };
    window.doLogin = window.doLogin || function () {
        var email = document.getElementById('loginEmail').value.trim();
        var pass = document.getElementById('loginPass').value;
        var btn = document.getElementById('loginBtn');
        if (!email || !pass) { window.setAuthErr('ইমেইল ও পাসওয়ার্ড দিন'); return; }
        if (email.indexOf('@') === -1) { window.setAuthErr('এখন শুধু ইমেইল দিয়ে লগইন করা যাচ্ছে — মোবাইল নাম্বার দিয়ে লগইন শীঘ্রই আসছে'); return; }
        window.setAuthBtnLoading(btn, true);
        auth.signInWithEmailAndPassword(email, pass).then(function () {
            window.closeAuthModal(); showToast('✅ স্বাগতম!', '#059669');
            window.setAuthBtnLoading(btn, false, 'লগইন করুন');
        }).catch(function (e) {
            window.setAuthErr(e.code === 'auth/wrong-password' ? 'পাসওয়ার্ড ভুল' : e.code === 'auth/user-not-found' ? 'একাউন্ট নেই' : e.code === 'auth/invalid-email' ? 'সঠিক ইমেইল দিন' : 'লগইন ব্যর্থ হয়েছে');
            window.setAuthBtnLoading(btn, false, 'লগইন করুন');
        });
    };
    window.doGoogleLogin = window.doGoogleLogin || function () {
        var btn = document.getElementById('googleBtn');
        if (typeof firebase === 'undefined' || !auth) { window.setAuthErr('Google লগইন এখন লোড হয়নি, আবার চেষ্টা করুন'); return; }
        btn.disabled = true;
        var provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then(function (result) {
            var user = result.user;
            if (user) {
                return db.ref('users/' + user.uid).once('value').then(function (snap) {
                    if (!snap.exists()) return db.ref('users/' + user.uid).set({ name: user.displayName || '', email: user.email || '', createdAt: Date.now() });
                });
            }
        }).then(function () {
            window.closeAuthModal(); showToast('✅ স্বাগতম!', '#059669');
        }).catch(function (e) {
            if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
                window.setAuthErr('Google লগইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন');
            }
        }).then(function () { btn.disabled = false; });
    };
    window.doRegister = window.doRegister || function () {
        var name = document.getElementById('regName').value.trim();
        var email = document.getElementById('regEmail').value.trim();
        var pass = document.getElementById('regPass').value;
        var btn = document.getElementById('registerBtn');
        if (!name || !email || !pass) { window.setAuthErr('সব তথ্য পূরণ করুন'); return; }
        if (pass.length < 6) { window.setAuthErr('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'); return; }
        window.setAuthBtnLoading(btn, true);
        auth.createUserWithEmailAndPassword(email, pass).then(function (cred) {
            return cred.user.updateProfile({ displayName: name }).then(function () {
                return db.ref('users/' + cred.user.uid).set({ name: name, email: email, createdAt: Date.now() });
            });
        }).then(function () {
            window.closeAuthModal(); showToast('✅ রেজিস্ট্রেশন সফল!', '#059669');
            window.setAuthBtnLoading(btn, false, 'রেজিস্টার করুন');
        }).catch(function (e) {
            window.setAuthErr(e.code === 'auth/email-already-in-use' ? 'এই ইমেইলে আগেই একাউন্ট আছে' : e.code === 'auth/invalid-email' ? 'সঠিক ইমেইল দিন' : 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
            window.setAuthBtnLoading(btn, false, 'রেজিস্টার করুন');
        });
    };
    window.doForgotPassword = window.doForgotPassword || function () {
        var email = document.getElementById('loginEmail').value.trim();
        if (!email) { window.setAuthErr('আগে ইমেইলের ঘরে আপনার ইমেইল লিখুন'); return; }
        auth.sendPasswordResetEmail(email).then(function () {
            window.setAuthErr('✅ পাসওয়ার্ড রিসেট লিংক ' + email + '-এ পাঠানো হয়েছে', 'ok');
        }).catch(function (e) {
            window.setAuthErr(e.code === 'auth/user-not-found' ? 'এই ইমেইলে কোনো একাউন্ট নেই' : 'রিসেট লিংক পাঠানো যায়নি, আবার চেষ্টা করুন');
        });
    };
    window.doLogout = window.doLogout || function () {
        auth.signOut().then(function () { showToast('লগআউট হয়েছে', '#6b7280'); window.updateAuthUI(null); });
    };

    function init() {
        injectNavAuth();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

/* ═══════════════════════════════════════════════════════════════
   bfcache (Back-Forward Cache) সাপোর্ট — Firebase WebSocket এরর বন্ধ

   পেজ hide/freeze হওয়ার ঠিক আগে Firebase Realtime DB-কে ইচ্ছাকৃতভাবে
   অফলাইনে পাঠিয়ে দেই, আর পেজ আবার visible হলে অনলাইনে ফিরিয়ে আনি।
   এতে ব্রাউজার কনসোলে "WebSocket ... Page entered Back-Forward Cache"
   এরর আসে না, আর পেজ back/forward-এ আরও দ্রুত লোড হয় (true bfcache)।
═══════════════════════════════════════════════════════════════ */
(function () {
    if (typeof firebase === 'undefined' || typeof firebase.database !== 'function') return;
    window.addEventListener('pagehide', function () {
        try { firebase.database().goOffline(); } catch (e) {}
    });
    window.addEventListener('pageshow', function (e) {
        try { firebase.database().goOnline(); } catch (e) {}
    });
})();
/* ═══════════════════════════════════════════════════════════════
   দাম বসানো হয়নি (৳0) এমন বই তালিকায় দেখানো হয় না।
   ডেটা মুছে না, বইয়ের নম্বরও (index) পাল্টায় না — তাই Firebase-এর
   স্টকের তথ্য ঠিক থাকে। অ্যাডমিন প্যানেলে দাম বসালেই আবার দেখাবে।
═══════════════════════════════════════════════════════════════ */
function gkIsHiddenBook(b) {
    return !b || Number(b.price) === 0;
}
function gkVisibleBooks(list) {
    return (list || []).filter(function (b) { return !gkIsHiddenBook(b); });
}
window.gkIsHiddenBook = gkIsHiddenBook;
window.gkVisibleBooks = gkVisibleBooks;

/* ═══════════════════════════════════════════════════════════════
   ডেস্কটপ/মোবাইল ভিউ টগল — নিচে-বামে ভাসমান বাটন (.view-toggle-fab,
   প্রতিটা পেজে আলাদা করে বসানো) দিয়ে চালু হয়।
   ফোনে "ডেস্কটপ ভার্সন" দেখাতে viewport meta বদলালেই হয়, কিন্তু
   ডেস্কটপ ব্রাউজারে "মোবাইল ভার্সন" জোর করে দেখাতে viewport meta ট্রিক
   কাজ করে না (ডেস্কটপ ব্রাউজার আসল window width দিয়েই media query
   ইভালুয়েট করে) — তাই mobile-view.html নামের wrapper পেজে আসল সাইটকে
   সরু (390px) একটা <iframe>-এর ভেতরে দেখানো হয়।
═══════════════════════════════════════════════════════════════ */
function toggleViewMode(){
  if(window.top !== window.self){
    try{ localStorage.removeItem('od_view_mode'); }catch(e){}
    window.top.location.href = (location.pathname.split('/').pop() || 'index.html') + location.search;
    return;
  }
  let cur; try{ cur = localStorage.getItem('od_view_mode'); }catch(e){ cur = null; }
  const next = cur === 'desktop' ? 'mobile' : 'desktop';
  try{ localStorage.setItem('od_view_mode', next); }catch(e){}
  location.reload();
}
(function(){
  const inFrame = window.top !== window.self;
  let cur; try{ cur = localStorage.getItem('od_view_mode'); }catch(e){ cur = null; }
  const desktopLabel = '🖥️ ডেস্কটপ ভার্সন দেখুন';
  const mobileLabel = '📱 মোবাইল ভার্সন দেখুন';
  const link = document.getElementById('viewModeToggle'); /* ফুটারে রাখলে */
  if(link) link.textContent = inFrame ? desktopLabel : (cur === 'desktop' ? mobileLabel : desktopLabel);
  /* fab লুকআপ DOMContentLoaded-এর ভেতরে রাখা জরুরি — এই স্ক্রিপ্ট
     বাটনের আগে (head-এ বা common.js হিসেবে) লোড হলে getElementById
     তখনো null রিটার্ন করবে (DOM তখনো পার্স হয়নি) */
  document.addEventListener('DOMContentLoaded', function(){
    const fab = document.getElementById('viewModeFab');
    if(fab) fab.textContent = inFrame ? '🖥️' : (cur === 'desktop' ? '📱' : '🖥️');
    if(fab) fab.title = link ? link.textContent : desktopLabel;
  });
})();

/* ═══════════════════════════════════════════════════════════════
   বিষয়ের নাম মেলানো — অ্যাডমিনে হাতে লেখা নাম (যেমন "আত্নশুদ্ধি") আর বইয়ে
   বসানো বিষয় ("আত্মশুদ্ধি") বানানে একটু আলাদা হলে আগে কোনো বই আসত না।
   এখন সবচেয়ে কাছের আসল বিষয়টা খুঁজে দেয় (অক্ষর-জোড়ার মিল দিয়ে)।
   কিছুই না মিললে null — তখন ডাকার জায়গা নিজের বিকল্প ব্যবহার করে।
═══════════════════════════════════════════════════════════════ */
window.gkResolveSubject = function (label) {
    label = String(label || '').trim();
    if (!label || typeof books === 'undefined' || !Array.isArray(books)) return null;
    var counts = {}, cats = {};
    books.forEach(function (b) {
        if (!b) return;
        if (b.cat) cats[b.cat] = 1;
        var s = String(b.subject || '').trim();
        if (s) counts[s] = (counts[s] || 0) + 1;
    });
    if (counts[label]) return label;
    function norm(s) { return String(s).normalize('NFC').replace(/[\s()\[\]{}.,।:;'"`\-–—_\/\\|!?]+/g, ''); }
    function grams(s) { var g = {}; for (var i = 0; i < s.length - 1; i++) { var k = s.substr(i, 2); g[k] = (g[k] || 0) + 1; } return g; }
    var a = norm(label), ga = grams(a), na = Math.max(a.length - 1, 1);
    var best = null, bestScore = 0;
    Object.keys(counts).forEach(function (s) {
        if (counts[s] < 2 || cats[s]) return;      /* ক্যাটাগরির নামকে বিষয় ধরব না */
        var b = norm(s), gb = grams(b), nb = Math.max(b.length - 1, 1), common = 0;
        for (var k in ga) if (gb[k]) common += Math.min(ga[k], gb[k]);
        var score = 2 * common / (na + nb);
        if (score > bestScore) { bestScore = score; best = s; }
    });
    return bestScore >= 0.5 ? best : null;
};
/* কোনো বইয়ের নিজের বিষয় — শুধু যদি সেটা আসল বিষয় হয় (ক্যাটাগরির নাম নয়, অন্তত ২টা বই আছে) */
window.gkBookSubject = function (b) {
    if (!b || typeof books === 'undefined') return null;
    var s = String(b.subject || '').trim();
    if (!s || books.some(function (x) { return x && x.cat === s; })) return null;
    return books.filter(function (x) { return x && String(x.subject || '').trim() === s; }).length >= 2 ? s : null;
};

/* ═══════════════════════════════════════════════════════════════
   ক্যাটাগরি মেনু বার — যে পেজে <div id="gkMenuBar"></div> আছে সেখানে বসে
   (হোমপেজে ব্যানারের উপরে, filter/book পেজে নেভবারের নিচে)।
   ক্যাটাগরি ও সাব-ক্যাটাগরি আসে অ্যাডমিনের siteConfig/categoryTree থেকে —
   অ্যাডমিন প্যানেলে ক্যাটাগরি বদলালে মেনুও আপনাআপনি বদলায়।
   শেষে "লেখক" আর "প্রকাশনী" — সব লেখক/প্রকাশনীর তালিকা (all.html)।
═══════════════════════════════════════════════════════════════ */
(function () {
    var CACHE = 'gk_cattree_cache_v1';
    var DEFAULT_TREE = [
        { name: 'ইসলামি বই', subs: ['আকিদা', 'ফিকহ', 'হাদিস', 'তাফসির', 'সিরাত'] },
        { name: 'একাডেমিক বই', subs: ['ক্লাস ১-৫', 'ক্লাস ৬-১০', 'HSC'] },
        { name: 'মাদ্রাসার বই', subs: ['নাহু-সরফ', 'কিতাব'] },
        { name: 'Pre Order', subs: [] },
        { name: 'আত্মউন্নয়ন বই', subs: ['মোটিভেশন', 'লিডারশিপ'] },
        { name: 'English বই', subs: [] },
        { name: 'প্যাকেজসমূহ', subs: [] },
        { name: 'Sunnah Item', subs: ['আতর', 'মিসওয়াক', 'পাঞ্জাবি', 'টুপি', 'হিজাব'] },
        { name: 'Stationery', subs: [] },
        { name: 'খাবার', subs: ['মধু', 'খেজুর', 'কালোজিরা'] }
    ];
    /* ইংরেজি নামের বাংলা লেবেল (লিংকে আসল নামই যায়) */
    var LABEL = { 'Pre Order': 'প্রি-অর্ডার', 'Sunnah Item': 'সুন্নাহ আইটেম', 'Stationery': 'স্টেশনারি' };
    var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function norm(list) {
        if (!Array.isArray(list)) list = list && typeof list === 'object' ? Object.values(list) : [];
        return list.filter(function (c) { return c && c.name; }).map(function (c) {
            var subs = Array.isArray(c.subs) ? c.subs : (c.subs && typeof c.subs === 'object' ? Object.values(c.subs) : []);
            return { name: String(c.name), subs: subs.filter(Boolean).map(String) };
        });
    }
    function readTree() {
        try { var c = JSON.parse(localStorage.getItem(CACHE) || 'null'); if (c && c.length) return c; } catch (e) {}
        return DEFAULT_TREE;
    }
    function fl(type, value) { return 'filter.html?type=' + type + '&value=' + encodeURIComponent(value); }

    /* অ্যাডমিনের তালিকার সাব-ক্যাটাগরি নাম আর বইয়ে বসানো "বিষয়" সবসময় মেলে না —
       তাই মেনু বানাই বইয়ের আসল তথ্য থেকে: শুধু যেসব ক্যাটাগরি/বিষয়ে সত্যিই বই আছে
       (খালি পেজে কেউ না যায়), বেশি বই যেখানে সেটা আগে। ক্রম অ্যাডমিনের তালিকা অনুযায়ী। */
    var TAGSET = { 'Pre Order': 1, 'Best Selling': 1, 'New Arrived': 1, 'Trending': 1, 'Best Writer': 1, 'নতুন প্রকাশিত': 1, 'দরসি কিতাব': 1 };
    function menuData() {
        var tree = readTree();
        var list = (typeof books !== 'undefined' && Array.isArray(books) && books.length) ? books : null;
        if (!list) return { cats: tree.map(function (c) { return { name: c.name, subs: [] }; }), pre: 0 };
        var cat = {}, pre = 0;
        list.forEach(function (b) {
            if (!b || (window.gkIsHiddenBook && window.gkIsHiddenBook(b))) return;
            var tags = Array.isArray(b.tags) ? b.tags : [];
            if (tags.indexOf('Pre Order') > -1 || b.cat === 'Pre Order') pre++;
            var c = b.cat || (Array.isArray(b.cats) && b.cats[0]) || '';
            if (!c || TAGSET[c]) return;
            var e = cat[c] || (cat[c] = { n: 0, subs: {} });
            e.n++;
            var s = String(b.subject || '').trim();
            if (s && s !== c && !TAGSET[s]) e.subs[s] = (e.subs[s] || 0) + 1;
        });
        var cats = tree.filter(function (c) { return cat[c.name] && cat[c.name].n; }).map(function (c) {
            var subs = Object.keys(cat[c.name].subs)
                .filter(function (s) { return cat[c.name].subs[s] >= 2; })
                .sort(function (a, b) { return cat[c.name].subs[b] - cat[c.name].subs[a]; });
            return { name: c.name, subs: subs.length >= 2 ? subs : [] };
        });
        return { cats: cats, pre: pre };
    }
    var MENU = { cats: [], pre: 0 };

    var openBtn = null, dropEl = null, hoverT = null;
    function closeDrop() {
        if (dropEl) dropEl.classList.remove('open');
        if (openBtn) openBtn.classList.remove('open');
        openBtn = null;
    }
    function openDrop(btn) {
        if (openBtn === btn) return;
        closeDrop();
        var cat = btn.getAttribute('data-cat');
        var c = MENU.cats.filter(function (x) { return x.name === cat; })[0];
        if (!c || !c.subs.length) return;
        if (!dropEl) {
            dropEl = document.createElement('div');
            dropEl.className = 'gk-mb-drop';
            dropEl.addEventListener('mouseenter', function () { clearTimeout(hoverT); });
            dropEl.addEventListener('mouseleave', function () { hoverT = setTimeout(closeDrop, 200); });
            document.body.appendChild(dropEl);
        }
        dropEl.innerHTML = '<a class="gk-mb-all" href="' + fl('cat', c.name) + '">সব ' + esc(LABEL[c.name] || c.name) + ' →</a>' +
            c.subs.map(function (s) { return '<a href="' + fl('subcat', s) + '">' + esc(s) + '</a>'; }).join('');
        /* অনেক বিষয় থাকলে কম্পিউটারে ৩ কলামে — এক লম্বা তালিকায় স্ক্রল করতে না হয় */
        dropEl.classList.toggle('wide', c.subs.length > 12 && window.innerWidth > 700);
        var r = btn.getBoundingClientRect();
        dropEl.style.top = Math.round(r.bottom) + 'px';
        dropEl.classList.add('open');
        var w = dropEl.offsetWidth;
        dropEl.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
        btn.classList.add('open');
        openBtn = btn;
    }

    function activeKey() {
        var p = new URLSearchParams(location.search), path = location.pathname.split('/').pop();
        if (path === 'all.html') return 'list:' + (p.get('type') || '');
        if (path === 'filter.html' && p.get('type') === 'tag') return 'tag:' + (p.get('value') || '');
        if (path === 'filter.html' && (p.get('type') === 'cat' || p.get('type') === 'subcat')) return (p.get('type') === 'cat' ? 'cat:' : 'sub:') + (p.get('value') || '');
        return '';
    }

    function render() {
        var host = document.getElementById('gkMenuBar');
        if (!host) return;
        MENU = menuData();
        var act = activeKey();
        var html = MENU.cats.map(function (c) {
            var label = esc(LABEL[c.name] || c.name);
            var isAct = act === 'cat:' + c.name || (act.indexOf('sub:') === 0 && c.subs.indexOf(act.slice(4)) > -1);
            if (c.subs.length) return '<button type="button" class="gk-mb-item' + (isAct ? ' active' : '') + '" data-cat="' + esc(c.name) + '">' + label + CHEV + '</button>';
            return '<a class="gk-mb-item' + (isAct ? ' active' : '') + '" href="' + fl('cat', c.name) + '">' + label + '</a>';
        }).join('');
        if (MENU.pre) html += '<a class="gk-mb-item' + (act === 'tag:Pre Order' ? ' active' : '') + '" href="' + fl('tag', 'Pre Order') + '">প্রি-অর্ডার</a>';
        html += '<a class="gk-mb-item' + (act === 'list:author' ? ' active' : '') + '" href="all.html?type=author">লেখক</a>';
        html += '<a class="gk-mb-item' + (act === 'list:pub' ? ' active' : '') + '" href="all.html?type=pub">প্রকাশনী</a>';
        host.className = 'gk-menubar';
        host.innerHTML = '<div class="gk-menubar-inner">' + html + '</div>';

        var inner = host.firstChild;
        inner.querySelectorAll('button[data-cat]').forEach(function (btn) {
            /* ফোনে চাপলে খোলে/বন্ধ হয়; ডেস্কটপে মাউস রাখলেই খোলে */
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (openBtn === btn) closeDrop(); else openDrop(btn);
            });
            btn.addEventListener('mouseenter', function () {
                if (!window.matchMedia('(hover:hover)').matches) return;
                clearTimeout(hoverT); openDrop(btn);
            });
            btn.addEventListener('mouseleave', function () { hoverT = setTimeout(closeDrop, 200); });
        });
        inner.addEventListener('scroll', closeDrop, { passive: true });
        /* বর্তমান ক্যাটাগরি স্ক্রলের বাইরে থাকলে দেখা যায় এমন জায়গায় আনি */
        var a = inner.querySelector('.active');
        if (a && a.offsetLeft + a.offsetWidth > inner.clientWidth) inner.scrollLeft = a.offsetLeft - 16;
    }

    document.addEventListener('click', function (e) { if (dropEl && !dropEl.contains(e.target)) closeDrop(); });
    window.addEventListener('scroll', closeDrop, { passive: true });
    window.addEventListener('resize', closeDrop);

    function init() {
        if (!document.getElementById('gkMenuBar')) return;
        render();
        /* অ্যাডমিনের লাইভ বুকলিস্ট এলে (নতুন বই/বিষয়) মেনু আবার হিসাব করি */
        if (window.GK_BOOKS_LIVE) window.GK_BOOKS_LIVE.then(function (ok) { if (ok) render(); });
        /* অ্যাডমিনের সর্বশেষ ক্যাটাগরি তালিকা (ছোট ডাটা) — বদলালে ক্যাশ আপডেট করে আবার আঁকি */
        fetch('https://gronthokanon-8573e-default-rtdb.firebaseio.com/siteConfig/categoryTree.json')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (v) {
                var list = norm(v);
                if (!list.length) return;
                var s = JSON.stringify(list);
                if (s === localStorage.getItem(CACHE)) return;
                try { localStorage.setItem(CACHE, s); } catch (e) {}
                render();
            }).catch(function () {});
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    window.gkRenderMenuBar = render;
})();

/* ═══════════════════════════════════════════════════════════════
   ছবি নেই এমন বইয়ের কভার — ধূসর "Not Available" ছবির বদলে বইয়ের আসল নাম,
   লেখক ও প্রকাশনী দিয়ে সাইটের রঙে একটা পরিষ্কার কভার। নিচে ছোট করে
   "ছবি শীঘ্রই আসছে" লেখা থাকে, যাতে কেউ এটাকে বইয়ের আসল প্রচ্ছদ না ভাবে।
   অ্যাডমিন থেকে আসল ছবি বসালে সেটাই দেখাবে (এটা শুধু placeholder-এর জায়গায় বসে)।
═══════════════════════════════════════════════════════════════ */
(function () {
    var PALETTE = [['#064e3b', '#10b981'], ['#1e3a8a', '#60a5fa'], ['#7c2d12', '#fb923c'], ['#581c87', '#c084fc'],
                   ['#134e4a', '#2dd4bf'], ['#7f1d1d', '#f87171'], ['#3f3f46', '#a1a1aa'], ['#713f12', '#facc15']];
    var cache = {};
    function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function hash(s) { var h = 0; s = String(s || ''); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
    function wrap(text, max, lines) {
        var words = String(text || '').split(/\s+/), out = [], cur = '';
        words.forEach(function (w) {
            if (!cur) cur = w;
            else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
            else { out.push(cur); cur = w; }
        });
        if (cur) out.push(cur);
        if (out.length > lines) { out = out.slice(0, lines); out[lines - 1] = out[lines - 1].replace(/.{0,2}$/, '') + '…'; }
        return out;
    }
    window.gkCoverFor = function (b) {
        if (!b || !b.name) return 'book-placeholder.svg';
        if (cache[b.name]) return cache[b.name];
        var c = PALETTE[hash(b.pub || b.author || b.name) % PALETTE.length];
        var title = wrap(b.name, 13, 4), fs = title.length > 3 ? 24 : 28;
        var y0 = 150 - (title.length - 1) * (fs * 0.62);
        var FONT = "'Noto Serif Bengali','Noto Sans Bengali','Hind Siliguri','Nirmala UI','Vrinda',serif";
        var t = title.map(function (l, i) { return '<text x="150" y="' + Math.round(y0 + i * fs * 1.28) + '" font-size="' + fs + '" font-weight="700" fill="#fff" text-anchor="middle" font-family="' + FONT + '">' + esc(l) + '</text>'; }).join('');
        var author = wrap(b.author || b.brand || '', 22, 2).map(function (l, i) { return '<text x="150" y="' + (282 + i * 22) + '" font-size="17" fill="' + c[1] + '" text-anchor="middle" font-family="' + FONT + '">' + esc(l) + '</text>'; }).join('');
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 404" width="300" height="404">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[0] + '" stop-opacity=".82"/></linearGradient></defs>' +
            '<rect width="300" height="404" fill="url(#g)"/>' +
            '<rect x="0" y="0" width="16" height="404" fill="#000" opacity=".18"/>' +
            '<rect x="30" y="26" width="244" height="352" fill="none" stroke="' + c[1] + '" stroke-opacity=".55" stroke-width="1.5"/>' +
            '<line x1="112" y1="232" x2="188" y2="232" stroke="' + c[1] + '" stroke-width="2"/>' + t + author +
            (b.pub ? '<text x="150" y="346" font-size="14" fill="#fff" fill-opacity=".75" text-anchor="middle" font-family="' + FONT + '">' + esc(wrap(b.pub, 26, 1)[0]) + '</text>' : '') +
            '<text x="150" y="368" font-size="11" fill="#fff" fill-opacity=".5" text-anchor="middle" font-family="' + FONT + '">ছবি শীঘ্রই আসছে</text>' +
            '</svg>';
        return (cache[b.name] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    };
    function findBook(name) {
        if (!name || typeof books === 'undefined') return null;
        name = String(name).trim();
        for (var i = 0; i < books.length; i++) if (books[i] && books[i].name === name) return books[i];
        return null;
    }
    function bookForImg(img) {
        if (img.id === 'bookImg' && typeof curBook !== 'undefined' && curBook) return curBook;
        var idxEl = img.closest('[data-bookidx]');
        if (idxEl && typeof books !== 'undefined') { var b = books[+idxEl.getAttribute('data-bookidx')]; if (b) return b; }
        var alt = (img.getAttribute('alt') || '').trim();
        var b2 = alt && alt !== 'বই' ? findBook(alt) : null;
        if (b2) return b2;
        var box = img.closest('.gkcb-item,.co-item,.os-item,.gka-book,.book-card,.ai-book,.bs-card,.rv-card,[class*="card"],[class*="item"]');
        if (box) {
            var n = box.querySelector('.gkcb-name,.os-name,.gka-bname,.bc-name,.ai-book-name,.book-title,[class*="name"],[class*="title"]');
            if (n) return findBook(n.textContent);
        }
        return null;
    }
    function upgrade() {
        var imgs = document.querySelectorAll('img[src$="book-placeholder.svg"]:not([data-gkmiss])');
        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i], b = bookForImg(img);
            /* কভার বসালে src আর placeholder থাকে না, তাই আবার ধরা পড়বে না; বই না পেলে বাদ রাখি */
            if (b) { img.src = window.gkCoverFor(b); if (!img.closest('.catcard-tile-img')) img.style.objectFit = 'cover'; } else img.setAttribute('data-gkmiss', '1');
        }
    }
    window.gkUpgradeCovers = upgrade;
    var t = null;
    function schedule() { clearTimeout(t); t = setTimeout(upgrade, 40); }
    function start() {
        upgrade();
        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* ═══ কার্ডে আসল রিভিউ-রেটিং — শুধু যে বইয়ে সত্যিই কেউ রিভিউ দিয়েছে তাতেই ★ দেখায়,
   কোনো বানানো রেটিং নেই। Firebase reviews একবার এনে ১০ মিনিট ক্যাশে রাখি ═══ */
(function () {
    if (!document.querySelector('script[src*="firebase-config"]')) return;
    var RATE = null, KEY = 'gk_ratings_v1';
    function bn(s) { return String(s).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); }
    function build(data) {
        var m = {};
        Object.keys(data || {}).forEach(function (k) {
            var sum = 0, n = 0, rs = data[k] || {};
            Object.keys(rs).forEach(function (rk) { var r = Number(rs[rk] && rs[rk].rating); if (r >= 1 && r <= 5) { sum += r; n++; } });
            if (n) m[k] = [Math.round(sum / n * 10) / 10, n];
        });
        return m;
    }
    function lookup(idx) {
        if (!RATE || typeof books === 'undefined') return null;
        var b = books[idx];
        return (b && b.bid && RATE[b.bid]) || RATE[String(idx)] || null;
    }
    function apply() {
        if (!RATE) return;
        document.querySelectorAll('.book-card[data-bookidx]').forEach(function (card) {
            var r = lookup(card.getAttribute('data-bookidx'));
            var el = card.querySelector('.bc-rating');
            if (!r) { if (el) el.remove(); return; }
            var html = '<span class="bc-star">★</span> ' + bn(r[0].toFixed(1)) + ' <span class="bc-rcount">(' + bn(r[1]) + ')</span>';
            if (el) { if (el.innerHTML !== html) el.innerHTML = html; return; }
            var anchor = card.querySelector('.bc-author') || card.querySelector('.bc-name');
            if (!anchor) return;
            anchor.insertAdjacentHTML('afterend', '<div class="bc-rating" title="' + bn(r[1]) + ' জন পাঠকের রিভিউ">' + html + '</div>');
        });
    }
    window.gkSetRatings = function (data) { RATE = build(data); try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), m: RATE })); } catch (e) {} apply(); };
    function load() {
        if (RATE) return;
        if (!document.querySelector('.book-card')) { setTimeout(load, 1500); return; }
        try { var c = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (c && Date.now() - c.t < 600000) { RATE = c.m; apply(); return; } } catch (e) {}
        fetch('https://gronthokanon-8573e-default-rtdb.firebaseio.com/reviews.json').then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) { if (d) window.gkSetRatings(d); }).catch(function () {});
    }
    var t;
    function start() {
        setTimeout(load, 1200);
        new MutationObserver(function () { if (!RATE) return; clearTimeout(t); t = setTimeout(apply, 80); })
            .observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
