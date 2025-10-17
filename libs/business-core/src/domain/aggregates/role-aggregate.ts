/**
 * 角色聚合根
 *
 * @description 管理角色生命周期，协调角色相关的业务操作
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { IsolationAwareAggregateRoot } from "./base/isolation-aware-aggregate-root.js";
import { Role } from "../entities/role/role.entity.js";
import { Permission } from "../entities/permission/permission.entity.js";
import { RoleType } from "../value-objects/types/role-type.vo.js";
import { PermissionType } from "../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../value-objects/types/permission-action.vo.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../entities/base/audit-info.js";
import { ExceptionFactory } from "../exceptions/exception-factory.js";
import { BusinessRuleViolationException } from "../exceptions/base/base-domain-exception.js";
import { ErrorCodes } from "../constants/index.js";
/**
 * 角色聚合根
 *
 * @description 管理角色生命周期，协调角色相关的业务操作
 *
 * ## 业务规则
 *
 * ### 角色管理规则
 * - 角色名称在同一租户内必须唯一
 * - 系统角色不能删除，只能禁用
 * - 角色删除前必须检查是否有用户使用
 * - 角色权限变更会影响所有使用该角色的用户
 *
 * ### 权限分配规则
 * - 角色必须至少有一个权限
 * - 权限不能重复分配
 * - 管理权限包含所有其他权限
 * - 权限分配需要相应的权限
 *
 * ### 角色层级规则
 * - 角色可以有父角色，形成层级结构
 * - 子角色继承父角色的所有权限
 * - 子角色可以添加额外的权限
 * - 角色层级不能形成循环
 *
 * @example
 * ```typescript
 * // 创建角色聚合根
 * const roleAggregate = new RoleAggregate(
 *   EntityId.generate(),
 *   TenantId.generate(),
 *   role,
 *   { createdBy: "system" }
 * );
 *
 * // 分配权限
 * roleAggregate.assignPermission(permission);
 *
 * // 创建子角色
 * roleAggregate.createChildRole(childRole);
 * ```
 *
 * @since 1.0.0
 */
export class RoleAggregate extends IsolationAwareAggregateRoot {
  private role: Role;
  private permissions: Permission[] = [];
  private childRoles: Role[] = [];
  private _exceptionFactory: ExceptionFactory;

  constructor(
    id: EntityId,
    role: Role,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._exceptionFactory = ExceptionFactory.getInstance();
    this.role = role;
  }

