/**
 * 隔离上下文服务
 * 
 * @description 基于 nestjs-cls 实现的请求级隔离上下文管理服务
 * 
 * ## 业务规则
 * 
 * ### 上下文存储
 * - 使用 nestjs-cls 存储请求级别的隔离上下文
 * - 上下文在单次请求内全局可访问
 * - 请求结束后自动清理
 * 
 * ### 线程安全
 * - 基于 AsyncLocalStorage 实现，天然线程安全
 * - 在异步操作中保持上下文传递
 * 
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { 
  IsolationContext, 
  IIsolationContextProvider,
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
} from '@hl8/isolation-model';

const ISOLATION_CONTEXT_KEY = 'ISOLATION_CONTEXT';

@Injectable()
export class IsolationContextService implements IIsolationContextProvider {
  constructor(private readonly cls: ClsService) {}
  
  /**
   * 获取当前隔离上下文
   * 
   * @returns 隔离上下文或 undefined
   */
  getIsolationContext(): IsolationContext | undefined {
    return this.cls.get(ISOLATION_CONTEXT_KEY);
  }
  
  /**
   * 设置隔离上下文
   * 
   * @param context - 隔离上下文实例
   */
  setIsolationContext(context: IsolationContext): void {
    this.cls.set(ISOLATION_CONTEXT_KEY, context);
  }
  
  /**
   * 清除隔离上下文
   */
  clearIsolationContext(): void {
    this.cls.set(ISOLATION_CONTEXT_KEY, undefined);
  }
  
  /**
   * 获取租户 ID
   * 
   * @returns 租户 ID 或 undefined
   */
  getTenantId(): TenantId | undefined {
    return this.getIsolationContext()?.tenantId;
  }
  
  /**
   * 获取组织 ID
   * 
   * @returns 组织 ID 或 undefined
   */
  getOrganizationId(): OrganizationId | undefined {
    return this.getIsolationContext()?.organizationId;
  }
  
  /**
   * 获取部门 ID
   * 
   * @returns 部门 ID 或 undefined
   */
  getDepartmentId(): DepartmentId | undefined {
    return this.getIsolationContext()?.departmentId;
  }
  
  /**
   * 获取用户 ID
   * 
   * @returns 用户 ID 或 undefined
   */
  getUserId(): UserId | undefined {
    return this.getIsolationContext()?.userId;
  }
  
  /**
   * 检查是否为租户级或更高层级
   * 
   * @returns true 如果有租户上下文
   */
  hasTenant(): boolean {
    return !!this.getTenantId();
  }
  
  /**
   * 检查是否为组织级或更高层级
   * 
   * @returns true 如果有组织上下文
   */
  hasOrganization(): boolean {
    return !!this.getOrganizationId();
  }
  
  /**
   * 检查是否为部门级
   * 
   * @returns true 如果有部门上下文
   */
  hasDepartment(): boolean {
    return !!this.getDepartmentId();
  }
}

