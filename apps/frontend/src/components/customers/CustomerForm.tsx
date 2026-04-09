'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Customer } from '@/types';

const schema = z.object({
  fullName: z.string().min(2, 'Введите ФИО'),
  organization: z.string().min(1, 'Введите организацию'),
  position: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Некорректный email').or(z.literal('')).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initial?: Customer;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export function CustomerForm({ initial, onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          fullName: initial.fullName,
          organization: initial.organization,
          position: initial.position ?? '',
          address: initial.address ?? '',
          phone: initial.phone ?? '',
          email: initial.email ?? '',
        }
      : {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>ФИО *</Label>
          <Input placeholder="Петров Пётр Петрович" {...register('fullName')} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Организация *</Label>
          <Input placeholder='ООО "Космос"' {...register('organization')} />
          {errors.organization && <p className="text-xs text-destructive">{errors.organization.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Должность</Label>
          <Input placeholder="Начальник отдела" {...register('position')} />
        </div>
        <div className="space-y-2">
          <Label>Адрес</Label>
          <Input placeholder="г. Самара, ул. Ленина, 1" {...register('address')} />
        </div>
        <div className="space-y-2">
          <Label>Телефон</Label>
          <Input placeholder="+7-999-000-00-00" {...register('phone')} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" placeholder="petrov@cosmos.ru" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Сохранение...' : initial ? 'Сохранить' : 'Создать'}
      </Button>
    </form>
  );
}
