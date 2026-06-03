const mongoose = require('mongoose');

const PerformanceLogSchema = new mongoose.Schema({
  throughput: { type: Number, required: true }, // Requests per second
  responseTime: { type: Number, required: true }, // milliseconds (latency)
  cpuUtilization: { type: Number, required: true },
  memoryUtilization: { type: Number, required: true },
  diskUtilization: { type: Number, required: true },
  networkUtilization: { type: Number, required: true },
  allocationSuccessRate: { type: Number, default: 98 }, // percentage
  optimizationScore: { type: Number, default: 92 }, // percentage
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('PerformanceLog', PerformanceLogSchema);
