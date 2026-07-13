import React, { useState } from 'react';
import { TranslationSchema } from '../types';
import { 
  HelpCircle, Shield, FileText, Phone, Mail, MapPin, 
  Cpu, Antenna, Landmark, Send, Info 
} from 'lucide-react';
import { motion } from 'motion/react';

interface HelpViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
}

export default function HelpView({ t, lang }: HelpViewProps) {
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackEmail || !feedbackMsg) {
      alert('Please fill out all fields.');
      return;
    }
    setIsSent(true);
    setTimeout(() => {
      alert(lang === 'en' ? 'Thank you! Your inquiry has been routed to our technical helpdesk.' : 'நன்றி! உங்கள் கருத்து தொழில்நுட்ப மையத்திற்கு அனுப்பப்பட்டது.');
      setFeedbackName('');
      setFeedbackEmail('');
      setFeedbackMsg('');
      setIsSent(false);
    }, 1000);
  };

  return (
    <div id="help_view" className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Help Navigation Sidebar - Left Column */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* System Overview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              Architecture Overview
            </span>
            <h3 className="text-base font-bold text-white">System Blueprint</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Our IoT-Enabled RFID Smart Asset Tracking System employs <strong>Passive RFID tags</strong> coupled with <strong>Fixed Reader Antennas</strong> mapping directly to our cloud telemetry engine.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/60 space-y-3.5 text-xs text-slate-300">
            <div className="flex gap-2.5 items-start">
              <Antenna className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block">1. Signal Interrogator</strong>
                <span>Readers broadcast RF signals requesting tag identifiers.</span>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block">2. Tag Handshake</strong>
                <span>The tag responds with its secure RFID Tag ID (EPC).</span>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <Landmark className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-white block">3. Facility Handshake</strong>
                <span>Coordinates map dynamically updating floor blueprints.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support info */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Global Support Coordinates
          </h4>

          <div className="space-y-3.5 text-xs text-slate-400">
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800/40">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500">Support Phone</span>
                <a href="tel:+919443212345" className="font-semibold text-white hover:underline">
                  +91 94432 12345
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800/40">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500">Official Email</span>
                <a href="mailto:support.rfid@smarttrack.org" className="font-semibold text-white hover:underline">
                  support.rfid@smarttrack.org
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800/40">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500">Main Facility Node</span>
                <span className="font-semibold text-white">East Science Wing, block 4B</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Structured FAQ & Contact Feedback form - Right Columns */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* User Guide and FAQs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Interactive User Guide &amp; FAQ</span>
          </h3>

          <div className="space-y-4 text-xs text-slate-300">
            {/* Q1 */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl space-y-1.5">
              <strong className="text-white font-semibold text-sm flex gap-2">
                <span className="text-emerald-400">Q.</span>
                <span>How do I enroll a physical asset with an RFID tag?</span>
              </strong>
              <p className="text-slate-400 leading-relaxed pl-6">
                Navigate to <strong>Enroll Asset</strong> or click <strong>Add Asset</strong> in the directory. Provide a unique Asset ID (e.g., AST-1007) and map it with your passive RFID transponder tag ID. Once saved, our antenna database automatically reserves this tag frequency.
              </p>
            </div>

            {/* Q2 */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl space-y-1.5">
              <strong className="text-white font-semibold text-sm flex gap-2">
                <span className="text-emerald-400">Q.</span>
                <span>How does the IoT Live Tracking simulation work?</span>
              </strong>
              <p className="text-slate-400 leading-relaxed pl-6">
                Our simulation pings our backend telemetry engine <code>GET /api/iot/live-telemetry</code> every 3 seconds. The server automatically routes an active asset along a circular track representing the main data center racks, clinical wards, and warehousing bays, providing dynamic coordinates, battery levels, and temperatures.
              </p>
            </div>

            {/* Q3 */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl space-y-1.5">
              <strong className="text-white font-semibold text-sm flex gap-2">
                <span className="text-emerald-400">Q.</span>
                <span>What are the security procedures for lost tags?</span>
              </strong>
              <p className="text-slate-400 leading-relaxed pl-6">
                If an asset fails to register at scheduled gateways, toggle its status to <strong>Lost</strong> in the Asset Directory. This alerts security personnel and triggers an active warning alarm in our system notifications if scanned at any gateway.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Page Feedback Inquiries Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Submit Inquiry to Helpdesk
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Have a deployment query or system malfunction? Route it directly to our college lab assistants or database administrators.
            </p>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Email ID</label>
                <input
                  type="email"
                  required
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="e.g. ramesh@smarttrack.org"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Message Inquiry Details</label>
              <textarea
                required
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder="Briefly explain your antenna configuration or RFID tag error..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSent}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Inquiry</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
