import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Cpu,
  Database,
  HardDrive,
  Network,
  Play,
  Pause,
  Trash2,
  Plus,
  Sliders,
  Send,
  ArrowUpDown,
  History
} from 'lucide-react';
import { useAppContext } from '../App';

function ResourceAllocation() {
  const { addNotification } = useAppContext();
  
  // OS Simulator States
  const [processes, setProcesses] = useState([
    { pid: 1045, name: 'systemd', state: 'Running', priority: 'High' },
    { pid: 2110, name: 'nginx-worker', state: 'Running', priority: 'Medium' },
    { pid: 3108, name: 'mongodb-server', state: 'Running', priority: 'High' },
    { pid: 4892, name: 'python-ml-job', state: 'Waiting', priority: 'Low' },
    { pid: 5122, name: 'node-express', state: 'Running', priority: 'Medium' }
  ]);

  // Memory block states (Addresses)
  const [memoryBlocks, setMemoryBlocks] = useState([
    { id: '0x00FF', size: '2.0 GB', process: 'systemd', status: 'Allocated' },
    { id: '0x0F2E', size: '4.5 GB', process: 'mongodb-server', status: 'Allocated' },
    { id: '0x3E12', size: '1.5 GB', process: 'node-express', status: 'Allocated' },
    { id: '0x7C0A', size: '8.0 GB', process: 'Available', status: 'Free' }
  ]);

  // I/O device queues
  const [ioRequests, setIoRequests] = useState([
    { id: 1, device: 'Disk (SDA)', bytes: '12.4 MB', priority: 'Medium', status: 'Active' },
    { id: 2, device: 'Network (eth0)', bytes: '4.1 MB', priority: 'High', status: 'Queued' },
    { id: 3, device: 'Disk (SDA)', bytes: '95 KB', priority: 'Low', status: 'Queued' }
  ]);

  // Dynamic Assignment sliders
  const [cpuShare, setCpuShare] = useState(60);
  const [ramShare, setRamShare] = useState(8);
  const [diskShare, setDiskShare] = useState(50);
  const [netShare, setNetShare] = useState(50);

  // Input states
  const [newProcName, setNewProcName] = useState('');
  const [newProcPriority, setNewProcPriority] = useState('Medium');
  const [allocSize, setAllocSize] = useState('1.0');
  const [allocProc, setAllocProc] = useState('user-task');

  // Allocation apply status
  const [applying, setApplying] = useState(false);
  const [history, setHistory] = useState([]);

  // Fetch allocation audit logs on load
  const fetchAllocationHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${window.location.protocol}//${window.location.hostname}:5000/api/allocation/history?limit=5`, { headers });
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllocationHistory();
  }, []);

  // Process scheduler actions
  const handleStartProcess = (e) => {
    e.preventDefault();
    if (!newProcName) return;
    const pid = Math.floor(Math.random() * 8000) + 1000;
    const newP = {
      pid,
      name: newProcName,
      state: 'Running',
      priority: newProcPriority
    };
    setProcesses(prev => [...prev, newP]);
    addNotification(`Started process ${newProcName} (PID: ${pid})`, 'success');
    setNewProcName('');
  };

  const handleStopProcess = (pid, name) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    addNotification(`Killed process ${name} (PID: ${pid})`, 'warning');
  };

  const handleToggleSuspendProcess = (pid, name) => {
    setProcesses(prev => prev.map(p => {
      if (p.pid === pid) {
        const nextState = p.state === 'Running' ? 'Suspended' : 'Running';
        addNotification(`Process ${name} (PID: ${pid}) set to ${nextState}`, 'info');
        return { ...p, state: nextState };
      }
      return p;
    }));
  };

  // Memory manager actions
  const handleAllocateMemory = (e) => {
    e.preventDefault();
    if (!allocSize) return;
    
    // Find first free block or add block
    const sizeStr = `${allocSize} GB`;
    const blockId = '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
    
    const newBlock = {
      id: blockId,
      size: sizeStr,
      process: allocProc,
      status: 'Allocated'
    };

    setMemoryBlocks(prev => [newBlock, ...prev]);
    addNotification(`Allocated ${sizeStr} RAM page block to process: ${allocProc}`, 'success');
  };

  const handleReleaseMemory = (blockId) => {
    setMemoryBlocks(prev => prev.filter(b => b.id !== blockId));
    addNotification(`Deallocated memory block ${blockId}`, 'info');
  };

  // I/O scheduling prioritization
  const handlePrioritizeIo = (id) => {
    setIoRequests(prev => prev.map(req => {
      if (req.id === id) {
        const nextPriority = req.priority === 'High' ? 'Low' : req.priority === 'Medium' ? 'High' : 'Medium';
        addNotification(`I/O queue handle ${req.id} prioritized to ${nextPriority}`, 'info');
        return { ...req, priority: nextPriority };
      }
      return req;
    }));
  };

  // Dynamic Resource Controller Apply API
  const handleApplyAllocation = async () => {
    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${window.location.protocol}//${window.location.hostname}:5000/api/allocation/apply`, {
        cpuAllocated: cpuShare,
        memoryAllocated: ramShare,
        diskAllocated: diskShare,
        networkAllocated: netShare,
        recommendation: `Manual tuning rebalance: CPU ${cpuShare}%, Memory ${ramShare}GB, Disk ${diskShare}%, Net ${netShare}Mbps`
      }, { headers });

      if (response.data.success) {
        addNotification('Dynamic system resource allocations updated successfully!', 'success');
        fetchAllocationHistory();
      }
    } catch (err) {
      console.error(err);
      addNotification('Failed to apply allocations.', 'warning');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-sans">Operating System Resource Manager</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Simulated kernel scheduling control panels for execution processes, RAM boundaries, and Disk I/O queues.</p>
      </div>

      {/* Grid: Process scheduler & Memory manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Process Scheduler */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Cpu size={18} className="text-primary" /> Process Scheduler Queues
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">Priority Scheduler</span>
            </div>

            {/* Run process list table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="py-2 font-semibold">PID</th>
                    <th className="py-2 font-semibold">Process Name</th>
                    <th className="py-2 font-semibold">State</th>
                    <th className="py-2 font-semibold">Priority</th>
                    <th className="py-2 text-right font-semibold">Control</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map(proc => (
                    <tr key={proc.pid} className="border-b border-slate-50 dark:border-slate-800/40">
                      <td className="py-2.5 font-mono">{proc.pid}</td>
                      <td className="py-2.5 font-semibold">{proc.name}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          proc.state === 'Running' ? 'text-success' : 'text-warning'
                        }`}>
                          {proc.state}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium">{proc.priority}</td>
                      <td className="py-2.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleToggleSuspendProcess(proc.pid, proc.name)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          title={proc.state === 'Running' ? 'Suspend Task' : 'Resume Task'}
                        >
                          <Pause size={12} />
                        </button>
                        <button
                          onClick={() => handleStopProcess(proc.pid, proc.name)}
                          className="p-1 hover:bg-danger/10 rounded text-danger"
                          title="Terminate process"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add process form */}
          <form onSubmit={handleStartProcess} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3">
            <input
              type="text"
              value={newProcName}
              onChange={(e) => setNewProcName(e.target.value)}
              placeholder="Process name"
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:border-primary/50 col-span-2 text-slate-800 dark:text-slate-100"
              required
            />
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-1.5 px-3 rounded-md flex items-center justify-center gap-1">
              <Plus size={12} /> Execute
            </button>
          </form>
        </div>

        {/* 2. Memory Manager */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Database size={18} className="text-secondary" /> Dynamic Memory Allocation
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary">Virtual Partition</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {memoryBlocks.map(block => (
                <div key={block.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-lg flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">{block.id}</span>
                    <span className="font-bold">{block.size}</span>
                    <span className="text-slate-500">({block.process})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${block.status === 'Allocated' ? 'text-secondary' : 'text-success'}`}>
                      {block.status}
                    </span>
                    {block.status === 'Allocated' && (
                      <button
                        onClick={() => handleReleaseMemory(block.id)}
                        className="text-danger hover:underline font-bold text-[10px]"
                      >
                        Free
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAllocateMemory} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3">
            <input
              type="text"
              value={allocProc}
              onChange={(e) => setAllocProc(e.target.value)}
              placeholder="Proc association"
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none col-span-1 text-slate-800 dark:text-slate-100"
              required
            />
            <input
              type="number"
              step="0.1"
              value={allocSize}
              onChange={(e) => setAllocSize(e.target.value)}
              placeholder="GB"
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none col-span-1 text-slate-800 dark:text-slate-100"
              required
            />
            <button type="submit" className="bg-secondary hover:bg-secondary-dark text-white font-bold text-xs py-1.5 px-3 rounded-md flex items-center justify-center gap-1">
              <Plus size={12} /> Alloc Page
            </button>
          </form>
        </div>

      </div>

      {/* Grid: I/O scheduling & Resource Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* I/O Manager Requests */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <HardDrive size={18} className="text-success" /> Disk I/O Interrupt Handlers
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-success/10 text-success">I/O Queue</span>
          </div>

          <div className="space-y-3.5">
            {ioRequests.map(req => (
              <div key={req.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span>{req.device}</span>
                    <span className={`text-[9px] uppercase px-1 rounded ${
                      req.priority === 'High' ? 'bg-danger/25 text-danger' : req.priority === 'Medium' ? 'bg-primary/25 text-primary' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Packet Payload: {req.bytes}</div>
                </div>
                <button
                  onClick={() => handlePrioritizeIo(req.id)}
                  className="flex items-center gap-1 px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-[10px] text-slate-600 dark:text-slate-300 font-bold"
                >
                  <ArrowUpDown size={10} /> Prioritize
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Assignment Sliders (Resource Controller) */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sliders size={18} className="text-secondary" /> Dynamic Kernel Resource Controller
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary">Tune Allocation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              {/* CPU slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span>Max CPU Alloc Shares</span>
                  <span className="font-bold text-primary">{cpuShare}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cpuShare}
                  onChange={(e) => setCpuShare(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Memory Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span>Max RAM Partition Limit</span>
                  <span className="font-bold text-secondary">{ramShare} GB</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={ramShare}
                  onChange={(e) => setRamShare(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>

              {/* Disk Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span>Max Disk Bandwidth Shares</span>
                  <span className="font-bold text-success">{diskShare}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={diskShare}
                  onChange={(e) => setDiskShare(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-success"
                />
              </div>

              {/* Network Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span>Max Net Throttle Threshold</span>
                  <span className="font-bold text-warning">{netShare} Mbps</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={netShare}
                  onChange={(e) => setNetShare(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-warning"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
            <span className="text-[10px] text-slate-400">Sliders set hardware isolation quotas on kernel schedulers</span>
            <button
              onClick={handleApplyAllocation}
              disabled={applying}
              className="flex items-center gap-1.5 bg-secondary hover:bg-secondary-dark text-white font-bold text-xs py-2 px-4 rounded-md transition-all shadow-md shadow-secondary/15"
            >
              <Send size={12} /> {applying ? 'Applying Rebalance...' : 'Apply Allocation'}
            </button>
          </div>
        </div>

      </div>

      {/* Allocation Logs History */}
      <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <History size={16} className="text-slate-400" /> Allocation Execution logs (Audits)
        </h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="py-2">Time</th>
                <th className="py-2">CPU share</th>
                <th className="py-2">RAM Allocated</th>
                <th className="py-2">Disk Limit</th>
                <th className="py-2">Net Throttle</th>
                <th className="py-2">Status</th>
                <th className="py-2">Operator (Trigger)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log, idx) => (
                <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/40">
                  <td className="py-2.5 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 font-mono text-primary font-bold">{log.cpuAllocated}%</td>
                  <td className="py-2.5 font-mono text-secondary font-bold">{log.memoryAllocated} GB</td>
                  <td className="py-2.5 font-mono text-success font-bold">{log.diskAllocated}%</td>
                  <td className="py-2.5 font-mono text-warning font-bold">{log.networkAllocated} Mbps</td>
                  <td className="py-2.5"><span className="text-success font-bold font-mono">Applied</span></td>
                  <td className="py-2.5">{log.triggeredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default ResourceAllocation;
