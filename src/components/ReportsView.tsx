import React, { useState, useEffect } from 'react';
import { TranslationSchema, Asset, ScanRecord } from '../types';
import { api } from '../lib/api';
import { 
  BarChart3, FileSpreadsheet, FileDown, PieChart, TrendingUp, 
  Layers, Database, Calendar, Download, Printer, RefreshCw 
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
  assets: Asset[];
  scans: ScanRecord[];
}

interface StatsSchema {
  statusStats: {
    total: number;
    active: number;
    available: number;
    lost: number;
    maintenance: number;
  };
  departmentStats: { name: string; count: number }[];
  categoryStats: { name: string; count: number }[];
  scanTimeline: { date: string; label: string; count: number }[];
  totalScans: number;
}

export default function ReportsView({ t, lang, assets, scans }: ReportsViewProps) {
  const [stats, setStats] = useState<StatsSchema | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching reporting stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [assets, scans]);

  // Export structured Excel (CSV)
  const exportToCSV = () => {
    if (assets.length === 0) return;

    const headers = ['Asset ID', 'RFID Tag', 'Asset Name', 'Category', 'Department', 'Purchase Date', 'Warranty Date', 'Custodian', 'Current Location', 'Status', 'Description'];
    const rows = assets.map(a => [
      a.id,
      a.rfidTag,
      `"${a.name.replace(/"/g, '""')}"`,
      a.category,
      a.department,
      a.purchaseDate,
      a.warrantyDate,
      a.assignedEmployee,
      `"${a.currentLocation.replace(/"/g, '""')}"`,
      a.status,
      `"${(a.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RFID_Asset_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF (optimized print layout)
  const triggerPrintPDF = () => {
    window.print();
  };

  if (loading || !stats) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Compiling organization asset intelligence statistics...</p>
      </div>
    );
  }

  // Segment colors for SVG Donut/Pie chart
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Calculations for custom SVG Pie/Donut Chart
  const renderCategoryDonut = () => {
    const totalCount = stats.categoryStats.reduce((sum, item) => sum + item.count, 0) || 1;
    let accumulatedAngle = 0;

    return (
      <svg className="w-48 h-48" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />
        {stats.categoryStats.map((item, index) => {
          const percentage = item.count / totalCount;
          const strokeDash = percentage * 2 * Math.PI * 34; // 34 is radius
          const offset = 2 * Math.PI * 34 - strokeDash;
          const rotationAngle = (accumulatedAngle / totalCount) * 360;
          accumulatedAngle += item.count;

          return (
            <circle
              key={index}
              cx="50"
              cy="50"
              r="34"
              fill="transparent"
              stroke={COLORS[index % COLORS.length]}
              strokeWidth="11"
              strokeDasharray={`${strokeDash} ${2 * Math.PI * 34}`}
              strokeDashoffset={-offset}
              transform={`rotate(${rotationAngle - 90} 50 50)`}
              style={{ transition: 'all 0.5s ease-in-out' }}
              className="hover:stroke-[13px] cursor-pointer"
            >
              <title>{item.name}: {item.count} assets ({Math.round(percentage * 100)}%)</title>
            </circle>
          );
        })}
        {/* Inner core to make it a premium donut */}
        <circle cx="50" cy="50" r="24" fill="#0f172a" />
        <text x="50" y="47" textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">TOTAL</text>
        <text x="50" y="57" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="11" fontWeight="extrabold">{totalCount}</text>
      </svg>
    );
  };

  // Calculations for dynamic SVG Line Chart (weekly rfid scans frequency)
  const renderWeeklyLineChart = () => {
    const data = stats.scanTimeline;
    if (data.length === 0) return null;

    const maxCount = Math.max(...data.map(d => d.count), 5);
    const width = 600;
    const height = 180;
    const padding = 30;

    const points = data.map((d, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - (d.count * (height - 2 * padding)) / maxCount;
      return { x, y, count: d.count, label: d.label };
    });

    const pathData = points.reduce((path, p, index) => {
      return index === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, '');

    // Area fill path data
    const areaPathData = points.length > 0
      ? `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : '';

    return (
      <svg className="w-full h-48" viewBox={`0 0 ${width} ${height}`}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = padding + p * (height - 2 * padding);
          const gridVal = Math.round(maxCount * (1 - p));
          return (
            <g key={i} opacity="0.15">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#94a3b8" strokeWidth="1" />
              <text x={padding - 5} y={y + 3} fill="#94a3b8" fontSize="9" textAnchor="end">{gridVal}</text>
            </g>
          );
        })}

        {/* Shaded Area fill under the line */}
        <path d={areaPathData} fill="url(#lineGradient)" opacity="0.12" />

        {/* Smooth Curved Line */}
        <path d={pathData} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points anchors */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="8" fill="transparent" className="hover:fill-emerald-500/10" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono">
              {p.count}
            </text>
            <text x={p.x} y={height - padding + 15} textAnchor="middle" fill="#475569" fontSize="9" fontWeight="bold" className="uppercase tracking-wider">
              {p.label}
            </text>
          </g>
        ))}

        {/* Linear gradient definition for line fill */}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Calculations for vertical Department-wise distribution Bar Graph
  const renderDepartmentBarGraph = () => {
    const data = stats.departmentStats;
    if (data.length === 0) return null;

    const maxCount = Math.max(...data.map(d => d.count), 3);

    return (
      <div className="space-y-3.5">
        {data.map((item, index) => {
          const percentage = (item.count / maxCount) * 100;
          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white truncate pr-2">{item.name}</span>
                <span className="font-mono text-emerald-400 font-bold">{item.count} assets</span>
              </div>
              <div className="h-2.5 bg-slate-950 border border-slate-900 rounded-full overflow-hidden flex">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                    animationDelay: `${index * 100}ms`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="reports_view" className="space-y-6 font-sans">
      
      {/* Exporters and Title row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{t.reports.title}</h2>
          <p className="text-xs text-slate-400">
            {lang === 'en' 
              ? 'Compile and download hardware inventory metrics, status classifications, and weekly scan logs.'
              : 'சொத்து விவரங்கள், நிலைப்பாடுகள் மற்றும் வாராந்திர ஸ்கேன் பகுப்பாய்வு அறிக்கையைப் பதிவிறக்கவும்.'}
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={triggerPrintPDF}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{t.reports.exportPdf}</span>
          </button>

          <button
            onClick={exportToCSV}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.reports.exportExcel}</span>
          </button>
        </div>
      </div>

      {/* Structured metrics summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-black text-white font-mono">{stats.statusStats.total}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-1">Total Assets Enrolled</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-black text-emerald-400 font-mono">{stats.statusStats.active}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-1">Active IoT Transmitters</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-black text-rose-400 font-mono">{stats.statusStats.lost}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-1">Assets Reported Lost</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-center">
          <span className="block text-2xl font-black text-white font-mono">{stats.totalScans}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-1">Cumulative RFID Scans</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Curve Line chart - scan frequencies */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{t.reports.scanCount}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Last 7 days timeline</span>
          </div>

          <div className="py-2">
            {renderWeeklyLineChart()}
          </div>
        </div>

        {/* Donut chart - Categories */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-6">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>{t.reports.distributionCategory}</span>
            </h3>

            <div className="flex justify-center items-center py-4">
              {renderCategoryDonut()}
            </div>
          </div>

          {/* Color Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] mt-4 border-t border-slate-800/50 pt-4">
            {stats.categoryStats.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-400 truncate">{item.name}</span>
                <span className="font-mono text-white font-bold shrink-0">({item.count})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Department-wise asset distribution Bar Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department allocations vertical bars */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{t.reports.distributionDept}</span>
          </h3>

          <div className="py-2">
            {renderDepartmentBarGraph()}
          </div>
        </div>

        {/* PDF Printing layout notes instructions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Reporting Guidelines
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This intelligence console extracts structural tags live. Select <strong>Export Intelligence PDF</strong> to open your browser’s printer dialogue formatted for structured landscape sheets.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exported excel sheet downloads standard <code>UTF-8 CSV</code> structures immediately mapped with comma delimiters compatible with Google Sheets, Microsoft Excel, and warehouse inventory nodes.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/50 mt-4 text-[10px] text-slate-500 font-mono">
            Generated node: RFID-NODE-58CB
          </div>
        </div>

      </div>

    </div>
  );
}
