import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProduces,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created with status draft' })
  create(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all orders for the current user' })
  findAll(@Request() req: any) {
    return this.ordersService.findAll(req.user.userId);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate and download PDF report' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF file stream' })
  @ApiResponse({ status: 400, description: 'Calculation not performed yet' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async downloadPdf(
    @Request() req: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, orderNumber } =
      await this.ordersService.generatePdf(id, req.user.userId);

    const filename = `QRate_Report_${orderNumber}.pdf`;
    res.type('application/pdf');
    res.attachment(filename);

    const stream = fs.createReadStream(filePath);
    return new StreamableFile(stream);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order with calculation result' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.remove(id, req.user.userId);
  }

  @Post(':id/calculate')
  @ApiOperation({
    summary: 'Run НИЦ calculation via gRPC calc service',
    description:
      'Takes calculationInput from the order, sends it to the Go calc service, ' +
      'saves the result, and sets status to "calculated".',
  })
  @ApiResponse({ status: 200, description: 'Calculation result with НИЦ and breakdown' })
  @ApiResponse({ status: 400, description: 'No calculation input on the order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  calculate(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.calculate(id, req.user.userId);
  }
}
