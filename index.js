// Multi-Page Navigation and Enhanced Site Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    // Prefill contact form from query string
    try {
        const params = new URLSearchParams(window.location.search);
        const subject = params.get('subject');
        if (subject) {
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.value = subject + '\n\n';
                messageEl.focus();
            }
        }
    } catch (e) {
        // ignore
    }
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
    
    // Global functions for multi-page functionality
    window.openChat = function(message = '') {
        const chatWidget = document.getElementById('chat-widget');
        const chatContainer = document.getElementById('chat-container');
        
        if (chatWidget && chatContainer) {
            chatWidget.classList.add('expanded');
            chatContainer.style.display = 'flex';
            
            if (message) {
                setTimeout(() => {
                    const chatInput = document.getElementById('chat-input');
                    if (chatInput) {
                        chatInput.value = message;
                        chatInput.focus();
                    }
                }, 500);
            }
        }
    };
    
    window.openScheduleModal = function() {
        const modal = document.getElementById('schedule-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };
    
    window.closeScheduleModal = function() {
        const modal = document.getElementById('schedule-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
    
    // Time slot selection
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            timeSlots.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Portfolio filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category')?.includes(filter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Contact form handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const button = contactForm.querySelector('button[type="submit"]');
            button.disabled = true;
            button.innerHTML = 'Sending...';
            
            setTimeout(() => {
                alert('Thank you for your message! We will respond within 24 hours.');
                contactForm.reset();
                button.disabled = false;
                button.innerHTML = 'Send Message';
            }, 2000);
        });
    }
    
    // Contact form handler (legacy fallback; skipped if enhanced handler is enabled)
    const legacyContactForm = document.getElementById('contact-form');
    if (legacyContactForm && legacyContactForm.getAttribute('data-enhanced') !== 'true') {
        legacyContactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const button = legacyContactForm.querySelector('button[type="submit"]');
            if (button) {
              button.disabled = true;
              button.innerHTML = 'Sending...';
            }
            
            setTimeout(() => {
                alert('Thank you for your message! We will respond within 24 hours.');
                if (legacyContactForm.reset) legacyContactForm.reset();
                if (button) {
                  button.disabled = false;
                  button.innerHTML = 'Send Message';
                }
            }, 2000);
        });
    }
    
    // Modal close functionality
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach(close => {
        close.addEventListener('click', function() {
            const modal = this.closest('.service-modal, .project-modal, .schedule-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
});

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
    if (!form) return;

    var status = document.getElementById('form-status');
    // Ensure a status region exists for a11y feedback
    if (!status) {
      status = document.createElement('div');
      status.id = 'form-status';
      status.className = 'mt-3 text-muted';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      form.appendChild(status);
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    // Support either Bootstrap spinner or plain loading span
    var spinner = submitBtn ? (submitBtn.querySelector('.spinner-border') || submitBtn.querySelector('.btn-loading')) : null;
    var btnText = submitBtn ? (submitBtn.querySelector('.btn-text') || submitBtn) : null;

    // Add honeypot if missing
    if (!form.website) {
      var honeypot = document.createElement('input');
      honeypot.type = 'text';
      honeypot.name = 'website';
      honeypot.id = 'website';
      honeypot.className = 'visually-hidden';
      honeypot.setAttribute('tabindex', '-1');
      honeypot.setAttribute('autocomplete', 'off');
      honeypot.setAttribute('aria-hidden', 'true');
      form.appendChild(honeypot);
    }

    // Live character counter and autosize for message
    var messageField = document.getElementById('message');
    var counter = document.getElementById('message-counter');
    if (messageField) {
      if (!counter) {
        counter = document.createElement('span');
        counter.id = 'message-counter';
        counter.className = 'small text-muted';
        messageField.parentNode && messageField.parentNode.parentNode && messageField.parentNode.parentNode.appendChild(counter);
      }
      var updateCounter = function() {
        var max = parseInt(messageField.getAttribute('maxlength') || '1000', 10);
        var len = messageField.value.length;
        counter.textContent = len + '/' + max;
        messageField.style.height = 'auto';
        messageField.style.height = Math.min(messageField.scrollHeight, 300) + 'px';
      };
      updateCounter();
      messageField.addEventListener('input', updateCounter);
    }

    // Quick-pick service chips (mobile-friendly shortcuts)
    var serviceSelect = document.getElementById('service');
    var chips = document.querySelectorAll('[data-service-chip]');
    for (var i = 0; i < chips.length; i++) {
      (function(chip) {
        addEvent(chip, 'click', function() {
          var value = chip.getAttribute('data-service-chip');
          if (serviceSelect) {
            serviceSelect.value = value;
            if (typeof Event === 'function') {
              serviceSelect.dispatchEvent(new Event('change'));
            }
          }
          // Optional: focus message to continue typing on mobile
          if (messageField) {
            messageField.focus();
          }
        });
      })(chips[i]);
    }

    function setSubmitting(state) {
      if (!submitBtn) return;
      submitBtn.disabled = !!state;
      if (spinner && spinner.classList) spinner.classList[state ? 'remove' : 'add']('d-none');
      if (btnText) {
        if (btnText.classList && btnText.classList.contains('btn-text')) {
          btnText.textContent = state ? 'Sending...' : 'Send Message';
        } else if (btnText.tagName) {
          btnText.textContent = state ? 'Sending...' : 'Send Message';
        }
      }
    }

    function getFormData() {
      return {
        name: (form.name && form.name.value) || '',
        email: (form.email && form.email.value) || '',
        phone: (form.phone && form.phone.value) || '',
        company: (form.company && form.company.value) || '',
        serviceInterest: (form.service && form.service.value) || 'other',
        message: (form.message && form.message.value) || '',
        website: (form.website && form.website.value) || '' // honeypot
      };
    }

    function updateStatus(text, type) {
      if (!status) return;
      status.className = 'mt-3 ' + (type === 'error' ? 'text-danger' : type === 'success' ? 'text-success' : 'text-muted');
      status.textContent = text;
    }

    // Mobile-friendly focus scroll
    var inputs = form.querySelectorAll('input, select, textarea');
    for (var k = 0; k < inputs.length; k++) {
      addEvent(inputs[k], 'focus', function() {
        try {
          var rect = this.getBoundingClientRect();
          if (rect.top < 80) {
            window.scrollTo({ top: window.pageYOffset + rect.top - 80, behavior: 'smooth' });
          }
        } catch (e) {}
      });
    }

    addEvent(form, 'submit', function(event) {
      if (event.preventDefault) event.preventDefault(); else event.returnValue = false;

      // Bootstrap validation UI
      if (form.classList) form.classList.add('was-validated');
      var data = getFormData();

      // Basic validation
      var invalid = false;
      if (!data.name) { invalid = true; form.name && form.name.classList && form.name.classList.add('is-invalid'); }
      if (!data.email) { invalid = true; form.email && form.email.classList && form.email.classList.add('is-invalid'); }
      if (!data.message) { invalid = true; form.message && form.message.classList && form.message.classList.add('is-invalid'); }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (data.email && !emailRegex.test(data.email)) {
        invalid = true;
        form.email && form.email.classList && form.email.classList.add('is-invalid');
      }
      if (data.website) { // honeypot
        updateStatus('Invalid submission detected.', 'error');
        return;
      }
      if (invalid) {
        updateStatus('Please fill in all required fields.', 'error');
        return;
      }

      setSubmitting(true);
      updateStatus('Sending your message...', 'info');

      var payload = {
        name: data.name,
        email: data.email,
        message: data.message,
        phone: data.phone,
        company: data.company,
        serviceInterest: data.serviceInterest
      };

      var canFetch = typeof window !== 'undefined' && typeof window.fetch === 'function';
      if (canFetch) {
        try {
          fetch('/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
            .then(function(res) { return res.json(); })
            .then(function(json) {
              if (json && json.success) {
                updateStatus('Thanks! Your message was sent successfully.', 'success');
                if (form.reset) form.reset();
                if (form.classList) form.classList.remove('was-validated');
                if (messageField) { messageField.style.height = '120px'; }
              } else {
                fallbackMailto(data);
              }
            })
            .catch(function() { fallbackMailto(data); })
            .finally(function() { setSubmitting(false); });
        } catch (e) {
          fallbackMailto(data);
          setSubmitting(false);
        }
      } else {
        fallbackMailto(data);
        setSubmitting(false);
      }
    });

    function fallbackMailto(data) {
      try {
        var subject = 'Contact Form Submission';
        var body = 'Name: ' + data.name + '\n' +
                   'Email: ' + data.email + '\n' +
                   (data.phone ? ('Phone: ' + data.phone + '\n') : '') +
                   (data.company ? ('Company: ' + data.company + '\n') : '') +
                   'Service: ' + (data.serviceInterest || 'other') + '\n\n' +
                   'Message:\n' + data.message;
        var link = 'mailto:customersupport@kfsquare.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = link;
        }
        updateStatus('We could not reach the server. Your email client has been opened.', 'info');
      } catch (e) {
        updateStatus('Something went wrong. Please try again later.', 'error');
      }
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

  // Enhanced Customer Support Chat Assistant Functionality
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
    
    // Enhanced support features
    var supportMenuBtn = document.querySelector('.support-menu-btn');
    var supportMenuDropdown = document.querySelector('.support-menu-dropdown');
    var attachmentBtn = document.querySelector('.attachment-btn');
    var voiceBtn = document.querySelector('.voice-btn');
    var fileInput = document.getElementById('file-input');
    var supportStatus = document.querySelector('.support-status');
    var fileUploadArea = document.querySelector('.file-upload-area');
    
    var isOpen = false;
    var isMinimized = false;
    var messageCount = 0;
    var conversationHistory = [];
    var currentTicketId = null;
    var agentConnected = false;
    var satisfactionShown = false;
    var isRecording = false;
    var mediaRecorder = null;
    var supportOnline = true;
    
    if (!chatWidget) return;

    // Enhanced AI responses for customer support
    var aiResponses = {
      'technical-support': {
        text: "🛠️ **Technical Support Center**\n\nI can help you with:\n\n� **System Issues & Troubleshooting**\n� **Integration Problems**\n� **Performance Optimization**\n� **API Documentation & Setup**\n� **Data Pipeline Issues**\n🔧 **Platform Configuration**\n\nWhat technical issue are you experiencing?",
        quickActions: ['System Down', 'Integration Help', 'Performance Issues', 'Create Ticket']
      },
      'billing-support': {
        text: "💳 **Billing & Account Support**\n\nI can assist with:\n\n💰 **Invoice Questions & Payment Issues**\n💰 **Subscription Management**\n💰 **Usage Reports & Analytics**\n💰 **Plan Upgrades & Changes**\n💰 **Refund Requests**\n💰 **Enterprise Pricing**\n\nWhat billing question do you have?",
        quickActions: ['View Invoice', 'Payment Issue', 'Upgrade Plan', 'Billing Ticket']
      },
      'service-info': {
        text: "ℹ️ **Service Information Hub**\n\nLearn about our comprehensive offerings:\n\n🌟 **Data Engineering & ETL Pipelines**\n🌟 **Advanced Analytics & ML Models**\n🌟 **Real-time Data Processing**\n🌟 **AI Integration & LLM Solutions**\n🌟 **Business Intelligence Dashboards**\n🌟 **Data Security & Compliance**\n\nWhich service would you like to explore?",
        quickActions: ['Data Engineering', 'AI Solutions', 'Analytics', 'Security']
      },
      'live-agent': {
        text: "👨‍💼 **Live Agent Connection**\n\n🔄 **Connecting you to our expert support team...**\n\n**Current Queue Status**: 2 people ahead\n**Estimated Wait Time**: 3-5 minutes\n**Agent Specialty**: Technical & Billing Support\n\nWhile you wait, feel free to describe your issue in detail. This will help our agent assist you faster.",
        quickActions: ['Describe Issue', 'Upload Files', 'Cancel Request']
      },
      'satisfaction': {
        text: "⭐ **How was your support experience?**\n\nYour feedback helps us improve our customer service. Please rate your experience and let us know how we did.",
        quickActions: []
      },
      'ticket-created': {
        text: "🎫 **Support Ticket Created Successfully!**\n\n**Ticket ID**: #SUP-" + Math.floor(Math.random() * 10000) + "\n**Priority**: High\n**Status**: Open\n**Assigned Agent**: Will be assigned within 1 hour\n\n📧 **Confirmation sent to your email**\n📱 **SMS updates enabled**\n\nYou can track your ticket progress anytime.",
        quickActions: ['Track Ticket', 'Upload Files', 'Contact Agent']
      },
      'default': [
        "👋 Welcome to KFSQUARE Customer Support! I'm here to provide comprehensive assistance with technical issues, billing questions, and service information. How can I help you today?",
        "Hello! I'm your dedicated KFSQUARE support assistant. Whether you need technical help, billing support, or want to learn about our services, I'm here to help. What brings you here today?",
        "Hi there! Thank you for contacting KFSQUARE support. Our team is available 24/7 to assist with any questions or issues you may have. How can I make your day better?",
        "Welcome! I'm equipped to help with technical troubleshooting, account management, service information, and can connect you with live agents when needed. What can I assist you with?"
      ]
    };

    // Enhanced keyword responses for support scenarios
    var keywordResponses = {
      'hello|hi|hey|good morning|good afternoon|help|support': 'default',
      'technical|tech|bug|error|issue|problem|broken|not working|down': 'technical-support',
      'billing|payment|invoice|charge|subscription|price|refund|upgrade': 'billing-support',
      'service|services|what do you do|features|capabilities|offerings': 'service-info',
      'agent|human|person|representative|speak to someone|live chat': 'live-agent',
      'ticket|case|complaint|report|submit': 'technical-support'
    };

    // Initialize enhanced chat with support features
    function initChat() {
      updateSupportStatus('online');
      
      // Welcome message with comprehensive support options
      setTimeout(function() {
        var welcomeMsg = "👋 **Welcome to KFSQUARE Customer Support!**\n\nI'm your AI assistant, ready to help with:\n• 🛠️ Technical troubleshooting\n• 💳 Billing & account questions\n• ℹ️ Service information\n• 👨‍💼 Live agent connection\n\nHow can I assist you today?";
        addMessage(welcomeMsg, false, ['Technical Support', 'Billing Help', 'Service Info', 'Live Agent']);
      }, 1000);

      // Show notification after 15 seconds for first-time visitors
      setTimeout(function() {
        if (!isOpen && messageCount === 1) {
          showNotification();
          expandToggleButton();
        }
      }, 15000);

      // Periodic engagement for inactive users
      setInterval(function() {
        if (!isOpen && messageCount <= 2) {
          showNotification();
          updateNotificationText("Need help? Our support team is online!");
        }
      }, 120000); // Every 2 minutes
    }

    // Enhanced support status management
    function updateSupportStatus(status) {
      supportOnline = (status === 'online');
      if (supportStatus) {
        supportStatus.innerHTML = supportOnline ? 
          '<span style="color: #00ff88;">●</span> Support Online' : 
          '<span style="color: #ff9800;">●</span> Limited Hours';
      }
    }

    // Enhanced notification system
    function showNotification() {
      if (notificationBadge) {
        addClass(notificationBadge, 'show');
      }
    }

    function hideNotification() {
      if (notificationBadge) {
        removeClass(notificationBadge, 'show');
      }
    }

    function updateNotificationText(text) {
      var statusElement = document.querySelector('.support-status');
      if (statusElement) {
        statusElement.textContent = text;
      }
    }

    // Support menu functionality
    function toggleSupportMenu(e) {
      e.stopPropagation();
      if (supportMenuDropdown) {
        var isVisible = supportMenuDropdown.style.display === 'block';
        supportMenuDropdown.style.display = isVisible ? 'none' : 'block';
      }
    }

    function handleSupportMenuAction(action) {
      if (supportMenuDropdown) {
        supportMenuDropdown.style.display = 'none';
      }
      
      switch(action) {
        case 'my-tickets':
          showTicketHistory();
          break;
        case 'live-agent':
          handleQuickActionByText('Live Agent');
          break;
        case 'screen-share':
          initiateScreenShare();
          break;
        case 'knowledge-base':
          openKnowledgeBase();
          break;
      }
    }

    // File upload functionality
    function handleFileUpload(event) {
      var files = event.target.files || event.dataTransfer.files;
      if (files && files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            addMessage("⚠️ File too large. Maximum size is 10MB.", false);
            continue;
          }
          
          var fileName = file.name;
          var fileSize = formatFileSize(file.size);
          addMessage("📎 **File Uploaded**: " + fileName + " (" + fileSize + ")\n\n✅ File successfully attached to your support request.", false);
        }
      }
    }

    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      var k = 1024;
      var sizes = ['Bytes', 'KB', 'MB', 'GB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Voice recording functionality
    function toggleVoiceRecording() {
      if (!isRecording) {
        startVoiceRecording();
      } else {
        stopVoiceRecording();
      }
    }

    function startVoiceRecording() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(function(stream) {
            isRecording = true;
            addClass(voiceBtn, 'recording');
            addMessage("🎤 **Voice recording started...** Click the voice button again to stop.", false);
          })
          .catch(function(err) {
            addMessage("❌ Unable to access microphone. Please check your browser permissions.", false);
          });
      } else {
        addMessage("❌ Voice recording not supported in your browser.", false);
      }
    }

    function stopVoiceRecording() {
      isRecording = false;
      removeClass(voiceBtn, 'recording');
      addMessage("🎵 **Voice message recorded!** Your audio message has been attached to your support request.", false);
    }

    // Ticket creation functionality
    function createSupportTicket(category, priority, description) {
      var ticketId = 'SUP-' + Math.floor(Math.random() * 10000);
      currentTicketId = ticketId;
      
      var response = aiResponses['ticket-created'];
      response.text = response.text.replace('#SUP-' + Math.floor(Math.random() * 10000), '#' + ticketId);
      
      addMessage(response.text, false);
      
      // Simulate email notification
      setTimeout(function() {
        addMessage("📧 **Email Confirmation Sent**\n\nA detailed confirmation has been sent to your registered email address with ticket details and next steps.", false);
      }, 3000);
    }

    function showTicketHistory() {
      var historyMsg = "🎫 **Your Recent Support Tickets**\n\n" +
        "**#SUP-8847** - Resolved (5 days ago)\n*Integration API timeout issues*\n\n" +
        "**#SUP-8901** - In Progress (2 days ago)\n*Billing discrepancy inquiry*\n\n" +
        "**#SUP-8923** - Open (Today)\n*Dashboard performance optimization*\n\n" +
        "Average resolution time: **4.2 hours**";
      
      addMessage(historyMsg, false, ['Create New Ticket', 'Track Latest', 'Download Reports']);
    }

    function initiateScreenShare() {
      addMessage("🖥️ **Screen Share Session**\n\n🔄 Preparing secure screen sharing connection...\n\n**Session Details:**\n• Encrypted connection established\n• Session ID: SS-" + Math.floor(Math.random() * 10000) + "\n• Support agent will join shortly\n\n*You maintain full control of what's shared*", false, ['Start Sharing', 'Audio Only', 'Cancel Session']);
    }

    function openKnowledgeBase() {
      var kbMsg = "📚 **KFSQUARE Knowledge Base**\n\n🔍 **Popular Articles:**\n• API Integration Guide\n• Troubleshooting Connection Issues\n• Data Pipeline Best Practices\n• Security & Compliance FAQ\n• Performance Optimization Tips\n\n🎯 **Video Tutorials Available**\n📱 **Mobile App Resources**";
      
      addMessage(kbMsg, false, ['API Guide', 'Troubleshooting', 'Video Tutorials', 'Security FAQ']);
    }

    // Customer satisfaction survey
    function showSatisfactionSurvey() {
      if (satisfactionShown) return;
      satisfactionShown = true;
      
      var satisfactionWidget = document.createElement('div');
      satisfactionWidget.className = 'satisfaction-widget';
      satisfactionWidget.innerHTML = 
        '<div class="satisfaction-header">' +
          '<span>⭐</span>' +
          '<span>How was your support experience?</span>' +
        '</div>' +
        '<div class="satisfaction-buttons">' +
          '<button class="satisfaction-btn" data-rating="1">😞</button>' +
          '<button class="satisfaction-btn" data-rating="2">😐</button>' +
          '<button class="satisfaction-btn" data-rating="3">🙂</button>' +
          '<button class="satisfaction-btn" data-rating="4">😊</button>' +
          '<button class="satisfaction-btn" data-rating="5">🤩</button>' +
        '</div>';
      
      chatMessages.appendChild(satisfactionWidget);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Add click handlers for satisfaction buttons
      var satisfactionBtns = satisfactionWidget.querySelectorAll('.satisfaction-btn');
      for (var i = 0; i < satisfactionBtns.length; i++) {
        addEvent(satisfactionBtns[i], 'click', function(e) {
          var rating = e.target.getAttribute('data-rating');
          handleSatisfactionRating(rating);
          satisfactionWidget.style.display = 'none';
        });
      }
    }

    function handleSatisfactionRating(rating) {
      var ratingText = '';
      if (rating >= 4) {
        ratingText = "🎉 **Thank you for the excellent rating!**\n\nWe're thrilled you had a great support experience. Your feedback helps us maintain our high service standards.";
      } else if (rating >= 3) {
        ratingText = "👍 **Thanks for your feedback!**\n\nWe appreciate your rating. Is there anything specific we could improve for next time?";
      } else {
        ratingText = "🤝 **We appreciate your honest feedback.**\n\nWe're sorry your experience wasn't perfect. A support manager will reach out within 24 hours to address your concerns.";
      }
      
      addMessage(ratingText, false, rating < 3 ? ['Callback Request', 'Email Feedback', 'Speak to Manager'] : []);
    }

    // Enhanced UI management functions
    function expandToggleButton() {
      addClass(chatToggle, 'expanded');
      setTimeout(function() {
        removeClass(chatToggle, 'expanded');
      }, 4000);
    }

    function openChat() {
      isOpen = true;
      isMinimized = false;
      chatContainer.style.display = 'flex';
      addClass(chatContainer, 'open');
      removeClass(chatContainer, 'minimized');
      hideNotification();
      
      setTimeout(function() {
        if (chatInput) chatInput.focus();
      }, 300);
      
      // Track engagement
      trackEngagement('chat_opened');
    }

    function closeChat() {
      isOpen = false;
      removeClass(chatContainer, 'open');
      setTimeout(function() {
        chatContainer.style.display = 'none';
      }, 300);
      
      // Show satisfaction survey if meaningful conversation
      if (conversationHistory.length > 4 && !satisfactionShown) {
        setTimeout(function() {
          showSatisfactionSurvey();
        }, 2000);
      }
      
      trackEngagement('chat_closed');
    }

    function minimizeChat() {
      isMinimized = !isMinimized;
      if (isMinimized) {
        addClass(chatContainer, 'minimized');
      } else {
        removeClass(chatContainer, 'minimized');
      }
      trackEngagement('chat_minimized');
    }

    // Enhanced message handling
    function addMessage(text, isUser, showQuickActions) {
      if (!chatMessages) return;
      
      messageCount++;
      var messageDiv = document.createElement('div');
      addClass(messageDiv, 'message');
      addClass(messageDiv, isUser ? 'user-message' : 'bot-message');
      
      var currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      var avatar = isUser ? '👤' : (agentConnected ? '👨‍💼' : '🤖');
      
      messageDiv.innerHTML = 
        '<div class="message-avatar">' + avatar + '</div>' +
        '<div class="message-content">' +
          '<div class="message-text">' + text.replace(/\n/g, '<br>') + '</div>' +
          '<div class="message-time">' + currentTime + '</div>' +
        '</div>';
      
      chatMessages.appendChild(messageDiv);
      
      // Enhanced quick actions with better UX
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
        
        var newQuickBtns = quickActionsDiv.querySelectorAll('.quick-btn');
        for (var i = 0; i < newQuickBtns.length; i++) {
          addEvent(newQuickBtns[i], 'click', handleQuickAction);
        }
      }
      
      // Smooth scroll to bottom
      setTimeout(function() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 100);
      
      // Add to conversation history
      conversationHistory.push({
        sender: isUser ? 'user' : 'ai',
        text: text,
        timestamp: new Date(),
        ticketId: currentTicketId
      });
    }

    function showTypingIndicator() {
      if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }

    function hideTypingIndicator() {
      if (typingIndicator) {
        typingIndicator.style.display = 'none';
      }
    }

    // Enhanced response generation with support context
    function generateResponse(userMessage) {
      var message = userMessage.toLowerCase();
      
      // Check for keyword matches with enhanced support context
      for (var keywords in keywordResponses) {
        var regex = new RegExp(keywords, 'i');
        if (regex.test(message)) {
          var responseKey = keywordResponses[keywords];
          if (aiResponses[responseKey]) {
            return aiResponses[responseKey];
          }
        }
      }
      
      // Smart default responses based on conversation context
      var defaultResponses = aiResponses.default;
      var contextualResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      
      return {
        text: contextualResponse,
        quickActions: ['Technical Support', 'Billing Help', 'Service Info', 'Live Agent']
      };
    }

    // Enhanced user message handling
    function handleUserMessage(message) {
      if (!message.trim()) return;
      
      addMessage(message, true);
      chatInput.value = '';
      updateSendButton();
      
      showTypingIndicator();
      
      // Enhanced response timing with context awareness
      var responseDelay = 1200 + Math.random() * 1800; // 1.2-3 second delay
      
      setTimeout(function() {
        hideTypingIndicator();
        var response = generateResponse(message);
        addMessage(response.text, false, response.quickActions);
      }, responseDelay);
    }

    // Enhanced quick action handling
    function handleQuickAction(e) {
      var action = e.target.getAttribute('data-action');
      var actionText = e.target.textContent;
      handleQuickActionByText(actionText);
    }

    function handleQuickActionByText(actionText) {
      addMessage(actionText, true);
      showTypingIndicator();
      
      setTimeout(function() {
        hideTypingIndicator();
        var response = getQuickActionResponse(actionText);
        addMessage(response.text, false, response.quickActions || []);
      }, 800 + Math.random() * 1200);
    }

    function getQuickActionResponse(actionText) {
      var action = actionText.toLowerCase();
      
      // Map action text to response keys
      if (action.includes('technical')) return aiResponses['technical-support'];
      if (action.includes('billing')) return aiResponses['billing-support'];
      if (action.includes('service')) return aiResponses['service-info'];
      if (action.includes('agent')) return aiResponses['live-agent'];
      if (action.includes('ticket')) return aiResponses['ticket-created'];
      
      // Default response for unmapped actions
      return {
        text: "Thank you for your selection. I'm processing your request and will provide detailed information shortly. How else can I assist you today?",
        quickActions: ['More Info', 'Create Ticket', 'Live Agent']
      };
    }

    // Enhanced utility functions
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

    // Engagement tracking
    function trackEngagement(action) {
      console.log('Support Chat Engagement:', action, {
        timestamp: new Date(),
        messageCount: messageCount,
        conversationLength: conversationHistory.length,
        ticketId: currentTicketId
      });
    }

    // Enhanced event listeners with support features
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

    // Support menu functionality
    if (supportMenuBtn) {
      addEvent(supportMenuBtn, 'click', toggleSupportMenu);
    }

    // File upload functionality
    if (attachmentBtn) {
      addEvent(attachmentBtn, 'click', function() {
        if (fileInput) fileInput.click();
      });
    }

    if (fileInput) {
      addEvent(fileInput, 'change', handleFileUpload);
    }

    // File drag and drop
    if (fileUploadArea) {
      addEvent(fileUploadArea, 'dragover', function(e) {
        e.preventDefault();
        addClass(fileUploadArea, 'dragover');
      });

      addEvent(fileUploadArea, 'dragleave', function() {
        removeClass(fileUploadArea, 'dragover');
      });

      addEvent(fileUploadArea, 'drop', function(e) {
        e.preventDefault();
        removeClass(fileUploadArea, 'dragover');
        handleFileUpload(e);
      });
    }

    // Voice recording functionality
    if (voiceBtn) {
      addEvent(voiceBtn, 'click', toggleVoiceRecording);
    }

    // Enhanced send button
    if (sendBtn) {
      addEvent(sendBtn, 'click', function() {
        if (chatInput && chatInput.value.trim()) {
          handleUserMessage(chatInput.value);
        }
      });
    }

    // Enhanced chat input
    if (chatInput) {
      addEvent(chatInput, 'input', updateSendButton);
      
      addEvent(chatInput, 'keydown', function(e) {
        if (e.keyCode === 13 && !e.shiftKey) { // Enter key
          e.preventDefault();
          if (this.value.trim()) {
            handleUserMessage(this.value);
          }
        }
        
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
          if (e.keyCode === 85) { // Ctrl+U for file upload
            e.preventDefault();
            if (fileInput) fileInput.click();
          }
        }
      });
    }

    // Enhanced emoji functionality
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

    // Support menu dropdown events
    var menuItems = document.querySelectorAll('.menu-item');
    for (var i = 0; i < menuItems.length; i++) {
      addEvent(menuItems[i], 'click', function() {
        var action = this.getAttribute('data-action');
        handleSupportMenuAction(action);
      });
    }

    // Initial quick action buttons
    var quickBtns = document.querySelectorAll('.quick-btn');
    for (var i = 0; i < quickBtns.length; i++) {
      addEvent(quickBtns[i], 'click', handleQuickAction);
    }

    // Enhanced document event listeners
    addEvent(document, 'click', function(e) {
      // Close emoji picker when clicking outside
      if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.style.display = 'none';
      }
      
      // Close support menu when clicking outside
      if (supportMenuDropdown && !supportMenuDropdown.contains(e.target) && 
          e.target !== supportMenuBtn) {
        supportMenuDropdown.style.display = 'none';
      }
      
      // Optional: Close chat when clicking outside
      if (isOpen && !chatWidget.contains(e.target)) {
        // Uncomment to enable: closeChat();
      }
    });

    // Support ticket modal events
    var ticketModal = document.querySelector('.support-ticket-modal');
    var modalClose = document.querySelector('.modal-close');
    var ticketForm = document.querySelector('#ticket-form');

    if (modalClose) {
      addEvent(modalClose, 'click', function() {
        if (ticketModal) ticketModal.style.display = 'none';
      });
    }

    if (ticketForm) {
      addEvent(ticketForm, 'submit', function(e) {
        e.preventDefault();
        var category = document.querySelector('#ticket-category').value;
        var priority = document.querySelector('#ticket-priority').value;
        var description = document.querySelector('#ticket-description').value;
        
        if (description.trim()) {
          createSupportTicket(category, priority, description);
          ticketModal.style.display = 'none';
          ticketForm.reset();
        }
      });
    }

    // Enhanced keyboard shortcuts
    addEvent(document, 'keydown', function(e) {
      // Ctrl/Cmd + Shift + C to toggle chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        if (isOpen) {
          closeChat();
        } else {
          openChat();
        }
      }
      
      // Escape key to close chat
      if (e.keyCode === 27 && isOpen) {
        closeChat();
      }
    });

    // Initialize enhanced chat system
    initChat();
    updateSendButton();
    
    // Show welcome message after a brief delay
    setTimeout(function() {
      if (!isOpen) {
        expandToggleButton();
      }
    }, 5000);
  }

  // Initialize when DOM is ready
  domReady(init);

})();
