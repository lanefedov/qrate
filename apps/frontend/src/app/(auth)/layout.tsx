'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isAuthChecked, initializeSession } = useAuth();

  useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (isAuthChecked && isAuthenticated) router.replace('/dashboard');
  }, [isAuthChecked, isAuthenticated, router]);

  if (!isAuthChecked || isAuthenticated) return null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
