/**
 * 规范工厂
 *
 * @description 创建和管理规范实例，提供规范的统一创建接口
 * @since 1.0.0
 */

import { ISpecification, SpecificationMetadata } from './base/specification.interface.js';
import { BaseSpecification } from './base/base-specification.js';
import { ExceptionFactory } from '../exceptions/exception-factory.js';
import { TenantActiveSpecification, TenantTypeSpecification, TenantNameSpecification } from './tenant-specifications.js';
import { OrganizationActiveSpecification, OrganizationTypeSpecification, OrganizationNameSpecification } from './organization-specifications.js';
import { DepartmentActiveSpecification, DepartmentLevelSpecification, DepartmentNameSpecification } from './department-specifications.js';
import { Tenant } from '../entities/tenant/tenant.entity.js';
import { Organization } from '../entities/organization/organization.entity.js';
import { Department } from '../entities/department/department.entity.js';
import { TenantType } from '../value-objects/types/tenant-type.vo.js';
import { OrganizationType } from '../value-objects/types/organization-type.vo.js';
import { DepartmentLevel } from '../value-objects/types/department-level.vo.js';
import { EntityId } from '@hl8/isolation-model';

/**
 * 规范工厂
 *
 * @description 创建和管理规范实例，提供规范的统一创建接口
 */
export class SpecificationFactory {
  private static instance: SpecificationFactory;
  private specifications = new Map<string, ISpecification<any>>();
  private specificationMetadata = new Map<string, SpecificationMetadata>();
  private _exceptionFactory: ExceptionFactory;

  private constructor() {
    this._exceptionFactory = ExceptionFactory.getInstance();
    this.initializeDefaultSpecifications();
  }

  /**
   * 获取单例实例
   *
   * @returns 规范工厂实例
   */
  static getInstance(): SpecificationFactory {
    if (!SpecificationFactory.instance) {
      SpecificationFactory.instance = new SpecificationFactory();
    }
    return SpecificationFactory.instance;
  }

  /**
   * 初始化默认规范
   *
   * @private
   */
  private initializeDefaultSpecifications(): void {
    // 注册租户规范
    this.registerSpecification('tenant-active', new TenantActiveSpecification());
    this.registerSpecification('tenant-type-enterprise', new TenantTypeSpecification(TenantType.ENTERPRISE));
    this.registerSpecification('tenant-type-community', new TenantTypeSpecification(TenantType.COMMUNITY));
    this.registerSpecification('tenant-type-team', new TenantTypeSpecification(TenantType.TEAM));
    this.registerSpecification('tenant-type-personal', new TenantTypeSpecification(TenantType.PERSONAL));
    this.registerSpecification('tenant-name', new TenantNameSpecification());

    // 注册组织规范
    this.registerSpecification('organization-active', new OrganizationActiveSpecification());
    this.registerSpecification('organization-name', new OrganizationNameSpecification());

    // 注册部门规范
    this.registerSpecification('department-active', new DepartmentActiveSpecification());
    this.registerSpecification('department-name', new DepartmentNameSpecification());
  }

  /**
   * 注册规范
   *
   * @param name - 规范名称
   * @param specification - 规范实例
   * @param metadata - 规范元数据
   */
  registerSpecification<T>(
    name: string,
    specification: ISpecification<T>,
    metadata?: Partial<SpecificationMetadata>,
  ): void {
    this.specifications.set(name, specification);
    this.specificationMetadata.set(name, {
      name,
      description: specification.getDescription(),
      version: '1.0.0',
      category: 'default',
      tags: [],
      priority: 0,
      enabled: true,
      ...metadata,
    });
  }

  /**
   * 注销规范
   *
   * @param name - 规范名称
   */
  unregisterSpecification(name: string): void {
    this.specifications.delete(name);
    this.specificationMetadata.delete(name);
  }

  /**
   * 获取规范
   *
   * @param name - 规范名称
   * @returns 规范实例
   */
  getSpecification<T>(name: string): ISpecification<T> | undefined {
    return this.specifications.get(name) as ISpecification<T>;
  }

  /**
   * 获取规范元数据
   *
   * @param name - 规范名称
   * @returns 规范元数据
   */
  getSpecificationMetadata(name: string): SpecificationMetadata | undefined {
    return this.specificationMetadata.get(name);
  }

  /**
   * 获取所有规范名称
   *
   * @returns 规范名称列表
   */
  getSpecificationNames(): string[] {
    return Array.from(this.specifications.keys());
  }

  /**
   * 获取所有规范元数据
   *
   * @returns 规范元数据列表
   */
  getAllSpecificationMetadata(): SpecificationMetadata[] {
    return Array.from(this.specificationMetadata.values());
  }

  /**
   * 检查规范是否存在
   *
   * @param name - 规范名称
   * @returns 是否存在
   */
  hasSpecification(name: string): boolean {
    return this.specifications.has(name);
  }

  /**
   * 创建租户规范
   *
   * @param type - 租户类型
   * @returns 租户类型规范
   */
  createTenantTypeSpecification(type: TenantType): ISpecification<Tenant> {
    return new TenantTypeSpecification(type);
  }

  /**
   * 创建租户名称规范
   *
   * @param minLength - 最小长度
   * @param maxLength - 最大长度
   * @returns 租户名称规范
   */
  createTenantNameSpecification(minLength: number = 3, maxLength: number = 100): ISpecification<Tenant> {
    return new TenantNameSpecification(minLength, maxLength);
  }

