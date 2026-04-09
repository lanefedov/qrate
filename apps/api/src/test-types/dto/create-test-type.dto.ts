import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class DefaultParamsDto {
  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  materialsCost?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  equipmentCost?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bonusRate?: number;

  @ApiPropertyOptional({ example: 30.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  overheadRate?: number;
}

export class CreateTestTypeDto {
  @ApiProperty({ example: 'Вибрационные испытания' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'Проверка устойчивости к вибрационным нагрузкам' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: DefaultParamsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultParamsDto)
  defaultParams?: DefaultParamsDto;
}
