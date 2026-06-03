const mongoose = require('mongoose');

const WorkloadSchema = new mongoose.Schema({
  classification: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  cpuPeak: { type: Number, required: true },
  memoryPeak: { type: Number, required: true },
  diskPeak: { type: Number, required: true },
  networkPeak: { type: Number, required: true },
  avgCpu: { type: Number, default: 0 },
  avgMemory: { type: Number, default: 0 },
  avgDisk: { type: Number, default: 0 },
  avgNetwork: { type: Number, default: 0 },
  growthRate: { type: Number, default: 0 }, // resource growth trend
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Workload', WorkloadSchema);
