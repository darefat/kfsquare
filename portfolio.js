(function () {
  'use strict';

  // ─── Project catalog ──────────────────────────────────────────────────────
  // Replace with fetch('portfolio.json') once the JSON file exists,
  // following the same async pattern used in services.js.

  var PROJECTS = [
    {
      id:          'healthcare-analytics',
      title:       'Healthcare Analytics Platform',
      icon:        '🏥',
      category:    'analytics',
      featured:    true,
      description: 'Predictive analytics system that surfaces early-intervention recommendations for at-risk patients across a major healthcare network.',
      metrics:     [{ val: '35%', lbl: 'Readmission Reduction' }, { val: '$2.5M', lbl: 'Annual Savings' }],
      tech:        ['Python', 'Statsmodels', 'AWS', 'HIPAA'],
      details:     'Built on a serverless AWS architecture, the platform ingests real-time EHR data, runs survival-analysis models, and pushes actionable alerts to clinical staff within minutes of a risk threshold being crossed. Full HIPAA compliance and ATO documentation included.'
    },
    {
      id:          'fraud-detection',
      title:       'Fraud Detection System',
      icon:        '🏦',
      category:    'ai-ml',
      featured:    true,
      description: 'Real-time statistical scoring engine that flags fraudulent transactions with 99.2% accuracy across 10M+ daily events.',
      metrics:     [{ val: '99.2%', lbl: 'Detection Accuracy' }, { val: '10M+', lbl: 'Daily Transactions' }],
      tech:        ['Kafka', 'Spark', 'Azure', 'Real-time Scoring'],
      details:     'Stream-processing pipeline on Azure Event Hubs and Spark Structured Streaming. Ensemble model (gradient boosting + isolation forest) scores every transaction in under 80ms. False-positive rate held below 0.1% to protect customer experience.'
    },
    {
      id:          'omnichannel-analytics',
      title:       'Omnichannel Analytics',
      icon:        '🛒',
      category:    'analytics',
      featured:    false,
      description: '360-degree customer view dashboards that unified siloed retail data and drove measurable conversion and retention gains.',
      metrics:     [{ val: '28%', lbl: 'Sales Increase' }, { val: '22%', lbl: 'Retention Boost' }],
      tech:        ['Tableau', 'Snowflake', 'dbt', 'Real-time'],
      details:     'Consolidated POS, e-commerce, loyalty, and social data into a single Snowflake warehouse. dbt handles transformation lineage. Live Tableau dashboards expose customer segments and product affinity scores to merchandising teams.'
    },
    {
      id:          'predictive-maintenance',
      title:       'Predictive Maintenance',
      icon:        '🏭',
      category:    'ai-ml',
      featured:    false,
      description: 'IoT sensor analytics across 15 manufacturing plants that predicts equipment failure before it halts the line.',
      metrics:     [{ val: '45%', lbl: 'Downtime Reduction' }, { val: '30%', lbl: 'Cost Savings' }],
      tech:        ['IoT', 'Time Series', 'Edge Computing', 'Docker'],
      details:     'Edge nodes collect vibration, temperature, and pressure data at 10kHz. LSTM models trained per asset type detect anomaly patterns 72+ hours before failure. Maintenance work orders generated automatically in the client\'s ERP.'
    },
    {
      id:          'data-pipeline',
      title:       'Enterprise Data Platform',
      icon:        '🗄️',
      category:    'engineering',
      featured:    false,
      description: 'Cloud-native lakehouse consolidating 12 source systems into a single governed data platform serving 400+ internal analysts.',
      metrics:     [{ val: '12×', lbl: 'Query Speed' }, { val: '400+', lbl: 'Active Users' }],
      tech:        ['Databricks', 'Delta Lake', 'dbt', 'Terraform'],
      details:     'Infrastructure-as-code deployment on Databricks Unity Catalog. Delta Lake medallion architecture (bronze/silver/gold) with automated data-quality checks at each layer. Full column-level lineage and row-level security for 400+ analysts across six business units.'
    },
    {
      id:          'process-automation',
      title:       'Claims Processing Automation',
      icon:        '⚙️',
      category:    'automation',
      featured:    false,
      description: 'End-to-end workflow automation for insurance claims that cut manual processing time by 70% and error rates by 90%.',
      metrics:     [{ val: '70%', lbl: 'Time Saved' }, { val: '90%', lbl: 'Error Reduction' }],
      tech:        ['Python', 'Node.js', 'REST APIs', 'PostgreSQL'],
      details:     'Document ingestion pipeline parses PDFs and images with OCR, extracts structured fields, and routes each claim through a rules engine. Edge cases escalate to human review. Full audit trail stored in PostgreSQL with immutable event log.'
    }
  ];

  var catalog      = [];
  var activeFilter = 'all';

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function techTags(list) {
    if (!Array.isArray(list) || !list.length) return '';
    return list.slice(0, 4).map(function (t) {
      return '<span class="tech-tag">' + t + '</span>';
    }).join('');
  }

  function metricRow(list) {
    if (!Array.isArray(list) || !list.length) return '';
    var items = list.map(function (m) {
      return '<div class="metric-item">'
        + '<div class="metric-val">' + m.val + '</div>'
        + '<div class="metric-lbl">' + m.lbl + '</div>'
        + '</div>';
    }).join('');
    return '<div class="metric-row">' + items + '</div>';
  }

  function buildCard(project, index) {
    var badge   = project.featured ? '<div class="pf-badge">Featured</div>' : '';
    var classes = 'pf-card' + (project.featured ? ' featured' : '');

    return '<div class="' + classes + '" id="' + project.id + '" data-category="' + project.category + '" role="article" aria-label="' + project.title + '">'
      + badge
      + '<div class="pf-num">' + pad(index + 1) + '</div>'
      + '<div class="d-flex align-items-center gap-3 mb-3">'
        + '<div class="pf-icon-wrap"><span style="font-size:1.1rem;">' + project.icon + '</span></div>'
        + '<h3 class="pf-title">' + project.title + '</h3>'
      + '</div>'
      + '<p class="pf-desc">' + project.description + '</p>'
      + metricRow(project.metrics)
      + '<div class="d-flex flex-wrap gap-1 mb-3">' + techTags(project.tech) + '</div>'
      + '<div class="d-flex align-items-center justify-content-between mt-2">'
        + '<a href="contact.html?subject=' + encodeURIComponent('Start a project like ' + project.title) + '" class="pf-link" aria-label="Start a similar project">'
          + 'Start Similar Project <i class="fas fa-arrow-right" style="font-size:0.65rem;"></i>'
        + '</a>'
        + '<button class="pf-link" data-modal="' + project.id + '" aria-label="Read case study for ' + project.title + '">Case Study</button>'
      + '</div>'
      + '</div>';
  }

  function skeletonCards(n) {
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<div class="skeleton-card">'
        + '<div class="skeleton-line" style="height:12px;width:30%;"></div>'
        + '<div class="skeleton-line" style="height:20px;width:70%;margin-top:16px;"></div>'
        + '<div class="skeleton-line" style="height:14px;width:90%;"></div>'
        + '<div class="skeleton-line" style="height:14px;width:80%;"></div>'
        + '<div class="skeleton-line" style="height:32px;width:55%;margin-top:16px;border-radius:6px;"></div>'
        + '</div>';
    }
    return html;
  }

  // ─── Grid ─────────────────────────────────────────────────────────────────

  function renderGrid(projects) {
    var grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    if (!projects.length) {
      grid.innerHTML = '<div class="state-box">'
        + '<div class="state-icon">🔍</div>'
        + '<p style="color:rgba(255,255,255,0.5);">No projects match that filter.</p>'
        + '<button class="btn-outline-gold" data-reset style="font-size:0.85rem;padding:10px 20px;">Show All</button>'
        + '</div>';
      return;
    }

    grid.innerHTML = projects.map(function (p, i) { return buildCard(p, i); }).join('');

    requestAnimationFrame(function () {
      var cards = grid.querySelectorAll('.pf-card');
      cards.forEach(function (card, i) {
        setTimeout(function () { card.classList.add('visible'); }, i * 70);
      });
    });
  }

  // ─── Filtering ────────────────────────────────────────────────────────────

  function applyFilter(category) {
    activeFilter = category;

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    var filtered = category === 'all'
      ? catalog
      : catalog.filter(function (p) { return p.category === category; });

    var grid = document.getElementById('portfolio-grid');
    if (grid) {
      grid.querySelectorAll('.pf-card').forEach(function (c) {
        c.classList.remove('visible');
        c.style.transition = 'opacity 0.15s';
      });
    }

    setTimeout(function () { renderGrid(filtered); }, 180);
  }

  // ─── Modal ────────────────────────────────────────────────────────────────

  function buildModal() {
    if (document.getElementById('pf-modal')) return;

    var el = document.createElement('div');
    el.id = 'pf-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('aria-label', 'Project detail');
    el.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;'
      + 'background:rgba(6,14,30,0.87);backdrop-filter:blur(8px);'
      + 'overflow-y:auto;padding:32px 16px;';

    el.innerHTML = '<div style="max-width:560px;margin:0 auto;background:#111b30;'
      + 'border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:36px;position:relative;">'
      + '<button id="modal-close" aria-label="Close" style="position:absolute;top:16px;right:16px;'
      + 'background:rgba(255,255,255,0.07);border:none;border-radius:6px;width:32px;height:32px;'
      + 'color:rgba(255,255,255,0.6);font-size:1rem;cursor:pointer;'
      + 'display:flex;align-items:center;justify-content:center;">'
      + '<i class="fas fa-times"></i></button>'
      + '<div id="modal-body"></div>'
      + '</div>';

    document.body.appendChild(el);
  }

  function openModal(id) {
    var project = catalog.find(function (p) { return p.id === id; });
    if (!project) return;

    var modal = document.getElementById('pf-modal');
    var body  = document.getElementById('modal-body');
    if (!modal || !body) return;

    var metricsHtml = '';
    if (project.metrics && project.metrics.length) {
      var items = project.metrics.map(function (m) {
        return '<div style="text-align:center;flex:1;background:rgba(255,193,7,0.07);'
          + 'border:1px solid rgba(255,193,7,0.15);border-radius:8px;padding:14px 10px;">'
          + '<div style="font-size:1.5rem;font-weight:900;color:#ffc107;">' + m.val + '</div>'
          + '<div style="font-size:0.7rem;color:rgba(255,255,255,0.5);text-transform:uppercase;'
          + 'letter-spacing:0.08em;margin-top:4px;">' + m.lbl + '</div>'
          + '</div>';
      }).join('');
      metricsHtml = '<h4 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;'
        + 'color:rgba(255,255,255,0.35);margin-bottom:12px;">Results</h4>'
        + '<div style="display:flex;gap:16px;margin-bottom:24px;">' + items + '</div>';
    }

    var stackHtml = '';
    if (project.tech && project.tech.length) {
      var tags = project.tech.map(function (t) { return '<span class="tech-tag">' + t + '</span>'; }).join('');
      stackHtml = '<h4 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;'
        + 'color:rgba(255,255,255,0.35);margin-bottom:10px;">Stack</h4>'
        + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:24px;">' + tags + '</div>';
    }

    body.innerHTML = '<div style="font-size:2rem;margin-bottom:16px;">' + project.icon + '</div>'
      + '<h3 style="font-size:1.3rem;font-weight:800;color:#fff;margin-bottom:8px;">' + project.title + '</h3>'
      + '<p style="font-size:0.875rem;color:rgba(255,255,255,0.6);line-height:1.8;margin-bottom:20px;">'
      + (project.details || project.description) + '</p>'
      + metricsHtml
      + stackHtml
      + '<a href="contact.html?subject=' + encodeURIComponent("I'd like a project like " + project.title) + '"'
      + ' style="display:block;text-align:center;background:#ffc107;color:#0d1a35;'
      + 'font-weight:700;padding:13px;border-radius:8px;text-decoration:none;font-size:0.9rem;">'
      + 'Start a Similar Project <i class="fas fa-arrow-right" style="margin-left:6px;font-size:0.75rem;"></i>'
      + '</a>';

    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    var modal = document.getElementById('pf-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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

  // ─── Event delegation ─────────────────────────────────────────────────────

  function bindEvents() {
    document.addEventListener('click', function (e) {
      var filterBtn = e.target.closest('.filter-btn');
      if (filterBtn) { applyFilter(filterBtn.dataset.category); return; }

      if (e.target.closest('[data-reset]')) { applyFilter('all'); return; }

      var modalTrigger = e.target.closest('[data-modal]');
      if (modalTrigger) { openModal(modalTrigger.dataset.modal); return; }

      if (
        e.target.id === 'modal-close' ||
        e.target.closest('#modal-close') ||
        e.target.id === 'pf-modal'
      ) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    var toggle = document.getElementById('nav-toggle');
    var links  = document.getElementById('nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
      });
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  function init() {
    catalog = PROJECTS.slice();

    var grid = document.getElementById('portfolio-grid');
    if (grid) grid.innerHTML = skeletonCards(6);

    bindEvents();
    buildModal();
    initReveal();

    setTimeout(function () { renderGrid(catalog); }, 280);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

}());