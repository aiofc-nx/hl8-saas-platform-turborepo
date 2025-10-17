import { EntityId } from "@hl8/isolation-model";
import { BaseEntity } from "../base/base-entity.js";
import { DepartmentLevel } from "../../value-objects/types/department-level.vo.js";
import {
  BusinessRuleViolationException,
  DomainStateException,
} from "../../../domain/exceptions/base/base-domain-exception.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../base/audit-info.js";

/**
 * 部门实体属性接口
 *
 * @description 定义部门实体的基本属性
 */
export interface DepartmentProps {
  /** 部门名称 */
  name: string;

  /** 部门层级 */
  level: DepartmentLevel;

  /** 部门描述 */
  description?: string;

  /** 部门状态 */
  isActive: boolean;

  /** 父部门ID（可选，用于部门层级） */
  parentId?: EntityId;

  /** 部门路径（用于快速查询层级关系） */
  path?: string;

  /** 部门排序 */
  sortOrder: number;

  /** 部门负责人ID（可选） */
  managerId?: EntityId;

  /** 部门编码（可选，用于快速识别） */
  code?: string;
}

/**
 * 部门实体
 *
 * @description 表示组织架构中的部门单位，支持层级结构和多种部门层级。
 * 部门是组织下的重要管理单位，负责人员管理和业务协调。
 *
 * ## 业务规则
 *
 * ### 部门创建规则
 * - 部门名称在同一组织内必须唯一
 * - 部门名称不能为空且长度不能超过100字符
 * - 部门层级必须有效（1-8级）
 * - 部门必须属于某个组织
 *
 * ### 部门层级规则
 * - 部门可以设置父部门，形成层级结构
 * - 部门层级不能超过8层
 * - 部门不能设置自己为父部门
 * - 部门不能设置子部门为父部门（避免循环引用）
 *
 * ### 部门状态规则
 * - 部门可以激活或停用
 * - 停用的部门不能创建新的子部门
 * - 停用的部门不能分配新的成员
 * - 部门状态变更需要记录审计日志
 *
 * ### 部门权限规则
 * - 不同部门层级具有不同的默认权限
 * - 高层级部门可以管理低层级部门
 * - 部门权限可以继承自父部门
 * - 部门权限可以覆盖父部门权限
 *
 * @example
 * ```typescript
 * // 创建部门实体
 * const department = new Department(
 *   departmentId,
 *   {
 *     name: "技术部",
 *     level: DepartmentLevel.create(1),
 *     description: "负责技术开发和技术管理",
 *     isActive: true,
 *     sortOrder: 1
 *   },
 *   auditInfo,
 *   logger
 * );
 *
 * // 更新部门信息
 * department.updateName("技术开发部");
 * department.updateDescription("负责技术开发、架构设计和技术管理");
 *
 * // 设置父部门
 * department.setParent(parentDepartmentId);
 * ```
 *
 * @since 1.0.0
 */
export class Department extends BaseEntity {
  private _name: string;
  private _level: DepartmentLevel;
  private _description?: string;
  private _isActive: boolean;
  private _parentId?: EntityId;
  private _path?: string;
  private _sortOrder: number;
  private _managerId?: EntityId;
  private _code?: string;

  /**
   * 构造函数
   *
   * @param id - 部门ID
   * @param props - 部门属性
   * @param audit - 审计信息
   * @param logger - 日志记录器
   */
  constructor(
    id: EntityId,
    props: DepartmentProps,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);

    this._name = props.name;
    this._level = props.level;
    this._description = props.description;
    this._isActive = props.isActive;
    this._parentId = props.parentId;
    this._path = props.path;
    this._sortOrder = props.sortOrder;
    this._managerId = props.managerId;
    this._code = props.code;

