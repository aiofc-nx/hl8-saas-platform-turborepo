/**
 * 获取租户查询处理器
 *
 * @class GetTenantHandler
 * @since 1.0.0
 */

import { QueryHandler, IQueryHandler } from "@hl8/business-core";
import { GetTenantQuery } from "./get-tenant.query.js";
import { ITenantAggregateRepository } from "../../../../domain/tenant/repositories/tenant-aggregate.repository.interface.js";
import { TenantAggregate } from "../../../../domain/tenant/aggregates/tenant.aggregate.js";
import { TenantId } from "@hl8/isolation-model/index.js";

// @QueryHandler('GetTenantQuery') // TODO: 修复装饰器类型问题
export class GetTenantHandler implements IQueryHandler<GetTenantQuery, any> {
  constructor(private readonly repository: ITenantAggregateRepository) {}

  async execute(query: GetTenantQuery): Promise<TenantAggregate | null> {
    const tenantId = TenantId.create(query.targetTenantId);
    return await (this.repository as any).findById(tenantId);
  }
}
