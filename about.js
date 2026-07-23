(function () {
  'use strict';

  // ─── Timeline data ────────────────────────────────────────────────────────

  var TIMELINE = [
    {
      year:    '2019',
      title:   'Company Founded',
      body:    'KFSQUARE established with two engineers and a single federal contract. Mission: deliver real outcomes, not slide decks.',
      current: false
    },
    {
      year:    '2020',
      title:   'First 100 Clients',
      body:    'Reached 100 clients during a year when every organization was forced to accelerate digital transformation. We were ready.',
      current: false
    },
    {
      year:    '2021',
      title:   'Analytics Platform',
      body:    'Launched an internal analytics accelerator cutting time-to-first-dashboard from weeks to days for new engagements.',
      current: false
    },
    {
      year:    '2022',
      title:   'Government Contracts',
      body:    'Secured multi-year federal contracts off the back of our DVOSB certification and cleared staff. First FISMA-High delivery.',
      current: false
    },
    {
      year:    '2023',
      title:   'International Expansion',
      body:    'Extended delivery into Canada and the UK. Remote-first operating model meant quality stayed consistent across time zones.',
      current: false
    },
    {
      year:    '2024',
      title:   'Workflow Automation',
      body:    'Launched dedicated automation practice focused on document processing and enterprise workflow integration.',
      current: false
    },
    {
      year:    '2025',
      title:   'AI & ML Practice',
      body:    'Formalized AI and machine learning service line. Delivered first production LLM-assisted document review system.',
      current: false
    },
    {
      year:    '2026',
      title:   'Now',
      body:    'Expanding cleared delivery capability and deepening cloud-native data platform work across commercial and federal clients.',
      current: true
    }
  ];

  // ─── Render timeline ──────────────────────────────────────────────────────

  function renderTimeline() {
    var wrap = document.getElementById('timeline');
    if (!wrap) return;

    var html = '';
    TIMELINE.forEach(function (item) {
      html += '<div class="tl-item' + (item.current ? ' current' : '') + '">'
        + '<div class="tl-dot"></div>'
        + '<div class="tl-year">' + item.year + '</div>'
        + '<h4>' + item.title + '</h4>'
        + '<p>' + item.body + '</p>'
        + '</div>';
    });

    wrap.innerHTML = html;
  }

  // ─── Animated counters ────────────────────────────────────────────────────

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    var target   = parseInt(el.getAttribute('data-count'), 10);
    var suffix   = target >= 500 ? '+' : (target >= 40 ? '+' : '');
    var duration = 1400;
    var start    = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var value    = Math.floor(easeOut(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-count]').forEach(function (el) {
        el.textContent = el.getAttribute('data-count') + '+';
      });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCounter(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(function (el) {
      obs.observe(el);
    });
  }

  // ─── Scroll reveal ────────────────────────────────────────────────────────

  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  }

  // ─── Mobile nav ───────────────────────────────────────────────────────────

  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var links  = document.getElementById('nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    renderTimeline();
    initReveal();
    initCounters();
    initNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

}());