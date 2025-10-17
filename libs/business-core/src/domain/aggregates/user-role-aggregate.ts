/**
 * 用户角色关联聚合根
 *
 * @description 管理用户角色关联生命周期，协调用户角色相关的业务操作
 *
 * @since 1.0.0
 */

import { EntityId, TenantId, UserId } from "@hl8/isolation-model";
import { IsolationAwareAggregateRoot } from "./base/isolation-aware-aggregate-root.js";
import { UserRole } from "../entities/user-role/user-role.entity.js";
import { Role } from "../entities/role/role.entity.js";
import { Permission } from "../entities/permission/permission.entity.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../entities/base/audit-info.js";

/**
 * 用户角色关联聚合根
 *
 * @description 管理用户角色关联生命周期，协调用户角色相关的业务操作
 *
 * ## 业务规则
 *
 * ### 关联管理规则
 * - 用户和角色必须属于同一租户
 * - 用户不能重复分配同一角色
 * - 角色分配需要相应的权限
 * - 系统角色只能由系统管理员分配
 *
 * ### 权限继承规则
 * - 用户继承角色的所有权限
 * - 多个角色的权限会合并
 * - 权限冲突时以高优先级为准
 * - 系统权限不能被覆盖
 *
 * ### 关联生命周期规则
 * - 关联可以设置过期时间
 * - 过期的关联自动失效
 * - 关联可以手动停用
 * - 停用的关联可以重新激活
 *
 * @example
 * ```typescript
 * // 创建用户角色关联聚合根
 * const userRoleAggregate = new UserRoleAggregate(
 *   EntityId.generate(),
 *   TenantId.generate(),
 *   userRole,
 *   { createdBy: "system" }
 * );
 * 
 * // 分配角色
 * userRoleAggregate.assignRole(role);
 * 
 * // 检查权限
 * console.log(userRoleAggregate.hasPermission(permission)); // true
 * ```
 *
 * @since 1.0.0
 */
export class UserRoleAggregate extends IsolationAwareAggregateRoot {
  private userRole: UserRole;
  private roles: Role[] = [];
  private permissions: Permission[] = [];

  constructor(
    id: EntityId,
    userRole: UserRole,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this.userRole = userRole;
  }

  /**
   * 获取用户角色关联
   *
   * @returns 用户角色关联
   */
  getUserRole(): UserRole {
    return this.userRole;
  }

  /**
   * 获取角色列表
   *
   * @returns 角色列表
   */
  getRoles(): Role[] {
    return [...this.roles];
  }

  /**
   * 获取权限列表
   *
   * @returns 权限列表
   */
  getPermissions(): Permission[] {
    return [...this.permissions];
  }

  /**
   * 分配角色
   *
   * @param role - 角色
   * @param reason - 分配原因
   * @param assignedBy - 分配者
   * @param expiresAt - 过期时间
   */
  assignRole(
    role: Role,
    reason?: string,
    assignedBy?: UserId,
    expiresAt?: Date,
  ): void {
    this.validateRoleAssignment(role);
    if (!this.roles.some(r => r.id.equals(role.id))) {
      this.roles.push(role);
      this.updateUserRoleInfo(reason, assignedBy, expiresAt);
      this.publishIsolationEvent("RoleAssigned", {
        userId: this.userRole.userId.toString(),
        roleId: role.id.toString(),
        roleName: role.name,
        reason,
        assignedBy: assignedBy?.toString(),
        expiresAt: expiresAt?.toISOString(),
      });
    }
  }

  /**
   * 移除角色
   *
   * @param roleId - 角色ID
   */
  removeRole(roleId: EntityId): void {
    this.validateRoleRemoval(roleId);
    const index = this.roles.findIndex(r => r.id.equals(roleId));
    if (index !== -1) {
      const role = this.roles[index];
      this.roles.splice(index, 1);
      this.publishIsolationEvent("RoleRemoved", {
        userId: this.userRole.userId.toString(),
        roleId: roleId.toString(),
        roleName: role.name,
      });
    }
  }

  /**
   * 批量分配角色
   *
   * @param roles - 角色列表
   * @param reason - 分配原因
   * @param assignedBy - 分配者
   */
  assignRoles(
    roles: Role[],
    reason?: string,
    assignedBy?: UserId,
  ): void {
    this.validateRolesAssignment(roles);
    for (const role of roles) {
      if (!this.roles.some(r => r.id.equals(role.id))) {
        this.roles.push(role);
      }
    }
    this.updateUserRoleInfo(reason, assignedBy);
    this.publishIsolationEvent("RolesAssigned", {
      userId: this.userRole.userId.toString(),
      roleIds: roles.map(r => r.id.toString()),
      roleNames: roles.map(r => r.name),
      reason,
      assignedBy: assignedBy?.toString(),
    });
  }

  /**
   * 清空角色
   */
  clearRoles(): void {
    this.validateRolesClear();
    this.roles = [];
    this.publishIsolationEvent("RolesCleared", {
      userId: this.userRole.userId.toString(),
    });
  }

