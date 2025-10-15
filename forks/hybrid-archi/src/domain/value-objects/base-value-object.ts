/**
 * 基础值对象抽象类
 *
 * @description 所有值对象的基类，提供统一的 API 和验证辅助方法
 *
 * ## 核心特性
 *
 * - 泛型类型支持
 * - 自动提供 value 属性
 * - 自动提供静态 create 方法
 * - 丰富的验证辅助方法
 * - 不可变性保证
 *
 * ## 业务规则
 *
 * ### 不可变性规则
 * - 值对象一旦创建，其值不可变更
 * - 所有修改操作都应返回新的值对象实例
 * - 值对象不包含业务标识符
 *
 * ### 相等性规则
 * - 值对象的相等性基于其内部值
 * - 相同类型且相同值的值对象被视为相等
 * - null 和 undefined 与任何值对象都不相等
 *
 * ### 验证规则
 * - 值对象创建时必须通过所有验证规则
 * - 验证失败时应抛出 Error
 * - 验证逻辑应该封装在 validate 方法中
 *
 * @template T 值对象包装的值的类型
 *
 * @example
 * ```typescript
 * export class Email extends BaseValueObject<string> {
 *   protected validate(value: string): void {
 *     this.validateNotEmpty(value, '邮箱');
 *     this.validatePattern(value, /^.+@.+\..+$/, '邮箱格式不正确');
 *   }
 *
 *   protected transform(value: string): string {
 *     return value.toLowerCase().trim();
 *   }
 * }
 *
 * // 使用（简洁的 API）
 * const email = Email.create('Test@Example.com');
 * console.log(email.value); // 'test@example.com'
 * ```
 *
 * @since 1.0.0
 * @updated 1.1.0 - 完全重构为泛型 API，不再向后兼容
 */

export abstract class BaseValueObject<T> {
  /**
   * 值对象的内部值
   *
   * @protected
   * @readonly
   */
  protected readonly _value: T;

  /**
   * 构造函数
   *
   * @param value 值对象的值
   */
  constructor(value: T) {
    this.validate(value);
    this._value = this.transform(value);
  }

  // ============================================================================
  // 公共 API
  // ============================================================================

  /**
   * 获取值对象的值
   *
   * @returns {T} 值对象的值
   *
   * @example
   * ```typescript
   * const email = Email.create('test@example.com');
   * console.log(email.value); // 'test@example.com'
   * ```
   */
  get value(): T {
    return this._value;
  }

  /**
   * 静态工厂方法
   *
   * @description 创建值对象实例的推荐方式
   *
   * @template V 值对象类型
   * @param value 值对象的值
   * @returns {V} 值对象实例
   *
   * @example
   * ```typescript
   * const email = Email.create('test@example.com');
   * const code = TenantCode.create('acme2024');
   * ```
   */
  static create<V extends BaseValueObject<any>>(
    this: new (value: any) => V,
    value: any,
  ): V {
    return new this(value);
  }

  // ============================================================================
  // 验证和转换
  // ============================================================================

  /**
   * 验证规则（子类必须实现）
   *
   * @description 在构造函数中自动调用
   *
   * @protected
   * @abstract
   * @param value 要验证的值
   * @throws {Error} 验证失败时抛出
   *
   * @example
   * ```typescript
   * protected validate(value: string): void {
   *   this.validateNotEmpty(value, '邮箱');
   *   this.validatePattern(value, /^.+@.+$/, '邮箱格式不正确');
   * }
   * ```
   */
  protected abstract validate(value: T): void;

  /**
   * 转换规则（子类可选实现）
   *
   * @description 在验证通过后对值进行转换（如 trim、toLowerCase 等）
   *
   * @protected
   * @param value 要转换的值
   * @returns {T} 转换后的值
   *
   * @example
   * ```typescript
   * protected transform(value: string): string {
   *   return value.toLowerCase().trim();
   * }
   * ```
   */
  protected transform(value: T): T {
    return value;
  }

  // ============================================================================
  // 验证辅助方法
  // ============================================================================

  /**
   * 验证字符串长度
   *
   * @protected
   * @param value 要验证的字符串
   * @param min 最小长度
   * @param max 最大长度
   * @param fieldName 字段名称（用于错误消息）
   * @throws {Error} 长度不符合要求时抛出
   *
   * @example
   * ```typescript
   * this.validateLength(value, 3, 20, '租户代码');
   * ```
   */
  protected validateLength(
    value: string,
    min: number,
    max: number,
    fieldName = "值",
  ): void {
    if (value.length < min || value.length > max) {
      throw new Error(
        `${fieldName}长度必须在${min}-${max}个字符之间，当前长度：${value.length}`,
      );
    }
  }

  /**
   * 验证正则表达式
   *
   * @protected
   * @param value 要验证的字符串
   * @param pattern 正则表达式
   * @param message 错误消息
   * @throws {Error} 不匹配时抛出
   *
   * @example
   * ```typescript
   * this.validatePattern(
   *   value,
   *   /^[a-z0-9-]+$/,
   *   '只能包含小写字母、数字和连字符'
   * );
   * ```
   */
  protected validatePattern(
    value: string,
    pattern: RegExp,
    message: string,
  ): void {
    if (!pattern.test(value)) {
      throw new Error(message);
    }
  }

