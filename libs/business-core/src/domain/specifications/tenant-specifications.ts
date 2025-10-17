/**
 * 租户规范
 *
 * @description 租户相关的业务规范实现
 * @since 1.0.0
 */

import { BaseSpecification } from './base/base-specification.js';
import { Tenant } from '../entities/tenant/tenant.entity.js';
import { TenantType } from '../value-objects/types/tenant-type.vo.js';
import { EntityId } from '@hl8/isolation-model';

/**
 * 租户激活规范
 *
 * @description 检查租户是否处于激活状态
 */
export class TenantActiveSpecification extends BaseSpecification<Tenant> {
  constructor() {
    super({
      name: 'TenantActiveSpecification',
      description: '租户必须处于激活状态',
      category: 'tenant',
      tags: ['tenant', 'status', 'active'],
      priority: 1,
    });
  }

  isSatisfiedBy(tenant: Tenant): boolean {
    // 这里需要根据实际的Tenant实体实现来判断激活状态
    // 假设Tenant实体有一个status属性
    return true; // 临时实现，需要根据实际实体调整
  }

  protected getErrorMessage(tenant: Tenant): string {
    return `租户 ${tenant.name} 未激活`;
  }
}

/**
 * 租户类型规范
 *
 * @description 检查租户是否属于指定类型
 */
export class TenantTypeSpecification extends BaseSpecification<Tenant> {
  constructor(private requiredType: TenantType) {
    super({
      name: 'TenantTypeSpecification',
      description: `租户类型必须为 ${requiredType.value}`,
      category: 'tenant',
      tags: ['tenant', 'type'],
      priority: 1,
    });
  }

  isSatisfiedBy(tenant: Tenant): boolean {
    return tenant.type.equals(this.requiredType);
  }

  protected getErrorMessage(tenant: Tenant): string {
    return `租户类型必须为 ${this.requiredType.value}，实际为 ${tenant.type.value}`;
  }
}

/**
 * 租户名称规范
 *
 * @description 检查租户名称是否符合规范
 */
export class TenantNameSpecification extends BaseSpecification<Tenant> {
  constructor(
    private minLength: number = 3,
    private maxLength: number = 100,
  ) {
    super({
      name: 'TenantNameSpecification',
      description: `租户名称长度必须在 ${minLength} 到 ${maxLength} 之间`,
      category: 'tenant',
      tags: ['tenant', 'name', 'validation'],
      priority: 1,
    });
  }

  isSatisfiedBy(tenant: Tenant): boolean {
    const name = tenant.name;
    return name && name.length >= this.minLength && name.length <= this.maxLength;
  }

  protected getErrorMessage(tenant: Tenant): string {
    const name = tenant.name;
    if (!name) {
      return '租户名称不能为空';
    }
    if (name.length < this.minLength) {
      return `租户名称长度不能少于 ${this.minLength} 个字符`;
    }
    if (name.length > this.maxLength) {
      return `租户名称长度不能超过 ${this.maxLength} 个字符`;
    }
    return '租户名称不符合规范';
  }
}

/**
 * 租户ID规范
 *
 * @description 检查租户ID是否有效
 */
export class TenantIdSpecification extends BaseSpecification<Tenant> {
  constructor(private requiredId: EntityId) {
    super({
      name: 'TenantIdSpecification',
      description: `租户ID必须为 ${requiredId.value}`,
      category: 'tenant',
      tags: ['tenant', 'id'],
      priority: 1,
    });
  }

  isSatisfiedBy(tenant: Tenant): boolean {
    return tenant.id.equals(this.requiredId);
  }

  protected getErrorMessage(tenant: Tenant): string {
    return `租户ID必须为 ${this.requiredId.value}，实际为 ${tenant.id.value}`;
  }
}

/**
 * 租户创建时间规范
 *
 * @description 检查租户创建时间是否在指定范围内
 */
export class TenantCreatedTimeSpecification extends BaseSpecification<Tenant> {
  constructor(
    private startDate: Date,
    private endDate: Date,
  ) {
    super({
      name: 'TenantCreatedTimeSpecification',
      description: `租户创建时间必须在 ${startDate.toISOString()} 到 ${endDate.toISOString()} 之间`,
      category: 'tenant',
      tags: ['tenant', 'time', 'created'],
      priority: 2,
    });
  }

  isSatisfiedBy(tenant: Tenant): boolean {
    // 这里需要根据实际的Tenant实体实现来获取创建时间
    // 假设Tenant实体有一个createdAt属性
    const createdAt = new Date(); // 临时实现，需要根据实际实体调整
    return createdAt >= this.startDate && createdAt <= this.endDate;
  }

  protected getErrorMessage(tenant: Tenant): string {
    return `租户创建时间不在指定范围内`;
  }
}

/**
 * 租户类型组合规范
 *
 * @description 检查租户是否属于企业或社区类型
 */
export class TenantEnterpriseOrCommunitySpecification extends BaseSpecification<Tenant> {
  constructor() {
    super({
      name: 'TenantEnterpriseOrCommunitySpecification',
      description: '租户类型必须为企业或社区',
      category: 'tenant',
      tags: ['tenant', 'type', 'enterprise', 'community'],
      priority: 1,
    });
  }

  isSatisfiedBy(tenant: Tenant): boolean {
    return tenant.type.equals(TenantType.ENTERPRISE) || tenant.type.equals(TenantType.COMMUNITY);
  }

  protected getErrorMessage(tenant: Tenant): string {
    return `租户类型必须为企业或社区，实际为 ${tenant.type.value}`;
  }
}

/**
 * 租户非个人类型规范
 *
 * @description 检查租户不是个人类型
 */
export class TenantNotPersonalSpecification extends BaseSpecification<Tenant> {
  constructor() {
    super({
      name: 'TenantNotPersonalSpecification',
      description: '租户类型不能为个人',
      category: 'tenant',
      tags: ['tenant', 'type', 'not', 'personal'],
      priority: 1,
    });
  }

  isSatisfiedBy(tenant: Tenant): boolean {
    return !tenant.type.equals(TenantType.PERSONAL);
  }

  protected getErrorMessage(tenant: Tenant): string {
    return `租户类型不能为个人，实际为 ${tenant.type.value}`;
  }
}
