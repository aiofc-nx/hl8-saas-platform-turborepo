/**
 * BaseQuery 测试
 *
 * @description 测试 BaseQuery 基础查询类的功能
 * @since 1.0.0
 */
import { BaseQuery } from './base-query';
import { TenantId } from '@hl8/isolation-model';

// 测试用的查询类
class TestQuery extends BaseQuery {
  public readonly data: Record<string, unknown>;
  public readonly filter: string;

  constructor(
    tenantId: string,
    userId: string,
    page = 1,
    pageSize = 10,
    data: Record<string, unknown> = {}
  ) {
    super(tenantId, userId, page, pageSize);
    this.data = data;
    this.filter = (data['filter'] as string) || '';
  }

  // 静态工厂方法支持旧格式
  static create(
    filter: string,
    tenantId = 'default-tenant',
    userId = 'default-user',
    page = 1,
    pageSize = 10,
    data: Record<string, unknown> = {}
  ): TestQuery {
    const query = new TestQuery(tenantId, userId, page, pageSize, {
      ...data,
      filter,
    });
    return query;
  }

  get queryType(): string {
    return 'TestQuery';
  }

  getQueryType(): string {
    return 'TestQuery';
  }

  override validate(): void {
    // 简单验证，不在构造时抛出错误
  }

  override getTypeName(): string {
    return 'TestQuery';
  }

  override getHashCode(): string {
    return this.queryId.toString();
  }

  override equals(other: unknown): boolean {
    if (!other || !(other instanceof TestQuery)) {
      return false;
    }
    return this.queryId.equals(other.queryId);
  }

  override compareTo(other: unknown): number {
    if (!other || !(other instanceof TestQuery)) {
      return 1;
    }
    return this.createdAt.getTime() - other.createdAt.getTime();
  }

  override belongsToTenant(tenantId: string): boolean {
    return this.tenantId === tenantId;
  }

  override toJSON(): Record<string, unknown> {
    return {
      queryId: this.queryId.toString(),
      tenantId: this.tenantId,
      userId: this.userId,
      createdAt: this.createdAt.toISOString(),
      filter: this.filter,
    };
  }

  override toString(): string {
    return JSON.stringify(this.toJSON());
  }

  protected createCopyWithSortRules(
    sortRules: Array<import('./base-query').ISortRule>
  ): this {
    const copy = new TestQuery(
      this.tenantId,
      this.userId,
      this.page,
      this.pageSize,
      { filter: this.filter }
    );
    // 复制排序规则
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (copy as any)._sortRules = [...sortRules];
    return copy as this;
  }
}

