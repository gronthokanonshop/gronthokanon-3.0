/* ═══════════════════════════════════════
   আল আজিজ বুকশপ — Common JavaScript
   সব page এ shared হয় এই JS
═══════════════════════════════════════ */

/* ═══ DARK MODE ═══ */
function toggleDark() {
    const h = document.documentElement;
    const isDark = h.getAttribute('data-theme') === 'dark';
    h.setAttribute('data-theme', isDark ? 'light' : 'dark');
    const btn = document.getElementById('darkBtn');
    if (btn) btn.innerText = isDark ? '🌙' : '☀️';
    localStorage.setItem('alaziz_theme', isDark ? 'light' : 'dark');
}

/* Dark theme auto-apply on page load */
(function () {
    const saved = localStorage.getItem('alaziz_theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('darkBtn');
    if (btn && saved === 'dark') btn.innerText = '☀️';
})();

/* ═══ TOAST NOTIFICATION ═══ */
function showToast(msg, color) {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:82px;left:50%;transform:translateX(-50%);background:${color||'#1a2e1b'};color:#fff;padding:10px 22px;border-radius:4px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 14px rgba(0,0,0,0.25);font-family:'Noto Serif Bengali',Arial,sans-serif;border:1px solid rgba(255,255,255,0.15);`;
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
}

/* ═══════════════════════════════════════
   ক্যাটাগরি (বিভাগ→উপ-বিভাগ) + ট্যাগ + প্রোডাক্ট — সব কাস্টমার পেজে shared
   (গ্রন্থকাননের মতো; পুরনো cat/cats field gracefully handle)
═══════════════════════════════════════ */
window.NF_CAT_TREE = [
    { name: 'ইসলামি বই', subs: ['আকিদা', 'ফিকহ', 'হাদিস', 'তাফসির', 'সিরাত'] },
    { name: 'একাডেমিক বই', subs: ['ক্লাস ১-৫', 'ক্লাস ৬-১০', 'HSC'] },
    { name: 'মাদ্রাসার বই', subs: ['নাহু-সরফ', 'কিতাব'] },
    { name: 'আত্মউন্নয়ন বই', subs: ['মোটিভেশন', 'লিডারশিপ'] },
    { name: 'English বই', subs: [] },
    { name: 'প্যাকেজসমূহ', subs: [] },
    { name: 'Sunnah Item', subs: ['আতর', 'মিসওয়াক', 'পাঞ্জাবি', 'টুপি', 'হিজাব'] },
    { name: 'Stationery', subs: [] },
    { name: 'খাবার', subs: ['মধু', 'খেজুর', 'কালোজিরা'] }
];
window.NF_TAGS = ['Best Selling', 'New Arrived', 'Best Writer'];
window.NF_OLD_TAGMAP = { 'Best Selling': 'Best Selling', 'নতুন প্রকাশিত': 'New Arrived', 'New Arrived': 'New Arrived', 'Best Writer': 'Best Writer' };
window.NF_TAG_NAMES = new Set(['Best Selling', 'Trending', 'New Arrived', 'নতুন প্রকাশিত', 'Pre Order', 'Best Writer']);
/* পুরনো cat কমা দিয়ে লেখা হতে পারে ("ইসলামি বই, Best Selling") — split করি */
window.nfSplitCat = function (b) {
    if (b && Array.isArray(b.cats) && b.cats.length) return b.cats.slice();
    return String((b && b.cat) || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
};
window.bookCats = function (b) { return nfSplitCat(b).filter(function (c) { return !NF_TAG_NAMES.has(c); }); };
window.bookMainCat = function (b) { var a = bookCats(b); return a[0] || nfSplitCat(b)[0] || ''; };
window.bookSubcat = function (b) { return (b && b.subcat) || ''; };
window.bookType = function (b) { return (b && b.type) || 'বই'; };
window.bookTags = function (b) {
    if (b && Array.isArray(b.tags)) return b.tags;
    var out = []; nfSplitCat(b).forEach(function (c) { var t = NF_OLD_TAGMAP[c]; if (t && out.indexOf(t) < 0) out.push(t); });
    return out;
};
window.bookHasTag = function (b, tag) { return bookTags(b).indexOf(tag) > -1; };
window.bookHasCat = function (b, cat) { return bookCats(b).indexOf(cat) > -1; };

/* ═══ PAGE NAVIGATION (smooth fade) ═══ */
function navigateTo(url) {
    document.body.style.animation = 'pageOut 0.25s ease forwards';
    setTimeout(() => window.location.href = url, 240);
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

/* ═══ CART COUNT (shared across pages) ═══ */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('alaziz_cart') || '[]');
    const el = document.getElementById('cartCount');
    if (el) el.innerText = cart.length;
}

/* ═══ BACK NAVIGATION ═══ */
/* Homepage filename */
const HOME_URL = 'index.html';
function goBack() {
    // In-site history thakle normal back
    if (window.history.length > 1 &&
        document.referrer && document.referrer.includes(location.hostname)) {
        window.history.back();
    } else {
        // Direct visit / no history → homepage e fallback
        window.location.href = HOME_URL;
    }
}

/* ═══ SIDEBAR TOGGLE ═══ */
function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('active');
    document.getElementById('overlay')?.classList.toggle('active');
}
function closeSidebars() {
    document.getElementById('sidebar')?.classList.remove('active');
    document.getElementById('overlay')?.classList.remove('active');
}

