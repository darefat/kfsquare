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

  function removeEvent(element, event, handler) {
    if (element.removeEventListener) {
      element.removeEventListener(event, handler, false);
    } else if (element.detachEvent) {
      element.detachEvent('on' + event, handler);
    } else {
      element['on' + event] = null;
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

  // Initialize when DOM is ready
  domReady(init);

})();
