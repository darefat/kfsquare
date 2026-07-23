'use strict';

/**
 * Portfolio project model.
 * Captures publishable case-study content separately from private client
 * identity fields and operational delivery details.
 */
const mongoose = require('mongoose');

// The schema groups related client, result, timeline, and testimonial data so
// consumers can render each case study without additional joins.
const portfolioSchema = new mongoose.Schema({
  title: {
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
    maxLength: 2000
  },
  client: {
    name: {
      type: String,
      trim: true,
      maxLength: 100
    },
    industry: {
      type: String,
      trim: true,
      maxLength: 50
    },
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
      default: 'medium'
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  technologies: [{
    type: String,
    trim: true,
    maxLength: 50
  }],
  category: {
    type: String,
    enum: ['analytics', 'predictive-modeling', 'data-engineering', 'visualization', 'consulting'],
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: 30
  }],
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  results: {
    metrics: [{
      name: String,
      value: String,
      improvement: String
    }],
    roi: {
      percentage: Number,
      timeline: String,
      description: String
    },
    summary: {
      type: String,
      maxLength: 500
    }
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'months'
      }
    }
  },
  team: [{
    role: String,
    count: Number,
    skills: [String]
  }],
  challenges: [{
    description: String,
    solution: String
  }],
  status: {
    type: String,
    enum: ['completed', 'ongoing', 'paused', 'cancelled'],
    default: 'completed'
  },
  isPublic: {
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
  testimonial: {
    quote: String,
    author: String,
    position: String,
    company: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Format duration at read time and correctly singularize the unit.
portfolioSchema.virtual('durationText').get(function() {
  const duration = this.timeline && this.timeline.duration;
  if (!duration || !duration.value || !duration.unit) return '';

  const singularUnit = duration.unit.replace(/s$/, '');
  const unit = duration.value === 1 ? singularUnit : `${singularUnit}s`;
  return `${duration.value} ${unit}`;
});

// Indexes support public/category listings and featured-project ordering.
portfolioSchema.index({ category: 1, displayOrder: 1 });
portfolioSchema.index({ isFeatured: -1, createdAt: -1 });
portfolioSchema.index({ status: 1, isPublic: 1 });
portfolioSchema.index({ tags: 1 });
portfolioSchema.index({ 'client.industry': 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
