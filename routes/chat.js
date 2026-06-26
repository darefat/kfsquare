const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

/**
 * @route POST /api/chat/message
 * @desc Handle chat messages and store conversations
 * @access Public
 */
router.post('/message', async (req, res) => {
  try {
    const { message, userInfo, sessionId } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // Generate response based on message content
    const aiResponse = generateResponse(message);
    
    // Store conversation in database
    const conversation = new Contact({
      name: userInfo?.name || 'Anonymous User',
      email: userInfo?.email || `anonymous_${sessionId}@chat.local`,
      phone: userInfo?.phone || '',
      company: userInfo?.company || '',
      message: message,
      source: 'chat_widget',
      metadata: {
        sessionId,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date(),
        messageType: 'user_message'
      }
    });

    await conversation.save();

    // Store bot response as well
    if (aiResponse.message) {
      const botConversation = new Contact({
        name: 'KFSQUARE Support Bot',
        email: 'support@kfsquare.com',
        message: aiResponse.message,
        source: 'chat_ai_response',
        metadata: {
          sessionId,
          responseType: aiResponse.type,
          quickActions: aiResponse.quickActions,
          timestamp: new Date(),
          messageType: 'bot_response',
          parentMessageId: conversation._id
        }
      });

      await botConversation.save();
    }

    res.json({
      success: true,
      response: {
        message: aiResponse.message,
        type: aiResponse.type,
        quickActions: aiResponse.quickActions,
        timestamp: new Date().toISOString(),
        messageId: conversation._id
      }
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message'
    });
  }
});

/**
 * @route GET /api/chat/conversation/:sessionId
 * @desc Get conversation history for a session
 * @access Public
 */
router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const conversations = await Contact.find({
      'metadata.sessionId': sessionId,
      source: { $in: ['chat_widget', 'chat_bot_response'] }
    })
    .sort({ createdAt: 1 })
    .select('name message source metadata createdAt')
    .limit(100);

    res.json({
      success: true,
      conversations: conversations.map(conv => ({
        id: conv._id,
        message: conv.message,
        sender: conv.name,
        isAI: conv.source === 'chat_bot_response',
        timestamp: conv.createdAt,
        type: conv.metadata?.responseType || 'text',
        quickActions: conv.metadata?.quickActions || []
      }))
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation history'
    });
  }
});

/**
 * @route POST /api/chat/ticket
 * @desc Create a support ticket from chat
 * @access Public
 */
router.post('/ticket', async (req, res) => {
  try {
    const { 
      subject, 
      description, 
      priority = 'medium',
      category = 'technical',
      userInfo,
      sessionId 
    } = req.body;
    
    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Subject and description are required'
      });
    }

    // Generate ticket ID
    const ticketId = `SUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const ticket = new Contact({
      name: userInfo?.name || 'Anonymous User',
      email: userInfo?.email || `anonymous_${sessionId}@chat.local`,
      phone: userInfo?.phone || '',
      company: userInfo?.company || '',
      message: `[SUPPORT TICKET]\nSubject: ${subject}\n\nDescription:\n${description}`,
      source: 'chat_support_ticket',
      metadata: {
        sessionId,
        ticketId,
        priority,
        category,
        status: 'open',
        createdAt: new Date(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    });

    await ticket.save();

    res.json({
      success: true,
      ticket: {
        id: ticketId,
        status: 'created',
        priority,
        category,
        estimatedResponse: getEstimatedResponseTime(priority),
        message: 'Support ticket created successfully. You will receive updates via email.'
      }
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create support ticket'
    });
  }
});

/**
 * Generate a response based on message content
 */
function generateResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  const responses = {
    'technical-support': {
      message: "Technical Support\n\nI can help you with:\n- System Issues & Troubleshooting\n- Integration Problems\n- Performance Optimization\n- API Documentation & Setup\n- Data Pipeline Issues\n- Platform Configuration\n\nWhat technical issue are you experiencing?",
      type: 'support_menu',
      quickActions: ['System Down', 'Integration Help', 'Performance Issues', 'Create Ticket']
    },
    'billing-support': {
      message: "Billing & Account Support\n\nI can assist with:\n- Invoice Questions & Payment Issues\n- Subscription Management\n- Usage Reports & Analytics\n- Plan Upgrades & Changes\n- Refund Requests\n- Enterprise Pricing\n\nWhat billing question do you have?",
      type: 'support_menu',
      quickActions: ['View Invoice', 'Payment Issue', 'Upgrade Plan', 'Billing Ticket']
    },
    'service-info': {
      message: "Service Information\n\nLearn about our comprehensive offerings:\n- Data Engineering & ETL Pipelines\n- Advanced Analytics & ML Models\n- Real-time Data Processing\n- AI Integration & LLM Solutions\n- Business Intelligence Dashboards\n- Data Security & Compliance\n\nWhich service would you like to explore?",
      type: 'service_menu',
      quickActions: ['Data Engineering', 'AI Solutions', 'Analytics', 'Security']
    },
    'live-agent': {
      message: "Connecting you to our support team...\n\nCurrent Queue Status: 1-2 people ahead\nEstimated Wait Time: 2-4 minutes\nAgent Specialty: Technical & Billing Support\n\nWhile you wait, please describe your issue in detail to help our agent assist you faster.",
      type: 'agent_transfer',
      quickActions: ['Describe Issue', 'Upload Files', 'Cancel Request']
    },
    'default': {
      message: "Thank you for contacting KFSQUARE. I can help with:\n\n- Technical Support - System issues, troubleshooting\n- Billing Questions - Payments, subscriptions, invoices\n- Service Information - Learn about our offerings\n- Live Agent - Connect with our expert team\n\nHow can I assist you today?",
      type: 'welcome',
      quickActions: ['Technical Support', 'Billing Help', 'Service Info', 'Live Agent']
    }
  };

  // Enhanced keyword detection
  const keywords = {
    'technical|tech|bug|error|issue|problem|broken|not working|down|system|api|integration': 'technical-support',
    'billing|payment|invoice|charge|subscription|price|refund|upgrade|account|plan': 'billing-support',
    'service|services|what do you do|features|capabilities|offerings|solutions': 'service-info',
    'agent|human|person|representative|speak to someone|live chat|talk to someone': 'live-agent',
    'hello|hi|hey|good morning|good afternoon|help|support|start': 'default'
  };

  // Find matching response
  for (const [pattern, responseType] of Object.entries(keywords)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lowerMessage)) {
      return responses[responseType];
    }
  }

  // Default fallback response
  return {
    message: `You asked about "${message}". Please select a support option below:\n\n- Technical Support: for system or integration issues\n- Billing Help: for payments or subscriptions\n- Service Info: for information about our offerings\n- Live Agent: to speak with a team member`,
    type: 'clarification',
    quickActions: ['Technical Support', 'Billing Help', 'Service Info', 'Live Agent']
  };
}

/**
 * Get estimated response time based on priority
 */
function getEstimatedResponseTime(priority) {
  const times = {
    'urgent': '< 1 hour',
    'high': '2-4 hours',
    'medium': '4-8 hours',
    'low': '8-24 hours'
  };
  return times[priority] || times['medium'];
}

module.exports = router;
