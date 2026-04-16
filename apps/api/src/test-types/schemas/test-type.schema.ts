import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TestTypeDocument = HydratedDocument<TestType>;

@Schema({
  collection: 'user_test_types',
  timestamps: { createdAt: true, updatedAt: false },
})
export class TestType {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
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
TestTypeSchema.index(
  { userId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  },
);
