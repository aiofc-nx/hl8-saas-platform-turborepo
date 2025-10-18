import { EntityId } from "@hl8/isolation-model";
import { BaseEntity } from "../base/base-entity.js";
import { OrganizationType } from "../../value-objects/types/organization-type.vo.js";
import {
  BusinessRuleViolationException,
  DomainStateException,
} from "../../../common/exceptions/business.exceptions.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../base/audit-info.js";

/**
 * 组织实体属性接口
 *
 * @description 定义组织实体的基本属性
 */
export interface OrganizationProps {
  /** 组织名称 */
  name: string;

  /** 组织类型 */
  type: OrganizationType;

  /** 组织描述 */
  description?: string;

  /** 组织状态 */
  isActive: boolean;

  /** 父组织ID（可选，用于组织层级） */
  parentId?: EntityId;

  /** 组织路径（用于快速查询层级关系） */
  path?: string;

  /** 组织排序 */
  sortOrder: number;
}

/**
 * 组织实体
 *
 * @description 表示组织架构中的组织单位，支持层级结构和多种组织类型。
 * 组织是租户下的重要管理单位，负责人员管理和业务协调。
 *
 * ## 业务规则
 *
 * ### 组织创建规则
 * - 组织名称在同一租户内必须唯一
 * - 组织名称不能为空且长度不能超过100字符
 * - 组织类型必须有效
 * - 组织必须属于某个租户
 *
 * ### 组织层级规则
 * - 组织可以设置父组织，形成层级结构
 * - 组织层级不能超过8层
 * - 组织不能设置自己为父组织
 * - 组织不能设置子组织为父组织（避免循环引用）
 *
 * ### 组织状态规则
 * - 组织可以激活或停用
 * - 停用的组织不能创建新的子组织
 * - 停用的组织不能分配新的成员
 * - 组织状态变更需要记录审计日志
 *
 * ### 组织权限规则
 * - 不同组织类型具有不同的默认权限
 * - 组织权限可以继承自父组织
 * - 组织权限可以覆盖父组织权限
 * - 组织权限变更需要通知相关用户
 *
 * @example
 * ```typescript
 * // 创建组织实体
 * const organization = new Organization(
 *   organizationId,
 *   {
 *     name: "技术委员会",
 *     type: OrganizationType.COMMITTEE,
 *     description: "负责技术决策的委员会",
 *     isActive: true,
 *     sortOrder: 1
 *   },
 *   auditInfo,
 *   logger
 * );
 *
 * // 更新组织信息
 * organization.updateName("技术决策委员会");
 * organization.updateDescription("负责技术战略决策的委员会");
 *
 * // 设置父组织
 * organization.setParent(parentOrganizationId);
 * ```
 *
 * @since 1.0.0
 */
export class Organization extends BaseEntity {
  private _name: string;
  private _type: OrganizationType;
  private _description?: string;
  private _isActive: boolean;
  private _parentId?: EntityId;
  private _path?: string;
  private _sortOrder: number;

  /**
   * 构造函数
   *
   * @param id - 组织ID
   * @param props - 组织属性
   * @param audit - 审计信息
   * @param logger - 日志记录器
   */
  constructor(
    id: EntityId,
    props: OrganizationProps,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);

    this._name = props.name;
    this._type = props.type;
    this._description = props.description;
    this._isActive = props.isActive;
    this._parentId = props.parentId;
    this._path = props.path;
    this._sortOrder = props.sortOrder;

