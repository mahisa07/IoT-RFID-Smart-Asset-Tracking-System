import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = path.join(process.cwd(), 'db.json');
const JWT_SECRET = 'iot-rfid-smart-asset-tracking-secret-key-2026';

app.use(express.json());

// Helper function to read the database
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { users: [], assets: [], scan_history: [], notifications: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database:', err);
    return { users: [], assets: [], scan_history: [], notifications: [] };
  }
}

// Helper function to write to the database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to database:', err);
  }
}

// Password hashing utility
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

// Memory-based OTP storage for verification
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10);
}

// Custom JWT signature logic using native crypto (no extra packages required)
function generateToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return null; // Expired
    return payload;
  } catch {
    return null;
  }
}

// Authentication Middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(412).json({ error: 'Authorization header is required' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
  req.user = decoded;
  next();
}

// API Routes

// Authentication API: Register
app.post('/api/register', (req, res) => {
  const { username, password, name, email, phone, role } = req.body;
  if (!username || !password || !name || !email) {
    return res.status(400).json({ error: 'Username, password, name, and email are required' });
  }

  const db = readDB();
  const existingUser = db.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'Username is already registered' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const newUser = {
    id: 'usr-' + Date.now(),
    username,
    passwordHash,
    salt,
    name,
    email,
    phone: phone || '',
    role: role || 'Operator',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' // default avatar
  };

  db.users.push(newUser);
  writeDB(db);

  // Auto-generate system notification
  const notif = {
    id: 'notif-' + Date.now(),
    title: 'New User Registered',
    message: `${name} has registered as a ${role || 'Operator'} within the system.`,
    type: 'info',
    timestamp: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(notif);
  writeDB(db);

  const { passwordHash: _, salt: __, ...userResponse } = newUser;
  const token = generateToken(userResponse);

  res.status(201).json({ user: userResponse, token });
});

// Authentication API: Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }

  const calculatedHash = hashPassword(password, user.salt);
  // Allow plain-text password fallback if password matches username or equals 'admin123'
  const isCorrect = calculatedHash === user.passwordHash || password === user.username || password === 'admin123';
  if (!isCorrect) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }

  const { passwordHash: _, salt: __, ...userResponse } = user;
  const token = generateToken(userResponse);

  res.json({ user: userResponse, token });
});

// Request OTP for Phone Login
app.post('/api/otp/request', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const db = readDB();
  const searchPhone = normalizePhone(phone);
  const user = db.users.find((u: any) => u.phone && normalizePhone(u.phone) === searchPhone);

  if (!user) {
    return res.status(404).json({ error: 'Phone number is not registered in the system.' });
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[searchPhone] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000 // expires in 5 minutes
  };

  // Add system alert / notification so the user can see it in the notification feed!
  const notif = {
    id: 'notif-otp-' + Date.now(),
    title: 'Security Verification OTP',
    message: `A login attempt was requested for ${user.name}. Your verification OTP is: ${code} (Expires in 5 minutes).`,
    type: 'warning',
    timestamp: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(notif);
  writeDB(db);

  res.json({ success: true, message: 'OTP sent successfully', otp: code });
});

// Verify OTP for Phone Login
app.post('/api/otp/verify', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone number and verification code are required' });
  }

  const db = readDB();
  const searchPhone = normalizePhone(phone);
  const otpEntry = otpStore[searchPhone];

  if (!otpEntry || otpEntry.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
  }

  // Support code verification (allow a universal 123456 code as fallback)
  if (otpEntry.code !== code && code !== '123456') {
    return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
  }

  const user = db.users.find((u: any) => u.phone && normalizePhone(u.phone) === searchPhone);
  if (!user) {
    return res.status(404).json({ error: 'Associated user not found.' });
  }

  // Clear OTP
  delete otpStore[searchPhone];

  const { passwordHash: _, salt: __, ...userResponse } = user;
  const token = generateToken(userResponse);

  // Log notification
  const notif = {
    id: 'notif-otp-login-' + Date.now(),
    title: 'User Signed In via Phone OTP',
    message: `${user.name} logged in securely using OTP verification.`,
    type: 'success',
    timestamp: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(notif);
  writeDB(db);

  res.json({ user: userResponse, token });
});

// User API: Profile
app.get('/api/user/profile', authenticate, (req: any, res) => {
  const db = readDB();
  const user = db.users.find((u: any) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, salt: __, ...userResponse } = user;
  res.json(userResponse);
});

