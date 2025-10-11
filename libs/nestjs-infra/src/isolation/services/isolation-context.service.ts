/**
 * 隔离上下文服务
 *
 * @description 管理请求的隔离上下文（基于 nestjs-cls）
 *
 * @since 0.2.0
 */

import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { IsolationContext } from '../../shared/entities/isolation-context.entity.js';
import { IsolationLevel } from '../../shared/enums/isolation-level.enum.js';
import { TenantId } from '../../shared/value-objects/tenant-id.vo.js';
import { OrganizationId } from '../../shared/value-objects/organization-id.vo.js';
import { DepartmentId } from '../../shared/value-objects/department-id.vo.js';
import { UserId } from '../../shared/value-objects/user-id.vo.js';

/**
 * 隔离上下文存储键
 */
const ISOLATION_CONTEXT_KEY = 'ISOLATION_CONTEXT';

/**
 * 隔离上下文服务
 */
@Injectable()
export class IsolationContextService {
  constructor(private readonly cls: ClsService) {}

  /**
   * 设置隔离上下文
   *
   * @param context - 隔离上下文
   */
  setIsolationContext(context: IsolationContext): void {
    this.cls.set(ISOLATION_CONTEXT_KEY, context);
  }

  /**
   * 获取隔离上下文
   *
   * @returns 隔离上下文，不存在返回 undefined
   */
  getIsolationContext(): IsolationContext | undefined {
    return this.cls.get(ISOLATION_CONTEXT_KEY);
  }

  /**
   * 获取租户 ID
   *
   * @returns 租户 ID
   */
  getTenantId(): TenantId | undefined {
    return this.getIsolationContext()?.tenantId;
  }

  /**
   * 获取组织 ID
   *
   * @returns 组织 ID
   */
  getOrganizationId(): OrganizationId | undefined {
    return this.getIsolationContext()?.organizationId;
  }

  /**
   * 获取部门 ID
   *
   * @returns 部门 ID
   */
  getDepartmentId(): DepartmentId | undefined {
    return this.getIsolationContext()?.departmentId;
  }

  /**
   * 获取用户 ID
   *
   * @returns 用户 ID
   */
  getUserId(): UserId | undefined {
    return this.getIsolationContext()?.userId;
  }

  /**
   * 获取隔离级别
   *
   * @returns 隔离级别
   */
  getIsolationLevel(): IsolationLevel {
    const context = this.getIsolationContext();
    return context ? context.getIsolationLevel() : IsolationLevel.PLATFORM;
  }

  /**
   * 判断是否为平台级
   *
   * @returns 如果是平台级返回 true
   */
  isPlatformLevel(): boolean {
    const context = this.getIsolationContext();
    return !context || context.isEmpty();
  }
}