describe('BaseQuery', () => {
  let tenantId: string;

  beforeEach(() => {
    tenantId = 'test-tenant-123';
  });

  describe('查询创建', () => {
    it('应该正确创建基础查询', () => {
      const query = new TestQuery(tenantId, 'user-123', 1, 10, {
        filter: 'test-filter',
      });

      expect(query).toBeInstanceOf(BaseQuery);
      expect(query.tenantId).toBe(tenantId);
      expect(query.userId).toBe('user-123');
      expect(query.filter).toBe('test-filter');
      expect(query.createdAt).toBeInstanceOf(Date);
      expect(query.getQueryType()).toBe('TestQuery');
    });

    it('应该为每个查询生成唯一的ID', () => {
      const query1 = TestQuery.create('filter1');
      const query2 = TestQuery.create('filter2');

      expect(query1.queryId.equals(query2.queryId)).toBe(false);
    });

    it('应该正确设置查询创建时间', () => {
      const beforeTime = new Date();
      const query = TestQuery.create('test-filter');
      const afterTime = new Date();

      expect(query.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(query.createdAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime()
      );
    });
  });

  describe('查询类型和验证', () => {
    it('应该返回正确的查询类型', () => {
      const query = TestQuery.create('test-filter');
      expect(query.getQueryType()).toBe('TestQuery');
    });

    it('应该正确验证查询', () => {
      const query = TestQuery.create('test-filter');
      expect(() => query.validate()).not.toThrow();
    });
  });

  describe('查询相等性', () => {
    it('相同ID的查询应该相等', () => {
      const query1 = TestQuery.create('filter1', tenantId, 'user-123');
      const query2 = TestQuery.create('filter2', tenantId, 'user-123');

      // 手动设置相同的查询ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query1 as any)._queryId = (query2 as any)._queryId;

      expect(query1.equals(query2)).toBe(true);
    });

    it('不同ID的查询应该不相等', () => {
      const query1 = TestQuery.create('filter1', tenantId, 'user-123');
      const query2 = TestQuery.create('filter2', tenantId, 'user-123');

      expect(query1.equals(query2)).toBe(false);
    });

    it('与 null 或 undefined 比较应该返回 false', () => {
      const query = TestQuery.create('test-filter');
      expect(query.equals(null)).toBe(false);
      expect(query.equals(undefined)).toBe(false);
    });
  });

  describe('查询比较', () => {
    it('应该按创建时间比较查询', async () => {
      const query1 = TestQuery.create('filter1');

      // 等待一小段时间确保时间不同
      await new Promise<void>((resolve) => {
        global.setTimeout(resolve, 10);
      });

      const query2 = TestQuery.create('filter2');

      expect(query1.compareTo(query2)).toBeLessThan(0);
      expect(query2.compareTo(query1)).toBeGreaterThan(0);
      expect(query1.compareTo(query1)).toBe(0);
    });

    it('与 null 或 undefined 比较应该返回 1', () => {
      const query = TestQuery.create('test-filter');
      expect(query.compareTo(null as unknown as BaseQuery)).toBe(1);
      expect(query.compareTo(undefined as unknown as BaseQuery)).toBe(1);
    });
  });

  describe('租户关联', () => {
    it('应该正确检查查询是否属于指定的租户', () => {
      const query = TestQuery.create('test-filter', tenantId, 'user-123');
      const otherTenantId = 'other-tenant-456';

      expect(query.belongsToTenant(tenantId)).toBe(true);
      expect(query.belongsToTenant(otherTenantId)).toBe(false);
    });
  });

  describe('查询转换', () => {
    it('应该正确转换为字符串', () => {
      const query = TestQuery.create('test-filter');
      const str = query.toString();
      expect(typeof str).toBe('string');
      expect(str).toContain(query.queryId.toString());
    });

    it('应该正确转换为 JSON', () => {
      const query = TestQuery.create('test-filter');
      const json = query.toJSON();

      expect(json).toHaveProperty('queryId');
      expect(json['queryType']).toBeUndefined(); // BaseQuery 不自动设置 queryType
      expect(json).toHaveProperty('tenantId');
      expect(json).toHaveProperty('createdAt');
    });

    it('应该正确获取哈希码', () => {
      const query = TestQuery.create('test-filter');
      expect(query.getHashCode()).toBe(query.queryId.toString());
    });

    it('应该正确获取类型名称', () => {
      const query = TestQuery.create('test-filter');
      expect(query.getTypeName()).toBe('TestQuery');
    });
  });

  describe('边界情况', () => {
    it('应该处理特殊字符的过滤器', () => {
      const specialFilter = 'test-filter_123.@#$%^&*()';
      const query = TestQuery.create(specialFilter);
      expect(query.filter).toBe(specialFilter);
    });

    it('应该处理 Unicode 字符', () => {
      const unicodeFilter = '测试过滤器_José_🚀';
      const query = TestQuery.create(unicodeFilter, '租户-123', 'user-123');

      expect(query.filter).toBe(unicodeFilter);
      expect(query.tenantId).toBe('租户-123');
    });

    it('应该处理复杂的查询数据', () => {
      const complexData = {
        filter: 'complex',
        sort: { field: 'name', order: 'asc' },
        pagination: { page: 1, size: 10 },
        includes: ['user', 'profile'],
      };

      const query = new TestQuery('tenant-1', 'user-1', 1, 10, {
        ...complexData,
        filter: 'complex-test',
      });

      expect(query.data).toEqual({
        ...complexData,
        filter: 'complex-test',
      });
      expect(query.filter).toBe('complex-test');
    });

    it('应该处理空的查询数据', () => {
      const query = TestQuery.create(
        'empty-test',
        'tenant-1',
        'user-1',
        1,
        10,
        {}
      );

      expect(query.data).toEqual({ filter: 'empty-test' });
    });

    it('应该处理null和undefined值', () => {
      const query = TestQuery.create(
        'null-test',
        'default-tenant',
        'default-user',
        1,
        10,
        {
          filter: null,
          sort: undefined,
        }
      );

      expect(query.tenantId).toBe('default-tenant');
      expect(query.userId).toBe('default-user');
    });

    it('应该处理大型查询对象', () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
        })),
        metadata: { totalCount: 1000 },
      };

      const query = new TestQuery('tenant-1', 'user-1', 1, 10, {
        filter: 'large-test',
        ...largeData,
      });

      expect(query.data['items']).toHaveLength(1000);
      expect((query.data['metadata'] as any).totalCount).toBe(1000);
    });
  });

  describe('查询性能测试', () => {
    it('应该快速创建大量查询', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        new TestQuery('tenant-1', 'user-1', 1, 10, {
          filter: `query-${i}`,
          index: i,
        });
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(500); // 应该在500ms内完成
    });

    it('应该支持查询的批量比较', () => {
      const queries = Array.from(
        { length: 50 },
        (_, i) =>
          new TestQuery('tenant-1', 'user-1', 1, 10, {
            filter: `query-${i}`,
            index: i,
          })
      );

      const startTime = Date.now();

      // 对所有查询进行排序
      queries.sort((a, b) => a.compareTo(b));

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50); // 应该很快完成
      expect(queries).toHaveLength(50);
    });

    it('应该高效处理查询序列化', () => {
      const query = new TestQuery('tenant-1', 'user-1', 1, 10, {
        filter: 'serialize-test',
        largeData: Array.from({ length: 100 }, (_, i) => `item-${i}`),
      });

      const startTime = Date.now();

      const json = query.toJSON();
      const string = query.toString();
      const hashCode = query.getHashCode();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50);
      expect(json).toBeDefined();
      expect(string).toBeDefined();
      expect(hashCode).toBeDefined();
    });
  });

  describe('查询扩展功能', () => {
    it('应该支持查询验证增强', () => {
      const validQuery = new TestQuery('tenant-1', 'user-1', 1, 10, {
        filter: 'valid',
        pagination: { page: 1, size: 10 },
      });

      const invalidQuery = new TestQuery('tenant-1', 'user-1', 1, 10, {
        filter: '',
      }); // 空action

      expect(() => validQuery.validate()).not.toThrow();
      expect(() => invalidQuery.validate()).not.toThrow();
    });

    it('应该支持查询类型检查扩展', () => {
      const query1 = TestQuery.create('type-test', 'tenant-1', 'user-1');
      const query2 = TestQuery.create('type-test', 'tenant-1', 'user-1');
      const query3 = TestQuery.create('different-type', 'tenant-1', 'user-1');

      expect(query1.isOfType('TestQuery')).toBe(true);
      expect(query1.isOfType('TestQuery')).toBe(true);
      expect(query1.isOfType('different-type')).toBe(false);

      expect(query1.isOfType(query2.getQueryType())).toBe(true);
      expect(query1.isOfType(query3.getQueryType())).toBe(true);
    });

    it('应该支持查询元数据操作', () => {
      const query = new TestQuery('tenant-1', 'user-1', 1, 10, {
        filter: 'test',
        metadata: {
          source: 'api',
          version: '1.0',
          tags: ['important', 'user-data'],
        },
      });

      // 测试元数据访问
      expect((query.data['metadata'] as any).source).toBe('api');
      expect((query.data['metadata'] as any).version).toBe('1.0');
      expect((query.data['metadata'] as any).tags).toContain('important');
    });

    it('应该支持查询状态检查', () => {
      const activeQuery = TestQuery.create('active-test', 'tenant-1', 'user-1');
      const expiredQuery = TestQuery.create(
        'expired-test',
        'tenant-1',
        'user-1'
      );

      // 检查查询创建时间
      expect(activeQuery.createdAt.getTime()).toBeGreaterThan(
        Date.now() - 1000
      );
      expect(expiredQuery.createdAt.getTime()).toBeGreaterThan(
        Date.now() - 1000
      );
    });

    it('应该支持查询参数验证', () => {
      const queryWithValidParams = new TestQuery('tenant-1', 'user-1', 1, 10, {
        page: 1,
        size: 10,
        filter: 'valid',
      });

      const queryWithInvalidParams = new TestQuery(
        'tenant-1',
        'user-1',
        1,
        10,
        {
          page: -1, // 无效
          size: 0, // 无效
          filter: '', // 空
        }
      );

      expect(queryWithValidParams.data['page']).toBe(1);
      expect(queryWithValidParams.data['size']).toBe(10);

      expect(queryWithInvalidParams.data['page']).toBe(-1);
      expect(queryWithInvalidParams.data['size']).toBe(0);
    });
  });
});
