import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CalculationService } from '../calculation/calculation.service';
import { PdfService } from '../pdf/pdf.service';
import { CustomersService } from '../customers/customers.service';
import { ReportData } from '../pdf/templates/report';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly calculationService: CalculationService,
    private readonly pdfService: PdfService,
    private readonly customersService: CustomersService,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<OrderDocument> {
    return this.orderModel.create({
      ...dto,
      userId,
      status: OrderStatus.DRAFT,
    });
  }

  async findAll(userId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findOne({ _id: id, userId })
      .exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateOrderDto,
  ): Promise<OrderDocument> {
    const order = await this.orderModel
      .findOneAndUpdate({ _id: id, userId }, dto, { new: true })
      .exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.orderModel
      .findOneAndDelete({ _id: id, userId })
      .exec();
    if (!result) {
      throw new NotFoundException('Order not found');
    }
  }

  async calculate(
    id: string,
    userId: string,
  ): Promise<{ nic: number; breakdown: Record<string, any> }> {
    const order = await this.findOne(id, userId);

    if (!order.calculationInput) {
      throw new BadRequestException(
        'Order has no calculation input. Update the order with calculationInput first.',
      );
    }

    const input = order.calculationInput;
    const result = await this.calculationService.calculate({
      materialsCost: input.materialsCost ?? 0,
      equipmentCost: input.equipmentCost ?? 0,
      additionalCost: input.additionalCost ?? 0,
      otherCost: input.otherCost ?? 0,
      workers: (input.workers ?? []).map((w: any) => ({
        name: w.name ?? '',
        salary: w.salary ?? 0,
        hours: w.hours ?? 0,
        fundHours: w.fundHours ?? 0,
      })),
      bonusRate: input.bonusRate ?? 0,
      taxRate: input.taxRate ?? 0,
      travelCost: input.travelCost ?? 0,
      estimateCost: input.estimateCost ?? 0,
      overheadRate: input.overheadRate ?? 0,
    });

    order.calculationResult = result;
    order.status = OrderStatus.CALCULATED;
    await order.save();

    return result;
  }

  async generatePdf(
    id: string,
    userId: string,
  ): Promise<{ filePath: string; orderNumber: string }> {
    const order = await this.findOne(id, userId);

    if (order.status === OrderStatus.DRAFT || !order.calculationResult) {
      throw new BadRequestException(
        'Calculation has not been performed yet. Run POST /orders/:id/calculate first.',
      );
    }

    const customer = await this.customersService.findOne(
      order.customerId.toString(),
      userId,
    );

    const input = order.calculationInput!;
    const result = order.calculationResult;
    const breakdown = result.breakdown ?? result;

    const reportData: ReportData = {
      orderNumber: order.orderNumber,
      orderName: order.orderName,
      testType: order.testType,
      requestDate: order.requestDate,
      customer: {
        fullName: customer.fullName,
        organization: customer.organization,
        position: customer.position,
        phone: customer.phone,
        email: customer.email,
      },
      input: {
        materialsCost: input.materialsCost ?? 0,
        equipmentCost: input.equipmentCost ?? 0,
        additionalCost: input.additionalCost ?? 0,
        otherCost: input.otherCost ?? 0,
        workers: (input.workers ?? []).map((w: any) => ({
          name: w.name ?? '',
          salary: w.salary ?? 0,
          hours: w.hours ?? 0,
          fundHours: w.fundHours ?? 0,
        })),
        bonusRate: input.bonusRate ?? 0,
        taxRate: input.taxRate ?? 0,
        travelCost: input.travelCost ?? 0,
        estimateCost: input.estimateCost ?? 0,
        overheadRate: input.overheadRate ?? 0,
      },
      breakdown: {
        materialsCost: breakdown.materialsCost ?? 0,
        equipmentCost: breakdown.equipmentCost ?? 0,
        additionalCost: breakdown.additionalCost ?? 0,
        otherCost: breakdown.otherCost ?? 0,
        laborCost: breakdown.laborCost ?? 0,
        laborWithCoefficients: breakdown.laborWithCoefficients ?? 0,
        travelCost: breakdown.travelCost ?? 0,
        estimateCost: breakdown.estimateCost ?? 0,
        subtotal: breakdown.subtotal ?? 0,
        overheadAmount: breakdown.overheadAmount ?? 0,
        totalNic: breakdown.totalNic ?? 0,
      },
      nic: result.nic ?? breakdown.totalNic ?? 0,
    };

    const filePath = await this.pdfService.generateReport(
      reportData,
      order._id.toString(),
    );

    order.pdfPath = filePath;
    await order.save();

    return { filePath, orderNumber: order.orderNumber };
  }
}
