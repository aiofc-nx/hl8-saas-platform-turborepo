/**
 * 升级租户用例
 *
 * @description 处理租户类型升级的业务场景
 *
 * @class UpgradeTenantUseCase
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { TenantId } from "@hl8/isolation-model";
import { ICommandUseCase } from "../base/use-case.interface.js";
import { ITenantAggregateRepository } from "../../../domain/tenant/repositories/tenant-aggregate.repository.interface.js";
import { TenantUpgradeService } from "../../../domain/tenant/services/tenant-upgrade.service.js";
import { TenantType } from "../../../domain/tenant/value-objects/tenant-type.enum.js";

export interface IUpgradeTenantCommand {
  tenantId: string;
  targetType: TenantType;
  upgradedBy: string;
}

@Injectable()
export class UpgradeTenantUseCase
  implements ICommandUseCase<IUpgradeTenantCommand, void>
{
  private readonly upgradeService: TenantUpgradeService;

  constructor(private readonly tenantRepository: ITenantAggregateRepository) {
    this.upgradeService = new TenantUpgradeService();
  }

  async execute(command: IUpgradeTenantCommand): Promise<void> {
    // 加载租户聚合根
    const tenantId = TenantId.create(command.tenantId);
    const aggregate = await (this.tenantRepository as any).findById(tenantId);

    if (!aggregate) {
      throw new Error(`租户不存在: ${command.tenantId}`);
    }

    // 执行升级
    aggregate.upgrade(command.targetType, command.upgradedBy);

    // 保存
    await (this.tenantRepository as any).save(aggregate);
  }
}
