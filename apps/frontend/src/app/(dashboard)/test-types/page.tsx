'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { formatMoney } from '@/lib/utils';
import type { TestType } from '@/types';

interface FormProps {
  initial?: Partial<TestType>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
}

function TestTypeForm({ initial, onSubmit, loading }: FormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [materialsCost, setMaterialsCost] = useState(initial?.defaultParams?.materialsCost ?? 0);
  const [equipmentCost, setEquipmentCost] = useState(initial?.defaultParams?.equipmentCost ?? 0);
  const [bonusRate, setBonusRate] = useState(initial?.defaultParams?.bonusRate ?? 0);
  const [taxRate, setTaxRate] = useState(initial?.defaultParams?.taxRate ?? 0);
  const [overheadRate, setOverheadRate] = useState(initial?.defaultParams?.overheadRate ?? 0);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    return onSubmit({
      name, description,
      defaultParams: { materialsCost, equipmentCost, bonusRate, taxRate, overheadRate },
    });
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="space-y-2">
        <Label>Название *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Описание</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <p className="text-xs font-medium text-muted-foreground pt-2">Пресеты по умолчанию</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Материалы, ₽</Label>
          <Input type="number" step="0.01" value={materialsCost} onChange={(e) => setMaterialsCost(+e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Оборудование, ₽</Label>
          <Input type="number" step="0.01" value={equipmentCost} onChange={(e) => setEquipmentCost(+e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Доплаты, %</Label>
          <Input type="number" step="0.01" value={bonusRate} onChange={(e) => setBonusRate(+e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Начисления, %</Label>
          <Input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(+e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Накладные, %</Label>
          <Input type="number" step="0.01" value={overheadRate} onChange={(e) => setOverheadRate(+e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </form>
  );
}

export default function TestTypesPage() {
  const [types, setTypes] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<TestType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchTypes = useCallback(async () => {
    try {
      const { data } = await api.get('/test-types');
      setTypes(data.data ?? data);
    } catch {
      toast.error('Не удалось загрузить виды испытаний');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

  const handleCreate = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      await api.post('/test-types', values);
      toast.success('Вид испытаний создан');
      setDialogOpen(false);
      await fetchTypes();
    } catch { toast.error('Ошибка создания'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!editItem) return;
    setSaving(true);
    try {
      await api.patch(`/test-types/${editItem._id}`, values);
      toast.success('Обновлено');
      setEditItem(null);
      await fetchTypes();
    } catch { toast.error('Ошибка обновления'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/test-types/${deleteId}`);
      toast.success('Удалено');
      setDeleteId(null);
      await fetchTypes();
    } catch { toast.error('Ошибка удаления'); }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const { data } = await api.post('/test-types/reset-defaults');
      setTypes(data.data ?? data);
      setResetOpen(false);
      toast.success('Справочник сброшен к значениям по умолчанию');
    } catch {
      toast.error('Не удалось сбросить справочник');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Справочник видов испытаний</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Добавить вид</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Новый вид испытаний</DialogTitle></DialogHeader>
            <TestTypeForm onSubmit={handleCreate} loading={saving} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Виды испытаний</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setResetOpen(true)}
          >
            Вернуться к видам по умолчанию
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton cols={4} />
          ) : types.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <FlaskConical className="h-12 w-12 opacity-30" />
              <p className="text-sm">Справочник пуст.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Название</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Описание</th>
                    <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Материалы</th>
                    <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">Оборудование</th>
                    <th className="px-4 py-3 text-right font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((t) => (
                    <tr key={t._id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">{t.description ?? '—'}</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">{t.defaultParams?.materialsCost ? formatMoney(t.defaultParams.materialsCost) : '—'}</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">{t.defaultParams?.equipmentCost ? formatMoney(t.defaultParams.equipmentCost) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditItem(t)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(t._id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Редактировать</DialogTitle></DialogHeader>
          {editItem && <TestTypeForm initial={editItem} onSubmit={handleUpdate} loading={saving} />}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Удалить вид испытаний?"
        description="Вид будет деактивирован. Существующие заказы не пострадают."
        onConfirm={handleDelete}
        confirmText="Удалить"
        loadingText="Удаление..."
        confirmVariant="destructive"
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Вернуться к видам по умолчанию?"
        description="Текущий набор видов испытаний будет заменён значениями по умолчанию. Существующие заказы не пострадают."
        onConfirm={handleReset}
        loading={resetting}
        confirmText="Вернуться"
        loadingText="Возврат..."
        confirmVariant="destructive"
      />
    </div>
  );
}
