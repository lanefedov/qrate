import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface CalcRequest {
  materialsCost: number;
  equipmentCost: number;
  additionalCost: number;
  otherCost: number;
  workers: {
    name: string;
    salary: number;
    hours: number;
    fundHours: number;
  }[];
  bonusRate: number;
  taxRate: number;
  travelCost: number;
  estimateCost: number;
  overheadRate: number;
}

interface CalcResponse {
  nic: number;
  breakdown: {
    materialsCost: number;
    equipmentCost: number;
    additionalCost: number;
    otherCost: number;
    laborCost: number;
    laborWithCoefficients: number;
    travelCost: number;
    estimateCost: number;
    subtotal: number;
    overheadAmount: number;
    totalNic: number;
  };
}

interface CalculationServiceGrpc {
  calculate(request: CalcRequest): Observable<CalcResponse>;
}

@Injectable()
export class CalculationService implements OnModuleInit {
  private calcService!: CalculationServiceGrpc;

  constructor(@Inject('CALC_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.calcService =
      this.client.getService<CalculationServiceGrpc>('CalculationService');
  }

  async calculate(input: CalcRequest): Promise<CalcResponse> {
    return firstValueFrom(this.calcService.calculate(input));
  }
}
