import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Cpu, HardDrive, Network, Database } from 'lucide-react';

function ResourceMonitoring() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [latestMetric, setLatestMetric] = useState(null);

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(
          `${window.location.protocol}//${window.location.hostname}:5000/api/resources/history?limit=30`,
          { headers }
        );
        if (response.data.success) {
          setMetrics(response.data.data);
          if (response.data.data.length > 0) {
            setLatestMetric(response.data.data[response.data.data.length - 1]);
          }
        }
      } catch (err) {
        console.error('Error loading metrics history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Listen for Socket events
  useEffect(() => {
    const socket = io(`${window.location.protocol}//${window.location.hostname}:5000`);

    socket.on('metrics', (data) => {
      setLatestMetric(data.metric);
      setMetrics((prev) => {
        const updated = [...prev, data.metric];
        if (updated.length > 30) updated.shift();
        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading || !latestMetric) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-300 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Format historical metrics data for charts
  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const chartData = metrics.map((m) => ({
    time: formatTime(m.timestamp),
    cpuUsage: m.cpu.usage,
    cpuTemp: m.cpu.temperature,
    memoryUsed: m.memory.used,
    memoryFree: m.memory.free,
    diskOccupancy: m.disk.occupancy,
    diskRead: m.disk.readSpeed,
    diskWrite: m.disk.writeSpeed,
    netUpload: m.network.uploadSpeed,
    netDownload: m.network.downloadSpeed,
    netConns: m.network.activeConnections
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-sans">Live System Telemetry</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Real-time resource graphs refreshing at 2-second intervals.</p>
      </div>

      {/* Grid: 2x2 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. CPU Monitoring Chart */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="text-primary animate-pulse-green" size={18} />
              <h3 className="text-sm font-bold">CPU Usage & Thermal Dynamics</h3>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-primary mr-2">{latestMetric.cpu.usage}% Util</span>
              <span className="text-xs font-semibold text-warning">{latestMetric.cpu.temperature}°C</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="rgba(148, 163, 184, 0.1)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="rgba(148, 163, 184, 0.1)" />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`Time: ${payload[0].payload.time}`}</p>
                        <p className="text-primary-light">{`CPU Usage: ${payload[0].value}%`}</p>
                        {payload[1] && <p className="text-warning-light">{`Core Temp: ${payload[1].value}°C`}</p>}
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area name="CPU Utilization (%)" type="monotone" dataKey="cpuUsage" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#cpuArea)" />
                <Line name="Core Temp (°C)" type="monotone" dataKey="cpuTemp" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Memory Monitoring Chart */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Database className="text-secondary" size={18} />
              <h3 className="text-sm font-bold">Memory Address Mapping</h3>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span className="font-bold text-secondary">{latestMetric.memory.used} GB</span> Used / <span className="font-semibold text-success">{latestMetric.memory.free} GB</span> Free
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="memArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="rgba(148, 163, 184, 0.1)" />
                <YAxis domain={[0, 16]} tick={{ fontSize: 9 }} stroke="rgba(148, 163, 184, 0.1)" />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`Time: ${payload[0].payload.time}`}</p>
                        <p className="text-secondary-light">{`Memory Used: ${payload[0].value} GB`}</p>
                        {payload[1] && <p className="text-success-light">{`Memory Free: ${payload[1].value} GB`}</p>}
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area name="RAM Allocated (GB)" type="monotone" dataKey="memoryUsed" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#memArea)" />
                <Area name="RAM Available (GB)" type="monotone" dataKey="memoryFree" stroke="#10B981" strokeWidth={1} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Disk I/O Monitoring Chart */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="text-success" size={18} />
              <h3 className="text-sm font-bold">Disk Volume & I/O Flow</h3>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-success mr-2">{latestMetric.disk.occupancy}% Occupied</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="rgba(148, 163, 184, 0.1)" />
                <YAxis tick={{ fontSize: 9 }} stroke="rgba(148, 163, 184, 0.1)" />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`Time: ${payload[0].payload.time}`}</p>
                        <p className="text-success-light">{`Disk Occupancy: ${payload[0].value}%`}</p>
                        {payload[1] && <p className="text-sky-400">{`Read Speed: ${payload[1].value} MB/s`}</p>}
                        {payload[2] && <p className="text-rose-400">{`Write Speed: ${payload[2].value} MB/s`}</p>}
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line name="Disk Space (%)" type="monotone" dataKey="diskOccupancy" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line name="Read Speed (MB/s)" type="monotone" dataKey="diskRead" stroke="#0EA5E9" strokeWidth={1.5} dot={false} />
                <Line name="Write Speed (MB/s)" type="monotone" dataKey="diskWrite" stroke="#F43F5E" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Network Monitoring Chart */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Network className="text-warning" size={18} />
              <h3 className="text-sm font-bold">Network Socket Bandwidth</h3>
            </div>
            <div className="text-right text-xs text-slate-500">
              Connections: <span className="font-bold text-warning font-mono">{latestMetric.network.activeConnections}</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="netDown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="rgba(148, 163, 184, 0.1)" />
                <YAxis tick={{ fontSize: 9 }} stroke="rgba(148, 163, 184, 0.1)" />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="custom-tooltip">
                        <p>{`Time: ${payload[0].payload.time}`}</p>
                        <p className="text-warning-light">{`Download: ${payload[0].value} MB/s`}</p>
                        {payload[1] && <p className="text-sky-400">{`Upload: ${payload[1].value} MB/s`}</p>}
                        {payload[2] && <p className="text-purple-400">{`Active Sockets: ${payload[2].value}`}</p>}
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area name="Download (MB/s)" type="monotone" dataKey="netDownload" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#netDown)" />
                <Area name="Upload (MB/s)" type="monotone" dataKey="netUpload" stroke="#0EA5E9" strokeWidth={1} fill="none" />
                <Line name="Active Sockets" type="monotone" dataKey="netConns" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ResourceMonitoring;
