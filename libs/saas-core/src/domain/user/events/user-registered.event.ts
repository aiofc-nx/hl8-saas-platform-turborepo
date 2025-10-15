/**
 * 用户注册事件
 *
 * @description 当新用户注册时发布的领域事件
 *
 * ## 业务规则
 *
 * ### 事件触发时机
 * - 用户聚合根创建完成后
 * - 用户档案创建完成后
 * - 初始密码设置完成后
 *
 * ### 事件内容
 * - 用户基本信息
 * - 注册方式和来源
 * - 租户信息
 * - 注册验证状态
 *
 * @example
 * ```typescript
 * const event = new UserRegisteredEvent(
 *   userId,
 *   tenantId,
 *   'john@example.com',
 *   'email'
 * );
 * ```
 *
 * @class UserRegisteredEvent
 * @since 1.0.0
 */

import { BaseDomainEvent } from "@hl8/hybrid-archi";
import { EntityId } from "@hl8/isolation-model";

export interface UserRegisteredEventData {
  userId: string;
  tenantId: string;
  email: string;
  username: string;
  registrationMethod: "email" | "sso" | "invitation" | "admin";
  registrationSource?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  registrationTime: string;
  invitedBy?: string;
  initialRole?: string;
}

export class UserRegisteredEvent extends BaseDomainEvent {
  private readonly _data: UserRegisteredEventData;

  constructor(
    userId: EntityId,
    tenantId: EntityId,
    email: string,
    username: string,
    registrationMethod: "email" | "sso" | "invitation" | "admin" = "email",
    registrationSource?: string,
    invitedBy?: string,
    initialRole?: string,
  ) {
    super(userId, 1, tenantId);
    this._data = {
      userId: userId.toString(),
      tenantId: tenantId.toString(),
      email,
      username,
      registrationMethod,
      registrationSource,
      isEmailVerified: registrationMethod === "sso" || registrationMethod === "admin",
      isPhoneVerified: false,
      registrationTime: new Date().toISOString(),
      invitedBy,
      initialRole,
    };
  }

  get eventType(): string {
    return "UserRegistered";
  }

  get data(): UserRegisteredEventData {
    return this._data;
  }

  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId.toString(),
      eventType: this.eventType,
      aggregateId: this.aggregateId.toString(),
      aggregateVersion: this.aggregateVersion,
      tenantId: this.tenantId.toString(),
      occurredAt: this.occurredAt.toISOString(),
      eventVersion: this.eventVersion,
      data: this._data,
    };
  }

  getUserId(): string {
    return this.data.userId;
  }

  getTenantId(): string {
    return this.data.tenantId;
  }

  getEmail(): string {
    return this.data.email;
  }

  getUsername(): string {
    return this.data.username;
  }

  getRegistrationMethod(): string {
    return this.data.registrationMethod;
  }

  getRegistrationSource(): string | undefined {
    return this.data.registrationSource;
  }

  isEmailVerified(): boolean {
    return this.data.isEmailVerified;
  }

  isPhoneVerified(): boolean {
    return this.data.isPhoneVerified;
  }

  getRegistrationTime(): string {
    return this.data.registrationTime;
  }

  getInvitedBy(): string | undefined {
    return this.data.invitedBy;
  }

  getInitialRole(): string | undefined {
    return this.data.initialRole;
  }
}