  /**
   * 验证非空
   *
   * @protected
   * @param value 要验证的值
   * @param fieldName 字段名称（用于错误消息）
   * @throws {Error} 为空时抛出
   *
   * @example
   * ```typescript
   * this.validateNotEmpty(value, '用户名');
   * ```
   */
  protected validateNotEmpty(
    value: string | any[] | null | undefined,
    fieldName = "值",
  ): void {
    if (value === null || value === undefined || value.length === 0) {
      throw new Error(`${fieldName}不能为空`);
    }
  }

  /**
   * 验证数值范围
   *
   * @protected
   * @param value 要验证的数值
   * @param min 最小值
   * @param max 最大值
   * @param fieldName 字段名称（用于错误消息）
   * @throws {Error} 超出范围时抛出
   *
   * @example
   * ```typescript
   * this.validateRange(level, 1, 10, '部门级别');
   * ```
   */
  protected validateRange(
    value: number,
    min: number,
    max: number,
    fieldName = "值",
  ): void {
    if (value < min || value > max) {
      throw new Error(`${fieldName}必须在${min}-${max}之间，当前值：${value}`);
    }
  }

  /**
   * 验证是否为整数
   *
   * @protected
   * @param value 要验证的数值
   * @param fieldName 字段名称（用于错误消息）
   * @throws {Error} 不是整数时抛出
   *
   * @example
   * ```typescript
   * this.validateInteger(count, '用户数量');
   * ```
   */
  protected validateInteger(value: number, fieldName = "值"): void {
    if (!Number.isInteger(value)) {
      throw new Error(`${fieldName}必须是整数`);
    }
  }

  /**
   * 验证是否为正数
   *
   * @protected
   * @param value 要验证的数值
   * @param fieldName 字段名称（用于错误消息）
   * @throws {Error} 不是正数时抛出
   *
   * @example
   * ```typescript
   * this.validatePositive(amount, '金额');
   * ```
   */
  protected validatePositive(value: number, fieldName = "值"): void {
    if (value <= 0) {
      throw new Error(`${fieldName}必须是正数`);
    }
  }

  /**
   * 验证枚举值
   *
   * @protected
   * @param value 要验证的值
   * @param allowedValues 允许的值列表
   * @param fieldName 字段名称（用于错误消息）
   * @throws {Error} 不在允许值列表中时抛出
   *
   * @example
   * ```typescript
   * this.validateEnum(status, ['ACTIVE', 'INACTIVE'], '状态');
   * ```
   */
  protected validateEnum<V>(
    value: V,
    allowedValues: V[],
    fieldName = "值",
  ): void {
    if (!allowedValues.includes(value)) {
      throw new Error(
        `${fieldName}必须是以下值之一：${allowedValues.join(", ")}`,
      );
    }
  }

  // ============================================================================
  // 相等性和比较
  // ============================================================================

  /**
   * 检查两个值对象是否相等
   *
   * @param other 要比较的另一个值对象
   * @returns {boolean} 是否相等
   *
   * @example
   * ```typescript
   * const email1 = Email.create('test@example.com');
   * const email2 = Email.create('test@example.com');
   * console.log(email1.equals(email2)); // true
   * ```
   */
  public equals(other: BaseValueObject<T> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (!(other instanceof this.constructor)) {
      return false;
    }

    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }

  /**
   * 比较两个值对象的大小
   *
   * @param other 要比较的另一个值对象
   * @returns {number} 比较结果：-1 表示小于，0 表示等于，1 表示大于
   *
   * @example
   * ```typescript
   * const level1 = Level.create(5);
   * const level2 = Level.create(3);
   * console.log(level1.compareTo(level2)); // 1
   * ```
   */
  public compareTo(other: BaseValueObject<T>): number {
    if (other === null || other === undefined) {
      return 1;
    }

    if (this._value < other._value) {
      return -1;
    }
    if (this._value > other._value) {
      return 1;
    }
    return 0;
  }

  // ============================================================================
  // 序列化
  // ============================================================================

  /**
   * 将值对象转换为字符串
   *
   * @returns {string} 字符串表示
   */
  public toString(): string {
    return String(this._value);
  }

  /**
   * 将值对象转换为 JSON
   *
   * @returns JSON 表示
   */
  public toJSON(): T | Record<string, unknown> {
    if (typeof this._value === "object" && this._value !== null) {
      return this._value as Record<string, unknown>;
    }
    return this._value;
  }

  /**
   * 获取哈希码
   *
   * @returns {string} 哈希码
   */
  public getHashCode(): string {
    return `${this.constructor.name}:${JSON.stringify(this._value)}`;
  }

  /**
   * 检查值对象是否为空
   *
   * @returns {boolean} 是否为空
   */
  public isEmpty(): boolean {
    if (this._value === null || this._value === undefined) {
      return true;
    }
    if (typeof this._value === "string" && this._value.length === 0) {
      return true;
    }
    if (Array.isArray(this._value) && this._value.length === 0) {
      return true;
    }
    return false;
  }
}
