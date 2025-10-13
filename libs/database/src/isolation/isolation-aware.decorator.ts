/**
 * 隔离装饰器
 *
 * @description 确保方法在正确的隔离上下文中执行
 *
 * ## 业务规则
 *
 * - 方法执行前验证隔离上下文
 * - 缺少必需的上下文时抛出异常
 * - 记录隔离验证日志
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRepository {
 *   constructor(
 *     private readonly isolationService: DatabaseIsolationService,
 *   ) {}
 *
 *   @IsolationAware(IsolationLevel.TENANT)
 *   async findAll(): Promise<User[]> {
 *     // 自动验证租户上下文
 *     const tenantId = this.isolationService.getTenantId();
 *     return this.em.find(User, { tenantId });
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { IsolationLevel } from './isolation.service.js';

/**
 * 隔离感知装饰器
 *
 * @description 确保方法在正确的隔离上下文中执行
 *
 * @param level - 需要的隔离级别，默认为 TENANT
 * @returns 方法装饰器
 */
export function IsolationAware(level: IsolationLevel = IsolationLevel.TENANT): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 获取 DatabaseIsolationService（需要类中注入）
      const isolationService = (this as any).isolationService;

      if (!isolationService) {
        throw new Error(
          `@IsolationAware 装饰器要求类注入 DatabaseIsolationService。` +
          `请在 ${target.constructor.name} 中添加：constructor(private readonly isolationService: DatabaseIsolationService)`
        );
      }

      // 验证隔离上下文
      isolationService.validateContext(level);

      // 执行原方法
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

