// Dynamic KFSQUARE Website Functionality
document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize all dynamic features
  initContactForm();
  initSmoothScrolling();
  initScrollAnimations();
  initCounterAnimations();
  initTypingEffect();
  initParticleBackground();
  initInteractiveElements();
  initMobileMenu();
  initScrollProgress();
  initHeaderEffects();
  
  // Contact Form Functionality
  function initContactForm() {
    const form = document.querySelector('#contact-form');
    
    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();

        if (!name || !email || !message) {
          showNotification('Please fill in all fields.', 'error');
          return;
        }

        const body = `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`;
        const mailtoLink = `mailto:customersupport@kfsquare.com?subject=Contact Form Submission&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;
        form.reset();
        showNotification('Thank you! Your message has been prepared.', 'success');
      });
    }
  }

  // Smooth Scrolling Navigation
  function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Add active state animation
          this.classList.add('clicked');
          setTimeout(() => this.classList.remove('clicked'), 300);
        }
      });
    });

    // Highlight active section in navigation
    window.addEventListener('scroll', updateActiveNavigation);
  }

  // Scroll-triggered Animations
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Stagger animations for grid items
          if (entry.target.classList.contains('service-card') || 
              entry.target.classList.contains('value-item') ||
              entry.target.classList.contains('highlight-card')) {
            const siblings = entry.target.parentElement.children;
            const index = Array.from(siblings).indexOf(entry.target);
            entry.target.style.animationDelay = `${index * 0.1}s`;
          }
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
      '.service-card, .portfolio-category, .value-item, .highlight-card, .about-content, .hero-content'
    );
    animateElements.forEach(el => observer.observe(el));
  }

  // Counter Animations for Stats
  function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  function animateCounter(element) {
    const target = element.textContent;
    const isPercentage = target.includes('%');
    const hasPlus = target.includes('+');
    const numericValue = parseInt(target.replace(/[^0-9]/g, ''));
    
    let current = 0;
    const increment = numericValue / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        current = numericValue;
        clearInterval(timer);
      }
      
      let displayValue = Math.floor(current);
      if (isPercentage) displayValue += '%';
      if (hasPlus) displayValue += '+';
      
      element.textContent = displayValue;
    }, stepTime);
  }

  // Typing Effect for Hero Text
  function initTypingEffect() {
    const tagline = document.querySelector('.tagline');
    if (!tagline) return;

    const originalText = tagline.textContent;
    tagline.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
      if (i < originalText.length) {
        tagline.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      } else {
        tagline.classList.add('typing-complete');
      }
    };

    // Start typing effect after a delay
    setTimeout(typeWriter, 1000);
  }

  // Interactive Particle Background
  function initParticleBackground() {
    const hero = document.querySelector('#home');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    hero.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
        ctx.fill();

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });

      animationId = requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });
  }

  // Interactive Elements
  function initInteractiveElements() {
    // Service card hover effects
    const serviceCards = document.querySelectorAll('.service-card, .portfolio-service-link');
    serviceCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.classList.add('hover-active');
      });
      
      card.addEventListener('mouseleave', function() {
        this.classList.remove('hover-active');
      });
    });

    // Button click effects
    const buttons = document.querySelectorAll('.primary-btn, .secondary-btn, .portfolio-btn');
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 1000);
      });
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    });
  }

  // Mobile Menu Toggle
  function initMobileMenu() {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    header.appendChild(menuToggle);

    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
      this.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!header.contains(e.target)) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }

  // Update Active Navigation
  function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  // Scroll Progress Indicator
  function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-indicator');
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / documentHeight) * 100;
      
      progressBar.style.width = progress + '%';
    });
  }

  // Header Effects
  function initHeaderEffects() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Notification System
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Loading Animation
  window.addEventListener('load', () => {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loadingScreen);
    
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }, 1500);
  });
});