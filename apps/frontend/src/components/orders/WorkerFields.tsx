'use client';

import { useFieldArray, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CalculationInput } from '@/types';

interface Props {
  control: Control<CalculationInput>;
  register: UseFormRegister<CalculationInput>;
  errors: FieldErrors<CalculationInput>;
}

export function WorkerFields({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workers',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Исполнители</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ name: '', salary: 0, hours: 0, fundHours: 160 })
          }
        >
          <Plus className="mr-1 h-3 w-3" />
          Добавить
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Нет исполнителей. Нажмите «Добавить» чтобы добавить.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative rounded-lg border p-4 space-y-3"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => remove(index)}
          >
            <X className="h-3 w-3" />
          </Button>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1 sm:col-span-4">
              <Label className="text-xs">ФИО</Label>
              <Input
                placeholder="Иванов И.И."
                {...register(`workers.${index}.name`)}
              />
              {errors?.workers?.[index]?.name && (
                <p className="text-xs text-destructive">
                  {errors.workers[index].name.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Зарплата (₽)</Label>
              <Input
                type="number"
                step="0.01"
                {...register(`workers.${index}.salary`, {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Время (ч)</Label>
              <Input
                type="number"
                step="0.01"
                {...register(`workers.${index}.hours`, {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Фонд рабочего времени (ч)</Label>
              <Input
                type="number"
                step="0.01"
                {...register(`workers.${index}.fundHours`, {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="flex items-end">
              <p className="text-xs text-muted-foreground pb-2">
                Исполнитель {index + 1}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
