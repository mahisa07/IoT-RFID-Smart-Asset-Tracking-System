import React, { useState } from 'react';
import { TranslationSchema, Asset } from '../types';
import { api } from '../lib/api';
import { 
  Scan, Delete, CheckCircle, AlertTriangle, Clock, Calendar, 
  MapPin, User, FileText, ArrowRight, RefreshCw, Layers, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RfidScanViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
  assets: Asset[];
  onScanCompleted: () => void;
}

export default function RfidScanView({ t, lang, assets, onScanCompleted }: RfidScanViewProps) {
  const [rfidInput, setRfidInput] = useState('');
  const [scanLocation, setScanLocation] = useState('Logistics Transit Corridor');
  const [loading, setLoading] = useState(false);
  
  // Scan Output Result
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scanMsg, setScanMsg] = useState('');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [scanTime, setScanTime] = useState('');
  const [scanDate, setScanDate] = useState('');

  // Quick scan helper tags
  const helperTags = assets.map(a => ({
    tag: a.rfidTag,
    name: a.name,
    status: a.status
  }));

  const handleClear = () => {
    setRfidInput('');
    setScanStatus('idle');
    setScanMsg('');
    setScannedAsset(null);
    setScanTime('');
    setScanDate('');
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput.trim()) {
      setScanStatus('error');
      setScanMsg(lang === 'en' ? 'Please enter a valid RFID Tag.' : 'தயவுசெய்து செல்லுபடியாகும் ஆர்.எஃப்.ஐ.டி டேக்கை உள்ளிடவும்.');
      return;
    }

    setLoading(true);
    setScanStatus('idle');
    setScannedAsset(null);

    try {
      // Execute RFID Scan to Server
      const data = await api.scanRfid(rfidInput.trim(), scanLocation);
      
      setScanStatus('success');
      setScanMsg(t.rfidScan.validationSuccess);
      setScannedAsset(data.asset);
      setScanTime(data.scan.time);
      setScanDate(data.scan.date);
      
      // Refresh system states
      onScanCompleted();
    } catch (err: any) {
      setScanStatus('error');
      setScanMsg(err.message || t.rfidScan.validationFailed);
      setScanTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setScanDate(new Date().toISOString().split('T')[0]);
    } finally {
      setLoading(false);
    }
  };

  const selectTagHelper = (tag: string) => {
    setRfidInput(tag);
    // Auto-fill an appropriate scanning location
    const locations = [
      'Main Data Center - Rack 4',
      'ICU Ward B - Room 104',
      'Loading Dock East Wing',
      'Quality Control Unit',
      'Research Wing Security Gate'
    ];
    const randomLoc = locations[Math.floor(Math.random() * locations.length)];
    setScanLocation(randomLoc);
  };

  return (
    <div id="rfid_scan_view" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Left panel: Scanning Input Box */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">{t.rfidScan.title}</h2>
          <p className="text-xs text-slate-400">
            {lang === 'en' 
              ? 'Simulate hardware antenna signal trigger by manually keying or pasting tag identifiers.'
              : 'ஆர்.எஃப் சிக்னல்களை கைமுறையாக தட்டச்சு செய்வதன் மூலம் உருவகப்படுத்தவும்.'}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleScanSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Scanner Location Antenna
            </label>
            <select
              value={scanLocation}
              onChange={(e) => setScanLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-all"
            >
              <option value="Main Data Center - Rack 4">Main Data Center - Rack 4</option>
              <option value="ICU Ward B - Room 104">ICU Ward B - Room 104</option>
              <option value="Loading Dock East Wing">Loading Dock East Wing</option>
              <option value="Warehouse A Corridor 1">Warehouse A Corridor 1</option>
              <option value="Quality Control Unit">Quality Control Unit</option>
              <option value="Research Wing Security Gate">Research Wing Security Gate</option>
              <option value="Main Lecture Auditorium B">Main Lecture Auditorium B</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t.assetMgmt.rfidTag}
            </label>
            <div className="relative">
              <Scan className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder={t.rfidScan.inputPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
            >
              {t.rfidScan.clearBtn}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Scan className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>{t.rfidScan.scanBtn}</span>
            </button>
          </div>
        </form>

        {/* Shortcuts tag helper lists */}
        <div className="pt-4 border-t border-slate-800/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registered Tags Quick-Select</span>
          </h3>
          <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
            {helperTags.map(item => (
              <button
                key={item.tag}
                type="button"
                onClick={() => selectTagHelper(item.tag)}
                className="flex items-center justify-between p-2.5 text-left rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800/40 hover:border-slate-800 transition-all text-[11px]"
              >
                <div className="truncate pr-2">
                  <span className="font-bold text-white block truncate">{item.name}</span>
                  <span className="font-mono text-[10px] text-emerald-500">{item.tag}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0 ${
                  item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                  item.status === 'Available' ? 'bg-blue-500/10 text-blue-400' :
                  item.status === 'Lost' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {item.status}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Right panel: Scan Result Output & Asset details card */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            {t.rfidScan.scanResult}
          </h3>

          <AnimatePresence mode="wait">
            {scanStatus === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500"
              >
                <Scan className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
                <p className="text-xs">{t.rfidScan.waitingScan}</p>
              </motion.div>
            )}

            {scanStatus === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Result Alert */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-4 flex gap-3 items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block font-bold">{scanMsg}</span>
                    <span className="block text-slate-400 mt-0.5">Asset location and telemetry records updated successfully.</span>
                  </div>
                </div>

                {/* Scanned details card */}
                {scannedAsset && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="md:col-span-2 relative">
                      <img 
                        src={scannedAsset.imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300'} 
                        alt={scannedAsset.name} 
                        className="w-full h-36 md:h-full rounded-xl object-cover border border-slate-800"
                      />
                      <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">
                        {scannedAsset.status}
                      </span>
                    </div>

                    <div className="md:col-span-3 space-y-4">
                      <div>
                        <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded font-bold">
                          {scannedAsset.id}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1.5">{scannedAsset.name}</h4>
                        <span className="text-xs text-slate-500">{scannedAsset.category}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Location</span>
                            <span className="font-semibold text-white truncate">{scanLocation}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Custodian</span>
                            <span className="font-semibold text-white">{scannedAsset.assignedEmployee || 'Unassigned'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.rfidScan.scanTime}</span>
                            <span className="font-semibold text-white">{scanTime}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.rfidScan.scanDate}</span>
                            <span className="font-semibold text-white">{scanDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 pt-3 border-t border-slate-900 leading-relaxed">
                        <span className="font-bold text-slate-400">Database Entry QR Signature:</span>
                        <code className="block mt-1 font-mono text-[10px] bg-slate-950 p-2 rounded text-emerald-500 truncate select-all">
                          {scannedAsset.qrCode}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {scanStatus === 'error' && (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Error Alert */}
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-4 flex gap-3 items-center">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <span className="block font-bold">Access Warning</span>
                    <span className="block text-slate-400 mt-0.5">{scanMsg}</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>RFID Antenna Signal Mismatch Detected</span>
                  </div>
                  <p>
                    The RFID Tag payload <strong className="font-mono text-white text-[11px] bg-slate-900 px-1.5 py-0.5 rounded">{rfidInput}</strong> does not map to any active asset or logistics pallet registered in the centralized database.
                  </p>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-900">
                    A security notification has been generated automatically and logged into the System Administrator alert console. Scan attempt registered on {new Date().toLocaleTimeString()} at {scanLocation}.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security warning notice footer */}
        <div className="text-[10px] text-slate-500 bg-slate-950 p-3 rounded-xl border border-slate-900 flex gap-2 items-start">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong>Note on physical system linkage:</strong> Under a production setup, physical RFID interrogator antennas (like Impinj R420 or Alien F800 readers) dispatch tag detections directly to our Express endpoint <code>POST /api/rfid/scan</code> using JSON payloads.
          </span>
        </div>
      </div>

    </div>
  );
}
