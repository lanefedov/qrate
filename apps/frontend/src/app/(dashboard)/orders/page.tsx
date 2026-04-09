'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { OrderTable } from '@/components/orders/OrderTable';
import type { Order } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await api.get('/orders');
    setOrders(data.data ?? data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Заказ удалён');
      await fetch();
    } catch { toast.error('Ошибка удаления'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Заказы</h2>
        <Link href="/orders/new"><Button><Plus className="mr-2 h-4 w-4" />Новый заказ</Button></Link>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Список заказов</CardTitle></CardHeader>
        <CardContent>
          {loading ? <TableSkeleton cols={6} /> : <OrderTable orders={orders} onDelete={handleDelete} />}
        </CardContent>
      </Card>
    </div>
  );
}