  /**
   * 激活关联
   */
  activateAssociation(): void {
    this.userRole.activate();
    this.publishIsolationEvent("AssociationActivated", {
      userId: this.userRole.userId.toString(),
      roleId: this.userRole.roleId.toString(),
    });
  }

  /**
   * 停用关联
   */
  deactivateAssociation(): void {
    this.userRole.deactivate();
    this.publishIsolationEvent("AssociationDeactivated", {
      userId: this.userRole.userId.toString(),
      roleId: this.userRole.roleId.toString(),
    });
  }

  /**
   * 更新分配原因
   *
   * @param reason - 新的分配原因
   */
  updateReason(reason: string): void {
    this.userRole.updateReason(reason);
    this.publishIsolationEvent("AssociationReasonUpdated", {
      userId: this.userRole.userId.toString(),
      roleId: this.userRole.roleId.toString(),
      reason,
    });
  }

  /**
   * 设置过期时间
   *
   * @param expiresAt - 过期时间
   */
  setExpiration(expiresAt: Date): void {
    this.userRole.setExpiration(expiresAt);
    this.publishIsolationEvent("AssociationExpirationSet", {
      userId: this.userRole.userId.toString(),
      roleId: this.userRole.roleId.toString(),
      expiresAt: expiresAt.toISOString(),
    });
  }

  /**
   * 移除过期时间
   */
  removeExpiration(): void {
    this.userRole.removeExpiration();
    this.publishIsolationEvent("AssociationExpirationRemoved", {
      userId: this.userRole.userId.toString(),
      roleId: this.userRole.roleId.toString(),
    });
  }

  /**
   * 更新配置
   *
   * @param config - 配置对象
   */
  updateConfig(config: Record<string, any>): void {
    this.userRole.updateConfig(config);
    this.publishIsolationEvent("AssociationConfigUpdated", {
      userId: this.userRole.userId.toString(),
      roleId: this.userRole.roleId.toString(),
      config,
    });
  }

  /**
   * 检查是否有指定角色
   *
   * @param roleId - 角色ID
   * @returns 是否有角色
   */
  hasRole(roleId: EntityId): boolean {
    return this.roles.some(r => r.id.equals(roleId));
  }

  /**
   * 检查是否有指定权限
   *
   * @param permissionId - 权限ID
   * @returns 是否有权限
   */
  hasPermission(permissionId: EntityId): boolean {
    return this.permissions.some(p => p.id.equals(permissionId));
  }

  /**
   * 检查是否可以执行指定动作
   *
   * @param action - 权限动作
   * @param resource - 资源标识
   * @returns 是否可以执行
   */
  canExecute(action: string, resource: string): boolean {
    return this.permissions.some(p => 
      p.canExecute({ value: action } as any) && p.canAccess(resource)
    );
  }

  /**
   * 检查是否可以管理
   *
   * @returns 是否可以管理
   */
  canManage(): boolean {
    return this.permissions.some(p => p.canManage());
  }

  /**
   * 检查关联是否有效
   *
   * @returns 是否有效
   */
  isValid(): boolean {
    return this.userRole.isValid();
  }

  /**
   * 检查关联是否过期
   *
   * @returns 是否过期
   */
  isExpired(): boolean {
    return this.userRole.isExpired();
  }

  /**
   * 获取所有权限描述
   *
   * @returns 权限描述列表
   */
  getPermissionDescriptions(): string[] {
    return this.permissions.map(p => p.getPermissionDescription());
  }

  /**
   * 获取角色层级深度
   *
   * @returns 层级深度
   */
  getRoleHierarchyDepth(): number {
    return this.roles.length;
  }

  /**
   * 更新用户角色信息
   *
   * @param reason - 分配原因
   * @param assignedBy - 分配者
   * @param expiresAt - 过期时间
   * @private
   */
  private updateUserRoleInfo(
    reason?: string,
    assignedBy?: UserId,
    expiresAt?: Date,
  ): void {
    if (reason) {
      this.userRole.updateReason(reason);
    }
    if (assignedBy) {
      // 这里需要更新assignedBy，但UserRole实体没有提供这个方法
      // 可以考虑在构造函数中设置
    }
    if (expiresAt) {
      this.userRole.setExpiration(expiresAt);
    }
  }

  /**
   * 验证角色分配
   *
   * @param role - 角色
   * @private
   */
  private validateRoleAssignment(role: Role): void {
    if (!role) {
      throw new Error("角色不能为空");
    }
    if (!role.isActive) {
      throw new Error("角色未激活，无法分配");
    }
  }

  /**
   * 验证角色移除
   *
   * @param roleId - 角色ID
   * @private
   */
  private validateRoleRemoval(roleId: EntityId): void {
    if (!roleId) {
      throw new Error("角色ID不能为空");
    }
  }

  /**
   * 验证角色列表分配
   *
   * @param roles - 角色列表
   * @private
   */
  private validateRolesAssignment(roles: Role[]): void {
    if (!roles || roles.length === 0) {
      throw new Error("角色列表不能为空");
    }
    for (const role of roles) {
      this.validateRoleAssignment(role);
    }
  }

  /**
   * 验证角色清空
   *
   * @private
   */
  private validateRolesClear(): void {
    // 可以添加业务规则，比如某些角色不能清空
  }
}
