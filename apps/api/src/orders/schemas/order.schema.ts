import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId!: Types.ObjectId;

  @Prop({ required: true })
  orderNumber!: string;

  @Prop({ required: true })
  orderName!: string;

  @Prop({ required: true })
  testType!: string;

  @Prop({ required: true })
  requestDate!: Date;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.DRAFT })
  status!: OrderStatus;

  @Prop(
    raw({
      materialsCost: { type: Number },
      equipmentCost: { type: Number },
      additionalCost: { type: Number },
      otherCost: { type: Number },
      workers: [
        {
          name: { type: String },
          salary: { type: Number },
          hours: { type: Number },
          fundHours: { type: Number },
        },
      ],
      bonusRate: { type: Number },
      taxRate: { type: Number },
      travelCost: { type: Number },
      estimateCost: { type: Number },
      overheadRate: { type: Number },
    }),
  )
  calculationInput?: Record<string, any>;

  @Prop(
    raw({
      nic: { type: Number },
      breakdown: {
        type: {
          materialsCost: { type: Number },
          equipmentCost: { type: Number },
          additionalCost: { type: Number },
          otherCost: { type: Number },
          laborCost: { type: Number },
          laborWithCoefficients: { type: Number },
          travelCost: { type: Number },
          estimateCost: { type: Number },
          subtotal: { type: Number },
          overheadAmount: { type: Number },
          totalNic: { type: Number },
        },
      },
    }),
  )
  calculationResult?: Record<string, any>;

  @Prop()
  pdfPath?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
