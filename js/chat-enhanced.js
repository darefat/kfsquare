/**
 * Dynamic Chat API Client
 * Handles real-time chat interactions with MongoDB backend
 */
class ChatAPI {
  constructor() {
    this.baseUrl = '/api/chat';
    this.sessionId = this.generateSessionId();
    this.userInfo = {};
    this.isOnline = navigator.onLine;
    this.messageQueue = [];
    
    // Set up offline handling
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processMessageQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Generate unique session ID for conversation tracking
   */
  generateSessionId() {
    const stored = localStorage.getItem('kfsquare_chat_session');
    if (stored) return stored;
    
    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('kfsquare_chat_session', sessionId);
    return sessionId;
  }

  /**
   * Set user information for personalized support
   */
  setUserInfo(info) {
    this.userInfo = { ...this.userInfo, ...info };
    localStorage.setItem('kfsquare_chat_user', JSON.stringify(this.userInfo));
  }

  /**
   * Get stored user information
   */
  getUserInfo() {
    const stored = localStorage.getItem('kfsquare_chat_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  /**
   * Send message to chat API
   */
  async sendMessage(message) {
    const messageData = {
      message: message.trim(),
      userInfo: this.getUserInfo(),
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    // If offline, queue the message
    if (!this.isOnline) {
      this.messageQueue.push(messageData);
      return {
        success: false,
        offline: true,
        response: {
          message: "🔄 **Connection Issue**\\n\\nI'm having trouble connecting to our servers. Your message has been queued and will be sent automatically when the connection is restored.\\n\\nIn the meantime, you can still browse our services or try refreshing the page.",
          type: 'offline',
          quickActions: ['Refresh Page', 'Browse Services', 'Try Again']
        }
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      return data;
    } catch (error) {
      console.error('Chat API Error:', error);
      
      // Return fallback response for errors
      return {
        success: false,
        response: {
          message: `⚠️ **Temporary Service Issue**\\n\\nI'm experiencing a temporary connection issue. Please try again in a moment, or choose from these options:\\n\\n• 📧 **Email us**: contact@kfsquare.com\\n• 📞 **Call us**: +1-555-0123\\n• 💬 **Try again** in a few seconds`,
          type: 'error',
          quickActions: ['Try Again', 'Send Email', 'Call Us', 'Browse Services']
        }
      };
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory() {
    try {
      const response = await fetch(`${this.baseUrl}/conversation/${this.sessionId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get conversation');
      }

      return data.conversations || [];
    } catch (error) {
      console.error('Get conversation error:', error);
      return [];
    }
  }

  /**
   * Create support ticket
   */
  async createSupportTicket(ticketData) {
    const requestData = {
      ...ticketData,
      userInfo: this.getUserInfo(),
      sessionId: this.sessionId
    };

    try {
      const response = await fetch(`${this.baseUrl}/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ticket');
      }

      return data;
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error;
    }
  }

  /**
   * Process queued messages when back online
   */
  async processMessageQueue() {
    if (this.messageQueue.length === 0) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      try {
        await this.sendMessage(message.message);
      } catch (error) {
        console.error('Failed to send queued message:', error);
        // Re-queue failed messages
        this.messageQueue.push(message);
      }
    }
  }

  /**
   * Get chat statistics and insights
   */
  async getChatStats() {
    try {
      const response = await fetch(`${this.baseUrl}/stats/${this.sessionId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Get chat stats error:', error);
    }
    return null;
  }

  /**
   * Reset chat session (for testing or user logout)
   */
  resetSession() {
    localStorage.removeItem('kfsquare_chat_session');
    localStorage.removeItem('kfsquare_chat_user');
    this.sessionId = this.generateSessionId();
    this.userInfo = {};
    this.messageQueue = [];
  }
}

/**
 * Enhanced Chat Widget Manager
 * Integrates with MongoDB backend and provides rich chat experience
 */
class EnhancedChatWidget {
  constructor() {
    this.api = new ChatAPI();
    this.isInitialized = false;
    this.currentConversation = [];
    this.isTyping = false;
    this.autoResponses = true;
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeWidget());
    } else {
      this.initializeWidget();
    }
  }

  initializeWidget() {
    this.elements = {
      widget: document.getElementById('chat-widget'),
      toggle: document.getElementById('chat-toggle'),
      container: document.getElementById('chat-container'),
      messages: document.getElementById('chat-messages'),
      input: document.getElementById('chat-input'),
      sendBtn: document.getElementById('send-btn'),
      typingIndicator: document.getElementById('typing-indicator')
    };

    if (!this.elements.widget) {
      console.warn('Chat widget not found in DOM');
      return;
    }

    this.bindEvents();
    this.loadConversationHistory();
    this.showWelcomeMessage();
    this.isInitialized = true;

    console.log('✅ Enhanced Chat Widget initialized with MongoDB backend');
  }

  bindEvents() {
    // Send message on button click or Enter key
    if (this.elements.sendBtn) {
      this.elements.sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    if (this.elements.input) {
      this.elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });

      // Show typing indicator
      this.elements.input.addEventListener('input', () => this.handleTyping());
    }

    // Quick action buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-btn')) {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      }
    });
  }

  async handleSendMessage() {
    const message = this.elements.input?.value?.trim();
    if (!message) return;

    // Clear input and show user message
    this.elements.input.value = '';
    this.addUserMessage(message);

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Send to backend
      const result = await this.api.sendMessage(message);
      
      // Hide typing indicator
      this.hideTypingIndicator();

      if (result.success || result.offline) {
        this.addBotMessage(
          result.response.message,
          result.response.type,
          result.response.quickActions
        );
      } else {
        this.addBotMessage(
          "I apologize for the inconvenience. Please try again or contact our support team directly.",
          'error',
          ['Try Again', 'Contact Support']
        );
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addBotMessage(
        "I'm experiencing technical difficulties. Please try again later.",
        'error',
        ['Try Again', 'Contact Support']
      );
    }
  }

  addUserMessage(message) {
    const messageDiv = this.createMessageElement(message, 'user');
    this.elements.messages?.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addBotMessage(message, type = 'text', quickActions = []) {
    const messageDiv = this.createMessageElement(message, 'bot', type);
    
    // Add quick action buttons if provided
    if (quickActions && quickActions.length > 0) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'quick-actions';
      
      quickActions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'quick-btn';
        button.textContent = action;
        button.dataset.action = action.toLowerCase().replace(/\\s+/g, '-');
        actionsDiv.appendChild(button);
      });
      
      messageDiv.appendChild(actionsDiv);
    }
    
    this.elements.messages?.appendChild(messageDiv);
    this.scrollToBottom();
  }

  createMessageElement(message, sender, type = 'text') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🎯';

    const content = document.createElement('div');
    content.className = 'message-content';

    const text = document.createElement('div');
    text.className = 'message-text';
    
    // Support markdown-style formatting
    text.innerHTML = message
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
      .replace(/\\n/g, '<br>');

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    content.appendChild(text);
    content.appendChild(time);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    return messageDiv;
  }

  handleQuickAction(action) {
    const actionMap = {
      'technical-support': 'I need technical support',
      'billing-help': 'I have billing questions',
      'service-info': 'Tell me about your services',
      'live-agent': 'I want to speak to a live agent',
      'try-again': 'Please try again',
      'contact-support': 'I need to contact support',
      'send-email': 'I want to send an email',
      'browse-services': 'Show me your services'
    };

    const message = actionMap[action] || action;
    this.elements.input.value = message;
    this.handleSendMessage();
  }

  showTypingIndicator() {
    if (this.elements.typingIndicator) {
      this.elements.typingIndicator.style.display = 'flex';
      this.scrollToBottom();
    }
  }

  hideTypingIndicator() {
    if (this.elements.typingIndicator) {
      this.elements.typingIndicator.style.display = 'none';
    }
  }

  scrollToBottom() {
    if (this.elements.messages) {
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }
  }

  async loadConversationHistory() {
    try {
      const history = await this.api.getConversationHistory();
      // Load previous messages if any
      // Implementation depends on UI requirements
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }

  showWelcomeMessage() {
    // Welcome message is already in HTML, but we can enhance it
    setTimeout(() => {
      if (this.elements.messages && this.elements.messages.children.length === 0) {
        this.addBotMessage(
          "👋 **Welcome to KFSQUARE Customer Support!**\\n\\nI'm your AI assistant, ready to help with:\\n• 🛠️ Technical troubleshooting\\n• 💳 Billing & account questions\\n• ℹ️ Service information\\n• 👨‍💼 Live agent connection\\n\\nHow can I assist you today?",
          'welcome',
          ['Technical Support', 'Billing Help', 'Service Info', 'Live Agent']
        );
      }
    }, 1000);
  }

  handleTyping() {
    // Could implement typing indicators for both sides
  }
}

// Initialize the enhanced chat widget when the page loads
if (typeof window !== 'undefined') {
  window.enhancedChat = new EnhancedChatWidget();
  
  // Expose API for external use
  window.ChatAPI = ChatAPI;
  
  console.log('🚀 KFSQUARE Enhanced Chat System loaded');
}
