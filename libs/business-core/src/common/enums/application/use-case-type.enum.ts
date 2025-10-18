/**
 * 用例类型枚举
 *
 * @description 定义用例的类型，用于区分命令用例和查询用例
 * @since 1.0.0
 */

/**
 * 用例类型枚举
 *
 * @description 用例类型决定了执行策略和优化方式
 * - COMMAND: 状态变更操作，需要事务和事件发布
 * - QUERY: 数据检索操作，只读且可缓存
 */
export enum UseCaseType {
  /** 命令用例 - 处理状态变更操作 */
  COMMAND = "command",
  /** 查询用例 - 处理数据检索操作 */
  QUERY = "query",
}

/**
 * 用例类型工具类
 *
 * @description 提供用例类型的工具方法
 */
export class UseCaseTypeUtils {
  /**
   * 检查是否为命令用例
   *
   * @param type - 用例类型
   * @returns 如果是命令用例返回true，否则返回false
   */
  static isCommand(type: UseCaseType | string): boolean {
    return type === UseCaseType.COMMAND || type === "command";
  }

  /**
   * 检查是否为查询用例
   *
   * @param type - 用例类型
   * @returns 如果是查询用例返回true，否则返回false
   */
  static isQuery(type: UseCaseType | string): boolean {
    return type === UseCaseType.QUERY || type === "query";
  }

  /**
   * 获取用例类型描述
   *
   * @param type - 用例类型
   * @returns 用例类型描述
   */
  static getDescription(type: UseCaseType | string): string {
    switch (type) {
      case UseCaseType.COMMAND:
      case "command":
        return "命令用例 - 处理状态变更操作";
      case UseCaseType.QUERY:
      case "query":
        return "查询用例 - 处理数据检索操作";
      default:
        return "未知用例类型";
    }
  }

  /**
   * 获取所有用例类型
   *
   * @returns 所有用例类型数组
   */
  static getAllTypes(): UseCaseType[] {
    return [UseCaseType.COMMAND, UseCaseType.QUERY];
  }

  /**
   * 验证用例类型是否有效
   *
   * @param type - 用例类型
   * @returns 如果有效返回true，否则返回false
   */
  static isValid(type: string): boolean {
    return Object.values(UseCaseType).includes(type as UseCaseType);
  }
}
