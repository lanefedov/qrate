import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
export class TestTypesService {
  constructor(
    @InjectModel(TestType.name)
    private testTypeModel: Model<TestTypeDocument>,
  ) {}

  private toUserObjectId(userId: string): Types.ObjectId {
    return new Types.ObjectId(userId);
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  private buildDefaultDocs(userId: string) {
    const userObjectId = this.toUserObjectId(userId);
    return SEED_DATA.map((item) => ({
      name: item.name,
      description: item.description,
      defaultParams: item.defaultParams
        ? {
            materialsCost: item.defaultParams.materialsCost,
            equipmentCost: item.defaultParams.equipmentCost,
            bonusRate: item.defaultParams.bonusRate,
            taxRate: item.defaultParams.taxRate,
            overheadRate: item.defaultParams.overheadRate,
          }
        : undefined,
      userId: userObjectId,
      isActive: true,
    }));
  }

  private async insertDefaultDocs(userId: string): Promise<void> {
    const defaultDocs = this.buildDefaultDocs(userId);

    try {
      await this.testTypeModel.insertMany(defaultDocs, { ordered: false });
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) {
        throw error;
      }
    }
  }

  async initializeDefaultsForUser(userId: string): Promise<void> {
    const userObjectId = this.toUserObjectId(userId);
    const count = await this.testTypeModel
      .countDocuments({ userId: userObjectId })
      .exec();

    if (count > 0) {
      return;
    }

    await this.insertDefaultDocs(userId);
  }

  async resetToDefaults(userId: string): Promise<TestTypeDocument[]> {
    const userObjectId = this.toUserObjectId(userId);

    await this.testTypeModel
      .updateMany({ userId: userObjectId, isActive: true }, { isActive: false })
      .exec();
    await this.insertDefaultDocs(userId);

    return this.testTypeModel
      .find({ userId: userObjectId, isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async findAll(userId: string): Promise<TestTypeDocument[]> {
    const userObjectId = this.toUserObjectId(userId);

    return this.testTypeModel
      .find({ userId: userObjectId, isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<TestTypeDocument> {
    const userObjectId = this.toUserObjectId(userId);
    const doc = await this.testTypeModel
      .findOne({ _id: id, userId: userObjectId })
      .exec();
    if (!doc) throw new NotFoundException('Test type not found');
    return doc;
  }

  async create(userId: string, dto: CreateTestTypeDto): Promise<TestTypeDocument> {
    const userObjectId = this.toUserObjectId(userId);
    const name = this.normalizeName(dto.name);
    const existing = await this.testTypeModel
      .findOne({ userId: userObjectId, name, isActive: true })
      .exec();

    if (existing) {
      throw new ConflictException('Test type with this name already exists');
    }

    return this.testTypeModel.create({
      ...dto,
      userId: userObjectId,
      name,
      isActive: true,
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTestTypeDto,
  ): Promise<TestTypeDocument> {
    const userObjectId = this.toUserObjectId(userId);
    const payload = {
      ...dto,
      ...(dto.name ? { name: this.normalizeName(dto.name) } : {}),
    };

    if (payload.name) {
      const existing = await this.testTypeModel
        .findOne({
          _id: { $ne: id },
          userId: userObjectId,
          name: payload.name,
          isActive: true,
        })
        .exec();

      if (existing) {
        throw new ConflictException('Test type with this name already exists');
      }
    }

    const doc = await this.testTypeModel
      .findOneAndUpdate({ _id: id, userId: userObjectId }, payload, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Test type not found');
    return doc;
  }

  async remove(id: string, userId: string): Promise<void> {
    const userObjectId = this.toUserObjectId(userId);
    const doc = await this.testTypeModel
      .findOneAndUpdate(
        { _id: id, userId: userObjectId },
        { isActive: false },
        { new: true },
      )
      .exec();
    if (!doc) throw new NotFoundException('Test type not found');
  }
}
