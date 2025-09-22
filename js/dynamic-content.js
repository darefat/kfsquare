// Dynamic content loader for KFSQUARE website
class KFSquareAPI {
  constructor() {
    this.baseURL = window.location.origin;
    this.apiURL = `${this.baseURL}/api`;
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Generic API request with caching
  async request(endpoint, options = {}) {
    const url = `${this.apiURL}${endpoint}`;
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      if (options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Team API methods
  async getTeam(category = null) {
    const params = category ? `?category=${category}` : '';
    return await this.request(`/team${params}`);
  }

  async getTeamMember(id) {
    return await this.request(`/team/${id}`);
  }

  // Services API methods
  async getServices(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/services?${params}` : '/services';
    return await this.request(endpoint);
  }

  async getService(id) {
    return await this.request(`/services/${id}`);
  }

  async getServicesByCategory(category) {
    return await this.request(`/services/category/${category}`);
  }

  // Contact API methods
  async submitContact(contactData) {
    return await this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  }

  // Health check
  async healthCheck() {
    return await this.request('/health');
  }
}

// Dynamic content renderer
class DynamicContentRenderer {
  constructor() {
    this.api = new KFSquareAPI();
    this.loadingStates = new Set();
  }

  // Show loading state
  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container && !this.loadingStates.has(containerId)) {
      this.loadingStates.add(containerId);
      const originalContent = container.innerHTML;
      container.setAttribute('data-original-content', originalContent);
      container.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading content...</p>
        </div>
      `;
    }
  }

  // Hide loading state
  hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container && this.loadingStates.has(containerId)) {
      this.loadingStates.delete(containerId);
      const originalContent = container.getAttribute('data-original-content');
      if (originalContent) {
        container.innerHTML = originalContent;
        container.removeAttribute('data-original-content');
      }
    }
  }

  // Render team members dynamically
  async renderTeamMembers(containerId = 'team-grid') {
    try {
      this.showLoading(containerId);
      const response = await this.api.getTeam();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to load team data');
      }

      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
      }

      // Render team members by category
      let html = '';
      const { grouped } = response.data;

      // Leadership team
      if (grouped.leadership && grouped.leadership.length > 0) {
        html += '<div class="leadership-section">';
        html += '<h3 class="team-category-title">Leadership Team</h3>';
        html += '<div class="leadership-grid">';
        
        grouped.leadership.forEach(member => {
          html += this.renderTeamMemberCard(member, 'leadership');
        });
        
        html += '</div></div>';
      }

      // Core team
      if (grouped.core && grouped.core.length > 0) {
        html += '<div class="core-team-section">';
        html += '<h3 class="team-category-title">Core Team</h3>';
        html += '<div class="team-grid">';
        
        grouped.core.forEach(member => {
          html += this.renderTeamMemberCard(member, 'core');
        });
        
        html += '</div></div>';
      }

