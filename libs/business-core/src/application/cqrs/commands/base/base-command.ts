/**
 * 基础命令抽象类
 *
 * @description 为所有命令对象提供一个基础结构，包含命令名称和描述。
 *
 * ## 业务规则
 *
 * ### 命令设计规则
 * - 命令表示用户的意图，不包含业务逻辑
 * - 命令应该是不可变的，创建后不能修改
 * - 命令应该包含执行命令所需的所有信息
 * - 命令应该支持序列化和反序列化
 *
 * ### 命令验证规则
 * - 命令创建时应该验证必要参数
 * - 命令参数应该符合业务规则
 * - 命令参数应该进行类型检查
 *
 * @example
 * ```typescript
 * // 创建用户命令
 * class CreateUserCommand extends BaseCommand {
 *   constructor(
 *     public readonly username: string,
 *     public readonly email: string
 *   ) {
 *     super("CreateUserCommand", "创建用户命令");
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

/**
 * 基础命令抽象类
 *
 * @description 为所有命令对象提供一个基础结构，包含命令名称和描述。
 */
export abstract class BaseCommand {
  /**
   * 命令名称
   */
  public readonly commandName: string;

  /**
   * 命令描述
   */
  public readonly description: string;

  /**
   * 命令ID
   */
  public readonly id: string;

  /**
   * 创建时间
   */
  public readonly createdAt: Date;

  constructor(commandName: string, description: string) {
    this.commandName = commandName;
    this.description = description;
    this.id = this.generateId();
    this.createdAt = new Date();
  }

  /**
   * 生成命令ID
   *
   * @returns 命令ID
   * @private
   */
  private generateId(): string {
    return `${this.commandName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 转换为JSON
   *
   * @returns JSON对象
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      commandName: this.commandName,
      description: this.description,
      createdAt: this.createdAt,
    };
  }
}