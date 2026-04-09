import { PartialType } from '@nestjs/swagger';
import { CreateTestTypeDto } from './create-test-type.dto';

export class UpdateTestTypeDto extends PartialType(CreateTestTypeDto) {}
