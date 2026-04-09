import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TestTypeDocument = HydratedDocument<TestType>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class TestType {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop(
    raw({
      materialsCost: { type: Number },
      equipmentCost: { type: Number },
      bonusRate: { type: Number },
      taxRate: { type: Number },
      overheadRate: { type: Number },
    }),
  )
  defaultParams?: Record<string, number>;

  @Prop({ default: true })
  isActive!: boolean;
}

export const TestTypeSchema = SchemaFactory.createForClass(TestType);
