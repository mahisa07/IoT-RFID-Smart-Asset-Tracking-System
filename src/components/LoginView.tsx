import React, { useState } from 'react';
import { api } from '../lib/api';
import { TranslationSchema } from '../types';
import { ShieldCheck, User, Lock, Phone, Mail, Globe, Cpu, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
  setLang: (lang: 'en' | 'ta') => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginView({ t, lang, setLang, onLoginSuccess }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Admin' | 'Operator' | 'Manager' | 'Viewer'>('Operator');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSupport, setShowSupport] = useState(false);

  // Phone Login States
  const [loginMethod, setLoginMethod] = useState<'password' | 'phone'>('password');
  const [loginPhone, setLoginPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg(t.login.validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await api.login({ username, password });
      setSuccessMsg(t.login.successMessage);
      
      if (rememberMe) {
        localStorage.setItem('rfid_remembered_user', username);
      } else {
        localStorage.removeItem('rfid_remembered_user');
      }

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || t.login.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginPhone.trim()) {
      setErrorMsg(lang === 'en' ? 'Please enter your phone number.' : 'தயவுசெய்து உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestOtp(loginPhone);
      setOtpSent(true);
      setGeneratedOtp(res.otp || '');
      setSuccessMsg(t.login.otpSentSuccess);
    } catch (err: any) {
      setErrorMsg(err.message || t.login.phoneNotFoundError);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode.trim() || otpCode.length < 6) {
      setErrorMsg(lang === 'en' ? 'Please enter the 6-digit verification code.' : '6-இலக்க சரிபார்ப்பு குறியீட்டை உள்ளிடவும்.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.verifyOtp(loginPhone, otpCode);
      setSuccessMsg(t.login.successMessage);
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || t.login.invalidOtpError);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim() || !name.trim() || !email.trim()) {
      setErrorMsg(lang === 'en' ? 'Please fill out all required fields (*).' : 'தயவுசெய்து அனைத்து கட்டாய புலங்களையும் நிரப்பவும் (*).');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register({ username, password, name, email, phone, role });
      setSuccessMsg(lang === 'en' ? 'Account registered successfully! Logging you in...' : 'கணக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது! உள்நுழைகிறது...');
      
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Username may already exist.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-load remembered user if any
  React.useEffect(() => {
    const saved = localStorage.getItem('rfid_remembered_user');
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }
  }, []);

  return (
    <div id="login_container" className="min-h-screen relative flex items-center justify-center bg-slate-900 overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-lg p-4 z-10">
        {/* Language Quick Switcher */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center gap-1 bg-slate-800/80 border border-slate-700/50 rounded-full px-3 py-1 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <button 
              type="button" 
              onClick={() => setLang('en')} 
              className={`font-semibold px-1.5 transition-colors ${lang === 'en' ? 'text-emerald-400 font-bold' : 'hover:text-white'}`}
            >
              EN
            </button>
            <span className="text-slate-600">|</span>
            <button 
              type="button" 
              onClick={() => setLang('ta')} 
              className={`font-semibold px-1.5 transition-colors ${lang === 'ta' ? 'text-emerald-400 font-bold' : 'hover:text-white'}`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Login Main Card */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-emerald-500/5">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              {t.login.title}
            </h1>
            <p className="text-sm text-slate-400">
              {t.login.welcome}
            </p>
          </div>

          {/* Validation Alerts */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm rounded-xl p-4 mb-6 flex gap-2.5 items-start"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm rounded-xl p-4 mb-6 flex gap-2.5 items-start"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Method Tab Switcher */}
          {!isRegistering && (
            <div className="flex bg-slate-900/80 p-1 border border-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  loginMethod === 'password'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.login.loginWithUsername}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('phone');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  loginMethod === 'phone'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.login.loginWithPhone}
              </button>
            </div>
          )}

          {/* Form */}
          {!isRegistering ? (
            loginMethod === 'password' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {t.login.username}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t.login.password}
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        alert(lang === 'en' ? 'Password reset request dispatched to Administrator.' : 'கடவுச்சொல் மீட்டமைப்பு கோரிக்கை நிர்வாகிக்கு அனுப்பப்பட்டது.');
                      }}
                      className="text-xs text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {t.login.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                    />
                    <span className="text-xs text-slate-400">{t.login.rememberMe}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>{t.login.loginBtn}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.login.registerBtn}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={otpSent ? handlePhoneVerifyOtp : handlePhoneRequestOtp} className="space-y-5">
                {!otpSent ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {t.login.phoneNumber}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder={t.login.enterPhonePlaceholder}
                        className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      {lang === 'en' 
                        ? 'Try registered user phone numbers like +91 94432 12345 (Admin), +91 98765 43210 (Manager), or +91 99445 56789 (Operator).'
                        : 'இயல்புநிலை பயனர் எண்களை முயற்சிக்கவும்: +91 94432 12345 (நிர்வாகி), +91 98765 43210 (மேலாளர்), அல்லது +91 99445 56789 (இயக்குபவர்).'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {t.login.enterOtp}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                            setGeneratedOtp('');
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className="text-xs text-emerald-400 hover:underline cursor-pointer font-bold"
                        >
                          {lang === 'en' ? 'Change Number' : 'எண்ணை மாற்றுக'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder={t.login.otpPlaceholder}
                          className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest text-center text-white placeholder-slate-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Developer helper showing the generated OTP code */}
                    {generatedOtp && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                          {lang === 'en' ? 'Simulated SMS Gateway Received OTP' : 'சிமுலேட்டட் எஸ்எம்எஸ் கேட்வே மூலம் பெறப்பட்ட OTP'}
                        </span>
                        <span className="font-mono text-xl font-extrabold text-emerald-400 tracking-widest bg-slate-950 px-3.5 py-1 rounded border border-emerald-500/30 inline-block">
                          {generatedOtp}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : otpSent ? (
                    <>
                      <span>{t.login.verifyOtp}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  ) : (
                    <>
                      <span>{t.login.sendOtp}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.login.registerBtn}</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@smarttrack.org"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    System Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none transition-all"
                  >
                    <option value="Operator">Operator</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Submit Enrollment</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-400 hover:text-white font-semibold transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Support Section */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowSupport(!showSupport)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline font-medium"
          >
            {t.login.contactSupport}
          </button>

          <AnimatePresence>
            {showSupport && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 text-left text-xs text-slate-400 space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Call: </span>
                  <a href={`tel:${t.login.supportPhone}`} className="text-emerald-400 hover:underline hover:text-emerald-300 font-semibold">
                    {t.login.supportPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Email: </span>
                  <a href={`mailto:${t.login.supportEmail}`} className="text-blue-400 hover:underline hover:text-blue-300">
                    {t.login.supportEmail}
                  </a>
                </div>
                <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-900">
                  Global IoT-RFID Registry Node ID: 58cbf4cf
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