/* ═══ READING PROGRESS BAR ═══ */
(function () {
    const bar = document.getElementById('readProg');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        bar.style.width = scrollHeight > 0 ? (scrollTop / scrollHeight * 100) + '%' : '0%';
    }, { passive: true });
})();

/* ═══ হাদিয়া অফারের টার্গেট (৳) — এখানে বদলালেই সব জায়গায় বদলাবে ═══ */
window.AA_GIFT_THRESHOLD = 1000;

/* ═══ কুপন — বিল্ট-ইন FIRSTORDER + অ্যাডমিন-তৈরি কুপন (Firebase 'coupons') ═══
   টাইপ: 'percent' = % ছাড় | 'taka' = নির্দিষ্ট ৳ ছাড় | 'delivery' = ফ্রি ডেলিভারি */
window.NF_COUPONS = window.NF_COUPONS || { FIRSTORDER: { type: 'percent', value: 5 } };
window.nfCouponInfo = function (code) {
    var c = window.NF_COUPONS && window.NF_COUPONS[String(code || '').toUpperCase()];
    if (!c) return undefined;
    if (typeof c === 'number') return { type: 'percent', value: c }; /* legacy */
    return c;
};
window.nfCouponLabel = function (info) {
    if (!info) return '';
    if (info.type === 'delivery') return 'ফ্রি ডেলিভারি';
    if (info.type === 'taka') return '৳' + info.value + ' ছাড়';
    return info.value + '% ডিসকাউন্ট';
};
/* কার্টে কুপনের ছাড়ের হিসাব (delivery টাইপে পণ্যের দামে ছাড় নেই — ডেলিভারি ফ্রি হয় চেকআউটে) */
window.nfCouponDiscAmt = function (sub) {
    var code = localStorage.getItem('alaziz_coupon');
    if (!code) return 0;
    var t = localStorage.getItem('alaziz_ctype') || 'percent';
    var v = parseInt(localStorage.getItem('alaziz_cvalue') || localStorage.getItem('alaziz_discount') || '0');
    if (t === 'taka') return Math.min(v, sub);
    if (t === 'percent') return Math.round(sub * v / 100);
    return 0;
};
/* কুপন apply — সব পেজ এক নিয়মে; চেকআউটের পুরনো key-গুলোও (discount/discflat/freedeliv) সেট হয় */
window.nfApplyCouponCode = function (code) {
    code = String(code || '').trim().toUpperCase();
    var info = nfCouponInfo(code);
    if (!info) return null;
    localStorage.setItem('alaziz_coupon', code);
    localStorage.setItem('alaziz_ctype', info.type);
    localStorage.setItem('alaziz_cvalue', String(info.value));
    localStorage.setItem('alaziz_discount', String(info.type === 'percent' ? info.value : 0));
    localStorage.setItem('alaziz_discflat', String(info.type === 'taka' ? info.value : 0));
    localStorage.setItem('alaziz_freedeliv', info.type === 'delivery' ? '1' : '');
    return info;
};
window.nfRemoveCouponAll = function () {
    ['alaziz_coupon', 'alaziz_ctype', 'alaziz_cvalue', 'alaziz_discount', 'alaziz_discflat', 'alaziz_freedeliv'].forEach(function (k) { localStorage.removeItem(k); });
};
/* Firebase থেকে অ্যাডমিন-তৈরি কুপন লোড (REST — লগইন লাগে না) */
(function () {
    try {
        fetch('https://screenshot-2db71-default-rtdb.asia-southeast1.firebasedatabase.app/coupons.json')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (v) {
                if (!v || typeof v !== 'object') return;
                Object.keys(v).forEach(function (k) {
                    var c = v[k];
                    if (!c || c.active === false) return;
                    var code = String(k).toUpperCase();
                    if (typeof c.discount === 'number' && c.discount > 0 && c.discount <= 100) {
                        window.NF_COUPONS[code] = { type: 'percent', value: c.discount }; /* পুরনো ফরম্যাট */
                    } else if (c.type === 'delivery') {
                        window.NF_COUPONS[code] = { type: 'delivery', value: 0 };
                    } else if ((c.type === 'taka' || c.type === 'percent') && typeof c.value === 'number' && c.value > 0) {
                        if (c.type === 'percent' && c.value > 100) return;
                        window.NF_COUPONS[code] = { type: c.type, value: c.value };
                    }
                });
            }).catch(function () {});
    } catch (e) {}
})();

