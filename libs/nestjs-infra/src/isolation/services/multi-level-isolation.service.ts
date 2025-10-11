/**
 * 多层级隔离服务
 *
 * @description 提供数据访问权限验证和共享控制
 *
 * @since 0.2.0
 */

import { Injectable } from '@nestjs/common';
import { IsolationContextService } from './isolation-context.service';
import { DataSharingLevel } from '../../shared/enums/data-sharing-level.enum';
import { IsolationLevel } from '../../shared/enums/isolation-level.enum';

/**
 * 数据访问上下文
 */
export interface DataAccessContext {
  /** 是否共享 */
  isShared: boolean;
  /** 共享级别 */
  sharingLevel?: DataSharingLevel;
  /** 共享给哪些实体 */
  sharedWith?: string[];
  /** 所有者 ID */
  ownerId?: string;
}

/**
 * 多层级隔离服务
 */
@Injectable()
export class MultiLevelIsolationService {
  constructor(private readonly contextService: IsolationContextService) {}

  /**
   * 验证隔离上下文
   *
   * @param requiredLevel - 要求的最低隔离级别
   * @returns 如果有效返回 true
   */
  validateIsolation(requiredLevel: IsolationLevel): boolean {
    const currentLevel = this.contextService.getIsolationLevel();
    
    // 检查当前级别是否满足要求
    const levelPriority = {
      [IsolationLevel.PLATFORM]: 5,
      [IsolationLevel.TENANT]: 4,
      [IsolationLevel.ORGANIZATION]: 3,
      [IsolationLevel.DEPARTMENT]: 2,
      [IsolationLevel.USER]: 1,
    };

    return levelPriority[currentLevel] >= levelPriority[requiredLevel];
  }

  /**
   * 检查数据访问权限
   *
   * @param dataContext - 数据访问上下文
   * @returns 如果有权限返回 true
   */
  checkAccess(dataContext: DataAccessContext): boolean {
    const context = this.contextService.getIsolationContext();

    // 平台级上下文可以访问所有数据
    if (!context || context.isEmpty()) {
      return true;
    }

    // 如果数据是共享的，检查共享级别
    if (dataContext.isShared) {
      return this.checkSharedAccess(dataContext);
    }

    // 非共享数据，检查所有权
    return this.checkOwnership(dataContext);
  }

  /**
   * 检查共享数据访问权限
   *
   * @param dataContext - 数据访问上下文
   * @returns 如果有权限返回 true
   * @private
   */
  private checkSharedAccess(dataContext: DataAccessContext): boolean {
    const context = this.contextService.getIsolationContext();
    if (!context) {
      return true;
    }

    const sharingLevel = dataContext.sharingLevel || DataSharingLevel.PRIVATE;

    switch (sharingLevel) {
      case DataSharingLevel.PLATFORM:
        return true; // 平台共享，所有人可见

      case DataSharingLevel.TENANT:
        // 检查是否在同一租户
        return context.tenantId?.value === dataContext.sharedWith?.[0];

      case DataSharingLevel.ORGANIZATION:
        // 检查是否在同一组织
        return context.organizationId?.value === dataContext.sharedWith?.[0];

      case DataSharingLevel.DEPARTMENT:
        // 检查是否在同一部门
        return context.departmentId?.value === dataContext.sharedWith?.[0];

      case DataSharingLevel.PRIVATE:
        return this.checkOwnership(dataContext);

      default:
        return false;
    }
  }

  /**
   * 检查所有权
   *
   * @param dataContext - 数据访问上下文
   * @returns 如果是所有者返回 true
   * @private
   */
  private checkOwnership(dataContext: DataAccessContext): boolean {
    const context = this.contextService.getIsolationContext();
    if (!context) {
      return true;
    }

    // 检查是否为所有者
    return context.userId?.value === dataContext.ownerId;
  }
}

