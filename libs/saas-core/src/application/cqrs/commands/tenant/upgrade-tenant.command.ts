/**
 * 升级租户命令
 *
 * @class UpgradeTenantCommand
 * @since 1.0.0
 */

import { BaseCommand } from "@hl8/business-core";
import { TenantType } from "../../../../domain/tenant/value-objects/tenant-type.enum.js";

export class UpgradeTenantCommand extends BaseCommand {
  constructor(
    tenantId: string,
    userId: string,
    public readonly targetTenantId: string,
    public readonly targetType: TenantType,
  ) {
    super(tenantId, userId);
  }

  get commandType(): string {
    return "UpgradeTenantCommand";
  }
}
