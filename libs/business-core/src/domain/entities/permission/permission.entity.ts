/**
 * 权限实体
 *
 * @description 表示系统中的权限，支持多租户、多层级、多资源的权限管理
 *
 * @since 1.0.0
 */

import {
  EntityId,
  TenantId,
  OrganizationId,
  DepartmentId,
} from "@hl8/isolation-model";
import { BaseEntity } from "../base/base-entity.js";
import { PermissionType } from "../../value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../../value-objects/types/permission-action.vo.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../base/audit-info.js";
import { ExceptionFactory } from "../../exceptions/exception-factory.js";
import {
  BusinessRuleViolationException,
  DomainValidationException,
} from "../../exceptions/base/base-domain-exception.js";

/**
 * 权限实体属性接口
 *
 * @description 定义权限实体的基本属性
 */
export interface PermissionProps {
  /** 权限名称 */
  name: string;

  /** 权限描述 */
  description?: string;

  /** 权限类型 */
  type: PermissionType;

  /** 权限动作 */
  action: PermissionAction;

  /** 资源标识 */
  resource: string;

  /** 资源ID */
  resourceId?: EntityId;

  /** 是否启用 */
  isActive: boolean;

  /** 是否系统权限 */
  isSystemPermission: boolean;

  /** 是否可编辑 */
  isEditable: boolean;

  /** 权限优先级 */
  priority: number;

  /** 父权限ID */
  parentPermissionId?: EntityId;

  /** 权限条件 */
  conditions?: Record<string, any>;

  /** 权限标签 */
  tags?: string[];

  /** 权限配置 */
  config?: Record<string, any>;
}

/**
 * 权限实体
 *
 * @description 表示系统中的权限，支持多租户、多层级、多资源的权限管理
 *
 * ## 业务规则
 *
 * ### 权限创建规则
 * - 权限名称在同一租户内必须唯一
 * - 权限名称不能为空，长度不能超过100字符
 * - 权限描述长度不能超过500字符
 * - 系统权限不能删除，只能禁用
 * - 权限优先级越高，权限越大
 *
 * ### 权限资源规则
 * - 权限必须指定资源标识
 * - 资源标识不能为空，长度不能超过200字符
 * - 资源ID可选，用于特定资源的权限
 * - 权限条件用于动态权限控制
 *
 * ### 权限层级规则
 * - 权限可以有父权限，形成层级结构
 * - 子权限继承父权限的所有条件
 * - 子权限可以添加额外的条件
 * - 权限层级不能形成循环
 *
 * @example
 * ```typescript
 * // 创建权限
 * const permission = new Permission(
 *   EntityId.generate(),
 *   {
 *     name: "用户管理",
 *     description: "管理用户信息的权限",
 *     type: PermissionType.TENANT,
 *     action: PermissionAction.MANAGE,
 *     resource: "user",
 *     isActive: true,
 *     isSystemPermission: false,
 *     isEditable: true,
 *     priority: 100
 *   },
 *   { createdBy: "system" }
 * );
 *
 * // 检查权限
 * console.log(permission.canAccess("user")); // true
 * console.log(permission.canManage()); // true
 *
 * // 添加条件
 * permission.addCondition("department", "IT");
 * ```
 *
 * @since 1.0.0
 */
export class Permission extends BaseEntity {
  private _name: string;
  private _description?: string;
  private _type: PermissionType;
  private _action: PermissionAction;
  private _resource: string;
  private _resourceId?: EntityId;
  private _isActive: boolean;
  private _isSystemPermission: boolean;
  private _isEditable: boolean;
  private _priority: number;
  private _parentPermissionId?: EntityId;
  private _conditions?: Record<string, string | number | boolean | null>;
  private _tags?: string[];
  private _config?: Record<string, any>;
  private _exceptionFactory: ExceptionFactory;

