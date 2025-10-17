/**
 * 角色实体
 *
 * @description 表示系统中的角色，支持多租户、多层级、多权限的角色管理
 *
 * @since 1.0.0
 */

import { EntityId, TenantId, OrganizationId, DepartmentId } from "@hl8/isolation-model";
import { BaseEntity } from "../base/base-entity.js";
import { RoleType } from "../../value-objects/types/role-type.vo.js";
import { PermissionType } from "../../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../../value-objects/types/permission-action.vo.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../base/audit-info.js";
import { ExceptionFactory } from "../../exceptions/exception-factory.js";
import { RoleStateException, InvalidRoleNameException } from "../../exceptions/business-exceptions.js";

/**
 * 角色实体属性接口
 *
 * @description 定义角色实体的基本属性
 */
export interface RoleProps {
  /** 角色名称 */
  name: string;
  
  /** 角色描述 */
  description?: string;
  
  /** 角色类型 */
  type: RoleType;
  
  /** 权限类型 */
  permissionType: PermissionType;
  
  /** 权限动作列表 */
  actions: PermissionAction[];
  
  /** 是否启用 */
  isActive: boolean;
  
  /** 是否系统角色 */
  isSystemRole: boolean;
  
  /** 是否可编辑 */
  isEditable: boolean;
  
  /** 角色优先级 */
  priority: number;
  
  /** 父角色ID */
  parentRoleId?: EntityId;
  
  /** 角色标签 */
  tags?: string[];
  
  /** 角色配置 */
  config?: Record<string, any>;
}

/**
 * 角色实体
 *
 * @description 表示系统中的角色，支持多租户、多层级、多权限的角色管理
 *
 * ## 业务规则
 *
 * ### 角色创建规则
 * - 角色名称在同一租户内必须唯一
 * - 角色名称不能为空，长度不能超过100字符
 * - 角色描述长度不能超过500字符
 * - 系统角色不能删除，只能禁用
 * - 角色优先级越高，权限越大
 *
 * ### 角色权限规则
 * - 角色必须至少有一个权限动作
 * - 权限动作不能重复
 * - 管理权限包含所有其他权限
 * - 父角色的权限会继承给子角色
 *
 * ### 角色层级规则
 * - 角色可以有父角色，形成层级结构
 * - 子角色继承父角色的所有权限
 * - 子角色可以添加额外的权限
 * - 角色层级不能形成循环
 *
 * @example
 * ```typescript
 * // 创建角色
 * const role = new Role(
 *   EntityId.generate(),
 *   {
 *     name: "管理员",
 *     description: "系统管理员角色",
 *     type: RoleType.TENANT,
 *     permissionType: PermissionType.TENANT,
 *     actions: [PermissionAction.MANAGE],
 *     isActive: true,
 *     isSystemRole: false,
 *     isEditable: true,
 *     priority: 100
 *   },
 *   { createdBy: "system" }
 * );
 * 
 * // 检查权限
 * console.log(role.hasPermission(PermissionAction.CREATE)); // true
 * console.log(role.canManageUsers()); // true
 * 
 * // 添加权限
 * role.addPermission(PermissionAction.EXPORT);
 * ```
 *
 * @since 1.0.0
 */
export class Role extends BaseEntity {
  private _name: string;
  private _description?: string;
  private _type: RoleType;
  private _permissionType: PermissionType;
  private _actions: PermissionAction[];
  private _isActive: boolean;
  private _isSystemRole: boolean;
  private _isEditable: boolean;
  private _priority: number;
  private _parentRoleId?: EntityId;
  private _tags?: string[];
  private _config?: Record<string, any>;
  private _exceptionFactory: ExceptionFactory;

  constructor(
    id: EntityId,
    props: RoleProps,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._exceptionFactory = ExceptionFactory.getInstance();
    this._name = props.name;
    this._description = props.description;
    this._type = props.type;
    this._permissionType = props.permissionType;
    this._actions = [...props.actions];
    this._isActive = props.isActive;
    this._isSystemRole = props.isSystemRole;
    this._isEditable = props.isEditable;
    this._priority = props.priority;
    this._parentRoleId = props.parentRoleId;
    this._tags = props.tags ? [...props.tags] : undefined;
    this._config = props.config ? { ...props.config } : undefined;
    this.validate();
  }

