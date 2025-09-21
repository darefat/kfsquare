const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { body, validationResult } = require('express-validator');

// Get all contacts (admin only - would need authentication in production)
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      serviceInterest,
      limit = 50,
      skip = 0,
      sort = '-createdAt'
    } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (serviceInterest) filter.serviceInterest = serviceInterest;

    const contacts = await Contact
      .find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-userAgent -ipAddress') // Don't include sensitive data
      .lean();

    const totalCount = await Contact.countDocuments(filter);

    // Generate statistics
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          newContacts: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          qualified: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
          avgResponseTime: { $avg: '$contactAge' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: totalCount > parseInt(skip) + parseInt(limit)
        },
        stats: stats[0] || {
          total: 0,
          newContacts: 0,
          qualified: 0,
          avgResponseTime: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new contact (public endpoint)
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().isLength({ min: 10, max: 1000 }).escape(),
  body('phone').optional().trim().escape(),
  body('company').optional().trim().isLength({ max: 100 }).escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Add metadata
    const contactData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      source: 'website'
    };

    const contact = new Contact(contactData);
    await contact.save();

    // Don't return sensitive information
    const publicContact = {
      _id: contact._id,
      name: contact.name,
      email: contact.email,
      message: contact.message,
      createdAt: contact.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Contact submitted successfully',
      data: publicContact
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get contact by ID (admin only)
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update contact status (admin only)
router.patch('/:id/status', [
  body('status').isIn(['new', 'contacted', 'qualified', 'proposal', 'converted', 'closed']),
  body('notes').optional().trim().isLength({ max: 2000 }).escape(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get contact statistics (admin only)
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          totalContacts: { $sum: 1 },
          newContacts: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          qualifiedContacts: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
          convertedContacts: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      }
    ]);

    const serviceInterestStats = await Contact.aggregate([
      { $group: { _id: '$serviceInterest', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const monthlyStats = await Contact.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {},
        serviceInterest: serviceInterestStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching contact statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
