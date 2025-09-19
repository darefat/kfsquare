// Platform Agnostic KFSQUARE Website Functionality
(function() {
  'use strict';

  // Feature detection utilities
  var features = {
    intersectionObserver: 'IntersectionObserver' in window,
    requestAnimationFrame: 'requestAnimationFrame' in window,
    classList: 'classList' in document.createElement('div'),
    addEventListener: 'addEventListener' in window,
    localStorage: (function() {
      try {
        return 'localStorage' in window && window.localStorage !== null;
      } catch (e) {
        return false;
      }
    })(),
    touchEvents: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    reducedMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // Polyfills and fallbacks
  function initPolyfills() {
    // RequestAnimationFrame polyfill
    if (!features.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 16);
      };
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  }

  // Universal event handling
  function addEvent(element, event, handler) {
    if (features.addEventListener) {
      element.addEventListener(event, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event, handler);
    } else {
      element['on' + event] = handler;
    }
  }

  // Universal class manipulation
  function addClass(element, className) {
    if (features.classList) {
      element.classList.add(className);
    } else {
      if (element.className.indexOf(className) === -1) {
        element.className += (element.className ? ' ' : '') + className;
      }
    }
  }

  function removeClass(element, className) {
    if (features.classList) {
      element.classList.remove(className);
    } else {
      element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(\\s|$)', 'g'), ' ').replace(/^\s+|\s+$/g, '');
    }
  }

  function hasClass(element, className) {
    if (features.classList) {
      return element.classList.contains(className);
    } else {
      return new RegExp('(^|\\s)' + className + '(\\s|$)').test(element.className);
    }
  }

  function toggleClass(element, className) {
    if (features.classList) {
      element.classList.toggle(className);
    } else {
      if (hasClass(element, className)) {
        removeClass(element, className);
      } else {
        addClass(element, className);
      }
    }
  }

  // Cross-platform trim function
  function trim(str) {
    if (str.trim) {
      return str.trim();
    } else {
      return str.replace(/^\s+|\s+$/g, '');
    }
  }

  // Initialize all features when DOM is ready
  function init() {
    try {
      initPolyfills();
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
      initDynamicPortfolio();
      initAnalyticsEnhancements();
      initGovernanceEnhancements();
      initValuesPortfolio();
      initChatAssistant();
    } catch (error) {
      if (window.console && console.error) {
        console.error('Error initializing features:', error);
      }
    }
  }

  // Contact Form Functionality
  function initContactForm() {
    var form = document.querySelector('#contact-form');
    
    if (form) {
      addEvent(form, 'submit', function(event) {
        if (event.preventDefault) {
          event.preventDefault();
        } else {
          event.returnValue = false;
        }

        try {
          var name = trim(form.name.value);
          var email = trim(form.email.value);
          var message = trim(form.message.value);

          if (!name || !email || !message) {
            showNotification('Please fill in all fields.', 'error');
            return;
          }

          // Basic email validation that works across all platforms
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
          }

          var body = 'Name: ' + name + '\nEmail: ' + email + '\nMessage:\n' + message;
          var subject = 'Contact Form Submission';
          
          // Universal mailto approach
          var mailtoLink = 'mailto:customersupport@kfsquare.com?subject=' + 
                           encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

          if (typeof window !== 'undefined' && window.location) {
            window.location.href = mailtoLink;
          }

          form.reset();
          showNotification('Thank you! Your message has been prepared.', 'success');
        } catch (error) {
          if (window.console && console.error) {
            console.error('Form submission error:', error);
          }
          showNotification('There was an error. Please try again.', 'error');
        }
      });
    }
  }

  // Cross-platform smooth scrolling
  function initSmoothScrolling() {
    var navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    for (var i = 0; i < navLinks.length; i++) {
      addEvent(navLinks[i], 'click', function(e) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        
        var targetId = this.getAttribute('href').substring(1);
        var targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Use native smooth scrolling if available, fallback to animated scroll
          if ('scrollBehavior' in document.documentElement.style) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          } else {
            // Fallback animated scroll for older browsers
            animateScrollTo(targetElement.offsetTop, 800);
          }
          
          // Add visual feedback
          addClass(this, 'clicked');
          var self = this;
          setTimeout(function() {
            removeClass(self, 'clicked');
          }, 300);
        }
      });
    }

    // Highlight active section
    addEvent(window, 'scroll', updateActiveNavigation);
  }

  // Animated scroll fallback
  function animateScrollTo(to, duration) {
    var start = window.pageYOffset || document.documentElement.scrollTop;
    var change = to - start;
    var startTime = Date.now();

    function animateScroll() {
      var now = Date.now();
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      var easeInOutQuad = function(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };
      
      var position = start + change * easeInOutQuad(progress);
      window.scrollTo(0, position);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }
    
    animateScroll();
  }

  // Platform-agnostic scroll animations
  function initScrollAnimations() {
    if (features.reducedMotion) {
      // Skip animations if user prefers reduced motion
      var elements = document.querySelectorAll(
        '.service-card, .portfolio-category, .value-item, .highlight-card, .about-content, .hero-content'
      );
      for (var i = 0; i < elements.length; i++) {
        addClass(elements[i], 'animate-in');
      }
      return;
    }

    if (features.intersectionObserver) {
      // Use Intersection Observer if available
      var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      var observer = new IntersectionObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            addClass(entry.target, 'animate-in');
            
            // Stagger animations
            var parent = entry.target.parentElement;
            if (parent) {
              var siblings = parent.children;
              var index = 0;
              for (var j = 0; j < siblings.length; j++) {
                if (siblings[j] === entry.target) {
                  index = j;
                  break;
                }
              }
              entry.target.style.animationDelay = (index * 0.1) + 's';
            }
            observer.unobserve(entry.target);
          }
        }
      }, observerOptions);

      var animateElements = document.querySelectorAll(
        '.service-card, .portfolio-category, .value-item, .highlight-card, .about-content, .hero-content'
      );
      for (var i = 0; i < animateElements.length; i++) {
        observer.observe(animateElements[i]);
      }
    } else {
      // Fallback for browsers without Intersection Observer
      addEvent(window, 'scroll', function() {
        var elements = document.querySelectorAll(
          '.service-card, .portfolio-category, .value-item, .highlight-card, .about-content, .hero-content'
        );
        
        for (var i = 0; i < elements.length; i++) {
          if (!hasClass(elements[i], 'animate-in')) {
            var rect = elements[i].getBoundingClientRect();
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            if (rect.top < windowHeight - 50) {
              addClass(elements[i], 'animate-in');
            }
          }
        }
      });
    }
  }

  // Cross-platform counter animations
  function initCounterAnimations() {
    var counters = document.querySelectorAll('.stat-number');
    
    function animateCounter(element) {
      var target = element.textContent || element.innerText;
      var isPercentage = target.indexOf('%') !== -1;
      var hasPlus = target.indexOf('+') !== -1;
      
      // Extract numeric value universally
      var numericValue = parseInt(target.replace(/[^0-9]/g, ''), 10) || 0;
      
      var current = 0;
      var increment = numericValue / 50;
      var duration = 2000;
      var stepTime = duration / 50;

      var timer = setInterval(function() {
        current += increment;
        if (current >= numericValue) {
          current = numericValue;
          clearInterval(timer);
        }
        
        var displayValue = Math.floor(current).toString();
        if (isPercentage) displayValue += '%';
        if (hasPlus) displayValue += '+';
        
        if (element.textContent !== undefined) {
          element.textContent = displayValue;
        } else {
          element.innerText = displayValue;
        }
      }, stepTime);
    }

    if (features.intersectionObserver) {
      var counterObserver = new IntersectionObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        }
      });

      for (var i = 0; i < counters.length; i++) {
        counterObserver.observe(counters[i]);
      }
    } else {
      // Fallback: animate when counters come into view
      addEvent(window, 'scroll', function() {
        for (var i = 0; i < counters.length; i++) {
          if (!hasClass(counters[i], 'animated')) {
            var rect = counters[i].getBoundingClientRect();
            var windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            if (rect.top < windowHeight - 50) {
              addClass(counters[i], 'animated');
              animateCounter(counters[i]);
            }
          }
        }
      });
    }
  }

  // Universal typing effect
  function initTypingEffect() {
    var tagline = document.querySelector('.tagline');
    if (!tagline || features.reducedMotion) return;

    var originalText = tagline.textContent || tagline.innerText || '';
    tagline.innerHTML = '';
    
    var i = 0;
    var typeWriter = function() {
      if (i < originalText.length) {
        var currentText = tagline.innerHTML + originalText.charAt(i);
        tagline.innerHTML = currentText;
        i++;
        setTimeout(typeWriter, 100);
      } else {
        addClass(tagline, 'typing-complete');
      }
    };

    setTimeout(typeWriter, 1000);
  }

  // Cross-platform particle background
  function initParticleBackground() {
    if (features.reducedMotion || features.touchEvents) return;

    var hero = document.querySelector('#home');
    if (!hero) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    hero.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var particles = [];
    var animationId;

    function resizeCanvas() {
      canvas.width = hero.offsetWidth || hero.clientWidth;
      canvas.height = hero.offsetHeight || hero.clientHeight;
    }

    function createParticles() {
      particles = [];
      var particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, ' + particle.opacity + ')';
        ctx.fill();

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      }

      animationId = requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    addEvent(window, 'resize', function() {
      resizeCanvas();
      createParticles();
    });
  }

  // Universal interactive elements
  function initInteractiveElements() {
    // Service card hover effects
    var serviceCards = document.querySelectorAll('.service-card, .portfolio-service-link');
    for (var i = 0; i < serviceCards.length; i++) {
      addEvent(serviceCards[i], 'mouseenter', function() {
        addClass(this, 'hover-active');
      });
      
      addEvent(serviceCards[i], 'mouseleave', function() {
        removeClass(this, 'hover-active');
      });

      // Touch support
      if (features.touchEvents) {
        addEvent(serviceCards[i], 'touchstart', function() {
          addClass(this, 'hover-active');
        });
        
        addEvent(serviceCards[i], 'touchend', function() {
          removeClass(this, 'hover-active');
        });
      }
    }

    // Button effects
    var buttons = document.querySelectorAll('.primary-btn, .secondary-btn, .portfolio-btn');
    for (var i = 0; i < buttons.length; i++) {
      addEvent(buttons[i], 'click', function(e) {
        if (features.reducedMotion) return;

        var ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        var rect = this.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        
        var clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
        var clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
        
        ripple.style.left = (clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (clientY - rect.top - size / 2) + 'px';
        
        this.appendChild(ripple);
        
        var self = this;
        setTimeout(function() {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 1000);
      });
    }

    // Parallax effect (only on desktop)
    if (!features.touchEvents && !features.reducedMotion) {
      addEvent(window, 'scroll', function() {
        var scrolled = window.pageYOffset || document.documentElement.scrollTop;
        var heroContent = document.querySelector('.hero-content');
        if (heroContent) {
          heroContent.style.transform = 'translateY(' + (scrolled * 0.2) + 'px)';
        }
      });
    }
  }

  // Universal mobile menu
  function initMobileMenu() {
    var header = document.querySelector('header');
    var nav = document.querySelector('nav');
    
    if (!header || !nav) return;

    var menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    header.appendChild(menuToggle);

    addEvent(menuToggle, 'click', function() {
      toggleClass(nav, 'active');
      toggleClass(this, 'active');
    });

    // Close menu when clicking outside
    addEvent(document, 'click', function(e) {
      var target = e.target || e.srcElement;
      var clickedInsideHeader = false;
      var current = target;
      
      // Check if click is inside header
      while (current && current !== document) {
        if (current === header) {
          clickedInsideHeader = true;
          break;
        }
        current = current.parentNode;
      }
      
      if (!clickedInsideHeader) {
        removeClass(nav, 'active');
        removeClass(menuToggle, 'active');
      }
    });
  }

  // Universal scroll progress
  function initScrollProgress() {
    var progressBar = document.querySelector('.scroll-indicator');
    if (!progressBar) return;
    
    addEvent(window, 'scroll', function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      var windowHeight = window.innerHeight || document.documentElement.clientHeight;
      var progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      
      progressBar.style.width = Math.min(progress, 100) + '%';
    });
  }

  // Universal header effects
  function initHeaderEffects() {
    var header = document.querySelector('header');
    if (!header) return;
    
    addEvent(window, 'scroll', function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 100) {
        addClass(header, 'scrolled');
      } else {
        removeClass(header, 'scrolled');
      }
    });
  }

  // Update active navigation
  function updateActiveNavigation() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    var current = '';
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      var sectionTop = section.offsetTop - 100;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop >= sectionTop) {
        current = section.getAttribute('id');
      }
    }

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      removeClass(link, 'active');
      if (link.getAttribute('href') === '#' + current) {
        addClass(link, 'active');
      }
    }
  }

  // Universal notification system
  function showNotification(message, type) {
    type = type || 'info';
    
    var notification = document.createElement('div');
    notification.className = 'notification ' + type;
    
    if (notification.textContent !== undefined) {
      notification.textContent = message;
    } else {
      notification.innerText = message;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
      addClass(notification, 'show');
    }, 100);
    
    setTimeout(function() {
      removeClass(notification, 'show');
      setTimeout(function() {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Cross-platform DOM ready
  function domReady(callback) {
    if (document.readyState === 'complete' || 
        (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
      callback();
    } else {
      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', callback);
      } else {
        document.attachEvent('onreadystatechange', function() {
          if (document.readyState === 'complete') {
            callback();
          }
        });
      }
    }
  }

  // Loading screen
  addEvent(window, 'load', function() {
    if (features.reducedMotion) return;

    var loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loadingScreen);
    
    setTimeout(function() {
      addClass(loadingScreen, 'fade-out');
      setTimeout(function() {
        if (loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, 500);
    }, 1500);
  });

  // Dynamic Portfolio Functionality
  function initDynamicPortfolio() {
    var portfolioGrid = document.getElementById('portfolio-grid');
    var searchInput = document.getElementById('portfolio-search');
    var filterBtns = document.querySelectorAll('.filter-btn');
    var sortSelect = document.getElementById('portfolio-sort');
    var serviceModal = document.getElementById('service-modal');
    var portfolioServices = [];
    var currentFilter = 'all';
    var currentSort = 'default';

    if (!portfolioGrid) return;

    // Service data for modal display
    var serviceData = {
      'datasets': {
        title: 'Dataset Acquisition',
        icon: '📊',
        description: 'Professional data sourcing and acquisition services including market research data, industry benchmarks, and custom dataset creation tailored to your specific business requirements.',
        features: ['Market Research Datasets', 'Industry-Specific Data', 'Custom Data Collection', 'Data Quality Assurance', 'Compliance Verification', 'Real-time Data Feeds'],
        pricing: ['Starter: $2,500 - $5,000', 'Professional: $5,000 - $15,000', 'Enterprise: $15,000+'],
        timeline: '2-6 weeks depending on data complexity and sources'
      },
      'pipelines': {
        title: 'Pipeline Architecture',
        icon: '🔗',
        description: 'End-to-end data pipeline design and implementation for scalable data processing, automation, and integration across your technology stack.',
        features: ['ETL/ELT Pipeline Design', 'Real-time Data Processing', 'Cloud-native Architectures', 'Performance Optimization', 'Monitoring & Alerting', 'Auto-scaling Solutions'],
        pricing: ['Basic: $5,000 - $10,000', 'Advanced: $10,000 - $25,000', 'Enterprise: $25,000+'],
        timeline: '4-8 weeks for implementation and testing'
      },
      'validation': {
        title: 'Data Validation',
        icon: '✅',
        description: 'Comprehensive data quality assurance and validation frameworks to ensure data integrity, accuracy, and reliability throughout your data lifecycle.',
        features: ['Automated Quality Checks', 'Custom Validation Rules', 'Data Lineage Tracking', 'Quality Reporting Dashboards', 'Anomaly Detection', 'Compliance Monitoring'],
        pricing: ['Coming Soon - Contact for Details'],
        timeline: 'Available Q2 2026'
      },
      'algorithms': {
        title: 'Algorithm Development',
        icon: '🧮',
        description: 'Custom algorithm design and implementation for complex data processing, machine learning, and business intelligence applications.',
        features: ['Machine Learning Algorithms', 'Statistical Modeling', 'Optimization Algorithms', 'Performance Tuning', 'A/B Testing Frameworks', 'Model Deployment'],
        pricing: ['Basic: $7,500 - $15,000', 'Advanced: $15,000 - $40,000', 'Custom: $40,000+'],
        timeline: '6-12 weeks including testing and optimization'
      },
      'predictive': {
        title: 'Predictive Analytics',
        icon: '📈',
        description: 'Advanced predictive modeling solutions to forecast trends, identify opportunities, and support strategic decision-making with confidence.',
        features: ['Time Series Forecasting', 'Risk Assessment Models', 'Customer Behavior Prediction', 'Market Trend Analysis', 'Scenario Planning', 'ROI Optimization'],
        pricing: ['Standard: $10,000 - $20,000', 'Premium: $20,000 - $50,000', 'Enterprise: $50,000+'],
        timeline: '8-16 weeks including model validation'
      },
      'business-intelligence': {
        title: 'Business Intelligence',
        icon: '📋',
        description: 'Comprehensive BI solutions including reporting, analytics, and performance monitoring systems to drive data-driven decision making.',
        features: ['Executive Dashboards', 'KPI Tracking Systems', 'Automated Reporting', 'Performance Analytics', 'Data Warehousing', 'Mobile BI Solutions'],
        pricing: ['Essential: $8,000 - $15,000', 'Professional: $15,000 - $35,000', 'Enterprise: $35,000+'],
        timeline: '6-10 weeks including user training'
      },
      'visualization': {
        title: 'Data Visualization',
        icon: '📊',
        description: 'Interactive data visualization and dashboard creation to make complex data accessible, understandable, and actionable for all stakeholders.',
        features: ['Interactive Dashboards', 'Custom Visualizations', 'Real-time Monitoring', 'Mobile-responsive Design', 'Embedded Analytics', 'Self-service BI'],
        pricing: ['Basic: $5,000 - $12,000', 'Advanced: $12,000 - $25,000', 'Custom: $25,000+'],
        timeline: '4-8 weeks including design iterations'
      },
      'llm': {
        title: 'LLM Integration',
        icon: '🤖',
        description: 'Large Language Model integration, fine-tuning, and deployment for enterprise applications including chatbots, content generation, and intelligent automation.',
        features: ['Model Fine-tuning', 'API Integration', 'Performance Optimization', 'Scalable Deployment', 'Custom Training', 'Multi-modal Solutions'],
        pricing: ['Starter: $15,000 - $30,000', 'Professional: $30,000 - $75,000', 'Enterprise: $75,000+'],
        timeline: '8-16 weeks including model training'
      },
      'ai-consulting': {
        title: 'AI Consulting',
        icon: '💡',
        description: 'Strategic AI consulting to help organizations identify and implement AI solutions for competitive advantage and operational excellence.',
        features: ['AI Strategy Development', 'Technology Assessment', 'Implementation Planning', 'Change Management', 'ROI Analysis', 'Vendor Selection'],
        pricing: ['Assessment: $5,000 - $15,000', 'Strategy: $15,000 - $35,000', 'Full Program: $35,000+'],
        timeline: '4-12 weeks depending on scope'
      },
      'governance': {
        title: 'Data Governance',
        icon: '🔒',
        description: 'Comprehensive data governance frameworks to ensure compliance, security, and quality across your organization while enabling innovation.',
        features: ['Compliance Frameworks', 'Data Security Policies', 'Access Control Systems', 'Audit and Monitoring', 'Privacy Protection', 'Risk Management'],
        pricing: ['Foundation: $10,000 - $25,000', 'Comprehensive: $25,000 - $60,000', 'Enterprise: $60,000+'],
        timeline: '8-16 weeks including policy development'
      },
      'collaboration': {
        title: 'Strategic Collaboration',
        icon: '🤝',
        description: 'Executive-level strategic collaboration to align data initiatives with business objectives and drive organizational transformation.',
        features: ['Executive Workshops', 'Strategic Planning', 'Stakeholder Alignment', 'ROI Optimization', 'Change Leadership', 'Success Metrics'],
        pricing: ['Coming Soon - Contact for Details'],
        timeline: 'Available Q3 2026'
      }
    };

    // Initialize portfolio services array
    function collectPortfolioServices() {
      portfolioServices = [];
      var serviceElements = document.querySelectorAll('.portfolio-service-link');
      
      for (var i = 0; i < serviceElements.length; i++) {
        var element = serviceElements[i];
        var category = element.closest('.portfolio-category').getAttribute('data-category');
        var serviceId = element.getAttribute('data-service');
        var popularity = parseInt(element.getAttribute('data-popularity')) || 0;
        var availability = element.getAttribute('data-availability');
        
        portfolioServices.push({
          element: element,
          category: category,
          serviceId: serviceId,
          popularity: popularity,
          availability: availability,
          title: element.querySelector('strong').textContent,
          description: element.querySelector('p').textContent
        });
      }
    }

    // Search functionality
    function handleSearch() {
      if (!searchInput) return;
      
      var searchTerm = searchInput.value.toLowerCase();
      var visibleCount = 0;
      
      for (var i = 0; i < portfolioServices.length; i++) {
        var service = portfolioServices[i];
        var isVisible = (
          service.title.toLowerCase().indexOf(searchTerm) !== -1 ||
          service.description.toLowerCase().indexOf(searchTerm) !== -1 ||
          service.category.toLowerCase().indexOf(searchTerm) !== -1
        );
        
        if (isVisible && (currentFilter === 'all' || service.category === currentFilter)) {
          removeClass(service.element, 'filtered-out');
          addClass(service.element, 'filtered-in');
          visibleCount++;
        } else {
          removeClass(service.element, 'filtered-in');
          addClass(service.element, 'filtered-out');
        }
      }
      
      updateFilteredCount(visibleCount);
      checkCategoryVisibility();
    }

    // Filter functionality
    function handleFilter(filterValue) {
      currentFilter = filterValue;
      var visibleCount = 0;
      
      // Update filter buttons
      for (var i = 0; i < filterBtns.length; i++) {
        removeClass(filterBtns[i], 'active');
      }
      
      var activeBtn = document.querySelector('.filter-btn[data-filter="' + filterValue + '"]');
      if (activeBtn) {
        addClass(activeBtn, 'active');
      }
      
      // Show/hide services
      for (var i = 0; i < portfolioServices.length; i++) {
        var service = portfolioServices[i];
        var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        var matchesSearch = !searchTerm || (
          service.title.toLowerCase().indexOf(searchTerm) !== -1 ||
          service.description.toLowerCase().indexOf(searchTerm) !== -1 ||
          service.category.toLowerCase().indexOf(searchTerm) !== -1
        );
        
        if ((filterValue === 'all' || service.category === filterValue) && matchesSearch) {
          removeClass(service.element, 'filtered-out');
          addClass(service.element, 'filtered-in');
          visibleCount++;
        } else {
          removeClass(service.element, 'filtered-in');
          addClass(service.element, 'filtered-out');
        }
      }
      
      updateFilteredCount(visibleCount);
      checkCategoryVisibility();
    }

    // Sort functionality
    function handleSort(sortValue) {
      currentSort = sortValue;
      var sortedServices = portfolioServices.slice();
      
      if (sortValue === 'popularity') {
        sortedServices.sort(function(a, b) { return b.popularity - a.popularity; });
      } else if (sortValue === 'availability') {
        sortedServices.sort(function(a, b) {
          if (a.availability === 'available' && b.availability !== 'available') return -1;
          if (a.availability !== 'available' && b.availability === 'available') return 1;
          return b.popularity - a.popularity;
        });
      } else if (sortValue === 'alphabetical') {
        sortedServices.sort(function(a, b) { 
          return a.title.localeCompare(b.title); 
        });
      }
      
      // Reorder elements
      for (var i = 0; i < sortedServices.length; i++) {
        var service = sortedServices[i];
        var categoryServices = service.element.parentNode;
        categoryServices.appendChild(service.element);
      }
    }

    // Check category visibility
    function checkCategoryVisibility() {
      var categories = document.querySelectorAll('.portfolio-category');
      
      for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        var visibleServices = category.querySelectorAll('.portfolio-service-link.filtered-in');
        
        if (visibleServices.length > 0) {
          removeClass(category, 'filtered-out');
          addClass(category, 'filtered-in');
        } else {
          removeClass(category, 'filtered-in');
          addClass(category, 'filtered-out');
        }
      }
    }

    // Update statistics
    function updateFilteredCount(count) {
      var filteredCountEl = document.getElementById('filtered-count');
      if (filteredCountEl) {
        filteredCountEl.textContent = count;
      }
    }

    // Show service modal
    function showServiceModal(serviceId) {
      var data = serviceData[serviceId];
      if (!data || !serviceModal) return;
      
      // Populate modal content
      var modalTitle = document.getElementById('modal-title');
      var modalIcon = document.getElementById('modal-icon');
      var modalDescription = document.getElementById('modal-description');
      var modalFeatures = document.getElementById('modal-features');
      var modalPricing = document.getElementById('modal-pricing');
      var modalTimeline = document.getElementById('modal-timeline');
      
      if (modalTitle) modalTitle.textContent = data.title;
      if (modalIcon) modalIcon.textContent = data.icon;
      if (modalDescription) modalDescription.textContent = data.description;
      
      if (modalFeatures) {
        modalFeatures.innerHTML = '<ul>' + data.features.map(function(feature) {
          return '<li>' + feature + '</li>';
        }).join('') + '</ul>';
      }
      
      if (modalPricing) {
        modalPricing.innerHTML = data.pricing.map(function(price) {
          return '<div class="pricing-tier">' + price + '</div>';
        }).join('');
      }
      
      if (modalTimeline) {
        modalTimeline.innerHTML = '<div class="timeline-item">' + data.timeline + '</div>';
      }
      
      // Show modal
      addClass(serviceModal, 'active');
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    // Hide service modal
    function hideServiceModal() {
      if (!serviceModal) return;
      
      removeClass(serviceModal, 'active');
      document.body.style.overflow = '';
    }

    // Event listeners
    if (searchInput) {
      addEvent(searchInput, 'input', function() {
        setTimeout(handleSearch, 100);
      });
    }
    
    for (var i = 0; i < filterBtns.length; i++) {
      addEvent(filterBtns[i], 'click', function() {
        var filterValue = this.getAttribute('data-filter');
        handleFilter(filterValue);
      });
    }
    
    if (sortSelect) {
      addEvent(sortSelect, 'change', function() {
        handleSort(this.value);
      });
    }
    
    // Service click handlers
    var serviceLinks = document.querySelectorAll('.portfolio-service-link');
    for (var i = 0; i < serviceLinks.length; i++) {
      addEvent(serviceLinks[i], 'click', function(e) {
        e.preventDefault();
        var serviceId = this.getAttribute('data-service');
        if (serviceId) {
          showServiceModal(serviceId);
        }
      });
    }
    
    // Modal close handlers
    var closeButtons = document.querySelectorAll('.modal-close');
    for (var i = 0; i < closeButtons.length; i++) {
      addEvent(closeButtons[i], 'click', hideServiceModal);
    }
    
    // Close modal on backdrop click
    if (serviceModal) {
      addEvent(serviceModal, 'click', function(e) {
        if (e.target === this) {
          hideServiceModal();
        }
      });
    }
    
    // Close modal on escape key
    addEvent(document, 'keydown', function(e) {
      if (e.keyCode === 27) { // Escape key
        hideServiceModal();
      }
    });

    // Initialize
    collectPortfolioServices();
    
    // Update initial statistics
    var totalServices = portfolioServices.length;
    var activeServices = 0;
    
    for (var i = 0; i < portfolioServices.length; i++) {
      if (portfolioServices[i].availability === 'available') {
        activeServices++;
      }
    }
    
    var totalServicesEl = document.getElementById('total-services');
    var activeServicesEl = document.getElementById('active-services');
    
    if (totalServicesEl) totalServicesEl.textContent = totalServices;
    if (activeServicesEl) activeServicesEl.textContent = activeServices;
    
    updateFilteredCount(totalServices);
  }

  // Enhanced Analytics & Intelligence Section
  function initAnalyticsEnhancements() {
    var analyticsCategory = document.querySelector('[data-category="analytics"]');
    if (!analyticsCategory) return;

    // Animate category metrics on scroll
    function animateMetrics() {
      var metricValues = analyticsCategory.querySelectorAll('.metric-value');
      var isVisible = isElementInViewport(analyticsCategory);
      
      if (isVisible && !analyticsCategory.hasAttribute('data-animated')) {
        for (var i = 0; i < metricValues.length; i++) {
          animateMetricValue(metricValues[i]);
        }
        analyticsCategory.setAttribute('data-animated', 'true');
      }
    }

    // Animate individual metric values
    function animateMetricValue(element) {
      var finalValue = element.textContent;
      var isNumeric = /^\d+/.test(finalValue);
      
      if (isNumeric) {
        var numericValue = parseInt(finalValue);
        var duration = 2000;
        var steps = 50;
        var stepValue = Math.ceil(numericValue / steps);
        var currentValue = 0;
        var step = 0;
        
        var interval = setInterval(function() {
          step++;
          currentValue = Math.min(currentValue + stepValue, numericValue);
          element.textContent = currentValue + (finalValue.includes('+') ? '+' : '');
          
          if (step >= steps || currentValue >= numericValue) {
            clearInterval(interval);
            element.textContent = finalValue;
          }
        }, duration / steps);
      }
    }

    // Interactive service card enhancements
    function enhanceServiceCards() {
      var serviceCards = analyticsCategory.querySelectorAll('.portfolio-service-link');
      
      for (var i = 0; i < serviceCards.length; i++) {
        var card = serviceCards[i];
        
        // Add hover sound effect simulation
        addEvent(card, 'mouseenter', function() {
          if (!features.reducedMotion) {
            addClass(this, 'enhanced-hover');
          }
        });
        
        addEvent(card, 'mouseleave', function() {
          removeClass(this, 'enhanced-hover');
        });
        
        // Add click ripple effect
        addEvent(card, 'click', function(e) {
          createRippleEffect(this, e);
        });
        
        // Enhance stat chips with real-time updates
        var statChips = card.querySelectorAll('.stat-chip');
        for (var j = 0; j < statChips.length; j++) {
          addRandomFluctuations(statChips[j]);
        }
      }
    }

    // Create ripple effect on card click
    function createRippleEffect(element, event) {
      var rect = element.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var x = event.clientX - rect.left - size / 2;
      var y = event.clientY - rect.top - size / 2;
      
      var ripple = document.createElement('span');
      addClass(ripple, 'ripple-effect');
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      element.appendChild(ripple);
      
      setTimeout(function() {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 1000);
    }

    // Add subtle random fluctuations to stat chips
    function addRandomFluctuations(chip) {
      var originalText = chip.textContent;
      var hasPercentage = originalText.includes('%');
      var hasNumber = /\d+/.test(originalText);
      
      if (!hasNumber) return;
      
      var baseValue = parseInt(originalText);
      var fluctuationRange = Math.max(1, Math.floor(baseValue * 0.02)); // 2% fluctuation
      
      setInterval(function() {
        if (!isElementInViewport(chip)) return;
        
        var randomChange = Math.floor(Math.random() * (fluctuationRange * 2 + 1)) - fluctuationRange;
        var newValue = Math.max(0, baseValue + randomChange);
        
        var newText = originalText.replace(/\d+/, newValue);
        chip.textContent = newText;
        
        // Fade back to original after 2 seconds
        setTimeout(function() {
          chip.textContent = originalText;
        }, 2000);
      }, 15000 + Math.random() * 10000); // Random interval between 15-25 seconds
    }

    // Progressive loading effect for service cards
    function progressiveLoadCards() {
      var serviceCards = analyticsCategory.querySelectorAll('.portfolio-service-link');
      var delay = 0;
      
      for (var i = 0; i < serviceCards.length; i++) {
        var card = serviceCards[i];
        addClass(card, 'loading-animation');
        
        setTimeout(function(currentCard) {
          return function() {
            removeClass(currentCard, 'loading-animation');
            addClass(currentCard, 'loaded');
          };
        }(card), delay);
        
        delay += 200;
      }
    }

    // Interactive category progress bar
    function enhanceProgressBar() {
      var progressBar = analyticsCategory.querySelector('.progress-fill');
      var progressText = analyticsCategory.querySelector('.progress-text');
      
      if (!progressBar || !progressText) return;
      
      var targetWidth = progressBar.style.width;
      progressBar.style.width = '0%';
      
      setTimeout(function() {
        progressBar.style.width = targetWidth;
        
        // Add completion celebration effect
        setTimeout(function() {
          if (parseInt(targetWidth) >= 90) {
            addClass(progressBar, 'celebration-glow');
            setTimeout(function() {
              removeClass(progressBar, 'celebration-glow');
            }, 2000);
          }
        }, 1500);
      }, 500);
    }

    // Real-time service performance simulation
    function simulateRealTimeMetrics() {
      var performanceMetrics = {
        projects: 150,
        rating: 4.8,
        services: 4
      };
      
      setInterval(function() {
        // Simulate occasional metric updates
        if (Math.random() < 0.1) { // 10% chance every interval
          var metricItems = analyticsCategory.querySelectorAll('.metric-item');
          
          for (var i = 0; i < metricItems.length; i++) {
            var metricValue = metricItems[i].querySelector('.metric-value');
            var currentText = metricValue.textContent;
            
            // Add subtle pulse effect on update
            addClass(metricValue, 'metric-update');
            setTimeout(function(element) {
              return function() {
                removeClass(element, 'metric-update');
              };
            }(metricValue), 1000);
          }
        }
      }, 30000); // Check every 30 seconds
    }

    // Initialize all enhancements
    addEvent(window, 'scroll', animateMetrics);
    enhanceServiceCards();
    enhanceProgressBar();
    simulateRealTimeMetrics();
    
    // Progressive loading when section becomes visible
    var observer = null;
    if (features.intersectionObserver) {
      observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !entry.target.hasAttribute('data-loaded')) {
            progressiveLoadCards();
            entry.target.setAttribute('data-loaded', 'true');
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(analyticsCategory);
    } else {
      // Fallback for older browsers
      addEvent(window, 'scroll', function() {
        if (isElementInViewport(analyticsCategory) && !analyticsCategory.hasAttribute('data-loaded')) {
          progressiveLoadCards();
          analyticsCategory.setAttribute('data-loaded', 'true');
        }
      });
    }
  }

  // Governance & Strategy Enhancements
  function initGovernanceEnhancements() {
    var governanceCategory = document.querySelector('[data-category="governance"]');
    if (!governanceCategory) return;

    // Animated metrics counter for governance
    function animateGovernanceMetrics() {
      var metricItems = governanceCategory.querySelectorAll('.metric-item');
      
      for (var i = 0; i < metricItems.length; i++) {
        var metricValue = metricItems[i].querySelector('.metric-value');
        var targetText = metricValue.getAttribute('data-target') || metricValue.textContent;
        var targetValue = parseInt(targetText) || 0;
        
        if (targetValue > 0 && isElementInViewport(metricValue)) {
          animateNumber(metricValue, 0, targetValue, 2000);
        }
      }
    }

    // Enhanced service cards with governance-specific interactions
    function enhanceGovernanceServiceCards() {
      var serviceCards = governanceCategory.querySelectorAll('.portfolio-service-link');
      
      for (var i = 0; i < serviceCards.length; i++) {
        var card = serviceCards[i];
        var tooltip = card.querySelector('.service-tooltip');
        
        // Add governance-specific hover effects
        addEvent(card, 'mouseenter', function() {
          addClass(this, 'governance-hover');
          
          // Add security-focused visual effects
          var securityTags = this.querySelectorAll('.service-tag.security, .service-tag.enterprise');
          for (var j = 0; j < securityTags.length; j++) {
            addClass(securityTags[j], 'security-pulse');
          }
        });
        
        addEvent(card, 'mouseleave', function() {
          removeClass(this, 'governance-hover');
          
          var securityTags = this.querySelectorAll('.service-tag.security, .service-tag.enterprise');
          for (var j = 0; j < securityTags.length; j++) {
            removeClass(securityTags[j], 'security-pulse');
          }
        });

        // Enhanced tooltip with governance insights
        if (tooltip) {
          var highlightItem = tooltip.querySelector('.highlight-item');
          if (highlightItem) {
            addEvent(card, 'mouseenter', function() {
              var currentTooltip = this.querySelector('.service-tooltip .highlight-item');
              if (currentTooltip) {
                addClass(currentTooltip, 'governance-highlight-glow');
              }
            });
            
            addEvent(card, 'mouseleave', function() {
              var currentTooltip = this.querySelector('.service-tooltip .highlight-item');
              if (currentTooltip) {
                removeClass(currentTooltip, 'governance-highlight-glow');
              }
            });
          }
        }
      }
    }

    // Governance compliance status simulation
    function simulateComplianceStatus() {
      var complianceChips = governanceCategory.querySelectorAll('.stat-chip');
      
      for (var i = 0; i < complianceChips.length; i++) {
        simulateGovernanceChipFluctuation(complianceChips[i]);
      }
    }

    function simulateGovernanceChipFluctuation(chip) {
      var originalText = chip.textContent;
      var isCompliance = originalText.includes('Compliance') || originalText.includes('%');
      
      if (!isCompliance) return;
      
      setInterval(function() {
        if (!isElementInViewport(chip)) return;
        
        // Add compliance status updates
        addClass(chip, 'compliance-update');
        
        // Show temporary compliance verification
        if (originalText.includes('100%')) {
          chip.textContent = '✓ Verified';
          
          setTimeout(function() {
            chip.textContent = originalText;
            removeClass(chip, 'compliance-update');
          }, 3000);
        }
      }, 45000 + Math.random() * 15000); // Random interval between 45-60 seconds
    }

    // Progressive loading with governance theme
    function progressiveLoadGovernanceCards() {
      var serviceCards = governanceCategory.querySelectorAll('.portfolio-service-link');
      var delay = 0;
      
      for (var i = 0; i < serviceCards.length; i++) {
        var card = serviceCards[i];
        addClass(card, 'governance-loading');
        
        setTimeout(function(currentCard) {
          return function() {
            removeClass(currentCard, 'governance-loading');
            addClass(currentCard, 'governance-loaded');
            
            // Add security shield effect for enterprise services
            if (hasClass(currentCard, 'enterprise') || hasClass(currentCard, 'security')) {
              addClass(currentCard, 'security-verified');
            }
          };
        }(card), delay);
        
        delay += 300; // Slightly longer delay for governance emphasis
      }
    }

    // Enhanced progress bar with governance milestones
    function enhanceGovernanceProgressBar() {
      var progressBar = governanceCategory.querySelector('.progress-fill');
      var progressText = governanceCategory.querySelector('.progress-text');
      
      if (!progressBar || !progressText) return;
      
      var targetWidth = progressBar.style.width;
      var targetPercentage = parseInt(targetWidth);
      progressBar.style.width = '0%';
      
      setTimeout(function() {
        progressBar.style.width = targetWidth;
        
        // Add governance milestone celebrations
        setTimeout(function() {
          if (targetPercentage >= 75) {
            addClass(progressBar, 'governance-milestone');
            
            // Show compliance achievement
            var originalText = progressText.textContent;
            progressText.textContent = '🛡️ Governance Excellence';
            
            setTimeout(function() {
              progressText.textContent = originalText;
              removeClass(progressBar, 'governance-milestone');
            }, 3000);
          }
        }, 2000);
      }, 800);
    }

    // Real-time governance metrics simulation
    function simulateGovernanceMetrics() {
      var governanceMetrics = {
        services: 6,
        rating: 4.8,
        enterprises: 150,
        successRate: 98
      };
      
      setInterval(function() {
        if (Math.random() < 0.08) { // 8% chance every interval
          var metricItems = governanceCategory.querySelectorAll('.metric-item');
          
          for (var i = 0; i < metricItems.length; i++) {
            var metricValue = metricItems[i].querySelector('.metric-value');
            
            addClass(metricValue, 'governance-metric-update');
            
            // Add governance-specific visual feedback
            var metricIcon = metricItems[i].querySelector('.metric-icon');
            if (metricIcon && metricIcon.textContent === '🛡️') {
              addClass(metricIcon, 'shield-pulse');
            }
            
            setTimeout(function(element, icon) {
              return function() {
                removeClass(element, 'governance-metric-update');
                if (icon) removeClass(icon, 'shield-pulse');
              };
            }(metricValue, metricIcon), 1200);
          }
        }
      }, 35000); // Check every 35 seconds
    }

    // Initialize all governance enhancements
    addEvent(window, 'scroll', animateGovernanceMetrics);
    enhanceGovernanceServiceCards();
    enhanceGovernanceProgressBar();
    simulateComplianceStatus();
    simulateGovernanceMetrics();
    
    // Progressive loading when governance section becomes visible
    var observer = null;
    if (features.intersectionObserver) {
      observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !entry.target.hasAttribute('data-governance-loaded')) {
            progressiveLoadGovernanceCards();
            entry.target.setAttribute('data-governance-loaded', 'true');
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(governanceCategory);
    } else {
      // Fallback for older browsers
      addEvent(window, 'scroll', function() {
        if (isElementInViewport(governanceCategory) && !governanceCategory.hasAttribute('data-governance-loaded')) {
          progressiveLoadGovernanceCards();
          governanceCategory.setAttribute('data-governance-loaded', 'true');
        }
      });
    }
  }

  // Values Portfolio Interactive Functionality
  function initValuesPortfolio() {
    var valuesContainer = document.getElementById('values-grid');
    var valuesSearch = document.getElementById('values-search');
    var valuesSort = document.getElementById('values-sort');
    var filterBtns = document.querySelectorAll('.values-controls .filter-btn');
    var totalValuesCounter = document.getElementById('total-values');
    var filteredCounter = document.getElementById('filtered-values');
    
    if (!valuesContainer) return;

    var allValues = Array.prototype.slice.call(valuesContainer.querySelectorAll('.portfolio-service-link'));
    var currentFilter = 'all';
    var currentSort = 'default';

    // Initialize values enhancement functions
    initValuesEnhancements();

    // Search functionality
    if (valuesSearch) {
      addEvent(valuesSearch, 'input', function() {
        filterAndSortValues();
      });
    }

    // Sort functionality
    if (valuesSort) {
      addEvent(valuesSort, 'change', function() {
        currentSort = this.value;
        filterAndSortValues();
      });
    }

    // Filter functionality
    for (var i = 0; i < filterBtns.length; i++) {
      addEvent(filterBtns[i], 'click', function() {
        // Remove active class from all buttons
        for (var j = 0; j < filterBtns.length; j++) {
          removeClass(filterBtns[j], 'active');
        }
        
        // Add active class to clicked button
        addClass(this, 'active');
        
        currentFilter = this.getAttribute('data-filter');
        filterAndSortValues();
      });
    }

    function filterAndSortValues() {
      var searchTerm = valuesSearch ? valuesSearch.value.toLowerCase() : '';
      var visibleValues = [];

      // Filter values
      for (var i = 0; i < allValues.length; i++) {
        var value = allValues[i];
        var valueInfo = value.querySelector('.service-info');
        var title = valueInfo.querySelector('strong').textContent.toLowerCase();
        var description = valueInfo.querySelector('p').textContent.toLowerCase();
        var category = value.getAttribute('data-category') || '';
        
        var matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        var matchesFilter = currentFilter === 'all' || category === currentFilter;

        if (matchesSearch && matchesFilter) {
          value.style.display = 'block';
          removeClass(value, 'filtered-out');
          addClass(value, 'filtered-in');
          visibleValues.push(value);
        } else {
          value.style.display = 'none';
          addClass(value, 'filtered-out');
          removeClass(value, 'filtered-in');
        }
      }

      // Sort visible values
      if (currentSort !== 'default') {
        visibleValues.sort(function(a, b) {
          switch (currentSort) {
            case 'impact':
              return parseInt(b.getAttribute('data-impact')) - parseInt(a.getAttribute('data-impact'));
            case 'popularity':
              var aRating = parseFloat(a.querySelector('.popularity').textContent.replace('★ ', ''));
              var bRating = parseFloat(b.querySelector('.popularity').textContent.replace('★ ', ''));
              return bRating - aRating;
            case 'alphabetical':
              var aTitle = a.querySelector('.service-info strong').textContent;
              var bTitle = b.querySelector('.service-info strong').textContent;
              return aTitle.localeCompare(bTitle);
            default:
              return 0;
          }
        });

        // Reorder elements in DOM
        var categories = valuesContainer.querySelectorAll('.values-category');
        for (var i = 0; i < categories.length; i++) {
          var categoryServices = categories[i].querySelector('.category-services');
          var categoryValues = [];
          
          for (var j = 0; j < visibleValues.length; j++) {
            if (visibleValues[j].getAttribute('data-category') === categories[i].getAttribute('data-category')) {
              categoryValues.push(visibleValues[j]);
            }
          }
          
          for (var k = 0; k < categoryValues.length; k++) {
            categoryServices.appendChild(categoryValues[k]);
          }
        }
      }

      // Update counters
      if (filteredCounter) {
        filteredCounter.textContent = visibleValues.length;
      }

      // Update category visibility
      updateCategoryVisibility();
    }

    function updateCategoryVisibility() {
      var categories = valuesContainer.querySelectorAll('.values-category');
      
      for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        var visibleValues = category.querySelectorAll('.portfolio-service-link:not(.filtered-out)');
        
        if (visibleValues.length > 0) {
          category.style.display = 'block';
          removeClass(category, 'category-hidden');
        } else if (currentFilter !== 'all') {
          category.style.display = 'none';
          addClass(category, 'category-hidden');
        }
      }
    }

    // Initialize counters
    if (totalValuesCounter) {
      totalValuesCounter.textContent = allValues.length;
    }
    if (filteredCounter) {
      filteredCounter.textContent = allValues.length;
    }

    // Values-specific enhancements
    function initValuesEnhancements() {
      var categories = valuesContainer.querySelectorAll('.values-category');
      
      for (var i = 0; i < categories.length; i++) {
        enhanceValuesCategory(categories[i]);
      }
    }

    function enhanceValuesCategory(category) {
      // Animated metrics counter for values
      function animateValuesMetrics() {
        var metricItems = category.querySelectorAll('.metric-item');
        
        for (var i = 0; i < metricItems.length; i++) {
          var metricValue = metricItems[i].querySelector('.metric-value');
          var targetText = metricValue.getAttribute('data-target') || metricValue.textContent;
          var isNumber = /^\d+$/.test(targetText);
          
          if (isNumber && isElementInViewport(metricValue)) {
            var targetValue = parseInt(targetText);
            animateNumber(metricValue, 0, targetValue, 2000);
          }
        }
      }

      // Enhanced service cards with values-specific interactions
      function enhanceValuesServiceCards() {
        var serviceCards = category.querySelectorAll('.portfolio-service-link');
        
        for (var i = 0; i < serviceCards.length; i++) {
          var card = serviceCards[i];
          var tooltip = card.querySelector('.service-tooltip');
          
          // Add values-specific hover effects
          addEvent(card, 'mouseenter', function() {
            addClass(this, 'values-hover');
            
            // Add category-specific visual effects
            var categoryType = this.getAttribute('data-category');
            if (categoryType) {
              addClass(this, categoryType + '-glow');
            }
          });
          
          addEvent(card, 'mouseleave', function() {
            removeClass(this, 'values-hover');
            
            var categoryType = this.getAttribute('data-category');
            if (categoryType) {
              removeClass(this, categoryType + '-glow');
            }
          });

          // Enhanced tooltip interactions
          if (tooltip) {
            var highlightItem = tooltip.querySelector('.highlight-item');
            if (highlightItem) {
              addEvent(card, 'mouseenter', function() {
                var currentTooltip = this.querySelector('.service-tooltip .highlight-item');
                if (currentTooltip) {
                  addClass(currentTooltip, 'values-highlight-pulse');
                }
              });
              
              addEvent(card, 'mouseleave', function() {
                var currentTooltip = this.querySelector('.service-tooltip .highlight-item');
                if (currentTooltip) {
                  removeClass(currentTooltip, 'values-highlight-pulse');
                }
              });
            }
          }
        }
      }

      // Progressive loading with values theme
      function progressiveLoadValuesCards() {
        var serviceCards = category.querySelectorAll('.portfolio-service-link');
        var delay = 0;
        
        for (var i = 0; i < serviceCards.length; i++) {
          var card = serviceCards[i];
          addClass(card, 'values-loading');
          
          setTimeout(function(currentCard) {
            return function() {
              removeClass(currentCard, 'values-loading');
              addClass(currentCard, 'values-loaded');
              
              // Add category-specific loaded effects
              var categoryType = currentCard.getAttribute('data-category');
              if (categoryType) {
                addClass(currentCard, categoryType + '-verified');
              }
            };
          }(card), delay);
          
          delay += 200;
        }
      }

      // Enhanced progress bar with values milestones
      function enhanceValuesProgressBar() {
        var progressBar = category.querySelector('.progress-fill');
        var progressText = category.querySelector('.progress-text');
        
        if (!progressBar || !progressText) return;
        
        var targetWidth = progressBar.style.width;
        var targetPercentage = parseInt(targetWidth);
        progressBar.style.width = '0%';
        
        setTimeout(function() {
          progressBar.style.width = targetWidth;
          
          // Add values milestone celebrations
          setTimeout(function() {
            if (targetPercentage >= 90) {
              addClass(progressBar, 'values-excellence');
              
              var originalText = progressText.textContent;
              progressText.textContent = '🏆 Excellence Achieved';
              
              setTimeout(function() {
                progressText.textContent = originalText;
                removeClass(progressBar, 'values-excellence');
              }, 2500);
            }
          }, 1500);
        }, 600);
      }

      // Initialize category enhancements
      addEvent(window, 'scroll', animateValuesMetrics);
      enhanceValuesServiceCards();
      enhanceValuesProgressBar();
      
      // Progressive loading when category becomes visible
      var observer = null;
      if (features.intersectionObserver) {
        observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting && !entry.target.hasAttribute('data-values-loaded')) {
              progressiveLoadValuesCards();
              entry.target.setAttribute('data-values-loaded', 'true');
            }
          });
        }, { threshold: 0.3 });
        
        observer.observe(category);
      } else {
        // Fallback for older browsers
        addEvent(window, 'scroll', function() {
          if (isElementInViewport(category) && !category.hasAttribute('data-values-loaded')) {
            progressiveLoadValuesCards();
            category.setAttribute('data-values-loaded', 'true');
          }
        });
      }
    }
  }

  // Chat Assistant Functionality
  function initChatAssistant() {
    var chatWidget = document.getElementById('chat-widget');
    var chatToggle = document.getElementById('chat-toggle');
    var chatContainer = document.getElementById('chat-container');
    var chatClose = document.getElementById('chat-close');
    var chatMinimize = document.getElementById('chat-minimize');
    var chatInput = document.getElementById('chat-input');
    var sendBtn = document.getElementById('send-btn');
    var chatMessages = document.getElementById('chat-messages');
    var typingIndicator = document.getElementById('typing-indicator');
    var emojiBtn = document.getElementById('emoji-btn');
    var emojiPicker = document.getElementById('emoji-picker');
    var notificationBadge = document.getElementById('chat-notification');
    
    var isOpen = false;
    var isMinimized = false;
    var messageCount = 0;
    
    if (!chatWidget) return;

    // Predefined responses for the AI assistant
    var aiResponses = {
      'services': {
        text: "KFSQUARE offers comprehensive data analytics services including:\n\n🔹 Data Engineering & Pipeline Architecture\n🔹 Predictive Analytics & Machine Learning\n🔹 LLM Integration & AI Solutions\n🔹 Business Intelligence & Visualization\n🔹 Data Governance & Security\n🔹 Strategic AI Consulting\n\nWhich service interests you most?",
        quickActions: ['Get Pricing', 'Request Demo', 'Contact Sales']
      },
      'pricing': {
        text: "Our pricing is tailored to your specific needs. Here are our typical ranges:\n\n💰 **Starter Projects**: $5,000 - $15,000\n💰 **Professional Solutions**: $15,000 - $50,000\n💰 **Enterprise Programs**: $50,000+\n\nFactors affecting pricing:\n• Project complexity\n• Data volume\n• Timeline requirements\n• Ongoing support needs\n\nWould you like a custom quote?",
        quickActions: ['Custom Quote', 'Schedule Call', 'View Case Studies']
      },
      'demo': {
        text: "I'd be happy to arrange a personalized demo! Our demos typically include:\n\n🎯 **Live Platform Walkthrough** (30 mins)\n🎯 **Custom Use Case Discussion** (15 mins)\n🎯 **Q&A Session** (15 mins)\n\nAvailable time slots:\n• Today 2:00 PM EST\n• Tomorrow 10:00 AM EST\n• Friday 3:00 PM EST\n\nWhich works best for you?",
        quickActions: ['Book Today', 'Book Tomorrow', 'Book Friday', 'Other Time']
      },
      'contact': {
        text: "Connect with our sales team directly:\n\n📞 **Phone**: 215-279-2887\n📧 **Email**: customersupport@kfsquare.com\n\n**Sales Team Hours:**\n• Monday-Friday: 9 AM - 6 PM EST\n• Saturday: 10 AM - 2 PM EST\n• 24/7 Emergency Support Available\n\n**Average Response Time**: Under 2 hours\n\nHow would you prefer to connect?",
        quickActions: ['Call Now', 'Send Email', 'Schedule Callback']
      },
      'default': [
        "I'm here to help you discover how KFSQUARE can transform your data strategy. What specific challenge are you looking to solve?",
        "That's a great question! KFSQUARE specializes in turning complex data into actionable insights. Can you tell me more about your current data needs?",
        "I'd love to help you explore our solutions. Are you looking for predictive analytics, data engineering, or AI integration services?",
        "Thank you for your interest in KFSQUARE! Our AI-powered analytics solutions have helped 500+ companies achieve breakthrough results. What's your biggest data challenge?"
      ]
    };

    // Common keywords and their responses
    var keywordResponses = {
      'hello|hi|hey|good morning|good afternoon': 'services',
      'price|cost|pricing|budget|expensive|cheap': 'pricing',
      'demo|demonstration|show|preview|trial': 'demo',
      'contact|call|phone|email|sales|support': 'contact',
      'service|services|what do you do|offerings': 'services',
      'help|assist|support|question': 'services'
    };

    // Initialize chat
    function initChat() {
      // Show notification after 10 seconds
      setTimeout(function() {
        if (!isOpen) {
          showNotification();
          expandToggleButton();
        }
      }, 10000);

      // Show notification periodically if not opened
      setInterval(function() {
        if (!isOpen && messageCount === 0) {
          showNotification();
          expandToggleButton();
        }
      }, 60000); // Every minute
    }

    // Show notification badge
    function showNotification() {
      if (notificationBadge) {
        addClass(notificationBadge, 'show');
      }
    }

    // Hide notification badge
    function hideNotification() {
      if (notificationBadge) {
        removeClass(notificationBadge, 'show');
      }
    }

    // Expand toggle button
    function expandToggleButton() {
      addClass(chatToggle, 'expanded');
      setTimeout(function() {
        removeClass(chatToggle, 'expanded');
      }, 3000);
    }

    // Open chat
    function openChat() {
      isOpen = true;
      isMinimized = false;
      chatContainer.style.display = 'flex';
      addClass(chatContainer, 'open');
      removeClass(chatContainer, 'minimized');
      hideNotification();
      
      // Focus input
      setTimeout(function() {
        if (chatInput) chatInput.focus();
      }, 300);
    }

    // Close chat
    function closeChat() {
      isOpen = false;
      removeClass(chatContainer, 'open');
      setTimeout(function() {
        chatContainer.style.display = 'none';
      }, 300);
    }

    // Minimize chat
    function minimizeChat() {
      isMinimized = !isMinimized;
      if (isMinimized) {
        addClass(chatContainer, 'minimized');
      } else {
        removeClass(chatContainer, 'minimized');
      }
    }

    // Add message to chat
    function addMessage(text, isUser, showQuickActions) {
      if (!chatMessages) return;
      
      messageCount++;
      var messageDiv = document.createElement('div');
      addClass(messageDiv, 'message');
      addClass(messageDiv, isUser ? 'user-message' : 'bot-message');
      
      var currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      messageDiv.innerHTML = 
        '<div class="message-avatar">' + (isUser ? '👤' : '🤖') + '</div>' +
        '<div class="message-content">' +
          '<div class="message-text">' + text.replace(/\n/g, '<br>') + '</div>' +
          '<div class="message-time">' + currentTime + '</div>' +
        '</div>';
      
      chatMessages.appendChild(messageDiv);
      
      // Add quick actions if specified
      if (showQuickActions && showQuickActions.length > 0) {
        var quickActionsDiv = document.createElement('div');
        addClass(quickActionsDiv, 'quick-actions');
        quickActionsDiv.innerHTML = 
          '<div class="quick-action-label">Quick Actions:</div>' +
          '<div class="quick-buttons">' +
            showQuickActions.map(function(action) {
              return '<button class="quick-btn" data-action="' + action.toLowerCase().replace(/\s+/g, '-') + '">' + action + '</button>';
            }).join('') +
          '</div>';
        
        chatMessages.appendChild(quickActionsDiv);
        
        // Add click handlers for new quick buttons
        var newQuickBtns = quickActionsDiv.querySelectorAll('.quick-btn');
        for (var i = 0; i < newQuickBtns.length; i++) {
          addEvent(newQuickBtns[i], 'click', handleQuickAction);
        }
      }
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
      if (typingIndicator) {
        typingIndicator.style.display = 'flex';
      }
    }

    // Hide typing indicator
    function hideTypingIndicator() {
      if (typingIndicator) {
        typingIndicator.style.display = 'none';
      }
    }

    // Generate AI response
    function generateResponse(userMessage) {
      var message = userMessage.toLowerCase();
      
      // Check for keyword matches
      for (var keywords in keywordResponses) {
        var regex = new RegExp(keywords, 'i');
        if (regex.test(message)) {
          var responseKey = keywordResponses[keywords];
          if (aiResponses[responseKey]) {
            return aiResponses[responseKey];
          }
        }
      }
      
      // Default responses
      var defaultResponses = aiResponses.default;
      var randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      return {
        text: randomResponse,
        quickActions: ['Our Services', 'Get Pricing', 'Request Demo']
      };
    }

    // Handle user message
    function handleUserMessage(message) {
      if (!message.trim()) return;
      
      // Add user message
      addMessage(message, true);
      
      // Clear input
      chatInput.value = '';
      updateSendButton();
      
      // Show typing indicator
      showTypingIndicator();
      
      // Generate response after delay
      setTimeout(function() {
        hideTypingIndicator();
        var response = generateResponse(message);
        addMessage(response.text, false, response.quickActions);
      }, 1000 + Math.random() * 2000); // 1-3 second delay
    }

    // Handle quick actions
    function handleQuickAction(e) {
      var action = e.target.getAttribute('data-action');
      var actionText = e.target.textContent;
      
      // Add user message
      addMessage(actionText, true);
      
      // Show typing indicator
      showTypingIndicator();
      
      // Generate response
      setTimeout(function() {
        hideTypingIndicator();
        var responseKey = action;
        
        // Map some actions to response keys
        if (action === 'our-services') responseKey = 'services';
        if (action === 'get-pricing') responseKey = 'pricing';
        if (action === 'request-demo') responseKey = 'demo';
        if (action === 'contact-sales') responseKey = 'contact';
        
        var response = aiResponses[responseKey] || aiResponses.default[0];
        if (typeof response === 'string') {
          response = { text: response, quickActions: ['Our Services', 'Get Pricing', 'Contact Sales'] };
        }
        
        addMessage(response.text, false, response.quickActions);
      }, 800 + Math.random() * 1200);
    }

    // Update send button state
    function updateSendButton() {
      if (!sendBtn || !chatInput) return;
      
      if (chatInput.value.trim()) {
        sendBtn.disabled = false;
        addClass(sendBtn, 'active');
      } else {
        sendBtn.disabled = true;
        removeClass(sendBtn, 'active');
      }
    }

    // Handle emoji selection
    function handleEmojiSelection(emoji) {
      if (chatInput) {
        chatInput.value += emoji;
        chatInput.focus();
        updateSendButton();
      }
      if (emojiPicker) {
        emojiPicker.style.display = 'none';
      }
    }

    // Event listeners
    if (chatToggle) {
      addEvent(chatToggle, 'click', function() {
        if (isOpen) {
          closeChat();
        } else {
          openChat();
        }
      });
    }

    if (chatClose) {
      addEvent(chatClose, 'click', closeChat);
    }

    if (chatMinimize) {
      addEvent(chatMinimize, 'click', minimizeChat);
    }

    if (sendBtn) {
      addEvent(sendBtn, 'click', function() {
        if (chatInput && chatInput.value.trim()) {
          handleUserMessage(chatInput.value);
        }
      });
    }

    if (chatInput) {
      addEvent(chatInput, 'input', updateSendButton);
      
      addEvent(chatInput, 'keydown', function(e) {
        if (e.keyCode === 13 && !e.shiftKey) { // Enter key
          e.preventDefault();
          if (this.value.trim()) {
            handleUserMessage(this.value);
          }
        }
      });
    }

    if (emojiBtn) {
      addEvent(emojiBtn, 'click', function(e) {
        e.stopPropagation();
        if (emojiPicker) {
          emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
        }
      });
    }

    // Emoji picker events
    if (emojiPicker) {
      var emojiOptions = emojiPicker.querySelectorAll('.emoji-option');
      for (var i = 0; i < emojiOptions.length; i++) {
        addEvent(emojiOptions[i], 'click', function() {
          handleEmojiSelection(this.textContent);
        });
      }
    }

    // Quick action buttons in welcome message
    var quickBtns = document.querySelectorAll('.quick-btn');
    for (var i = 0; i < quickBtns.length; i++) {
      addEvent(quickBtns[i], 'click', handleQuickAction);
    }

    // Close emoji picker when clicking outside
    addEvent(document, 'click', function(e) {
      if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.style.display = 'none';
      }
    });

    // Close chat when clicking outside (optional)
    addEvent(document, 'click', function(e) {
      if (isOpen && !chatWidget.contains(e.target)) {
        // closeChat(); // Uncomment if you want to close on outside click
      }
    });

    // Initialize
    initChat();
    updateSendButton();
  }

  // Initialize when DOM is ready
  domReady(init);

})();
