const express = require('express');
const router = express.Router();
const ResourceMetrics = require('../models/ResourceMetrics');
const Allocation = require('../models/Allocation');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get allocation recommendations
// @route   GET /api/allocation/recommend
// @access  Private
router.get('/recommend', protect, async (req, res) => {
  try {
    const latest = await ResourceMetrics.findOne().sort({ timestamp: -1 });
    const settings = await Settings.findOne() || {
      cpuThreshold: 85,
      memoryThreshold: 80,
      diskThreshold: 90,
      networkThreshold: 75
    };

    if (!latest) {
      return res.status(404).json({ success: false, error: 'No metrics available to base recommendations on.' });
    }

    const recommendations = [];

    // Check CPU
    if (latest.cpu.usage > settings.cpuThreshold) {
      recommendations.push({
        resource: 'CPU',
        currentUsage: latest.cpu.usage,
        threshold: settings.cpuThreshold,
        recommendation: `Increase CPU allocation by 20%`,
        severity: 'critical',
        actionable: true
      });
    } else if (latest.cpu.usage > settings.cpuThreshold - 15) {
      recommendations.push({
        resource: 'CPU',
        currentUsage: latest.cpu.usage,
        threshold: settings.cpuThreshold,
        recommendation: `Increase CPU priority for scheduler queues`,
        severity: 'warning',
        actionable: true
      });
    }

    // Check Memory
    const memPercent = (latest.memory.used / (latest.memory.used + latest.memory.free)) * 100;
    if (memPercent > settings.memoryThreshold) {
      recommendations.push({
        resource: 'Memory',
        currentUsage: parseFloat(memPercent.toFixed(1)),
        threshold: settings.memoryThreshold,
        recommendation: `Allocate additional 2 GB RAM`,
        severity: 'critical',
        actionable: true
      });
    } else if (memPercent > settings.memoryThreshold - 15) {
      recommendations.push({
        resource: 'Memory',
        currentUsage: parseFloat(memPercent.toFixed(1)),
        threshold: settings.memoryThreshold,
        recommendation: `Compress idle pages in swap space`,
        severity: 'warning',
        actionable: false
      });
    }

    // Check Disk
    if (latest.disk.occupancy > settings.diskThreshold) {
      recommendations.push({
        resource: 'Disk',
        currentUsage: latest.disk.occupancy,
        threshold: settings.diskThreshold,
        recommendation: `Perform disk balancing / storage re-allocation`,
        severity: 'critical',
        actionable: true
      });
    }

    // Check Network
    const netAvg = (latest.network.uploadSpeed + latest.network.downloadSpeed) / 2; // relative usage ratio
    // network speed threshold calculation relative:
    if (netAvg > 75) {
      recommendations.push({
        resource: 'Network',
        currentUsage: parseFloat(netAvg.toFixed(1)),
        threshold: settings.networkThreshold,
        recommendation: `Increase bandwidth allocation / throttle non-critical connections`,
        severity: 'critical',
        actionable: true
      });
    }

    // Baseline fallback recommendation if all good
    if (recommendations.length === 0) {
      recommendations.push({
        resource: 'System',
        currentUsage: 0,
        threshold: 100,
        recommendation: `Maintain baseline resource allocation (system healthy)`,
        severity: 'healthy',
        actionable: false
      });
    }

    res.json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Apply dynamic resource allocation changes
// @route   POST /api/allocation/apply
// @access  Private
router.post('/apply', protect, async (req, res) => {
  try {
    const { cpuAllocated, memoryAllocated, diskAllocated, networkAllocated, recommendation } = req.body;

    const allocation = await Allocation.create({
      cpuAllocated: cpuAllocated || 60,
      memoryAllocated: memoryAllocated || 8,
      diskAllocated: diskAllocated || 50,
      networkAllocated: networkAllocated || 50,
      recommendation: recommendation || 'Manual tuning allocation',
      triggeredBy: req.user.username,
      status: 'applied'
    });

    res.status(201).json({
      success: true,
      message: 'Resource allocation changes applied successfully',
      data: allocation
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get allocation history
// @route   GET /api/allocation/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const history = await Allocation.find().sort({ timestamp: -1 }).limit(limit);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
