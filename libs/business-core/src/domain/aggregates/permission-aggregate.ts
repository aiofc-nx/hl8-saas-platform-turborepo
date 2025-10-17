/**
 * 权限聚合根
 *
 * @description 管理权限生命周期，协调权限相关的业务操作
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { IsolationAwareAggregateRoot } from "./base/isolation-aware-aggregate-root.js";
import { Permission } from "../entities/permission/permission.entity.js";
import { PermissionType } from "../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../value-objects/types/permission-action.vo.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../entities/base/audit-info.js";
import { ExceptionFactory } from "../exceptions/exception-factory.js";
import { PermissionStateException, InvalidPermissionTypeException, InvalidPermissionActionException } from "../exceptions/business-exceptions.js";

/**
 * 权限聚合根
 *
 * @description 管理权限生命周期，协调权限相关的业务操作
 *
 * ## 业务规则
 *
 * ### 权限管理规则
 * - 权限名称在同一租户内必须唯一
 * - 系统权限不能删除，只能禁用
 * - 权限删除前必须检查是否有角色使用
 * - 权限变更会影响所有使用该权限的角色
 *
 * ### 权限资源规则
 * - 权限必须指定资源标识
 * - 资源标识不能为空
 * - 权限条件用于动态权限控制
 * - 权限配置用于扩展权限功能
 *
 * ### 权限层级规则
 * - 权限可以有父权限，形成层级结构
 * - 子权限继承父权限的所有条件
 * - 子权限可以添加额外的条件
 * - 权限层级不能形成循环
 *
 * @example
 * ```typescript
 * // 创建权限聚合根
 * const permissionAggregate = new PermissionAggregate(
 *   EntityId.generate(),
 *   TenantId.generate(),
 *   permission,
 *   { createdBy: "system" }
 * );
 * 
 * // 添加条件
 * permissionAggregate.addCondition("department", "IT");
 * 
 * // 创建子权限
 * permissionAggregate.createChildPermission(childPermission);
 * ```
 *
 * @since 1.0.0
 */
export class PermissionAggregate extends IsolationAwareAggregateRoot {
  private permission: Permission;
  private childPermissions: Permission[] = [];
  private _exceptionFactory: ExceptionFactory;

  constructor(
    id: EntityId,
    permission: Permission,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._exceptionFactory = ExceptionFactory.getInstance();
    this.permission = permission;
  }

  /**
   * 获取权限
   *
   * @returns 权限
   */
  getPermission(): Permission {
    return this.permission;
  }

  /**
   * 获取子权限列表
   *
   * @returns 子权限列表
   */
  getChildPermissions(): Permission[] {
    return [...this.childPermissions];
  }

  /**
   * 更新权限信息
   *
   * @param name - 权限名称
   * @param description - 权限描述
   */
  updatePermissionInfo(name: string, description?: string): void {
    this.validatePermissionUpdate();
    this.permission.updateName(name);
    if (description !== undefined) {
      this.permission.updateDescription(description);
    }
    this.publishIsolationEvent("PermissionInfoUpdated", {
      permissionId: this.permission.id.toString(),
      name: this.permission.name,
      description: this.permission.description,
    });
  }

  /**
   * 更新权限类型
   *
   * @param type - 权限类型
   */
  updatePermissionType(type: PermissionType): void {
    this.validatePermissionTypeChange(this.permission.type, type);
    this.permission.updateType(type);
    this.publishIsolationEvent("PermissionTypeUpdated", {
      permissionId: this.permission.id.toString(),
      type: type.value,
    });
  }

  /**
   * 更新权限动作
   *
   * @param action - 权限动作
   */
  updatePermissionAction(action: PermissionAction): void {
    this.validatePermissionActionChange(this.permission.action, action);
    this.permission.updateAction(action);
    this.publishIsolationEvent("PermissionActionUpdated", {
      permissionId: this.permission.id.toString(),
      action: action.value,
    });
  }

  /**
   * 更新资源标识
   *
   * @param resource - 资源标识
   */
  updateResource(resource: string): void {
    this.permission.updateResource(resource);
    this.publishIsolationEvent("PermissionResourceUpdated", {
      permissionId: this.permission.id.toString(),
      resource,
    });
  }

