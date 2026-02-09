const mongoose = require('mongoose');

const workRequestSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  labour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobType: String,
  cropType: String,
  farmSize: Number,
  duration: Number,
  wage: Number,
  startDate: Date,
  location: {
    village: String,
    district: String,
    state: String
  },
  requirements: String,
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date
});

// Index for faster queries
workRequestSchema.index({ labour: 1, status: 1, createdAt: -1 });
workRequestSchema.index({ farmer: 1, createdAt: -1 });

const WorkRequest = mongoose.model('WorkRequest', workRequestSchema);

module.exports = WorkRequest;
