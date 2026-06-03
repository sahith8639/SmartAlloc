const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get current system thresholds/settings
// @route   GET /api/settings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create defaults if not exists
      settings = await Settings.create({
        cpuThreshold: 85,
        memoryThreshold: 80,
        diskThreshold: 90,
        networkThreshold: 75,
        socketInterval: 2000
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Update system settings/thresholds
// @route   PUT /api/settings
// @access  Private (Admin Only)
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { cpuThreshold, memoryThreshold, diskThreshold, networkThreshold, socketInterval } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (cpuThreshold !== undefined) settings.cpuThreshold = cpuThreshold;
    if (memoryThreshold !== undefined) settings.memoryThreshold = memoryThreshold;
    if (diskThreshold !== undefined) settings.diskThreshold = diskThreshold;
    if (networkThreshold !== undefined) settings.networkThreshold = networkThreshold;
    if (socketInterval !== undefined) settings.socketInterval = socketInterval;
    
    settings.updatedAt = Date.now();
    await settings.save();

    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
