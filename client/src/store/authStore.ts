import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  id: number;
  role: string;
  full_name: string;
  email: string;
  phone?: string;
  is_verified: number;
  national_id?: string;
  nhif_number?: string;
  profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('dawatrack_token'),
  loading: true,

  login: async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('dawatrack_token', data.token);
    set({ user: data.user, token: data.token });
  },

  register: async (formData) => {
    const data = await api.register(formData);
    localStorage.setItem('dawatrack_token', data.token);
    set({ user: data.user, token: data.token });
  },

  logout: () => {
    localStorage.removeItem('dawatrack_token');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('dawatrack_token');
    if (!token) { set({ loading: false }); return; }
    try {
      const user = await api.getMe();
      set({ user, token, loading: false });
    } catch {
      localStorage.removeItem('dawatrack_token');
      set({ user: null, token: null, loading: false });
    }
  },
}));
