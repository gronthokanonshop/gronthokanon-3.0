/* ═══════════════════════════════════════════════════════════════
   গ্রন্থকানন সহকারী — "Contact us" কার্ডের ভেতরে ছোট চ্যাট
   • বই খুঁজে দেয় (বাংলা / English / Banglish) — ছবি, দাম, কার্টে যোগ
   • অর্ডার ID বা মোবাইল নম্বর দিলে অর্ডারের অবস্থা বলে
   • ডেলিভারি, পেমেন্ট, রিটার্ন, কুপন ইত্যাদি সাধারণ প্রশ্নের উত্তর
   • না পারলে এক চাপে WhatsApp-এ মানুষের কাছে পাঠায়
   কোনো বাইরের AI/API নেই — সব এই সাইটের ভেতরেই, বিনা খরচে।

   বন্ধ করতে চাইলে: common.js-এ "gk-assistant.js" লোড করার লাইনটা মুছে দিন
   (Contact কার্ড আগের মতো থাকবে)।
═══════════════════════════════════════════════════════════════ */
(function () {
    if (window.__gkAssistant) return;
    window.__gkAssistant = true;

    var DB = 'https://gronthokanon-8573e-default-rtdb.firebaseio.com';
    var WA_NUM = '8801516595762';
    var STATUS = { pending: ['পেন্ডিং', '#92400e', '#fef3c7'], confirmed: ['কনফার্ম হয়েছে', '#1e40af', '#dbeafe'], processing: ['প্যাকেজিং চলছে', '#5b21b6', '#ede9fe'], shipped: ['কুরিয়ারে পাঠানো হয়েছে', '#075985', '#e0f2fe'], delivered: ['ডেলিভারি সম্পন্ন', '#166534', '#dcfce7'], cancelled: ['বাতিল', '#991b1b', '#fee2e2'] };

    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function bn(n) { return String(n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); }
    function en(s) { return String(s).replace(/[০-৯]/g, function (d) { return '০১২৩৪৫৬৭৮৯'.indexOf(d); }); }
    function waLink(text) { return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(text); }

    /* ── প্রশ্নের উত্তর (সাইটের FAQ / ডেলিভারি / রিটার্ন পেজ অনুযায়ী) ── */
    var FAQ = [
        { k: ['ডেলিভারি চার্জ', 'ডেলিভারি খরচ', 'delivery charge', 'shipping', 'charge koto', 'চার্জ কত', 'ডেলিভারি কত'],
          a: '🚚 <b>ডেলিভারি চার্জ</b><br>• ঢাকার ভেতরে: ৳৬০<br>• ঢাকার আশপাশ (সাভার, আশুলিয়া, কেরানীগঞ্জ ইত্যাদি): ৳৮০<br>• ঢাকার বাইরে সারা দেশে: ৳৯০<br>• অফিস ডেলিভারি (সুন্দরবন কুরিয়ার অফিস থেকে নিলে): মাত্র ৳৫০' },
        { k: ['কতদিন', 'কত দিন', 'কবে পাব', 'কবে পাবো', 'সময় লাগে', 'কত সময়', 'how long', 'koto din', 'kobe pabo', 'delivery time', 'কয়দিন'],
          a: '⏱️ <b>ডেলিভারির সময়</b><br>• ঢাকার ভেতরে: ১–২ কার্যদিবস<br>• ঢাকার বাইরে: ৩–৫ কার্যদিবস' },
        { k: ['রিটার্ন', 'ফেরত', 'বদল', 'এক্সচেঞ্জ', 'return', 'exchange', 'refund', 'ছেঁড়া', 'ভুল বই'],
          a: '↩️ <b>রিটার্ন নীতি</b><br>• ডেলিভারির ৭ দিনের মধ্যে জানাতে হবে<br>• ভুল বই বা ছাপা/পাতা ত্রুটি থাকলে বিনামূল্যে বদলে দেওয়া হয়<br>• পড়া/ব্যবহৃত বই ফেরত নেওয়া হয় না<br><a href="return.html">বিস্তারিত নীতি →</a>' },
        { k: ['ক্যাশ অন', 'cash on', 'cod', 'পেমেন্ট', 'payment', 'বিকাশ', 'bkash', 'নগদ', 'টাকা কিভাবে', 'টাকা কীভাবে'],
          a: '💳 <b>পেমেন্ট</b><br>• হোম ডেলিভারিতে <b>ক্যাশ অন ডেলিভারি</b> — বই হাতে পেয়ে টাকা দিন<br>• অফিস ডেলিভারিতে (সুন্দরবন কুরিয়ার) আগে বিকাশে পেমেন্ট করতে হয়' },
        { k: ['কুপন', 'coupon', 'coupon code', 'promo', 'promo code', 'voucher', 'প্রোমো', 'অফার', 'offer', 'offers', 'ছাড়', 'discount', 'ডিসকাউন্ট', 'উপহার', 'গিফট', 'gift', 'হাদিয়া', 'hadiya'],
          a: function () {
              var t = window.GK_GIFT_THRESHOLD || 1000;
              return '🎁 <b>অফার</b><br>• প্রথম অর্ডারে কুপন <b>FIRSTORDER</b> দিলে ৫% ছাড়<br>• ৳' + bn(t) + ' বা তার বেশি অর্ডারে উপহার<br>• প্রায় সব বইয়েই মুদ্রিত দামের চেয়ে কম দাম';
          } },
        { k: ['অরিজিনাল', 'original', 'আসল বই', 'ফটোকপি', 'nokol', 'নকল'],
          a: '✅ আমরা <b>১০০% অরিজিনাল</b> বই দিই — সরাসরি প্রকাশনী থেকে সংগ্রহ করা।' },
        { k: ['কিভাবে অর্ডার', 'কীভাবে অর্ডার', 'অর্ডার করব', 'অর্ডার করবো', 'how to order', 'order korbo', 'কিনব কিভাবে'],
          a: '🛒 <b>অর্ডার করা খুব সহজ</b><br>১. বই খুঁজে "কার্টে যোগ করুন"<br>২. কার্ট থেকে "অর্ডার করুন"<br>৩. নাম, মোবাইল, ঠিকানা দিয়ে নিশ্চিত করুন<br>চাইলে এখানেই বইয়ের নাম লিখুন, খুঁজে দিচ্ছি।' },
        { k: ['দোকান', 'ঠিকানা কোথায়', 'অফিস', 'location', 'কোথায় আপনারা', 'shop'],
          a: '📍 আমরা অনলাইন বুকশপ (ঢাকা, বাংলাদেশ) — সারা দেশে হোম ডেলিভারি দিই।' },
        { k: ['সময়সূচি', 'খোলা', 'কখন খোলা', 'open', 'অফিস টাইম', 'কয়টা'],
          a: '⏰ শনি–বৃহস্পতি সকাল ৯টা – রাত ১০টা, শুক্রবার বিকাল ৪টা – রাত ১০টা আমরা উত্তর দিই। অর্ডার দেওয়া যায় ২৪ ঘণ্টা।' }
    ];
    var GREET = ['সালাম', 'আসসালামু', 'আস্সালামু', 'assalam', 'assalamu', 'assalamualaikum', 'asalamualaikum', 'aslamualaikum', 'asslamualaikum', 'salam', 'slm', 'alaikum', 'হ্যালো', 'hello', 'hlw', 'hi', 'হাই', 'hey'];
    var THANKS = ['ধন্যবাদ', 'thanks', 'thank you', 'জাযাকাল্লাহ', 'jazakallah', 'শুকরিয়া'];
    var HUMAN = ['মানুষ', 'কথা বলতে', 'কথা বলব', 'কল দিন', 'agent', 'human', 'প্রতিনিধি', 'whatsapp', 'হোয়াটসঅ্যাপ'];
    var TRACK = ['অর্ডার কোথায়', 'অর্ডারের অবস্থা', 'ট্র্যাক', 'track', 'order status', 'আমার অর্ডার', 'amar order', 'অর্ডার এখন'];

    /* ইংরেজি/Banglish শব্দ শুধু পুরো শব্দ হিসেবে মিললে — নাহলে "hisam"-এর ভেতরের "hi"-কে সালাম,
       "code"-এর ভেতরের "cod"-কে ক্যাশ অন ডেলিভারি ধরে ফেলত। বাংলা শব্দ আগের মতো অংশ মিললেই হয়
       (যেমন "ফেরত দেওয়া" → "ফেরত") */
    var reCache = {};
    function has(q, list) {
        for (var i = 0; i < list.length; i++) {
            var k = list[i];
            if (/^[\x00-\x7F]+$/.test(k)) {
                var re = reCache[k] || (reCache[k] = new RegExp('(^|[^a-z0-9])' + k.replace(/[.*+?^${}()|[\]\\']/g, '\\$&') + '($|[^a-z0-9])', 'i'));
                if (re.test(q)) return true;
            } else if (q.indexOf(k) > -1) return true;
        }
        return false;
    }

    /* ── বইয়ের ডেটা — যেসব পেজে book.js নেই সেখানে প্রথম খোঁজের সময় একবার নামায় ── */
    var booksReady = null;
    function loadScript(src) {
        return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    }
    function ensureBooks() {
        if (typeof books !== 'undefined' && books.length && typeof gkSearchBooks === 'function') return Promise.resolve();
        if (!booksReady) {
            booksReady = (typeof books !== 'undefined' && books.length ? Promise.resolve() : loadScript('book.js'))
                .then(function () { return typeof gkSearchBooks === 'function' ? null : loadScript('gksearch.js'); })
                .then(function () { return typeof GK_BOOKS_VER === 'undefined' ? null : loadScript('gkbooks-live.js').then(function () { return window.GK_BOOKS_LIVE; }); })
                .catch(function () { booksReady = null; });
        }
        return booksReady;
    }
    function allBooks() { return (typeof books !== 'undefined' ? books : []).filter(function (b) { return b && !(window.gkIsHiddenBook && gkIsHiddenBook(b)); }); }
    function img(b) { return (typeof bookImgs !== 'undefined' && bookImgs[b.name]) || b.img || 'book-placeholder.svg'; }

    /* ── UI ── */
    var body, input, chipsBox, awaiting = '', lastResults = [];
    function scroll() { body.scrollTop = body.scrollHeight; }
    function addMsg(html, who) {
        var m = document.createElement('div');
        m.className = 'gka-msg ' + (who === 'me' ? 'gka-me' : 'gka-bot');
        m.innerHTML = html;
        body.appendChild(m); scroll();
        return m;
    }
    function typing() {
        var t = addMsg('<span class="gka-dots"><i></i><i></i><i></i></span>', 'bot');
        t.classList.add('gka-typing');
        return t;
    }
    function reply(html, delay) {
        var t = typing();
        return new Promise(function (res) { setTimeout(function () { t.remove(); res(addMsg(html, 'bot')); }, delay || 450); });
    }
    function humanBox(prefill, label) {
        return '<div class="gka-human"><a class="gka-wa" href="' + waLink(prefill || 'আসসালামু আলাইকুম, একটা বিষয়ে জানতে চাই।') + '" target="_blank" rel="noopener">' + (label || 'WhatsApp-এ কথা বলুন') + '</a></div>';
    }

    function bookCard(b) {
        var idx = books.indexOf(b);
        var out = window.gkIsOut && window.gkIsOut(idx);
        var off = Number(b.original_price) > Number(b.price) ? '<s>৳' + bn(b.original_price) + '</s>' : '';
        return '<div class="gka-book">' +
            '<a href="book.html?id=' + encodeURIComponent(b.bid || idx) + '"><img src="' + esc(img(b)) + '" alt="" loading="lazy"></a>' +
            '<div class="gka-binfo"><a href="book.html?id=' + encodeURIComponent(b.bid || idx) + '" class="gka-bname">' + esc(b.name) + '</a>' +
            '<span class="gka-bauth">' + esc(b.author || b.pub || '') + '</span>' +
            '<span class="gka-bprice">৳' + bn(b.price) + ' ' + off + '</span></div>' +
            (out ? '<span class="gka-out">স্টক শেষ</span>' : '<button type="button" class="gka-add" data-i="' + idx + '" title="কার্টে যোগ করুন">+ কার্ট</button>') +
            '</div>';
    }
    function addToCart(i) {
        var b = books[i]; if (!b) return;
        var cart = []; try { cart = JSON.parse(localStorage.getItem('gronthokanon_cart')) || []; } catch (e) {}
        cart.push({ name: b.name, price: b.price, img: img(b) });
        localStorage.setItem('gronthokanon_cart', JSON.stringify(cart));
        /* পেজের নিজস্ব cart ভেরিয়েবলও মিলিয়ে রাখি — নাহলে পরের "কার্টে যোগ" এই বইটা মুছে লিখে ফেলত */
        try { if (typeof cart !== 'undefined') cart = JSON.parse(localStorage.getItem('gronthokanon_cart')) || []; } catch (e) {}
        try { if (typeof updateCartUI === 'function') updateCartUI(); } catch (e) {}
        try { if (typeof updateCartCount === 'function') updateCartCount(); } catch (e) {}
        try { if (window.gkCartUpdateUI) gkCartUpdateUI(); } catch (e) {}
        reply('✅ <b>' + esc(b.name) + '</b> কার্টে যোগ হয়েছে। <a href="checkout.html">অর্ডার করুন →</a>', 250);
    }

    function searchBooks(q) {
        return ensureBooks().then(function () {
            var list = allBooks();
            var found = typeof gkSearchBooks === 'function' ? gkSearchBooks(list, q) : list.filter(function (b) { return (b.name + ' ' + (b.author || '')).toLowerCase().indexOf(q.toLowerCase()) > -1; });
            return found;
        });
    }
    function showBooks(q, found) {
        if (!found.length) {
            return reply('দুঃখিত, "<b>' + esc(q) + '</b>" নামে কোনো বই পাইনি 😔<br>জানালে আমরা বইটি এনে দিতে পারি।' + humanBox('আসসালামু আলাইকুম, আমি এই বইটি খুঁজছি: ' + q, 'বইটি চেয়ে WhatsApp করুন'));
        }
        lastResults = found;
        var top = found.slice(0, 4);
        var more = found.length > 4 ? '<a class="gka-more" href="filter.html?q=' + encodeURIComponent(q) + '" data-q="' + esc(q) + '">আরও ' + bn(found.length - 4) + 'টি বই দেখুন →</a>' : '';
        return reply('📚 "<b>' + esc(q) + '</b>" — ' + bn(found.length) + 'টি বই পেয়েছি:' + top.map(bookCard).join('') + more, 600);
    }

    function fbGet(path) { return fetch(DB + path + '.json').then(function (r) { return r.ok ? r.json() : null; }); }
    function orderLine(o) {
        var s = STATUS[o.status] || STATUS.pending;
        var d = o.createdAt ? new Date(o.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' }) : '';
        return '<div class="gka-order"><div><b>' + esc(o.orderId) + '</b><small>' + esc(d) + (o.total ? ' · ' + esc(o.total) : '') + '</small></div>' +
            '<span style="color:' + s[1] + ';background:' + s[2] + ';">' + s[0] + '</span></div>';
    }
    function trackById(id) {
        var t = typing();
        return fbGet('/orders/' + encodeURIComponent(id)).then(function (o) {
            t.remove();
            if (!o) return addMsg('এই ID-তে (<b>' + esc(id) + '</b>) কোনো অর্ডার পাইনি। ID-টা আরেকবার দেখে লিখুন, অথবা অর্ডারের মোবাইল নম্বর দিন।', 'bot');
            return addMsg('📦 আপনার অর্ডার:' + orderLine(o) + '<a href="track.html">বিস্তারিত ট্র্যাক করুন →</a>', 'bot');
        }).catch(function () { t.remove(); addMsg('সংযোগে সমস্যা হচ্ছে, একটু পর আবার চেষ্টা করুন।', 'bot'); });
    }
    function trackByPhone(phone) {
        var t = typing();
        return fbGet('/phoneIndex/' + phone).then(function (idx) {
            if (!idx) { t.remove(); return addMsg('এই নম্বরে (<b>' + bn(phone) + '</b>) কোনো অর্ডার পাইনি।', 'bot'); }
            var ids = Object.keys(idx);
            return Promise.all(ids.map(function (id) { return fbGet('/orders/' + encodeURIComponent(id)).catch(function () { return null; }); })).then(function (list) {
                t.remove();
                list = list.filter(Boolean).sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
                if (!list.length) return addMsg('এই নম্বরে কোনো অর্ডার পাইনি।', 'bot');
                addMsg('📦 এই নম্বরে ' + bn(list.length) + 'টি অর্ডার' + (list.length > 3 ? ' (সাম্প্রতিক ৩টি)' : '') + ':' + list.slice(0, 3).map(orderLine).join('') + '<a href="track.html">সব অর্ডার দেখুন →</a>', 'bot');
            });
        }).catch(function () { t.remove(); addMsg('সংযোগে সমস্যা হচ্ছে, একটু পর আবার চেষ্টা করুন।', 'bot'); });
    }

    function handle(raw) {
        var text = String(raw || '').trim();
        if (!text) return;
        addMsg(esc(text), 'me');
        var q = text.toLowerCase(), qe = en(text);

        var idm = qe.match(/GK-[A-Z0-9]{4,}/i);
        if (idm) { awaiting = ''; return trackById(idm[0].toUpperCase()); }
        var ph = qe.replace(/[\s-]/g, '').match(/(?:\+?88)?(01[3-9]\d{8})/);
        if (ph) { awaiting = ''; return trackByPhone(ph[1]); }
        /* অর্ডার ID/নম্বরের অপেক্ষায় থাকলেও কেউ অন্য প্রশ্ন করলে সেটারই উত্তর দিই —
           শুধু সংখ্যার মতো কিছু (ভুল ফরম্যাটের নম্বর/ID) লিখলে আবার মনে করিয়ে দিই */
        if (awaiting === 'order') {
            awaiting = '';
            if (/^[\s\d+\-a-z]{4,}$/i.test(qe) && /\d{3,}/.test(qe)) { awaiting = 'order'; return reply('নম্বরটি ঠিক মনে হচ্ছে না। অর্ডার ID (যেমন <b>GK-AB12CD</b>) অথবা ১১ ডিজিটের মোবাইল নম্বর লিখুন।'); }
        }

        if (has(q, TRACK)) { awaiting = 'order'; return reply('📦 অর্ডার ID (যেমন <b>GK-AB12CD</b>) বা অর্ডারের মোবাইল নম্বর লিখুন — খুঁজে দিচ্ছি।'); }
        if (has(q, HUMAN)) return reply('আমাদের টিমের সাথে সরাসরি কথা বলুন:' + humanBox());
        for (var i = 0; i < FAQ.length; i++) {
            if (has(q, FAQ[i].k)) { var a = FAQ[i].a; return reply(typeof a === 'function' ? a() : a); }
        }
        /* সালামের শব্দগুলো বাদ দিয়ে কিছু না থাকলে শুধু সালাম; কিছু থাকলে (যেমন "সালাম, আরিফ আজাদের বই")
           সালাম বাদ দিয়ে বাকিটা দিয়ে খুঁজি */
        var noGreet = text.replace(/(^|\s)(আস্?সালামু|আসসালামু|আলাইকুম|ওয়া|রাহমাতুল্লাহ|ওয়াবারাকাতুহ|বারাকাতুহ|সালাম|হ্যালো|হাই|a+s+a?lamu?|assalamualaikum|asalamualaikum|aslamualaikum|asslamualaikum|alaikum|wa|rahmatullah|wabarakatuh|barakatuh|salam|slm|hello|hlw|hi|hey|bhai|ভাই|ভাইয়া|apu|আপু)(?=[\s,!।.?]|$)/gi, ' ').replace(/[\s,!।.?]+/g, ' ').trim();
        if (has(q, GREET) && noGreet) text = noGreet;
        else if (has(q, GREET)) return reply('ওয়ালাইকুমুস সালাম 😊 বলুন, কীভাবে সাহায্য করতে পারি? বইয়ের নাম বা লেখকের নাম লিখলেই খুঁজে দেব।');
        if (has(q, THANKS)) return reply('আপনাকেও ধন্যবাদ 🌿 আর কিছু লাগলে জানাবেন।');

        /* বাকি সব — বই খোঁজা ("বই" / "chai" / "আছে?" ইত্যাদি বাড়তি শব্দ বাদ দিয়ে) */
        var bq = text.replace(/[?？!।,]+/g, ' ')
            .replace(/(^|\s)(নিয়ে|সম্পর্কে|বিষয়ে|বিষয়ক|উপর|লেখা|আছে|আছেন|কি|কী|চাই|দরকার|খুঁজছি|খুজছি|দেন|দিন|দাও|লাগবে|এর|বইটা|বইটি|বইগুলো|বই|ache|ase|chai|lagbe|dorkar|book|books|boi|er|ki|do you have|have)(?=\s|$)/gi, ' ')
            .replace(/\s+/g, ' ').trim() || text;
        var t = typing();
        return searchBooks(bq).then(function (found) { t.remove(); return showBooks(bq, found); })
            .catch(function () { t.remove(); addMsg('বইয়ের তালিকা লোড করা যাচ্ছে না, একটু পর চেষ্টা করুন।', 'bot'); });
    }

    var CHIPS = [
        ['📚 বই খুঁজুন', function () { awaiting = ''; reply('বইয়ের নাম, লেখক বা বিষয় লিখুন — যেমন <b>আরিফ আজাদ</b>, <b>সীরাত</b>, <b>বেলা ফুরাবার আগে</b>।'); input.focus(); }],
        ['📦 আমার অর্ডার', function () { handle('আমার অর্ডার'); }],
        ['🚚 ডেলিভারি চার্জ', function () { handle('ডেলিভারি চার্জ'); }],
        ['⏱️ কতদিনে পাব', function () { handle('কতদিনে পাব'); }],
        ['🎁 অফার', function () { handle('অফার'); }],
        ['↩️ রিটার্ন', function () { handle('রিটার্ন'); }]
    ];

    function mount() {
        var card = document.querySelector('#gkContact .gkc-card');
        if (!card || card.querySelector('.gka')) return !!card;
        card.classList.add('gka-on');
        var hello = card.querySelector('.gkc-hello');
        var list = card.querySelector('.gkc-list');
        var wrap = document.createElement('div');
        wrap.className = 'gka';
        wrap.innerHTML = '<div class="gka-body"></div><div class="gka-chips"></div>' +
            '<form class="gka-form" autocomplete="off"><input type="text" class="gka-input" placeholder="বইয়ের নাম বা প্রশ্ন লিখুন..." enterkeyhint="send" maxlength="120">' +
            '<button type="submit" class="gka-send" aria-label="পাঠান"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></form>';
        if (hello) hello.replaceWith(wrap); else card.insertBefore(wrap, list);
        /* WhatsApp / Messenger / কল — নিচে ছোট এক সারিতে */
        if (list) {
            list.classList.add('gka-contacts');
            var short = { 'gkc-wa': 'WhatsApp', 'gkc-msgr': 'Messenger', 'gkc-call': 'কল করুন' };
            list.querySelectorAll('.gkc-row').forEach(function (r) {
                Object.keys(short).forEach(function (c) { if (r.classList.contains(c)) r.querySelector('.gkc-txt b').textContent = short[c]; });
            });
            var lbl = document.createElement('div');
            lbl.className = 'gka-clbl';
            lbl.textContent = 'সরাসরি কথা বলুন';
            list.parentNode.insertBefore(lbl, list);
        }
        body = wrap.querySelector('.gka-body');
        input = wrap.querySelector('.gka-input');
        chipsBox = wrap.querySelector('.gka-chips');
        CHIPS.forEach(function (c) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'gka-chip'; b.textContent = c[0];
            b.addEventListener('click', function (e) { e.stopPropagation(); c[1](); });
            chipsBox.appendChild(b);
        });
        wrap.querySelector('.gka-form').addEventListener('submit', function (e) {
            e.preventDefault();
            var v = input.value; input.value = '';
            handle(v);
        });
        body.addEventListener('click', function (e) {
            var add = e.target.closest('.gka-add');
            if (add) { e.stopPropagation(); addToCart(+add.dataset.i); return; }
            var more = e.target.closest('.gka-more');
            if (more && typeof openSearch === 'function' && document.getElementById('searchInput')) {
                /* হোমপেজে থাকলে পূর্ণ সার্চ স্ক্রিনেই খুলি */
                e.preventDefault();
                gkToggleContact(); openSearch();
                var si = document.getElementById('searchInput'); si.value = more.dataset.q; si.dispatchEvent(new Event('input'));
            }
        });
        addMsg('আসসালামু আলাইকুম 👋 আমি <b>গ্রন্থকানন সহকারী</b>।<br>বই খুঁজে দিতে, অর্ডারের খবর জানাতে বা যেকোনো প্রশ্নের উত্তর দিতে পারি।', 'bot');
        return true;
    }
    function tryMount(n) { if (!mount() && n > 0) setTimeout(function () { tryMount(n - 1); }, 300); }
    tryMount(20);
    /* প্রথমবার কার্ট খুললে বইয়ের তালিকা আগেভাগে নামিয়ে রাখি, যাতে প্রথম খোঁজ দ্রুত হয় */
    document.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.gkc-fab')) setTimeout(ensureBooks, 300);
    });
})();
