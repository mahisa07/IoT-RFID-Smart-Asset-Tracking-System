/**
 * Client-side API Service for IoT RFID Asset Tracker
 */

const API_URL = "https://iot-rfid-smart-asset-tracking-system-production.up.railway.app/api";

export const getAuthToken = (): string | null => {
  return localStorage.getItem('rfid_session_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('rfid_session_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('rfid_session_token');
};

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Authentication
  async login(credentials: any) {
    const data = await request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async register(userInfo: any) {
    const data = await request('/register', {
      method: 'POST',
      body: JSON.stringify(userInfo)
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async getProfile() {
    return request('/user/profile');
  },

  async updateProfile(profileData: any) {
    return request('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  },

  async changePassword(passwordData: any) {
    return request('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  },

  // Assets CRUD
  async getAssets(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/assets?${query}`);
  },

  async createAsset(assetData: any) {
    return request('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData)
    });
  },

  async updateAsset(id: string, assetData: any) {
    return request(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assetData)
    });
  },

  async deleteAsset(id: string) {
    return request(`/assets/${id}`, {
      method: 'DELETE'
    });
  },

  // RFID Scan
  async scanRfid(rfidTag: string, location: string) {
    return request('/rfid/scan', {
      method: 'POST',
      body: JSON.stringify({ rfidTag, location })
    });
  },

  // History
  async getScanHistory(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/scan-history?${query}`);
  },

  // Notifications
  async getNotifications() {
    return request('/notifications');
  },

  async markNotifRead(id: string) {
    return request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  async markAllNotifRead() {
    return request('/notifications/mark-all-read', {
      method: 'POST'
    });
  },

  // Reports Stats
  async getStats() {
    return request('/reports/stats');
  },

  // IoT Live Telemetry Simulation
  async getLiveTelemetry() {
    return request('/iot/live-telemetry');
  },

  // Phone Login OTP APIs
  async requestOtp(phone: string) {
    return request('/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  },

  async verifyOtp(phone: string, code: string) {
    const data = await request('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code })
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  }
};
