'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAuthChecked, initializeSession } = useAuth();

  useEffect(() => {
    void initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (isAuthChecked && !isAuthenticated) router.replace('/login');
  }, [isAuthChecked, isAuthenticated, router]);

  if (!isAuthChecked || !isAuthenticated) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
