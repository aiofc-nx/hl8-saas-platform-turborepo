/**
 * 用户实体
 *
 * @description 表示系统中的用户，支持多租户、多角色、多权限的用户管理
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { BaseEntity } from "../base/base-entity.js";
import { UserStatus } from "../../value-objects/types/user-status.vo.js";
import { UserRole } from "../../value-objects/types/user-role.vo.js";
import type { IPureLogger } from "@hl8/pure-logger";
import type { IPartialAuditInfo } from "../base/audit-info.js";

/**
 * 用户实体属性接口
 *
 * @description 定义用户实体的基本属性
 */
export interface UserProps {
  /** 用户名 */
  username: string;
  
  /** 邮箱地址 */
  email: string;
  
  /** 手机号码 */
  phone?: string;
  
  /** 用户状态 */
  status: UserStatus;
  
  /** 用户角色 */
  role: UserRole;
  
  /** 用户姓名 */
  displayName: string;
  
  /** 头像URL */
  avatarUrl?: string;
  
  /** 用户描述 */
  description?: string;
  
  /** 是否启用 */
  isActive: boolean;
  
  /** 最后登录时间 */
  lastLoginAt?: Date;
  
  /** 最后登录IP */
  lastLoginIp?: string;
  
  /** 登录失败次数 */
  failedLoginAttempts: number;
  
  /** 账户锁定时间 */
  lockedAt?: Date;
  
  /** 账户锁定原因 */
  lockReason?: string;
}

/**
 * 用户实体
 *
 * @description 表示系统中的用户，支持多租户、多角色、多权限的用户管理
 *
 * ## 业务规则
 *
 * ### 用户创建规则
 * - 用户名在同一租户内必须唯一
 * - 邮箱地址在同一租户内必须唯一
 * - 用户名不能为空且长度不能超过50字符
 * - 邮箱地址必须符合邮箱格式
 * - 用户必须属于某个租户
 *
 * ### 用户状态规则
 * - 用户状态包括：激活、未激活、锁定、禁用
 * - 只有激活状态的用户才能登录
 * - 锁定状态的用户需要管理员解锁
 * - 禁用状态的用户不能进行任何操作
 *
 * ### 用户角色规则
 * - 用户必须有一个主要角色
 * - 用户可以拥有多个角色（通过角色分配）
 * - 角色决定了用户的基本权限
 *
 * ### 用户安全规则
 * - 连续登录失败超过5次将锁定账户
 * - 账户锁定时间最长24小时
 * - 用户密码必须符合安全策略
 *
 * @example
 * ```typescript
 * // 创建用户
 * const user = new User(
 *   EntityId.generate(),
 *   {
 *     username: 'zhangsan',
 *     email: 'zhangsan@example.com',
 *     status: UserStatus.ACTIVE,
 *     role: UserRole.USER,
 *     displayName: '张三',
 *     isActive: true,
 *     failedLoginAttempts: 0
 *   },
 *   { createdBy: 'admin' }
 * );
 *
 * // 更新用户信息
 * user.updateDisplayName('张三丰');
 * user.updateEmail('zhangsanfeng@example.com');
 *
 * // 锁定用户
 * user.lockAccount('多次登录失败');
 * ```
 *
 * @since 1.0.0
 */
export class User extends BaseEntity {
  private _username: string;
  private _email: string;
  private _phone?: string;
  private _status: UserStatus;
  private _role: UserRole;
  private _displayName: string;
  private _avatarUrl?: string;
  private _description?: string;
  private _isActive: boolean;
  private _lastLoginAt?: Date;
  private _lastLoginIp?: string;
  private _failedLoginAttempts: number;
  private _lockedAt?: Date;
  private _lockReason?: string;

