'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

export function useAuth() {
  const router = useRouter();
  const {
    accessToken,
    isAuthChecked,
    setSession,
    clearAuth,
    markAuthChecked,
  } = useAuthStore();

  const initializeSession = useCallback(async () => {
    if (accessToken || isAuthChecked) {
      return;
    }

    try {
      const { data } = await api.post('/auth/refresh');
      const tokens = data.data ?? data;
      setSession(tokens.accessToken, tokens.user);
    } catch {
      clearAuth();
    } finally {
      markAuthChecked();
    }
  }, [accessToken, isAuthChecked, setSession, clearAuth, markAuthChecked]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const tokens = data.data ?? data;
    setSession(tokens.accessToken, tokens.user);
    router.push('/dashboard');
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => {
    const { data } = await api.post('/auth/register', payload);
    const tokens = data.data ?? data;
    setSession(tokens.accessToken, tokens.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
    }
    router.push('/login');
  };

  return {
    isAuthenticated: !!accessToken,
    isAuthChecked,
    initializeSession,
    login,
    register,
    logout,
  };
}
