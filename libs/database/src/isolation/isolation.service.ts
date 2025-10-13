/**
 * 数据隔离服务
 *
 * @description 提供多租户数据隔离功能
 *
 * ## 业务规则
 *
 * ### 隔离验证规则
 * - 所有数据访问必须提供隔离上下文
 * - 根据隔离级别验证上下文完整性
 * - 缺少必需的上下文信息时拒绝访问
 *
 * ### 隔离过滤规则
 * - 自动应用租户隔离过滤
 * - 根据隔离级别应用组织/部门过滤
 * - 确保跨租户数据完全隔离
 *
 * ### 审计日志规则
 * - 记录所有隔离验证结果
 * - 记录隔离上下文信息
 * - 便于安全审计和问题追踪
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRepository {
 *   constructor(
 *     private readonly isolationService: DatabaseIsolationService,
 *   ) {}
 *
 *   async findAll(): Promise<User[]> {
 *     this.isolationService.validateContext('TENANT');
 *     const tenantId = this.isolationService.getTenantId();
 *     return this.em.find(User, { tenantId });
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { IsolationContextService } from '@hl8/nestjs-isolation';
import type { IsolationContext } from '@hl8/isolation-model';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { IsolationContextMissingException } from '../exceptions/isolation-context-missing.exception.js';

/**
 * 隔离级别枚举
 *
 * @description 定义数据隔离的级别
 */
export enum IsolationLevel {
  /** 平台级 */
  PLATFORM = 'PLATFORM',
  
  /** 租户级 */
  TENANT = 'TENANT',
  
  /** 组织级 */
  ORGANIZATION = 'ORGANIZATION',
  
  /** 部门级 */
  DEPARTMENT = 'DEPARTMENT',
  
  /** 用户级 */
  USER = 'USER',
}

@Injectable()
export class DatabaseIsolationService {
  constructor(
    private readonly isolationContextService: IsolationContextService,
    private readonly logger: FastifyLoggerService,
  ) {
    this.logger.log('DatabaseIsolationService 初始化');
  }

  /**
   * 获取隔离上下文
   *
   * @description 从隔离服务获取当前请求的隔离上下文
   *
   * @returns 隔离上下文，如果不存在则返回 undefined
   */
  getContext(): IsolationContext | undefined {
    // IsolationContextService 提供 context 属性
    return (this.isolationContextService as any).context;
  }

  /**
   * 获取租户 ID
   *
   * @description 从隔离上下文获取租户 ID
   *
   * @returns 租户 ID，如果不存在则返回 undefined
   */
  getTenantId(): string | undefined {
    return this.getContext()?.tenantId?.getValue();
  }

  /**
   * 获取组织 ID
   *
   * @description 从隔离上下文获取组织 ID
   *
   * @returns 组织 ID，如果不存在则返回 undefined
   */
  getOrganizationId(): string | undefined {
    return this.getContext()?.organizationId?.getValue();
  }

  /**
   * 获取部门 ID
   *
   * @description 从隔离上下文获取部门 ID
   *
   * @returns 部门 ID，如果不存在则返回 undefined
   */
  getDepartmentId(): string | undefined {
    return this.getContext()?.departmentId?.getValue();
  }

  /**
   * 获取用户 ID
   *
   * @description 从隔离上下文获取用户 ID
   *
   * @returns 用户 ID，如果不存在则返回 undefined
   */
  getUserId(): string | undefined {
    return this.getContext()?.userId?.getValue();
  }

  /**
   * 验证隔离上下文
   *
   * @description 验证当前请求是否具有所需级别的隔离上下文
   *
   * @param level - 需要的隔离级别
   * @throws {IsolationContextMissingException} 上下文缺失或不完整时抛出
   *
   * @example
   * ```typescript
   * // 验证租户级隔离
   * this.isolationService.validateContext(IsolationLevel.TENANT);
   * ```
   */
  validateContext(level: IsolationLevel): void {
    const context = this.getContext();

    if (!context) {
      this.logger.warn('隔离上下文缺失', { requiredLevel: level });
      throw new IsolationContextMissingException(
        '数据访问要求提供隔离上下文',
        { requiredLevel: level }
      );
    }

    // 根据隔离级别验证
    switch (level) {
      case IsolationLevel.TENANT:
        if (!context.tenantId) {
          throw new IsolationContextMissingException(
            '租户级数据访问要求提供租户 ID',
            { requiredLevel: level }
          );
        }
        break;

      case IsolationLevel.ORGANIZATION:
        if (!context.tenantId || !context.organizationId) {
          throw new IsolationContextMissingException(
            '组织级数据访问要求提供租户 ID 和组织 ID',
            { requiredLevel: level }
          );
        }
        break;

      case IsolationLevel.DEPARTMENT:
        if (!context.tenantId || !context.departmentId) {
          throw new IsolationContextMissingException(
            '部门级数据访问要求提供租户 ID 和部门 ID',
            { requiredLevel: level }
          );
        }
        break;

      case IsolationLevel.USER:
        if (!context.userId) {
          throw new IsolationContextMissingException(
            '用户级数据访问要求提供用户 ID',
            { requiredLevel: level }
          );
        }
        break;
    }

    this.logger.debug('隔离上下文验证通过', {
      level,
      tenantId: context.tenantId?.getValue(),
      organizationId: context.organizationId?.getValue(),
      departmentId: context.departmentId?.getValue(),
      userId: context.userId?.getValue(),
    });
  }

  /**
   * 构建隔离过滤条件
   *
   * @description 根据当前隔离上下文构建查询过滤条件
   *
   * @param level - 隔离级别
   * @returns 过滤条件对象
   *
   * @example
   * ```typescript
   * const filter = this.isolationService.buildIsolationFilter(IsolationLevel.TENANT);
   * const users = await this.em.find(User, filter);
   * ```
   */
  buildIsolationFilter(level: IsolationLevel): Record<string, string> {
    this.validateContext(level);
    
    const context = this.getContext()!;
    const filter: Record<string, string> = {};

    // 租户级及以上都需要租户 ID
    if (context.tenantId) {
      filter.tenantId = context.tenantId.getValue();
    }

    // 组织级需要组织 ID
    if (level === IsolationLevel.ORGANIZATION && context.organizationId) {
      filter.organizationId = context.organizationId.getValue();
    }

    // 部门级需要部门 ID
    if (level === IsolationLevel.DEPARTMENT && context.departmentId) {
      filter.departmentId = context.departmentId.getValue();
    }

    // 用户级需要用户 ID
    if (level === IsolationLevel.USER && context.userId) {
      filter.userId = context.userId.getValue();
    }

    return filter;
  }
}

