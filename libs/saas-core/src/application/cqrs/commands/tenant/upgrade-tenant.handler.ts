/**
 * 升级租户命令处理器
 *
 * @class UpgradeTenantHandler
 * @since 1.0.0
 */

import { CommandHandler, ICommandHandler } from "@hl8/hybrid-archi";
import { UpgradeTenantCommand } from "./upgrade-tenant.command.js";
import { UpgradeTenantUseCase } from "../../../use-cases/tenant/upgrade-tenant.use-case.js";

// @CommandHandler('UpgradeTenantCommand') // TODO: 修复装饰器类型问题
export class UpgradeTenantHandler
  implements ICommandHandler<UpgradeTenantCommand, void>
{
  constructor(private readonly useCase: UpgradeTenantUseCase) {}

  async execute(command: UpgradeTenantCommand): Promise<void> {
    await this.useCase.execute({
      tenantId: command.targetTenantId,
      targetType: command.targetType,
      upgradedBy: (command as any).userId, // 使用类型断言
    });
  }

  async handle(command: UpgradeTenantCommand): Promise<void> {
    return await this.execute(command);
  }

  getSupportedCommandType(): string {
    return "UpgradeTenantCommand";
  }

  supports(commandType: string): boolean {
    return commandType === "UpgradeTenantCommand";
  }

  validateCommand(command: UpgradeTenantCommand): void {
    if (!command.targetTenantId || command.targetTenantId.trim().length === 0) {
      throw new Error("Target tenant ID is required");
    }
    if (!command.targetType) {
      throw new Error("Target type is required");
    }
  }

  getPriority(): number {
    return 0;
  }

  canHandle(command: UpgradeTenantCommand): boolean {
    return command.commandType === "UpgradeTenantCommand";
  }

  getHandlerName(): string {
    return "UpgradeTenantHandler";
  }

  getCommandType(): string {
    return "UpgradeTenantCommand";
  }
}
