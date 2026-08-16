const API_BASE = 'http://localhost:5000/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('dawatrack_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers as Record<string, string> };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Prescriptions
  getPrescriptions: (status?: string) => request(`/prescriptions${status ? `?status=${status}` : ''}`),
  getPrescription: (id: number) => request(`/prescriptions/${id}`),
  getPrescriptionByCode: (code: string) => request(`/prescriptions/code/${code}`),
  createPrescription: (data: any) => request('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  updatePrescriptionStatus: (id: number, status: string) => request(`/prescriptions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Pharmacy
  getInventory: () => request('/pharmacy/inventory'),
  updateInventory: (id: number, data: any) => request(`/pharmacy/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addInventory: (data: any) => request('/pharmacy/inventory', { method: 'POST', body: JSON.stringify(data) }),
  dispense: (code: string, notes?: string) => request(`/pharmacy/dispense/${code}`, { method: 'POST', body: JSON.stringify({ notes }) }),
  getDispensingLog: () => request('/pharmacy/log'),
  getNearbyPharmacies: () => request('/pharmacy/nearby'),
  checkStock: (drugCode: string) => request(`/pharmacy/stock/${drugCode}`),

  // Drugs
  searchDrugs: (q: string) => request(`/drugs/search?q=${q}`),
  checkInteractions: (codes: string[]) => request(`/drugs/interactions?${codes.map(c => `drugs[]=${c}`).join('&')}`),
  getAllDrugs: () => request('/drugs'),

  // Reminders
  getReminders: () => request('/reminders'),
  createReminder: (data: any) => request('/reminders', { method: 'POST', body: JSON.stringify(data) }),
  updateReminder: (id: number, data: any) => request(`/reminders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteReminder: (id: number) => request(`/reminders/${id}`, { method: 'DELETE' }),

  // Admin
  getAnalytics: () => request('/admin/analytics'),
  getUsers: (role?: string, status?: string) => request(`/admin/users?${role ? `role=${role}&` : ''}${status ? `status=${status}` : ''}`),
  verifyUser: (id: number) => request(`/admin/users/${id}/verify`, { method: 'PATCH' }),
  suspendUser: (id: number) => request(`/admin/users/${id}/suspend`, { method: 'PATCH' }),
  getAuditLogs: () => request('/admin/audit'),
  getNotifications: () => request('/admin/notifications'),
  markNotificationRead: (id: number) => request(`/admin/notifications/${id}/read`, { method: 'PATCH' }),
  searchPatients: (q: string) => request(`/admin/patients?q=${q}`),
};
