/* ═══════════════════════════════════════
   গ্রন্থকানন — Common JavaScript
   সব page এ shared হয় এই JS
═══════════════════════════════════════ */

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

/* ═══ কুপন — বিল্ট-ইন FIRSTORDER + অ্যাডমিন-তৈরি কুপন (Firebase 'coupons') ═══ */
window.GK_COUPONS = window.GK_COUPONS || { FIRSTORDER: 5 };
(function () {
    try {
        if (typeof firebase !== 'undefined' && firebase.database) {
            firebase.database().ref('coupons').get().then(function (s) {
                if (!s.exists()) return;
                var v = s.val() || {};
                Object.keys(v).forEach(function (k) {
                    var c = v[k];
                    if (c && c.active !== false && typeof c.discount === 'number' && c.discount > 0 && c.discount <= 100) {
                        window.GK_COUPONS[String(k).toUpperCase()] = c.discount;
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
        if (c && c.classList.contains('open') && !c.contains(e.target)) c.classList.remove('open');
    });
})();
window.gkToggleContact = function () {
    var c = document.getElementById('gkContact');
    if (c) c.classList.toggle('open');
};

/* কার্ট সাবটোটাল থেকে গিফট-প্রগ্রেস বারের HTML বানায় (index + shared drawer দুটোই ব্যবহার করে) */
window.gkGiftBarHTML = function (subtotal) {
    const TH = window.GK_GIFT_THRESHOLD || 1000;
    if (subtotal <= 0) return '';
    const remain = TH - subtotal;
    if (remain > 0) {
        const pct = Math.min(100, Math.round(subtotal / TH * 100));
        return `<div class="gk-gift">
            <div class="gk-gift-txt">🎁 আর মাত্র <b>৳${remain}</b>-এর বই কিনলেই <b>ফ্রি হাদিয়া সামগ্রী!</b></div>
            <div class="gk-gift-track"><div class="gk-gift-fill" style="width:${pct}%"></div></div>
        </div>`;
    }
    return `<div class="gk-gift done">
        <div class="gk-gift-txt">🎉 অভিনন্দন! আপনার অর্ডারে <b>ফ্রি হাদিয়া সামগ্রী</b> যুক্ত হবে ইন শা আল্লাহ</div>
    </div>`;
};

/* ═══════════════════════════════════════
   GLOBAL CART DRAWER
   index.html-এর নিজস্ব ড্রয়ার আছে — বাকি সব পেজে
   (filter, book ইত্যাদি) এই শেয়ার্ড ড্রয়ারটি বসে।
═══════════════════════════════════════ */
(function () {
    if (document.getElementById('cartBox')) return; // index-এর নিজস্ব ড্রয়ার

    const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const readCart = () => { try { return JSON.parse(localStorage.getItem('gronthokanon_cart')) || []; } catch (e) { return []; } };
    const saveCart = c => localStorage.setItem('gronthokanon_cart', JSON.stringify(c));

    /* ── CSS ── */
    const css = document.createElement('style');
    css.textContent = `
    #gkCartOverlay{position:fixed;inset:0;background:rgba(0,0,0,.48);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:99998;opacity:0;pointer-events:none;transition:opacity .3s;}
    #gkCartOverlay.open{opacity:1;pointer-events:auto;}
    #gkCartDrawer{position:fixed;top:0;right:0;height:100%;width:340px;max-width:92vw;background:var(--card,#fff);color:var(--text,#111827);z-index:99999;transform:translateX(105%);transition:transform .35s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;box-shadow:-8px 0 40px rgba(0,0,0,.18);border-radius:20px 0 0 20px;overflow:hidden;font-family:'Hind Siliguri',Arial,sans-serif;}
    #gkCartDrawer.open{transform:translateX(0);}
    .gk-cd-head{padding:15px 18px;background:linear-gradient(135deg,#059669,#047857);color:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
    .gk-cd-head h3{margin:0;font-size:17px;font-weight:800;display:flex;align-items:center;gap:8px;}
    .gk-cd-count{background:rgba(255,255,255,.22);font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;}
    .gk-cd-close{cursor:pointer;font-size:24px;line-height:1;opacity:.9;background:none;border:none;color:#fff;padding:0 2px;}
    .gk-cd-items{flex:1;overflow-y:auto;padding:14px 16px;}
    .gk-cd-item{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border,#e5e7eb);}
    .gk-cd-item img{width:44px;height:58px;object-fit:cover;border-radius:8px;border:1px solid var(--border,#e5e7eb);flex-shrink:0;background:#f0fdf4;}
    .gk-cd-name{font-size:12.5px;font-weight:700;color:var(--text,#111827);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
    .gk-cd-price{font-size:12.5px;font-weight:800;color:#dc2626;margin-top:2px;}
    .gk-qty{display:flex;align-items:center;gap:7px;flex-shrink:0;}
    .gk-qty button{width:24px;height:24px;border-radius:7px;border:1.5px solid var(--border,#d1d5db);background:var(--bg,#f9fafb);color:var(--text,#111827);font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;transition:.15s;}
    .gk-qty button:hover{border-color:#059669;color:#059669;}
    .gk-qty span{font-size:13px;font-weight:800;min-width:14px;text-align:center;color:var(--text,#111827);}
    .gk-cd-empty{text-align:center;padding:60px 20px;color:var(--text2,#6b7280);}
    .gk-cd-empty svg{opacity:.4;margin-bottom:10px;}
    .gk-cd-empty p{font-size:14px;font-weight:600;margin:0 0 16px;}
    .gk-cd-empty button{padding:9px 22px;background:#059669;color:#fff;border:none;border-radius:10px;font-family:'Hind Siliguri',Arial,sans-serif;font-size:13px;font-weight:700;cursor:pointer;}
    .gk-cd-foot{padding:14px 16px 16px;border-top:1px solid var(--border,#e5e7eb);background:var(--bg,#f9fafb);flex-shrink:0;}
    .gk-cd-row{display:flex;justify-content:space-between;font-size:13px;color:var(--text2,#6b7280);padding:2.5px 0;}
    .gk-cd-row.total{font-size:15.5px;font-weight:800;color:var(--text,#111827);padding-top:6px;}
    .gk-cd-row.total span:last-child{color:#059669;}
    .gk-cd-row.disc span:last-child{color:#dc2626;font-weight:700;}
    .gk-coupon{display:flex;gap:6px;margin-bottom:10px;}
    .gk-coupon input{flex:1;padding:8px 10px;border:1.5px solid var(--border,#d1d5db);border-radius:9px;background:var(--card,#fff);color:var(--text,#111827);font-family:'Hind Siliguri',Arial,sans-serif;font-size:12.5px;outline:none;min-width:0;}
    .gk-coupon input:focus{border-color:#059669;}
    .gk-coupon button{background:#059669;color:#fff;border:none;padding:0 14px;border-radius:9px;cursor:pointer;font-weight:700;font-size:12.5px;font-family:'Hind Siliguri',Arial,sans-serif;}
    .gk-coupon-on{display:flex;align-items:center;gap:8px;padding:7px 11px;background:rgba(5,150,105,.08);border:1.5px dashed #059669;border-radius:9px;margin-bottom:10px;}
    .gk-coupon-on span{flex:1;font-size:12px;font-weight:700;color:#059669;}
    .gk-coupon-on button{background:#fee2e2;color:#dc2626;border:none;border-radius:7px;padding:4px 9px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Hind Siliguri',Arial,sans-serif;}
    .gk-checkout-btn{width:100%;margin-top:10px;padding:13px;background:linear-gradient(135deg,#059669,#047857);color:#fff;border:none;border-radius:11px;font-family:'Hind Siliguri',Arial,sans-serif;font-size:14.5px;font-weight:800;cursor:pointer;box-shadow:0 3px 12px rgba(5,150,105,.3);transition:.2s;letter-spacing:.3px;}
    .gk-checkout-btn:hover{box-shadow:0 5px 16px rgba(5,150,105,.4);}
    .gk-checkout-btn:active{transform:scale(.98);}
    .gk-cd-note{text-align:center;font-size:10.5px;color:var(--text3,#9ca3af);margin-top:8px;}`;
    document.head.appendChild(css);

    /* ── HTML ── */
    function buildDrawer() {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
        <div id="gkCartOverlay" onclick="closeCart()"></div>
        <div id="gkCartDrawer">
            <div class="gk-cd-head">
                <h3><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> আপনার ব্যাগ <span class="gk-cd-count" id="gkCdCount">0</span></h3>
                <button class="gk-cd-close" onclick="closeCart()">&times;</button>
            </div>
            <div class="gk-cd-items" id="gkCdItems"></div>
            <div class="gk-cd-foot">
                <div id="gkGiftBar"></div>
                <div id="gkCouponBox"></div>
                <div class="gk-cd-row"><span>সাবটোটাল</span><span>৳<span id="gkCdSub">0</span></span></div>
                <div class="gk-cd-row disc" id="gkCdDiscRow" style="display:none;"><span>ডিসকাউন্ট (<span id="gkCdCoupon"></span>)</span><span>-৳<span id="gkCdDisc">0</span></span></div>
                <div class="gk-cd-row total"><span>মোট</span><span>৳<span id="gkCdTotal">0</span></span></div>
                <button class="gk-checkout-btn" onclick="gkGoCheckout()">✅ অর্ডার করুন</button>
                <div class="gk-cd-note">🚚 ঢাকায় ডেলিভারি ৳৬০ — ঢাকার বাইরে ৳৯০ (চেকআউটে যোগ হবে)</div>
            </div>
        </div>`;
        document.body.appendChild(wrap);
    }
    if (document.body) buildDrawer();
    else document.addEventListener('DOMContentLoaded', buildDrawer);

    /* ── ব্যাজ আপডেট (পেজভেদে ভিন্ন id) ── */
    function gkBadges(n) {
        ['cartCount', 'floatCount', 'bnavBadge'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = n;
        });
    }

    /* ── রেন্ডার ── */
    window.gkRenderCart = function () {
        const cart = readCart();
        const box = document.getElementById('gkCdItems');
        if (!box) return;
        document.getElementById('gkCdCount').innerText = cart.length;
        gkBadges(cart.length);

        if (!cart.length) {
            box.innerHTML = `<div class="gk-cd-empty">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <p>ব্যাগ এখনও খালি</p>
                <button onclick="closeCart()">📚 বই দেখুন</button>
            </div>`;
        } else {
            const g = {};
            cart.forEach(i => { if (g[i.name]) g[i.name].qty++; else g[i.name] = { price: Number(i.price) || 0, qty: 1, img: i.img || '' }; });
            box.innerHTML = Object.entries(g).map(([name, it]) => `
                <div class="gk-cd-item">
                    <img src="${esc(it.img)}" alt="" onerror="this.style.visibility='hidden'">
                    <div style="flex:1;min-width:0;">
                        <div class="gk-cd-name">${esc(name)}</div>
                        <div class="gk-cd-price">৳${it.price}</div>
                    </div>
                    <div class="gk-qty">
                        <button data-name="${esc(name)}" onclick="gkQty(this.dataset.name,-1)">−</button>
                        <span>${it.qty}</span>
                        <button data-name="${esc(name)}" onclick="gkQty(this.dataset.name,1)">+</button>
                    </div>
                </div>`).join('');
        }

        /* কুপন UI */
        const applied = localStorage.getItem('gronthokanon_coupon');
        const discPct = parseInt(localStorage.getItem('gronthokanon_discount') || '0');
        const cb = document.getElementById('gkCouponBox');
        if (applied) {
            cb.innerHTML = `<div class="gk-coupon-on"><span>🎉 ${esc(applied)} — ${discPct}% ডিসকাউন্ট</span><button onclick="gkRemoveCoupon()">✕ বাতিল</button></div>`;
        } else {
            cb.innerHTML = `<div class="gk-coupon"><input id="gkCouponInput" placeholder="কুপন কোড লিখুন"><button onclick="gkApplyCoupon()">Apply</button></div>`;
        }

        /* টোটাল */
        const grouped = {};
        cart.forEach(i => { grouped[i.name] = grouped[i.name] || { p: Number(i.price) || 0, q: 0 }; grouped[i.name].q++; });
        const sub = Object.values(grouped).reduce((s, x) => s + x.p * x.q, 0);
        const disc = applied ? Math.round(sub * discPct / 100) : 0;
        document.getElementById('gkGiftBar').innerHTML = gkGiftBarHTML(sub);
        document.getElementById('gkCdSub').innerText = sub;
        document.getElementById('gkCdDisc').innerText = disc;
        document.getElementById('gkCdCoupon').innerText = applied || '';
        document.getElementById('gkCdDiscRow').style.display = disc > 0 ? 'flex' : 'none';
        document.getElementById('gkCdTotal').innerText = sub - disc;
    };

    /* ── qty বদলানো ── */
    window.gkQty = function (name, delta) {
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
        gkRenderCart();
    };

    /* ── কুপন ── */
    window.gkApplyCoupon = function () {
        const code = (document.getElementById('gkCouponInput')?.value || '').trim().toUpperCase();
        const pct = window.GK_COUPONS && window.GK_COUPONS[code];
        if (pct) {
            localStorage.setItem('gronthokanon_coupon', code);
            localStorage.setItem('gronthokanon_discount', String(pct));
            showToast('🎉 ' + pct + '% ডিসকাউন্ট যুক্ত হয়েছে!', '#059669');
        } else {
            showToast('❌ ভুল কুপন কোড!', '#dc2626');
        }
        gkRenderCart();
    };
    window.gkRemoveCoupon = function () {
        localStorage.removeItem('gronthokanon_coupon');
        localStorage.removeItem('gronthokanon_discount');
        showToast('🗑️ কুপন বাতিল হয়েছে', '#6b7280');
        gkRenderCart();
    };

    /* ── চেকআউট ── */
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