const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  format: { type: String, enum: ['PDF', 'CSV', 'Excel'], required: true },
  summary: { type: String },
  metricsCovered: { type: [String], default: ['CPU', 'Memory', 'Disk', 'Network'] },
  createdBy: { type: String, default: 'System' },
  downloadUrl: { type: String },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
