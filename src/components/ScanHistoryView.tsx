import React, { useState } from 'react';
import { TranslationSchema, ScanRecord } from '../types';
import { 
  Search, Filter, ArrowUpDown, Clock, Download, 
  MapPin, User, Scan, Tag, ShieldAlert 
} from 'lucide-react';
import { motion } from 'motion/react';

interface ScanHistoryViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
  scans: ScanRecord[];
}

export default function ScanHistoryView({ t, lang, scans }: ScanHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Locations list from scans
  const locations = ['All', 'Main Data Center - Rack 4', 'ICU Ward B - Room 104', 'Loading Dock East Wing', 'Warehouse A Corridor 1', 'Quality Control Unit', 'Research Wing Security Gate', 'Main Lecture Auditorium B'];

  // Filter scan history
  const filteredScans = scans.filter(s => {
    const matchesSearch = 
      s.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employee.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLoc = selectedLoc === 'All' || s.location === selectedLoc;
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;

    return matchesSearch && matchesLoc && matchesStatus;
  });

  // Sort scan history
  const sortedScans = [...filteredScans].sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Export to CSV
  const exportScansToCSV = () => {
    if (scans.length === 0) return;

    const headers = ['Scan ID', 'RFID Tag ID', 'Asset Name', 'Date', 'Time', 'Location Zone', 'Status Logged', 'Scanned By'];
    const rows = scans.map(s => [
      s.id,
      s.rfidTag,
      `"${s.assetName.replace(/"/g, '""')}"`,
      s.date,
      s.time,
      `"${s.location.replace(/"/g, '""')}"`,
      s.status,
      s.employee
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RFID_Scan_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="scan_history_view" className="space-y-6 font-sans">
      
      {/* Title & Exporter Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{t.nav.scanHistory}</h2>
          <p className="text-xs text-slate-400">
            {lang === 'en' 
              ? 'Complete audit trails of physical antenna signals, handshakes, and operator scans.'
              : 'ஆர்.எஃப்.ஐ.டி சிக்னல்கள், ஆண்டெனா இணைப்புகள் மற்றும் ஸ்கேன் செய்யப்பட்ட விவரங்களின் முழு வரலாறு.'}
          </p>
        </div>

        <button
          onClick={exportScansToCSV}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export History (CSV)</span>
        </button>
      </div>

      {/* Filter and search panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Asset, Tag, Employee..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
            >
              <option value="timestamp">Sort: Time Logged</option>
              <option value="assetName">Sort: Asset Title</option>
              <option value="rfidTag">Sort: RFID Tag ID</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter Scanner Location</label>
            <select
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Antenna Stations' : loc}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter Status Recorded</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Available">Available</option>
              <option value="Lost">Lost</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

      </div>

      {/* History table list */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-4 px-6">Interrogator Signal</th>
                <th className="py-4 px-6">Linked Asset Name</th>
                <th className="py-4 px-6">Date / Timestamp</th>
                <th className="py-4 px-6">Scan Location</th>
                <th className="py-4 px-6">Logged Custodian</th>
                <th className="py-4 px-6 text-center">Tag Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
              {sortedScans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No matching scan audit trails found.
                  </td>
                </tr>
              ) : (
                sortedScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-950/20 transition-all">
                    <td className="py-4 px-6 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Scan className="w-3.5 h-3.5 text-slate-500" />
                        <span>{scan.rfidTag}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      {scan.assetName}
                    </td>
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <div>
                          <span className="block font-bold text-slate-300">{scan.time}</span>
                          <span className="block text-[10px] text-slate-500">{scan.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 whitespace-nowrap font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{scan.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{scan.employee}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        scan.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                        scan.status === 'Available' ? 'bg-blue-500/10 text-blue-400' :
                        scan.status === 'Lost' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
