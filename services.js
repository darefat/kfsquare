// Enhanced Core Services Section with Mobile-First Design and Interactions
(function() {
  let allServices = [];
  let currentFilter = 'all';
  let isTouch = false;

  // Detect touch device
  window.addEventListener('touchstart', () => { isTouch = true; }, { once: true });

  // Service category mapping
  const categoryMap = {
    'data-analytics': 'analytics',
    'machine-learning': 'ai-ml',
    'business-intelligence': 'analytics',
    'data-engineering': 'engineering',
    'ai-integration': 'ai-ml',
    'consulting': 'consulting'
  };

  async function loadServices() {
    try {
      const res = await fetch('services.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load services');
      const services = await res.json();
      return services.map(service => ({
        ...service,
        category: categoryMap[service.id] || 'other'
      }));
    } catch (e) {
      console.error('Error loading services.json:', e);
      return [];
    }
  }

  function renderServices(services, animate = true) {
    const servicesGrid = document.getElementById('services-grid');
    if (!servicesGrid) return;
    
    if (!services || services.length === 0) {
      servicesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>No services match your current filter.</p>
          <button class="btn btn-primary" onclick="filterServices('all')">Show All Services</button>
        </div>`;
      return;
    }

    const serviceCard = (s, index) => `
      <div id="${s.id}" 
           class="service-card ${s.featured ? 'featured' : ''}" 
           data-category="${s.category}"
           style="animation-delay: ${animate ? index * 0.1 : 0}s">
        <div class="service-icon" role="img" aria-label="${s.title} service icon">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <ul class="service-features" role="list">
          ${s.features.map(f => `<li role="listitem">✓ ${f}</li>`).join('')}
        </ul>
        <div class="service-pricing">
          <span class="price" aria-label="Price: ${s.price}">${s.price}</span>
          <span class="price-note">${s.priceNote}</span>
        </div>
        <div class="service-actions">
          <button class="btn btn-primary service-btn" 
                  data-service="${s.id}" 
                  aria-label="Learn more about ${s.title}">
            Learn More
          </button>
          <a class="btn btn-secondary" 
             href="contact.html?subject=${encodeURIComponent("I'm interested in " + s.title)}"
             aria-label="Get quote for ${s.title}">
            Get Quote
          </a>
        </div>
      </div>`;
    
    servicesGrid.innerHTML = services.map(serviceCard).join('');
    
    // Add touch interaction for mobile
    if (isTouch) {
      addTouchInteractions();
    }
    
    // Trigger entrance animations by applying the visible class used in CSS
    if (animate) {
      setTimeout(() => {
        const cards = servicesGrid.querySelectorAll('.service-card');
        cards.forEach(card => card.classList.add('animate-in'));
      }, 100);
    } else {
      // Ensure visibility even if animations are disabled
      const cards = servicesGrid.querySelectorAll('.service-card');
      cards.forEach(card => card.classList.add('animate-in'));
    }
  }

  function addTouchInteractions() {
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
      let touchTimer;
      
      card.addEventListener('touchstart', (e) => {
        card.classList.add('mobile-touched');
        touchTimer = setTimeout(() => {
          card.classList.remove('mobile-touched');
        }, 150);
      }, { passive: true });
      
      card.addEventListener('touchend', () => {
        clearTimeout(touchTimer);
        setTimeout(() => {
          card.classList.remove('mobile-touched');
        }, 100);
      }, { passive: true });
    });
  }

  function filterServices(category) {
    currentFilter = category;
    const filteredServices = category === 'all' 
      ? allServices 
      : allServices.filter(s => s.category === category);
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
      if (isTouch && btn.dataset.category === category) {
        btn.classList.add('mobile-touched');
        setTimeout(() => btn.classList.remove('mobile-touched'), 200);
      }
    });
    
    // Animate out current cards
    const currentCards = document.querySelectorAll('.service-card');
    currentCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.95)';
      }, index * 50);
    });
    
    // Render new cards after animation
    setTimeout(() => {
      renderServices(filteredServices, true);
      updateServicesCount(filteredServices.length);
    }, currentCards.length * 50 + 300);
  }

  function updateServicesCount(count) {
    const existingCounter = document.querySelector('.services-count');
    if (existingCounter) {
      existingCounter.remove();
    }
    
    if (currentFilter !== 'all') {
      const counter = document.createElement('div');
      counter.className = 'services-count';
      counter.innerHTML = `
        <span class="count-badge">
          <i class="fas fa-filter"></i>
          ${count} service${count !== 1 ? 's' : ''} found
        </span>`;
      
      const filterContainer = document.querySelector('.service-categories-filter');
      if (filterContainer) {
        filterContainer.appendChild(counter);
      }
    }
  }

  function wireModal(services) {
    const modal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalContactBtn = document.getElementById('modal-contact-btn');

    function openModal(serviceId) {
      const s = services.find(x => x.id === serviceId);
      if (!s) return;
      
      modalTitle.textContent = s.title;
      modalBody.innerHTML = `
        <div class="modal-service-icon">${s.icon}</div>
        <p class="modal-description">${s.details}</p>
        <div class="modal-features">
          <h4>Key Features:</h4>
          <ul class="service-features">
            ${s.features.map(f => `<li>✓ ${f}</li>`).join('')}
          </ul>
        </div>
        <div class="modal-pricing">
          <span class="price">${s.price}</span>
          <span class="price-note">${s.priceNote}</span>
        </div>`;
      
      modalContactBtn.href = `contact.html?subject=${encodeURIComponent("I'd like to discuss " + s.title + " in detail")}`;
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus management
      const firstFocusable = modal.querySelector('.modal-close');
      if (firstFocusable) firstFocusable.focus();
    }

    function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      modal.setAttribute('aria-hidden', 'true');
    }

    // Event listeners
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.service-btn');
      if (btn && btn.dataset.service) {
        e.preventDefault();
        openModal(btn.dataset.service);
      }
      if (e.target.classList.contains('modal-close')) {
        e.preventDefault();
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function initializeFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = btn.dataset.category;
        filterServices(category);
      });
      
      // Touch feedback for filter buttons
      if (isTouch) {
        btn.addEventListener('touchstart', () => {
          btn.classList.add('mobile-touched');
        }, { passive: true });
        
        btn.addEventListener('touchend', () => {
          setTimeout(() => btn.classList.remove('mobile-touched'), 150);
        }, { passive: true });
      }
    });
  }

  function initializeStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const finalValue = parseInt(target.dataset.target);
          const unit = target.parentElement.querySelector('.stat-unit');
          
          animateCounter(target, 0, finalValue, 2000, unit?.textContent || '');
          observer.unobserve(target);
        }
      });
    }, observerOptions);

    statNumbers.forEach(stat => observer.observe(stat));
  }

  function animateCounter(element, start, end, duration, unit) {
    const startTime = performance.now();
    const updateCounter = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(start + (end - start) * easeOut);
      
      element.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    requestAnimationFrame(updateCounter);
  }

  // Performance optimizations
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize everything
  async function init() {
    // Show enhanced loading state
    const gridEl = document.getElementById('services-grid');
    if (gridEl) {
      gridEl.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading our amazing services...</p>
        </div>`;
    }

    try {
      allServices = await loadServices();
      renderServices(allServices, true);
      wireModal(allServices);
      initializeFilterButtons();
      initializeStatCounters();
      
      // Add loading complete class for animations
      setTimeout(() => {
        document.querySelector('.core-services-section')?.classList.add('loaded');
      }, 500);
      
    } catch (error) {
      console.error('Failed to initialize services:', error);
      if (gridEl) {
        gridEl.innerHTML = `
          <div class="error-state">
            <div class="error-icon">⚠️</div>
            <p>Sorry, we're having trouble loading our services.</p>
            <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
          </div>`;
      }
    }
  }

  // Expose global function for filter buttons
  window.filterServices = filterServices;
  
  // Start initialization
  init();
})();