  /**
   * 构造函数
   *
   * @param id - 用户标识符
   * @param props - 用户属性
   * @param audit - 审计信息
   * @param logger - 日志记录器
   */
  constructor(
    id: EntityId,
    props: UserProps,
    audit: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, audit, logger);
    this._username = props.username;
    this._email = props.email;
    this._phone = props.phone;
    this._status = props.status;
    this._role = props.role;
    this._displayName = props.displayName;
    this._avatarUrl = props.avatarUrl;
    this._description = props.description;
    this._isActive = props.isActive;
    this._lastLoginAt = props.lastLoginAt;
    this._lastLoginIp = props.lastLoginIp;
    this._failedLoginAttempts = props.failedLoginAttempts;
    this._lockedAt = props.lockedAt;
    this._lockReason = props.lockReason;
    this.validate();
  }

  /**
   * 获取用户名
   *
   * @returns 用户名
   */
  get username(): string {
    return this._username;
  }

  /**
   * 获取邮箱地址
   *
   * @returns 邮箱地址
   */
  get email(): string {
    return this._email;
  }

  /**
   * 获取手机号码
   *
   * @returns 手机号码
   */
  get phone(): string | undefined {
    return this._phone;
  }

  /**
   * 获取用户状态
   *
   * @returns 用户状态
   */
  get status(): UserStatus {
    return this._status;
  }

  /**
   * 获取用户角色
   *
   * @returns 用户角色
   */
  get role(): UserRole {
    return this._role;
  }

  /**
   * 获取用户姓名
   *
   * @returns 用户姓名
   */
  get displayName(): string {
    return this._displayName;
  }

  /**
   * 获取头像URL
   *
   * @returns 头像URL
   */
  get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  /**
   * 获取用户描述
   *
   * @returns 用户描述
   */
  get description(): string | undefined {
    return this._description;
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
   * 获取最后登录时间
   *
   * @returns 最后登录时间
   */
  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  /**
   * 获取最后登录IP
   *
   * @returns 最后登录IP
   */
  get lastLoginIp(): string | undefined {
    return this._lastLoginIp;
  }

  /**
   * 获取登录失败次数
   *
   * @returns 登录失败次数
   */
  get failedLoginAttempts(): number {
    return this._failedLoginAttempts;
  }

  /**
   * 获取账户锁定时间
   *
   * @returns 账户锁定时间
   */
  get lockedAt(): Date | undefined {
    return this._lockedAt;
  }

  /**
   * 获取账户锁定原因
   *
   * @returns 账户锁定原因
   */
  get lockReason(): string | undefined {
    return this._lockReason;
  }

  /**
   * 更新用户名
   *
   * @param username - 新用户名
   * @param updatedBy - 更新者
   */
  updateUsername(username: string, updatedBy: string): void {
    this.validateUsername(username);
    this._username = username.trim();
    this.updateTimestamp();
    this.logOperation("updateUsername", { username: this._username });
  }

  /**
   * 更新邮箱地址
   *
   * @param email - 新邮箱地址
   * @param updatedBy - 更新者
   */
  updateEmail(email: string, updatedBy: string): void {
    this.validateEmail(email);
    this._email = email.trim().toLowerCase();
    this.updateTimestamp();
    this.logOperation("updateEmail", { email: this._email });
  }

  /**
   * 更新手机号码
   *
   * @param phone - 新手机号码
   * @param updatedBy - 更新者
   */
  updatePhone(phone: string, updatedBy: string): void {
    this.validatePhone(phone);
    this._phone = phone.trim();
    this.updateTimestamp();
    this.logOperation("updatePhone", { phone: this._phone });
  }

  /**
   * 更新用户姓名
   *
   * @param displayName - 新用户姓名
   * @param updatedBy - 更新者
   */
  updateDisplayName(displayName: string, updatedBy: string): void {
    this.validateDisplayName(displayName);
    this._displayName = displayName.trim();
    this.updateTimestamp();
    this.logOperation("updateDisplayName", { displayName: this._displayName });
  }

  /**
   * 更新用户角色
   *
   * @param role - 新用户角色
   * @param updatedBy - 更新者
   */
  updateRole(role: UserRole, updatedBy: string): void {
    this.validateRole(role);
    this._role = role;
    this.updateTimestamp();
    this.logOperation("updateRole", { role: this._role.value });
  }

  /**
   * 更新用户状态
   *
   * @param status - 新用户状态
   * @param updatedBy - 更新者
   */
  updateStatus(status: UserStatus, updatedBy: string): void {
    this.validateStatus(status);
    this._status = status;
    this.updateTimestamp();
    this.logOperation("updateStatus", { status: this._status.value });
  }

  /**
   * 激活用户
   *
   * @param activatedBy - 激活者
   */
  activate(activatedBy: string): void {
    this._isActive = true;
    this._status = UserStatus.ACTIVE;
    this.updateTimestamp();
    this.logOperation("activate", { activatedBy });
  }

  /**
   * 停用用户
   *
   * @param deactivatedBy - 停用者
   * @param reason - 停用原因
   */
  deactivate(deactivatedBy: string, reason?: string): void {
    this._isActive = false;
    this._status = UserStatus.INACTIVE;
    this.updateTimestamp();
    this.logOperation("deactivate", { deactivatedBy, reason });
  }

  /**
   * 锁定账户
   *
   * @param lockedBy - 锁定者
   * @param reason - 锁定原因
   */
  lockAccount(lockedBy: string, reason: string): void {
    this._status = UserStatus.LOCKED;
    this._lockedAt = new Date();
    this._lockReason = reason;
    this.updateTimestamp();
    this.logOperation("lockAccount", { lockedBy, reason });
  }

  /**
   * 解锁账户
   *
   * @param unlockedBy - 解锁者
   */
  unlockAccount(unlockedBy: string): void {
    this._status = UserStatus.ACTIVE;
    this._lockedAt = undefined;
    this._lockReason = undefined;
    this._failedLoginAttempts = 0;
    this.updateTimestamp();
    this.logOperation("unlockAccount", { unlockedBy });
  }

  /**
   * 记录登录成功
   *
   * @param ip - 登录IP
   */
  recordLoginSuccess(ip: string): void {
    this._lastLoginAt = new Date();
    this._lastLoginIp = ip;
    this._failedLoginAttempts = 0;
    this.updateTimestamp();
    this.logOperation("recordLoginSuccess", { ip });
  }

  /**
   * 记录登录失败
   *
   * @param ip - 登录IP
   */
  recordLoginFailure(ip: string): void {
    this._failedLoginAttempts++;
    this.updateTimestamp();
    this.logOperation("recordLoginFailure", { 
      ip, 
      failedAttempts: this._failedLoginAttempts 
    });

    // 如果失败次数超过5次，锁定账户
    if (this._failedLoginAttempts >= 5) {
      this.lockAccount("system", "多次登录失败");
    }
  }

  /**
   * 检查用户是否可以登录
   *
   * @returns 是否可以登录
   */
  canLogin(): boolean {
    return this._isActive && 
           this._status === UserStatus.ACTIVE && 
           !this._lockedAt;
  }

  /**
   * 检查用户是否被锁定
   *
   * @returns 是否被锁定
   */
  isLocked(): boolean {
    return this._status === UserStatus.LOCKED || !!this._lockedAt;
  }

  /**
   * 检查用户是否激活
   *
   * @returns 是否激活
   */
  isActive(): boolean {
    return this._isActive && this._status === UserStatus.ACTIVE;
  }

  /**
   * 验证实体
   *
   * @protected
   */
  protected validate(): void {
    super.validate();
    this.validateUsername(this._username);
    this.validateEmail(this._email);
    this.validateDisplayName(this._displayName);
    this.validateStatus(this._status);
    this.validateRole(this._role);
  }

  /**
   * 验证用户名
   *
   * @param username - 用户名
   * @private
   */
  private validateUsername(username: string): void {
    if (!username || !username.trim()) {
      throw new Error("用户名不能为空");
    }
    if (username.trim().length > 50) {
      throw new Error("用户名长度不能超过50字符");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      throw new Error("用户名只能包含字母、数字和下划线");
    }
  }

  /**
   * 验证邮箱地址
   *
   * @param email - 邮箱地址
   * @private
   */
  private validateEmail(email: string): void {
    if (!email || !email.trim()) {
      throw new Error("邮箱地址不能为空");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("邮箱地址格式不正确");
    }
  }

  /**
   * 验证手机号码
   *
   * @param phone - 手机号码
   * @private
   */
  private validatePhone(phone: string): void {
    if (phone && phone.trim()) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone.trim())) {
        throw new Error("手机号码格式不正确");
      }
    }
  }

  /**
   * 验证用户姓名
   *
   * @param displayName - 用户姓名
   * @private
   */
  private validateDisplayName(displayName: string): void {
    if (!displayName || !displayName.trim()) {
      throw new Error("用户姓名不能为空");
    }
    if (displayName.trim().length > 100) {
      throw new Error("用户姓名长度不能超过100字符");
    }
  }

  /**
   * 验证用户状态
   *
   * @param status - 用户状态
   * @private
   */
  private validateStatus(status: UserStatus): void {
    if (!status) {
      throw new Error("用户状态不能为空");
    }
  }

  /**
   * 验证用户角色
   *
   * @param role - 用户角色
   * @private
   */
  private validateRole(role: UserRole): void {
    if (!role) {
      throw new Error("用户角色不能为空");
    }
  }
}
