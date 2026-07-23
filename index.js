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
