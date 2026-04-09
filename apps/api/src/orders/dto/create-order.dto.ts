import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CalculationInputDto } from './calculation-input.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 'ЗКЗ-2025-001' })
  @IsString()
  @MinLength(1)
  orderNumber!: string;

  @ApiProperty({ example: 'Испытания компонентов двигателя РД-120' })
  @IsString()
  @MinLength(1)
  orderName!: string;

  @ApiProperty({ example: 'Вибрационные испытания' })
  @IsString()
  @MinLength(1)
  testType!: string;

  @ApiProperty({ example: '2025-06-01' })
  @IsDateString()
  requestDate!: string;

  @ApiProperty({ example: '665a1b2c3d4e5f6a7b8c9d0e' })
  @IsMongoId()
  customerId!: string;

  @ApiPropertyOptional({ type: CalculationInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CalculationInputDto)
  calculationInput?: CalculationInputDto;
}
