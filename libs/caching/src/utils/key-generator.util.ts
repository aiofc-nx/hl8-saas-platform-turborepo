/**
 * 缓存键生成工具
 *
 * @description 提供缓存键的生成和清理功能
 *
 * ## 业务规则
 *
 * ### 键生成规则
 * - 使用冒号（:）分隔各部分
 * - 自动过滤空值
 * - 自动清理非法字符
 *
 * ### 字符清理规则
 * - 移除空格
 * - 移除换行符
 * - 移除控制字符
 * - 保留字母、数字、下划线、横线、冒号
 *
 * @example
 * ```typescript
 * // 生成缓存键
 * const key = generateKey(['user', 'profile', userId]);
 * // 结果: "user:profile:123"
 *
 * // 清理键
 * const cleanKey = sanitizeKey('user name: 123');
 * // 结果: "username:123"
 * ```
 *
 * @since 1.0.0
 */

/**
 * 生成缓存键
 *
 * @param parts - 键的各个部分
 * @returns 生成的缓存键
 *
 * @example
 * ```typescript
 * // 基础用法
 * const key = generateKey(['user', 'profile', '123']);
 * // 结果: "user:profile:123"
 *
 * // 自动过滤空值
 * const key2 = generateKey(['user', '', null, 'list']);
 * // 结果: "user:list"
 *
 * // 自动清理非法字符
 * const key3 = generateKey(['user name', 'profile @123']);
 * // 结果: "username:profile123"
 * ```
 */
export function generateKey(
  parts: (string | number | null | undefined)[],
): string {
  return parts
    .filter((part) => part !== null && part !== undefined && part !== '')
    .map((part) => sanitizeKey(String(part)))
    .join(':');
}

/**
 * 清理缓存键中的非法字符
 *
 * @param key - 要清理的键
 * @returns 清理后的键
 *
 * @example
 * ```typescript
 * // 移除空格和特殊字符
 * const clean1 = sanitizeKey('user name');
 * // 结果: "username"
 *
 * // 保留合法字符
 * const clean2 = sanitizeKey('user-profile_123');
 * // 结果: "user-profile_123"
 *
 * // 移除控制字符
 * const clean3 = sanitizeKey('user\nprofile\t123');
 * // 结果: "userprofile123"
 * ```
 */
export function sanitizeKey(key: string): string {
  return (
    key
      // 移除空格
      .replace(/\s+/g, '')
      // 移除换行符和制表符
      .replace(/[\r\n\t]/g, '')
      // 移除控制字符
      .replace(/[\x00-\x1F\x7F]/g, '')
      // 只保留字母、数字、下划线、横线、冒号
      .replace(/[^a-zA-Z0-9_:-]/g, '')
      // 移除连续的冒号
      .replace(/:+/g, ':')
      // 移除开头和结尾的冒号
      .replace(/^:+|:+$/g, '')
  );
}

/**
 * 验证缓存键是否有效
 *
 * @param key - 要验证的键
 * @returns 如果键有效返回 true
 *
 * @example
 * ```typescript
 * // 有效的键
 * isValidKey('user:profile:123'); // true
 * isValidKey('user-profile_123'); // true
 *
 * // 无效的键
 * isValidKey('');                 // false
 * isValidKey('  ');               // false
 * isValidKey('user name');        // false
 * isValidKey('user\nprofile');    // false
 * ```
 */
export function isValidKey(key: string): boolean {
  if (!key || key.trim() === '') {
    return false;
  }

  // 检查是否只包含合法字符
  return /^[a-zA-Z0-9_:-]+$/.test(key);
}

/**
 * 生成模式匹配键
 *
 * @param prefix - 键前缀
 * @param pattern - 匹配模式（* 表示通配符）
 * @returns 模式匹配键
 *
 * @example
 * ```typescript
 * // 匹配所有用户缓存
 * const pattern1 = generatePattern('cache', 'user:*');
 * // 结果: "cache:user:*"
 *
 * // 匹配特定租户的所有缓存
 * const pattern2 = generatePattern('cache', `tenant:${tenantId}:*`);
 * // 结果: "cache:tenant:123:*"
 * ```
 */
export function generatePattern(prefix: string, pattern: string): string {
  const parts = [prefix, pattern].filter(Boolean);
  return parts.join(':');
}
