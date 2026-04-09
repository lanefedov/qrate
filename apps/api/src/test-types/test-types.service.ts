import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestType, TestTypeDocument } from './schemas/test-type.schema';
import { CreateTestTypeDto } from './dto/create-test-type.dto';
import { UpdateTestTypeDto } from './dto/update-test-type.dto';

const SEED_DATA: CreateTestTypeDto[] = [
  {
    name: 'Вибрационные испытания',
    description: 'Проверка устойчивости изделий к вибрационным нагрузкам при транспортировке и эксплуатации',
    defaultParams: { materialsCost: 8000, equipmentCost: 15000, bonusRate: 30, taxRate: 30.2, overheadRate: 20 },
  },
  {
    name: 'Термовакуумные испытания',
    description: 'Моделирование условий космического пространства: глубокий вакуум и температурные циклы',
    defaultParams: { materialsCost: 12000, equipmentCost: 25000, bonusRate: 35, taxRate: 30.2, overheadRate: 25 },
  },
  {
    name: 'Ударные испытания',
    description: 'Проверка устойчивости к ударным и пиротехническим воздействиям',
    defaultParams: { materialsCost: 6000, equipmentCost: 10000, bonusRate: 30, taxRate: 30.2, overheadRate: 20 },
  },
  {
    name: 'Акустические испытания',
    description: 'Проверка устойчивости к акустическим нагрузкам при старте ракеты-носителя',
    defaultParams: { materialsCost: 10000, equipmentCost: 20000, bonusRate: 30, taxRate: 30.2, overheadRate: 22 },
  },
  {
    name: 'Испытания на герметичность',
    description: 'Проверка герметичности корпусов, соединений и уплотнений',
    defaultParams: { materialsCost: 5000, equipmentCost: 8000, bonusRate: 25, taxRate: 30.2, overheadRate: 18 },
  },
  {
    name: 'Электрические испытания',
    description: 'Проверка электрических параметров, изоляции, ЭМС бортовых систем',
    defaultParams: { materialsCost: 7000, equipmentCost: 12000, bonusRate: 30, taxRate: 30.2, overheadRate: 20 },
  },
  {
    name: 'Огневые стендовые испытания',
    description: 'Испытания ракетных двигателей на огневом стенде с контролем тяги и параметров',
    defaultParams: { materialsCost: 50000, equipmentCost: 80000, bonusRate: 40, taxRate: 30.2, overheadRate: 30 },
  },
];

@Injectable()
export class TestTypesService implements OnModuleInit {
  constructor(
    @InjectModel(TestType.name)
    private testTypeModel: Model<TestTypeDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.testTypeModel.countDocuments();
    if (count === 0) {
      await this.testTypeModel.insertMany(
        SEED_DATA.map((d) => ({ ...d, isActive: true })),
      );
    }
  }

  async findAll(): Promise<TestTypeDocument[]> {
    return this.testTypeModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<TestTypeDocument> {
    const doc = await this.testTypeModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Test type not found');
    return doc;
  }

  async create(dto: CreateTestTypeDto): Promise<TestTypeDocument> {
    return this.testTypeModel.create({ ...dto, isActive: true });
  }

  async update(id: string, dto: UpdateTestTypeDto): Promise<TestTypeDocument> {
    const doc = await this.testTypeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Test type not found');
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.testTypeModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Test type not found');
  }
}
