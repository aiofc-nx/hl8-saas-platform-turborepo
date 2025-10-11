/**
 * IsolationModule 集成测试
 *
 * @description 测试 IsolationModule 的模块配置、ClsModule 集成和服务注入
 */

import { Test, type TestingModule } from '@nestjs/testing';
import { IsolationModule } from '../../src/isolation/isolation.module.js';
import { IsolationContextService } from '../../src/isolation/services/isolation-context.service.js';
import { MultiLevelIsolationService } from '../../src/isolation/services/multi-level-isolation.service.js';
import type { DynamicModule } from '@nestjs/common';

describe('IsolationModule 集成测试', () => {
  describe('forRoot - 模块配置', () => {
    let module: TestingModule;
    let contextService: IsolationContextService;
    let isolationService: MultiLevelIsolationService;

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('应该成功加载模块', async () => {
      module = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      contextService = module.get<IsolationContextService>(
        IsolationContextService,
      );
      isolationService = module.get<MultiLevelIsolationService>(
        MultiLevelIsolationService,
      );

      expect(contextService).toBeDefined();
      expect(isolationService).toBeDefined();
    });

    it('应该正确注入 IsolationContextService', async () => {
      module = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      const service = module.get<IsolationContextService>(
        IsolationContextService,
      );

      expect(service).toBeInstanceOf(IsolationContextService);
      expect(typeof service.setIsolationContext).toBe('function');
      expect(typeof service.getIsolationContext).toBe('function');
      expect(typeof service.getTenantId).toBe('function');
    });

    it('应该正确注入 MultiLevelIsolationService', async () => {
      module = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      const service = module.get<MultiLevelIsolationService>(
        MultiLevelIsolationService,
      );

      expect(service).toBeInstanceOf(MultiLevelIsolationService);
      expect(typeof service.validateIsolation).toBe('function');
      expect(typeof service.checkAccess).toBe('function');
    });
  });

  describe('ClsModule 集成', () => {
    let module: TestingModule;

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('应该集成 ClsModule', async () => {
      module = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      const contextService = module.get<IsolationContextService>(
        IsolationContextService,
      );

      // ClsModule 应该已经被导入
      expect(contextService).toBeDefined();
    });

    it('IsolationContextService 应该可以访问 ClsService', async () => {
      module = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      const contextService = module.get<IsolationContextService>(
        IsolationContextService,
      );

      // 测试 ClsService 的基本功能
      expect(() => contextService.getIsolationContext()).not.toThrow();
    });
  });

  describe('服务依赖注入', () => {
    let module: TestingModule;

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('MultiLevelIsolationService 应该注入 IsolationContextService', async () => {
      module = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      const isolationService = module.get<MultiLevelIsolationService>(
        MultiLevelIsolationService,
      );
      const contextService = module.get<IsolationContextService>(
        IsolationContextService,
      );

      expect(isolationService).toBeDefined();
      expect(contextService).toBeDefined();
    });

    it('服务应该可以在其他模块中被注入', async () => {
      // 创建一个使用 IsolationModule 的测试服务
      class TestService {
        constructor(
          private readonly contextService: IsolationContextService,
        ) {}

        getTenantId() {
          return this.contextService.getTenantId();
        }
      }

      module = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
        providers: [TestService],
      }).compile();

      const testService = module.get<TestService>(TestService);

      expect(testService).toBeDefined();
      expect(typeof testService.getTenantId).toBe('function');
    });
  });

  describe('模块导出', () => {
    let module: TestingModule;

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('应该导出 IsolationContextService', async () => {
      module = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      const service = module.get<IsolationContextService>(
        IsolationContextService,
      );

      expect(service).toBeDefined();
    });

    it('应该导出 MultiLevelIsolationService', async () => {
      module = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      const service = module.get<MultiLevelIsolationService>(
        MultiLevelIsolationService,
      );

      expect(service).toBeDefined();
    });
  });

  describe('模块元数据', () => {
    it('forRoot 应该返回 DynamicModule', () => {
      const dynamicModule = IsolationModule.forRoot();

      expect(dynamicModule).toHaveProperty('module');
      expect(dynamicModule).toHaveProperty('imports');
      expect(dynamicModule).toHaveProperty('providers');
      expect(dynamicModule).toHaveProperty('exports');
      expect((dynamicModule as DynamicModule).module).toBe(IsolationModule);
      expect((dynamicModule as DynamicModule).global).toBe(true);
    });

    it('模块应该是全局模块', () => {
      const dynamicModule = IsolationModule.forRoot();

      expect((dynamicModule as DynamicModule).global).toBe(true);
    });
  });

  describe('多次导入', () => {
    it('应该支持模块多次导入', async () => {
      // 创建两个独立的模块实例
      const module1 = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      const module2 = await Test.createTestingModule({
        imports: [IsolationModule.forRoot()],
      }).compile();

      const service1 = module1.get<IsolationContextService>(
        IsolationContextService,
      );
      const service2 = module2.get<IsolationContextService>(
        IsolationContextService,
      );

      expect(service1).toBeDefined();
      expect(service2).toBeDefined();

      await module1.close();
      await module2.close();
    });
  });
});

