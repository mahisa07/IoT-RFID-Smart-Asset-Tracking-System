import React, { useState, useEffect } from 'react';
import { TranslationSchema, Asset, AssetStatus } from '../types';
import { api } from '../lib/api';
import { 
  Search, Plus, Filter, ArrowUpDown, Trash2, Edit, X, Save, 
  QrCode, Mic, MicOff, Info, Check, AlertCircle, FileText, User, MapPin 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AssetMgmtViewProps {
  t: TranslationSchema;
  lang: 'en' | 'ta';
  assets: Asset[];
  onRefresh: () => void;
  initialFormOpen?: boolean;
}

export default function AssetMgmtView({ t, lang, assets, onRefresh, initialFormOpen = false }: AssetMgmtViewProps) {
  // Query & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(initialFormOpen);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  // Form Fields
  const [assetId, setAssetId] = useState('');
  const [rfidTag, setRfidTag] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('IT Equipment');
  const [department, setDepartment] = useState('Computer Science Dept');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyDate, setWarrantyDate] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [status, setStatus] = useState<AssetStatus>('Active');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected asset for details viewer modal
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);

  // Status alerts
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check Speech recognition support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
    }
  }, []);

  // Sync initialFormOpen
  useEffect(() => {
    if (initialFormOpen) {
      setIsFormOpen(true);
      resetForm();
    }
  }, [initialFormOpen]);

  const resetForm = () => {
    setEditingAsset(null);
    setAssetId(`AST-${Math.floor(1000 + Math.random() * 9000)}`);
    setRfidTag(`RFID-${Math.random().toString(16).substr(2, 6).toUpperCase()}`);
    setName('');
    setCategory('IT Equipment');
    setDepartment('Computer Science Dept');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 2);
    setWarrantyDate(nextYear.toISOString().split('T')[0]);
    setAssignedEmployee('');
    setCurrentLocation('Main Warehouse A');
    setStatus('Active');
    setDescription('');
    setImageUrl('');
    setFormError('');
    setFormSuccess('');
  };

  const handleEditClick = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetId(asset.id);
    setRfidTag(asset.rfidTag);
    setName(asset.name);
    setCategory(asset.category);
    setDepartment(asset.department);
    setPurchaseDate(asset.purchaseDate);
    setWarrantyDate(asset.warrantyDate);
    setAssignedEmployee(asset.assignedEmployee);
    setCurrentLocation(asset.currentLocation);
    setStatus(asset.status);
    setDescription(asset.description);
    setImageUrl(asset.imageUrl || '');
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm(t.assetMgmt.deleteConfirm)) {
      try {
        await api.deleteAsset(id);
        onRefresh();
        alert(lang === 'en' ? 'Asset deleted successfully.' : 'சொத்து வெற்றிகரமாக நீக்கப்பட்டது.');
      } catch (err: any) {
        alert(err.message || 'Deletion failed.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim() || !rfidTag.trim() || !assetId.trim()) {
      setFormError(lang === 'en' ? 'Asset ID, Name, and RFID Tag are required fields.' : 'சொத்து ஐடி, பெயர் மற்றும் ஆர்.எஃப்.ஐ.டி ஆகியவை கட்டாய புலங்களாகும்.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: assetId,
        rfidTag,
        name,
        category,
        department,
        purchaseDate,
        warrantyDate,
        assignedEmployee,
        currentLocation,
        status,
        description,
        imageUrl: imageUrl || undefined
      };

      if (editingAsset) {
        await api.updateAsset(editingAsset.id, payload);
        setFormSuccess(lang === 'en' ? 'Asset records updated successfully!' : 'சொத்து விவரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!');
      } else {
        await api.createAsset(payload);
        setFormSuccess(lang === 'en' ? 'Asset enrolled and RFID registered successfully!' : 'புதிய சொத்து வெற்றிகரமாக பதிவு செய்யப்பட்டது!');
      }

      onRefresh();
      setTimeout(() => {
        setIsFormOpen(false);
        resetForm();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving asset.');
    } finally {
      setLoading(false);
    }
  };

  // Voice Search Handler
  const startVoiceRecognition = () => {
    if (!voiceSupported) return;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = lang === 'en' ? 'en-US' : 'ta-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const voiceResult = event.results[0][0].transcript;
      setSearchTerm(voiceResult);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Categories and Departments from assets database dynamically
  const categories = ['All', 'IT Equipment', 'Medical Devices', 'Warehouse Machinery', 'Classroom Systems', 'Office furniture'];
  const departments = ['All', 'Computer Science Dept', 'Emergency Medicine', 'Logistics & Cargo Bay 3', 'Mechanical Engineering', 'Audiology Clinic', 'Admin Block'];

  // Filter & Sort Logic
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assignedEmployee.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
    const matchesDept = selectedDept === 'All' || asset.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || asset.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesDept && matchesStatus;
  });

  // Sort Assets
  const sortedAssets = [...filteredAssets].sort((a: any, b: any) => {
    const valA = (a[sortBy] || '').toString().toLowerCase();
    const valB = (b[sortBy] || '').toString().toLowerCase();
    
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAssets.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div id="asset_mgmt_view" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{t.assetMgmt.listTitle}</h2>
          <p className="text-xs text-slate-400">
            {lang === 'en' 
              ? `Manage system hardware tags, print security QR Codes, and allocate departments.`
              : `வன்பொருள் டேக்குகள், பாதுகாப்பு கியூஆர் குறியீடுகள் மற்றும் துறை ஒதுக்கீட்டை நிர்வகிக்கவும்.`}
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Enroll New Asset</span>
          </button>
        )}
      </div>

      {/* Asset Form Container */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative"
          >
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-6 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>{editingAsset ? t.assetMgmt.editTitle : t.assetMgmt.addTitle}</span>
            </h3>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3.5 mb-4 flex gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-3.5 mb-4 flex gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.assetId} *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingAsset}
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    placeholder="AST-1001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.rfidTag} *
                  </label>
                  <input
                    type="text"
                    required
                    value={rfidTag}
                    onChange={(e) => setRfidTag(e.target.value)}
                    placeholder="RFID-32C55E"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.assetName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="High-Performance Server Node"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.category}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-all"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.department}
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-all"
                  >
                    {departments.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.status}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AssetStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Available">Available</option>
                    <option value="Lost">Lost</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.purchaseDate}
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.warrantyDate}
                  </label>
                  <input
                    type="date"
                    value={warrantyDate}
                    onChange={(e) => setWarrantyDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.assignedEmployee}
                  </label>
                  <input
                    type="text"
                    value={assignedEmployee}
                    onChange={(e) => setAssignedEmployee(e.target.value)}
                    placeholder="Custodian's Full Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    {t.assetMgmt.currentLocation}
                  </label>
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="Room 101, Storage Shelf 4"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    Custom Asset Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  {t.assetMgmt.description}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter specific parameters or hardware details..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-950 transition-all"
                >
                  {t.assetMgmt.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.assetMgmt.save}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Filter Grid & Search Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        
        {/* Search row with Speech */}
        <div className="flex flex-col sm:flex-row gap-3.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.assetMgmt.searchPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-11 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all"
            />
            
            {/* Voice Search Mic Button */}
            {voiceSupported && (
              <button
                type="button"
                onClick={startVoiceRecognition}
                title="Voice Search"
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-900'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {/* Sorting controls */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
            >
              <option value="id">Sort: Asset ID</option>
              <option value="name">Sort: Asset Name</option>
              <option value="rfidTag">Sort: RFID Tag</option>
              <option value="lastUpdated">Sort: Recent Updates</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              {t.assetMgmt.filterCategory}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              {t.assetMgmt.filterDept}
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              {t.assetMgmt.status}
            </label>
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

      {/* Asset Table / Bento Grid list */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-4 px-6">{t.assetMgmt.assetId}</th>
                <th className="py-4 px-6">{t.assetMgmt.assetName}</th>
                <th className="py-4 px-6">{t.assetMgmt.department}</th>
                <th className="py-4 px-6">{t.assetMgmt.assignedEmployee}</th>
                <th className="py-4 px-6">{t.assetMgmt.status}</th>
                <th className="py-4 px-6 text-center">{t.assetMgmt.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No matching assets found in the registry database.
                  </td>
                </tr>
              ) : (
                currentItems.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-950/20 transition-all">
                    <td className="py-4 px-6 font-mono font-bold text-white whitespace-nowrap">
                      {asset.id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={asset.imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100'} 
                          alt={asset.name} 
                          className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-800 bg-slate-950"
                        />
                        <div>
                          <span className="block font-semibold text-white line-clamp-1">{asset.name}</span>
                          <span className="block text-[10px] text-emerald-400 font-mono mt-0.5">{asset.rfidTag}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 whitespace-nowrap">
                      <div>
                        <span className="block font-medium">{asset.department}</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">{asset.category}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      <span className="font-semibold text-slate-200">{asset.assignedEmployee || 'Unassigned'}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        asset.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                        asset.status === 'Available' ? 'bg-blue-500/10 text-blue-400' :
                        asset.status === 'Lost' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          asset.status === 'Active' ? 'bg-emerald-400 animate-pulse' :
                          asset.status === 'Available' ? 'bg-blue-400' :
                          asset.status === 'Lost' ? 'bg-rose-400' :
                          'bg-amber-400'
                        }`} />
                        <span>{asset.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewingAsset(asset)}
                          title="Generate QR & Tag Info"
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(asset)}
                          title="Edit Details"
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(asset.id)}
                          title="Delete Tag"
                          className="p-1.5 bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="bg-slate-950/40 px-6 py-4 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing <span className="text-white font-bold">{indexOfFirstItem + 1}</span> to{' '}
              <span className="text-white font-bold">{Math.min(indexOfLastItem, sortedAssets.length)}</span> of{' '}
              <span className="text-white font-bold">{sortedAssets.length}</span> Assets
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800/80 hover:border-slate-700 disabled:opacity-40 text-xs text-slate-300 font-semibold rounded-lg"
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                    currentPage === i + 1 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800/80 hover:border-slate-700 disabled:opacity-40 text-xs text-slate-300 font-semibold rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security QR Code & Info Details Modal */}
      <AnimatePresence>
        {viewingAsset && (
          <div id="qr_modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setViewingAsset(null)}
                className="absolute top-5 right-5 p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  RFID Security Tag Verified
                </span>
                <h3 className="text-base font-bold text-white line-clamp-1">{viewingAsset.name}</h3>
                <span className="font-mono text-xs text-slate-400 mt-1 block">{viewingAsset.id} • {viewingAsset.rfidTag}</span>
              </div>

              {/* Vector SVG Matrix simulated QR code */}
              <div className="flex flex-col items-center justify-center bg-white p-5 rounded-2xl mb-6 shadow-inner border border-slate-800 max-w-[200px] mx-auto">
                <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Position detection outer squares */}
                  <rect x="2" y="2" width="22" height="22" stroke="#000" strokeWidth="6" />
                  <rect x="7" y="7" width="12" height="12" fill="#000" />
                  <rect x="76" y="2" width="22" height="22" stroke="#000" strokeWidth="6" />
                  <rect x="81" y="7" width="12" height="12" fill="#000" />
                  <rect x="2" y="76" width="22" height="22" stroke="#000" strokeWidth="6" />
                  <rect x="7" y="81" width="12" height="12" fill="#000" />
                  
                  {/* Custom SVG QR noise grid to look realistic */}
                  <rect x="35" y="5" width="6" height="6" fill="#000" />
                  <rect x="45" y="5" width="10" height="6" fill="#000" />
                  <rect x="60" y="10" width="10" height="6" fill="#000" />
                  <rect x="35" y="20" width="6" height="12" fill="#000" />
                  <rect x="45" y="25" width="12" height="6" fill="#000" />
                  
                  <rect x="5" y="35" width="12" height="6" fill="#000" />
                  <rect x="25" y="35" width="6" height="18" fill="#000" />
                  <rect x="35" y="45" width="18" height="6" fill="#000" />
                  <rect x="60" y="35" width="12" height="12" fill="#000" />
                  <rect x="80" y="35" width="15" height="6" fill="#000" />
                  
                  <rect x="5" y="55" width="12" height="12" fill="#000" />
                  <rect x="45" y="60" width="6" height="12" fill="#000" />
                  <rect x="60" y="55" width="18" height="6" fill="#000" />
                  <rect x="80" y="60" width="15" height="15" fill="#000" />
                  
                  <rect x="35" y="75" width="12" height="6" fill="#000" />
                  <rect x="35" y="85" width="6" height="10" fill="#000" />
                  <rect x="50" y="80" width="12" height="12" fill="#000" />
                  <rect x="68" y="75" width="6" height="18" fill="#000" />
                  <rect x="15" y="3" width="10" height="1" fill="#000" />
                </svg>
                <span className="text-[9px] font-mono font-bold text-slate-800 mt-3 text-center uppercase tracking-wide">
                  Enrolled Security Node
                </span>
              </div>

              {/* QR Details */}
              <div className="space-y-2.5 text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-900/60">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Asset Title:</span>
                  <span className="font-semibold text-white">{viewingAsset.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Category Code:</span>
                  <span className="font-mono text-white">{viewingAsset.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Facility Division:</span>
                  <span className="font-semibold text-white">{viewingAsset.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Custodian:</span>
                  <span className="font-semibold text-white">{viewingAsset.assignedEmployee || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Current Gateway:</span>
                  <span className="font-mono text-emerald-400 font-bold">{viewingAsset.currentLocation}</span>
                </div>
              </div>

              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Print Tag Badge
                </button>
                <button
                  onClick={() => setViewingAsset(null)}
                  className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
