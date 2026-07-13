import React, { useState } from 'react';
import { TranslationSchema } from '../types';
import { api } from '../lib/api';
import { 
  User, Mail, Phone, Shield, Lock, Eye, EyeOff, Save, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfileViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
  user: any;
  onProfileUpdated: (updatedUser: any) => void;
}

export default function UserProfileView({ t, lang, user, onProfileUpdated }: UserProfileViewProps) {
  // Profile state
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Alerts states
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name.trim() || !email.trim()) {
      setProfileError(lang === 'en' ? 'Name and Email are required fields.' : 'பெயர் மற்றும் மின்னஞ்சல் கட்டாய புலங்களாகும்.');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await api.updateProfile({ name, email, phone, profilePicture });
      setProfileSuccess(lang === 'en' ? 'Profile details updated successfully!' : 'சுயவிவர விவரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!');
      onProfileUpdated(updatedUser);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError(lang === 'en' ? 'Please fill out all password fields.' : 'கடவுச்சொல் புலங்களை நிரப்பவும்.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError(lang === 'en' ? 'New passwords do not match.' : 'புதிய கடவுச்சொற்கள் பொருந்தவில்லை.');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPassSuccess(lang === 'en' ? 'Password changed successfully!' : 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Incorrect current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="user_profile_view" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Profile Sidebar Info card - Left Column */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-6">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Portal Authorization
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight">{t.profile.title}</h2>
        </div>

        {/* Avatar Display */}
        <div className="relative inline-block mx-auto">
          <img 
            src={profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'} 
            alt={user.name} 
            className="w-28 h-28 rounded-3xl object-cover border-2 border-emerald-500/30 mx-auto"
          />
          <span className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full whitespace-nowrap">
            {user.role}
          </span>
        </div>

        <div className="pt-2">
          <h3 className="text-base font-bold text-white">{user.name}</h3>
          <span className="text-xs text-slate-500 font-mono block mt-1">Username: @{user.username}</span>
        </div>

        {/* Role Privileges panel */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/60 text-left text-xs text-slate-400 space-y-2.5">
          <div className="flex items-center gap-2 text-white font-bold pb-1.5 border-b border-slate-900">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Operational Privileges</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Asset Writes:</span>
            <span className="font-bold text-white">{['Admin', 'Manager', 'Operator'].includes(user.role) ? 'GRANTED' : 'READONLY'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">RFID Scan Triggers:</span>
            <span className="font-bold text-white">{['Admin', 'Manager', 'Operator'].includes(user.role) ? 'GRANTED' : 'DENIED'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Security Purges:</span>
            <span className="font-bold text-rose-400">{user.role === 'Admin' ? 'UNLOCKED' : 'LOCKED'}</span>
          </div>
        </div>
      </div>

      {/* Forms area - Right Columns */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Profile details editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {t.profile.editProfile}
          </h3>

          {profileError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3.5 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-3.5 flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Display Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.profile.email} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.profile.phone}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.profile.uploadPic}
                </label>
                <input
                  type="text"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Save className="w-4 h-4" />
                <span>{t.profile.saveBtn}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {t.profile.changePassword}
          </h3>

          {passError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3.5 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-3.5 flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <span>Commit Password</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
