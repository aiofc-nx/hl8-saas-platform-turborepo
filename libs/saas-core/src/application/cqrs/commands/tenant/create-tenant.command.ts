/**
 * 创建租户命令
 *
 * @description CQRS 命令对象，封装创建租户的请求数据
 *
 * @class CreateTenantCommand
 * @since 1.0.0
 */

import { BaseCommand } from "@hl8/hybrid-archi";
import { TenantType } from "../../../../domain/tenant/value-objects/tenant-type.enum.js";

export class CreateTenantCommand extends BaseCommand {
  constructor(
    tenantId: string,
    userId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly domain: string,
    public readonly type: TenantType,
  ) {
    super(tenantId, userId);
  }

  get commandType(): string {
    return "CreateTenantCommand";
  }
}