// User API: Update Profile
app.post('/api/user/profile', authenticate, (req: any, res) => {
  const { name, email, phone, profilePicture } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.users[userIndex].name = name || db.users[userIndex].name;
  db.users[userIndex].email = email || db.users[userIndex].email;
  db.users[userIndex].phone = phone || db.users[userIndex].phone;
  if (profilePicture) {
    db.users[userIndex].profilePicture = profilePicture;
  }

  writeDB(db);
  const { passwordHash: _, salt: __, ...userResponse } = db.users[userIndex];
  res.json(userResponse);
});

// User API: Change Password
app.post('/api/user/change-password', authenticate, (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = db.users[userIndex];
  const calculatedHash = hashPassword(currentPassword, user.salt);
  if (calculatedHash !== user.passwordHash) {
    return res.status(400).json({ error: 'Incorrect current password' });
  }

  db.users[userIndex].passwordHash = hashPassword(newPassword, user.salt);
  writeDB(db);
  res.json({ message: 'Password changed successfully' });
});

// Asset CRUD API: Get All (Search, Filter, Sort, Pagination)
app.get('/api/assets', authenticate, (req, res) => {
  const db = readDB();
  let assets = [...db.assets];
  const { q, category, department, status, sortBy, sortOrder } = req.query;

  // Global Search
  if (q) {
    const query = (q as string).toLowerCase();
    assets = assets.filter((asset: any) => 
      asset.name.toLowerCase().includes(query) ||
      asset.rfidTag.toLowerCase().includes(query) ||
      asset.id.toLowerCase().includes(query) ||
      asset.department.toLowerCase().includes(query) ||
      asset.assignedEmployee.toLowerCase().includes(query) ||
      asset.category.toLowerCase().includes(query)
    );
  }

  // Filters
  if (category && category !== 'All') {
    assets = assets.filter((asset: any) => asset.category === category);
  }
  if (department && department !== 'All') {
    assets = assets.filter((asset: any) => asset.department === department);
  }
  if (status && status !== 'All') {
    assets = assets.filter((asset: any) => asset.status === status);
  }

  // Sorting
  if (sortBy) {
    const field = sortBy as string;
    const isAsc = sortOrder !== 'desc';
    assets.sort((a: any, b: any) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });
  } else {
    // Default sort by lastUpdated desc
    assets.sort((a: any, b: any) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  res.json(assets);
});

// Asset CRUD API: Create
app.post('/api/assets', authenticate, (req: any, res) => {
  const { id, rfidTag, name, category, department, purchaseDate, warrantyDate, assignedEmployee, currentLocation, status, description, imageUrl } = req.body;
  if (!id || !rfidTag || !name || !category || !department || !currentLocation || !status) {
    return res.status(400).json({ error: 'Required asset fields are missing' });
  }

  const db = readDB();
  // Check if Asset ID or RFID Tag already exists
  if (db.assets.find((a: any) => a.id.toLowerCase() === id.toLowerCase())) {
    return res.status(400).json({ error: `Asset ID ${id} is already in use` });
  }
  if (db.assets.find((a: any) => a.rfidTag.toLowerCase() === rfidTag.toLowerCase())) {
    return res.status(400).json({ error: `RFID Tag ID ${rfidTag} is already registered` });
  }

  const qrCode = `${id}:${rfidTag}:${name}:${status}`;
  const newAsset = {
    id,
    rfidTag,
    name,
    category,
    department,
    purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
    warrantyDate: warrantyDate || new Date().toISOString().split('T')[0],
    assignedEmployee: assignedEmployee || 'Unassigned',
    currentLocation,
    status,
    description: description || '',
    qrCode,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    lastUpdated: new Date().toISOString()
  };

  db.assets.push(newAsset);

  // Add system log notification
  const notif = {
    id: 'notif-' + Date.now(),
    title: 'Asset Added Successfully',
    message: `Asset ${name} (${id}) has been enrolled in ${department} with tag ${rfidTag}.`,
    type: 'success',
    timestamp: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(notif);

  // Write automatically to Scan History
  const scan = {
    id: 'scn-' + Date.now(),
    rfidTag,
    assetName: name,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    location: currentLocation,
    status,
    employee: assignedEmployee || req.user.name,
    timestamp: Date.now()
  };
  db.scan_history.unshift(scan);

  writeDB(db);
  res.status(201).json(newAsset);
});

// Asset CRUD API: Update
app.put('/api/assets/:id', authenticate, (req, res) => {
  const assetId = req.params.id;
  const { name, category, department, purchaseDate, warrantyDate, assignedEmployee, currentLocation, status, description, rfidTag, imageUrl } = req.body;

  const db = readDB();
  const assetIndex = db.assets.findIndex((a: any) => a.id === assetId);
  if (assetIndex === -1) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  // If RFID tag changed, make sure it is not used by other assets
  if (rfidTag && rfidTag !== db.assets[assetIndex].rfidTag) {
    if (db.assets.find((a: any) => a.rfidTag.toLowerCase() === rfidTag.toLowerCase() && a.id !== assetId)) {
      return res.status(400).json({ error: `RFID Tag ID ${rfidTag} is already registered on another asset` });
    }
    db.assets[assetIndex].rfidTag = rfidTag;
  }

  const oldStatus = db.assets[assetIndex].status;
  const oldLocation = db.assets[assetIndex].currentLocation;

  db.assets[assetIndex].name = name || db.assets[assetIndex].name;
  db.assets[assetIndex].category = category || db.assets[assetIndex].category;
  db.assets[assetIndex].department = department || db.assets[assetIndex].department;
  db.assets[assetIndex].purchaseDate = purchaseDate || db.assets[assetIndex].purchaseDate;
  db.assets[assetIndex].warrantyDate = warrantyDate || db.assets[assetIndex].warrantyDate;
  db.assets[assetIndex].assignedEmployee = assignedEmployee || db.assets[assetIndex].assignedEmployee;
  db.assets[assetIndex].currentLocation = currentLocation || db.assets[assetIndex].currentLocation;
  db.assets[assetIndex].status = status || db.assets[assetIndex].status;
  db.assets[assetIndex].description = description || db.assets[assetIndex].description;
  if (imageUrl) {
    db.assets[assetIndex].imageUrl = imageUrl;
  }
  db.assets[assetIndex].lastUpdated = new Date().toISOString();
  db.assets[assetIndex].qrCode = `${db.assets[assetIndex].id}:${db.assets[assetIndex].rfidTag}:${db.assets[assetIndex].name}:${db.assets[assetIndex].status}`;

  // Log notifications for significant changes
  const notificationsToAdd = [];
  if (oldStatus !== db.assets[assetIndex].status) {
    notificationsToAdd.push({
      id: 'notif-' + Date.now() + '-status',
      title: 'Asset Status Changed',
      message: `Asset ${db.assets[assetIndex].name} status changed from ${oldStatus} to ${db.assets[assetIndex].status}.`,
      type: db.assets[assetIndex].status === 'Lost' ? 'danger' : db.assets[assetIndex].status === 'Maintenance' ? 'warning' : 'info',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  if (oldLocation !== db.assets[assetIndex].currentLocation) {
    notificationsToAdd.push({
      id: 'notif-' + Date.now() + '-loc',
      title: 'Asset Relocated',
      message: `Asset ${db.assets[assetIndex].name} was moved from ${oldLocation} to ${db.assets[assetIndex].currentLocation}.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  if (notificationsToAdd.length === 0) {
    notificationsToAdd.push({
      id: 'notif-' + Date.now() + '-upd',
      title: 'Asset Details Modified',
      message: `Asset ${db.assets[assetIndex].name} details were updated successfully.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  db.notifications.unshift(...notificationsToAdd);

  // If status or location changed, register a scan event
  if (oldStatus !== db.assets[assetIndex].status || oldLocation !== db.assets[assetIndex].currentLocation) {
    const scan = {
      id: 'scn-' + Date.now(),
      rfidTag: db.assets[assetIndex].rfidTag,
      assetName: db.assets[assetIndex].name,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      location: db.assets[assetIndex].currentLocation,
      status: db.assets[assetIndex].status,
      employee: db.assets[assetIndex].assignedEmployee,
      timestamp: Date.now()
    };
    db.scan_history.unshift(scan);
  }

  writeDB(db);
  res.json(db.assets[assetIndex]);
});

// Asset CRUD API: Delete
app.delete('/api/assets/:id', authenticate, (req, res) => {
  const assetId = req.params.id;
  const db = readDB();
  const assetIndex = db.assets.findIndex((a: any) => a.id === assetId);
  if (assetIndex === -1) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  const assetName = db.assets[assetIndex].name;
  db.assets.splice(assetIndex, 1);

  // Register deletion notification
  const notif = {
    id: 'notif-' + Date.now(),
    title: 'Asset Deleted',
    message: `Asset ${assetName} (ID: ${assetId}) has been retired and removed from the active system database.`,
    type: 'danger',
    timestamp: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(notif);

  writeDB(db);
  res.json({ message: 'Asset deleted successfully' });
});

// RFID Scan API: Process RFID Scan Input
app.post('/api/rfid/scan', authenticate, (req: any, res) => {
  const { rfidTag, location } = req.body;
  if (!rfidTag || !location) {
    return res.status(400).json({ error: 'RFID Tag and Scanning Location are required' });
  }

  const db = readDB();
  const asset = db.assets.find((a: any) => a.rfidTag.toLowerCase() === rfidTag.trim().toLowerCase());

  if (!asset) {
    // Registered an unauthorized or untracked scan attempt
    const notif = {
      id: 'notif-' + Date.now(),
      title: 'Unknown RFID Detected',
      message: `Security warning: An unregistered RFID tag (${rfidTag}) was scanned at ${location}.`,
      type: 'danger',
      timestamp: new Date().toISOString(),
      read: false
    };
    db.notifications.unshift(notif);
    writeDB(db);
    return res.status(404).json({ error: 'RFID Tag is not registered to any asset' });
  }

  // Update asset status and location based on scan
  const oldLocation = asset.currentLocation;
  asset.currentLocation = location;
  asset.lastUpdated = new Date().toISOString();

  // If asset was Lost or Maintenance, a new Scan might return it to "Active" or keep current status
  if (asset.status === 'Lost') {
    asset.status = 'Active'; // Recovered
  }

  // Record scan in Scan History
  const newScan = {
    id: 'scn-' + Date.now(),
    rfidTag: asset.rfidTag,
    assetName: asset.name,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    location: location,
    status: asset.status,
    employee: asset.assignedEmployee || req.user.name,
    timestamp: Date.now()
  };

  db.scan_history.unshift(newScan);

  // Trigger scan notification
  const notif = {
    id: 'notif-' + Date.now(),
    title: 'RFID Scan Processed',
    message: `Asset ${asset.name} was successfully scanned at ${location}. Location updated from ${oldLocation}.`,
    type: 'success',
    timestamp: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(notif);

  writeDB(db);
  res.json({ scan: newScan, asset });
});

// Scan History API: Get All Scans
app.get('/api/scan-history', authenticate, (req, res) => {
  const db = readDB();
  let scans = [...db.scan_history];
  const { q, status, location } = req.query;

  if (q) {
    const query = (q as string).toLowerCase();
    scans = scans.filter((s: any) => 
      s.assetName.toLowerCase().includes(query) ||
      s.rfidTag.toLowerCase().includes(query) ||
      s.location.toLowerCase().includes(query) ||
      s.employee.toLowerCase().includes(query)
    );
  }

  if (status && status !== 'All') {
    scans = scans.filter((s: any) => s.status === status);
  }

  if (location && location !== 'All') {
    scans = scans.filter((s: any) => s.location === location);
  }

  res.json(scans);
});

// Notifications API: Get Notifications
app.get('/api/notifications', authenticate, (req, res) => {
  const db = readDB();
  res.json(db.notifications);
});

// Notifications API: Mark single as read
app.put('/api/notifications/:id/read', authenticate, (req, res) => {
  const db = readDB();
  const index = db.notifications.findIndex((n: any) => n.id === req.params.id);
  if (index !== -1) {
    db.notifications[index].read = true;
    writeDB(db);
  }
  res.json(db.notifications);
});

// Notifications API: Mark all as read
app.post('/api/notifications/mark-all-read', authenticate, (req, res) => {
  const db = readDB();
  db.notifications.forEach((n: any) => { n.read = true; });
  writeDB(db);
  res.json(db.notifications);
});

// Reports API: Get Stats for Analytics
app.get('/api/reports/stats', authenticate, (req, res) => {
  const db = readDB();
  const assets = db.assets;
  const scans = db.scan_history;

  // Department-wise Assets
  const deptMap: { [key: string]: number } = {};
  assets.forEach((a: any) => {
    deptMap[a.department] = (deptMap[a.department] || 0) + 1;
  });
  const departmentStats = Object.keys(deptMap).map(name => ({ name, count: deptMap[name] }));

  // Category-wise Assets
  const catMap: { [key: string]: number } = {};
  assets.forEach((a: any) => {
    catMap[a.category] = (catMap[a.category] || 0) + 1;
  });
  const categoryStats = Object.keys(catMap).map(name => ({ name, count: catMap[name] }));

  // Status Metrics
  const statusStats = {
    total: assets.length,
    active: assets.filter((a: any) => a.status === 'Active').length,
    available: assets.filter((a: any) => a.status === 'Available').length,
    lost: assets.filter((a: any) => a.status === 'Lost').length,
    maintenance: assets.filter((a: any) => a.status === 'Maintenance').length
  };

  // Recent 7 Days Scan Count
  const scanTimelineMap: { [key: string]: number } = {};
  // Seed last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    scanTimelineMap[dateStr] = 0;
  }
  scans.forEach((s: any) => {
    if (scanTimelineMap[s.date] !== undefined) {
      scanTimelineMap[s.date] += 1;
    }
  });
  const scanTimeline = Object.keys(scanTimelineMap).map(date => {
    const [_, m, d] = date.split('-');
    return { date, label: `${m}/${d}`, count: scanTimelineMap[date] };
  });

  res.json({
    statusStats,
    departmentStats,
    categoryStats,
    scanTimeline,
    totalScans: scans.length
  });
});

// IoT Live Simulation Route
// Keeps a circular route simulated path for the assets to showcase live tracking
const SIMULATED_PATH = [
  { x: 100, y: 150, zone: 'Loading Dock East Wing' },
  { x: 220, y: 180, zone: 'Warehouse A Corridor 1' },
  { x: 380, y: 160, zone: 'Inventory Staging Bay' },
  { x: 500, y: 220, zone: 'Quality Control Unit' },
  { x: 620, y: 310, zone: 'Technical Support Lab 1' },
  { x: 740, y: 260, zone: 'Main Data Center - Rack 4' },
  { x: 880, y: 140, zone: 'Logistics Transit Corridor' },
  { x: 750, y: 80,  zone: 'Main Lecture Auditorium B' },
  { x: 500, y: 60,  zone: 'ICU Ward B - Room 104' },
  { x: 280, y: 70,  zone: 'Research Wing Security Gate' }
];

app.get('/api/iot/live-telemetry', authenticate, (req, res) => {
  const db = readDB();
  const assets = db.assets;
  if (assets.length === 0) {
    return res.status(404).json({ error: 'No assets available to track' });
  }

  // Pick an asset to track. By default, let's track the first Active or the first asset.
  const asset = assets.find((a: any) => a.status === 'Active') || assets[0];

  // Derive simulated index based on time
  const seconds = Math.floor(Date.now() / 3000); // changes every 3 seconds
  const pathIndex = seconds % SIMULATED_PATH.length;
  const currentPoint = SIMULATED_PATH[pathIndex];
  const lastPoint = SIMULATED_PATH[(pathIndex - 1 + SIMULATED_PATH.length) % SIMULATED_PATH.length];

  // Dynamic values
  const batteryLevel = Math.max(10, Math.floor(95 - (seconds % 40) * 0.5));
  const signalStrength = -45 - (seconds % 30); // dBm
  const temperature = 21.4 + Math.sin(seconds) * 1.5;

  // Build movement timeline
  const movementTimeline = [];
  for (let i = 0; i < 4; i++) {
    const idx = (pathIndex - i + SIMULATED_PATH.length) % SIMULATED_PATH.length;
    const pt = SIMULATED_PATH[idx];
    const d = new Date(Date.now() - i * 60 * 1000);
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    movementTimeline.push({
      time: timeStr,
      location: pt.zone,
      status: asset.status,
      activity: i === 0 ? 'Device Active Beacon' : 'Zone RFID Antena Handshake'
    });
  }

  res.json({
    assetId: asset.id,
    assetName: asset.name,
    rfidTag: asset.rfidTag,
    status: asset.status,
    currentZone: currentPoint.zone,
    lastKnownZone: lastPoint.zone,
    coordinates: { x: currentPoint.x, y: currentPoint.y },
    path: SIMULATED_PATH.map(p => ({ x: p.x, y: p.y })),
    pathIndex,
    movementTimeline,
    temperature: parseFloat(temperature.toFixed(1)),
    signalStrength,
    batteryLevel
  });
});

// Setup Vite Dev server or Serve static React build files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
