const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { body, validationResult } = require('express-validator');

// Get all services
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      availability, 
      featured, 
      active = 'true',
      search,
      sort = 'displayOrder'
    } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (availability) filter.availability = availability;
    if (featured !== undefined) filter.isFeatured = featured === 'true';
    if (active) filter.isActive = active === 'true';
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Define sort options
    let sortOption = {};
    switch (sort) {
      case 'popularity':
        sortOption = { popularity: -1, displayOrder: 1 };
        break;
      case 'availability':
        sortOption = { availability: 1, displayOrder: 1 };
        break;
      case 'alphabetical':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { displayOrder: 1, createdAt: 1 };
    }

    const services = await Service
      .find(filter)
      .sort(sortOption)
      .lean();

    // Group by category for easier frontend consumption
    const groupedServices = services.reduce((acc, service) => {
      const category = service.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        all: services,
        grouped: groupedServices,
        stats: {
          total: services.length,
          available: services.filter(s => s.availability === 'available').length,
          featured: services.filter(s => s.isFeatured).length,
          categories: Object.keys(groupedServices).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get services by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { active = 'true', sort = 'displayOrder' } = req.query;
    
    let filter = { category };
    if (active) filter.isActive = active === 'true';

    let sortOption = {};
    switch (sort) {
      case 'popularity':
        sortOption = { popularity: -1, displayOrder: 1 };
        break;
      case 'alphabetical':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { displayOrder: 1, createdAt: 1 };
    }

    const services = await Service
      .find(filter)
      .sort(sortOption)
      .lean();

    res.json({
      success: true,
      data: {
        category,
        services,
        count: services.length
      }
    });
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services by category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new service (admin only)
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('shortDescription').trim().isLength({ min: 10, max: 200 }).escape(),
  body('fullDescription').trim().isLength({ min: 20, max: 1000 }).escape(),
  body('category').isIn(['foundation', 'analytics', 'ai', 'governance'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const service = new Service(req.body);
    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update service (admin only)
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).escape(),
  body('shortDescription').optional().trim().isLength({ min: 10, max: 200 }).escape(),
  body('fullDescription').optional().trim().isLength({ min: 20, max: 1000 }).escape(),
  body('category').optional().isIn(['foundation', 'analytics', 'ai', 'governance'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete service (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
