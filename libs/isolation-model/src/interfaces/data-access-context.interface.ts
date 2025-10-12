/**
 * 数据访问上下文接口
 * 
 * @description 定义数据的隔离属性和共享策略
 * 
 * @since 1.0.0
 */

import type { IsolationContext } from '../entities/isolation-context.entity.js';
import type { SharingLevel } from '../enums/sharing-level.enum.js';

export interface DataAccessContext {
  /** 数据的隔离上下文 */
  isolationContext: IsolationContext;
  
  /** 是否共享数据 */
  isShared: boolean;
  
  /** 共享级别（如果是共享数据） */
  sharingLevel?: SharingLevel;
  
  /** 精确共享对象列表（可选） */
  sharedWith?: string[];
}

