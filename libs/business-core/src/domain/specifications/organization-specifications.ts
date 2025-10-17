/**
 * 组织规范
 *
 * @description 组织相关的业务规范实现
 * @since 1.0.0
 */

import { BaseSpecification } from './base/base-specification.js';
import { Organization } from '../entities/organization/organization.entity.js';
import { OrganizationType } from '../value-objects/types/organization-type.vo.js';
import { OrganizationLevel } from '../value-objects/types/organization-level.vo.js';
import { EntityId } from '@hl8/isolation-model';

/**
 * 组织激活规范
 *
 * @description 检查组织是否处于激活状态
 */
export class OrganizationActiveSpecification extends BaseSpecification<Organization> {
  constructor() {
    super({
      name: 'OrganizationActiveSpecification',
      description: '组织必须处于激活状态',
      category: 'organization',
      tags: ['organization', 'status', 'active'],
      priority: 1,
    });
  }

  isSatisfiedBy(organization: Organization): boolean {
    // 这里需要根据实际的Organization实体实现来判断激活状态
    // 假设Organization实体有一个status属性
    return true; // 临时实现，需要根据实际实体调整
  }

  protected getErrorMessage(organization: Organization): string {
    return `组织 ${organization.name} 未激活`;
  }
}

/**
 * 组织类型规范
 *
 * @description 检查组织是否属于指定类型
 */
export class OrganizationTypeSpecification extends BaseSpecification<Organization> {
  constructor(private requiredType: OrganizationType) {
    super({
      name: 'OrganizationTypeSpecification',
      description: `组织类型必须为 ${requiredType.value}`,
      category: 'organization',
      tags: ['organization', 'type'],
      priority: 1,
    });
  }

  isSatisfiedBy(organization: Organization): boolean {
    return organization.type.equals(this.requiredType);
  }

  protected getErrorMessage(organization: Organization): string {
    return `组织类型必须为 ${this.requiredType.value}，实际为 ${organization.type.value}`;
  }
}

/**
 * 组织层级规范
 *
 * @description 检查组织层级是否符合要求
 */
export class OrganizationLevelSpecification extends BaseSpecification<Organization> {
  constructor(
    private minLevel: OrganizationLevel,
    private maxLevel: OrganizationLevel,
  ) {
    super({
      name: 'OrganizationLevelSpecification',
      description: `组织层级必须在 ${minLevel.value} 到 ${maxLevel.value} 之间`,
      category: 'organization',
      tags: ['organization', 'level'],
      priority: 1,
    });
  }

  isSatisfiedBy(organization: Organization): boolean {
    const level = organization.level;
    return level.value >= this.minLevel.value && level.value <= this.maxLevel.value;
  }

  protected getErrorMessage(organization: Organization): string {
    return `组织层级必须在 ${this.minLevel.value} 到 ${this.maxLevel.value} 之间，实际为 ${organization.level.value}`;
  }
}

/**
 * 组织名称规范
 *
 * @description 检查组织名称是否符合规范
 */
export class OrganizationNameSpecification extends BaseSpecification<Organization> {
  constructor(
    private minLength: number = 3,
    private maxLength: number = 100,
  ) {
    super({
      name: 'OrganizationNameSpecification',
      description: `组织名称长度必须在 ${minLength} 到 ${maxLength} 之间`,
      category: 'organization',
      tags: ['organization', 'name', 'validation'],
      priority: 1,
    });
  }

  isSatisfiedBy(organization: Organization): boolean {
    const name = organization.name;
    return name && name.length >= this.minLength && name.length <= this.maxLength;
  }

  protected getErrorMessage(organization: Organization): string {
    const name = organization.name;
    if (!name) {
      return '组织名称不能为空';
    }
    if (name.length < this.minLength) {
      return `组织名称长度不能少于 ${this.minLength} 个字符`;
    }
    if (name.length > this.maxLength) {
      return `组织名称长度不能超过 ${this.maxLength} 个字符`;
    }
    return '组织名称不符合规范';
  }
}

/**
 * 组织ID规范
 *
 * @description 检查组织ID是否有效
 */
export class OrganizationIdSpecification extends BaseSpecification<Organization> {
  constructor(private requiredId: EntityId) {
    super({
      name: 'OrganizationIdSpecification',
      description: `组织ID必须为 ${requiredId.value}`,
      category: 'organization',
      tags: ['organization', 'id'],
      priority: 1,
    });
  }

  isSatisfiedBy(organization: Organization): boolean {
    return organization.id.equals(this.requiredId);
  }

  protected getErrorMessage(organization: Organization): string {
    return `组织ID必须为 ${this.requiredId.value}，实际为 ${organization.id.value}`;
  }
}

/**
 * 组织决策类型规范
 *
 * @description 检查组织是否为决策类型
 */
export class OrganizationDecisionTypeSpecification extends BaseSpecification<Organization> {
  constructor() {
    super({
      name: 'OrganizationDecisionTypeSpecification',
      description: '组织必须为决策类型',
      category: 'organization',
      tags: ['organization', 'type', 'decision'],
      priority: 1,
    });
  }

  isSatisfiedBy(organization: Organization): boolean {
    return organization.type.isDecisionType();
  }

  protected getErrorMessage(organization: Organization): string {
    return `组织必须为决策类型，实际为 ${organization.type.value}`;
  }
}

/**
 * 组织执行类型规范
 *
 * @description 检查组织是否为执行类型
 */
export class OrganizationExecutionTypeSpecification extends BaseSpecification<Organization> {
  constructor() {
    super({
      name: 'OrganizationExecutionTypeSpecification',
      description: '组织必须为执行类型',
      category: 'organization',
      tags: ['organization', 'type', 'execution'],
      priority: 1,
    });
  }

  isSatisfiedBy(organization: Organization): boolean {
    return organization.type.isExecutionType();
  }

  protected getErrorMessage(organization: Organization): string {
    return `组织必须为执行类型，实际为 ${organization.type.value}`;
  }
}

/**
 * 组织高层级规范
 *
 * @description 检查组织是否为高层级
 */
export class OrganizationHighLevelSpecification extends BaseSpecification<Organization> {
  constructor() {
    super({
      name: 'OrganizationHighLevelSpecification',
      description: '组织必须为高层级',
      category: 'organization',
      tags: ['organization', 'level', 'high'],
      priority: 1,
    });
  }

  isSatisfiedBy(organization: Organization): boolean {
    return organization.level.isHighLevel();
  }

  protected getErrorMessage(organization: Organization): string {
    return `组织必须为高层级，实际为 ${organization.level.value}`;
  }
}
