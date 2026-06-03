const express = require('express');
const router = express.Router();
const ResourceMetrics = require('../models/ResourceMetrics');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get latest resource metric
// @route   GET /api/resources/live
// @access  Private
router.get('/live', protect, async (req, res) => {
  try {
    const latestMetric = await ResourceMetrics.findOne().sort({ timestamp: -1 });
    if (!latestMetric) {
      return res.status(404).json({ success: false, error: 'No metrics found' });
    }
    res.json({ success: true, data: latestMetric });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get historical resource metrics
// @route   GET /api/resources/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    // Fetch latest limit, then reverse to chronological order
    const metrics = await ResourceMetrics.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json({ success: true, data: metrics.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
