const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  cpuThreshold: { type: Number, default: 85 }, // Trigger percentage
  memoryThreshold: { type: Number, default: 80 }, // Trigger percentage
  diskThreshold: { type: Number, default: 90 }, // Trigger percentage
  networkThreshold: { type: Number, default: 75 }, // Trigger percentage
  socketInterval: { type: Number, default: 2000 }, // Milliseconds
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);