/* কার্ট সাবটোটাল থেকে গিফট-প্রগ্রেস বারের HTML বানায় (index + shared drawer দুটোই ব্যবহার করে) */
window.aaGiftBarHTML = function (subtotal) {
    const TH = window.AA_GIFT_THRESHOLD || 1000;
    if (subtotal <= 0) return '';
    const remain = TH - subtotal;
    if (remain > 0) {
        const pct = Math.min(100, Math.round(subtotal / TH * 100));
        return `<div class="aa-gift">
            <div class="aa-gift-txt">🎁 আর মাত্র <b>৳${remain}</b>-এর বই কিনলেই <b>ফ্রি হাদিয়া সামগ্রী!</b></div>
            <div class="aa-gift-track"><div class="aa-gift-fill" style="width:${pct}%"></div></div>
        </div>`;
    }
    return `<div class="aa-gift done">
        <div class="aa-gift-txt">🎉 অভিনন্দন! আপনার অর্ডারে <b>ফ্রি হাদিয়া সামগ্রী</b> যুক্ত হবে ইন শা আল্লাহ</div>
    </div>`;
};

/* গিফট-বারের CSS — সব পেজে দরকার (index/AAbook এর নিজস্ব ড্রয়ারেও) */
(function () {
    const css = document.createElement('style');
    css.textContent = `
    .aa-gift{background:linear-gradient(135deg,rgba(207,111,51,0.08),rgba(47,117,49,0.06));border:1.5px dashed rgba(207,111,51,0.45);border-radius:10px;padding:10px 12px;margin-bottom:10px;}
    .aa-gift.done{background:linear-gradient(135deg,rgba(47,117,49,0.10),rgba(121,176,123,0.08));border-color:rgba(47,117,49,0.45);}
    .aa-gift-txt{font-size:12px;font-weight:600;color:var(--text,#233023);line-height:1.6;}
    .aa-gift-txt b{color:#a85320;}
    .aa-gift.done .aa-gift-txt b{color:#2f7531;}
    .aa-gift-track{height:7px;background:rgba(0,0,0,0.08);border-radius:20px;margin-top:7px;overflow:hidden;}
    [data-theme="dark"] .aa-gift-track{background:rgba(255,255,255,0.12);}
    .aa-gift-fill{height:100%;background:linear-gradient(90deg,#cf6f33,#2f7531);border-radius:20px;transition:width .4s ease;}`;
    document.head.appendChild(css);
})();

