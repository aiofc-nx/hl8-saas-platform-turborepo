/**
 * 租户配置 ORM 实体
 *
 * @description MikroORM 实体定义，用于租户配置数据的持久化
 *
 * @class TenantConfigurationOrmEntity
 * @since 1.0.0
 */

import {
  Entity,
  PrimaryKey,
  Property,
  Index,
  OneToOne,
} from "@hl8/hybrid-archi";
import { TenantOrmEntity } from "./tenant.orm-entity.js";

@Entity({ tableName: "tenant_configurations" })
export class TenantConfigurationOrmEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @OneToOne(() => TenantOrmEntity, {
    nullable: false,
    owner: true,
    fieldName: "tenant_id",
  })
  @Index()
  tenant!: TenantOrmEntity;

  // 配额字段
  @Property({ type: "int" })
  maxUsers!: number;

  @Property({ type: "int" })
  maxStorageMB!: number;

  @Property({ type: "int" })
  maxOrganizations!: number;

  @Property({ type: "int" })
  maxDepartmentLevels!: number;

  @Property({ type: "int" })
  maxApiCallsPerDay!: number;

  @Property({ type: "json" })
  enabledFeatures!: string[];

  @Property({ type: "json", nullable: true })
  customSettings?: Record<string, any>;

  // 审计字段
  @Property({ type: "timestamp" })
  createdAt!: Date;

  @Property({ type: "timestamp" })
  updatedAt!: Date;

  @Property({ type: "varchar", length: 50 })
  createdBy!: string;

  @Property({ type: "varchar", length: 50 })
  updatedBy!: string;

  @Property({ type: "int", default: 1 })
  version!: number;
}
