const mongoose = require('mongoose');

// Team Member Schema
const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  bio: {
    type: String,
    required: true,
    maxLength: 1000
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[A-Za-z0-9]+([._-][A-Za-z0-9]+)*@[A-Za-z0-9]+([.-][A-Za-z0-9]+)*\.[A-Za-z]{2,3}$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  specialties: [{
    type: String,
    trim: true,
    maxLength: 50
  }],
  credentials: [{
    type: String,
    trim: true,
    maxLength: 100
  }],
  experience: {
    type: String,
    trim: true,
    maxLength: 50
  },
  category: {
    type: String,
    enum: ['leadership', 'core', 'consultant', 'analyst'],
    default: 'core'
  },
  department: {
    type: String,
    enum: ['research', 'engineering', 'analytics', 'consulting', 'management'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  photoUrl: {
    type: String,
    default: ''
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member initials
teamMemberSchema.virtual('initials').get(function() {
  if (!this.name) return '';
  const names = this.name.split(' ');
  return names.length >= 2 ? 
    (names[0][0] + names[names.length - 1][0]).toUpperCase() : 
    names[0].substring(0, 2).toUpperCase();
});

// Index for efficient queries
teamMemberSchema.index({ category: 1, displayOrder: 1 });
teamMemberSchema.index({ department: 1 });
teamMemberSchema.index({ isActive: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
