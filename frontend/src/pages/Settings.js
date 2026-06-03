import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Settings as SettingsIcon,
  Shield,
  Sliders,
  Bell,
  Cpu,
  Database,
  HardDrive,
  Network,
  Save,
  Lock,
  Loader2
} from 'lucide-react';
import { useAppContext } from '../App';

function Settings() {
  const { addNotification, user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Settings states
  const [cpuThreshold, setCpuThreshold] = useState(85);
  const [memoryThreshold, setMemoryThreshold] = useState(80);
  const [diskThreshold, setDiskThreshold] = useState(90);
  const [networkThreshold, setNetworkThreshold] = useState(75);
  const [socketInterval, setSocketInterval] = useState(2000);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${window.location.protocol}//${window.location.hostname}:5000/api/settings`, { headers });
      
      if (response.data.success) {
        const data = response.data.data;
        setCpuThreshold(data.cpuThreshold);
        setMemoryThreshold(data.memoryThreshold);
        setDiskThreshold(data.diskThreshold);
        setNetworkThreshold(data.networkThreshold);
        setSocketInterval(data.socketInterval);
      }
    } catch (err) {
      console.error('Error fetching settings details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      addNotification('Configure Thresholds: Operator profile unauthorized. Admin access required.', 'warning');
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(`${window.location.protocol}//${window.location.hostname}:5000/api/settings`, {
        cpuThreshold,
        memoryThreshold,
        diskThreshold,
        networkThreshold,
        socketInterval
      }, { headers });

      if (response.data.success) {
        addNotification('System alert configurations saved successfully!', 'success');
        fetchSettings();
      }
    } catch (err) {
      console.error('Failed saving configurations:', err);
      addNotification('Failed to update configurations.', 'warning');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-300 dark:bg-slate-800 rounded"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-sans">Settings & Threshold Configs</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Configure real-time monitoring thresholds and telemetry refresh timings.</p>
      </div>

      {/* Warning banner if not admin */}
      {!isAdmin && (
        <div className="p-4 bg-warning/10 border border-warning/30 text-warning text-xs font-semibold rounded-lg flex items-center gap-2">
          <Lock size={16} />
          <span>System Manager Role: Configurations are locked in read-only mode. Administrator profile authorization required to edit.</span>
        </div>
      )}

      {/* Settings Form Card */}
      <div className="p-6 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
        <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Sliders size={18} className="text-primary" /> Telemetry Notification Limits
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-sans">
          
          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* CPU */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><Cpu size={14} /> CPU Warning Threshold</span>
                <span className="font-mono text-primary">{cpuThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={cpuThreshold}
                disabled={!isAdmin}
                onChange={(e) => setCpuThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-400">Triggers rebalancing suggestions when CPU utilization breaches limit.</p>
            </div>

            {/* Memory */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><Database size={14} /> RAM Warning Threshold</span>
                <span className="font-mono text-secondary">{memoryThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={memoryThreshold}
                disabled={!isAdmin}
                onChange={(e) => setMemoryThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-secondary disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-400">Triggers RAM swap allocation suggestions when memory breaches limit.</p>
            </div>

            {/* Disk */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><HardDrive size={14} /> Disk Storage Warning Limit</span>
                <span className="font-mono text-success">{diskThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="98"
                value={diskThreshold}
                disabled={!isAdmin}
                onChange={(e) => setDiskThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-success disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-400">Triggers storage rebalancing events when disk spaces decrease below values.</p>
            </div>

            {/* Network */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><Network size={14} /> Socket Bandwidth Warning</span>
                <span className="font-mono text-warning">{networkThreshold}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={networkThreshold}
                disabled={!isAdmin}
                onChange={(e) => setNetworkThreshold(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-warning disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-400">Triggers band isolation throttle rules when active traffic breaches thresholds.</p>
            </div>

          </div>

          {/* Core Configuration values */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">Telemetry Socket Refresh Delay (ms)</label>
              <input
                type="number"
                value={socketInterval}
                disabled={!isAdmin}
                onChange={(e) => setSocketInterval(parseInt(e.target.value))}
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-md focus:outline-none"
                placeholder="2000"
                min="500"
                max="10000"
                required
              />
              <p className="text-[10px] text-slate-400">Configures telemetry socket update periods. Recommended values: 2000ms.</p>
            </div>

            {/* User Role Details info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/40 rounded-lg flex items-start gap-3">
              <Shield size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Security & Schedulers Policy</span>
                <p className="mt-1 text-[10px] text-slate-400 leading-relaxed">
                  Only verified accounts with administrator role authorizations can rewrite dynamic limits to the MongoDB database system parameters.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          {isAdmin && (
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={updating}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-5 rounded-lg shadow-md transition-all"
              >
                {updating ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={12} /> Save Configurations
                  </>
                )}
              </button>
            </div>
          )}

        </form>
      </div>

    </div>
  );
}

export default Settings;
