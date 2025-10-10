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
    
    // Enhanced contact form handler with email/MongoDB functionality
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(this);
                const response = await fetch('/submit-contact', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    showAlert('success', result.message);
                    this.reset(); // Clear form
                } else {
                    showAlert('error', result.error || 'Failed to send message');
                }
                
            } catch (error) {
                console.error('Error:', error);
                showAlert('error', 'Network error. Please try again.');
            } finally {
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Alert system for user feedback
    function showAlert(type, message) {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at top of contact section or form
        const contactSection = document.getElementById('contact');
        const contactForm = document.getElementById('contact-form');
        let container;
        
        if (contactSection) {
            container = contactSection.querySelector('.container');
        } else if (contactForm) {
            container = contactForm.parentElement;
        }
        
        if (container) {
            container.insertBefore(alert, container.firstChild);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }
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

  // Utility function to check if element is in viewport
  function isElementInViewport(element) {
    var rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Animate number utility
  function animateNumber(element, start, end, duration) {
    var startTime = Date.now();
    var change = end - start;

    function update() {
      var now = Date.now();
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      
      var current = Math.floor(start + change * progress);
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    update();
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

  // Enhanced Contact Form Functionality with Mailgun and MongoDB integration
  function initContactForm() {
    var form = document.querySelector('#contact-form');
    if (!form) return;

    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('#submit-btn');
    var originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    var messageField = document.getElementById('message');
    var charCount = document.getElementById('char-count');

    // Character counter for message field
    if (messageField && charCount) {
      messageField.addEventListener('input', function() {
        var count = this.value.length;
        charCount.textContent = count;
        
        if (count > 2000) {
          charCount.parentElement.classList.add('text-danger');
        } else {
          charCount.parentElement.classList.remove('text-danger');
        }
      });
    }

    // Ensure a status region exists for accessibility feedback
    if (!status) {
      status = document.createElement('div');
      status.id = 'form-status';
      status.className = 'mt-3 text-muted d-none';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      form.insertBefore(status, form.firstChild);
    }

    function setSubmitting(state) {
      if (!submitBtn) return;
      submitBtn.disabled = !!state;
      submitBtn.innerHTML = state ? 
        '<i class="fas fa-spinner fa-spin me-2"></i>Sending...' : 
        originalBtnText;
    }

    function showStatus(message, type) {
      if (!status) return;
      
      var alertClass = type === 'error' ? 'alert-danger' : 
                       type === 'success' ? 'alert-success' : 'alert-info';
      
      status.className = 'alert ' + alertClass + ' alert-dismissible fade show mb-3';
      status.innerHTML = message + 
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
      status.classList.remove('d-none');
      
      // Scroll to status message
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      if (type === 'success') {
        setTimeout(function() {
          if (status) {
            status.classList.add('d-none');
          }
        }, 10000);
      }
    }

    function validateField(field) {
      var isValid = true;
      var value = field.value.trim();
      
      // Remove existing validation classes
      field.classList.remove('is-valid', 'is-invalid');
      
      if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        isValid = false;
      } else if (field.type === 'email' && value) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          field.classList.add('is-invalid');
          isValid = false;
        } else {
          field.classList.add('is-valid');
        }
      } else if (field.hasAttribute('minlength')) {
        var minLength = parseInt(field.getAttribute('minlength'));
        if (value.length < minLength) {
          field.classList.add('is-invalid');
          isValid = false;
        } else {
          field.classList.add('is-valid');
        }
      } else if (value && field.hasAttribute('required')) {
        field.classList.add('is-valid');
      }
      
      return isValid;
    }

    function validateForm() {
      var formData = getFormData();
      var isValid = true;
      
      // Honeypot check
      if (formData.website) {
        showStatus('⚠️ Invalid submission detected. Please try again.', 'error');
        return false;
      }
      
      // Validate all form fields
      var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
      for (var i = 0; i < fields.length; i++) {
        if (!validateField(fields[i])) {
          isValid = false;
        }
      }
      
      // Additional validations
      if (!formData.name || formData.name.length < 2) {
        showStatus('❌ Please provide your full name (minimum 2 characters).', 'error');
        isValid = false;
      }
      
      if (!formData.email) {
        showStatus('❌ Please provide a valid email address.', 'error');
        isValid = false;
      }
      
      if (!formData.message || formData.message.length < 10) {
        showStatus('❌ Please provide a detailed message (minimum 10 characters).', 'error');
        isValid = false;
      }
      
      if (formData.message && formData.message.length > 2000) {
        showStatus('❌ Message is too long. Please keep it under 2000 characters.', 'error');
        isValid = false;
      }
      
      return isValid;
    }

    function getFormData() {
      return {
        name: (form.name && form.name.value.trim()) || '',
        email: (form.email && form.email.value.trim()) || '',
        phone: (form.phone && form.phone.value.trim()) || '',
        company: (form.company && form.company.value.trim()) || '',
        serviceInterest: (form.serviceInterest && form.serviceInterest.value) || '',
        message: (form.message && form.message.value.trim()) || '',
        website: (form.website && form.website.value) || '' // honeypot
      };
    }

    function fallbackMailto(data) {
      try {
        var subject = 'Contact Form Submission from ' + data.name;
        var body = 'Name: ' + data.name + '\n' +
                   'Email: ' + data.email + '\n' +
                   (data.phone ? ('Phone: ' + data.phone + '\n') : '') +
                   (data.company ? ('Company: ' + data.company + '\n') : '') +
                   'Service Interest: ' + (data.serviceInterest || 'other') + '\n\n' +
                   'Message:\n' + data.message;
        
        var link = 'mailto:customersupport@kfsquare.com?subject=' + 
                   encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        
        window.location.href = link;
        showStatus('📧 Your email client has been opened. Please send the message from there.', 'info');
      } catch (e) {
        showStatus('❌ Unable to process your request. Please contact us directly at <a href="mailto:customersupport@kfsquare.com">customersupport@kfsquare.com</a> or call <a href="tel:+14109347470">410-934-7470</a>.', 'error');
      }
    }

    // Form submission handler with Mailgun/MongoDB integration
    form.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // Clear previous status
      if (status) {
        status.classList.add('d-none');
      }

      var formData = getFormData();

      // Validate form
      if (!validateForm()) {
        return;
      }

      setSubmitting(true);
      showStatus('📤 Sending your message...', 'info');

      try {
        // Submit to backend API with Mailgun/MongoDB integration
        const response = await fetch('/api/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          showStatus('✅ <strong>Message Sent Successfully!</strong><br>Thank you ' + formData.name + '! We\'ve received your inquiry about <strong>' + (formData.serviceInterest || 'our services') + '</strong>.<br>📧 A confirmation has been sent to <strong>' + formData.email + '</strong><br>⏰ Our team will respond within 24 hours.', 'success');
          
          // Clear form
          form.reset();
          
          // Remove validation classes
          var fields = form.querySelectorAll('.is-valid, .is-invalid');
          for (var i = 0; i < fields.length; i++) {
            fields[i].classList.remove('is-valid', 'is-invalid');
          }
          
          // Reset character counter
          if (charCount) {
            charCount.textContent = '0';
          }
          
          // Analytics tracking
          if (window.gtag) {
            gtag('event', 'form_submit', {
              event_category: 'Contact',
              event_label: 'Contact Form Success',
              value: 1
            });
          }
          
        } else {
          throw new Error(result.message || result.error || 'Server error occurred');
        }
        
      } catch (error) {
        console.error('Contact form submission error:', error);
        
        // Handle different error types
        if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('NetworkError')) {
          showStatus('🔄 <strong>Connection Issue:</strong> Unable to connect to server. Opening your email client as backup...', 'info');
          setTimeout(() => fallbackMailto(formData), 2000);
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          showStatus('⏱️ <strong>Rate Limit:</strong> Too many requests. Please wait a moment before trying again.', 'error');
        } else if (error.message.includes('validation')) {
          showStatus('❌ <strong>Validation Error:</strong> Please check your input and try again.', 'error');
        } else {
          showStatus('❌ <strong>Error:</strong> ' + error.message + '<br>Please try again or contact us directly at <a href="mailto:customersupport@kfsquare.com">customersupport@kfsquare.com</a>', 'error');
        }
        
        // Analytics tracking for errors
        if (window.gtag) {
          gtag('event', 'form_error', {
            event_category: 'Contact',
            event_label: error.message,
            value: 0
          });
        }
        
      } finally {
        setSubmitting(false);
      }
    });

    // Real-time validation
    var emailInput = form.querySelector('#email');
    var nameInput = form.querySelector('#name');
    var messageInput = form.querySelector('#message');

    if (emailInput) {
      emailInput.addEventListener('blur', function() {
        if (this.value.trim()) {
          validateField(this);
        }
      });

      emailInput.addEventListener('input', function() {
        // Remove invalid class while typing
        this.classList.remove('is-invalid');
      });
    }

    if (nameInput) {
      nameInput.addEventListener('blur', function() {
        if (this.value.trim()) {
          validateField(this);
        }
      });
    }

    if (messageInput) {
      messageInput.addEventListener('blur', function() {
        if (this.value.trim()) {
          validateField(this);
        }
      });
    }

    // Prevent form submission on Enter key in text inputs (except textarea)
    var textInputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    for (var i = 0; i < textInputs.length; i++) {
      textInputs[i].addEventListener('keydown', function(e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          var nextField = this.closest('.row').nextElementSibling || this.parentElement.nextElementSibling;
          if (nextField) {
            var nextInput = nextField.querySelector('input, select, textarea');
            if (nextInput) {
              nextInput.focus();
            }
          }
        }
      });
    }

    // Add honeypot field if missing
    if (!form.querySelector('#website')) {
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
    var notificationBadge = document.getElementById('chat-notification');
    
    var isOpen = false;
    var isMinimized = false;
    var messageCount = 0;
    var conversationHistory = [];
    var currentTicketId = null;
    var agentConnected = false;
    var satisfactionShown = false;
    var supportOnline = true;
    
    if (!chatWidget) return;

    // Enhanced AI responses for customer support
    var aiResponses = {
      'technical-support': {
        text: "🛠️ **Technical Support Center**\n\nI can help you with:\n• **System Issues & Troubleshooting**\n• **Integration Problems**\n• **Performance Optimization**\n• **API Documentation & Setup**\n• **Data Pipeline Issues**\n• **Platform Configuration**\n\nWhat technical issue are you experiencing?",
        quickActions: ['System Down', 'Integration Help', 'Performance Issues', 'Create Ticket']
      },
      'billing-support': {
        text: "💳 **Billing & Account Support**\n\nI can assist with:\n• **Invoice Questions & Payment Issues**\n• **Subscription Management**\n• **Usage Reports & Analytics**\n• **Plan Upgrades & Changes**\n• **Refund Requests**\n• **Enterprise Pricing**\n\nWhat billing question do you have?",
        quickActions: ['View Invoice', 'Payment Issue', 'Upgrade Plan', 'Billing Ticket']
      },
      'service-info': {
        text: "ℹ️ **Service Information Hub**\n\nLearn about our comprehensive offerings:\n• **Data Engineering & ETL Pipelines**\n• **Advanced Analytics & ML Models**\n• **Real-time Data Processing**\n• **AI Integration & LLM Solutions**\n• **Business Intelligence Dashboards**\n• **Data Security & Compliance**\n\nWhich service would you like to explore?",
        quickActions: ['Data Engineering', 'AI Solutions', 'Analytics', 'Security']
      },
      'live-agent': {
        text: "👨‍💼 **Live Agent Connection**\n\n**Connecting you to our expert support team...**\n\n**Current Queue Status**: 2 people ahead\n**Estimated Wait Time**: 3-5 minutes\n**Agent Specialty**: Technical & Billing Support\n\nWhile you wait, feel free to describe your issue in detail. This will help our agent assist you faster.",
        quickActions: ['Describe Issue', 'Upload Files', 'Cancel Request']
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
      'agent|human|person|representative|speak to someone|live chat': 'live-agent'
    };

    // Initialize enhanced chat with support features
    function initChat() {
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
      // Update notification text if needed
    }

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
    }

    function closeChat() {
      isOpen = false;
      removeClass(chatContainer, 'open');
      setTimeout(function() {
        chatContainer.style.display = 'none';
      }, 300);
    }

    function minimizeChat() {
      isMinimized = !isMinimized;
      if (isMinimized) {
        addClass(chatContainer, 'minimized');
      } else {
        removeClass(chatContainer, 'minimized');
      }
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
      
      // Default response for unmapped actions
      return {
        text: "Thank you for your selection. I'm processing your request and will provide detailed information shortly. How else can I assist you today?",
        quickActions: ['More Info', 'Create Ticket', 'Live Agent']
      };
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
      addEvent(chatInput, 'keydown', function(e) {
        if (e.keyCode === 13 && !e.shiftKey) { // Enter key
          e.preventDefault();
          if (this.value.trim()) {
            handleUserMessage(this.value);
          }
        }
      });
    }

    // Initialize enhanced chat system
    initChat();
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

  // Placeholder functions for other features (can be expanded later)
  function initDynamicPortfolio() {
    // Portfolio functionality placeholder
  }

  function initAnalyticsEnhancements() {
    // Analytics enhancements placeholder
  }

  function initGovernanceEnhancements() {
    // Governance enhancements placeholder
  }

  function initValuesPortfolio() {
    // Values portfolio functionality placeholder
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

  // Initialize when DOM is ready
  domReady(init);

})();