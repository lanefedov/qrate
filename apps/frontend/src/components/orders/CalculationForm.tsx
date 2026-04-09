'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WorkerFields } from './WorkerFields';
import type { CalculationInput } from '@/types';

const workerSchema = z.object({
  name: z.string().min(1, 'Введите ФИО'),
  salary: z.number().min(0),
  hours: z.number().min(0),
  fundHours: z.number().min(0.01, 'Фонд > 0'),
});

const schema = z.object({
  materialsCost: z.number().min(0),
  equipmentCost: z.number().min(0),
  additionalCost: z.number().min(0),
  otherCost: z.number().min(0),
  workers: z.array(workerSchema),
  bonusRate: z.number().min(0),
  taxRate: z.number().min(0),
  overheadRate: z.number().min(0),
  travelCost: z.number().min(0),
  estimateCost: z.number().min(0),
});

interface Props {
  initial?: CalculationInput;
  onSubmit: (data: CalculationInput) => Promise<void>;
  loading?: boolean;
}

function FormulaBlock() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-primary">Формула расчёта НИЦ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-mono text-xs leading-relaxed text-muted-foreground">
          НИЦ = Зм + Зоб + Здоп + Зпр + ΣЗотi × (1 + Кф) × (1 + Кн) + Зкр + Зсм + НР
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span><strong className="text-foreground">Зотi</strong> = Оклад × (Часы / Фонд)</span>
          <span><strong className="text-foreground">НР</strong> = Подитог × Ктр</span>
          <span><strong className="text-foreground">Кф</strong> — коэффициент доплат</span>
          <span><strong className="text-foreground">Кн</strong> — начисления на ФОТ</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CalculationForm({ initial, onSubmit, loading }: Props) {
  const {
    register, handleSubmit, control,
    formState: { errors },
  } = useForm<CalculationInput>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? {
      materialsCost: 0, equipmentCost: 0, additionalCost: 0, otherCost: 0,
      workers: [], bonusRate: 0, taxRate: 0, overheadRate: 0,
      travelCost: 0, estimateCost: 0,
    },
  });

  type ScalarField = Exclude<keyof CalculationInput, 'workers'>;

  const numField = (name: ScalarField, label: string, suffix: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{label} <span className="text-muted-foreground">({suffix})</span></Label>
      <Input type="number" step="0.01" {...register(name, { valueAsNumber: true })} />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormulaBlock />

      <Card>
        <CardHeader><CardTitle className="text-base">Основные затраты</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {numField('materialsCost', 'Затраты на материалы (Зм)', '₽')}
            {numField('equipmentCost', 'Затраты на оборудование (Зоб)', '₽')}
            {numField('additionalCost', 'Дополнительные затраты (Здоп)', '₽')}
            {numField('otherCost', 'Прочие затраты (Зпр)', '₽')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <WorkerFields control={control} register={register} errors={errors} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Коэффициенты</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {numField('bonusRate', 'Коэффициент доплат/премий (Кф)', '%')}
            {numField('taxRate', 'Коэффициент начислений (Кн)', '%')}
            {numField('overheadRate', 'Коэффициент накладных (Ктр)', '%')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Дополнительно</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {numField('travelCost', 'Командировочные расходы (Зкр)', '₽')}
            {numField('estimateCost', 'Сметные расходы (Зсм)', '₽')}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Расчёт...' : 'Рассчитать НИЦ'}
      </Button>
    </form>
  );
}