  /**
   * 获取角色名称
   *
   * @returns 角色名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 获取角色描述
   *
   * @returns 角色描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取角色类型
   *
   * @returns 角色类型
   */
  get type(): RoleType {
    return this._type;
  }

  /**
   * 获取权限类型
   *
   * @returns 权限类型
   */
  get permissionType(): PermissionType {
    return this._permissionType;
  }

  /**
   * 获取权限动作列表
   *
   * @returns 权限动作列表
   */
  get actions(): PermissionAction[] {
    return [...this._actions];
  }

  /**
   * 获取是否启用
   *
   * @returns 是否启用
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * 获取是否系统角色
   *
   * @returns 是否系统角色
   */
  get isSystemRole(): boolean {
    return this._isSystemRole;
  }

  /**
   * 获取是否可编辑
   *
   * @returns 是否可编辑
   */
  get isEditable(): boolean {
    return this._isEditable;
  }

  /**
   * 获取角色优先级
   *
   * @returns 角色优先级
   */
  get priority(): number {
    return this._priority;
  }

  /**
   * 获取父角色ID
   *
   * @returns 父角色ID
   */
  get parentRoleId(): EntityId | undefined {
    return this._parentRoleId;
  }

  /**
   * 获取角色标签
   *
   * @returns 角色标签
   */
  get tags(): string[] | undefined {
    return this._tags ? [...this._tags] : undefined;
  }

  /**
   * 获取角色配置
   *
   * @returns 角色配置
   */
  get config(): Record<string, any> | undefined {
    return this._config ? { ...this._config } : undefined;
  }

  /**
   * 更新角色名称
   *
   * @param name - 新的角色名称
   */
  updateName(name: string): void {
    this.validateName(name);
    this._name = name.trim();
    this.updateTimestamp();
    this.logOperation("updateName", { name: this._name });
  }

  /**
   * 更新角色描述
   *
   * @param description - 新的角色描述
   */
  updateDescription(description: string): void {
    this.validateDescription(description);
    this._description = description.trim();
    this.updateTimestamp();
    this.logOperation("updateDescription", { description: this._description });
  }

  /**
   * 更新角色类型
   *
   * @param type - 新的角色类型
   */
  updateType(type: RoleType): void {
    this.validateTypeChange(this._type, type);
    this._type = type;
    this.updateTimestamp();
    this.logOperation("updateType", { type: type.value });
  }

  /**
   * 更新权限类型
   *
   * @param permissionType - 新的权限类型
   */
  updatePermissionType(permissionType: PermissionType): void {
    this.validatePermissionTypeChange(this._permissionType, permissionType);
    this._permissionType = permissionType;
    this.updateTimestamp();
    this.logOperation("updatePermissionType", { permissionType: permissionType.value });
  }

  /**
   * 添加权限动作
   *
   * @param action - 权限动作
   */
  addPermission(action: PermissionAction): void {
    this.validateActionAddition(action);
    if (!this._actions.some(a => a.value === action.value)) {
      this._actions.push(action);
      this.updateTimestamp();
      this.logOperation("addPermission", { action: action.value });
    }
  }

  /**
   * 移除权限动作
   *
   * @param action - 权限动作
   */
  removePermission(action: PermissionAction): void {
    this.validateActionRemoval(action);
    this._actions = this._actions.filter(a => a.value !== action.value);
    this.updateTimestamp();
    this.logOperation("removePermission", { action: action.value });
  }

  /**
   * 设置权限动作列表
   *
   * @param actions - 权限动作列表
   */
  setPermissions(actions: PermissionAction[]): void {
    this.validateActions(actions);
    this._actions = [...actions];
    this.updateTimestamp();
    this.logOperation("setPermissions", { actions: actions.map(a => a.value) });
  }

