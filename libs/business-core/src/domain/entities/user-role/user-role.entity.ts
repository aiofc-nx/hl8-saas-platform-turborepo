/**
 * 用户角色关联实体
 *
 * @description 表示用户和角色之间的关联关系，支持多租户、多角色的用户权限管理
 *
 * @since 1.0.0
 */

import { EntityId, UserId } from "@hl8/isolation-model";
import { BaseEntity } from "../base/base-entity.js";
import {
  BusinessRuleViolationException,
  DomainStateException,
} from "../../../domain/exceptions/base/base-domain-exception.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../base/audit-info.js";

/**
 * 用户角色关联实体属性接口
 *
 * @description 定义用户角色关联实体的基本属性
 */
export interface UserRoleProps {
  /** 用户ID */
  userId: UserId;

  /** 角色ID */
  roleId: EntityId;

  /** 是否启用 */
  isActive: boolean;

  /** 分配原因 */
  reason?: string;

  /** 分配者ID */
  assignedBy?: UserId;

  /** 分配时间 */
  assignedAt?: Date;

  /** 过期时间 */
  expiresAt?: Date;

  /** 关联配置 */
  config?: Record<string, any>;
}

/**
 * 用户角色关联实体
 *
 * @description 表示用户和角色之间的关联关系，支持多租户、多角色的用户权限管理
 *
 * ## 业务规则
 *
 * ### 关联创建规则
 * - 用户和角色必须属于同一租户
 * - 用户不能重复分配同一角色
 * - 角色分配需要相应的权限
 * - 系统角色只能由系统管理员分配
 *
 * ### 关联管理规则
 * - 关联可以设置过期时间
 * - 关联可以设置分配原因
 * - 关联可以设置分配者
 * - 关联可以设置配置信息
 *
 * ### 权限继承规则
 * - 用户继承角色的所有权限
 * - 多个角色的权限会合并
 * - 权限冲突时以高优先级为准
 * - 系统权限不能被覆盖
 *
 * @example
 * ```typescript
 * // 创建用户角色关联
 * const userRole = new UserRole(
 *   EntityId.generate(),
 *   {
 *     userId: UserId.generate(),
 *     roleId: role.id,
 *     isActive: true,
 *     reason: "新员工入职",
 *     assignedBy: adminUserId,
 *     assignedAt: new Date()
 *   },
 *   { createdBy: "system" }
 * );
 *
 * // 检查关联状态
 * console.log(userRole.isActive); // true
 * console.log(userRole.isExpired()); // false
 *
 * // 停用关联
 * userRole.deactivate();
 * ```
 *
 * @since 1.0.0
 */
export class UserRole extends BaseEntity {
  private _userId: UserId;
  private _roleId: EntityId;
  private _isActive: boolean;
  private _reason?: string;
  private _assignedBy?: UserId;
  private _assignedAt?: Date;
  private _expiresAt?: Date;
  private _config?: Record<string, any>;
  constructor(
    id: EntityId,
    props: UserRoleProps,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._userId = props.userId;
    this._roleId = props.roleId;
    this._isActive = props.isActive;
    this._reason = props.reason;
    this._assignedBy = props.assignedBy;
    this._assignedAt = props.assignedAt || new Date();
    this._expiresAt = props.expiresAt;
    this._config = props.config ? { ...props.config } : undefined;
    this.validate();
  }

  /**
   * 获取用户ID
   *
   * @returns 用户ID
   */
  get userId(): UserId {
    return this._userId;
  }