  /**
   * 设置资源ID
   *
   * @param resourceId - 资源ID
   */
  setResourceId(resourceId: EntityId): void {
    this.permission.setResourceId(resourceId);
    this.publishIsolationEvent("PermissionResourceIdSet", {
      permissionId: this.permission.id.toString(),
      resourceId: resourceId.toString(),
    });
  }

  /**
   * 移除资源ID
   */
  removeResourceId(): void {
    this.permission.removeResourceId();
    this.publishIsolationEvent("PermissionResourceIdRemoved", {
      permissionId: this.permission.id.toString(),
    });
  }

  /**
   * 激活权限
   */
  activatePermission(): void {
    this.permission.activate();
    this.publishIsolationEvent("PermissionActivated", {
      permissionId: this.permission.id.toString(),
      permissionName: this.permission.name,
    });
  }

  /**
   * 停用权限
   */
  deactivatePermission(): void {
    this.validatePermissionDeactivation();
    this.permission.deactivate();
    this.publishIsolationEvent("PermissionDeactivated", {
      permissionId: this.permission.id.toString(),
      permissionName: this.permission.name,
    });
  }

  /**
   * 更新权限优先级
   *
   * @param priority - 新的优先级
   */
  updatePermissionPriority(priority: number): void {
    this.permission.updatePriority(priority);
    this.publishIsolationEvent("PermissionPriorityUpdated", {
      permissionId: this.permission.id.toString(),
      priority,
    });
  }

  /**
   * 设置父权限
   *
   * @param parentPermissionId - 父权限ID
   */
  setParentPermission(parentPermissionId: EntityId): void {
    this.validateParentPermission(parentPermissionId);
    this.permission.setParentPermission(parentPermissionId);
    this.publishIsolationEvent("ParentPermissionSet", {
      permissionId: this.permission.id.toString(),
      parentPermissionId: parentPermissionId.toString(),
    });
  }

  /**
   * 移除父权限
   */
  removeParentPermission(): void {
    this.permission.removeParentPermission();
    this.publishIsolationEvent("ParentPermissionRemoved", {
      permissionId: this.permission.id.toString(),
    });
  }

  /**
   * 添加条件
   *
   * @param key - 条件键
   * @param value - 条件值
   */
  addCondition(key: string, value: any): void {
    this.permission.addCondition(key, value);
    this.publishIsolationEvent("PermissionConditionAdded", {
      permissionId: this.permission.id.toString(),
      key,
      value,
    });
  }

  /**
   * 移除条件
   *
   * @param key - 条件键
   */
  removeCondition(key: string): void {
    this.permission.removeCondition(key);
    this.publishIsolationEvent("PermissionConditionRemoved", {
      permissionId: this.permission.id.toString(),
      key,
    });
  }

  /**
   * 创建子权限
   *
   * @param childPermission - 子权限
   */
  createChildPermission(childPermission: Permission): void {
    this.validateChildPermissionCreation(childPermission);
    this.childPermissions.push(childPermission);
    this.publishIsolationEvent("ChildPermissionCreated", {
      permissionId: this.permission.id.toString(),
      childPermissionId: childPermission.id.toString(),
      childPermissionName: childPermission.name,
    });
  }

  /**
   * 移除子权限
   *
   * @param childPermissionId - 子权限ID
   */
  removeChildPermission(childPermissionId: EntityId): void {
    this.validateChildPermissionRemoval(childPermissionId);
    const index = this.childPermissions.findIndex(p => p.id.equals(childPermissionId));
    if (index !== -1) {
      const childPermission = this.childPermissions[index];
      this.childPermissions.splice(index, 1);
      this.publishIsolationEvent("ChildPermissionRemoved", {
        permissionId: this.permission.id.toString(),
        childPermissionId: childPermissionId.toString(),
        childPermissionName: childPermission.name,
      });
    }
  }

  /**
   * 检查是否可以访问指定资源
   *
   * @param resource - 资源标识
   * @returns 是否可以访问
   */
  canAccess(resource: string): boolean {
    return this.permission.canAccess(resource);
  }

  /**
   * 检查是否可以执行指定动作
   *
   * @param action - 权限动作
   * @returns 是否可以执行
   */
  canExecute(action: PermissionAction): boolean {
    return this.permission.canExecute(action);
  }

  /**
   * 检查权限条件是否匹配
   *
   * @param context - 上下文条件
   * @returns 是否匹配
   */
  matchesConditions(context: Record<string, any>): boolean {
    return this.permission.matchesConditions(context);
  }

