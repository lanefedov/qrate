'use client';

import { Download, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/lib/utils';
import api from '@/lib/api';
import type { CalculationResult as CalcResult } from '@/types';

interface Props {
  result: CalcResult;
  orderId: string;
  orderNumber: string;
  onRecalculate?: () => void;
}

const breakdownLabels: [keyof CalcResult['breakdown'], string][] = [
  ['materialsCost', 'Материалы'],
  ['equipmentCost', 'Оборудование'],
  ['additionalCost', 'Доп. затраты'],
  ['otherCost', 'Прочие'],
  ['laborCost', 'Трудозатраты'],
  ['laborWithCoefficients', 'Трудозатраты с коэфф.'],
  ['travelCost', 'Командировочные'],
  ['estimateCost', 'Сметные'],
  ['subtotal', 'Промежуточный итог'],
  ['overheadAmount', 'Накладные расходы'],
];

export function CalculationResult({
  result,
  orderId,
  orderNumber,
  onRecalculate,
}: Props) {
  const downloadPdf = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `QRate_Report_${orderNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF скачан');
    } catch {
      toast.error('Ошибка генерации PDF');
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-base text-muted-foreground">
          Начальная исходная цена (НИЦ)
        </CardTitle>
        <p className="text-4xl font-bold text-primary">
          {formatMoney(result.nic)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">
                  Статья затрат
                </th>
                <th className="px-4 py-2 text-right font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {breakdownLabels.map(([key, label], i) => (
                <tr
                  key={key}
                  className={`border-b ${i % 2 ? 'bg-muted/20' : ''}`}
                >
                  <td className="px-4 py-2">{label}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatMoney(result.breakdown[key])}
                  </td>
                </tr>
              ))}
              <tr className="bg-primary/10 font-bold">
                <td className="px-4 py-3">ИТОГО НИЦ</td>
                <td className="px-4 py-3 text-right text-primary">
                  {formatMoney(result.breakdown.totalNic)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={downloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Скачать PDF
          </Button>
          {onRecalculate && (
            <Button variant="outline" onClick={onRecalculate}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Пересчитать
            </Button>
          )}
          <Link href="/orders">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              К списку заказов
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
