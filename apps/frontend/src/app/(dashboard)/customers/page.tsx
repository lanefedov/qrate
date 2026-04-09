'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerForm } from '@/components/customers/CustomerForm';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    const { data } = await api.get('/customers');
    setCustomers(data.data ?? data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      await api.post('/customers', values);
      toast.success('Заказчик создан');
      setDialogOpen(false);
      await fetch();
    } catch { toast.error('Ошибка создания заказчика'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Заказчик удалён');
      await fetch();
    } catch { toast.error('Ошибка удаления'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Заказчики</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Добавить заказчика</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Новый заказчик</DialogTitle></DialogHeader>
            <CustomerForm onSubmit={handleCreate} loading={saving} />
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Список заказчиков</CardTitle></CardHeader>
        <CardContent>
          {loading ? <TableSkeleton cols={5} /> : <CustomerTable customers={customers} onDelete={handleDelete} />}
        </CardContent>
      </Card>
    </div>
  );
}
