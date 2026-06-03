const mongoose = require('mongoose');

const ResourceMetricsSchema = new mongoose.Schema({
  cpu: {
    usage: { type: Number, required: true }, // Overall percentage
    cores: [Number], // Individual core utilization
    temperature: { type: Number, default: 45 } // CPU temp in Celsius
  },
  memory: {
    used: { type: Number, required: true }, // GB
    free: { type: Number, required: true }, // GB
    available: { type: Number, required: true } // GB
  },
  disk: {
    readSpeed: { type: Number, required: true }, // MB/s
    writeSpeed: { type: Number, required: true }, // MB/s
    occupancy: { type: Number, required: true } // Percentage
  },
  network: {
    uploadSpeed: { type: Number, required: true }, // MB/s
    downloadSpeed: { type: Number, required: true }, // MB/s
    activeConnections: { type: Number, required: true }
  },
  processCount: { type: Number, default: 120 },
  threadCount: { type: Number, default: 850 },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('ResourceMetrics', ResourceMetricsSchema);
