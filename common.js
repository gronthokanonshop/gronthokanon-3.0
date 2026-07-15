/* ═══════════════════════════════════════
   গ্রন্থকানন — Common JavaScript
   সব page এ shared হয় এই JS
═══════════════════════════════════════ */

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

/* ═══ হাদিয়া অফারের টার্গেট (৳) — এখানে বদলালেই সব জায়গায় বদলাবে ═══ */
window.GK_GIFT_THRESHOLD = 1000;

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

/* ═══ ভাসমান কন্টাক্ট বাটন — কল / Messenger / WhatsApp (সব পেজে) ═══ */
(function () {
    function build() {
        if (document.getElementById('gkContact')) return;
        var d = document.createElement('div');
        d.id = 'gkContact';
        d.innerHTML =
            '<div class="gkc-actions">' +
            '<a class="gkc-call" href="tel:+8801516595762" data-label="কল করুন" aria-label="কল করুন"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12 19.79 19.79 0 0 1 1.88 3.4 2 2 0 0 1 3.88 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.42-1.42a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>' +
            '<a class="gkc-msgr" href="https://m.me/gronthokanon0943" target="_blank" rel="noopener" data-label="Messenger" aria-label="Messenger"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.15.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.99-.88c.17-.07.36-.09.53-.04 1.06.29 2.19.45 3.4.45 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm6 7.46l-2.94 4.67c-.47.74-1.47.93-2.18.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.67c.47-.74 1.47-.93 2.18-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63z"/></svg></a>' +
            '<a class="gkc-wa" href="https://wa.me/8801516595762" target="_blank" rel="noopener" data-label="WhatsApp" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.13c-.24.68-1.42 1.3-1.96 1.35-.5.05-1.13.07-1.83-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.26-.29.57-.36.76-.36l.55.01c.18.01.41-.07.64.49.24.57.81 1.99.88 2.13.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.18 1.54 1.92 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.16-.19.69-.81.87-1.08.18-.28.37-.23.62-.14.25.09 1.6.75 1.87.89.28.14.46.21.53.32.07.12.07.68-.17 1.36z"/></svg></a>' +
            '</div>' +
            '<button class="gkc-fab" aria-label="যোগাযোগ" onclick="gkToggleContact()">' +
            '<svg class="ic-chat" viewBox="0 0 24 24" fill="#fff"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><circle cx="8" cy="10" r="1.4" fill="#e60a5e"/><circle cx="12" cy="10" r="1.4" fill="#e60a5e"/><circle cx="16" cy="10" r="1.4" fill="#e60a5e"/></svg>' +
            '<svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
            '</button>';
        document.body.appendChild(d);
    }
    if (document.body) build();
    else document.addEventListener('DOMContentLoaded', build);
    /* বাইরে ক্লিক করলে বন্ধ */
    document.addEventListener('click', function (e) {
        var c = document.getElementById('gkContact');
        if (c && !c.contains(e.target)) {
            c.classList.remove('open');
        }
    });
})();
window.gkToggleContact = function () {
    var c = document.getElementById('gkContact');
    if (c) c.classList.toggle('open');
};

