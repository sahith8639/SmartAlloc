import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import {
  Cpu,
  HardDrive,
  Network,
  Database,
  Activity,
  Layers,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext } from '../App';

function Dashboard() {
  const { addNotification } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [liveData, setLiveData] = useState(null);
  
  // Stats
  const [averages, setAverages] = useState({ cpu: 0, memory: 0, disk: 0, network: 0 });
  const [recommendations, setRecommendations] = useState([]);

  // Fetch initial history
  useEffect(() => {
    const fetchHistoryAndStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch history
        const histRes = await axios.get(`${window.location.protocol}//${window.location.hostname}:5000/api/resources/history?limit=30`, { headers });
        if (histRes.data.success) {
          const rawHistory = histRes.data.data;
          setMetricsHistory(rawHistory);
          if (rawHistory.length > 0) {
            setLiveData(rawHistory[rawHistory.length - 1]);
          }
        }

        // Fetch analytics trends
        const trendsRes = await axios.get(`${window.location.protocol}//${window.location.hostname}:5000/api/analytics/trends`, { headers });
        if (trendsRes.data.success) {
          setAverages(trendsRes.data.data.avg);
        }

        // Fetch allocations recommendations
        const recRes = await axios.get(`${window.location.protocol}//${window.location.hostname}:5000/api/allocation/recommend`, { headers });
        if (recRes.data.success) {
          setRecommendations(recRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryAndStats();
  }, []);

  // Set up real-time socket listeners
  useEffect(() => {
    const socket = io(`${window.location.protocol}//${window.location.hostname}:5000`);

    socket.on('connect', () => {
      console.log('Socket.IO connected to server from dashboard.');
    });

    socket.on('metrics', (data) => {
      // data contains: { metric, workload, prediction, performance, recommendations }
      setLiveData(data.metric);
      
      // Update charts history
      setMetricsHistory(prev => {
        const updated = [...prev, data.metric];
        if (updated.length > 30) updated.shift(); // keep last 30
        return updated;
      });

      // Update recommendations
      if (data.recommendations) {
        const formattedRecs = data.recommendations.map((recText, idx) => ({
          id: idx,
          resource: recText.includes('CPU') ? 'CPU' : recText.includes('RAM') ? 'Memory' : recText.includes('disk') ? 'Disk' : 'Network',
          recommendation: recText,
          severity: 'critical',
          actionable: true
        }));
        setRecommendations(formattedRecs.length > 0 ? formattedRecs : [{ resource: 'System', recommendation: 'Maintain baseline resource allocation (system healthy)', severity: 'healthy', actionable: false }]);
      }

      // Check thresholds to trigger custom warnings in app UI
      if (data.metric.cpu.usage > 85) {
        addNotification(`CRITICAL: CPU utilization spike detected at ${data.metric.cpu.usage}%`, 'warning');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [addNotification]);

  if (loading || !liveData) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-300 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl lg:col-span-2"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Format Recharts historical data
  const chartData = metricsHistory.map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    CPU: m.cpu.usage,
    Memory: parseFloat(((m.memory.used / (m.memory.used + m.memory.free)) * 100).toFixed(1)),
    Disk: m.disk.occupancy,
    Network: parseFloat(((m.network.uploadSpeed + m.network.downloadSpeed) / 2).toFixed(1))
  }));

  // Workload categorization for Badge
  const getWorkloadSeverityColor = (cpu) => {
    if (cpu > 85) return 'bg-danger/10 text-danger border-danger/30';
    if (cpu > 70) return 'bg-warning/10 text-warning border-warning/30';
    if (cpu > 45) return 'bg-primary/10 text-primary border-primary/30';
    return 'bg-success/10 text-success border-success/30';
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-sans">Enterprise OS Diagnostics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Real-Time intelligent telemetry diagnostics & machine learning resource controls.</p>
        </div>
        
        {/* Workload Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold uppercase tracking-wider font-mono ${getWorkloadSeverityColor(liveData.cpu.usage)}`}>
          <Layers size={14} />
          Current Workload: {liveData.cpu.usage > 85 ? 'Critical' : liveData.cpu.usage > 70 ? 'High' : liveData.cpu.usage > 45 ? 'Medium' : 'Low'}
        </div>
      </div>

      {/* Grid: 4 Core Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CPU Usage Card */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CPU Utilization</span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Cpu size={18} /></div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight">{liveData.cpu.usage}</span>
            <span className="text-sm font-bold text-slate-400">%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Temp: {liveData.cpu.temperature}°C</span>
            <span>Avg: {averages.cpu}%</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-500" style={{ width: `${liveData.cpu.usage}%` }}></div>
          </div>
        </div>

        {/* Memory Usage Card */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memory Allocation</span>
            <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary"><Database size={18} /></div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight">{liveData.memory.used}</span>
            <span className="text-sm font-bold text-slate-400">/ 16.0 GB</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Free: {liveData.memory.free} GB</span>
            <span>Usage: {Math.round((liveData.memory.used / 16) * 100)}%</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full transition-all duration-500" style={{ width: `${(liveData.memory.used / 16) * 100}%` }}></div>
          </div>
        </div>

        {/* Disk Occupancy Card */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disk Storage</span>
            <div className="p-1.5 rounded-lg bg-success/10 text-success"><HardDrive size={18} /></div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight">{liveData.disk.occupancy}</span>
            <span className="text-sm font-bold text-slate-400">%</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>R: {liveData.disk.readSpeed} MB/s</span>
            <span>W: {liveData.disk.writeSpeed} MB/s</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-success h-full transition-all duration-500" style={{ width: `${liveData.disk.occupancy}%` }}></div>
          </div>
        </div>

        {/* Network I/O Card */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl transition-all hover:shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Network Bandwidth</span>
            <div className="p-1.5 rounded-lg bg-warning/10 text-warning"><Network size={18} /></div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight">{(liveData.network.uploadSpeed + liveData.network.downloadSpeed).toFixed(1)}</span>
            <span className="text-sm font-bold text-slate-400">MB/s</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Conns: {liveData.network.activeConnections}</span>
            <span>Up/Down: {liveData.network.uploadSpeed}/{liveData.network.downloadSpeed}</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-warning h-full transition-all duration-500" style={{ width: `${Math.min(100, (liveData.network.uploadSpeed + liveData.network.downloadSpeed) * 1.5)}%` }}></div>
          </div>
        </div>

      </div>

      {/* Charts & Recommender */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Recharts Panel */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary animate-pulse-green" />
              <h3 className="text-sm font-bold">Resource Consumption Activity (Live)</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Updates every 2s</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} stroke="rgba(148, 163, 184, 0.1)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} stroke="rgba(148, 163, 184, 0.1)" />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="custom-tooltip">
                        <p>{`Time: ${data.time}`}</p>
                        <p className="text-primary-light">{`CPU: ${data.CPU}%`}</p>
                        <p className="text-secondary-light">{`Memory: ${data.Memory}%`}</p>
                        <p className="text-success-light">{`Disk: ${data.Disk}%`}</p>
                        <p className="text-warning-light">{`Net: ${data.Network} MB/s`}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area type="monotone" dataKey="CPU" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" dataKey="Memory" stroke="#7C3AED" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Recommendations Engine Card */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-secondary" />
                <h3 className="text-sm font-bold">ML Recommendation Engine</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/10 text-secondary">
                Predictive AI
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`p-3 border rounded-lg text-xs flex gap-2.5 items-start ${
                    rec.severity === 'critical'
                      ? 'bg-danger/10 border-danger/25 text-danger'
                      : rec.severity === 'warning'
                      ? 'bg-warning/10 border-warning/25 text-warning'
                      : 'bg-success/10 border-success/25 text-success'
                  }`}
                >
                  {rec.severity === 'critical' ? (
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  ) : rec.severity === 'warning' ? (
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{rec.resource} Allocation</span>
                      {rec.severity !== 'healthy' && (
                        <span className="text-[9px] uppercase px-1 rounded bg-danger/20 font-mono">Alert</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-slate-600 dark:text-slate-300 font-medium">{rec.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Models: Random Forest Regressor</span>
            <span className="text-primary-light hover:underline cursor-pointer flex items-center gap-1">
              Analyze Predictions <Sparkles size={12} />
            </span>
          </div>
        </div>

      </div>

      {/* Grid Section: System Context Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Scheduler Queues Details */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200">
            <Layers size={18} className="text-primary" />
            <h3 className="text-sm font-bold">Process Scheduler Queue</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Active Tasks / Processes</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{liveData.processCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Threads Count</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{liveData.threadCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Waiting in Scheduler Queue</span>
              <span className="font-bold text-warning font-mono">{Math.floor(liveData.processCount * 0.15)}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div className="bg-success h-full" style={{ width: '70%' }}></div>
              <div className="bg-warning h-full" style={{ width: '20%' }}></div>
              <div className="bg-danger h-full" style={{ width: '10%' }}></div>
            </div>
            <div className="flex gap-4 text-[10px] text-slate-400 font-mono justify-center">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-success rounded-full"></span>Running</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-warning rounded-full"></span>Ready</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-danger rounded-full"></span>Suspended</span>
            </div>
          </div>
        </div>

        {/* Memory Scheduler Context */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200">
            <Database size={18} className="text-secondary" />
            <h3 className="text-sm font-bold">Memory Management Context</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Total Virtual Memory Address</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">16.0 GB</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Swap Partition Used</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">1.2 GB</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Cache / Buffers</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">3.4 GB</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div className="bg-secondary h-full" style={{ width: '60%' }}></div>
              <div className="bg-slate-400 h-full" style={{ width: '25%' }}></div>
              <div className="bg-slate-600 h-full" style={{ width: '15%' }}></div>
            </div>
            <div className="flex gap-4 text-[10px] text-slate-400 font-mono justify-center">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>Used Pages</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>Cached</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>Buffers</span>
            </div>
          </div>
        </div>

        {/* Disk & I/O Scheduler Context */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200">
            <HardDrive size={18} className="text-success" />
            <h3 className="text-sm font-bold">Storage Disk I/O Queue</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Active Devices Handles</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">4 Connected</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">I/O Requests Queue</span>
              <span className="font-bold text-success font-mono">{Math.floor(liveData.disk.readSpeed / 5)} IOPS</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Pending Disk Interrupts</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">0 Interrupts</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div className="bg-success h-full" style={{ width: '80%' }}></div>
              <div className="bg-slate-500 h-full" style={{ width: '20%' }}></div>
            </div>
            <div className="flex gap-4 text-[10px] text-slate-400 font-mono justify-center">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-success rounded-full"></span>Ready Handles</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>Interrupted</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
