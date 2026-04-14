import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { sanitizeForLog, toLogMessage } from '../common/logging.utils';

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
  private readonly logger = new Logger(CalculationService.name);

  constructor(@Inject('CALC_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.calcService =
      this.client.getService<CalculationServiceGrpc>('CalculationService');
  }

  async calculate(input: CalcRequest): Promise<CalcResponse> {
    this.logger.log(
      toLogMessage('calc.request', {
        workerCount: input.workers.length,
        payload: sanitizeForLog(input),
      }),
    );

    const result = await firstValueFrom(this.calcService.calculate(input));

    this.logger.log(
      toLogMessage('calc.response', {
        nic: result.nic,
        breakdown: sanitizeForLog(result.breakdown),
      }),
    );

    return result;
  }
}