  /**
   * 创建组织类型规范
   *
   * @param type - 组织类型
   * @returns 组织类型规范
   */
  createOrganizationTypeSpecification(type: OrganizationType): ISpecification<Organization> {
    return new OrganizationTypeSpecification(type);
  }

  /**
   * 创建组织名称规范
   *
   * @param minLength - 最小长度
   * @param maxLength - 最大长度
   * @returns 组织名称规范
   */
  createOrganizationNameSpecification(minLength: number = 3, maxLength: number = 100): ISpecification<Organization> {
    return new OrganizationNameSpecification(minLength, maxLength);
  }

  /**
   * 创建部门层级规范
   *
   * @param minLevel - 最小层级
   * @param maxLevel - 最大层级
   * @returns 部门层级规范
   */
  createDepartmentLevelSpecification(minLevel: DepartmentLevel, maxLevel: DepartmentLevel): ISpecification<Department> {
    return new DepartmentLevelSpecification(minLevel, maxLevel);
  }

  /**
   * 创建部门名称规范
   *
   * @param minLength - 最小长度
   * @param maxLength - 最大长度
   * @returns 部门名称规范
   */
  createDepartmentNameSpecification(minLength: number = 3, maxLength: number = 100): ISpecification<Department> {
    return new DepartmentNameSpecification(minLength, maxLength);
  }

  /**
   * 创建复合规范
   *
   * @param specifications - 规范列表
   * @param operator - 组合操作符
   * @returns 复合规范
   */
  createCompositeSpecification<T>(
    specifications: ISpecification<T>[],
    operator: 'and' | 'or' = 'and',
  ): ISpecification<T> {
    if (specifications.length === 0) {
      throw this._exceptionFactory.createGenericException(
        '规范列表不能为空',
        'SPECIFICATION_LIST_EMPTY',
        'validation',
        { specifications: specifications.length },
        'medium'
      );
    }

    if (specifications.length === 1) {
      return specifications[0];
    }

    let result = specifications[0];
    for (let i = 1; i < specifications.length; i++) {
      if (operator === 'and') {
        result = result.and(specifications[i]);
      } else {
        result = result.or(specifications[i]);
      }
    }

    return result;
  }

  /**
   * 创建条件规范
   *
   * @param condition - 条件函数
   * @param specification - 规范
   * @returns 条件规范
   */
  createConditionalSpecification<T>(
    condition: (candidate: T) => boolean,
    specification: ISpecification<T>,
  ): ISpecification<T> {
    return new ConditionalSpecification(condition, specification);
  }

  /**
   * 创建业务规范
   *
   * @param name - 规范名称
   * @param description - 规范描述
   * @param predicate - 谓词函数
   * @returns 业务规范
   */
  createBusinessSpecification<T>(
    name: string,
    description: string,
    predicate: (candidate: T) => boolean,
  ): ISpecification<T> {
    return new BusinessSpecification(name, description, predicate);
  }

  /**
   * 获取规范统计信息
   *
   * @returns 规范统计信息
   */
  getStatistics(): SpecificationStatistics {
    const metadata = Array.from(this.specificationMetadata.values());
    
    const categoryStats = metadata.reduce(
      (stats, meta) => {
        const category = meta.category;
        stats[category] = (stats[category] || 0) + 1;
        return stats;
      },
      {} as Record<string, number>,
    );

    return {
      totalSpecifications: this.specifications.size,
      totalCategories: Object.keys(categoryStats).length,
      categoryStats,
      specifications: metadata.map(meta => ({
        name: meta.name,
        description: meta.description,
        category: meta.category,
        priority: meta.priority,
        enabled: meta.enabled,
      })),
    };
  }

  /**
   * 清空所有规范
   */
  clear(): void {
    this.specifications.clear();
    this.specificationMetadata.clear();
  }
}

/**
 * 条件规范
 *
 * @description 根据条件决定是否应用规范
 * @template T 规范适用的类型
 */
class ConditionalSpecification<T> extends BaseSpecification<T> {
  constructor(
    private condition: (candidate: T) => boolean,
    private specification: ISpecification<T>,
  ) {
    super({
      name: `ConditionalSpecification_${specification.getName()}`,
      description: `条件规范: ${specification.getDescription()}`,
      category: 'conditional',
      tags: ['conditional', 'specification'],
      priority: 0,
    });
  }

  isSatisfiedBy(candidate: T): boolean {
    if (!this.condition(candidate)) {
      return true; // 条件不满足时，规范总是满足
    }
    return this.specification.isSatisfiedBy(candidate);
  }

  protected getErrorMessage(candidate: T): string {
    if (!this.condition(candidate)) {
      return '条件不满足，规范跳过';
    }
    return `条件规范: ${this.specification.getName()} 不满足`;
  }
}

/**
 * 业务规范
 *
 * @description 基于谓词函数的业务规范
 * @template T 规范适用的类型
 */
class BusinessSpecification<T> extends BaseSpecification<T> {
  constructor(
    name: string,
    description: string,
    private predicate: (candidate: T) => boolean,
  ) {
    super({
      name,
      description,
      category: 'business',
      tags: ['business', 'specification'],
      priority: 1,
    });
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.predicate(candidate);
  }

  protected getErrorMessage(candidate: T): string {
    return `${this.getName()} 业务规范不满足`;
  }
}

/**
 * 规范统计信息
 */
export interface SpecificationStatistics {
  totalSpecifications: number;
  totalCategories: number;
  categoryStats: Record<string, number>;
  specifications: Array<{
    name: string;
    description: string;
    category: string;
    priority: number;
    enabled: boolean;
  }>;
}
