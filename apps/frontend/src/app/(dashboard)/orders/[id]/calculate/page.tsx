'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { CalculationForm } from '@/components/orders/CalculationForm';
import { CalculationResult } from '@/components/orders/CalculationResult';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order, CalculationInput, CalculationResult as CalcResult, TestType } from '@/types';

export default function CalculatePage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [presetInput, setPresetInput] = useState<CalculationInput | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await api.get(`/orders/${params.id}`);
      const o: Order = data.data ?? data;
      setOrder(o);

      if (o.calculationResult) {
        setResult(o.calculationResult);
      } else if (!o.calculationInput) {
        try {
          const { data: ttData } = await api.get('/test-types');
          const types: TestType[] = ttData.data ?? ttData;
          const match = types.find((t) => t.name === o.testType);
          if (match?.defaultParams) {
            const dp = match.defaultParams;
            setPresetInput({
              materialsCost: dp.materialsCost ?? 0,
              equipmentCost: dp.equipmentCost ?? 0,
              additionalCost: 0,
              otherCost: 0,
              workers: [],
              bonusRate: dp.bonusRate ?? 0,
              taxRate: dp.taxRate ?? 0,
              overheadRate: dp.overheadRate ?? 0,
              travelCost: 0,
              estimateCost: 0,
            });
          }
        } catch { /* ignore preset fetch failure */ }
      }

      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const handleSubmit = async (input: CalculationInput) => {
    setCalculating(true);
    try {
      await api.patch(`/orders/${params.id}`, { calculationInput: input });
      const { data } = await api.post(`/orders/${params.id}/calculate`);
      const calcResult = data.data ?? data;
      setResult(calcResult);
      setOrder((prev) =>
        prev ? { ...prev, calculationInput: input, calculationResult: calcResult, status: 'calculated' } : prev,
      );
      toast.success('Расчёт выполнен');
    } catch {
      toast.error('Ошибка расчёта');
    } finally {
      setCalculating(false);
    }
  };

  const handleRecalculate = () => { setResult(null); };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!order) return <p className="text-destructive">Заказ не найден</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">Расчёт НИЦ — {order.orderNumber}</h2>

      {result ? (
        <CalculationResult
          result={result}
          orderId={order._id}
          orderNumber={order.orderNumber}
          onRecalculate={handleRecalculate}
        />
      ) : (
        <CalculationForm
          initial={order.calculationInput ?? presetInput}
          onSubmit={handleSubmit}
          loading={calculating}
        />
      )}
    </div>
  );
}
