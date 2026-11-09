const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  error: { type: String, default: '' },
  sentAt: { type: Date }
}, { _id: false });

const emailSchema = new mongoose.Schema({
  subject: { type: String, required: [true, 'Subject is required'], trim: true },
  body: { type: String, required: [true, 'Email body is required'] },
  recipients: {
    type: [recipientSchema],
    validate: [(arr) => arr.length > 0, 'At least one recipient is required']
  },
  status: {
    type: String,
    enum: ['pending', 'sending', 'completed', 'partial', 'failed'],
    default: 'pending'
  },
  totalCount: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Email', emailSchema);