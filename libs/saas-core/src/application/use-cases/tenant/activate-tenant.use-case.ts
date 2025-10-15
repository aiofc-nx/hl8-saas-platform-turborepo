/**
 * 激活租户用例
 *
 * @description 处理租户激活的业务场景
 *
 * @class ActivateTenantUseCase
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { TenantId } from "@hl8/isolation-model";
import { ICommandUseCase } from "../base/use-case.interface.js";
import { ITenantAggregateRepository } from "../../../domain/tenant/repositories/tenant-aggregate.repository.interface.js";

export interface IActivateTenantCommand {
  tenantId: string;
  activatedBy: string;
}

// @Injectable() // TODO: 修复装饰器类型问题
export class ActivateTenantUseCase
  implements ICommandUseCase<IActivateTenantCommand, void>
{
  constructor(private readonly tenantRepository: ITenantAggregateRepository) {}

  async execute(command: IActivateTenantCommand): Promise<void> {
    // 加载租户聚合根
    const tenantId = TenantId.create(command.tenantId);
    const aggregate = await this.tenantRepository.findById(tenantId);

    if (!aggregate) {
      throw new Error(`租户不存在: ${command.tenantId}`);
    }

    // 激活租户
    aggregate.activate(command.activatedBy);

    // 保存
    await this.tenantRepository.save(aggregate);
  }
}