  /**
   * 获取角色ID
   *
   * @returns 角色ID
   */
  get roleId(): EntityId {
    return this._roleId;
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
   * 获取分配原因
   *
   * @returns 分配原因
   */
  get reason(): string | undefined {
    return this._reason;
  }

  /**
   * 获取分配者ID
   *
   * @returns 分配者ID
   */
  get assignedBy(): UserId | undefined {
    return this._assignedBy;
  }

  /**
   * 获取分配时间
   *
   * @returns 分配时间
   */
  get assignedAt(): Date | undefined {
    return this._assignedAt;
  }

  /**
   * 获取过期时间
   *
   * @returns 过期时间
   */
  get expiresAt(): Date | undefined {
    return this._expiresAt;
  }

  /**
   * 获取关联配置
   *
   * @returns 关联配置
   */
  get config(): Record<string, any> | undefined {
    return this._config ? { ...this._config } : undefined;
  }

  /**
   * 激活关联
   */
  activate(): void {
    if (this._isActive) {
      throw new DomainStateException(
        "用户角色关联已激活",
        "active",
        "activate",
        {
          userRoleId: this.id.toString(),
          isActive: this._isActive,
        },
      );
    }
    this._isActive = true;
    this.updateTimestamp();
    this.logOperation("activate");
  }

  /**
   * 停用关联
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new DomainStateException(
        "用户角色关联已停用",
        "inactive",
        "deactivate",
        {
          userRoleId: this.id.toString(),
          isActive: this._isActive,
        },
      );
    }
    this._isActive = false;
    this.updateTimestamp();
    this.logOperation("deactivate");
  }

  /**
   * 更新分配原因
   *
   * @param reason - 新的分配原因
   */
  updateReason(reason: string): void {
    this.validateReason(reason);
    this._reason = reason.trim();
    this.updateTimestamp();
    this.logOperation("updateReason", { reason: this._reason });
  }

  /**
   * 设置过期时间
   *
   * @param expiresAt - 过期时间
   */
  setExpiration(expiresAt: Date): void {
    this.validateExpiration(expiresAt);
    this._expiresAt = expiresAt;
    this.updateTimestamp();
    this.logOperation("setExpiration", { expiresAt: expiresAt.toISOString() });
  }

  /**
   * 移除过期时间
   */
  removeExpiration(): void {
    this._expiresAt = undefined;
    this.updateTimestamp();
    this.logOperation("removeExpiration");
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
   * 检查是否过期
   *
   * @returns 是否过期
   */
  isExpired(): boolean {
    if (!this._expiresAt) {
      return false;
    }
    return new Date() > this._expiresAt;
  }

  /**
   * 检查是否有效
   *
   * @returns 是否有效
   */
  isValid(): boolean {
    return this._isActive && !this.isExpired();
  }

  /**
   * 检查是否可以管理
   *
   * @param managerUserId - 管理者用户ID
   * @returns 是否可以管理
   */
  canBeManagedBy(managerUserId: UserId): boolean {
    // 系统管理员可以管理所有关联
    if (this._assignedBy?.equals(managerUserId)) {
      return true;
    }
    // 其他业务规则可以在这里添加
    return false;
  }

  /**
   * 获取关联描述
   *
   * @returns 关联描述
   */
  getAssociationDescription(): string {
    const status = this.isValid() ? "有效" : "无效";
    const expiration = this._expiresAt
      ? `，过期时间：${this._expiresAt.toISOString()}`
      : "";
    return `用户角色关联（${status}${expiration}）`;
  }

  /**
   * 验证用户角色关联
   *
   * @protected
   */
  protected override validate(): void {
    super.validate();
    this.validateUserId(this._userId);
    this.validateRoleId(this._roleId);
    this.validateReason(this._reason);
    this.validateExpiration(this._expiresAt);
  }

  /**
   * 验证用户ID
   *
   * @param userId - 用户ID
   * @private
   */
  private validateUserId(userId: UserId): void {
    if (!userId) {
      throw new BusinessRuleViolationException(
        "用户ID不能为空",
        "VALIDATION_FAILED",
      );
    }
  }

  /**
   * 验证角色ID
   *
   * @param roleId - 角色ID
   * @private
   */
  private validateRoleId(roleId: EntityId): void {
    if (!roleId) {
      throw new BusinessRuleViolationException(
        "角色ID不能为空",
        "VALIDATION_FAILED",
      );
    }
  }

  /**
   * 验证分配原因
   *
   * @param reason - 分配原因
   * @private
   */
  private validateReason(reason?: string): void {
    if (reason && reason.trim().length > 500) {
      throw new BusinessRuleViolationException(
        "分配原因长度不能超过500字符",
        "VALIDATION_FAILED",
      );
    }
  }

  /**
   * 验证过期时间
   *
   * @param expiresAt - 过期时间
   * @private
   */
  private validateExpiration(expiresAt?: Date): void {
    if (expiresAt && expiresAt <= new Date()) {
      throw new BusinessRuleViolationException(
        "过期时间必须是未来时间",
        "VALIDATION_FAILED",
      );
    }
  }
}
