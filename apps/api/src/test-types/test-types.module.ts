import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestType, TestTypeSchema } from './schemas/test-type.schema';
import { TestTypesService } from './test-types.service';
import { TestTypesController } from './test-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestType.name, schema: TestTypeSchema },
    ]),
  ],
  controllers: [TestTypesController],
  providers: [TestTypesService],
  exports: [TestTypesService],
})
export class TestTypesModule {}
