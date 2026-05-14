'use client';

import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthChecked: boolean;
  setSession: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  markAuthChecked: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  isAuthChecked: false,
  setSession: (accessToken, user) => set({ accessToken, user, isAuthChecked: true }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ accessToken: null, user: null, isAuthChecked: true }),
  markAuthChecked: () => set({ isAuthChecked: true }),
  logout: () => set({ accessToken: null, user: null, isAuthChecked: true }),
}));
