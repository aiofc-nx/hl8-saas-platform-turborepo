/**
 * 用户登录事件
 *
 * @description 当用户成功登录时发布的领域事件
 *
 * ## 业务规则
 *
 * ### 事件触发时机
 * - 用户身份验证成功后
 * - 登录记录更新完成后
 * - 会话创建完成后
 *
 * ### 事件内容
 * - 用户基本信息
 * - 登录时间和位置
 * - 登录方式和设备
 * - 会话信息
 *
 * @example
 * ```typescript
 * const event = new UserLoginEvent(
 *   userId,
 *   '192.168.1.100',
 *   'web',
 *   'Chrome/91.0'
 * );
 * ```
 *
 * @class UserLoginEvent
 * @since 1.0.0
 */

import { DomainEvent } from "@hl8/hybrid-archi";
import { EntityId } from "@hl8/isolation-model";

export interface UserLoginEventData {
  userId: string;
  tenantId: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  loginMethod: "password" | "sso" | "oauth" | "mfa";
  deviceInfo?: {
    type: "desktop" | "mobile" | "tablet";
    os: string;
    browser: string;
  };
  sessionId: string;
  isFirstLogin: boolean;
}

export class UserLoginEvent extends DomainEvent<UserLoginEventData> {
  constructor(
    userId: EntityId,
    tenantId: EntityId,
    ipAddress: string,
    userAgent: string,
    loginMethod: "password" | "sso" | "oauth" | "mfa" = "password",
    sessionId: string,
    isFirstLogin: boolean = false,
    deviceInfo?: {
      type: "desktop" | "mobile" | "tablet";
      os: string;
      browser: string;
    },
  ) {
    super("UserLogin", {
      userId: userId.toString(),
      tenantId: tenantId.toString(),
      loginTime: new Date().toISOString(),
      ipAddress,
      userAgent,
      loginMethod,
      deviceInfo,
      sessionId,
      isFirstLogin,
    });
  }

  getUserId(): string {
    return this.data.userId;
  }

  getTenantId(): string {
    return this.data.tenantId;
  }

  getLoginTime(): string {
    return this.data.loginTime;
  }

  getIpAddress(): string {
    return this.data.ipAddress;
  }

  getUserAgent(): string {
    return this.data.userAgent;
  }

  getLoginMethod(): string {
    return this.data.loginMethod;
  }

  getDeviceInfo() {
    return this.data.deviceInfo;
  }

  getSessionId(): string {
    return this.data.sessionId;
  }

  isFirstLogin(): boolean {
    return this.data.isFirstLogin;
  }
}