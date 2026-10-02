/* OurDedication — ছোট সহায়ক ফিচার (সব বড় পেজে ব্যবহার হয়)
   ১) "উপরে ফিরুন" বাটন — অনেক নিচে স্ক্রল করলে দেখা যায়
   ২) "অ্যাপ ইনস্টল করুন" বার — ব্রাউজার ইনস্টল সাপোর্ট করলে (Android Chrome ইত্যাদি) */
(function(){
  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

  var css = document.createElement('style');
  css.textContent =
    '.od-totop{position:fixed;left:18px;bottom:84px;z-index:139;width:44px;height:44px;border-radius:50%;border:1px solid rgba(203,37,39,.25);background:#fff;color:#CB2527;box-shadow:0 4px 14px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .25s,transform .25s;}' +
    '.od-totop.show{opacity:1;transform:none;pointer-events:auto;}' +
    '.od-totop svg{width:22px;height:22px;}' +
    '@media(min-width:900px){.od-totop{left:24px;bottom:82px;}}' +
    '.od-install{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:160;width:min(440px,calc(100% - 24px));background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.18);display:flex;align-items:center;gap:12px;padding:10px 12px;font-family:inherit;}' +
    '@media(min-width:900px){.od-install{bottom:24px;}}' +
    '.od-install img{width:44px;height:44px;border-radius:10px;flex-shrink:0;}' +
    '.od-install .t{flex:1;min-width:0;font-size:.85rem;line-height:1.35;color:#1a1a1a;}' +
    '.od-install .t b{display:block;font-size:.92rem;}' +
    '.od-install .go{background:linear-gradient(135deg,#CB2527,#a91d1f);color:#fff;border:none;border-radius:20px;padding:8px 14px;font-weight:700;font-size:.82rem;cursor:pointer;font-family:inherit;white-space:nowrap;}' +
    '.od-install .x{background:none;border:none;color:#888;font-size:1.2rem;cursor:pointer;padding:4px 6px;line-height:1;}';
  document.head.appendChild(css);

  /* ── উপরে ফিরুন ── */
  var top = document.createElement('button');
  top.className = 'od-totop';
  top.type = 'button';
  top.title = 'উপরে ফিরুন';
  top.setAttribute('aria-label', 'উপরে ফিরুন');
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  top.onclick = function(){ window.scrollTo({top:0, behavior:'smooth'}); };
  document.body.appendChild(top);
  function syncTop(){ top.classList.toggle('show', window.scrollY > 700); }
  window.addEventListener('scroll', syncTop, {passive:true});
  syncTop();

  /* ── অ্যাপ ইনস্টল ── (বাতিল করলে ৭ দিন আর দেখানো হয় না) */
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
  }
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferred = e;
    var dismissed = Number(lsGet('od_install_dismissed') || 0);
    if(Date.now() - dismissed < 7*24*3600*1000) return;
    if(document.querySelector('.od-install')) return;
    var bar = document.createElement('div');
    bar.className = 'od-install';
    bar.innerHTML = '<img src="icon-192.png?v=4" alt="">' +
      '<div class="t"><b>OurDedication অ্যাপ</b>ফোনের হোম স্ক্রিনে রাখুন — এক চাপে দোকানে</div>' +
      '<button class="go" type="button">ইনস্টল</button>' +
      '<button class="x" type="button" aria-label="বন্ধ করুন">✕</button>';
    bar.querySelector('.go').onclick = function(){
      bar.remove();
      if(!deferred) return;
      deferred.prompt();
      deferred.userChoice.finally(function(){ deferred = null; });
    };
    bar.querySelector('.x').onclick = function(){ lsSet('od_install_dismissed', String(Date.now())); bar.remove(); };
    setTimeout(function(){ document.body.appendChild(bar); }, 4000);
  });
  window.addEventListener('appinstalled', function(){ var b = document.querySelector('.od-install'); if(b) b.remove(); });
})();
