/**
 * 基础规范抽象类
 *
 * @description 提供规范模式的基础实现，包含通用的规范操作
 * @since 1.0.0
 */

import {
  ISpecification,
  SpecificationResult,
  SpecificationMetadata,
} from "./specification.interface.js";

/**
 * 基础规范抽象类
 *
 * @description 提供规范模式的基础实现，包含通用的规范操作
 * 所有具体规范都应该继承此类
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
export abstract class BaseSpecification<T> implements ISpecification<T> {
  protected metadata: SpecificationMetadata;

  constructor(metadata: Partial<SpecificationMetadata> = {}) {
    this.metadata = {
      name: this.constructor.name,
      description: "基础规范",
      version: "1.0.0",
      category: "default",
      tags: [],
      priority: 0,
      enabled: true,
      ...metadata,
    };
  }

  /**
   * 检查候选对象是否满足规范
   *
   * @description 检查候选对象是否满足规范的要求
   * @param candidate - 候选对象
   * @returns 是否满足规范
   */
  abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * 与操作
   *
   * @description 创建与规范，两个规范都必须满足
   * @param specification - 另一个规范
   * @returns 与规范
   */
  and(specification: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, specification);
  }

  /**
   * 或操作
   *
   * @description 创建或规范，两个规范中至少一个满足
   * @param specification - 另一个规范
   * @returns 或规范
   */
  or(specification: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, specification);
  }

  /**
   * 非操作
   *
   * @description 创建非规范，原规范的否定
   * @returns 非规范
   */
  not(): ISpecification<T> {
    return new NotSpecification(this);
  }

  /**
   * 获取规范描述
   *
   * @description 获取规范的描述信息
   * @returns 规范描述
   */
  getDescription(): string {
    return this.metadata.description;
  }

  /**
   * 获取规范名称
   *
   * @description 获取规范的名称
   * @returns 规范名称
   */
  getName(): string {
    return this.metadata.name;
  }

  /**
   * 获取规范元数据
   *
   * @description 获取规范的元数据信息
   * @returns 规范元数据
   */
  getMetadata(): SpecificationMetadata {
    return { ...this.metadata };
  }

  /**
   * 检查规范是否启用
   *
   * @description 检查规范是否启用
   * @returns 是否启用
   */
  isEnabled(): boolean {
    return this.metadata.enabled;
  }

  /**
   * 启用规范
   *
   * @description 启用规范
   */
  enable(): void {
    this.metadata.enabled = true;
  }

  /**
   * 禁用规范
   *
   * @description 禁用规范
   */
  disable(): void {
    this.metadata.enabled = false;
  }

  /**
   * 设置规范优先级
   *
   * @description 设置规范优先级
   * @param priority - 优先级
   */
  setPriority(priority: number): void {
    this.metadata.priority = priority;
  }

  /**
   * 添加规范标签
   *
   * @description 添加规范标签
   * @param tag - 标签
   */
  addTag(tag: string): void {
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
    }
  }

  /**
   * 移除规范标签
   *
   * @description 移除规范标签
   * @param tag - 标签
   */
  removeTag(tag: string): void {
    const index = this.metadata.tags.indexOf(tag);
    if (index > -1) {
      this.metadata.tags.splice(index, 1);
    }
  }

  /**
   * 检查规范结果
   *
   * @description 检查规范结果，包含详细信息
   * @param candidate - 候选对象
   * @returns 规范结果
   */
  check(candidate: T): SpecificationResult {
    const isSatisfied = this.isSatisfiedBy(candidate);

    return {
      isSatisfied,
      errorMessage: isSatisfied ? undefined : this.getErrorMessage(candidate),
      context: this.getContext(candidate),
      specificationName: this.getName(),
      specificationDescription: this.getDescription(),
    };
  }

  /**
   * 获取错误消息
   *
   * @description 获取规范不满足时的错误消息
   * @param candidate - 候选对象
   * @returns 错误消息
   */
  protected getErrorMessage(_candidate: T): string {
    return `${this.getName()} 规范不满足`;
  }

  /**
   * 获取上下文信息
   *
   * @description 获取规范检查的上下文信息
   * @param candidate - 候选对象
   * @returns 上下文信息
   */
  protected getContext(candidate: T): Record<string, unknown> {
    return {
      candidate: candidate,
      specification: this.getName(),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 与规范
 *
 * @description 实现与操作的规范
 * @template T 规范适用的类型
 */
export class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>,
  ) {
    super({
      name: "AndSpecification",
      description: `(${left.getName()} AND ${right.getName()})`,
      category: "composite",
      tags: ["and", "composite"],
    });
  }

  isSatisfiedBy(candidate: T): boolean {
    return (
      this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
    );
  }

  protected getErrorMessage(candidate: T): string {
    const leftSatisfied = this.left.isSatisfiedBy(candidate);
    const rightSatisfied = this.right.isSatisfiedBy(candidate);

    const errors: string[] = [];
    if (!leftSatisfied) {
      errors.push(`${this.left.getName()} 不满足`);
    }
    if (!rightSatisfied) {
      errors.push(`${this.right.getName()} 不满足`);
    }

    return errors.join("; ");
  }
}

/**
 * 或规范
 *
 * @description 实现或操作的规范
 * @template T 规范适用的类型
 */
export class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>,
  ) {
    super({
      name: "OrSpecification",
      description: `(${left.getName()} OR ${right.getName()})`,
      category: "composite",
      tags: ["or", "composite"],
    });
  }

  isSatisfiedBy(candidate: T): boolean {
    return (
      this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
    );
  }

  protected getErrorMessage(_candidate: T): string {
    return `(${this.left.getName()} OR ${this.right.getName()}) 都不满足`;
  }
}

/**
 * 非规范
 *
 * @description 实现非操作的规范
 * @template T 规范适用的类型
 */
export class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private specification: ISpecification<T>) {
    super({
      name: "NotSpecification",
      description: `NOT ${specification.getName()}`,
      category: "composite",
      tags: ["not", "composite"],
    });
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.specification.isSatisfiedBy(candidate);
  }

  protected getErrorMessage(_candidate: T): string {
    return `NOT ${this.specification.getName()} 不满足`;
  }
}
