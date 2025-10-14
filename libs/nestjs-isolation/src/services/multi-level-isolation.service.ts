/**
 * 多层级隔离验证服务
 *
 * @description 实现数据访问权限验证逻辑
 *
 * ## 业务规则
 *
 * ### 权限验证规则
 * - 平台级上下文可访问所有数据
 * - 非共享数据必须完全匹配隔离上下文
 * - 共享数据检查共享级别
 *
 * @since 1.0.0
 */

import {
  IIsolationValidator,
  IsolationContext,
  IsolationLevel,
  SharingLevel,
} from '@hl8/isolation-model';
import { Injectable } from '@nestjs/common';
import { IsolationContextService } from './isolation-context.service.js';

@Injectable()
export class MultiLevelIsolationService implements IIsolationValidator {
  constructor(private readonly contextService: IsolationContextService) {}

  /**
   * 验证当前隔离级别是否满足要求
   *
   * @param requiredLevel - 所需级别
   * @returns true 如果满足要求
   */
  validateIsolationLevel(requiredLevel: IsolationLevel): boolean {
    const context = this.contextService.getIsolationContext();

    if (!context) {
      return false;
    }

    const currentLevel = context.getIsolationLevel();

    // 平台级可以访问所有级别
    if (currentLevel === IsolationLevel.PLATFORM) {
      return true;
    }

    // 检查是否满足所需级别
    const levelHierarchy = {
      [IsolationLevel.PLATFORM]: 0,
      [IsolationLevel.USER]: 1,
      [IsolationLevel.TENANT]: 2,
      [IsolationLevel.ORGANIZATION]: 3,
      [IsolationLevel.DEPARTMENT]: 4,
    };

    return (
      (levelHierarchy[currentLevel] ?? 0) >=
      (levelHierarchy[requiredLevel] ?? 0)
    );
  }

  /**
   * 检查当前用户对数据的访问权限
   *
   * @param dataContext - 数据的隔离上下文
   * @param isShared - 是否为共享数据
   * @param sharingLevel - 共享级别
   * @returns true 如果有权限访问
   */
  checkDataAccess(
    dataContext: IsolationContext,
    isShared: boolean,
    sharingLevel?: SharingLevel,
  ): boolean {
    const userContext = this.contextService.getIsolationContext();

    if (!userContext) {
      // 没有隔离上下文，拒绝访问
      return false;
    }

    // 委托给领域模型的业务逻辑
    return userContext.canAccess(dataContext, isShared, sharingLevel);
  }

  /**
   * 验证当前用户是否可以访问指定租户的数据
   *
   * @param tenantId - 租户 ID
   * @returns true 如果可以访问
   */
  canAccessTenant(tenantId: string): boolean {
    const currentTenantId = this.contextService.getTenantId();

    if (!currentTenantId) {
      // 平台级上下文可以访问所有租户
      const context = this.contextService.getIsolationContext();
      return context?.isEmpty() ?? false;
    }

    return currentTenantId.getValue() === tenantId;
  }

  /**
   * 验证当前用户是否可以访问指定组织的数据
   *
   * @param tenantId - 租户 ID
   * @param organizationId - 组织 ID
   * @returns true 如果可以访问
   */
  canAccessOrganization(tenantId: string, organizationId: string): boolean {
    const currentTenantId = this.contextService.getTenantId();
    const currentOrgId = this.contextService.getOrganizationId();

    // 检查租户匹配
    if (currentTenantId && currentTenantId.getValue() !== tenantId) {
      return false;
    }

    // 检查组织匹配
    if (currentOrgId && currentOrgId.getValue() !== organizationId) {
      return false;
    }

    return true;
  }
}
