/**
 * 隔离模块
 * 
 * @description NestJS 数据隔离功能的主模块
 * 
 * ## 功能特性
 * 
 * - 自动从请求头提取隔离上下文
 * - 基于 nestjs-cls 实现请求级上下文管理
 * - 提供装饰器、守卫、服务
 * - 支持 Fastify 和 Express
 * 
 * ## 使用方式
 * 
 * ```typescript
 * @Module({
 *   imports: [
 *     IsolationModule.forRoot(),
 *   ],
 * })
 * export class AppModule {}
 * ```
 * 
 * @since 1.0.0
 */

import { Module, NestModule, MiddlewareConsumer, Global } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { 
  IsolationContext, 
  TenantId, 
  OrganizationId, 
  DepartmentId, 
  UserId,
} from '@hl8/isolation-model';
import { IsolationContextService } from './services/isolation-context.service.js';
import { MultiLevelIsolationService } from './services/multi-level-isolation.service.js';
import { IsolationExtractionMiddleware } from './middleware/isolation-extraction.middleware.js';
import { IsolationGuard } from './guards/isolation.guard.js';

const ISOLATION_CONTEXT_KEY = 'ISOLATION_CONTEXT';

/**
 * 请求对象接口（简化版）
 * 
 * @description 用于类型安全地访问请求头
 */
interface RequestWithHeaders {
  headers: Record<string, string | string[] | undefined>;
}

@Global()
@Module({})
export class IsolationModule {
  /**
   * 配置隔离模块
   * 
   * @returns 动态模块
   * 
   * @example
   * ```typescript
   * @Module({
   *   imports: [IsolationModule.forRoot()],
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot() {
    return {
      module: IsolationModule,
      imports: [
        // 配置 ClsModule 用于请求级上下文管理
        // 启用中间件以自动设置 CLS 上下文
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            generateId: true,
            idGenerator: (req: RequestWithHeaders) => 
              req.headers?.['x-request-id'] as string ?? 
              `req-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            // 在 CLS 上下文设置后，立即提取隔离上下文
            setup: (cls, req: RequestWithHeaders) => {
              try {
                // 提取请求头
                const extractHeader = (name: string) => {
                  const value = req.headers?.[name];
                  return Array.isArray(value) ? value[0] : value;
                };
                
                const tenantId = extractHeader('x-tenant-id');
                const orgId = extractHeader('x-organization-id');
                const deptId = extractHeader('x-department-id');
                const userId = extractHeader('x-user-id');
                
                // 创建隔离上下文（按层级优先级判断）
                let context: IsolationContext;
                
                // 优先级：部门 > 组织 > 租户 > 用户 > 平台
                if (deptId && orgId && tenantId) {
                  // 部门级（最高优先级）
                  context = IsolationContext.department(
                    TenantId.create(tenantId),
                    OrganizationId.create(orgId),
                    DepartmentId.create(deptId),
                  );
                } else if (orgId && tenantId) {
                  // 组织级
                  context = IsolationContext.organization(
                    TenantId.create(tenantId),
                    OrganizationId.create(orgId),
                  );
                } else if (userId) {
                  // 用户级（可能有租户，也可能没有）
                  const userIdVO = UserId.create(userId);
                  const tenantIdVO = tenantId ? TenantId.create(tenantId) : undefined;
                  context = IsolationContext.user(userIdVO, tenantIdVO);
                } else if (tenantId) {
                  // 租户级
                  context = IsolationContext.tenant(TenantId.create(tenantId));
                } else {
                  // 平台级（默认）
                  context = IsolationContext.platform();
                }
                
                // 存储到 CLS
                cls.set(ISOLATION_CONTEXT_KEY, context);
              } catch (error) {
                // 验证错误时，降级到平台级
                cls.set(ISOLATION_CONTEXT_KEY, IsolationContext.platform());
              }
            },
          },
        }),
      ],
      providers: [
        IsolationContextService,
        MultiLevelIsolationService,
        IsolationGuard,
      ],
      exports: [
        IsolationContextService,
        MultiLevelIsolationService,
        IsolationGuard,
      ],
    };
  }
  
}

