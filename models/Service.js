const mongoose = require('mongoose');

// Service Schema
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  shortDescription: {
    type: String,
    required: true,
    maxLength: 200
  },
  fullDescription: {
    type: String,
    required: true,
    maxLength: 1000
  },
  category: {
    type: String,
    enum: ['foundation', 'analytics', 'ai', 'governance'],
    required: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxLength: 50
  },
  icon: {
    type: String,
    default: '🔧'
  },
  features: [{
    type: String,
    trim: true,
    maxLength: 100
  }],
  technologies: [{
    type: String,
    trim: true,
    maxLength: 50
  }],
  pricing: {
    startingPrice: {
      type: Number,
      min: 0
    },
    pricingModel: {
      type: String,
      enum: ['fixed', 'hourly', 'monthly', 'project', 'custom'],
      default: 'custom'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  timeline: {
    min: {
      type: Number, // in weeks
      min: 1
    },
    max: {
      type: Number, // in weeks
      min: 1
    },
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'weeks'
    }
  },
  availability: {
    type: String,
    enum: ['available', 'coming-soon', 'limited', 'sold-out'],
    default: 'available'
  },
  popularity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: 30
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  caseStudies: [{
    title: String,
    description: String,
    results: String,
    clientType: String
  }],
  requirements: [{
    type: String,
    trim: true,
    maxLength: 200
  }],
  deliverables: [{
    type: String,
    trim: true,
    maxLength: 200
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for service rating (based on popularity)
serviceSchema.virtual('rating').get(function() {
  return Math.round((this.popularity / 2) * 10) / 10; // Convert to 5-star rating
});

// Index for efficient queries
serviceSchema.index({ category: 1, displayOrder: 1 });
serviceSchema.index({ availability: 1, isActive: 1 });
serviceSchema.index({ isFeatured: -1, popularity: -1 });
serviceSchema.index({ tags: 1 });

module.exports = mongoose.model('Service', serviceSchema);
