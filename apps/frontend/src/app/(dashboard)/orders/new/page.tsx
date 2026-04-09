'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderForm } from '@/components/orders/OrderForm';

export default function NewOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const payload = { ...data };
      delete payload.testTypeId;
      const res = await api.post('/orders', payload);
      const order = res.data.data ?? res.data;
      toast.success('Заказ создан');
      router.push(`/orders/${order._id}`);
    } catch {
      toast.error('Ошибка создания заказа');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Новый заказ</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Данные заказа</CardTitle></CardHeader>
        <CardContent>
          <OrderForm onSubmit={handleSubmit} loading={saving} />
        </CardContent>
      </Card>
    </div>
  );
}
