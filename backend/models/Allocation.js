const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema({
  cpuAllocated: { type: Number, required: true }, // Assigned CPU shares/cores
  memoryAllocated: { type: Number, required: true }, // GB RAM assigned
  diskAllocated: { type: Number, required: true }, // I/O bandwidth/shares
  networkAllocated: { type: Number, required: true }, // Bandwidth Mbps
  status: {
    type: String,
    enum: ['pending', 'applied', 'failed'],
    default: 'applied'
  },
  recommendation: { type: String }, // recommendation instruction triggered
  triggeredBy: {
    type: String,
    default: 'System' // e.g. User ID or 'System'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Allocation', AllocationSchema);
