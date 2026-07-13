import React, { useState } from 'react';
import { TranslationSchema } from '../types';
import { 
  Settings, Globe, Moon, Sun, Bell, Shield, ToggleLeft, ToggleRight, 
  RefreshCw, Cpu, Volume2, Database, KeyRound, Radio 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
  setLang: (lang: 'en' | 'ta') => void;
}

export default function SettingsView({ t, lang, setLang }: SettingsViewProps) {
  // Mock Settings states
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [muteSound, setMuteSound] = useState(false);
  
  // Notification filters state
  const [notifAdded, setNotifAdded] = useState(true);
  const [notifDeleted, setNotifDeleted] = useState(true);
  const [notifScans, setNotifScans] = useState(true);
  const [notifLost, setNotifLost] = useState(true);

  // IoT configs
  const [pollRate, setPollRate] = useState('3000');
  const [antennaGain, setAntennaGain] = useState('high');

  return (
    <div id="settings_view" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Settings Intro - Left column */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Settings className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              Central Preferences
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">{t.nav.settings}</h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Configure system alerts, IoT telemetry ping rates, and localization channels. Changes apply to your local console session immediately.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
          <span>Firmware Version: v4.1.2-beta</span>
          <span className="block">Hardware Link Node: RF-NODE-89</span>
        </div>
      </div>

      {/* Preferences Modules - Right Columns */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Language & Localizaton Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Language Localization</span>
          </h3>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="block text-xs font-semibold text-white">System Language Switcher</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Toggle interface translation instantly</span>
            </div>

            <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs text-slate-300">
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  lang === 'en' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'hover:text-white'
                }`}
              >
                English (US)
              </button>
              <button 
                onClick={() => setLang('ta')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  lang === 'ta' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'hover:text-white'
                }`}
              >
                தமிழ் (Tamil)
              </button>
            </div>
          </div>
        </div>

        {/* Visual Settings Theme */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Moon className="w-4 h-4 text-emerald-400" />
            <span>Visual Theme Controls</span>
          </h3>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="block text-xs font-semibold text-white">Color Mode Selection</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Default Slate theme matches telemetry eye safety guidelines</span>
            </div>

            <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs text-slate-300">
              <button 
                onClick={() => {
                  setThemeMode('dark');
                  alert('Slate Dark Theme is optimized for industrial console tracking.');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  themeMode === 'dark' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Slate Dark</span>
              </button>
              <button 
                onClick={() => {
                  setThemeMode('light');
                  alert('This system enforces high-contrast, eye-safe Dark Slate Theme for telemetry consistency. Light theme simulated.');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  themeMode === 'light' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Classic Light</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Alert Notification filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>{t.dashboard.alerts} Preferences</span>
          </h3>

          <div className="divide-y divide-slate-800/40 text-xs text-slate-300">
            {/* Row 1 */}
            <div className="py-3 flex justify-between items-center">
              <div>
                <span className="block font-semibold">Asset Enrollment Alerts</span>
                <span className="block text-[10px] text-slate-500">Log notification when new hardware tag enrolled</span>
              </div>
              <button onClick={() => setNotifAdded(!notifAdded)}>
                {notifAdded ? <ToggleRight className="w-9 h-9 text-emerald-400 cursor-pointer" /> : <ToggleLeft className="w-9 h-9 text-slate-600 cursor-pointer" />}
              </button>
            </div>

            {/* Row 2 */}
            <div className="py-3 flex justify-between items-center">
              <div>
                <span className="block font-semibold">Asset Retirement Deletions</span>
                <span className="block text-[10px] text-slate-500">Alert administrators on database purges</span>
              </div>
              <button onClick={() => setNotifDeleted(!notifDeleted)}>
                {notifDeleted ? <ToggleRight className="w-9 h-9 text-emerald-400 cursor-pointer" /> : <ToggleLeft className="w-9 h-9 text-slate-600 cursor-pointer" />}
              </button>
            </div>

            {/* Row 3 */}
            <div className="py-3 flex justify-between items-center">
              <div>
                <span className="block font-semibold">Active Scans Logs</span>
                <span className="block text-[10px] text-slate-500">Notify upon successful antenna pings</span>
              </div>
              <button onClick={() => setNotifScans(!notifScans)}>
                {notifScans ? <ToggleRight className="w-9 h-9 text-emerald-400 cursor-pointer" /> : <ToggleLeft className="w-9 h-9 text-slate-600 cursor-pointer" />}
              </button>
            </div>

            {/* Row 4 */}
            <div className="py-3 flex justify-between items-center">
              <div>
                <span className="block font-semibold">Critical Asset Lost Alarms</span>
                <span className="block text-[10px] text-rose-400 font-medium">Sound alarm immediately when assets bypass security gate</span>
              </div>
              <button onClick={() => setNotifLost(!notifLost)}>
                {notifLost ? <ToggleRight className="w-9 h-9 text-emerald-400 cursor-pointer" /> : <ToggleLeft className="w-9 h-9 text-slate-600 cursor-pointer" />}
              </button>
            </div>
          </div>
        </div>

        {/* Hardware Antenna and IoT Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>IoT Receiver Antenna Gain Setup</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="space-y-1.5">
              <label className="block text-slate-500 font-semibold uppercase text-[10px]">Telemetry Polling Rate</label>
              <select
                value={pollRate}
                onChange={(e) => {
                  setPollRate(e.target.value);
                  alert(`Handshake interval configured: ${e.target.value}ms`);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
              >
                <option value="1000">1000ms (High Frequency)</option>
                <option value="3000">3000ms (Standard Optimal)</option>
                <option value="10000">10000ms (Power Saver)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-500 font-semibold uppercase text-[10px]">Interrogator Signal Gain</label>
              <select
                value={antennaGain}
                onChange={(e) => {
                  setAntennaGain(e.target.value);
                  alert(`Signal range threshold tweaked: ${e.target.value}`);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
              >
                <option value="low">Low Range (+15 dBm)</option>
                <option value="standard">Standard Range (+22 dBm)</option>
                <option value="high">Long Range Ultra (+30 dBm)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
