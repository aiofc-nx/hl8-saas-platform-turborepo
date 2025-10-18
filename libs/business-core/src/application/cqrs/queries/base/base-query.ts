/**
 * 基础查询类
 *
 * @description 所有查询的基类，提供查询的基本属性和方法
 *
 * @since 1.0.0
 */

/**
 * 基础查询类
 *
 * @description 所有查询的基类，提供查询的基本属性和方法
 */
export abstract class BaseQuery {
  /** 查询名称 */
  readonly name: string;

  /** 查询描述 */
  readonly description: string;

  /** 查询ID */
  readonly id: string;

  /** 创建时间 */
  readonly createdAt: Date;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
    this.id = this.generateId();
    this.createdAt = new Date();
  }

  /**
   * 生成查询ID
   *
   * @returns 查询ID
   * @private
   */
  private generateId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
