import React, { useState, useEffect } from 'react';
import { TranslationSchema, IoTTelemetry } from '../types';
import { api } from '../lib/api';
import { 
  Map, Play, Pause, RefreshCw, Cpu, Battery, Radio, 
  Thermometer, Clock, Activity, CornerDownRight, Shield, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveTrackingViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
}

export default function LiveTrackingView({ t, lang }: LiveTrackingViewProps) {
  const [telemetry, setTelemetry] = useState<IoTTelemetry | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTelemetry = async () => {
    try {
      const data = await api.getLiveTelemetry();
      setTelemetry(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to poll telemetry.');
    }
  };

  // Poll telemetry every 3 seconds if simulation is active
  useEffect(() => {
    fetchTelemetry();
    if (!isSimulating) return;

    const interval = setInterval(() => {
      fetchTelemetry();
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  return (
    <div id="live_tracking_view" className="space-y-6 font-sans">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{t.liveTracking.title}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'en' 
              ? 'Real-time positioning coordinate engine active. Active antenna handshake updates every 3 seconds.'
              : 'நிகழ்நேர கண்காணிப்பு பலகை. 3 விநாடிகளுக்கு ஒரு முறை சிக்னல் மாற்றியமைக்கப்படுகிறது.'}
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={fetchTelemetry}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Force Signal Ping"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleSimulation}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isSimulating 
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20' 
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isSimulating ? 'Pause IoT Beacon' : 'Resume IoT Beacon'}</span>
          </button>
        </div>
      </div>

      {telemetry ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Map tracking area - Left 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* High Tech Vector Map Canvas */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden shadow-2xl min-h-[440px] flex flex-col justify-between">
              
              {/* Radar glowing overlays */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/[0.015] rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/[0.015] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />

              {/* Map Information overlay header */}
              <div className="z-10 flex justify-between items-start bg-slate-900/80 backdrop-blur border border-slate-800/60 p-4 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tracking Asset Node</span>
                  <h4 className="text-sm font-semibold text-white">{telemetry.assetName}</h4>
                  <div className="flex gap-2 text-[10px] font-mono text-slate-400 mt-1">
                    <span>ID: {telemetry.assetId}</span>
                    <span>•</span>
                    <span className="text-emerald-400">Tag: {telemetry.rfidTag}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Coordinates</span>
                  <div className="text-xs font-mono text-white font-bold mt-1">
                    X: {telemetry.coordinates.x} px • Y: {telemetry.coordinates.y} px
                  </div>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-bold mt-1 uppercase tracking-wider">
                    {t.liveTracking.liveIndicator}
                  </span>
                </div>
              </div>

              {/* Map Body Canvas showing Facility grid and animated coordinate marker */}
              <div className="relative flex-1 flex items-center justify-center p-4 py-8">
                
                {/* SVG Blueprint Plan */}
                <svg className="w-full max-w-2xl aspect-[16/9] border border-slate-800 bg-slate-900/30 rounded-2xl p-4 shadow-inner" viewBox="0 0 1000 400">
                  
                  {/* Grid Lines */}
                  <line x1="500" y1="0" x2="500" y2="400" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="1" />
                  <line x1="0" y1="200" x2="1000" y2="200" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="1" />

                  {/* Draw Rooms / Facilities Blueprint Zones */}
                  <g opacity="0.3" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" fill="none">
                    {/* Data center Zone top right */}
                    <rect x="700" y="30" width="260" height="150" rx="10" />
                    <text x="715" y="55" fill="#94a3b8" fontSize="11" fontWeight="bold" stroke="none">Main Data Center</text>

                    {/* ICU Ward Room top left */}
                    <rect x="40" y="30" width="300" height="140" rx="10" />
                    <text x="55" y="55" fill="#94a3b8" fontSize="11" fontWeight="bold" stroke="none">ICU Ward &amp; Patient Suites</text>

                    {/* Warehouse Corridor Bottom left */}
                    <rect x="40" y="220" width="280" height="150" rx="10" />
                    <text x="55" y="245" fill="#94a3b8" fontSize="11" fontWeight="bold" stroke="none">Warehouse Main Bay</text>

                    {/* Quality control middle bottom */}
                    <rect x="450" y="190" width="200" height="180" rx="10" />
                    <text x="465" y="215" fill="#94a3b8" fontSize="11" fontWeight="bold" stroke="none">Quality Control Bay</text>
                  </g>

                  {/* Connecting Transit Path Line */}
                  <polyline 
                    points={telemetry.path.map(p => `${p.x},${p.y}`).join(' ')} 
                    fill="none" 
                    stroke="rgba(16, 185, 129, 0.15)" 
                    strokeWidth="3" 
                    strokeDasharray="6,6"
                  />

                  {/* Last Known Path trace up to index */}
                  <polyline 
                    points={telemetry.path.slice(0, telemetry.pathIndex + 1).map(p => `${p.x},${p.y}`).join(' ')} 
                    fill="none" 
                    stroke="rgba(16, 185, 129, 0.4)" 
                    strokeWidth="3.5" 
                  />

                  {/* Fixed zone beacons anchors */}
                  <g fill="#475569" opacity="0.6">
                    {telemetry.path.map((pt, i) => (
                      <g key={i} transform={`translate(${pt.x}, ${pt.y})`}>
                        <circle r="4" fill={telemetry.pathIndex === i ? '#34d399' : '#1e293b'} stroke="#475569" strokeWidth="1" />
                      </g>
                    ))}
                  </g>

                  {/* Animated Beacon Marker Target displaying current coordinate */}
                  <g transform={`translate(${telemetry.coordinates.x}, ${telemetry.coordinates.y})`}>
                    
                    {/* Multiple Glowing pulsing concentric circles */}
                    <circle r="22" fill="rgba(16, 185, 129, 0.12)" className="animate-ping" style={{ animationDuration: '3s' }} />
                    <circle r="14" fill="rgba(16, 185, 129, 0.22)" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                    
                    {/* Direct point circle */}
                    <circle r="7.5" fill="#34d399" stroke="#0f172a" strokeWidth="2.5" />
                    
                    {/* Small inner antenna core point */}
                    <circle r="2" fill="#fff" />
                  </g>

                </svg>

              </div>

              {/* Map Footer status */}
              <div className="z-10 bg-slate-900 border border-slate-800 p-3 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.liveTracking.currentLoc}</span>
                  <span className="font-semibold text-white truncate block">{telemetry.currentZone}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.liveTracking.lastKnownLoc}</span>
                  <span className="font-semibold text-slate-400 truncate block">{telemetry.lastKnownZone}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Beacon Handshake</span>
                  <span className="font-mono text-emerald-400 font-bold block">100% Signal Locked</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tracking Refresh Rate</span>
                  <span className="font-mono text-white block">Interval: 3000ms</span>
                </div>
              </div>

            </div>

          </div>

          {/* Hardware Telemetry stats & timeline details - Right Column */}
          <div className="space-y-6">
            
            {/* Telemetry gauges */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {t.liveTracking.telemetry}
              </h3>

              <div className="space-y-3.5">
                {/* Battery */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                      <Battery className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.liveTracking.battery}</span>
                      <span className="text-xs text-slate-400">Integrated Lithium cell</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white font-mono">{telemetry.batteryLevel}%</span>
                    <div className="w-16 h-1.5 bg-slate-900 border border-slate-800 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${telemetry.batteryLevel && telemetry.batteryLevel < 30 ? 'bg-rose-500' : 'bg-emerald-400'}`} 
                        style={{ width: `${telemetry.batteryLevel}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Signal Strength */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.liveTracking.signal}</span>
                      <span className="text-xs text-slate-400">Receiver Interrogator Gain</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white font-mono">{telemetry.signalStrength} dBm</span>
                    <span className="block text-[9px] text-emerald-400 mt-1 font-bold">Excellent Gain</span>
                  </div>
                </div>

                {/* Ambient Temperature */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.liveTracking.temp}</span>
                      <span className="text-xs text-slate-400">Ambient Board Sensor</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white font-mono">{telemetry.temperature}°C</span>
                    <span className="block text-[9px] text-slate-500 mt-1">Normal Range</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Movement Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {t.liveTracking.movementTimeline}
              </h3>

              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {telemetry.movementTimeline.map((item, index) => (
                  <div key={index} className="flex gap-3 text-xs items-start">
                    <div className="flex flex-col items-center mt-1">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
                      {index !== telemetry.movementTimeline.length - 1 && (
                        <div className="w-0.5 h-10 bg-slate-800" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{item.location}</span>
                        <span className="font-mono text-[9px] text-slate-500 font-bold">{item.time}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.activity}</span>
                      <span className="text-[9px] text-emerald-400/80 font-mono mt-1 block">Status: {item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center">
          <Activity className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Awaiting secure handshake with telemetry server...</p>
        </div>
      )}

      {/* Map simulation warning block */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900/60 flex items-start gap-3 text-xs text-slate-500">
        <Shield className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
        <div>
          <strong>Simulated RFID Movement Active:</strong> Since physical RFID antenna hardware (such as Zebra RFD8500 or Impinj beacons) is currently offline, a circular transit simulation across the main warehouse, server racks, and clinic wards is automatically running to showcase live logistics and location updates.
        </div>
      </div>

    </div>
  );
}
