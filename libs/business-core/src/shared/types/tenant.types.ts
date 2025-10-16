/**
 * 租户相关类型定义
 *
 * @description 定义租户上下文相关的类型，避免使用any类型
 * 提供类型安全的租户上下文接口
 *
 * @since 1.0.0
 */

import { EntityId } from "@hl8/isolation-model";

/**
 * 租户上下文信息
 */
export interface TenantContext {
  /** 租户ID */
  tenantId: EntityId;
  /** 用户ID */
  userId: string;
  /** 用户角色 */
  roles: string[];
  /** 用户权限 */
  permissions: string[];
  /** 租户名称 */
  tenantName?: string;
  /** 用户名 */
  userName?: string;
  /** 额外元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 租户上下文提供者接口
 */
export interface TenantContextProvider {
  /** 获取当前租户上下文 */
  getCurrentContext(): TenantContext | null;
  /** 设置租户上下文 */
  setContext(context: TenantContext): void;
  /** 清除租户上下文 */
  clearContext(): void;
}

/**
 * 租户上下文装饰器选项
 */
export interface TenantContextOptions {
  /** 是否必需 */
  required?: boolean;
  /** 默认租户ID */
  defaultTenantId?: EntityId;
  /** 错误处理策略 */
  errorStrategy?: "throw" | "return-null" | "use-default";
}
