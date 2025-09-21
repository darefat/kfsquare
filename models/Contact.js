const mongoose = require('mongoose');

// Contact Schema
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
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  message: {
    type: String,
    required: true,
    maxLength: 1000
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
    enum: ['data-engineering', 'predictive-analytics', 'llm-integration', 
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

// Virtual for contact age (days since creation)
contactSchema.virtual('contactAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Index for efficient queries
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ priority: -1, createdAt: -1 });
contactSchema.index({ serviceInterest: 1 });

module.exports = mongoose.model('Contact', contactSchema);
