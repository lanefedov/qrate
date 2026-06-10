import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class WorkerDto {
  @ApiProperty({ example: 'Иванов И.И.' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 50000, description: 'ЗП — зарплата' })
  @IsNumber()
  @Min(0)
  salary!: number;

  @ApiProperty({ example: 80, description: 'Затраченное время (часы)' })
  @IsNumber()
  @Min(0)
  hours!: number;

  @ApiProperty({ example: 160, description: 'Фонд рабочего времени (часы)' })
  @IsNumber()
  @Min(0.01)
  fundHours!: number;
}

export class CalculationInputDto {
  @ApiProperty({ example: 10000, description: 'Зм — затраты на материалы' })
  @IsNumber()
  @Min(0)
  materialsCost!: number;

  @ApiProperty({ example: 5000, description: 'Зизг — изготовление оснастки' })
  @IsNumber()
  @Min(0)
  equipmentCost!: number;

  @ApiProperty({ example: 2000, description: 'Зпокуп — покупка/аренда спецоборудования' })
  @IsNumber()
  @Min(0)
  additionalCost!: number;

  @ApiProperty({ example: 1000, description: 'Зпр — работы сторонних организаций' })
  @IsNumber()
  @Min(0)
  otherCost!: number;

  @ApiProperty({ type: [WorkerDto], description: 'Массив исполнителей' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerDto)
  workers!: WorkerDto[];

  @ApiProperty({ example: 30, description: 'Ксф — накладные на ФОТ (%)' })
  @IsNumber()
  @Min(0)
  bonusRate!: number;

  @ApiProperty({ example: 30.2, description: 'Кнз — начисления в Соцфонд (%)' })
  @IsNumber()
  @Min(0)
  taxRate!: number;

  @ApiProperty({ example: 3000, description: 'Зкр — командировочные расходы' })
  @IsNumber()
  @Min(0)
  travelCost!: number;

  @ApiProperty({ example: 2000, description: 'Зст — страхование' })
  @IsNumber()
  @Min(0)
  estimateCost!: number;

  @ApiProperty({ example: 20, description: 'Кпр — норма прибыли (%)' })
  @IsNumber()
  @Min(0)
  overheadRate!: number;
}