  /**
   * 激活角色
   */
  activate(): void {
    if (this._isActive) {
      throw this._exceptionFactory.createEntityAlreadyActive("角色", this.id);
    }
    this._isActive = true;
    this.updateTimestamp();
    this.logOperation("activate");
  }

  /**
   * 停用角色
   */
  deactivate(): void {
    if (!this._isActive) {
      throw this._exceptionFactory.createEntityNotActive("角色", this.id);
    }
    if (this._isSystemRole) {
      throw this._exceptionFactory.createDomainState("系统角色不能停用", "system", "deactivate", { roleId: this.id.value, isSystemRole: this._isSystemRole });
    }
    this._isActive = false;
    this.updateTimestamp();
    this.logOperation("deactivate");
  }

  /**
   * 更新角色优先级
   *
   * @param priority - 新的优先级
   */
  updatePriority(priority: number): void {
    this.validatePriority(priority);
    this._priority = priority;
    this.updateTimestamp();
    this.logOperation("updatePriority", { priority });
  }

  /**
   * 设置父角色
   *
   * @param parentRoleId - 父角色ID
   */
  setParentRole(parentRoleId: EntityId): void {
    this.validateParentRole(parentRoleId);
    this._parentRoleId = parentRoleId;
    this.updateTimestamp();
    this.logOperation("setParentRole", { parentRoleId: parentRoleId.toString() });
  }

  /**
   * 移除父角色
   */
  removeParentRole(): void {
    this._parentRoleId = undefined;
    this.updateTimestamp();
    this.logOperation("removeParentRole");
  }

  /**
   * 添加标签
   *
   * @param tag - 标签
   */
  addTag(tag: string): void {
    this.validateTag(tag);
    if (!this._tags) {
      this._tags = [];
    }
    if (!this._tags.includes(tag)) {
      this._tags.push(tag);
      this.updateTimestamp();
      this.logOperation("addTag", { tag });
    }
  }

  /**
   * 移除标签
   *
   * @param tag - 标签
   */
  removeTag(tag: string): void {
    if (this._tags) {
      this._tags = this._tags.filter(t => t !== tag);
      this.updateTimestamp();
      this.logOperation("removeTag", { tag });
    }
  }

  /**
   * 更新配置
   *
   * @param config - 配置对象
   */
  updateConfig(config: Record<string, any>): void {
    this._config = { ...config };
    this.updateTimestamp();
    this.logOperation("updateConfig", { config });
  }

  /**
   * 检查是否有指定权限
   *
   * @param action - 权限动作
   * @returns 是否有权限
   */
  hasPermission(action: PermissionAction): boolean {
    return this._actions.some(a => a.value === action.value);
  }

  /**
   * 检查是否可以管理用户
   *
   * @returns 是否可以管理用户
   */
  canManageUsers(): boolean {
    return this.hasPermission(PermissionAction.MANAGE) || 
           this.hasPermission(PermissionAction.ASSIGN);
  }

  /**
   * 检查是否可以管理系统
   *
   * @returns 是否可以管理系统
   */
  canManageSystem(): boolean {
    return this._type.isSystemRole() && this.hasPermission(PermissionAction.MANAGE);
  }

  /**
   * 检查是否可以管理租户
   *
   * @returns 是否可以管理租户
   */
  canManageTenant(): boolean {
    return this._type.isTenantRole() && this.hasPermission(PermissionAction.MANAGE);
  }

  /**
   * 检查是否可以管理组织
   *
   * @returns 是否可以管理组织
   */
  canManageOrganization(): boolean {
    return this._type.isOrganizationRole() && this.hasPermission(PermissionAction.MANAGE);
  }

  /**
   * 检查是否可以管理部门
   *
   * @returns 是否可以管理部门
   */
  canManageDepartment(): boolean {
    return this._type.isDepartmentRole() && this.hasPermission(PermissionAction.MANAGE);
  }

  /**
   * 检查角色是否高于指定角色
   *
   * @param otherRole - 其他角色
   * @returns 是否高于指定角色
   */
  hasHigherPriorityThan(otherRole: Role): boolean {
    return this._priority > otherRole.priority;
  }