  constructor(
    id: EntityId,
    props: PermissionProps,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._exceptionFactory = ExceptionFactory.getInstance();
    this._name = props.name;
    this._description = props.description;
    this._type = props.type;
    this._action = props.action;
    this._resource = props.resource;
    this._resourceId = props.resourceId;
    this._isActive = props.isActive;
    this._isSystemPermission = props.isSystemPermission;
    this._isEditable = props.isEditable;
    this._priority = props.priority;
    this._parentPermissionId = props.parentPermissionId;
    this._conditions = props.conditions ? { ...props.conditions } : undefined;
    this._tags = props.tags ? [...props.tags] : undefined;
    this._config = props.config ? { ...props.config } : undefined;
    this.validate();
  }

  /**
   * 获取权限名称
   *
   * @returns 权限名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 获取权限描述
   *
   * @returns 权限描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取权限类型
   *
   * @returns 权限类型
   */
  get type(): PermissionType {
    return this._type;
  }

  /**
   * 获取权限动作
   *
   * @returns 权限动作
   */
  get action(): PermissionAction {
    return this._action;
  }

  /**
   * 获取资源标识
   *
   * @returns 资源标识
   */
  get resource(): string {
    return this._resource;
  }

  /**
   * 获取资源ID
   *
   * @returns 资源ID
   */
  get resourceId(): EntityId | undefined {
    return this._resourceId;
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
   * 获取是否系统权限
   *
   * @returns 是否系统权限
   */
  get isSystemPermission(): boolean {
    return this._isSystemPermission;
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
   * 获取权限优先级
   *
   * @returns 权限优先级
   */
  get priority(): number {
    return this._priority;
  }

  /**
   * 获取父权限ID
   *
   * @returns 父权限ID
   */
  get parentPermissionId(): EntityId | undefined {
    return this._parentPermissionId;
  }

  /**
   * 获取权限条件
   *
   * @returns 权限条件
   */
  get conditions():
    | Record<string, string | number | boolean | null>
    | undefined {
    return this._conditions ? { ...this._conditions } : undefined;
  }

  /**
   * 获取权限标签
   *
   * @returns 权限标签
   */
  get tags(): string[] | undefined {
    return this._tags ? [...this._tags] : undefined;
  }

  /**
   * 获取权限配置
   *
   * @returns 权限配置
   */
  get config(): Record<string, any> | undefined {
    return this._config ? { ...this._config } : undefined;
  }

  /**
   * 更新权限名称
   *
   * @param name - 新的权限名称
   */
  updateName(name: string): void {
    this.validateName(name);
    this._name = name.trim();
    this.updateTimestamp();
    this.logOperation("updateName", { name: this._name });
  }

  /**
   * 更新权限描述
   *
   * @param description - 新的权限描述
   */
  updateDescription(description: string): void {
    this.validateDescription(description);
    this._description = description.trim();
    this.updateTimestamp();
    this.logOperation("updateDescription", { description: this._description });
  }

  /**
   * 更新权限类型
   *
   * @param type - 新的权限类型
   */
  updateType(type: PermissionType): void {
    this.validateTypeChange(this._type, type);
    this._type = type;
    this.updateTimestamp();
    this.logOperation("updateType", { type: type.value });
  }

  /**
   * 更新权限动作
   *
   * @param action - 新的权限动作
   */
  updateAction(action: PermissionAction): void {
    this.validateActionChange(this._action, action);
    this._action = action;
    this.updateTimestamp();
    this.logOperation("updateAction", { action: action.value });
  }

  /**
   * 更新资源标识
   *
   * @param resource - 新的资源标识
   */
  updateResource(resource: string): void {
    this.validateResource(resource);
    this._resource = resource.trim();
    this.updateTimestamp();
    this.logOperation("updateResource", { resource: this._resource });
  }

  /**
   * 设置资源ID
   *
   * @param resourceId - 资源ID
   */
  setResourceId(resourceId: EntityId): void {
    this._resourceId = resourceId;
    this.updateTimestamp();
    this.logOperation("setResourceId", { resourceId: resourceId.toString() });
  }

  /**
   * 移除资源ID
   */
  removeResourceId(): void {
    this._resourceId = undefined;
    this.updateTimestamp();
    this.logOperation("removeResourceId");
  }

  /**
   * 激活权限
   */
  activate(): void {
    if (this._isActive) {
      throw new BusinessRuleViolationException(
        "权限已激活",
        "PERMISSION_ALREADY_ACTIVE",
      );
    }
    this._isActive = true;
    this.updateTimestamp();
    this.logOperation("activate");
  }

  /**
   * 停用权限
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new BusinessRuleViolationException(
        "权限未激活",
        "PERMISSION_NOT_ACTIVE",
      );
    }
    if (this._isSystemPermission) {
      throw this._exceptionFactory.createDomainState(
        "系统权限不能停用",
        "system",
        "deactivate",
        {
          permissionId: this.id.toString(),
          isSystemPermission: this._isSystemPermission,
        },
      );
    }
    this._isActive = false;
    this.updateTimestamp();
    this.logOperation("deactivate");
  }

  /**
   * 更新权限优先级
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
   * 设置父权限
   *
   * @param parentPermissionId - 父权限ID
   */
  setParentPermission(parentPermissionId: EntityId): void {
    this.validateParentPermission(parentPermissionId);
    this._parentPermissionId = parentPermissionId;
    this.updateTimestamp();
    this.logOperation("setParentPermission", {
      parentPermissionId: parentPermissionId.toString(),
    });
  }

  /**
   * 移除父权限
   */
  removeParentPermission(): void {
    this._parentPermissionId = undefined;
    this.updateTimestamp();
    this.logOperation("removeParentPermission");
  }

  /**
   * 添加条件
   *
   * @param key - 条件键
   * @param value - 条件值
   */
  addCondition(key: string, value: string | number | boolean | null): void {
    this.validateConditionKey(key);
    if (!this._conditions) {
      this._conditions = {};
    }
    this._conditions[key] = value;
    this.updateTimestamp();
    this.logOperation("addCondition", { key, value });
  }

  /**
   * 移除条件
   *
   * @param key - 条件键
   */
  removeCondition(key: string): void {
    if (
      this._conditions &&
      Object.prototype.hasOwnProperty.call(this._conditions, key)
    ) {
      delete this._conditions[key];
      this.updateTimestamp();
      this.logOperation("removeCondition", { key });
    }
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
      this._tags = this._tags.filter((t) => t !== tag);
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
   * 检查是否可以访问指定资源
   *
   * @param resource - 资源标识
   * @returns 是否可以访问
   */
  canAccess(resource: string): boolean {
    return this._resource === resource;
  }

  /**
   * 检查是否可以执行指定动作
   *
   * @param action - 权限动作
   * @returns 是否可以执行
   */
  canExecute(action: PermissionAction): boolean {
    return this._action.value === action.value;
  }

  /**
   * 检查是否可以管理
   *
   * @returns 是否可以管理
   */
  canManage(): boolean {
    return this._action.isManageAction();
  }

  /**
   * 检查是否可以创建
   *
   * @returns 是否可以创建
   */
  canCreate(): boolean {
    return this._action.isCreateAction();
  }

  /**
   * 检查是否可以读取
   *
   * @returns 是否可以读取
   */
  canRead(): boolean {
    return this._action.isReadAction();
  }

  /**
   * 检查是否可以更新
   *
   * @returns 是否可以更新
   */
  canUpdate(): boolean {
    return this._action.isUpdateAction();
  }

  /**
   * 检查是否可以删除
   *
   * @returns 是否可以删除
   */
  canDelete(): boolean {
    return this._action.isDeleteAction();
  }

  /**
   * 检查权限是否高于指定权限
   *
   * @param otherPermission - 其他权限
   * @returns 是否高于指定权限
   */
  hasHigherPriorityThan(otherPermission: Permission): boolean {
    return this._priority > otherPermission.priority;
  }

  /**
   * 检查权限条件是否匹配
   *
   * @param context - 上下文条件
   * @returns 是否匹配
   */
  matchesConditions(
    context: Record<string, string | number | boolean | null>,
  ): boolean {
    if (!this._conditions) {
      return true;
    }

    for (const [key, value] of Object.entries(this._conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取权限描述
   *
   * @returns 权限描述
   */
  getPermissionDescription(): string {
    return `${this._action.getDescription()} ${this._resource}`;
  }

  /**
   * 验证权限
   *
   * @protected
   */
  protected override validate(): void {
    super.validate();
    this.validateName(this._name);
    this.validateDescription(this._description);
    this.validateResource(this._resource);
    this.validatePriority(this._priority);
  }

  /**
   * 验证权限名称
   *
   * @param name - 权限名称
   * @private
   */
  private validateName(name: string): void {
    if (!name || !name.trim()) {
      throw new DomainValidationException("权限名称不能为空", "name", name);
    }
    if (name.trim().length > 100) {
      throw new DomainValidationException(
        "权限名称长度不能超过100字符",
        "name",
        name,
      );
    }
  }

  /**
   * 验证权限描述
   *
   * @param description - 权限描述
   * @private
   */
  private validateDescription(description?: string): void {
    if (description && description.trim().length > 500) {
      throw this._exceptionFactory.createDomainValidation(
        "权限描述长度不能超过500字符",
        "description",
        description,
      );
    }
  }

  /**
   * 验证资源标识
   *
   * @param resource - 资源标识
   * @private
   */
  private validateResource(resource: string): void {
    if (!resource || !resource.trim()) {
      throw this._exceptionFactory.createDomainValidation(
        "资源标识不能为空",
        "resource",
        resource,
      );
    }
    if (resource.trim().length > 200) {
      throw this._exceptionFactory.createDomainValidation(
        "资源标识长度不能超过200字符",
        "resource",
        resource,
      );
    }
  }

  /**
   * 验证权限类型变更
   *
   * @param oldType - 旧权限类型
   * @param newType - 新权限类型
   * @private
   */
  private validateTypeChange(
    oldType: PermissionType,
    newType: PermissionType,
  ): void {
    if (!newType) {
      throw new DomainValidationException(
        "权限类型不能为空",
        "type",
        newType.toString(),
      );
    }
    if (
      this._isSystemPermission &&
      oldType.isSystemPermission() &&
      !newType.isSystemPermission()
    ) {
      throw this._exceptionFactory.createDomainState(
        "系统权限不能变更为非系统权限",
        "system",
        "changeType",
        { oldType: oldType.value, newType: newType.value },
      );
    }
  }

  /**
   * 验证权限动作变更
   *
   * @param oldAction - 旧权限动作
   * @param newAction - 新权限动作
   * @private
   */
  private validateActionChange(
    oldAction: PermissionAction,
    newAction: PermissionAction,
  ): void {
    if (!newAction) {
      throw new DomainValidationException(
        "权限动作不能为空",
        "action",
        newAction.toString(),
      );
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
      throw this._exceptionFactory.createDomainValidation(
        "权限优先级必须是非负数",
        "priority",
        priority,
      );
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
      throw this._exceptionFactory.createDomainValidation(
        "父权限ID不能为空",
        "parentPermissionId",
        parentPermissionId,
      );
    }
    if (parentPermissionId.equals(this.id)) {
      throw this._exceptionFactory.createDomainState(
        "权限不能设置自己为父权限",
        "active",
        "setParent",
        {
          permissionId: this.id.toString(),
          parentPermissionId: parentPermissionId.toString(),
        },
      );
    }
  }

  /**
   * 验证条件键
   *
   * @param key - 条件键
   * @private
   */
  private validateConditionKey(key: string): void {
    if (!key || !key.trim()) {
      throw this._exceptionFactory.createDomainValidation(
        "条件键不能为空",
        "conditionKey",
        key,
      );
    }
    if (key.trim().length > 50) {
      throw this._exceptionFactory.createDomainValidation(
        "条件键长度不能超过50字符",
        "conditionKey",
        key,
      );
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
      throw this._exceptionFactory.createDomainValidation(
        "标签不能为空",
        "tag",
        tag,
      );
    }
    if (tag.trim().length > 50) {
      throw this._exceptionFactory.createDomainValidation(
        "标签长度不能超过50字符",
        "tag",
        tag,
      );
    }
  }
}
