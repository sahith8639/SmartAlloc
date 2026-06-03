import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  Download,
  Plus,
  Loader2,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useAppContext } from '../App';

function Reports() {
  const { addNotification, user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [reportSummary, setReportSummary] = useState('');

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${window.location.protocol}//${window.location.hostname}:5000/api/reports`, { headers });
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(`${window.location.protocol}//${window.location.hostname}:5000/api/reports/generate`, {
        format: selectedFormat,
        summary: reportSummary || `Intelligent OS diagnostics performance logs audit generated in ${selectedFormat} format.`
      }, { headers });

      if (response.data.success) {
        addNotification(`Report generated successfully!`, 'success');
        setReportSummary('');
        fetchReports();
      }
    } catch (err) {
      console.error('Report compilation failed:', err);
      addNotification('Failed to compile report.', 'warning');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report) => {
    const token = localStorage.getItem('token');
    const downloadUrl = `${window.location.protocol}//${window.location.hostname}:5000${report.downloadUrl}&user=${user?.username || 'Operator'}&token=${token}`;
    // Open in new window to trigger direct download attachment
    window.open(downloadUrl, '_blank');
    addNotification(`Downloading report: ${report.name}`, 'info');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-300 dark:bg-slate-800 rounded"></div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight font-sans">Diagnostics Reports Center</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Generate and export system metrics, predictions, and kernel reallocations history logs.</p>
      </div>

      {/* Grid: Create report & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Report Form */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl lg:col-span-2">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary" /> Compile Diagnostics Audit Sheet
          </h3>
          
          <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
            {/* Format selection */}
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-2">Export Format</label>
              <div className="grid grid-cols-3 gap-4">
                {['PDF', 'CSV', 'Excel'].map((format) => (
                  <label
                    key={format}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer font-bold transition-all ${
                      selectedFormat === format
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={selectedFormat === format}
                      onChange={() => setSelectedFormat(format)}
                      className="hidden"
                    />
                    {format === 'PDF' ? <FileText size={16} /> : <FileSpreadsheet size={16} />}
                    {format}
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Audit Notes (Optional)</label>
              <textarea
                value={reportSummary}
                onChange={(e) => setReportSummary(e.target.value)}
                placeholder="Include custom summary notes for the diagnostics header..."
                className="w-full min-h-[80px] p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary/50 text-slate-800 dark:text-slate-100 rounded-lg"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-md focus:outline-none transition-all"
              >
                {generating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Compiling Document...
                  </>
                ) : (
                  <>
                    <FileText size={14} /> Generate & Save Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-slate-400" /> Export Guide
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
              <p>
                <strong className="text-slate-800 dark:text-slate-200">PDF Document:</strong> Compiles styled HTML audit grids containing CPU graphs, predictions confidence indexes, and kernel triggers. Optimised for print-to-PDF layout.
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">CSV Spreadsheet:</strong> Raw chronological telemetry dump of metrics, forecast margins, allocations audits, and latencies.
              </p>
              <p>
                <strong className="text-slate-800 dark:text-slate-200">Excel Spreadsheet:</strong> XML-compatible format formatted directly for quick analysis inside Excel and BI engines.
              </p>
            </div>
          </div>
          <div className="p-3 mt-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg flex items-center gap-2 text-[10px] text-slate-400">
            <CheckCircle size={12} className="text-success shrink-0" />
            <span>Telemetry data compiled dynamically from MongoDB</span>
          </div>
        </div>

      </div>

      {/* Reports Log List */}
      <div className="p-5 bg-white dark:bg-cardDark border border-slate-200 dark:border-slate-800 rounded-xl">
        <h3 className="text-sm font-bold mb-4">Saved Audits Log</h3>
        
        {reports.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No reports compiled yet</div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="py-2">Report Name</th>
                  <th className="py-2">Format</th>
                  <th className="py-2">Compiled By</th>
                  <th className="py-2">Created Date</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="border-b border-slate-50 dark:border-slate-800/40">
                    <td className="py-3 font-semibold flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      {report.name}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        report.format === 'PDF'
                          ? 'bg-danger/10 text-danger border border-danger/20'
                          : 'bg-success/10 text-success border border-success/20'
                      }`}>
                        {report.format}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{report.createdBy}</td>
                    <td className="py-3 font-mono">{new Date(report.timestamp).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDownload(report)}
                        className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1 px-2.5 rounded font-bold text-[10px] text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <Download size={10} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default Reports;
