const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const { body, validationResult } = require('express-validator');

// Get all team members
router.get('/', async (req, res) => {
  try {
    const { category, department, active = 'true' } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (active) filter.isActive = active === 'true';

    const teamMembers = await TeamMember
      .find(filter)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    // Group by category for easier frontend consumption
    const groupedTeam = teamMembers.reduce((acc, member) => {
      const category = member.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(member);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        all: teamMembers,
        grouped: groupedTeam,
        stats: {
          total: teamMembers.length,
          leadership: teamMembers.filter(m => m.category === 'leadership').length,
          core: teamMembers.filter(m => m.category === 'core').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team members',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get team member by ID
router.get('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new team member (admin only - would need authentication in production)
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('title').trim().isLength({ min: 2, max: 200 }).escape(),
  body('bio').trim().isLength({ min: 10, max: 1000 }).escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('department').isIn(['research', 'engineering', 'analytics', 'consulting', 'management']),
  body('category').optional().isIn(['leadership', 'core', 'consultant', 'analyst'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const teamMember = new TeamMember(req.body);
    await teamMember.save();

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: teamMember
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update team member (admin only - would need authentication in production)
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).escape(),
  body('title').optional().trim().isLength({ min: 2, max: 200 }).escape(),
  body('bio').optional().trim().isLength({ min: 10, max: 1000 }).escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('department').optional().isIn(['research', 'engineering', 'analytics', 'consulting', 'management']),
  body('category').optional().isIn(['leadership', 'core', 'consultant', 'analyst'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: teamMember
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete team member (admin only - would need authentication in production)
router.delete('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndDelete(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting team member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
