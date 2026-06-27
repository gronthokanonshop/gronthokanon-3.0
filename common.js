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