  /**
   * 获取角色
   *
   * @returns 角色
   */
  getRole(): Role {
    return this.role;
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
   * 获取子角色列表
   *
   * @returns 子角色列表
   */
  getChildRoles(): Role[] {
    return [...this.childRoles];
  }

  /**
   * 更新角色信息
   *
   * @param name - 角色名称
   * @param description - 角色描述
   */
  updateRoleInfo(name: string, description?: string): void {
    this.validateRoleUpdate();
    this.role.updateName(name);
    if (description !== undefined) {
      this.role.updateDescription(description);
    }
    this.publishIsolationEvent(
      (id, version, context) =>
        ({
          type: "RoleInfoUpdated",
          aggregateId: id.toString(),
          version,
          isolationContext: context,
          roleId: this.role.id.toString(),
          name: this.role.name,
          description: this.role.description,
        }) as any,
    );
  }

  /**
   * 更新角色类型
   *
   * @param type - 角色类型
   */
  updateRoleType(type: RoleType): void {
    this.validateRoleTypeChange(this.role.type, type);
    this.role.updateType(type);
    this.publishIsolationEvent(
      (id, version, context) =>
        ({
          type: "RoleTypeUpdated",
          aggregateId: id.toString(),
          version,
          isolationContext: context,
          roleId: this.role.id.toString(),
          roleType: type.value,
        }) as any,
    );
  }

  /**
   * 分配权限
   *
   * @param permission - 权限
   */
  assignPermission(permission: Permission): void {
    this.validatePermissionAssignment(permission);
    if (!this.permissions.some((p) => p.id.equals(permission.id))) {
      this.permissions.push(permission);
      this.publishIsolationEvent(
        (id, version, context) =>
          ({
            type: "PermissionAssigned",
            aggregateId: id.toString(),
            version,
            isolationContext: context,
            roleId: this.role.id.toString(),
            permissionId: permission.id.toString(),
            permissionName: permission.name,
          }) as any,
      );
    }
  }

  /**
   * 移除权限
   *
   * @param permissionId - 权限ID
   */
  removePermission(permissionId: EntityId): void {
    this.validatePermissionRemoval(permissionId);
    const index = this.permissions.findIndex((p) => p.id.equals(permissionId));
    if (index !== -1) {
      const permission = this.permissions[index];
      this.permissions.splice(index, 1);
      this.publishIsolationEvent(
        (id, version, context) =>
          ({
            type: "PermissionRemoved",
            aggregateId: id.toString(),
            version,
            isolationContext: context,
            roleId: this.role.id.toString(),
            permissionId: permissionId.toString(),
            permissionName: permission.name,
          }) as any,
      );
    }
  }

  /**
   * 批量分配权限
   *
   * @param permissions - 权限列表
   */
  assignPermissions(permissions: Permission[]): void {
    this.validatePermissionsAssignment(permissions);
    for (const permission of permissions) {
      if (!this.permissions.some((p) => p.id.equals(permission.id))) {
        this.permissions.push(permission);
      }
    }
    this.publishIsolationEvent(
      (id, version, context) =>
        ({
          type: "PermissionsAssigned",
          aggregateId: id.toString(),
          version,
          isolationContext: context,
          roleId: this.role.id.toString(),
          permissionIds: permissions.map((p) => p.id.toString()),
        }) as any,
    );
  }

  /**
   * 清空权限
   */
  clearPermissions(): void {
    this.validatePermissionsClear();
    this.permissions = [];
    this.publishIsolationEvent(
      (id, version, context) =>
        ({
          type: "PermissionsCleared",
          aggregateId: id.toString(),
          version,
          isolationContext: context,
          roleId: this.role.id.toString(),
        }) as any,
    );
  }

  /**
   * 创建子角色
   *
   * @param childRole - 子角色
   */
  createChildRole(childRole: Role): void {
    this.validateChildRoleCreation(childRole);
    this.childRoles.push(childRole);
    this.publishIsolationEvent(
      (id, version, context) =>
        ({
          type: "ChildRoleCreated",
          aggregateId: id.toString(),
          version,
          isolationContext: context,
          roleId: this.role.id.toString(),
          childRoleId: childRole.id.toString(),
          childRoleName: childRole.name,
        }) as any,
    );
  }

  /**
   * 移除子角色
   *
   * @param childRoleId - 子角色ID
   */
  removeChildRole(childRoleId: EntityId): void {
    this.validateChildRoleRemoval(childRoleId);
    const index = this.childRoles.findIndex((r) => r.id.equals(childRoleId));
    if (index !== -1) {
      const childRole = this.childRoles[index];
      this.childRoles.splice(index, 1);
      this.publishIsolationEvent(
        (id, version, context) =>
          ({
            type: "ChildRoleRemoved",
            aggregateId: id.toString(),
            version,
            isolationContext: context,
            roleId: this.role.id.toString(),
            childRoleId: childRoleId.toString(),
            childRoleName: childRole.name,
          }) as any,
      );
    }
  }

  /**
   * 激活角色
   */
  activateRole(): void {
    this.role.activate();
    this.publishIsolationEvent(
      (id, version, context) =>
        ({
          type: "RoleActivated",
          aggregateId: id.toString(),
          version,
          isolationContext: context,
          roleId: this.role.id.toString(),
          roleName: this.role.name,
        }) as any,
    );
  }

  /**
   * 停用角色
   */
  deactivateRole(): void {
    this.validateRoleDeactivation();
    this.role.deactivate();
    this.publishIsolationEvent(
      (id, version, context) =>
        ({
          type: "RoleDeactivated",
          aggregateId: id.toString(),
          version,
          isolationContext: context,
          roleId: this.role.id.toString(),
          roleName: this.role.name,
        }) as any,
    );
  }

  /**
   * 更新角色优先级
   *
   * @param priority - 新的优先级
   */
  updateRolePriority(priority: number): void {
    this.role.updatePriority(priority);
    this.publishIsolationEvent(
      (id, version, context) =>
        ({
          type: "RolePriorityUpdated",
          aggregateId: id.toString(),
          version,
          isolationContext: context,
          roleId: this.role.id.toString(),
          priority,
        }) as any,
    );
  }

  /**
   * 检查是否有指定权限
   *
   * @param permissionId - 权限ID
   * @returns 是否有权限
   */
  hasPermission(permissionId: EntityId): boolean {
    return this.permissions.some((p) => p.id.equals(permissionId));
  }

  /**
   * 检查是否可以执行指定动作
   *
   * @param action - 权限动作
   * @param resource - 资源标识
   * @returns 是否可以执行
   */
  canExecute(action: PermissionAction, resource: string): boolean {
    return this.permissions.some(
      (p) => p.canExecute(action) && p.canAccess(resource),
    );
  }

  /**
   * 检查是否可以管理
   *
   * @returns 是否可以管理
   */
  canManage(): boolean {
    return this.permissions.some((p) => p.canManage());
  }

  /**
   * 获取所有权限描述
   *
   * @returns 权限描述列表
   */
  getPermissionDescriptions(): string[] {
    return this.permissions.map((p) => p.getPermissionDescription());
  }

  /**
   * 获取角色层级深度
   *
   * @returns 层级深度
   */
  getRoleHierarchyDepth(): number {
    return this.childRoles.length;
  }

  /**
   * 验证角色更新
   *
   * @private
   */
  private validateRoleUpdate(): void {
    if (!this.role.isEditable) {
      throw this._exceptionFactory.createDomainState(
        "角色不可编辑",
        "system",
        "updateRole",
        { roleId: this.role.id.toString(), isEditable: this.role.isEditable },
      );
    }
  }

  /**
   * 验证角色类型变更
   *
   * @param oldType - 旧角色类型
   * @param newType - 新角色类型
   * @private
   */
  private validateRoleTypeChange(oldType: RoleType, newType: RoleType): void {
    if (!newType) {
      throw new BusinessRuleViolationException(
        "角色类型不能为空",
        ErrorCodes.VALIDATION_FAILED,
      );
    }
    if (
      this.role.isSystemRole &&
      oldType.isSystemRole() &&
      !newType.isSystemRole()
    ) {
      throw this._exceptionFactory.createDomainState(
        "系统角色不能变更为非系统角色",
        "system",
        "changeRoleType",
        {
          roleId: this.role.id.toString(),
          oldType: oldType.value,
          newType: newType.value,
        },
      );
    }
  }

  /**
   * 验证权限分配
   *
   * @param permission - 权限
   * @private
   */
  private validatePermissionAssignment(permission: Permission): void {
    if (!permission) {
      throw this._exceptionFactory.createDomainValidation(
        "权限不能为空",
        "permission",
        permission,
      );
    }
    if (!permission.isActive) {
      throw this._exceptionFactory.createDomainState(
        "权限未激活，无法分配",
        "inactive",
        "assignPermission",
        {
          permissionId: permission.id.toString(),
          isActive: permission.isActive,
        },
      );
    }
  }

  /**
   * 验证权限移除
   *
   * @param permissionId - 权限ID
   * @private
   */
  private validatePermissionRemoval(permissionId: EntityId): void {
    if (!permissionId) {
      throw this._exceptionFactory.createDomainValidation(
        "权限ID不能为空",
        "permissionId",
        permissionId,
      );
    }
  }

  /**
   * 验证权限列表分配
   *
   * @param permissions - 权限列表
   * @private
   */
  private validatePermissionsAssignment(permissions: Permission[]): void {
    if (!permissions || permissions.length === 0) {
      throw this._exceptionFactory.createDomainValidation(
        "权限列表不能为空",
        "permissions",
        permissions,
      );
    }
    for (const permission of permissions) {
      this.validatePermissionAssignment(permission);
    }
  }

  /**
   * 验证权限清空
   *
   * @private
   */
  private validatePermissionsClear(): void {
    if (this.role.isSystemRole) {
      throw this._exceptionFactory.createDomainState(
        "系统角色不能清空权限",
        "system",
        "clearPermissions",
        {
          roleId: this.role.id.toString(),
          isSystemRole: this.role.isSystemRole,
        },
      );
    }
  }

  /**
   * 验证子角色创建
   *
   * @param childRole - 子角色
   * @private
   */
  private validateChildRoleCreation(childRole: Role): void {
    if (!childRole) {
      throw this._exceptionFactory.createDomainValidation(
        "子角色不能为空",
        "childRole",
        childRole,
      );
    }
    if (childRole.id.equals(this.role.id)) {
      throw this._exceptionFactory.createDomainState(
        "角色不能设置自己为子角色",
        "active",
        "createChildRole",
        {
          roleId: this.role.id.toString(),
          childRoleId: childRole.id.toString(),
        },
      );
    }
    if (this.childRoles.some((r) => r.id.equals(childRole.id))) {
      throw this._exceptionFactory.createDomainState(
        "子角色已存在",
        "active",
        "createChildRole",
        {
          roleId: this.role.id.toString(),
          childRoleId: childRole.id.toString(),
        },
      );
    }
  }

  /**
   * 验证子角色移除
   *
   * @param childRoleId - 子角色ID
   * @private
   */
  private validateChildRoleRemoval(childRoleId: EntityId): void {
    if (!childRoleId) {
      throw this._exceptionFactory.createDomainValidation(
        "子角色ID不能为空",
        "childRoleId",
        childRoleId,
      );
    }
  }

  /**
   * 验证角色停用
   *
   * @private
   */
  private validateRoleDeactivation(): void {
    if (this.role.isSystemRole) {
      throw this._exceptionFactory.createDomainState(
        "系统角色不能停用",
        "system",
        "deactivate",
        {
          roleId: this.role.id.toString(),
          isSystemRole: this.role.isSystemRole,
        },
      );
    }
    if (this.childRoles.length > 0) {
      throw this._exceptionFactory.createDomainState(
        "有子角色的角色不能停用",
        "active",
        "deactivate",
        {
          roleId: this.role.id.toString(),
          childRolesCount: this.childRoles.length,
        },
      );
    }
  }
}