    this.validate();
  }

  /**
   * 获取部门名称
   *
   * @returns 部门名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 获取部门层级
   *
   * @returns 部门层级
   */
  get level(): DepartmentLevel {
    return this._level;
  }

  /**
   * 获取部门描述
   *
   * @returns 部门描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取部门状态
   *
   * @returns 是否激活
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * 获取父部门ID
   *
   * @returns 父部门ID
   */
  get parentId(): EntityId | undefined {
    return this._parentId;
  }

  /**
   * 获取部门路径
   *
   * @returns 部门路径
   */
  get path(): string | undefined {
    return this._path;
  }

  /**
   * 获取部门排序
   *
   * @returns 部门排序
   */
  get sortOrder(): number {
    return this._sortOrder;
  }

  /**
   * 获取部门负责人ID
   *
   * @returns 部门负责人ID
   */
  get managerId(): EntityId | undefined {
    return this._managerId;
  }

  /**
   * 获取部门编码
   *
   * @returns 部门编码
   */
  get code(): string | undefined {
    return this._code;
  }

  /**
   * 更新部门名称
   *
   * @description 更新部门名称，自动去除前后空格
   *
   * @param newName - 新名称
   *
   * @throws {Error} 当名称为空时
   * @throws {Error} 当名称长度超过100字符时
   *
   * @example
   * ```typescript
   * department.updateName("新的部门名称");
   * ```
   */
  updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName.trim();
    this.updateTimestamp();
    this.logOperation("updateName", { name: this._name });
  }

  /**
   * 更新部门描述
   *
   * @description 更新部门描述信息
   *
   * @param newDescription - 新描述
   *
   * @example
   * ```typescript
   * department.updateDescription("新的部门描述");
   * ```
   */
  updateDescription(newDescription: string): void {
    this._description = newDescription.trim();
    this.updateTimestamp();
    this.logOperation("updateDescription", { description: this._description });
  }

  /**
   * 更新部门层级
   *
   * @description 更新部门层级，层级变更会影响权限范围
   *
   * @param newLevel - 新层级
   *
   * @throws {Error} 当层级无效时
   *
   * @example
   * ```typescript
   * department.updateLevel(DepartmentLevel.create(2));
   * ```
   */
  updateLevel(newLevel: DepartmentLevel): void {
    this.validateLevel(newLevel);
    this._level = newLevel;
    this.updateTimestamp();
    this.logOperation("updateLevel", { level: this._level.value });
  }

  /**
   * 设置父部门
   *
   * @description 设置部门的父部门，形成层级结构
   *
   * @param parentId - 父部门ID
   *
   * @throws {Error} 当父部门ID无效时
   * @throws {Error} 当设置自己为父部门时
   * @throws {Error} 当设置子部门为父部门时
   *
   * @example
   * ```typescript
   * department.setParent(parentDepartmentId);
   * ```
   */
  setParent(parentId: EntityId): void {
    this.validateParent(parentId);
    this._parentId = parentId;
    this.updateTimestamp();
    this.logOperation("setParent", { parentId: parentId.toString() });
  }

  /**
   * 移除父部门
   *
   * @description 移除部门的父部门关系，使其成为根部门
   *
   * @example
   * ```typescript
   * department.removeParent();
   * ```
   */
  removeParent(): void {
    this._parentId = undefined;
    this.updateTimestamp();
    this.logOperation("removeParent");
  }

  /**
   * 更新部门路径
   *
   * @description 更新部门的层级路径，用于快速查询
   *
   * @param newPath - 新路径
   *
   * @example
   * ```typescript
   * department.updatePath("/1/2/3");
   * ```
   */
  updatePath(newPath: string): void {
    this._path = newPath;
    this.updateTimestamp();
    this.logOperation("updatePath", { path: this._path });
  }

  /**
   * 更新部门排序
   *
   * @description 更新部门在同级中的排序
   *
   * @param newSortOrder - 新排序
   *
   * @throws {Error} 当排序为负数时
   *
   * @example
   * ```typescript
   * department.updateSortOrder(2);
   * ```
   */
  updateSortOrder(newSortOrder: number): void {
    this.validateSortOrder(newSortOrder);
    this._sortOrder = newSortOrder;
    this.updateTimestamp();
    this.logOperation("updateSortOrder", { sortOrder: this._sortOrder });
  }

  /**
   * 设置部门负责人
   *
   * @description 设置部门的负责人
   *
   * @param managerId - 负责人ID
   *
   * @throws {Error} 当负责人ID无效时
   *
   * @example
   * ```typescript
   * department.setManager(managerId);
   * ```
   */
  setManager(managerId: EntityId): void {
    this.validateManager(managerId);
    this._managerId = managerId;
    this.updateTimestamp();
    this.logOperation("setManager", { managerId: managerId.toString() });
  }

  /**
   * 移除部门负责人
   *
   * @description 移除部门的负责人
   *
   * @example
   * ```typescript
   * department.removeManager();
   * ```
   */
  removeManager(): void {
    this._managerId = undefined;
    this.updateTimestamp();
    this.logOperation("removeManager");
  }

  /**
   * 更新部门编码
   *
   * @description 更新部门的编码，用于快速识别
   *
   * @param newCode - 新编码
   *
   * @throws {Error} 当编码格式无效时
   *
   * @example
   * ```typescript
   * department.updateCode("TECH001");
   * ```
   */
  updateCode(newCode: string): void {
    this.validateCode(newCode);
    this._code = newCode.trim().toUpperCase();
    this.updateTimestamp();
    this.logOperation("updateCode", { code: this._code });
  }

  /**
   * 激活部门
   *
   * @description 激活部门，使其可以正常使用
   *
   * @example
   * ```typescript
   * department.activate();
   * ```
   */
  activate(): void {
    if (this._isActive) {
      throw new DomainStateException("部门已激活", "active", "activate", {
        departmentId: this.id.toString(),
        isActive: this._isActive,
      });
    }

    this._isActive = true;
    this.updateTimestamp();
    this.logOperation("activate");
  }

  /**
   * 停用部门
   *
   * @description 停用部门，使其不能正常使用
   *
   * @example
   * ```typescript
   * department.deactivate();
   * ```
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new DomainStateException("部门已停用", "inactive", "deactivate", {
        departmentId: this.id.toString(),
        isActive: this._isActive,
      });
    }

    this._isActive = false;
    this.updateTimestamp();
    this.logOperation("deactivate");
  }

  /**
   * 获取部门完整信息
   *
   * @description 返回部门的完整信息对象
   *
   * @returns 部门信息对象
   */
  toData(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      name: this._name,
      level: this._level,
      description: this._description,
      isActive: this._isActive,
      parentId: this._parentId,
      path: this._path,
      sortOrder: this._sortOrder,
      managerId: this._managerId,
      code: this._code,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * 验证部门属性
   *
   * @protected
   * @override
   */
  protected override validate(): void {
    super.validate();
    this.validateName(this._name);
    this.validateLevel(this._level);
    this.validateSortOrder(this._sortOrder);
    if (this._code) {
      this.validateCode(this._code);
    }
  }

  /**
   * 验证部门名称
   *
   * @private
   */
  private validateName(name: string): void {
    if (!name || !name.trim()) {
      throw new BusinessRuleViolationException(
        "部门名称不能为空",
        "VALIDATION_FAILED",
      );
    }
    if (name.trim().length > 100) {
      throw new BusinessRuleViolationException(
        "部门名称长度不能超过100字符",
        "VALIDATION_FAILED",
      );
    }
  }

  /**
   * 验证部门层级
   *
   * @private
   */
  private validateLevel(level: DepartmentLevel): void {
    if (!level) {
      throw new BusinessRuleViolationException(
        "部门层级不能为空",
        "VALIDATION_FAILED",
      );
    }
    if (!DepartmentLevel.isValid(level.value)) {
      throw new BusinessRuleViolationException(
        "无效的部门层级",
        "VALIDATION_FAILED",
      );
    }
  }

  /**
   * 验证父部门
   *
   * @private
   */
  private validateParent(parentId: EntityId): void {
    if (!parentId) {
      throw new BusinessRuleViolationException(
        "父部门ID不能为空",
        "VALIDATION_FAILED",
      );
    }
    if (parentId.equals(this.id)) {
      throw new DomainStateException(
        "不能设置自己为父部门",
        "active",
        "setParent",
        { departmentId: this.id.toString(), parentId: parentId.toString() },
      );
    }
  }

  /**
   * 验证部门排序
   *
   * @private
   */
  private validateSortOrder(sortOrder: number): void {
    if (sortOrder < 0) {
      throw new BusinessRuleViolationException(
        "部门排序不能为负数",
        "VALIDATION_FAILED",
      );
    }
  }

  /**
   * 验证部门负责人
   *
   * @private
   */
  private validateManager(managerId: EntityId): void {
    if (!managerId) {
      throw new BusinessRuleViolationException(
        "负责人ID不能为空",
        "VALIDATION_FAILED",
      );
    }
  }

  /**
   * 验证部门编码
   *
   * @private
   */
  private validateCode(code: string): void {
    if (!code || !code.trim()) {
      throw new BusinessRuleViolationException(
        "部门编码不能为空",
        "VALIDATION_FAILED",
      );
    }
    if (code.trim().length > 20) {
      throw new BusinessRuleViolationException(
        "部门编码长度不能超过20字符",
        "VALIDATION_FAILED",
      );
    }
    if (!/^[A-Z0-9_]+$/.test(code.trim())) {
      throw new BusinessRuleViolationException(
        "部门编码只能包含大写字母、数字和下划线",
        "VALIDATION_FAILED",
      );
    }
  }
}