  /**
   * 获取所有权限动作描述
   *
   * @returns 权限动作描述列表
   */
  getPermissionDescriptions(): string[] {
    return this._actions.map(action => action.getDescription());
  }

  /**
   * 验证角色
   *
   * @protected
   */
  protected override validate(): void {
    super.validate();
    this.validateName(this._name);
    this.validateDescription(this._description);
    this.validateActions(this._actions);
    this.validatePriority(this._priority);
  }

  /**
   * 验证角色名称
   *
   * @param name - 角色名称
   * @private
   */
  private validateName(name: string): void {
    if (!name || !name.trim()) {
      throw this._exceptionFactory.createInvalidRoleName(name, "角色名称不能为空");
    }
    if (name.trim().length > 100) {
      throw this._exceptionFactory.createInvalidRoleName(name, "角色名称长度不能超过100字符");
    }
  }

  /**
   * 验证角色描述
   *
   * @param description - 角色描述
   * @private
   */
  private validateDescription(description?: string): void {
    if (description && description.trim().length > 500) {
      throw this._exceptionFactory.createDomainValidation("角色描述长度不能超过500字符", "description", description);
    }
  }

  /**
   * 验证权限动作列表
   *
   * @param actions - 权限动作列表
   * @private
   */
  private validateActions(actions: PermissionAction[]): void {
    if (!actions || actions.length === 0) {
      throw this._exceptionFactory.createDomainValidation("角色必须至少有一个权限动作", "actions", actions);
    }
    const actionValues = actions.map(a => a.value);
    const uniqueValues = [...new Set(actionValues)];
    if (actionValues.length !== uniqueValues.length) {
      throw this._exceptionFactory.createDomainValidation("权限动作不能重复", "actions", actions);
    }
  }

  /**
   * 验证权限动作添加
   *
   * @param action - 权限动作
   * @private
   */
  private validateActionAddition(action: PermissionAction): void {
    if (!action) {
      throw this._exceptionFactory.createInvalidPermissionAction(action.toString(), "权限动作不能为空");
    }
  }

  /**
   * 验证权限动作移除
   *
   * @param action - 权限动作
   * @private
   */
  private validateActionRemoval(action: PermissionAction): void {
    if (!action) {
      throw this._exceptionFactory.createInvalidPermissionAction(action.toString(), "权限动作不能为空");
    }
    if (this._actions.length === 1) {
      throw this._exceptionFactory.createDomainValidation("角色必须至少有一个权限动作", "actions", actions);
    }
  }

  /**
   * 验证角色类型变更
   *
   * @param oldType - 旧角色类型
   * @param newType - 新角色类型
   * @private
   */
  private validateTypeChange(oldType: RoleType, newType: RoleType): void {
    if (!newType) {
      throw this._exceptionFactory.createInvalidRoleType(type.toString(), "角色类型不能为空");
    }
    if (this._isSystemRole && oldType.isSystemRole() && !newType.isSystemRole()) {
      throw this._exceptionFactory.createDomainState("系统角色不能变更为非系统角色", "system", "changeType", { oldType: oldType.value, newType: newType.value });
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
      throw new Error("权限类型不能为空");
    }
  }

  /**
   * 验证优先级
   *
   * @param priority - 优先级
   * @private
   */
  private validatePriority(priority: number): void {
    if (typeof priority !== "number" || priority < 0) {
      throw new Error("角色优先级必须是非负数");
    }
  }

  /**
   * 验证父角色
   *
   * @param parentRoleId - 父角色ID
   * @private
   */
  private validateParentRole(parentRoleId: EntityId): void {
    if (!parentRoleId) {
      throw new Error("父角色ID不能为空");
    }
    if (parentRoleId.equals(this.id)) {
      throw new Error("角色不能设置自己为父角色");
    }
  }

  /**
   * 验证标签
   *
   * @param tag - 标签
   * @private
   */
  private validateTag(tag: string): void {
    if (!tag || !tag.trim()) {
      throw new Error("标签不能为空");
    }
    if (tag.trim().length > 50) {
      throw new Error("标签长度不能超过50字符");
    }
  }
}