    this.validate();
  }

  /**
   * 获取组织名称
   *
   * @returns 组织名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 获取组织类型
   *
   * @returns 组织类型
   */
  get type(): OrganizationType {
    return this._type;
  }

  /**
   * 获取组织描述
   *
   * @returns 组织描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取组织状态
   *
   * @returns 是否激活
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * 获取父组织ID
   *
   * @returns 父组织ID
   */
  get parentId(): EntityId | undefined {
    return this._parentId;
  }

  /**
   * 获取组织路径
   *
   * @returns 组织路径
   */
  get path(): string | undefined {
    return this._path;
  }

  /**
   * 获取组织排序
   *
   * @returns 组织排序
   */
  get sortOrder(): number {
    return this._sortOrder;
  }

  /**
   * 更新组织名称
   *
   * @description 更新组织名称，自动去除前后空格
   *
   * @param newName - 新名称
   *
   * @throws {Error} 当名称为空时
   * @throws {Error} 当名称长度超过100字符时
   *
   * @example
   * ```typescript
   * organization.updateName("新的组织名称");
   * ```
   */
  updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName.trim();
    this.updateTimestamp();
    this.logOperation("updateName", { name: this._name });
  }

  /**
   * 更新组织描述
   *
   * @description 更新组织描述信息
   *
   * @param newDescription - 新描述
   *
   * @example
   * ```typescript
   * organization.updateDescription("新的组织描述");
   * ```
   */
  updateDescription(newDescription: string): void {
    this._description = newDescription.trim();
    this.updateTimestamp();
    this.logOperation("updateDescription", { description: this._description });
  }

  /**
   * 更新组织类型
   *
   * @description 更新组织类型，类型变更会影响权限范围
   *
   * @param newType - 新类型
   *
   * @throws {Error} 当类型无效时
   *
   * @example
   * ```typescript
   * organization.updateType(OrganizationType.PROJECT_TEAM);
   * ```
   */
  updateType(newType: OrganizationType): void {
    this.validateType(newType);
    this._type = newType;
    this.updateTimestamp();
    this.logOperation("updateType", { type: this._type });
  }

  /**
   * 设置父组织
   *
   * @description 设置组织的父组织，形成层级结构
   *
   * @param parentId - 父组织ID
   *
   * @throws {Error} 当父组织ID无效时
   * @throws {Error} 当设置自己为父组织时
   * @throws {Error} 当设置子组织为父组织时
   *
   * @example
   * ```typescript
   * organization.setParent(parentOrganizationId);
   * ```
   */
  setParent(parentId: EntityId): void {
    this.validateParent(parentId);
    this._parentId = parentId;
    this.updateTimestamp();
    this.logOperation("setParent", { parentId: parentId.toString() });
  }

  /**
   * 移除父组织
   *
   * @description 移除组织的父组织关系，使其成为根组织
   *
   * @example
   * ```typescript
   * organization.removeParent();
   * ```
   */
  removeParent(): void {
    this._parentId = undefined;
    this.updateTimestamp();
    this.logOperation("removeParent");
  }

  /**
   * 更新组织路径
   *
   * @description 更新组织的层级路径，用于快速查询
   *
   * @param newPath - 新路径
   *
   * @example
   * ```typescript
   * organization.updatePath("/1/2/3");
   * ```
   */
  updatePath(newPath: string): void {
    this._path = newPath;
    this.updateTimestamp();
    this.logOperation("updatePath", { path: this._path });
  }

  /**
   * 更新组织排序
   *
   * @description 更新组织在同级中的排序
   *
   * @param newSortOrder - 新排序
   *
   * @throws {Error} 当排序为负数时
   *
   * @example
   * ```typescript
   * organization.updateSortOrder(2);
   * ```
   */
  updateSortOrder(newSortOrder: number): void {
    this.validateSortOrder(newSortOrder);
    this._sortOrder = newSortOrder;
    this.updateTimestamp();
    this.logOperation("updateSortOrder", { sortOrder: this._sortOrder });
  }

  /**
   * 激活组织
   *
   * @description 激活组织，使其可以正常使用
   *
   * @example
   * ```typescript
   * organization.activate();
   * ```
   */
  activate(): void {
    if (this._isActive) {
      throw new DomainStateException("组织已激活", "active", "activate", {
        organizationId: this.id.toString(),
        isActive: this._isActive,
      });
    }

    this._isActive = true;
    this.updateTimestamp();
    this.logOperation("activate");
  }

  /**
   * 停用组织
   *
   * @description 停用组织，使其不能正常使用
   *
   * @example
   * ```typescript
   * organization.deactivate();
   * ```
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new DomainStateException("组织已停用", "inactive", "deactivate", {
        organizationId: this.id.toString(),
        isActive: this._isActive,
      });
    }

    this._isActive = false;
    this.updateTimestamp();
    this.logOperation("deactivate");
  }

  /**
   * 获取组织完整信息
   *
   * @description 返回组织的完整信息对象
   *
   * @returns 组织信息对象
   */
  toData(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      name: this._name,
      type: this._type,
      description: this._description,
      isActive: this._isActive,
      parentId: this._parentId,
      path: this._path,
      sortOrder: this._sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 验证组织属性
   *
   * @protected
   * @override
   */
  protected override validate(): void {
    super.validate();
    this.validateName(this._name);
    this.validateType(this._type);
    this.validateSortOrder(this._sortOrder);
  }

  /**
   * 验证组织名称
   *
   * @private
   */
  private validateName(name: string): void {
    if (!name || !name.trim()) {
      throw new BusinessRuleViolationException(
        "组织名称不能为空",
        "VALIDATION_FAILED",
      );
    }
    if (name.trim().length > 100) {
      throw new BusinessRuleViolationException(
        "组织名称长度不能超过100字符",
        "VALIDATION_FAILED",
      );
    }
  }

  /**
   * 验证组织类型
   *
   * @private
   */
  private validateType(type: OrganizationType): void {
    if (!type) {
      throw new BusinessRuleViolationException(
        "组织类型不能为空",
        "VALIDATION_FAILED",
      );
    }
    if (!Object.values(OrganizationType).includes(type)) {
      throw new BusinessRuleViolationException(
        "无效的组织类型",
        "VALIDATION_FAILED",
      );
    }
  }

  /**
   * 验证父组织
   *
   * @private
   */
  private validateParent(parentId: EntityId): void {
    if (!parentId) {
      throw new BusinessRuleViolationException(
        "父组织ID不能为空",
        "VALIDATION_FAILED",
      );
    }
    if (parentId.equals(this.id)) {
      throw new DomainStateException(
        "不能设置自己为父组织",
        "active",
        "setParent",
        { organizationId: this.id.toString(), parentId: parentId.toString() },
      );
    }
  }

  /**
   * 验证组织排序
   *
   * @private
   */
  private validateSortOrder(sortOrder: number): void {
    if (sortOrder < 0) {
      throw new BusinessRuleViolationException(
        "组织排序不能为负数",
        "VALIDATION_FAILED",
      );
    }
  }
}
