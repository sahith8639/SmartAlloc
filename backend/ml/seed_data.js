const mongoose = require('mongoose');
const User = require('../models/User');
const ResourceMetrics = require('../models/ResourceMetrics');
const Prediction = require('../models/Prediction');
const Allocation = require('../models/Allocation');
const Workload = require('../models/Workload');
const PerformanceLog = require('../models/PerformanceLog');
const Settings = require('../models/Settings');

// Simple hash generator helper if we want to bypass bcryptjs or use standard bcrypt
// But since bcryptjs is imported in User model, we should let the model handle save password hashing.
// So we can save User objects directly and Mongoose middleware will hash them.

const seedDB = async (dbUri) => {
  try {
    console.log('Seeding database with sample data...');

    // 1. Seed Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        cpuThreshold: 85,
        memoryThreshold: 80,
        diskThreshold: 90,
        networkThreshold: 75,
        socketInterval: 2000
      });
      console.log('Default settings seeded.');
    }

    // 2. Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create([
        {
          username: 'admin',
          email: 'admin@system.local',
          password: 'admin123',
          role: 'admin'
        },
        {
          username: 'manager',
          email: 'manager@system.local',
          password: 'manager123',
          role: 'manager'
        }
      ]);
      console.log('Default users seeded: admin (admin123), manager (manager123).');
    }

    // 3. Seed ResourceMetrics & Workloads (100 historical data points at 10-second offsets)
    const metricsCount = await ResourceMetrics.countDocuments();
    if (metricsCount === 0) {
      const now = Date.now();
      const metricsList = [];
      const workloadList = [];
      const predictionList = [];
      const performanceList = [];

      for (let i = 100; i >= 0; i--) {
        const timeOffset = now - i * 10000; // 10 seconds steps
        
        // Random CPU 20-95%
        const cpuUsage = Math.floor(Math.random() * (95 - 20 + 1)) + 20;
        const cores = Array.from({ length: 8 }, () => Math.floor(Math.random() * (98 - 15 + 1)) + 15);
        const cpuTemp = Math.floor(Math.random() * (75 - 40 + 1)) + 40;

        // Memory 25-90% of 16GB
        const totalMem = 16.0;
        const memPercent = Math.floor(Math.random() * (90 - 25 + 1)) + 25;
        const memUsed = parseFloat(((totalMem * memPercent) / 100).toFixed(2));
        const memFree = parseFloat((totalMem - memUsed).toFixed(2));

        // Disk 15-95%
        const diskOccupancy = Math.floor(Math.random() * (95 - 15 + 1)) + 15;
        const diskRead = parseFloat((Math.random() * 120 + 5).toFixed(2));
        const diskWrite = parseFloat((Math.random() * 80 + 2).toFixed(2));

        // Network 10-90%
        const netUsage = Math.floor(Math.random() * (90 - 10 + 1)) + 10;
        const netUpload = parseFloat((Math.random() * 45 + 1).toFixed(2));
        const netDownload = parseFloat((Math.random() * 95 + 5).toFixed(2));
        const activeConns = Math.floor(Math.random() * 150 + 20);

        const processCount = Math.floor(Math.random() * (160 - 80 + 1)) + 80;
        const threadCount = Math.floor(Math.random() * (1100 - 600 + 1)) + 600;

        const metricsItem = {
          cpu: { usage: cpuUsage, cores: cores, temperature: cpuTemp },
          memory: { used: memUsed, free: memFree, available: memFree },
          disk: { readSpeed: diskRead, writeSpeed: diskWrite, occupancy: diskOccupancy },
          network: { uploadSpeed: netUpload, downloadSpeed: netDownload, activeConnections: activeConns },
          processCount,
          threadCount,
          timestamp: new Date(timeOffset)
        };
        metricsList.push(metricsItem);

        // Pre-calculate workload classification
        let classification = 'Low';
        const score = (cpuUsage + memPercent + diskOccupancy) / 3;
        if (score > 85) classification = 'Critical';
        else if (score > 70) classification = 'High';
        else if (score > 45) classification = 'Medium';

        workloadList.push({
          classification,
          cpuPeak: cpuUsage > 80 ? cpuUsage : Math.floor(cpuUsage * 1.1),
          memoryPeak: memPercent > 80 ? memPercent : Math.floor(memPercent * 1.05),
          diskPeak: diskOccupancy > 80 ? diskOccupancy : Math.floor(diskOccupancy * 1.02),
          networkPeak: netUsage > 80 ? netUsage : Math.floor(netUsage * 1.08),
          avgCpu: cpuUsage,
          avgMemory: memPercent,
          avgDisk: diskOccupancy,
          avgNetwork: netUsage,
          growthRate: parseFloat((Math.random() * 4 - 2).toFixed(2)),
          timestamp: new Date(timeOffset)
        });

        // Seed Matching Prediction
        predictionList.push({
          predictedCpu: Math.min(98, Math.max(10, Math.floor(cpuUsage * 1.05 + (Math.random() * 10 - 5)))),
          predictedMemory: Math.min(95, Math.max(15, Math.floor(memPercent * 1.02 + (Math.random() * 6 - 3)))),
          predictedDisk: Math.min(99, Math.max(10, Math.floor(diskOccupancy * 1.01 + (Math.random() * 4 - 2)))),
          predictedNetwork: Math.min(95, Math.max(5, Math.floor(netUsage * 1.06 + (Math.random() * 8 - 4)))),
          confidence: parseFloat((0.85 + Math.random() * 0.12).toFixed(2)),
          timestamp: new Date(timeOffset + 2000) // predicted 2 seconds into future
        });

        // Seed Performance logs
        performanceList.push({
          throughput: Math.floor(Math.random() * 400 + 100),
          responseTime: Math.floor(Math.random() * 80 + 10),
          cpuUtilization: cpuUsage,
          memoryUtilization: memPercent,
          diskUtilization: diskOccupancy,
          networkUtilization: netUsage,
          allocationSuccessRate: Math.floor(Math.random() * (100 - 92 + 1)) + 92,
          optimizationScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85,
          timestamp: new Date(timeOffset)
        });
      }

      await ResourceMetrics.insertMany(metricsList);
      await Workload.insertMany(workloadList);
      await Prediction.insertMany(predictionList);
      await PerformanceLog.insertMany(performanceList);
      console.log('Seeded ResourceMetrics, Workloads, Predictions, and PerformanceLogs.');
    }

    // 4. Seed Allocations
    const allocationCount = await Allocation.countDocuments();
    if (allocationCount === 0) {
      await Allocation.create([
        {
          cpuAllocated: 60,
          memoryAllocated: 8.5,
          diskAllocated: 50,
          networkAllocated: 40,
          status: 'applied',
          recommendation: 'Baseline automatic allocation',
          triggeredBy: 'System'
        },
        {
          cpuAllocated: 80,
          memoryAllocated: 12.0,
          diskAllocated: 70,
          networkAllocated: 60,
          status: 'applied',
          recommendation: 'Increase CPU allocation by 20% due to CPU spikes > 85%',
          triggeredBy: 'admin'
        }
      ]);
      console.log('Default allocations seeded.');
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDB;

// If run directly
if (require.main === module) {
  const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_resource_allocator';
  mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => seedDB(dbUri))
    .then(() => mongoose.connection.close())
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
