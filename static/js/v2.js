// PR-MPPI project page, v2 interactions (no dependencies)
(function () {
  // reading progress
  var bar = document.querySelector('[data-read-progress]');
  function onScroll() {
    if (bar) {
      var h = document.documentElement;
      var p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.width = (p * 100).toFixed(2) + '%';
    }
    // highlight current TOC entry
    var links = document.querySelectorAll('.toc-link');
    var current = null;
    links.forEach(function (a) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t && t.getBoundingClientRect().top < window.innerHeight * 0.35) current = a;
    });
    links.forEach(function (a) { a.classList.toggle('active', a === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // floating TOC
  var toc = document.querySelector('[data-toc]');
  if (toc) {
    var btn = toc.querySelector('.toc-btn');
    btn.addEventListener('click', function () {
      var open = toc.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    toc.querySelectorAll('.toc-link').forEach(function (a) {
      a.addEventListener('click', function () { toc.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
    });
    document.addEventListener('click', function (e) {
      if (!toc.contains(e.target)) { toc.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // collapsible blocks (abstract, implementation details)
  document.querySelectorAll('[data-fold-toggle]').forEach(function (tgl) {
    tgl.addEventListener('click', function () {
      var box = document.getElementById(tgl.getAttribute('aria-controls'));
      var open = box.classList.toggle('open');
      tgl.setAttribute('aria-expanded', open ? 'true' : 'false');
      tgl.querySelector('span').textContent = tgl.getAttribute(open ? 'data-label-open' : 'data-label-closed');
    });
  });

  // YouTube facade: load the player only on click
  document.querySelectorAll('[data-yt]').forEach(function (box) {
    var f = box.querySelector('.yt-facade');
    f.addEventListener('click', function () {
      var id = box.getAttribute('data-yt');
      var ifr = document.createElement('iframe');
      ifr.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      ifr.title = box.getAttribute('data-title') || 'Video';
      ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      ifr.allowFullscreen = true;
      box.replaceChild(ifr, f);
    });
  });

  // reveal on scroll + play videos only while visible
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { ro.observe(el); });

    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && !reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('video[data-autoplay]').forEach(function (v) { vo.observe(v); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // BibTeX copy
  var cb = document.querySelector('[data-copy-bib]');
  if (cb) {
    cb.addEventListener('click', function () {
      var txt = document.getElementById('bibtex-code').innerText;
      var done = function () { cb.textContent = 'Copied'; setTimeout(function () { cb.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard) { navigator.clipboard.writeText(txt).then(done, done); }
      else {
        var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta);
        ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done();
      }
    });
  }
})();
