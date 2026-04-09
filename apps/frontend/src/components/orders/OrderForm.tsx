'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Customer, TestType } from '@/types';

const schema = z.object({
  customerId: z.string().min(1, 'Выберите заказчика'),
  orderNumber: z.string().min(1, 'Введите номер заказа'),
  orderName: z.string().min(1, 'Введите наименование'),
  testType: z.string().min(1, 'Укажите вид испытаний'),
  requestDate: z.string().min(1, 'Укажите дату'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData & { testTypeId?: string }) => Promise<void>;
  loading?: boolean;
}

export function OrderForm({ onSubmit, loading }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [selectedTestTypeId, setSelectedTestTypeId] = useState<string>();

  useEffect(() => {
    api.get('/customers').then((r) => setCustomers(r.data.data ?? r.data));
    api.get('/test-types').then((r) => setTestTypes(r.data.data ?? r.data));
  }, []);

  const {
    register, handleSubmit, setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { requestDate: new Date().toISOString().split('T')[0] },
  });

  const handleTestTypeChange = (id: string) => {
    const tt = testTypes.find((t) => t._id === id);
    if (tt) {
      setValue('testType', tt.name);
      setSelectedTestTypeId(id);
    }
  };

  const wrappedSubmit = (data: FormData) =>
    onSubmit({ ...data, testTypeId: selectedTestTypeId });

  return (
    <form onSubmit={handleSubmit(wrappedSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Заказчик *</Label>
        <Select onValueChange={(v) => setValue('customerId', v)}>
          <SelectTrigger><SelectValue placeholder="Выберите заказчика" /></SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.fullName} — {c.organization}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>№ заказа *</Label>
          <Input placeholder="ЗКЗ-2025-001" {...register('orderNumber')} />
          {errors.orderNumber && <p className="text-xs text-destructive">{errors.orderNumber.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Наименование *</Label>
          <Input placeholder="Испытания компонентов двигателя" {...register('orderName')} />
          {errors.orderName && <p className="text-xs text-destructive">{errors.orderName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Вид испытаний *</Label>
          <Select onValueChange={handleTestTypeChange}>
            <SelectTrigger><SelectValue placeholder="Выберите из справочника" /></SelectTrigger>
            <SelectContent>
              {testTypes.map((t) => (
                <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register('testType')} />
          {errors.testType && <p className="text-xs text-destructive">{errors.testType.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Дата обращения *</Label>
          <Input type="date" {...register('requestDate')} />
          {errors.requestDate && <p className="text-xs text-destructive">{errors.requestDate.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Создание...' : 'Создать заказ'}
      </Button>
    </form>
  );
}
