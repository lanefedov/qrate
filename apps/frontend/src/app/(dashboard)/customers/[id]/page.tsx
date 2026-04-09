'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerForm } from '@/components/customers/CustomerForm';
import type { Customer } from '@/types';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/customers/${params.id}`)
      .then((r) => setCustomer(r.data.data ?? r.data))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      await api.patch(`/customers/${params.id}`, values);
      toast.success('Заказчик обновлён');
      router.push('/customers');
    } catch {
      toast.error('Ошибка обновления');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!customer) return <p className="text-destructive">Заказчик не найден</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Редактирование заказчика</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">{customer.fullName}</CardTitle></CardHeader>
        <CardContent>
          <CustomerForm initial={customer} onSubmit={handleSubmit} loading={saving} />
        </CardContent>
      </Card>
    </div>
  );
}
