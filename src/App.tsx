import React, { useState, useEffect } from 'react';
import { translations } from './translations';
import { api, getAuthToken, removeAuthToken } from './lib/api';
import { Asset, ScanRecord, NotificationItem } from './types';

// Import Modular Components
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import AssetMgmtView from './components/AssetMgmtView';
import RfidScanView from './components/RfidScanView';
import LiveTrackingView from './components/LiveTrackingView';
import ScanHistoryView from './components/ScanHistoryView';
import ReportsView from './components/ReportsView';
import UserProfileView from './components/UserProfileView';
import SettingsView from './components/SettingsView';
import HelpView from './components/HelpView';

// Icon imports
import { 
  Database, Radio, Cpu, BarChart2, Bell, Settings, HelpCircle, 
  LogOut, User, Menu, X, Globe, Scan, Clock, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Localization state
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const t = translations[lang];

  // Authentication State
  const [user, setUser] = useState<any | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Application database cache state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  // Fetch all core system data from Express API
  const refreshSystemData = async () => {
    if (!getAuthToken()) return;
    
    setAppLoading(true);
    try {
      const [assetsData, scansData, notifsData] = await Promise.all([
        api.getAssets(),
        api.getScanHistory(),
        api.getNotifications()
      ]);
      setAssets(assetsData);
      setScans(scansData);
      setNotifications(notifsData);
    } catch (err) {
      console.error('Error fetching dashboard database records', err);
    } finally {
      setAppLoading(false);
    }
  };

  // Validate existing session token on load
  useEffect(() => {
    const initSession = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch (err) {
          console.error('Session expired or token invalid on load');
          removeAuthToken();
        }
      }
      setIsSessionLoading(false);
    };
    initSession();
  }, []);

  // Fetch backend data once user is authenticated
  useEffect(() => {
    if (user) {
      refreshSystemData();
    }
  }, [user]);

  // Logout trigger
  const handleLogout = () => {
    if (window.confirm(lang === 'en' ? 'Are you sure you want to sign out?' : 'நீங்கள் கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா?')) {
      removeAuthToken();
      setUser(null);
      setActiveTab('dashboard');
      setAssets([]);
      setScans([]);
      setNotifications([]);
    }
  };

  // Notification read triggers
  const handleMarkNotifRead = async (id: string) => {
    try {
      const updated = await api.markNotifRead(id);
      setNotifications(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotifRead = async () => {
    try {
      const updated = await api.markAllNotifRead();
      setNotifications(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
        <Cpu className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <span className="text-sm font-semibold tracking-wider text-slate-400">
          Verifying secure telemetry handshake...
        </span>
      </div>
    );
  }

  // Not authenticated? Show login portal
  if (!user) {
    return (
      <LoginView 
        t={t} 
        lang={lang} 
        setLang={setLang} 
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} 
      />
    );
  }

  // Navigation Links Configuration
  const navLinks = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Cpu },
    { id: 'addAsset', label: t.nav.addAsset, icon: Database },
    { id: 'assetList', label: t.nav.assetList, icon: Database },
    { id: 'rfidScan', label: t.nav.rfidScan, icon: Scan },
    { id: 'liveTracking', label: t.nav.liveTracking, icon: Radio },
    { id: 'scanHistory', label: t.nav.scanHistory, icon: Clock },
    { id: 'reports', label: t.nav.reports, icon: BarChart2 },
    { id: 'userProfile', label: t.nav.userProfile, icon: User },
    { id: 'settings', label: t.nav.settings, icon: Settings },
    { id: 'help', label: t.nav.help, icon: HelpCircle },
  ];

  return (
    <div id="main_wrapper" className="min-h-screen bg-slate-950 text-slate-300 font-sans flex overflow-hidden">
      
      {/* Mobile Hamburger Drawer Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Drawer Body */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="h-16 border-b border-slate-900 flex items-center justify-between px-5">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white tracking-tight">SmartTrack IoT</span>
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Nav links */}
                <nav className="p-4 space-y-1">
                  {navLinks.map(link => {
                    const Icon = link.icon;
                    const isActive = activeTab === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setActiveTab(link.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive 
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{link.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Sidebar Footer */}
              <div className="p-4 border-t border-slate-900">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.nav.logout}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur-xl flex-col justify-between shrink-0 h-screen sticky top-0">
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">RFID System</span>
              <span className="text-[10px] text-slate-500 tracking-wider font-bold uppercase">IoT Smart Tracking</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/5' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Logout button */}
        <div className="p-4 border-t border-slate-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Right Content Section */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header navbar */}
        <header className="h-16 bg-slate-950 border-b border-slate-900 flex items-center justify-between px-4 sm:px-6 relative z-10 shrink-0">
          
          {/* Mobile hamburger button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* Quick Breadcrumbs status */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-500">Registry Gateway:</span>
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-emerald-400 font-mono text-[10px]">
                NODE-58CB
              </span>
            </div>
          </div>

          {/* User Controls and Notifications */}
          <div className="flex items-center gap-3.5">
            
            {/* Language Switch */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <button onClick={() => setLang('en')} className={`px-1 font-bold ${lang === 'en' ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}>EN</button>
              <span className="text-slate-700">|</span>
              <button onClick={() => setLang('ta')} className={`px-1 font-bold ${lang === 'ta' ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}>தமிழ்</button>
            </div>

            {/* Notifications Bell */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* User Profile avatar quick link */}
            <button 
              onClick={() => setActiveTab('userProfile')}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-900/60 rounded-xl transition-all text-left cursor-pointer"
            >
              <img 
                src={user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} 
                alt={user.name} 
                className="w-7 h-7 rounded-lg object-cover border border-slate-800 shrink-0"
              />
              <div className="hidden sm:block">
                <span className="block text-xs font-bold text-white leading-tight">{user.name}</span>
                <span className="block text-[9px] text-slate-500 leading-none">{user.role}</span>
              </div>
            </button>

          </div>

        </header>

        {/* Scrollable View Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  t={t} 
                  lang={lang} 
                  user={user} 
                  assets={assets} 
                  scans={scans} 
                  notifications={notifications} 
                  onNavigate={(tab) => setActiveTab(tab)} 
                  onRefresh={refreshSystemData}
                />
              )}

              {activeTab === 'addAsset' && (
                <AssetMgmtView 
                  t={t} 
                  lang={lang} 
                  assets={assets} 
                  onRefresh={refreshSystemData}
                  initialFormOpen={true}
                />
              )}

              {activeTab === 'assetList' && (
                <AssetMgmtView 
                  t={t} 
                  lang={lang} 
                  assets={assets} 
                  onRefresh={refreshSystemData}
                  initialFormOpen={false}
                />
              )}

              {activeTab === 'rfidScan' && (
                <RfidScanView 
                  t={t} 
                  lang={lang} 
                  assets={assets} 
                  onScanCompleted={refreshSystemData}
                />
              )}

              {activeTab === 'liveTracking' && (
                <LiveTrackingView 
                  t={t} 
                  lang={lang} 
                />
              )}

              {activeTab === 'scanHistory' && (
                <ScanHistoryView 
                  t={t} 
                  lang={lang} 
                  scans={scans} 
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView 
                  t={t} 
                  lang={lang} 
                  assets={assets} 
                  scans={scans} 
                />
              )}

              {activeTab === 'userProfile' && (
                <UserProfileView 
                  t={t} 
                  lang={lang} 
                  user={user} 
                  onProfileUpdated={(updated) => setUser(updated)}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView 
                  t={t} 
                  lang={lang} 
                  setLang={setLang}
                />
              )}

              {activeTab === 'help' && (
                <HelpView 
                  t={t} 
                  lang={lang} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Footer */}
        <footer className="h-10 bg-slate-950 border-t border-slate-900 flex items-center justify-between px-6 text-[10px] text-slate-500 shrink-0">
          <span>&copy; 2026 SmartTrack RFID Asset Tracking System. All rights reserved.</span>
          <span className="hidden sm:inline">Engineered for Universities, Hospitals, &amp; Warehouses</span>
        </footer>

      </div>

      {/* Notifications Audit Feed Modal Panel */}
      <AnimatePresence>
        {showNotificationsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-end">
            <div 
              className="absolute inset-0"
              onClick={() => setShowNotificationsModal(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-screen flex flex-col justify-between relative shadow-2xl"
            >
              <div>
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-5">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white">{t.nav.notifications}</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllNotifRead}
                        className="text-[10px] font-bold text-emerald-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                    <button 
                      onClick={() => setShowNotificationsModal(false)}
                      className="p-1 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notifications Lists */}
                <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-500">
                      No recent notifications logged.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-3.5 rounded-xl border text-xs relative flex justify-between gap-3 ${
                          n.read ? 'bg-slate-950/30 border-slate-800/40 text-slate-400' : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className={`font-bold block text-xs ${
                            n.read ? 'text-slate-400' :
                            n.type === 'success' ? 'text-emerald-400' :
                            n.type === 'warning' ? 'text-amber-400' :
                            n.type === 'danger' ? 'text-rose-400' : 'text-blue-400'
                          }`}>{n.title}</span>
                          <p className="leading-relaxed text-slate-400">{n.message}</p>
                          <span className="block text-[9px] font-medium text-slate-500">
                            {new Date(n.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>

                        {!n.read && (
                          <button 
                            onClick={() => handleMarkNotifRead(n.id)}
                            className="text-[10px] text-emerald-400 hover:underline self-start shrink-0 font-bold"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 text-center">
                Centralized Node Handshake ID: NODE-58CB
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
