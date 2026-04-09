'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

export function useAuth() {
  const router = useRouter();
  const { accessToken, setTokens, logout: clearTokens } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const tokens = data.data ?? data;
    setTokens(tokens.accessToken, tokens.refreshToken);
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
    setTokens(tokens.accessToken, tokens.refreshToken);
    router.push('/dashboard');
  };

  const logout = () => {
    clearTokens();
    router.push('/login');
  };

  return { isAuthenticated: !!accessToken, login, register, logout };
}
