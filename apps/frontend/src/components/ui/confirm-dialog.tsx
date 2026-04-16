'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
  confirmText?: string;
  loadingText?: string;
  confirmVariant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Подтверждение',
  description = 'Вы уверены? Это действие нельзя отменить.',
  onConfirm,
  loading,
  confirmText = 'Подтвердить',
  loadingText = 'Сохранение...',
  confirmVariant = 'default',
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Отмена
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? loadingText : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
