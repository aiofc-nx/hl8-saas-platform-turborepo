/**
 * 用户相关常量
 *
 * @description 定义用户领域相关的常量和配置
 *
 * @since 1.0.0
 */

import { UserStatus } from '../domain/user/value-objects/user-status.enum.js';

/**
 * 用户状态转换规则
 *
 * @description 定义允许的状态转换规则
 */
export const USER_STATUS_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  [UserStatus.PENDING]: [
    UserStatus.ACTIVE,    // 激活
    UserStatus.DISABLED,  // 禁用
    UserStatus.DELETED,   // 删除
  ],
  [UserStatus.ACTIVE]: [
    UserStatus.DISABLED,  // 禁用
    UserStatus.LOCKED,    // 锁定
    UserStatus.EXPIRED,   // 过期
    UserStatus.DELETED,   // 删除
  ],
  [UserStatus.DISABLED]: [
    UserStatus.ACTIVE,    // 启用
    UserStatus.DELETED,   // 删除
  ],
  [UserStatus.LOCKED]: [
    UserStatus.ACTIVE,    // 解锁
    UserStatus.DISABLED,  // 禁用
    UserStatus.DELETED,   // 删除
  ],
  [UserStatus.EXPIRED]: [
    UserStatus.ACTIVE,    // 重新激活
    UserStatus.DISABLED,  // 禁用
    UserStatus.DELETED,   // 删除
  ],
  [UserStatus.DELETED]: [
    // 已删除状态不能转换到其他状态
  ],
};

/**
 * 用户登录失败次数限制
 */
export const USER_LOGIN_ATTEMPTS = {
  /** 最大登录失败次数 */
  MAX_ATTEMPTS: 5,
  /** 锁定时间（分钟） */
  LOCK_DURATION: 30,
  /** 重置失败次数的时间间隔（分钟） */
  RESET_INTERVAL: 15,
} as const;

/**
 * 用户会话配置
 */
export const USER_SESSION = {
  /** 会话超时时间（小时） */
  TIMEOUT_HOURS: 24,
  /** 记住我功能超时时间（天） */
  REMEMBER_ME_DAYS: 30,
  /** 最大并发会话数 */
  MAX_CONCURRENT_SESSIONS: 3,
} as const;

/**
 * 用户密码策略
 */
export const USER_PASSWORD_POLICY = {
  /** 最小长度 */
  MIN_LENGTH: 8,
  /** 最大长度 */
  MAX_LENGTH: 128,
  /** 必须包含大写字母 */
  REQUIRE_UPPERCASE: true,
  /** 必须包含小写字母 */
  REQUIRE_LOWERCASE: true,
  /** 必须包含数字 */
  REQUIRE_NUMBERS: true,
  /** 必须包含特殊字符 */
  REQUIRE_SPECIAL_CHARS: true,
  /** 特殊字符集合 */
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  /** 密码历史记录数量 */
  HISTORY_COUNT: 5,
} as const;

/**
 * 用户邮箱验证配置
 */
export const USER_EMAIL_VERIFICATION = {
  /** 验证码有效期（分钟） */
  CODE_EXPIRY_MINUTES: 15,
  /** 验证码长度 */
  CODE_LENGTH: 6,
  /** 重发验证码间隔（秒） */
  RESEND_INTERVAL_SECONDS: 60,
  /** 最大重发次数 */
  MAX_RESEND_ATTEMPTS: 3,
} as const;

/**
 * 用户手机验证配置
 */
export const USER_PHONE_VERIFICATION = {
  /** 验证码有效期（分钟） */
  CODE_EXPIRY_MINUTES: 5,
  /** 验证码长度 */
  CODE_LENGTH: 6,
  /** 重发验证码间隔（秒） */
  RESEND_INTERVAL_SECONDS: 60,
  /** 最大重发次数 */
  MAX_RESEND_ATTEMPTS: 3,
} as const;

/**
 * 用户资料配置
 */
export const USER_PROFILE = {
  /** 头像最大文件大小（MB） */
  AVATAR_MAX_SIZE_MB: 5,
  /** 支持的头像格式 */
  AVATAR_SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  /** 头像尺寸 */
  AVATAR_SIZES: {
    SMALL: { width: 64, height: 64 },
    MEDIUM: { width: 128, height: 128 },
    LARGE: { width: 256, height: 256 },
  },
} as const;

/**
 * 用户通知配置
 */
export const USER_NOTIFICATIONS = {
  /** 登录通知 */
  LOGIN_NOTIFICATION: true,
  /** 密码变更通知 */
  PASSWORD_CHANGE_NOTIFICATION: true,
  /** 邮箱变更通知 */
  EMAIL_CHANGE_NOTIFICATION: true,
  /** 手机变更通知 */
  PHONE_CHANGE_NOTIFICATION: true,
  /** 账户锁定通知 */
  ACCOUNT_LOCKED_NOTIFICATION: true,
  /** 异常登录通知 */
  UNUSUAL_LOGIN_NOTIFICATION: true,
} as const;