/* ═══════════════════════════════════════════════════════════════
   কার্ট — localStorage এ রক্ষা হয়
   শপিং কার্ট: ['{ প্রোডাক্ট }', ...]
   কুপন: গ্রন্থকানন_coupon = কোড, গ্রন্থকানন_ctype/cvalue = টাইপ ও মূল্য
═══════════════════════════════════════════════════════════════ */
(function () {
    window.readCart = function () {
        try {
            var c = localStorage.getItem('gronthokanon_cart');
            return (c ? JSON.parse(c) : []).filter(function (item) { return item && item.id; });
        } catch (e) {
            return [];
        }
    };
    window.writeCart = function (items) {
        try { localStorage.setItem('gronthokanon_cart', JSON.stringify(items || [])); } catch (e) {}
    };
    window.addToCart = function (p) {
        if (!p || !p.id) return;
        var cart = readCart();
        var found = cart.find(function (c) { return c.id === p.id; });
        if (found) {
            found.qty = (found.qty || 1) + 1;
        } else {
            p.qty = 1;
            cart.push(p);
        }
        writeCart(cart);
        showToast('✅ যোগ হয়েছে ব্যাগে', '#059669');
    };
    window.removeCartItem = function (id) {
        var cart = readCart();
        writeCart(cart.filter(function (c) { return c.id !== id; }));
        gkRenderCart();
    };
    window.updateCartQty = function (id, qty) {
        var cart = readCart();
        var item = cart.find(function (c) { return c.id === id; });
        if (item) {
            item.qty = Math.max(1, qty);
            writeCart(cart);
            gkRenderCart();
        }
    };
    window.gkRenderCart = function () {
        var cart = readCart();
        var cartItems = document.getElementById('gkCartItems');
        if (!cartItems) return;
        if (!cart.length) {
            cartItems.innerHTML = '<div style="padding: 40px 20px; text-align: center; color: var(--text-muted);"><p>⛹️ ব্যাগ খালি</p></div>';
            return;
        }
        var itemsHtml = cart.map(function (item) {
            var subHtml = (item.qty || 1) + ' × ৳' + (item.price || 0) + ' = ৳' + ((item.qty || 1) * (item.price || 0));
            return '<div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border);">' +
                '<img src="' + (item.cover || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22 fill=%22%23666%22%3ENo Cover%3C/text%3E%3C/svg%3E') + '" alt="' + item.title + '" style="width: 50px; height: 75px; object-fit: cover; border-radius: 3px; flex-shrink: 0;">' +
                '<div style="flex: 1; min-width: 0;">' +
                '<div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">' + item.title + '</div>' +
                '<div style="font-size: 11px; color: var(--text-muted);">' + subHtml + '</div>' +
                '<div style="display: flex; align-items: center; gap: 6px; margin-top: 6px;">' +
                '<button onclick="updateCartQty(' + item.id + ', ' + ((item.qty || 1) - 1) + ')" style="width: 20px; height: 20px; padding: 0; border: 1px solid var(--border); background: var(--bg); border-radius: 2px; cursor: pointer;">−</button>' +
                '<span style="width: 24px; text-align: center; font-size: 12px; font-weight: 600;">' + (item.qty || 1) + '</span>' +
                '<button onclick="updateCartQty(' + item.id + ', ' + ((item.qty || 1) + 1) + ')" style="width: 20px; height: 20px; padding: 0; border: 1px solid var(--border); background: var(--bg); border-radius: 2px; cursor: pointer;">+</button>' +
                '</div></div>' +
                '<button onclick="removeCartItem(' + item.id + ')" style="flex-shrink: 0; width: 32px; height: 32px; border: none; background: none; color: var(--danger); font-size: 16px; cursor: pointer;">✕</button>' +
                '</div>';
        }).join('');

        var total = cart.reduce(function (s, item) { return s + ((item.qty || 1) * (item.price || 0)); }, 0);
        var coupon = localStorage.getItem('gronthokanon_coupon');
        var discount = window.gkCouponDiscAmt(total) || 0;
        var cType = localStorage.getItem('gronthokanon_ctype') || 'percent';
        var cDeliveryFree = cType === 'delivery';
        var deliveryCharge = total < 500 ? (cDeliveryFree ? 0 : 100) : 0;
        var finalTotal = total - discount + deliveryCharge;

        var cartFooter = '<div style="padding: 16px; border-top: 1px solid var(--border);">' +
            '<div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">' +
            '<span>মোট:</span><span>৳' + total + '</span></div>' +
            (discount ? '<div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: var(--accent);">' +
                '<span>ছাড় (' + (coupon || 'কোড') + '):</span><span>−৳' + discount + '</span></div>' : '') +
            (deliveryCharge ? '<div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">' +
                '<span>ডেলিভারি:</span><span>৳' + deliveryCharge + '</span></div>' : '') +
            '<div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border); font-weight: 700; font-size: 14px;">' +
            '<span>পরিশোধ:</span><span>৳' + finalTotal + '</span></div>' +
            '</div>' +
            '<div style="padding: 0 16px 16px;">' +
            '<button onclick="gkGoCheckout()" style="width: 100%; padding: 10px; background: var(--primary); color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">চেকআউট করুন</button>' +
            '</div>';

        cartItems.innerHTML = itemsHtml + cartFooter;
    };

    window.gkGoCheckout = function () {
        if (!readCart().length) { showToast('⚠️ ব্যাগ খালি!', '#dc2626'); return; }
        window.location.href = 'checkout.html';
    };

    /* ── খোলা/বন্ধ ── */
    window.showCart = function () {
        gkRenderCart();
        document.getElementById('gkCartOverlay').classList.add('open');
        document.getElementById('gkCartDrawer').classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    window.closeCart = function () {
        document.getElementById('gkCartOverlay').classList.remove('open');
        document.getElementById('gkCartDrawer').classList.remove('open');
        document.body.style.overflow = '';
    };
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeCart();
    });
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
   অফার পপআপ — যেকোনো পেজে ঢুকলে অ্যাডমিন-প্যানেলে সক্রিয় থাকা
   কুপন/অফার একটা পপআপে দেখাবে। ক্রস (✕) বা বাইরে ক্লিক করলে বন্ধ হবে।
   একবার বন্ধ করলে একই অফার আর ~২০ ঘণ্টা দেখাবে না — নতুন/ভিন্ন অফার
   চালু হলে (বা সময় পার হলে) আবার দেখাবে।
   
   ফিচার:
   1. সাধারণ কুপন পপআপ (সেই কুপনগুলো যেখানে showInPopup=true)
   2. ছবিওয়ালা অফার পোস্টার (siteConfig/offerPopup থেকে, enabled=true হলে)
═══════════════════════════════════════════════════════════ */
(function () {
    var DISMISS_KEY = 'gronthokanon_offer_dismiss';
    var DISMISS_KEY_POSTER = 'gronthokanon_offer_poster_dismiss';
    var DISMISS_HOURS = 20;

    function getDismissed() {
        try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}'); } catch (e) { return {}; }
    }
    function setDismissed(sig) {
        try { localStorage.setItem(DISMISS_KEY, JSON.stringify({ sig: sig, t: Date.now() })); } catch (e) {}
    }
    function isDismissed(sig) {
        var d = getDismissed();
        if (!d || d.sig !== sig) return false;
        return (Date.now() - (d.t || 0)) < DISMISS_HOURS * 3600000;
    }
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
    function offerLabel(c) {
        if (typeof c.discount === 'number') return c.discount + '% ছাড়';
        if (c.type === 'delivery') return '🚚 ফ্রি ডেলিভারি';
        if (c.type === 'taka') return '৳' + (c.value || 0) + ' ছাড়';
        return (c.value || 0) + '% ডিসকাউন্ট';
    }
    function escapeHTML(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function buildPopup(offers) {
        if (document.getElementById('gkOfferOverlay')) return;
        var overlay = document.createElement('div');
        overlay.className = 'gk-offer-overlay';
        overlay.id = 'gkOfferOverlay';
        overlay.innerHTML =
            '<div class="gk-offer-box">' +
                '<button type="button" class="gk-offer-close" aria-label="বন্ধ করুন">✕</button>' +
                '<div class="gk-offer-badge">🎁</div>' +
                '<div class="gk-offer-title">বিশেষ অফার আপনার জন্য!</div>' +
                '<div class="gk-offer-sub">কোড কপি করে চেকআউটে ব্যবহার করুন</div>' +
                '<div class="gk-offer-list">' +
                offers.map(function (o) {
                    return '<div class="gk-offer-item">' +
                        '<div><div class="gk-offer-code">' + escapeHTML(o.code) + '</div>' +
                        '<div class="gk-offer-label">' + escapeHTML(o.label) + '</div></div>' +
                        '<button type="button" class="gk-offer-copy" data-code="' + escapeHTML(o.code) + '">কপি</button>' +
                    '</div>';
                }).join('') +
                '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        var sig = offers.map(function (o) { return o.code; }).sort().join(',');
        function dismiss() {
            setDismissed(sig);
            overlay.style.opacity = '0';
            setTimeout(function () { overlay.remove(); }, 200);
        }
        overlay.addEventListener('click', function (e) { if (e.target === overlay) dismiss(); });
        overlay.querySelector('.gk-offer-close').addEventListener('click', dismiss);
        Array.prototype.forEach.call(overlay.querySelectorAll('.gk-offer-copy'), function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var code = btn.getAttribute('data-code');
                var done = function () {
                    btn.textContent = '✓ হয়েছে';
                    btn.classList.add('copied');
                    setTimeout(function () { btn.textContent = 'কপি'; btn.classList.remove('copied'); }, 1500);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(code).then(done).catch(function () {
                        fallbackCopy(code); done();
                    });
                } else {
                    fallbackCopy(code); done();
                }
            });
        });
    }

    function buildPosterPopup(config) {
        if (document.getElementById('gkOfferPosterOverlay')) return;
        var overlay = document.createElement('div');
        overlay.className = 'gk-offer-overlay';
        overlay.id = 'gkOfferPosterOverlay';
        overlay.innerHTML =
            '<div class="gk-offer-poster-box">' +
                '<button type="button" class="gk-offer-poster-close" aria-label="বন্ধ করুন">✕</button>' +
                (config.img ? '<img src="' + escapeHTML(config.img) + '" alt="অফার" class="gk-offer-poster-img" style="cursor:pointer;" />' : '') +
                (config.title ? '<div class="gk-offer-poster-title">' + escapeHTML(config.title) + '</div>' : '') +
                (config.sub ? '<div class="gk-offer-poster-sub">' + escapeHTML(config.sub) + '</div>' : '') +
            '</div>';
        document.body.appendChild(overlay);

        function dismiss() {
            setDismissedPoster();
            overlay.style.opacity = '0';
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

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        ta.remove();
    }

    function tryShow() {
        try {
            /* ──── GUARD: চেকআউট পেজে পপআপ দেখাবে না ──── */
            if (location.pathname.indexOf('checkout.html') !== -1 || location.pathname.endsWith('checkout.html')) {
                return;
            }

            if (typeof firebase === 'undefined' || !firebase.database) return;

            /* ──── প্রথমে সাধারণ কুপন পপআপ চেষ্টা করুন ──── */
            firebase.database().ref('coupons').once('value').then(function (s) {
                var v = (s.exists() ? s.val() : {}) || {};
                var offers = [];
                Object.keys(v).forEach(function (k) {
                    var c = v[k];
                    if (!c || c.active === false) return;
                    /* ──── শুধু সেই কুপনগুলো যেখানে showInPopup === true ──── */
                    if (c.showInPopup !== true) return;
                    offers.push({ code: String(k).toUpperCase(), label: offerLabel(c) });
                });
                if (offers.length) {
                    var sig = offers.map(function (o) { return o.code; }).sort().join(',');
                    if (!isDismissed(sig)) {
                        buildPopup(offers);
                        return; /* কুপন পপআপ দেখানো হয়েছে, পোস্টার দেখাবেন না */
                    }
                }

                /* ──── কুপন পপআপ না দেখানো হলে, ছবিওয়ালা পোস্টার দেখান ──── */
                firebase.database().ref('siteConfig/offerPopup').once('value').then(function (posterSnap) {
                    var posterConfig = posterSnap.val();
                    if (posterConfig && posterConfig.enabled === true && posterConfig.img) {
                        if (!isPosterDismissed()) {
                            buildPosterPopup(posterConfig);
                        }
                    }
                }).catch(function () {});
            }).catch(function () {});
        } catch (e) {}
    }

    function init() { setTimeout(tryShow, 1400); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();