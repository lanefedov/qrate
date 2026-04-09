'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Customer } from '@/types';

const PAGE_SIZE = 10;

interface Props {
  customers: Customer[];
  onDelete: (id: string) => void;
}

export function CustomerTable({ customers, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(search.toLowerCase()) ||
          c.organization.toLowerCase().includes(search.toLowerCase()),
      ),
    [customers, search],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <Users className="h-12 w-12 opacity-30" />
        <p className="text-sm">Заказчиков пока нет. Создайте первого!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени или организации..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">ФИО</th>
              <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Организация</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Телефон</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Email</th>
              <th className="px-4 py-3 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((c) => (
              <tr key={c._id} className="border-b transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{c.fullName}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">{c.organization}</div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">{c.organization}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.email ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/customers/${c._id}`}>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(c._id)}>
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
          <p className="text-xs text-muted-foreground">
            {filtered.length} записей · стр. {page + 1} из {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Удалить заказчика?"
        description="Заказчик будет удалён. Связанные заказы останутся без привязки."
        onConfirm={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }}
      />
    </div>
  );
}