/* ═══════════════════════════════════════
   GLOBAL CART DRAWER
   index.html ও AAbook.html-এর নিজস্ব ড্রয়ার আছে —
   বাকি সব পেজে (filter, track, about ইত্যাদি) এই শেয়ার্ড ড্রয়ারটি বসে।
═══════════════════════════════════════ */
(function () {
    if (document.getElementById('cartBox')) return; // পেজের নিজস্ব ড্রয়ার থাকলে স্কিপ

    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const readCart = () => { try { return JSON.parse(localStorage.getItem('alaziz_cart')) || []; } catch (e) { return []; } };
    const saveCart = c => localStorage.setItem('alaziz_cart', JSON.stringify(c));

    /* ── CSS ── */
    const css = document.createElement('style');
    css.textContent = `
    #aaCartOverlay{position:fixed;inset:0;background:rgba(0,0,0,.48);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:99998;opacity:0;pointer-events:none;transition:opacity .3s;}
    #aaCartOverlay.open{opacity:1;pointer-events:auto;}
    #aaCartDrawer{position:fixed;top:0;right:0;height:100%;width:340px;max-width:92vw;background:var(--card-solid,#fff);color:var(--text,#233023);z-index:99999;transform:translateX(105%);transition:transform .35s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;box-shadow:-8px 0 40px rgba(0,0,0,.18);border-radius:20px 0 0 20px;overflow:hidden;font-family:'Noto Serif Bengali',Arial,sans-serif;}
    #aaCartDrawer.open{transform:translateX(0);}
    .aa-cd-head{padding:15px 18px;background:linear-gradient(135deg,#224f23,#2f7531);color:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;border-bottom:2px solid #79b07b;}
    .aa-cd-head h3{margin:0;font-size:17px;font-weight:800;display:flex;align-items:center;gap:8px;}
    .aa-cd-count{background:rgba(255,255,255,.22);font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;}
    .aa-cd-close{cursor:pointer;font-size:24px;line-height:1;opacity:.9;background:none;border:none;color:#fff;padding:0 2px;}
    .aa-cd-items{flex:1;overflow-y:auto;padding:14px 16px;}
    .aa-cd-item{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border,#e5e7eb);}
    .aa-cd-item img{width:44px;height:58px;object-fit:cover;border-radius:8px;border:1px solid var(--border,#e5e7eb);flex-shrink:0;background:var(--bg2,#f1ede4);}
    .aa-cd-name{font-size:12.5px;font-weight:700;color:var(--text,#233023);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
    .aa-cd-price{font-size:12.5px;font-weight:800;color:#dc2626;margin-top:2px;}
    .aa-qty{display:flex;align-items:center;gap:7px;flex-shrink:0;}
    .aa-qty button{width:24px;height:24px;border-radius:7px;border:1.5px solid var(--border2,#d1d5db);background:var(--bg,#f9fafb);color:var(--text,#233023);font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;transition:.15s;}
    .aa-qty button:hover{border-color:#2f7531;color:#2f7531;}
    .aa-qty span{font-size:13px;font-weight:800;min-width:14px;text-align:center;color:var(--text,#233023);}
    .aa-cd-empty{text-align:center;padding:60px 20px;color:var(--text2,#6b7280);}
    .aa-cd-empty svg{opacity:.4;margin-bottom:10px;}
    .aa-cd-empty p{font-size:14px;font-weight:600;margin:0 0 16px;}
    .aa-cd-empty button{padding:9px 22px;background:linear-gradient(135deg,#cf6f33,#a85320);color:#fff;border:none;border-radius:10px;font-family:'Noto Serif Bengali',Arial,sans-serif;font-size:13px;font-weight:700;cursor:pointer;}
    .aa-cd-foot{padding:14px 16px 16px;border-top:1px solid var(--border,#e5e7eb);background:var(--bg,#f9fafb);flex-shrink:0;}
    .aa-cd-row{display:flex;justify-content:space-between;font-size:13px;color:var(--text2,#6b7280);padding:2.5px 0;}
    .aa-cd-row.total{font-size:15.5px;font-weight:800;color:var(--text,#233023);padding-top:6px;}
    .aa-cd-row.total span:last-child{color:#2f7531;}
    [data-theme="dark"] .aa-cd-row.total span:last-child{color:#79b07b;}
    .aa-cd-row.disc span:last-child{color:#dc2626;font-weight:700;}
    .aa-coupon{display:flex;gap:6px;margin-bottom:10px;}
    .aa-coupon input{flex:1;padding:8px 10px;border:1.5px solid var(--border2,#d1d5db);border-radius:9px;background:var(--card-solid,#fff);color:var(--text,#233023);font-family:'Noto Serif Bengali',Arial,sans-serif;font-size:12.5px;outline:none;min-width:0;}
    .aa-coupon input:focus{border-color:#2f7531;}
    .aa-coupon button{background:linear-gradient(135deg,#cf6f33,#a85320);color:#fff;border:none;padding:0 14px;border-radius:9px;cursor:pointer;font-weight:700;font-size:12.5px;font-family:'Noto Serif Bengali',Arial,sans-serif;}
    .aa-coupon-on{display:flex;align-items:center;gap:8px;padding:7px 11px;background:rgba(47,117,49,.08);border:1.5px dashed #2f7531;border-radius:9px;margin-bottom:10px;}
    .aa-coupon-on span{flex:1;font-size:12px;font-weight:700;color:#2f7531;}
    [data-theme="dark"] .aa-coupon-on span{color:#79b07b;}
    .aa-coupon-on button{background:#fee2e2;color:#dc2626;border:none;border-radius:7px;padding:4px 9px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Noto Serif Bengali',Arial,sans-serif;}
    .aa-checkout-btn{width:100%;margin-top:10px;padding:13px;background:linear-gradient(135deg,#224f23,#2f7531);color:#fff;border:none;border-radius:11px;font-family:'Noto Serif Bengali',Arial,sans-serif;font-size:14.5px;font-weight:800;cursor:pointer;box-shadow:0 3px 12px rgba(47,117,49,.3);transition:.2s;letter-spacing:.3px;}
    .aa-checkout-btn:hover{box-shadow:0 5px 16px rgba(47,117,49,.4);}
    .aa-checkout-btn:active{transform:scale(.98);}
    .aa-cd-note{text-align:center;font-size:10.5px;color:var(--text3,#9ca3af);margin-top:8px;}`;
    document.head.appendChild(css);

    /* ── HTML ── */
    function buildDrawer() {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
        <div id="aaCartOverlay" onclick="closeCart()"></div>
        <div id="aaCartDrawer">
            <div class="aa-cd-head">
                <h3><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> আপনার ব্যাগ <span class="aa-cd-count" id="aaCdCount">0</span></h3>
                <button class="aa-cd-close" onclick="closeCart()">&times;</button>
            </div>
            <div class="aa-cd-items" id="aaCdItems"></div>
            <div class="aa-cd-foot">
                <div id="aaGiftBarDrawer"></div>
                <div id="aaCouponBox"></div>
                <div class="aa-cd-row"><span>সাবটোটাল</span><span>৳<span id="aaCdSub">0</span></span></div>
                <div class="aa-cd-row disc" id="aaCdDiscRow" style="display:none;"><span>ডিসকাউন্ট (<span id="aaCdCoupon"></span>)</span><span>-৳<span id="aaCdDisc">0</span></span></div>
                <div class="aa-cd-row total"><span>মোট</span><span>৳<span id="aaCdTotal">0</span></span></div>
                <button class="aa-checkout-btn" onclick="aaGoCheckout()">✅ অর্ডার করুন</button>
                <div class="aa-cd-note">🚚 ঢাকায় ডেলিভারি ৳৬০ — ঢাকার বাইরে ৳৯০ (চেকআউটে যোগ হবে)</div>
            </div>
        </div>`;
        document.body.appendChild(wrap);
    }
    if (document.body) buildDrawer();
    else document.addEventListener('DOMContentLoaded', buildDrawer);

    /* ── ব্যাজ আপডেট (পেজভেদে ভিন্ন id) ── */
    function aaBadges(n) {
        ['cartCount', 'floatCount', 'bnavBadge'].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.innerText = n; el.classList.toggle('show', n > 0); }
        });
    }

    /* ── রেন্ডার ── */
    window.aaRenderCart = function () {
        const cart = readCart();
        const box = document.getElementById('aaCdItems');
        if (!box) return;
        document.getElementById('aaCdCount').innerText = cart.length;
        aaBadges(cart.length);

        if (!cart.length) {
            box.innerHTML = `<div class="aa-cd-empty">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <p>ব্যাগ এখনও খালি</p>
                <button onclick="closeCart()">📚 বই দেখুন</button>
            </div>`;
        } else {
            const g = {};
            cart.forEach(i => { if (g[i.name]) g[i.name].qty++; else g[i.name] = { price: Number(i.price) || 0, qty: 1, img: i.img || '' }; });
            box.innerHTML = Object.entries(g).map(([name, it]) => `
                <div class="aa-cd-item">
                    <img src="${esc(it.img) || 'book-placeholder.svg'}" alt="" onerror="this.onerror=null;this.src='book-placeholder.svg'">
                    <div style="flex:1;min-width:0;">
                        <div class="aa-cd-name">${esc(name)}</div>
                        <div class="aa-cd-price">৳${it.price}</div>
                    </div>
                    <div class="aa-qty">
                        <button data-name="${esc(name)}" onclick="aaQty(this.dataset.name,-1)">−</button>
                        <span>${it.qty}</span>
                        <button data-name="${esc(name)}" onclick="aaQty(this.dataset.name,1)">+</button>
                    </div>
                </div>`).join('');
        }

        /* কুপন UI */
        const applied = localStorage.getItem('alaziz_coupon');
        const cb = document.getElementById('aaCouponBox');
        if (applied) {
            const cLbl = nfCouponLabel({ type: localStorage.getItem('alaziz_ctype') || 'percent', value: parseInt(localStorage.getItem('alaziz_cvalue') || localStorage.getItem('alaziz_discount') || '0') });
            cb.innerHTML = `<div class="aa-coupon-on"><span>🎉 ${esc(applied)} — ${esc(cLbl)}</span><button onclick="aaRemoveCoupon()">✕ বাতিল</button></div>`;
        } else {
            cb.innerHTML = `<div class="aa-coupon"><input id="aaCouponInput" placeholder="কুপন কোড লিখুন" onkeydown="if(event.key==='Enter')aaApplyCoupon()"><button onclick="aaApplyCoupon()">Apply</button></div>`;
        }

        /* টোটাল */
        const grouped = {};
        cart.forEach(i => { grouped[i.name] = grouped[i.name] || { p: Number(i.price) || 0, q: 0 }; grouped[i.name].q++; });
        const sub = Object.values(grouped).reduce((s, x) => s + x.p * x.q, 0);
        const disc = nfCouponDiscAmt(sub);
        document.getElementById('aaGiftBarDrawer').innerHTML = aaGiftBarHTML(sub);
        document.getElementById('aaCdSub').innerText = sub;
        document.getElementById('aaCdDisc').innerText = disc;
        document.getElementById('aaCdCoupon').innerText = applied || '';
        document.getElementById('aaCdDiscRow').style.display = disc > 0 ? 'flex' : 'none';
        document.getElementById('aaCdTotal').innerText = sub - disc;
    };

    /* ── qty বদলানো ── */
    window.aaQty = function (name, delta) {
        let cart = readCart();
        if (delta === 1) {
            const item = cart.find(i => i.name === name);
            if (item) cart.push({ ...item });
        } else {
            for (let j = cart.length - 1; j >= 0; j--) {
                if (cart[j].name === name) { cart.splice(j, 1); break; }
            }
        }
        saveCart(cart);
        aaRenderCart();
    };

    /* ── কুপন (অ্যাডমিন-তৈরি সব কুপনসহ — percent/taka/ফ্রি ডেলিভারি) ── */
    window.aaApplyCoupon = function () {
        const code = (document.getElementById('aaCouponInput')?.value || '').trim().toUpperCase();
        const info = nfApplyCouponCode(code);
        if (info) {
            showToast('🎉 ' + nfCouponLabel(info) + ' যুক্ত হয়েছে!', '#2f7531');
        } else {
            showToast('❌ ভুল কুপন কোড!', '#dc2626');
        }
        aaRenderCart();
    };
    window.aaRemoveCoupon = function () {
        nfRemoveCouponAll();
        showToast('🗑️ কুপন বাতিল হয়েছে', '#6b7280');
        aaRenderCart();
    };

    /* ── চেকআউট ── */
    window.aaGoCheckout = function () {
        if (!readCart().length) { showToast('⚠️ ব্যাগ খালি!', '#dc2626'); return; }
        window.location.href = 'AAcheckout.html';
    };

    /* ── খোলা/বন্ধ ── */
    window.showCart = function () {
        aaRenderCart();
        document.getElementById('aaCartOverlay').classList.add('open');
        document.getElementById('aaCartDrawer').classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    window.closeCart = function () {
        document.getElementById('aaCartOverlay').classList.remove('open');
        document.getElementById('aaCartDrawer').classList.remove('open');
        document.body.style.overflow = '';
    };
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeCart();
    });

    /* ড্রয়ার বসার পর ব্যাজ ঠিক করা */
    document.addEventListener('DOMContentLoaded', () => aaBadges(readCart().length));
})();

/* Auto-run on load */
document.addEventListener('DOMContentLoaded', updateCartCount);

/* ═══ PWA — service worker রেজিস্টার (ফোনে অ্যাপের মতো ইনস্টল) ═══ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {});
    });
}

/* ═══════════════════════════════════════
   ভাসমান যোগাযোগ বাটন (৩-ডট) — কল / Messenger / WhatsApp
   AAcommon.js সব পেজে লোড হয় বলে সব পেজে দেখাবে
═══════════════════════════════════════ */
(function () {
    if (document.getElementById('aaFab')) return;
    var PHONE = '+8801577272305';
    var WA = 'https://wa.me/8801577272305';
    var MSG = 'https://www.facebook.com/share/1DAXTV8v3a/'; /* Messenger/FB পেজ — m.me ইউজারনেম দিলে সরাসরি চ্যাট খুলবে */

    var css = document.createElement('style');
    css.textContent = `
    #aaFab{position:fixed;left:16px;bottom:20px;z-index:9990;font-family:'Noto Serif Bengali',Arial,sans-serif;}
    #aaFab.lifted{bottom:76px;}
    #aaFab .aa-fab-actions{display:flex;flex-direction:column;gap:12px;margin-bottom:12px;opacity:0;pointer-events:none;transform:translateY(14px) scale(.85);transition:.28s cubic-bezier(.2,.8,.2,1);}
    #aaFab.open .aa-fab-actions{opacity:1;pointer-events:auto;transform:translateY(0) scale(1);}
    #aaFab .aa-fab-item{display:flex;align-items:center;gap:9px;text-decoration:none;}
    #aaFab .aa-fab-lbl{background:#1a2e1b;color:#fff;font-size:12px;font-weight:700;padding:5px 11px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.22);}
    #aaFab .aa-fab-ic{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.28);flex-shrink:0;}
    #aaFab .aa-fab-ic svg{width:23px;height:23px;}
    #aaFab .call .aa-fab-ic{background:#16a34a;}
    #aaFab .msg .aa-fab-ic{background:#0084ff;}
    #aaFab .wa .aa-fab-ic{background:#25D366;}
    #aaFab .aa-fab-main{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#224f23,#2f7531);color:#fff;box-shadow:0 5px 18px rgba(47,117,49,.45);display:flex;align-items:center;justify-content:center;transition:.25s;padding:0;}
    #aaFab.open .aa-fab-main{transform:scale(.94);}
    #aaFab .aa-fab-main svg{width:26px;height:26px;}
    #aaFab .aa-fab-main .ic-close{display:none;}
    #aaFab.open .aa-fab-main .ic-chat{display:none;}
    #aaFab.open .aa-fab-main .ic-close{display:block;}`;
    document.head.appendChild(css);

    var wrap = document.createElement('div');
    wrap.id = 'aaFab';
    wrap.innerHTML = `
        <div class="aa-fab-actions">
            <a class="aa-fab-item call" href="tel:${PHONE}">
                <span class="aa-fab-lbl">কল করুন</span>
                <span class="aa-fab-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
            </a>
            <a class="aa-fab-item msg" href="${MSG}" target="_blank" rel="noopener">
                <span class="aa-fab-lbl">Messenger</span>
                <span class="aa-fab-ic"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78c.03.57.62.94 1.14.71l1.98-.87c.17-.08.36-.09.54-.04 1.03.28 2.13.44 3.28.44 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm6.01 7.46l-2.93 4.66c-.47.74-1.47.93-2.18.4l-2.33-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.68-.62l2.93-4.66c.47-.74 1.47-.93 2.18-.4l2.33 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.62z"/></svg></span>
            </a>
            <a class="aa-fab-item wa" href="${WA}" target="_blank" rel="noopener">
                <span class="aa-fab-lbl">WhatsApp</span>
                <span class="aa-fab-ic"><svg viewBox="0 0 24 24" fill="#fff"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.48.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12 2a10 10 0 0 0-8.6 15.06L2 22l5.05-1.32A10 10 0 1 0 12 2z"/></svg></span>
            </a>
        </div>
        <button class="aa-fab-main" aria-label="যোগাযোগ" onclick="aaToggleFab()">
            <svg class="ic-chat" viewBox="0 0 24 24" fill="#fff"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><circle cx="8" cy="10" r="1.4" fill="#2f7531"/><circle cx="12" cy="10" r="1.4" fill="#2f7531"/><circle cx="16" cy="10" r="1.4" fill="#2f7531"/></svg>
            <svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>`;

    function add() {
        document.body.appendChild(wrap);
        /* কোনো পেজে নিচে bottom-nav থাকলে বাটন একটু উপরে তুলি */
        if (document.querySelector('.bottom-nav')) wrap.classList.add('lifted');
    }
    if (document.body) add();
    else document.addEventListener('DOMContentLoaded', add);

    window.aaToggleFab = function () {
        document.getElementById('aaFab').classList.toggle('open');
    };
    /* বাইরে ক্লিক করলে বন্ধ */
    document.addEventListener('click', function (e) {
        var f = document.getElementById('aaFab');
        if (f && f.classList.contains('open') && !f.contains(e.target)) f.classList.remove('open');
    });
})();

/* ═══ Facebook Pixel — অ্যাডমিন থেকে সেট করা ID থাকলে সব পেজে চালু ═══ */
(function () {
    var DBURL = 'https://screenshot-2db71-default-rtdb.asia-southeast1.firebasedatabase.app/siteConfig/metaPixelId.json';
    try {
        fetch(DBURL).then(function (r) { return r.ok ? r.json() : null; }).then(function (id) {
            if (!id || !/^\d{5,20}$/.test(String(id))) return;
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
                t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
            }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', String(id));
            fbq('track', 'PageView');
        }).catch(function () {});
    } catch (e) {}
})();