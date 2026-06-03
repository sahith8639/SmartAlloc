const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  predictedCpu: { type: Number, required: true },
  predictedMemory: { type: Number, required: true },
  predictedDisk: { type: Number, required: true },
  predictedNetwork: { type: Number, required: true },
  confidence: { type: Number, default: 0.92 }, // Prediction confidence score (0 to 1)
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
