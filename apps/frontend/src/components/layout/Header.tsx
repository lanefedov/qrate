'use client';

import { usePathname } from 'next/navigation';

const titles: Record<string, string> = {
  '/dashboard': 'Панель управления',
  '/customers': 'Заказчики',
  '/orders': 'Заказы',
  '/orders/new': 'Новый заказ',
};

export function Header() {
  const pathname = usePathname();
  const title =
    Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] ??
    'QRate';

  return (
    <header className="flex h-14 items-center border-b px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
