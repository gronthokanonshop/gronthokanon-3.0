/* ═══════════════════════════════════════
   গ্রন্থকানন — Common Styles
   সব page এ shared হয় এই CSS
═══════════════════════════════════════ */

/* ═══ DESIGN TOKENS (CSS Variables) ═══ */
:root {
    --bg: #f6fdf9;
    --card: #ffffff;
    --text: #1a202c;
    --text2: #6b7280;
    --border: #c6f6d5;
    --green: #059669;
    --green2: #10b981;
    --dark: #064e3b;
    --red: #dc2626;
    --gold: #d97706;
    --shadow: rgba(0,0,0,0.06);
    --price-bg: #f8fafc;
    --nav-bg: #eef0f3;
    --nav-border: #d1d5db;
    --nav-icon-bg: #ffffff;
    --nav-icon-border: #d1d5db;
    --nav-icon-hover: #f0fdf4;
    --nav-text: #374151;
    --search-input-bg: #f4f6f8;
    --search-input-border: #cbd5e1;
    --sidebar-bg: #ffffff;
}

[data-theme="dark"] {
    --bg: #020617;
    --card: rgba(15, 23, 42, 0.85);
    --text: #f1f5f9;
    --text2: #94a3b8;
    --border: #1e293b;
    --green: #34d399;
    --green2: #6ee7b7;
    --dark: #f1f5f9;
    --red: #f87171;
    --gold: #fbbf24;
    --shadow: rgba(0,0,0,0.45);
    --price-bg: #0f172a;
    --nav-bg: rgba(10, 18, 35, 0.92);
    --nav-border: #1e293b;
    --nav-icon-bg: rgba(30, 41, 59, 0.7);
    --nav-icon-border: #334155;
    --nav-icon-hover: rgba(52, 211, 153, 0.1);
    --nav-text: #cbd5e1;
    --search-input-bg: rgba(15, 23, 42, 0.7);
    --search-input-border: #334155;
    --sidebar-bg: rgba(15, 23, 42, 0.9);
}

/* ═══ DARK MODE GLASS EFFECTS ═══ */
[data-theme="dark"] body {
    background:
        radial-gradient(ellipse at 15% 20%, rgba(52,211,153,0.07) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 10%, rgba(16,185,129,0.05) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(4,120,87,0.06) 0%, transparent 60%),
        #020617;
    background-attachment: fixed;
}

[data-theme="dark"] .navbar {
    background: rgba(10, 18, 35, 0.88);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom-color: rgba(52, 211, 153, 0.08);
    box-shadow: 0 1px 0 rgba(52,211,153,0.06), 0 4px 24px rgba(0,0,0,0.4);
}

[data-theme="dark"] .nav-btn {
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-color: rgba(52, 211, 153, 0.12);
}

[data-theme="dark"] .nav-btn:hover {
    background: rgba(52, 211, 153, 0.08);
    border-color: rgba(52, 211, 153, 0.3);
}

[data-theme="dark"] .dark-pill {
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-color: rgba(52, 211, 153, 0.12);
}

[data-theme="dark"] .dark-pill:hover {
    background: rgba(52, 211, 153, 0.08);
    border-color: rgba(52, 211, 153, 0.3);
}

/* ═══ RESET ═══ */
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: 'Hind Siliguri', 'SolaimanLipi', Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow-x: hidden;
    transition: background 0.3s, color 0.3s;
}

/* ═══ NAVBAR ═══ */
.navbar {
    background: var(--nav-bg);
    border-bottom: 1px solid var(--nav-border);
    box-shadow: 0 2px 14px rgba(0,0,0,0.06);
    position: sticky;
    top: 0;
    z-index: 1000;
    transition: background 0.3s;
}
.navbar-top {
    display: flex;
    align-items: center;
    padding: 9px 14px;
    gap: 10px;
}

/* ═══ BACK BUTTON (filter, book, checkout) ═══ */
.back-btn {
    width: 36px; height: 36px;
    background: #059669;
    border: none;
    border-radius: 10px;
    font-size: 22px;
    color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(5,150,105,0.3);
    transition: background 0.2s, transform 0.15s;
}
.back-btn:hover { background: #047857; transform: translateX(-2px); }
.back-btn:active { transform: scale(0.92); }

/* ═══ NAV ICON BUTTONS ═══ */
.navbar-icons { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
.nav-btn {
    position: relative;
    width: 36px; height: 36px;
    background: var(--nav-icon-bg);
    border: 1.5px solid var(--nav-icon-border);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 17px;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
    user-select: none;
}
.nav-btn:hover { border-color: #059669; background: var(--nav-icon-hover); transform: translateY(-1px); }
.nav-btn:active { transform: scale(0.92); }

/* ═══ DARK MODE TOGGLE ═══ */
.dark-pill {
    background: var(--nav-icon-bg);
    border: 1.5px solid var(--nav-icon-border);
    border-radius: 20px;
    padding: 5px 11px;
    cursor: pointer;
    font-size: 13px;
    color: var(--nav-text);
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
}
.dark-pill:hover { border-color: #059669; background: var(--nav-icon-hover); transform: translateY(-1px); }

/* ═══ CART BADGE ═══ */
.nav-badge {
    position: absolute;
    top: -6px; right: -7px;
    background: #ef4444;
    color: white;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 20px;
    min-width: 17px;
    text-align: center;
    border: 1.5px solid var(--nav-bg);
    line-height: 1.2;
}

/* ═══ WHATSAPP BUTTON ═══ */
.wa-btn {
    position: fixed;
    bottom: 80px; right: 20px;
    z-index: 9990;
    display: flex; align-items: center; justify-content: center;
    width: 48px; height: 48px;
    background: #25D366;
    border-radius: 50%;
    box-shadow: 0 4px 14px rgba(37,211,102,0.45);
    text-decoration: none;
    transition: transform 0.2s;
}
.wa-btn:hover { transform: scale(1.1); }

/* ═══ TOAST NOTIFICATION ═══ */
.toast {
    position: fixed;
    bottom: 82px; left: 50%;
    transform: translateX(-50%);
    padding: 10px 22px;
    border-radius: 25px;
    font-size: 13px;
    font-weight: 600;
    color: white;
    z-index: 9999;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    pointer-events: none;
}

/* ═══ SCROLL TO TOP BUTTON ═══ */
.scroll-top {
    position: fixed;
    bottom: 90px; right: 18px;
    width: 40px; height: 40px;
    background: #059669;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(5,150,105,0.35);
    display: none;
    z-index: 800;
    transition: transform 0.2s;
}
.scroll-top.show { display: flex; align-items: center; justify-content: center; }
.scroll-top:hover { transform: scale(1.1); }

/* ═══ PAGE ANIMATIONS ═══ */
@keyframes pageIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes pageOut {
    from { opacity: 1; }
    to   { opacity: 0; transform: translateY(-8px); }
}

/* ═══ DARK MODE SELECT FIX ═══ */
[data-theme="dark"] select,
[data-theme="dark"] select option {
    background: #0f172a;
    color: #f1f5f9;
}
