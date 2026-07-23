/**
 * Shared browser behavior for KFSQUARE's static pages.
 *
 * Page-specific features belong in their own modules (for example,
 * js/contact.js). This file intentionally contains only behavior shared by
 * multiple pages so it remains safe to load everywhere.
 */
(function () {
  'use strict';

  /** Prefill the project message when a CTA links to ?subject=... . */
  function prefillContactSubject() {
    const message = document.getElementById('message');
    if (!message) return;

    const subject = new URLSearchParams(window.location.search).get('subject');
    if (!subject || message.value.trim()) return;

    message.value = `${subject}\n\n`;
    message.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Close Bootstrap's collapsed navigation after a link is selected.
   * Desktop navigation is unaffected because no collapse instance is open.
   */
  function initializeNavigation() {
    const navigation = document.getElementById('navbarNav');
    if (!navigation || !window.bootstrap) return;

    navigation.querySelectorAll('a.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        const collapse = window.bootstrap.Collapse.getInstance(navigation);
        if (collapse) collapse.hide();
      });
    });
  }

  /** Smooth-scroll only valid same-page fragment links. */
  function initializeAnchorLinks() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = document.querySelector(link.hash);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start'
        });
      });
    });
  }

  /**
   * Support optional portfolio/filter grids through data attributes.
   * Pages without these controls exit immediately.
   */
  function initializeFilters() {
    const buttons = document.querySelectorAll('[data-filter]');
    const items = document.querySelectorAll('[data-category]');
    if (!buttons.length || !items.length) return;

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        buttons.forEach((candidate) => {
          candidate.classList.toggle('active', candidate === button);
        });
        items.forEach((item) => {
          const categories = (item.dataset.category || '').split(/\s+/);
          item.hidden = filter !== 'all' && !categories.includes(filter);
        });
      });
    });
  }

  /** Close custom overlays with their close control, backdrop, or Escape. */
  function initializeCustomModals() {
    const modalSelector = '.service-modal, .project-modal, .schedule-modal';

    function closeModal(modal) {
      if (!modal) return;
      modal.hidden = true;
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', (event) => {
      const closeButton = event.target.closest('.modal-close');
      if (closeButton) {
        closeModal(closeButton.closest(modalSelector));
        return;
      }

      const modal = event.target.closest(modalSelector);
      if (modal && event.target === modal) closeModal(modal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const openModal = document.querySelector(`${modalSelector}:not([aria-hidden="true"])`);
      closeModal(openModal);
    });
  }

  // ─────────────────────────────────────────
  // Navbar: transparent → solid on scroll
  // ─────────────────────────────────────────
  (function initNav() {
      const nav = document.getElementById('siteNav');
      if (!nav) return;

      const onScroll = () => {
          if (window.scrollY > 48) {
              nav.classList.add('scrolled');
          } else {
              nav.classList.remove('scrolled');
          }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // run once on load in case page is refreshed mid-scroll
  })();


  // ─────────────────────────────────────────
  // Scroll reveal via Intersection Observer
  // ─────────────────────────────────────────
  (function initReveal() {
      const els = document.querySelectorAll('.reveal');
      if (!els.length) return;

      const observer = new IntersectionObserver(
          (entries) => {
              entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                      entry.target.classList.add('visible');
                      observer.unobserve(entry.target);
                  }
              });
          },
          { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      els.forEach((el) => observer.observe(el));
  })();


  // ─────────────────────────────────────────
  // Hero stat counter animation
  // ─────────────────────────────────────────
  (function initCounters() {
      const counters = [
          { el: document.querySelector('.hero-stat-num:nth-child(1)'), target: 500, suffix: '+' },
          { el: document.querySelector('.hero-stat-num:nth-child(3)'), target: 98, suffix: '%' },
      ];

      const animateCounter = (el, target, suffix) => {
          if (!el) return;
          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
              current = Math.min(current + step, target);
              el.innerHTML = current + '<span style="color:var(--gold);">' + suffix + '</span>';
              if (current >= target) clearInterval(timer);
          }, 30);
      };

      // Trigger when hero stats enter the viewport
      const statsBlock = document.querySelector('.hero-stats');
      if (!statsBlock) return;

      const observer = new IntersectionObserver(
          (entries) => {
              entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                      counters.forEach(({ el, target, suffix }) => animateCounter(el, target, suffix));
                      observer.disconnect();
                  }
              });
          },
          { threshold: 0.5 }
      );

      observer.observe(statsBlock);
  })();


  // ─────────────────────────────────────────
  // Smooth scroll for anchor links
  // ─────────────────────────────────────────
  (function initSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
          anchor.addEventListener('click', function (e) {
              const target = document.querySelector(this.getAttribute('href'));
              if (!target) return;
              e.preventDefault();
              const navHeight = document.getElementById('siteNav')?.offsetHeight ?? 72;
              const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
              window.scrollTo({ top, behavior: 'smooth' });
          });
      });
  })();


  // ─────────────────────────────────────────
  // Active nav link on scroll
  // ─────────────────────────────────────────
  (function initActiveNav() {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.site-nav .nav-link');
      if (!sections.length || !navLinks.length) return;

      const onScroll = () => {
          const scrollY = window.scrollY + 120;
          let current = '';

          sections.forEach((section) => {
              if (scrollY >= section.offsetTop) current = section.id;
          });

          navLinks.forEach((link) => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `${current}.html` ||
                  link.getAttribute('href') === `#${current}`) {
                  link.classList.add('active');
              }
          });
      };

      window.addEventListener('scroll', onScroll, { passive: true });
  })();


  // ─────────────────────────────────────────
  // Contact form — validation & submission
  // ─────────────────────────────────────────
  (function initContactForm() {
      const form = document.getElementById('contact-form');
      if (!form) return;

      const submitBtn = document.getElementById('submit-btn');
      const statusEl = document.getElementById('form-status');

      const setStatus = (message, type) => {
          const colors = {
              success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
              error:   { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
              loading: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' },
          };
          const c = colors[type] || colors.loading;
          statusEl.innerHTML = `
              <div style="padding:12px 16px;border-radius:7px;background:${c.bg};border:1px solid ${c.border};color:${c.color};font-weight:500;">
                  ${message}
              </div>`;
      };

      const clearStatus = () => { statusEl.innerHTML = ''; };

      const validateField = (field) => {
          const val = field.value.trim();
          if (field.required && !val) return false;
          if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
          return true;
      };

      const markField = (field, valid) => {
          field.style.borderColor = valid ? '#dde3ef' : '#e53e3e';
          field.style.boxShadow = valid ? '' : '0 0 0 3px rgba(229,62,62,0.1)';
      };

      // Live validation on blur
      form.querySelectorAll('input, select, textarea').forEach((field) => {
          field.addEventListener('blur', () => {
              if (field.required || (field.type === 'email' && field.value)) {
                  markField(field, validateField(field));
              }
          });
          field.addEventListener('input', () => {
              if (field.style.borderColor === 'rgb(229, 62, 62)') {
                  markField(field, validateField(field));
              }
          });
      });

      form.addEventListener('submit', async (e) => {
          e.preventDefault();
          clearStatus();

          // Validate all required fields
          let isValid = true;
          form.querySelectorAll('[required]').forEach((field) => {
              const valid = validateField(field);
              markField(field, valid);
              if (!valid) isValid = false;
          });

          if (!isValid) {
              setStatus('Please fill in all required fields before submitting.', 'error');
              form.querySelector('[required]:invalid, [style*="e53e3e"]')?.focus();
              return;
          }

          // Disable form during submission
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending…';
          setStatus('Sending your message…', 'loading');

          const payload = {
              firstName: form.firstName.value.trim(),
              lastName:  form.lastName.value.trim(),
              email:     form.email.value.trim(),
              phone:     form.phone?.value.trim() || '',
              company:   form.company.value.trim(),
              industry:  form.industry?.value || '',
              service:   form.service.value,
              budget:    form.budget?.value || '',
              message:   form.message.value.trim(),
              submittedAt: new Date().toISOString(),
          };

          try {
              // Use config endpoint if available, otherwise fall back to Formspree
              const endpoint =
                  (typeof CONFIG !== 'undefined' && CONFIG.CONTACT_ENDPOINT) ||
                  'https://formspree.io/f/YOUR_FORM_ID';

              const res = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                  body: JSON.stringify(payload),
              });

              if (res.ok) {
                  setStatus('✓ Message sent. We\'ll be in touch within one business day.', 'success');
                  form.reset();
                  form.querySelectorAll('input, select, textarea').forEach((f) => {
                      f.style.borderColor = '';
                      f.style.boxShadow = '';
                  });
              } else {
                  const data = await res.json().catch(() => ({}));
                  throw new Error(data?.error || `Server responded with ${res.status}`);
              }
          } catch (err) {
              console.error('[contact-form]', err);
              setStatus(
                  'Something went wrong on our end. Please email us directly at <a href="mailto:customersupport@kfsquare.com" style="color:inherit;font-weight:700;">customersupport@kfsquare.com</a>',
                  'error'
              );
          } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Send Message';
          }
      });
  })();

  function initialize() {
    prefillContactSubject();
    initializeNavigation();
    initializeAnchorLinks();
    initializeFilters();
    initializeCustomModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
}());
