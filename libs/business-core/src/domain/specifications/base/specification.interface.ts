/**
 * 规范接口
 *
 * @description 定义规范模式的基础接口，用于表达业务规则和约束
 * @since 1.0.0
 */

/**
 * 规范接口
 *
 * @description 定义规范模式的基础接口，用于表达业务规则和约束
 * 规范模式是领域驱动设计中的重要模式，用于封装业务规则和约束
 *
 * ## 业务规则
 *
 * ### 规范模式原则
 * - 单一职责：每个规范只负责一个业务规则
 * - 可组合性：规范可以组合成复杂的业务规则
 * - 可重用性：规范可以在不同的上下文中重用
 * - 可测试性：规范可以独立测试
 *
 * ### 业务逻辑表达
 * - 业务规则封装：将业务规则封装在规范中
 * - 业务约束表达：通过规范表达业务约束
 * - 业务逻辑组合：通过规范组合表达复杂业务逻辑
 * - 业务规则验证：通过规范验证业务规则
 *
 * @template T 规范适用的类型
 */
export interface ISpecification<T> {
  /**
   * 检查候选对象是否满足规范
   *
   * @description 检查候选对象是否满足规范的要求
   * @param candidate - 候选对象
   * @returns 是否满足规范
   */
  isSatisfiedBy(candidate: T): boolean;

  /**
   * 与操作
   *
   * @description 创建与规范，两个规范都必须满足
   * @param specification - 另一个规范
   * @returns 与规范
   */
  and(specification: ISpecification<T>): ISpecification<T>;

  /**
   * 或操作
   *
   * @description 创建或规范，两个规范中至少一个满足
   * @param specification - 另一个规范
   * @returns 或规范
   */
  or(specification: ISpecification<T>): ISpecification<T>;

  /**
   * 非操作
   *
   * @description 创建非规范，原规范的否定
   * @returns 非规范
   */
  not(): ISpecification<T>;

  /**
   * 获取规范描述
   *
   * @description 获取规范的描述信息
   * @returns 规范描述
   */
  getDescription(): string;

  /**
   * 获取规范名称
   *
   * @description 获取规范的名称
   * @returns 规范名称
   */
  getName(): string;
}

/**
 * 异步规范接口
 *
 * @description 定义异步规范模式的基础接口
 * @template T 规范适用的类型
 */
export interface IAsyncSpecification<T> extends ISpecification<T> {
  /**
   * 异步检查候选对象是否满足规范
   *
   * @description 异步检查候选对象是否满足规范的要求
   * @param candidate - 候选对象
   * @returns 是否满足规范的Promise
   */
  isSatisfiedByAsync(candidate: T): Promise<boolean>;

  /**
   * 异步与操作
   *
   * @description 创建异步与规范
   * @param specification - 另一个规范
   * @returns 异步与规范
   */
  andAsync(specification: IAsyncSpecification<T>): IAsyncSpecification<T>;

  /**
   * 异步或操作
   *
   * @description 创建异步或规范
   * @param specification - 另一个规范
   * @returns 异步或规范
   */
  orAsync(specification: IAsyncSpecification<T>): IAsyncSpecification<T>;

  /**
   * 异步非操作
   *
   * @description 创建异步非规范
   * @returns 异步非规范
   */
  notAsync(): IAsyncSpecification<T>;
}

/**
 * 规范结果
 *
 * @description 规范检查的结果
 */
export interface SpecificationResult {
  /**
   * 是否满足规范
   */
  isSatisfied: boolean;

  /**
   * 错误消息
   */
  errorMessage?: string;

  /**
   * 上下文信息
   */
  context?: Record<string, unknown>;

  /**
   * 规范名称
   */
  specificationName: string;

  /**
   * 规范描述
   */
  specificationDescription: string;
}

/**
 * 规范元数据
 *
 * @description 规范的元数据信息
 */
export interface SpecificationMetadata {
  /**
   * 规范名称
   */
  name: string;

  /**
   * 规范描述
   */
  description: string;

  /**
   * 规范版本
   */
  version: string;

  /**
   * 规范分类
   */
  category: string;

  /**
   * 规范标签
   */
  tags: string[];

  /**
   * 规范优先级
   */
  priority: number;

  /**
   * 规范是否启用
   */
  enabled: boolean;
}
