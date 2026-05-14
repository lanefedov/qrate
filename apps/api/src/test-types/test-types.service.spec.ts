import { Types } from 'mongoose';
import { TestTypesService } from './test-types.service';

interface FakeDoc {
  _id: string;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  defaultParams?: Record<string, number>;
  isActive: boolean;
}

class FakeTestTypeModel {
  private docs: FakeDoc[] = [];

  countDocuments(filter: Partial<FakeDoc>) {
    return { exec: async () => this.docs.filter((doc) => this.matches(doc, filter)).length };
  }

  async insertMany(docs: Omit<FakeDoc, '_id'>[]) {
    const inserted = docs.map((doc) => ({
      ...doc,
      _id: new Types.ObjectId().toString(),
    }));
    this.docs.push(...inserted);
    return inserted;
  }

  find(filter: Partial<FakeDoc>) {
    return {
      sort: () => ({
        exec: async () =>
          this.docs
            .filter((doc) => this.matches(doc, filter))
            .sort((left, right) => left.name.localeCompare(right.name)),
      }),
    };
  }

  findOne(filter: Partial<FakeDoc> & { _id?: string | { $ne: string } }) {
    return {
      exec: async () => this.docs.find((doc) => this.matches(doc, filter)) ?? null,
    };
  }

  findOneAndUpdate(
    filter: Partial<FakeDoc> & { _id?: string },
    update: Partial<FakeDoc>,
  ) {
    return {
      exec: async () => {
        const doc = this.docs.find((item) => this.matches(item, filter));
        if (!doc) {
          return null;
        }
        Object.assign(doc, update);
        return doc;
      },
    };
  }

  private matches(
    doc: FakeDoc,
    filter: Partial<FakeDoc> & { _id?: string | { $ne: string } },
  ): boolean {
    return Object.entries(filter).every(([key, value]) => {
      if (key === '_id' && typeof value === 'object' && value && '$ne' in value) {
        return doc._id !== (value as unknown as { $ne: string }).$ne;
      }

      const actual = doc[key as keyof FakeDoc];
      if (actual instanceof Types.ObjectId && value instanceof Types.ObjectId) {
        return actual.equals(value);
      }
      return actual === value;
    });
  }
}

describe('TestTypesService', () => {
  it('keeps default test types isolated per user', async () => {
    const model = new FakeTestTypeModel();
    const service = new TestTypesService(model as never);
    const firstUserId = new Types.ObjectId().toString();
    const secondUserId = new Types.ObjectId().toString();

    await service.initializeDefaultsForUser(firstUserId);
    await service.initializeDefaultsForUser(secondUserId);

    const firstUserTypes = await service.findAll(firstUserId);
    const secondUserTypes = await service.findAll(secondUserId);

    expect(firstUserTypes.length).toBeGreaterThan(0);
    expect(secondUserTypes).toHaveLength(firstUserTypes.length);
    expect(firstUserTypes.every((item) => item.userId.equals(firstUserId))).toBe(true);
    expect(secondUserTypes.every((item) => item.userId.equals(secondUserId))).toBe(true);

    await service.update(firstUserTypes[0]._id.toString(), firstUserId, {
      name: 'Custom first user type',
    });

    const updatedFirstUserTypes = await service.findAll(firstUserId);
    const unchangedSecondUserTypes = await service.findAll(secondUserId);

    expect(updatedFirstUserTypes.map((item) => item.name)).toContain(
      'Custom first user type',
    );
    expect(unchangedSecondUserTypes.map((item) => item.name)).not.toContain(
      'Custom first user type',
    );
  });
});
