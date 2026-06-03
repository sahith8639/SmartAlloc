require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDB = require('./ml/seed_data');

// Import Models
const ResourceMetrics = require('./models/ResourceMetrics');
const Workload = require('./models/Workload');
const Prediction = require('./models/Prediction');
const PerformanceLog = require('./models/PerformanceLog');
const Settings = require('./models/Settings');

// Import Routes
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const analyticsRoutes = require('./routes/analytics');
const mlRoutes = require('./routes/ml');
const allocationRoutes = require('./routes/allocation');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Smart Resource Allocation System API is running.');
});

// Configure Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Live metrics generation function
const startLiveMetricsGenerator = () => {
  console.log('Starting Live Resource Metrics generator (2s intervals)...');
  
  setInterval(async () => {
    try {
      const settings = await Settings.findOne() || {
        cpuThreshold: 85,
        memoryThreshold: 80,
        diskThreshold: 90,
        networkThreshold: 75
      };

      // 1. Generate Raw Metrics
      const cpuUsage = Math.floor(Math.random() * (95 - 20 + 1)) + 20; // 20-95%
      const coreCount = 8;
      const cores = Array.from({ length: coreCount }, () => Math.floor(Math.random() * (98 - 15 + 1)) + 15);
      const cpuTemp = Math.floor(Math.random() * (75 - 40 + 1)) + 40; // Celsius

      const totalMemory = 16.0; // 16GB
      const memoryPercent = Math.floor(Math.random() * (90 - 25 + 1)) + 25; // 25-90%
      const usedMem = parseFloat(((totalMemory * memoryPercent) / 100).toFixed(2));
      const freeMem = parseFloat((totalMemory - usedMem).toFixed(2));

      const diskOccupancy = Math.floor(Math.random() * (95 - 15 + 1)) + 15; // 15-95%
      const diskRead = parseFloat((Math.random() * 120 + 5).toFixed(2));
      const diskWrite = parseFloat((Math.random() * 80 + 2).toFixed(2));

      const netUpload = parseFloat((Math.random() * 45 + 1).toFixed(2));
      const netDownload = parseFloat((Math.random() * 95 + 5).toFixed(2));
      const netConnections = Math.floor(Math.random() * 150 + 20);

      const processCount = Math.floor(Math.random() * (160 - 80 + 1)) + 80;
      const threadCount = Math.floor(Math.random() * (1100 - 600 + 1)) + 600;

      const metric = await ResourceMetrics.create({
        cpu: { usage: cpuUsage, cores, temperature: cpuTemp },
        memory: { used: usedMem, free: freeMem, available: freeMem },
        disk: { readSpeed: diskRead, writeSpeed: diskWrite, occupancy: diskOccupancy },
        network: { uploadSpeed: netUpload, downloadSpeed: netDownload, activeConnections: netConnections },
        processCount,
        threadCount
      });

      // 2. Classify Workload
      let classification = 'Low';
      const usageAverage = (cpuUsage + memoryPercent + diskOccupancy) / 3;
      if (usageAverage > settings.cpuThreshold || cpuUsage > settings.cpuThreshold) {
        classification = 'Critical';
      } else if (usageAverage > 70) {
        classification = 'High';
      } else if (usageAverage > 45) {
        classification = 'Medium';
      }

      const workload = await Workload.create({
        classification,
        cpuPeak: cpuUsage > 80 ? cpuUsage : Math.floor(cpuUsage * 1.1),
        memoryPeak: memoryPercent > 80 ? memoryPercent : Math.floor(memoryPercent * 1.05),
        diskPeak: diskOccupancy > 80 ? diskOccupancy : Math.floor(diskOccupancy * 1.02),
        networkPeak: Math.max(netUpload, netDownload) > 80 ? Math.floor(Math.max(netUpload, netDownload)) : Math.floor(Math.max(netUpload, netDownload) * 1.08),
        avgCpu: cpuUsage,
        avgMemory: memoryPercent,
        avgDisk: diskOccupancy,
        avgNetwork: parseFloat(((netUpload + netDownload) / 2).toFixed(2)),
        growthRate: parseFloat((Math.random() * 2 - 1).toFixed(2))
      });

      // 3. Generate ML Prediction (Rule-based fast estimation matching Python RF targets)
      const predCpu = Math.min(98, Math.max(10, Math.floor(cpuUsage * 1.06 + (Math.random() * 6 - 3))));
      const predMem = Math.min(95, Math.max(15, Math.floor(memoryPercent * 1.02 + (Math.random() * 4 - 2))));
      const predDisk = Math.min(99, Math.max(10, Math.floor(diskOccupancy * 1.01 + (Math.random() * 2 - 1))));
      const predNet = Math.min(95, Math.max(5, Math.floor(((netUpload + netDownload) / 2) * 1.05 + (Math.random() * 6 - 3))));
      const confidence = parseFloat((0.85 + Math.random() * 0.11).toFixed(2));

      const prediction = await Prediction.create({
        predictedCpu: predCpu,
        predictedMemory: predMem,
        predictedDisk: predDisk,
        predictedNetwork: predNet,
        confidence
      });

      // 4. Generate Performance Logs (Feedback loop)
      const throughput = Math.floor(Math.random() * 300 + 150);
      const responseTime = Math.floor(Math.random() * 50 + 10);
      const allocationSuccessRate = Math.floor(Math.random() * (100 - 95 + 1)) + 95;
      const optimizationScore = Math.floor(Math.random() * (98 - 88 + 1)) + 88;

      const performance = await PerformanceLog.create({
        throughput,
        responseTime,
        cpuUtilization: cpuUsage,
        memoryUtilization: memoryPercent,
        diskUtilization: diskOccupancy,
        networkUtilization: Math.floor((netUpload + netDownload) / 2),
        allocationSuccessRate,
        optimizationScore
      });

      // 5. Build Recommendation recommendations list
      const recommendations = [];
      if (cpuUsage > settings.cpuThreshold) {
        recommendations.push(`Increase CPU allocation by 20%`);
      }
      if (memoryPercent > settings.memoryThreshold) {
        recommendations.push(`Allocate additional 2 GB RAM`);
      }
      if (diskOccupancy > settings.diskThreshold) {
        recommendations.push(`Perform disk balancing`);
      }
      const netAvg = (netUpload + netDownload) / 2;
      if (netAvg > settings.networkThreshold) {
        recommendations.push(`Increase bandwidth allocation`);
      }

      // Broadcast payload to Socket.IO clients
      io.emit('metrics', {
        metric,
        workload,
        prediction,
        performance,
        recommendations
      });
      
    } catch (err) {
      console.error('Error generating live metrics:', err.message);
    }
  }, 2000);
};

// Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Seed Database if required
  await seedDB();
  
  // Start generator
  startLiveMetricsGenerator();

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('DB connection failure:', err);
});
