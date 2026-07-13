/**
 * Types and Interfaces for IoT-Enabled RFID-Based Smart Asset Tracking System
 */

export type UserRole = 'Admin' | 'Operator' | 'Manager' | 'Viewer';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePicture?: string;
}

export type AssetStatus = 'Active' | 'Available' | 'Lost' | 'Maintenance';

export interface Asset {
  id: string; // Asset ID (e.g., AST-1001)
  rfidTag: string; // RFID Tag ID (e.g., RFID-89A23F)
  name: string;
  category: string;
  department: string;
  purchaseDate: string;
  warrantyDate: string;
  assignedEmployee: string;
  currentLocation: string;
  status: AssetStatus;
  description: string;
  qrCode: string; // Base64 or generated text data
  imageUrl?: string;
  lastUpdated: string;
}

export interface ScanRecord {
  id: string;
  rfidTag: string;
  assetName: string;
  date: string;
  time: string;
  location: string;
  status: AssetStatus;
  employee: string;
  timestamp: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  timestamp: string;
  read: boolean;
}

export interface IoTTelemetry {
  assetId: string;
  assetName: string;
  rfidTag: string;
  status: AssetStatus;
  currentZone: string;
  lastKnownZone: string;
  coordinates: { x: number; y: number };
  path: { x: number; y: number }[];
  pathIndex: number;
  movementTimeline: {
    time: string;
    location: string;
    status: string;
    activity: string;
  }[];
  temperature?: number;
  signalStrength?: number; // dBm
  batteryLevel?: number; // %
}

// Multi-Language Translations Interface
export interface TranslationSchema {
  nav: {
    dashboard: string;
    addAsset: string;
    assetList: string;
    rfidScan: string;
    liveTracking: string;
    scanHistory: string;
    reports: string;
    notifications: string;
    userProfile: string;
    settings: string;
    help: string;
    logout: string;
    about: string;
    contact: string;
  };
  login: {
    title: string;
    welcome: string;
    username: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    loginBtn: string;
    registerBtn: string;
    contactSupport: string;
    supportPhone: string;
    supportEmail: string;
    validationError: string;
    successMessage: string;
    errorMessage: string;
    // New fields for Phone Login
    loginWithPhone: string;
    loginWithUsername: string;
    phoneNumber: string;
    enterPhonePlaceholder: string;
    sendOtp: string;
    sendingOtp: string;
    enterOtp: string;
    otpPlaceholder: string;
    verifyOtp: string;
    verifyingOtp: string;
    phoneNotFoundError: string;
    otpSentSuccess: string;
    invalidOtpError: string;
  };
  dashboard: {
    welcome: string;
    totalAssets: string;
    activeAssets: string;
    availableAssets: string;
    lostAssets: string;
    maintenanceAssets: string;
    recentAssets: string;
    todayScans: string;
    alerts: string;
    quickActions: string;
    recentActivities: string;
    latestScans: string;
  };
  assetMgmt: {
    addTitle: string;
    editTitle: string;
    listTitle: string;
    searchPlaceholder: string;
    filterCategory: string;
    filterDept: string;
    filterStatus: string;
    sortBy: string;
    assetId: string;
    rfidTag: string;
    assetName: string;
    category: string;
    department: string;
    purchaseDate: string;
    warrantyDate: string;
    assignedEmployee: string;
    currentLocation: string;
    status: string;
    description: string;
    qrCode: string;
    actions: string;
    save: string;
    cancel: string;
    deleteConfirm: string;
  };
  rfidScan: {
    title: string;
    inputPlaceholder: string;
    scanBtn: string;
    clearBtn: string;
    scanResult: string;
    details: string;
    scanTime: string;
    scanDate: string;
    validationSuccess: string;
    validationFailed: string;
    waitingScan: string;
  };
  liveTracking: {
    title: string;
    simulationActive: string;
    currentLoc: string;
    lastKnownLoc: string;
    movementTimeline: string;
    lastScanTime: string;
    status: string;
    liveIndicator: string;
    telemetry: string;
    battery: string;
    signal: string;
    temp: string;
    toggleSimulation: string;
  };
  reports: {
    title: string;
    distributionDept: string;
    distributionCategory: string;
    scanCount: string;
    exportPdf: string;
    exportExcel: string;
  };
  profile: {
    title: string;
    editProfile: string;
    changePassword: string;
    uploadPic: string;
    phone: string;
    email: string;
    role: string;
    saveBtn: string;
  };
}
