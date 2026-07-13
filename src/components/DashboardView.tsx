import React, { useState, useEffect } from 'react';
import { TranslationSchema, Asset, ScanRecord } from '../types';
import { 
  Database, Radio, CheckCircle, AlertTriangle, Hammer, Calendar, Clock, 
  ArrowUpRight, PlusCircle, Scan, BarChart2, MapPin, Bell, ChevronRight, RefreshCw 
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
  user: any;
  assets: Asset[];
  scans: ScanRecord[];
  notifications: any[];
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export default function DashboardView({ 
  t, lang, user, assets, scans, notifications, onNavigate, onRefresh 
}: DashboardViewProps) {
  const [time, setTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute metrics
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'Active').length;
  const availableAssets = assets.filter(a => a.status === 'Available').length;
  const lostAssets = assets.filter(a => a.status === 'Lost').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Maintenance').length;

  // Today's scans count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayScansCount = scans.filter(s => s.date === todayStr).length;

  // Recent assets (last 3)
  const recentAssets = [...assets]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 3);

  // Latest scans (last 5)
  const latestScans = scans.slice(0, 5);

  // Unread notifications
  const unreadNotifs = notifications.filter(n => !n.read).slice(0, 3);

  // Format date
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    };
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ta-IN', options);
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Custom SVG Bar Chart Calculation (RFID scans weekly)
  const daysOfWeek = lang === 'en' 
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['திங்', 'செவ்', 'புத', 'வியா', 'வெள்', 'சனி', 'ஞா'];

  const getWeeklyScansData = () => {
    const counts = [12, 19, 8, 15, todayScansCount, 6, todayScansCount + 2]; // Simulated dynamic counts
    const maxCount = Math.max(...counts, 10);
    return counts.map((c, i) => ({
      day: daysOfWeek[i],
      count: c,
      height: (c / maxCount) * 100
    }));
  };

  const barData = getWeeklyScansData();

  return (
    <div id="dashboard_view" className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">
            {t.dashboard.welcome}, <span className="text-emerald-400">{user.name}</span>!
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            {lang === 'en' 
              ? `You are signed in as ${user.role}. System is actively tracking and scanning RF signals successfully.`
              : `நீங்கள் ${user.role} ஆக உள்நுழைந்துள்ளீர்கள். ஆர்.எஃப் சிிக்னல்கள் வெற்றிகரமாக கண்காணிக்கப்படுகின்றன.`}
          </p>
        </div>

        {/* Date Time Widgets */}
        <div className="flex items-center gap-4 text-xs font-semibold tracking-wider text-slate-400 shrink-0 border-l border-slate-800 md:pl-6 pl-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{formatDate(time)}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-emerald-400 font-mono">
            <Clock className="w-4 h-4" />
            <span>{formatTime(time)}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Assets */}
        <div id="stat_total" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</span>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-white tracking-tight">{totalAssets}</span>
            <span className="text-xs text-slate-400 font-medium">{t.dashboard.totalAssets}</span>
          </div>
        </div>

        {/* Active Assets */}
        <div id="stat_active" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/20 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-white tracking-tight">{activeAssets}</span>
            <span className="text-xs text-slate-400 font-medium">{t.dashboard.activeAssets}</span>
          </div>
        </div>

        {/* Available Assets */}
        <div id="stat_available" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-blue-500/20 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Available</span>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-white tracking-tight">{availableAssets}</span>
            <span className="text-xs text-slate-400 font-medium">{t.dashboard.availableAssets}</span>
          </div>
        </div>

        {/* Lost Assets */}
        <div id="stat_lost" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-rose-500/20 transition-all flex flex-col justify-between col-span-1">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Lost</span>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-white tracking-tight">{lostAssets}</span>
            <span className="text-xs text-slate-400 font-medium">{t.dashboard.lostAssets}</span>
          </div>
        </div>

        {/* Maintenance Assets */}
        <div id="stat_maintenance" className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/20 transition-all flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Hammer className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Care</span>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-white tracking-tight">{maintenanceAssets}</span>
            <span className="text-xs text-slate-400 font-medium">{t.dashboard.maintenanceAssets}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {t.dashboard.quickActions}
          </h3>
          <button onClick={onRefresh} className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg bg-slate-900">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={() => onNavigate('addAsset')}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold text-white">{t.nav.addAsset}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </button>

          <button 
            onClick={() => onNavigate('rfidScan')}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <Scan className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-white">{t.nav.rfidScan}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </button>

          <button 
            onClick={() => onNavigate('liveTracking')}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold text-white">{t.nav.liveTracking}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </button>

          <button 
            onClick={() => onNavigate('reports')}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-semibold text-white">{t.nav.reports}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Main Content Layout Block: Split Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Analytics and Recent Scan timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom SVG Analytics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
              {t.dashboard.todayScans} &amp; {lang === 'en' ? 'Weekly Active Signals' : 'வாராந்திர ஆர்.எஃப் சிக்னல்கள்'}
            </h3>
            
            {/* SVG graph */}
            <div className="relative h-48 flex items-end gap-3.5 pt-4 px-2 border-b border-slate-800">
              {barData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute top-[-30px] bg-slate-950 text-[10px] text-emerald-400 border border-slate-800 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono">
                    {d.count} scans
                  </div>
                  
                  {/* Column Bar */}
                  <div 
                    style={{ height: `${Math.max(d.height, 5)}%` }}
                    className="w-full bg-emerald-500/20 hover:bg-emerald-400/80 rounded-t-lg border-t border-x border-emerald-500/30 group-hover:border-emerald-400 transition-all cursor-pointer flex items-end justify-center"
                  >
                    <div className="w-2.5 h-[80%] bg-emerald-400/40 rounded-t-sm blur-[1px] group-hover:bg-white/30" />
                  </div>
                  
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom SVG Legend and Progress Indicators */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-800/50">
              <div>
                <span className="block text-xs font-semibold text-slate-500">{lang === 'en' ? 'Avg Daily Scans' : 'தினசரி சராசரி'}</span>
                <span className="text-base font-bold text-white">12.4</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500">{lang === 'en' ? 'Signal Strength' : 'ஆண்டெனா சிக்னல்'}</span>
                <span className="text-base font-bold text-emerald-400">98% Stable</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500">{lang === 'en' ? 'System Coverage' : 'கணினி எல்லை'}</span>
                <span className="text-base font-bold text-white">100% Online</span>
              </div>
            </div>
          </div>

          {/* Recent Added Assets */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {t.dashboard.recentAssets}
              </h3>
              <button onClick={() => onNavigate('assetList')} className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1">
                <span>View Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recentAssets.map((asset) => (
                <div key={asset.id} className="bg-slate-950/50 border border-slate-800/40 hover:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                  <div className="flex items-start gap-3.5">
                    <img 
                      src={asset.imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100'} 
                      alt={asset.name} 
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-white line-clamp-1">{asset.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1 items-center">
                        <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800">
                          {asset.id}
                        </span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {asset.rfidTag}
                        </span>
                        <span className="text-xs text-slate-500">• {asset.department}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t border-slate-900 sm:border-0 pt-2 sm:pt-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      asset.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                      asset.status === 'Available' ? 'bg-blue-500/10 text-blue-400' :
                      asset.status === 'Lost' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {asset.status}
                    </span>
                    <button 
                      onClick={() => onNavigate('assetList')}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: System Alerts and Live RFID feeds */}
        <div className="space-y-6">
          
          {/* System Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>{t.dashboard.alerts}</span>
              </h3>
              {unreadNotifs.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>

            <div className="space-y-3">
              {unreadNotifs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  {lang === 'en' ? 'All system alerts cleared.' : 'அனைத்து அமைப்பு விழிப்பூட்டல்களும் தீர்க்கப்பட்டன.'}
                </div>
              ) : (
                unreadNotifs.map((n) => (
                  <div key={n.id} className={`p-3.5 rounded-xl border text-xs relative ${
                    n.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300' :
                    n.type === 'warning' ? 'bg-amber-500/5 border-amber-500/10 text-amber-300' :
                    n.type === 'danger' ? 'bg-rose-500/5 border-rose-500/10 text-rose-300' :
                    'bg-blue-500/5 border-blue-500/10 text-blue-300'
                  }`}>
                    <span className="block font-bold mb-1">{n.title}</span>
                    <span className="block text-slate-400 leading-relaxed mb-2">{n.message}</span>
                    <span className="block text-[10px] font-medium text-slate-500">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live RFID Scan Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{t.dashboard.latestScans}</span>
            </h3>

            <div className="flow-root">
              <ul className="-mb-8">
                {latestScans.map((scan, scanIdx) => (
                  <li key={scan.id}>
                    <div className="relative pb-8">
                      {scanIdx !== latestScans.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                            <Scan className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs font-semibold text-white">
                              {scan.assetName}{' '}
                              <span className="text-slate-400 font-normal">scanned at</span>{' '}
                              <span className="text-emerald-400 font-bold">{scan.location}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              By {scan.employee} • <span className="font-mono text-emerald-500/80">{scan.rfidTag}</span>
                            </p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-slate-500">
                            <span className="block font-bold text-slate-400">{scan.time}</span>
                            <span>{scan.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
