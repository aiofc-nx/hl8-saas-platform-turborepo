/**
 * 用户相关常量
 *
 * @description 定义用户管理相关的业务常量
 *
 * @since 1.0.0
 */

export const USER_LIMITS = {
  MAX_USERNAME_LENGTH: 50,
  MIN_USERNAME_LENGTH: 3,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,
  MAX_FULLNAME_LENGTH: 100,
  MAX_NICKNAME_LENGTH: 50,
  MAX_BIO_LENGTH: 500,
} as const;

export const USER_STATUS_TRANSITIONS = {
  PENDING: ["ACTIVE", "DISABLED", "DELETED"],
  ACTIVE: ["DISABLED", "LOCKED", "EXPIRED", "DELETED"],
  DISABLED: ["ACTIVE", "DELETED"],
  LOCKED: ["ACTIVE", "DISABLED", "DELETED"],
  EXPIRED: ["ACTIVE", "DISABLED", "DELETED"],
  DELETED: [],
} as const;

export const USER_LOGIN_ATTEMPTS = {
  MAX_ATTEMPTS: 5,
  LOCK_DURATION: 30, // minutes
} as const;

export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  SPECIAL_CHARS: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  HISTORY_COUNT: 5,
  EXPIRATION_DAYS: 90,
} as const;

export const USER_PROFILE_SETTINGS = {
  AVATAR_MAX_SIZE_MB: 5,
  AVATAR_SUPPORTED_FORMATS: ["jpg", "jpeg", "png", "gif", "webp"],
  AVATAR_SIZES: {
    SMALL: { width: 50, height: 50 },
    MEDIUM: { width: 100, height: 100 },
    LARGE: { width: 200, height: 200 },
  },
  DEFAULT_TIMEZONE: "Asia/Shanghai",
  DEFAULT_LANGUAGE: "zh-CN",
} as const;

export const USER_NOTIFICATION_SETTINGS = {
  EMAIL_VERIFICATION_REMINDER: true,
  PASSWORD_EXPIRATION_REMINDER: true,
  UNUSUAL_LOGIN_NOTIFICATION: true,
} as const;