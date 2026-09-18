/* ═══════════════════════════════════════════════════════════════
   গ্রন্থকানন — সার্চ (বাংলা / English / Banglish, keyword যেকোনো ক্রমে)

   কীভাবে কাজ করে:
   ১. "phrase"  — পুরো লেখাটা নাম/লেখক/প্রকাশনীর মধ্যে আছে            → সবার আগে
   ২. "keyword" — প্রতিটা শব্দ আলাদা করে আছে (যেকোনো ক্রমে, আংশিক)    → তারপর
   ৩. "banglish" — বাংলা লেখাকে ব্যঞ্জনবর্ণের কঙ্কালে (skeleton) নামিয়ে
                   মেলানো: "বেলা ফুরাবার আগে" → "bl frbr g", আর ব্যবহারকারীর
                   "bela furabar" → "bl frbr" — স্বরবর্ণ বাদ, তাই বানানের
                   হেরফের (phurabar/furabar, aage/age) সমস্যা করে না  → শেষে
   বাংলা লেখায় ি/ী, ু/ূ, ণ/ন, শ/ষ/স, চন্দ্রবিন্দু, য়/ড়/ঢ়-এর দুই রূপ —
   সবই এক করে নেওয়া হয়, তাই এসব বানান-ভুলেও পাওয়া যায়।
   বাইরে থেকে: gkSearchBooks(list, query) → মিলযুক্ত বইয়ের তালিকা (প্রাসঙ্গিকতা অনুযায়ী)
═══════════════════════════════════════════════════════════════ */
(function () {
    var BN_DIGITS = '০১২৩৪৫৬৭৮৯';
    /* বাংলা ব্যঞ্জনবর্ণ → skeleton অক্ষর (মহাপ্রাণ/অল্পপ্রাণ এক, ণ/ন এক, শ/ষ/স এক) */
    var CONS = {
        'ক':'k','খ':'k','গ':'g','ঘ':'g','ঙ':'n','চ':'c','ছ':'c','জ':'j','ঝ':'j','ঞ':'n',
        'ট':'t','ঠ':'t','ড':'d','ঢ':'d','ণ':'n','ত':'t','থ':'t','দ':'d','ধ':'d','ন':'n',
        'প':'p','ফ':'f','ব':'b','ভ':'b','ম':'m','য':'j','র':'r','ল':'l','শ':'s','ষ':'s','স':'s','হ':'h',
        'ৎ':'t','ং':'n'
    };

    /* বাংলা+Latin লেখা মেলানোর জন্য স্বাভাবিক রূপ */
    function norm(s) {
        s = String(s == null ? '' : s).normalize('NFC').toLowerCase();
        s = s.replace(/য়/g, 'য়').replace(/ড়/g, 'ড়').replace(/ঢ়/g, 'ঢ়'); // য় ড় ঢ়
        s = s.replace(/[​-‍﻿]/g, '')
             .replace(/ঁ/g, '')                                   // ঁ
             .replace(/ী/g, 'ি').replace(/ূ/g, 'ু') // ী→ি  ূ→ু
             .replace(/ঈ/g, 'ই').replace(/ঊ/g, 'উ') // ঈ→ই  ঊ→উ
             .replace(/ণ/g, 'ন')                              // ণ→ন
             .replace(/[শষ]/g, 'স')                      // শ ষ→স
             .replace(/ﷺ/g, ' ')                                   // ﷺ
             .replace(/[০-৯]/g, function (d) { return String(BN_DIGITS.indexOf(d)); })
             .replace(/[^\p{L}\p{M}\p{N}\s]+/gu, ' ')
             .replace(/\s+/g, ' ').trim();
        return s;
    }

    /* ব্যঞ্জনবর্ণের কঙ্কাল — বাংলা ও Banglish দুটোকেই একই রূপে আনে */
    function skel(s) {
        s = norm(s)
            .replace(/ক্ষ/g, 'k').replace(/জ্ঞ/g, 'g')
            .replace(/ড়|ঢ়/g, 'r')   // ড় ঢ় → r
            .replace(/য়/g, 'y')                // য় → y
            .replace(/[ৃঋ]/g, 'r')              // ৃ ঋ → r (হৃদয় = hridoy)
            .replace(/্[বয]/g, '');        // ব-ফলা/য-ফলা নীরব (স্বপ্ন = shopno, ব্যাখ্যা = bekkha)
        var out = '', prev = ' ';   // prev: 'c' ব্যঞ্জন, 'v' স্বর, ' ' শব্দের শুরু
        for (var i = 0; i < s.length; i++) {
            var ch = s[i];
            if (CONS[ch] !== undefined) { out += CONS[ch]; prev = 'c'; continue; }
            if (ch === ' ') { out += ' '; prev = ' '; continue; }
            if (ch >= '0' && ch <= '9') { out += ch; prev = 'c'; continue; }
            if (/[aeiou]/.test(ch)) { prev = 'v'; continue; }             // Latin স্বর বাদ
            if (ch === 'h') {
                if (prev === 'c') {                                        // kh/gh/th... → মহাপ্রাণ চিহ্ন বাদ; ph → f
                    if (out.slice(-1) === 'p') out = out.slice(0, -1) + 'f';
                    continue;
                }
                out += 'h'; prev = 'c'; continue;                          // হ
            }
            if (ch >= 'a' && ch <= 'z') {
                if (ch === 'v') ch = 'b'; else if (ch === 'z') ch = 'j'; else if (ch === 'w') ch = 'y';
                else if (ch === 'q') ch = 'k'; else if (ch === 'x') { out += 'ks'; prev = 'c'; continue; }
                out += ch; prev = 'c'; continue;
            }
            prev = 'v';   // বাংলা স্বর/কার/হসন্ত/অন্য কিছু — বাদ
        }
        return out.replace(/ng/g, 'n').replace(/(.)\1+/g, '$1').replace(/\s+/g, ' ').trim();
    }

    var cache = (typeof WeakMap === 'function') ? new WeakMap() : null;
    function keyOf(b) {
        var k = cache && cache.get(b);
        if (k) return k;
        var text = [b.name, b.author, b.pub, b.brand].filter(Boolean).join(' ');
        k = { bn: norm(text), sk: skel(text), bnName: norm(b.name), skName: skel(b.name) };
        if (cache) cache.set(b, k);
        return k;
    }
    function parseQuery(s) {
        var bn = norm(s);
        var bnTok = bn.split(' ').filter(Boolean);
        var sk = skel(s);
        var skTok = sk.split(' ').filter(function (t) { return t.length >= 2; });
        if (sk.replace(/ /g, '').length < 2) skTok = [];   // এক ব্যঞ্জনের লেখায় skeleton মেলানো বন্ধ (সব মিলে যেত)
        return { bn: bn, bnTok: bnTok, sk: sk, skTok: skTok };
    }
    /* token শব্দের শুরুতে মিলছে কিনা (আংশিক লেখা চলবে: "ফুরা" → "ফুরাবার"; মাঝখানে মিললে না) */
    function atWordStart(hay, t) { return (' ' + hay + ' ').indexOf(' ' + t) !== -1; }
    /* স্তর: phrase 30 · keyword 20 · banglish 10 — বইয়ের নামে মিললে +5 (লেখক/প্রকাশনীতে মিললে না) */
    function score(b, q) {
        if (!b) return 0;
        var k = keyOf(b);
        if (q.bn && k.bn.indexOf(q.bn) !== -1) return 30 + (k.bnName.indexOf(q.bn) !== -1 ? 5 : 0);
        if (q.bnTok.length && q.bnTok.every(function (t) { return atWordStart(k.bn, t); }))
            return 20 + (q.bnTok.every(function (t) { return atWordStart(k.bnName, t); }) ? 5 : 0);
        if (q.skTok.length && q.skTok.every(function (t) { return atWordStart(k.sk, t); }))
            return 10 + (q.skTok.every(function (t) { return atWordStart(k.skName, t); }) ? 5 : 0);
        return 0;
    }
    /* list-এর যেসব বই মেলে, প্রাসঙ্গিকতা অনুযায়ী সাজিয়ে (একই স্তরে আগের ক্রম বজায়) */
    function gkSearchBooks(list, query) {
        var q = parseQuery(query);
        if (!q.bn) return (list || []).slice();
        var hits = [];
        (list || []).forEach(function (b, i) { var sc = score(b, q); if (sc) hits.push({ b: b, sc: sc, i: i }); });
        hits.sort(function (a, c) { return c.sc - a.sc || a.i - c.i; });
        return hits.map(function (h) { return h.b; });
    }

    window.gkSearchBooks = gkSearchBooks;
    window.gkSearchParse = parseQuery;
    window.gkSearchScore = score;
    window.gkSearchNorm = norm;
    window.gkSearchSkel = skel;
})();
