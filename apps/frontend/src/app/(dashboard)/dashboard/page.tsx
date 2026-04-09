'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FileText, Calculator, Plus } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, Customer } from '@/types';

const statusLabels: Record<string, string> = { draft: 'Черновик', calculated: 'Рассчитан', completed: 'Завершён' };
const statusColors: Record<string, string> = { draft: 'bg-gray-500/20 text-gray-400', calculated: 'bg-green-500/20 text-green-400', completed: 'bg-blue-500/20 text-blue-400' };

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function DashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/customers').then((r) => r.data.data ?? r.data),
      api.get('/orders').then((r) => r.data.data ?? r.data),
    ]).then(([c, o]) => { setCustomers(c); setOrders(o); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const calculated = orders.filter((o) => o.status !== 'draft').length;
  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Панель управления</h2>
        <Link href="/orders/new"><Button><Plus className="mr-2 h-4 w-4" />Новый заказ</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Заказчики</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{customers.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего заказов</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{orders.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Рассчитано</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{calculated}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Последние заказы</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
              <FileText className="h-10 w-10 opacity-30" />
              <p className="text-sm">Заказов пока нет. Создайте первый!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((order) => (
                <Link key={order._id} href={`/orders/${order._id}`} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
                  <div>
                    <p className="text-sm font-medium">{order.orderName}</p>
                    <p className="text-xs text-muted-foreground">{order.orderNumber} · {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.calculationResult && (
                      <span className="text-sm font-semibold text-primary">{formatMoney(order.calculationResult.nic)}</span>
                    )}
                    <Badge className={statusColors[order.status]} variant="secondary">{statusLabels[order.status]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
