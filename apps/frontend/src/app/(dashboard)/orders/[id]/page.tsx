'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calculator } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CalculationResult } from '@/components/orders/CalculationResult';
import type { Order, Customer } from '@/types';

const statusLabels: Record<string, string> = { draft: 'Черновик', calculated: 'Рассчитан', completed: 'Завершён' };
const statusColors: Record<string, string> = { draft: 'bg-gray-500/20 text-gray-400', calculated: 'bg-green-500/20 text-green-400', completed: 'bg-blue-500/20 text-blue-400' };

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${params.id}`)
      .then(async (r) => {
        const o = r.data.data ?? r.data;
        setOrder(o);
        try {
          const cr = await api.get(`/customers/${o.customerId}`);
          setCustomer(cr.data.data ?? cr.data);
        } catch { /* customer may have been deleted */ }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!order) return <p className="text-destructive">Заказ не найден</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{order.orderName}</h2>
        <Badge className={statusColors[order.status]} variant="secondary">{statusLabels[order.status]}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Информация о заказе</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">№ заказа: </span><span className="font-medium">{order.orderNumber}</span></div>
          <div><span className="text-muted-foreground">Вид испытаний: </span><span className="font-medium">{order.testType}</span></div>
          <div><span className="text-muted-foreground">Дата обращения: </span><span className="font-medium">{formatDate(order.requestDate)}</span></div>
          <div><span className="text-muted-foreground">Создан: </span><span className="font-medium">{formatDate(order.createdAt)}</span></div>
          {customer && (
            <>
              <Separator className="sm:col-span-2" />
              <div><span className="text-muted-foreground">Заказчик: </span><span className="font-medium">{customer.fullName}</span></div>
              <div><span className="text-muted-foreground">Организация: </span><span className="font-medium">{customer.organization}</span></div>
            </>
          )}
        </CardContent>
      </Card>

      {order.calculationResult ? (
        <CalculationResult result={order.calculationResult} orderId={order._id} orderNumber={order.orderNumber} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Calculator className="h-10 w-10 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">Расчёт ещё не выполнен</p>
            <Link href={`/orders/${order._id}/calculate`}>
              <Button size="lg"><Calculator className="mr-2 h-4 w-4" />Перейти к расчёту</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