  /**
   * 检查权限是否高于指定权限
   *
   * @param otherPermission - 其他权限
   * @returns 是否高于指定权限
   */
  hasHigherPriorityThan(otherPermission: Permission): boolean {
    return this.permission.hasHigherPriorityThan(otherPermission);
  }

  /**
   * 获取权限描述
   *
   * @returns 权限描述
   */
  getPermissionDescription(): string {
    return this.permission.getPermissionDescription();
  }

  /**
   * 获取权限层级深度
   *
   * @returns 层级深度
   */
  getPermissionHierarchyDepth(): number {
    return this.childPermissions.length;
  }

  /**
   * 验证权限更新
   *
   * @private
   */
  private validatePermissionUpdate(): void {
    if (!this.permission.isEditable) {
      throw this._exceptionFactory.createDomainState("权限不可编辑", "system", "updatePermission", { permissionId: this.permission.id.value, isEditable: this.permission.isEditable });
    }
  }

  /**
   * 验证权限类型变更
   *
   * @param oldType - 旧权限类型
   * @param newType - 新权限类型
   * @private
   */
  private validatePermissionTypeChange(oldType: PermissionType, newType: PermissionType): void {
    if (!newType) {
      throw this._exceptionFactory.createInvalidPermissionType(type.toString(), "权限类型不能为空");
    }
    if (this.permission.isSystemPermission && oldType.isSystemPermission() && !newType.isSystemPermission()) {
      throw this._exceptionFactory.createDomainState("系统权限不能变更为非系统权限", "system", "changePermissionType", { permissionId: this.permission.id.value, oldType: oldType.value, newType: newType.value });
    }
  }

  /**
   * 验证权限动作变更
   *
   * @param oldAction - 旧权限动作
   * @param newAction - 新权限动作
   * @private
   */
  private validatePermissionActionChange(oldAction: PermissionAction, newAction: PermissionAction): void {
    if (!newAction) {
      throw this._exceptionFactory.createInvalidPermissionAction(action.toString(), "权限动作不能为空");
    }
  }

  /**
   * 验证权限停用
   *
   * @private
   */
  private validatePermissionDeactivation(): void {
    if (this.permission.isSystemPermission) {
      throw this._exceptionFactory.createDomainState("系统权限不能停用", "system", "deactivate", { permissionId: this.permission.id.value, isSystemPermission: this.permission.isSystemPermission });
    }
    if (this.childPermissions.length > 0) {
      throw this._exceptionFactory.createDomainState("有子权限的权限不能停用", "active", "deactivate", { permissionId: this.permission.id.value, childPermissionsCount: this.childPermissions.length });
    }
  }

  /**
   * 验证父权限
   *
   * @param parentPermissionId - 父权限ID
   * @private
   */
  private validateParentPermission(parentPermissionId: EntityId): void {
    if (!parentPermissionId) {
      throw this._exceptionFactory.createDomainValidation("父权限ID不能为空", "parentPermissionId", parentPermissionId);
    }
    if (parentPermissionId.equals(this.permission.id)) {
      throw this._exceptionFactory.createDomainState("权限不能设置自己为父权限", "active", "setParent", { permissionId: this.permission.id.value, parentPermissionId: parentPermissionId.value });
    }
  }

  /**
   * 验证子权限创建
   *
   * @param childPermission - 子权限
   * @private
   */
  private validateChildPermissionCreation(childPermission: Permission): void {
    if (!childPermission) {
      throw this._exceptionFactory.createDomainValidation("子权限不能为空", "childPermission", childPermission);
    }
    if (childPermission.id.equals(this.permission.id)) {
      throw this._exceptionFactory.createDomainState("权限不能设置自己为子权限", "active", "createChildPermission", { permissionId: this.permission.id.value, childPermissionId: childPermission.id.value });
    }
    if (this.childPermissions.some(p => p.id.equals(childPermission.id))) {
      throw this._exceptionFactory.createDomainState("子权限已存在", "active", "createChildPermission", { permissionId: this.permission.id.value, childPermissionId: childPermission.id.value });
    }
  }

  /**
   * 验证子权限移除
   *
   * @param childPermissionId - 子权限ID
   * @private
   */
  private validateChildPermissionRemoval(childPermissionId: EntityId): void {
    if (!childPermissionId) {
      throw this._exceptionFactory.createDomainValidation("子权限ID不能为空", "childPermissionId", childPermissionId);
    }
  }
}
