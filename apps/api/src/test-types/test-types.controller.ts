import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
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
  findAll(@Request() req: any) {
    return this.testTypesService.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a test type' })
  @ApiResponse({ status: 201, description: 'Test type created' })
  create(@Request() req: any, @Body() dto: CreateTestTypeDto) {
    return this.testTypesService.create(req.user.userId, dto);
  }

  @Post('reset-defaults')
  @ApiOperation({ summary: 'Reset test types to the default set' })
  resetDefaults(@Request() req: any) {
    return this.testTypesService.resetToDefaults(req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a test type' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTestTypeDto,
  ) {
    return this.testTypesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a test type' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.testTypesService.remove(id, req.user.userId);
  }
}
