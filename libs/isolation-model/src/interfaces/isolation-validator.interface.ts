/**
 * 隔离验证器接口
 * 
 * @description 定义数据访问权限验证的标准接口
 * 
 * @since 1.0.0
 */

import type { IsolationLevel } from '../enums/isolation-level.enum.js';
import type { IsolationContext } from '../entities/isolation-context.entity.js';
import type { SharingLevel } from '../enums/sharing-level.enum.js';

export interface IIsolationValidator {
  /**
   * 验证隔离级别
   * 
   * @param requiredLevel - 要求的最低隔离级别
   * @returns 如果当前级别满足要求返回 true
   */
  validateIsolationLevel(requiredLevel: IsolationLevel): boolean;
  
  /**
   * 检查数据访问权限
   * 
   * @param dataContext - 数据的隔离上下文
   * @param isShared - 数据是否共享
   * @param sharingLevel - 共享级别（如果是共享数据）
   * @returns 如果有权限返回 true
   */
  checkDataAccess(
    dataContext: IsolationContext,
    isShared: boolean,
    sharingLevel?: SharingLevel,
  ): boolean;
}

