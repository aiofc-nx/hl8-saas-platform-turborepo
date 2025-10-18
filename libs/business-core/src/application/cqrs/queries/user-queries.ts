/**
 * 用户查询
 *
 * @description 定义用户相关的查询，包括获取单个用户、获取用户列表等
 *
 * ## 业务规则
 *
 * ### 查询设计规则
 * - 查询表示用户的信息需求，不包含业务逻辑
 * - 查询应该是不可变的，创建后不能修改
 * - 查询应该包含执行查询所需的所有信息
 * - 查询应该支持序列化和反序列化
 *
 * ### 查询验证规则
 * - 查询创建时应该验证必要参数
 * - 查询参数应该符合业务规则
 * - 查询参数应该进行类型检查
 *
 * @example
 * ```typescript
 * // 获取用户查询
 * const getUserQuery = new GetUserQuery(userId, tenantId);
 *
 * // 获取用户列表查询
 * const getUserListQuery = new GetUserListQuery(tenantId, 1, 20);
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { BaseQuery } from "./base/base-query.js";

/**
 * 获取用户查询
 *
 * @description 获取单个用户信息的查询
 */
export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: EntityId,
    public readonly tenantId: TenantId,
    public readonly includeSensitiveInfo?: boolean,
  ) {
    super("GetUserQuery", "获取用户查询");
  }
}

/**
 * 获取用户列表查询
 *
 * @description 获取用户列表的查询
 */
export class GetUserListQuery extends BaseQuery {
  constructor(
    public readonly tenantId: TenantId,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly sortBy?:
      | "username"
      | "displayName"
      | "email"
      | "createdAt"
      | "updatedAt",
    public readonly sortOrder?: "asc" | "desc",
    public readonly filters?: {
      status?: string;
      role?: string;
      username?: string;
      email?: string;
    },
    public readonly includeDeleted?: boolean,
  ) {
    super("GetUserListQuery", "获取用户列表查询");
  }
}
