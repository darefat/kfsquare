'use strict';

/**
 * Contact persistence model.
 * Stores public inquiry content, CRM workflow fields, delivery state, and
 * request metadata used for support and abuse investigation.
 */
const mongoose = require('mongoose');

// Public inquiry fields are validated again at the database boundary so
// non-HTTP writers cannot bypass the API's validation rules.
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator(value) {
        // Deliberately permissive: reject malformed addresses without
        // excluding valid modern domains or common address characters.
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Please enter a valid email'
    }
  },
  message: {
    type: String,
    required: true,
    maxLength: 2000
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    maxLength: 100
  },
  serviceInterest: {
    type: String,
    enum: ['data-engineering', 'predictive-analytics', 'process-automation',
           'business-intelligence', 'data-governance', 'strategic-consulting', 'other'],
    default: 'other'
  },
  budget: {
    type: String,
    enum: ['under-10k', '10k-50k', '50k-100k', '100k-500k', '500k+', 'not-specified'],
    default: 'not-specified'
  },
  timeline: {
    type: String,
    enum: ['urgent', '1-month', '1-3-months', '3-6-months', '6+ months', 'flexible'],
    default: 'flexible'
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'linkedin', 'google', 'event', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'converted', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String,
    maxLength: 2000
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  followUpDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: 30
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compute age on read rather than persisting a value that immediately becomes
// stale. Guard new unsaved records, which do not have createdAt yet.
contactSchema.virtual('contactAge').get(function() {
  if (!this.createdAt) return 0;
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// These compound indexes match the admin dashboard's most common filters and
// sorting patterns; the email/service indexes support direct lookup/reporting.
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ priority: -1, createdAt: -1 });
contactSchema.index({ serviceInterest: 1 });

module.exports = mongoose.model('Contact', contactSchema);
