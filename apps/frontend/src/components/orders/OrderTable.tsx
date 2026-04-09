'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye, Calculator, Download, Trash2, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDate, formatMoney } from '@/lib/utils';
import api from '@/lib/api';
import type { Order } from '@/types';

const PAGE_SIZE = 10;

const statusLabels: Record<string, string> = { draft: 'Черновик', calculated: 'Рассчитан', completed: 'Завершён' };
const statusColors: Record<string, string> = { draft: 'bg-gray-500/20 text-gray-400', calculated: 'bg-green-500/20 text-green-400', completed: 'bg-blue-500/20 text-blue-400' };

interface Props {
  orders: Order[];
  onDelete: (id: string) => void;
}

export function OrderTable({ orders, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.orderName.toLowerCase().includes(search.toLowerCase()),
      ),
    [orders, search],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const downloadPdf = async (id: string, orderNumber: string) => {
    const response = await api.get(`/orders/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `QRate_Report_${orderNumber}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <FileText className="h-12 w-12 opacity-30" />
        <p className="text-sm">Заказов пока нет. Создайте первый!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по номеру или названию..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">№</th>
              <th className="px-4 py-3 text-left font-medium">Название</th>
              <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Испытания</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Дата</th>
              <th className="px-4 py-3 text-left font-medium">Статус</th>
              <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">НИЦ</th>
              <th className="px-4 py-3 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((o) => (
              <tr key={o._id} className="border-b transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                <td className="px-4 py-3">{o.orderName}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{o.testType}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(o.requestDate)}</td>
                <td className="px-4 py-3">
                  <Badge className={statusColors[o.status]} variant="secondary">{statusLabels[o.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-semibold hidden sm:table-cell">
                  {o.calculationResult ? formatMoney(o.calculationResult.nic) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/orders/${o._id}`}><Button variant="ghost" size="icon" title="Просмотр"><Eye className="h-4 w-4" /></Button></Link>
                    <Link href={`/orders/${o._id}/calculate`}><Button variant="ghost" size="icon" title="Расчёт"><Calculator className="h-4 w-4" /></Button></Link>
                    {o.status !== 'draft' && (
                      <Button variant="ghost" size="icon" title="PDF" onClick={() => downloadPdf(o._id, o.orderNumber)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(o._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{filtered.length} записей · стр. {page + 1} из {totalPages}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Удалить заказ?"
        description="Заказ и все связанные данные будут удалены безвозвратно."
        onConfirm={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }}
      />
    </div>
  );
}