      container.innerHTML = html;
      this.hideLoading(containerId);

    } catch (error) {
      console.error('Error rendering team members:', error);
      this.handleRenderError(containerId, 'Failed to load team information');
    }
  }

  // Render individual team member card
  renderTeamMemberCard(member, category) {
    const isLeadership = category === 'leadership';
    const cardClass = isLeadership ? 'team-member leadership' : 'team-member';
    
    return `
      <div class="${cardClass}" data-member-id="${member._id}">
        <div class="member-photo">
          <div class="photo-placeholder">
            <div class="placeholder-content">
              <i class="member-icon">${isLeadership ? '👨‍💼' : '👨‍💻'}</i>
              <span class="member-initial">${member.initials || member.name.substring(0, 2).toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div class="member-info">
          <h3>${member.name}</h3>
          <div class="member-title">${member.title}</div>
          ${member.credentials ? `
            <div class="member-credentials">
              ${member.credentials.map(cred => `<span class="credential">${cred}</span>`).join('')}
            </div>
          ` : ''}
          <p class="member-bio">${member.bio}</p>
          ${member.specialties && member.specialties.length > 0 ? `
            <div class="member-specialties">
              ${member.specialties.map(spec => `<span class="specialty">${spec}</span>`).join('')}
            </div>
          ` : ''}
          ${member.email || member.phone ? `
            <div class="member-contact">
              ${member.email ? `<a href="mailto:${member.email}" class="contact-link">📧 ${member.email}</a>` : ''}
              ${member.phone ? `<a href="tel:${member.phone}" class="contact-link">📞 ${member.phone}</a>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Render services dynamically
  async renderServices(containerId = 'services-grid') {
    try {
      this.showLoading(containerId);
      
      // Load services from static JSON file
      const response = await fetch('./services.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load services: ${response.status}`);
      }

      const services = await response.json();
      
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
      }

      // Clear skeleton cards
      container.innerHTML = '';
      
      // Render service cards
      const html = services.map(service => this.renderServiceCard(service)).join('');
      container.innerHTML = html;
      
      // Setup interactivity
      this.setupServiceInteractivity();
      this.hideLoading(containerId);

      // Add staggered animation
      this.animateServicesGrid();

    } catch (error) {
      console.error('Error rendering services:', error);
      this.handleRenderError(containerId, 'Failed to load services information');
    }
  }

  // Render service category
  renderServiceCategory(category, services) {
    const categoryTitles = {
      foundation: 'Data Foundation',
      analytics: 'Analytics & Intelligence',
      ai: 'AI & Innovation',
      governance: 'Governance & Strategy'
    };

    const categoryTitle = categoryTitles[category] || category.charAt(0).toUpperCase() + category.slice(1);
    
    return `
      <div class="service-category" data-category="${category}">
        <h4>${categoryTitle}</h4>
        <div class="category-services">
          ${services.map(service => this.renderServiceCard(service)).join('')}
        </div>
      </div>
    `;
  }

  // Render individual service card
  renderServiceCard(service) {
    const availabilityClass = service.availability ? service.availability.replace('-', ' ') : 'available';
    const featuredClass = service.featured ? 'featured' : '';
    const categoryClass = this.getCategoryClass(service);
    
    return `
      <div class="service-card ${availabilityClass} ${featuredClass} ${categoryClass}" 
           data-service-id="${service.id}"
           data-category="${categoryClass}"
           data-featured="${service.featured || false}">
        
        <!-- Card Header -->
        <div class="service-card-header">
          <div class="service-icon-wrapper">
            <div class="service-icon">${service.icon}</div>
            ${service.featured ? '<div class="featured-badge"><i class="fas fa-star"></i></div>' : ''}
          </div>
          <div class="service-category-tag ${categoryClass}">${this.getCategoryName(categoryClass)}</div>
        </div>

        <!-- Card Content -->
        <div class="service-card-content">
          <h3 class="service-title">${service.title}</h3>
          <p class="service-description">${service.description}</p>
          
          <!-- Service Features -->
          ${service.features && service.features.length > 0 ? `
            <div class="service-features">
              <h4 class="features-title">Key Features:</h4>
              <ul class="features-list">
                ${service.features.map(feature => `
                  <li class="feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${feature}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Service Pricing -->
          <div class="service-pricing">
            <div class="price-tag">
              <span class="price">${service.price}</span>
              <span class="price-note">${service.priceNote || ''}</span>
            </div>
            <div class="pricing-note">
              <i class="fas fa-info-circle"></i>
              <span>Custom pricing available</span>
            </div>
          </div>
        </div>

        <!-- Card Actions -->
        <div class="service-card-actions">
          <button class="btn btn-primary service-details-btn" 
                  data-service-id="${service.id}">
            <i class="fas fa-eye"></i>
            <span>View Details</span>
          </button>
          <button class="btn btn-secondary service-contact-btn" 
                  data-service="${service.title}">
            <i class="fas fa-envelope"></i>
            <span>Get Quote</span>
          </button>
        </div>

        <!-- Hover Overlay -->
        <div class="service-overlay">
          <div class="overlay-content">
            <h4>${service.title}</h4>
            <p>Starting at ${service.price}</p>
            <div class="overlay-actions">
              <button class="overlay-btn primary">Learn More</button>
              <button class="overlay-btn secondary">Get Quote</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Get category class from service data
  getCategoryClass(service) {
    if (!service.id) return 'general';
    
    const categoryMap = {
      'data-analytics': 'analytics',
      'business-intelligence': 'analytics',
      'machine-learning': 'ai-ml',
      'ai-integration': 'ai-ml',
      'data-engineering': 'engineering',
      'consulting': 'consulting'
    };

    return categoryMap[service.id] || 'general';
  }

  // Get category display name
  getCategoryName(categoryClass) {
    const categoryNames = {
      'analytics': 'Analytics',
      'ai-ml': 'AI & ML',
      'engineering': 'Engineering',
      'consulting': 'Consulting',
      'general': 'General'
    };

    return categoryNames[categoryClass] || 'Service';
  }

  // Setup service interactivity
  setupServiceInteractivity() {
    // Setup category filters
    this.setupServiceFilters();
    
    // Add hover effects and click handlers
    const serviceCards = document.querySelectorAll('.service-card:not(.skeleton-card)');
    
    serviceCards.forEach(card => {
      // Enhanced hover effects
      card.addEventListener('mouseenter', () => {
        card.classList.add('hovered');
        this.animateServiceCard(card, 'enter');
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
        this.animateServiceCard(card, 'leave');
      });

      // Mobile touch effects
      card.addEventListener('touchstart', () => {
        card.classList.add('touch-active');
      }, { passive: true });

      card.addEventListener('touchend', () => {
        setTimeout(() => card.classList.remove('touch-active'), 150);
      }, { passive: true });

      // Service detail buttons
      const detailBtn = card.querySelector('.service-details-btn');
      if (detailBtn) {
        detailBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const serviceId = detailBtn.getAttribute('data-service-id');
          this.showServiceModal(serviceId);
        });
      }

      // Contact buttons
      const contactBtn = card.querySelector('.service-contact-btn');
      if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const serviceName = contactBtn.getAttribute('data-service');
          this.handleServiceContact(serviceName);
        });
      }
    });

    // Initialize statistics counter
    this.initializeStatsCounter();
  }

  // Setup service category filters
  setupServiceFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card:not(.skeleton-card)');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active filter
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter services
        const category = button.getAttribute('data-category');
        this.filterServices(category, serviceCards);
      });
    });
  }

  // Filter services by category
  filterServices(category, serviceCards) {
    serviceCards.forEach((card, index) => {
      const cardCategory = card.getAttribute('data-category');
      const shouldShow = category === 'all' || cardCategory === category;
      
      if (shouldShow) {
        card.style.display = 'block';
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('filter-animate-in');
        card.classList.remove('filter-animate-out');
      } else {
        card.classList.add('filter-animate-out');
        card.classList.remove('filter-animate-in');
        setTimeout(() => {
          if (card.classList.contains('filter-animate-out')) {
            card.style.display = 'none';
          }
        }, 300);
      }
    });
  }

  // Animate service cards
  animateServiceCard(card, action) {
    const overlay = card.querySelector('.service-overlay');
    const icon = card.querySelector('.service-icon');
    
    if (action === 'enter') {
      if (overlay) overlay.style.opacity = '1';
      if (icon) icon.style.transform = 'scale(1.1) rotate(5deg)';
    } else {
      if (overlay) overlay.style.opacity = '0';
      if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
    }
  }

  // Animate services grid with staggered effect
  animateServicesGrid() {
    const serviceCards = document.querySelectorAll('.service-card:not(.skeleton-card)');
    
    serviceCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }

  // Handle service contact
  handleServiceContact(serviceName) {
    // Redirect to contact page with service pre-filled
    const contactUrl = `contact.html?service=${encodeURIComponent(serviceName)}`;
    window.location.href = contactUrl;
  }

  // Initialize statistics counter animation
  initializeStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stat = entry.target;
          const target = parseInt(stat.getAttribute('data-target'));
          this.animateCounter(stat, target);
          statsObserver.unobserve(stat);
        }
      });
    }, observerOptions);

    stats.forEach(stat => statsObserver.observe(stat));
  }

  // Animate counter numbers
  animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000; // 2 seconds
    const stepTime = duration / 50;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, stepTime);
  }

  // Show service modal (if exists)
  async showServiceModal(serviceId) {
    try {
      const response = await this.api.getService(serviceId);
      if (response.success) {
        // Trigger chat or contact form with service context
        if (typeof openChat === 'function') {
          openChat(`I'm interested in your ${response.data.name} service`);
        }
      }
    } catch (error) {
      console.error('Error loading service details:', error);
    }
  }

  // Enhanced error handling for services
  handleRenderError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Unable to Load Services</h3>
          <p>${message}</p>
          <button class="btn btn-primary retry-btn" onclick="location.reload()">
            <i class="fas fa-redo"></i>
            <span>Try Again</span>
          </button>
        </div>
      `;
    }
    this.hideLoading(containerId);
  }

  // Initialize dynamic content based on current page
  async initializePage() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    try {
      switch (currentPage) {
        case 'team':
          await this.renderTeamMembers();
          break;
        case 'services':
          await this.renderServices();
          break;
        case 'index':
        default:
          // Load key content for home page
          if (document.getElementById('team-preview')) {
            const leadershipTeam = await this.api.getTeam('leadership');
            // Render leadership team preview
          }
          if (document.getElementById('services-preview')) {
            const featuredServices = await this.api.getServices({ featured: 'true' });
            // Render featured services
          }
          break;
      }
    } catch (error) {
      console.error('Error initializing page content:', error);
    }
  }
}

// Enhanced contact form submission
async function submitContactForm(formData) {
  const api = new KFSquareAPI();
  
  try {
    const response = await api.submitContact(formData);
    
    if (response.success) {
      // Show success message
      showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
      return true;
    } else {
      throw new Error(response.message || 'Failed to send message');
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    showNotification('Error sending message. Please try again.', 'error');
    return false;
  }
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const renderer = new DynamicContentRenderer();
  await renderer.initializePage();
  
  // Setup enhanced contact form if it exists
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const contactData = Object.fromEntries(formData.entries());
      
      const success = await submitContactForm(contactData);
      if (success) {
        contactForm.reset();
      }
    });
  }
});

// Export for global use
window.KFSquareAPI = KFSquareAPI;
window.DynamicContentRenderer = DynamicContentRenderer;
