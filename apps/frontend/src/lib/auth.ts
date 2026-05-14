'use client';

import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isAuthChecked: boolean;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  markAuthChecked: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  isAuthChecked: false,
  setAccessToken: (accessToken) => set({ accessToken, isAuthChecked: true }),
  clearAuth: () => set({ accessToken: null, isAuthChecked: true }),
  markAuthChecked: () => set({ isAuthChecked: true }),
  logout: () => set({ accessToken: null, isAuthChecked: true }),
}));
