// Home page Core Services dynamic renderer
(function() {
  'use strict';

  async function loadServices() {
    try {
      const res = await fetch('services.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load services');
      return await res.json();
    } catch (e) {
      console.error('Error loading services.json:', e);
      return [];
    }
  }

  function pickHomeServices(services, limit = 6) {
    const featured = services.filter(s => s.featured);
    const rest = services.filter(s => !s.featured);
    const ordered = [...featured, ...rest];
    return ordered.slice(0, limit);
  }

  function renderHomeServices(services) {
    const grid = document.getElementById('home-services-grid');
    if (!grid) return;

    if (!services || services.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <p>No services available at the moment.</p>
          <a class="btn btn-primary" href="services.html">Explore All Services</a>
        </div>`;
      return;
    }

    const card = (s) => `
      <div class="service-card ${s.featured ? 'featured' : ''}">
        <div class="service-icon" aria-hidden="true">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <div class="service-actions">
          <a class="btn btn-primary" href="services.html#${s.id}" aria-label="Learn more about ${s.title}">Learn More</a>
          <a class="btn btn-secondary" href="contact.html?subject=${encodeURIComponent("I'm interested in " + s.title)}">Get Quote</a>
        </div>
      </div>`;

    grid.innerHTML = services.map(card).join('');

    // Ensure visibility across platforms
    requestAnimationFrame(() => {
      grid.querySelectorAll('.service-card').forEach(el => el.classList.add('animate-in'));
    });
  }

  async function init() {
    const grid = document.getElementById('home-services-grid');
    if (!grid) return;

    grid.innerHTML = '<p>Loading services…</p>';
    const all = await loadServices();
    const subset = pickHomeServices(all, 6);
    renderHomeServices(subset);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
