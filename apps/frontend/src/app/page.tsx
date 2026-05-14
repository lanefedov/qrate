'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthChecked, initializeSession } = useAuth();

  useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (isAuthChecked) {
      router.replace(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isAuthChecked, isAuthenticated, router]);

  return null;
}
