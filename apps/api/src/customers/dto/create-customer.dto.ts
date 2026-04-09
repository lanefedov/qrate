import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Петров Пётр Петрович' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'ООО "Космос"' })
  @IsString()
  @MinLength(1)
  organization!: string;

  @ApiPropertyOptional({ example: 'Начальник отдела' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: 'г. Самара, ул. Ленина, 1' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+7-999-000-00-00' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'petrov@cosmos.ru' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
