import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateCustomerDto,
  ): Promise<CustomerDocument> {
    return this.customerModel.create({ ...dto, userId });
  }

  async findAll(userId: string): Promise<CustomerDocument[]> {
    return this.customerModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<CustomerDocument> {
    const customer = await this.customerModel
      .findOne({ _id: id, userId })
      .exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerDocument> {
    const customer = await this.customerModel
      .findOneAndUpdate({ _id: id, userId }, dto, { new: true })
      .exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.customerModel
      .findOneAndDelete({ _id: id, userId })
      .exec();
    if (!result) {
      throw new NotFoundException('Customer not found');
    }
  }
}
