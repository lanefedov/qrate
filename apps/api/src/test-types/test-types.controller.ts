import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TestTypesService } from './test-types.service';
import { CreateTestTypeDto } from './dto/create-test-type.dto';
import { UpdateTestTypeDto } from './dto/update-test-type.dto';

@ApiTags('test-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('test-types')
export class TestTypesController {
  constructor(private readonly testTypesService: TestTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List active test types' })
  findAll() {
    return this.testTypesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a test type' })
  @ApiResponse({ status: 201, description: 'Test type created' })
  create(@Body() dto: CreateTestTypeDto) {
    return this.testTypesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test type' })
  update(@Param('id') id: string, @Body() dto: UpdateTestTypeDto) {
    return this.testTypesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a test type' })
  remove(@Param('id') id: string) {
    return this.testTypesService.remove(id);
  }
}
