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
      const response = await this.api.getServices();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to load services data');
      }

      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
      }

      const { grouped } = response.data;
      let html = '';

      // Render services by category
      Object.entries(grouped).forEach(([category, services]) => {
        html += this.renderServiceCategory(category, services);
      });

      container.innerHTML = html;
      this.setupServiceInteractivity();
      this.hideLoading(containerId);

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
    const availabilityClass = service.availability.replace('-', ' ');
    const featuredClass = service.isFeatured ? 'featured' : '';
    
    return `
      <div class="service-card ${availabilityClass} ${featuredClass}" 
           data-service-id="${service._id}"
           data-category="${service.category}"
           data-popularity="${service.popularity}">
        <div class="service-icon">${service.icon}</div>
        <div class="service-info">
          <h5>${service.name}</h5>
          <p>${service.shortDescription}</p>
          <div class="service-meta">
            <span class="availability ${service.availability}">${service.availability.replace('-', ' ')}</span>
            <span class="popularity">★ ${service.rating || 4.5}</span>
            ${service.isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
          </div>
          ${service.tags && service.tags.length > 0 ? `
            <div class="service-tags">
              ${service.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="service-tooltip">
          <h6>${service.name}</h6>
          <p>${service.fullDescription}</p>
          ${service.features && service.features.length > 0 ? `
            <ul class="feature-list">
              ${service.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Setup service interactivity
  setupServiceInteractivity() {
    // Add hover effects and click handlers
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
      // Show/hide tooltips on hover
      card.addEventListener('mouseenter', () => {
        const tooltip = card.querySelector('.service-tooltip');
        if (tooltip) {
          tooltip.style.display = 'block';
        }
      });

      card.addEventListener('mouseleave', () => {
        const tooltip = card.querySelector('.service-tooltip');
        if (tooltip) {
          tooltip.style.display = 'none';
        }
      });

      // Click handler for service details
      card.addEventListener('click', () => {
        const serviceId = card.getAttribute('data-service-id');
        this.showServiceModal(serviceId);
      });
    });
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

  // Handle render errors gracefully
  handleRenderError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <div class="error-icon">⚠️</div>
          <p>${message}</p>
          <button onclick="location.reload()" class="retry-btn">Retry</button>
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
