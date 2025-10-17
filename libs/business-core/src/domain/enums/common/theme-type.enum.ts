/**
 * 主题类型枚举
 *
 * @description 定义系统中所有主题类型的枚举值
 *
 * ## 业务规则
 *
 * ### 主题类型规则
 * - 浅色主题：默认浅色主题
 * - 深色主题：深色主题
 * - 自动主题：根据系统设置自动切换
 * - 高对比度主题：高对比度主题，适合视觉障碍用户
 * - 自定义主题：用户自定义主题
 *
 * ### 主题切换规则
 * - 用户可以选择任意主题
 * - 自动主题会根据系统设置自动切换
 * - 高对比度主题优先考虑可访问性
 * - 自定义主题需要用户配置
 *
 * @example
 * ```typescript
 * import { ThemeType } from './theme-type.enum.js';
 *
 * // 检查主题类型
 * console.log(ThemeType.LIGHT); // "LIGHT"
 * console.log(ThemeTypeUtils.isLight(ThemeType.LIGHT)); // true
 * ```
 *
 * @since 1.0.0
 */
export enum ThemeType {
  /** 浅色主题 */
  LIGHT = "LIGHT",
  /** 深色主题 */
  DARK = "DARK",
  /** 自动主题 */
  AUTO = "AUTO",
  /** 高对比度主题 */
  HIGH_CONTRAST = "HIGH_CONTRAST",
  /** 自定义主题 */
  CUSTOM = "CUSTOM",
}

/**
 * 主题类型工具类
 *
 * @description 提供主题类型相关的工具方法
 */
export class ThemeTypeUtils {
  /**
   * 主题类型描述映射
   */
  private static readonly TYPE_DESCRIPTIONS: Record<ThemeType, string> = {
    [ThemeType.LIGHT]: "浅色主题",
    [ThemeType.DARK]: "深色主题",
    [ThemeType.AUTO]: "自动主题",
    [ThemeType.HIGH_CONTRAST]: "高对比度主题",
    [ThemeType.CUSTOM]: "自定义主题",
  };

  /**
   * 检查是否为浅色主题
   *
   * @param type - 主题类型
   * @returns 是否为浅色主题
   * @example
   * ```typescript
   * const isLight = ThemeTypeUtils.isLight(ThemeType.LIGHT);
   * console.log(isLight); // true
   * ```
   */
  static isLight(type: ThemeType): boolean {
    return type === ThemeType.LIGHT;
  }

  /**
   * 检查是否为深色主题
   *
   * @param type - 主题类型
   * @returns 是否为深色主题
   */
  static isDark(type: ThemeType): boolean {
    return type === ThemeType.DARK;
  }

  /**
   * 检查是否为自动主题
   *
   * @param type - 主题类型
   * @returns 是否为自动主题
   */
  static isAuto(type: ThemeType): boolean {
    return type === ThemeType.AUTO;
  }

  /**
   * 检查是否为高对比度主题
   *
   * @param type - 主题类型
   * @returns 是否为高对比度主题
   */
  static isHighContrast(type: ThemeType): boolean {
    return type === ThemeType.HIGH_CONTRAST;
  }

  /**
   * 检查是否为自定义主题
   *
   * @param type - 主题类型
   * @returns 是否为自定义主题
   */
  static isCustom(type: ThemeType): boolean {
    return type === ThemeType.CUSTOM;
  }

  /**
   * 检查是否为系统主题（浅色、深色、自动）
   *
   * @param type - 主题类型
   * @returns 是否为系统主题
   */
  static isSystemTheme(type: ThemeType): boolean {
    return [ThemeType.LIGHT, ThemeType.DARK, ThemeType.AUTO].includes(type);
  }

  /**
   * 检查是否为特殊主题（高对比度、自定义）
   *
   * @param type - 主题类型
   * @returns 是否为特殊主题
   */
  static isSpecialTheme(type: ThemeType): boolean {
    return [ThemeType.HIGH_CONTRAST, ThemeType.CUSTOM].includes(type);
  }

  /**
   * 获取主题类型描述
   *
   * @param type - 主题类型
   * @returns 主题类型描述
   */
  static getDescription(type: ThemeType): string {
    return this.TYPE_DESCRIPTIONS[type] || "未知主题类型";
  }

  /**
   * 获取所有主题类型
   *
   * @returns 所有主题类型数组
   */
  static getAllTypes(): ThemeType[] {
    return Object.values(ThemeType);
  }

  /**
   * 获取系统主题类型（浅色、深色、自动）
   *
   * @returns 系统主题类型数组
   */
  static getSystemTypes(): ThemeType[] {
    return [ThemeType.LIGHT, ThemeType.DARK, ThemeType.AUTO];
  }

  /**
   * 获取特殊主题类型（高对比度、自定义）
   *
   * @returns 特殊主题类型数组
   */
  static getSpecialTypes(): ThemeType[] {
    return [ThemeType.HIGH_CONTRAST, ThemeType.CUSTOM];
  }
}
