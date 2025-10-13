/**
 * 用户实体
 *
 * @description 示例实体，演示 MikroORM + 多租户数据隔离的使用
 *
 * ## 业务规则
 *
 * ### 多租户隔离规则
 * - 每个用户必须属于一个租户（tenantId 必填）
 * - 每个用户可以属于一个组织（organizationId 可选）
 * - 每个用户可以属于一个部门（departmentId 可选）
 * - 用户数据自动按租户隔离
 *
 * ### 数据完整性规则
 * - email 必须唯一（在租户内）
 * - username 必须唯一（在租户内）
 * - 创建时间和更新时间自动管理
 *
 * ### 审计规则
 * - 自动记录创建时间（createdAt）
 * - 自动记录更新时间（updatedAt）
 * - 软删除支持（deletedAt）
 *
 * @example
 * ```typescript
 * // 创建用户
 * const user = new User();
 * user.tenantId = 'tenant-123';
 * user.username = 'john_doe';
 * user.email = 'john@example.com';
 * user.firstName = 'John';
 * user.lastName = 'Doe';
 * await em.persistAndFlush(user);
 *
 * // 查询用户（自动应用隔离过滤）
 * const users = await em.find(User, {});
 * ```
 */

import {
  Entity,
  PrimaryKey,
  Property,
  Index,
  Unique,
} from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity({ tableName: 'users' })
@Unique({ properties: ['tenantId', 'email'] })
@Unique({ properties: ['tenantId', 'username'] })
export class User {
  /**
   * 用户主键 ID
   */
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  /**
   * 租户 ID（多租户隔离）
   *
   * @description 必填字段，用于数据隔离
   */
  @Property({ type: 'uuid' })
  @Index()
  tenantId!: string;

  /**
   * 组织 ID（组织级隔离）
   *
   * @description 可选字段，用于组织级数据隔离
   */
  @Property({ type: 'uuid', nullable: true })
  @Index()
  organizationId?: string;

  /**
   * 部门 ID（部门级隔离）
   *
   * @description 可选字段，用于部门级数据隔离
   */
  @Property({ type: 'uuid', nullable: true })
  @Index()
  departmentId?: string;

  /**
   * 用户名
   *
   * @description 在租户内唯一
   */
  @Property({ type: 'varchar', length: 100 })
  username!: string;

  /**
   * 邮箱
   *
   * @description 在租户内唯一
   */
  @Property({ type: 'varchar', length: 255 })
  email!: string;

  /**
   * 名
   */
  @Property({ type: 'varchar', length: 100 })
  firstName!: string;

  /**
   * 姓
   */
  @Property({ type: 'varchar', length: 100 })
  lastName!: string;

  /**
   * 是否激活
   */
  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  /**
   * 创建时间
   */
  @Property({ type: 'timestamptz', onCreate: () => new Date() })
  createdAt: Date = new Date();

  /**
   * 更新时间
   */
  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  /**
   * 删除时间（软删除）
   */
  @Property({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  /**
   * 用户全名
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * 软删除用户
   */
  softDelete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
  }

  /**
   * 恢复已删除的用户
   */
  restore(): void {
    this.deletedAt = undefined;
    this.isActive = true;
  }
}

