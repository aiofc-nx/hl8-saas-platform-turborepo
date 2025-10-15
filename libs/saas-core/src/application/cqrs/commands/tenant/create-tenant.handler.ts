/**
 * 创建租户命令处理器
 *
 * @description 处理创建租户命令，委托给用例执行
 *
 * @class CreateTenantHandler
 * @since 1.0.0
 */

import { CommandHandler, ICommandHandler } from "@hl8/hybrid-archi";
import { CreateTenantCommand } from "./create-tenant.command.js";
import { CreateTenantUseCase } from "../../../use-cases/tenant/create-tenant.use-case.js";
import { TenantId } from "@hl8/isolation-model";

// @CommandHandler('CreateTenantCommand') // TODO: 修复装饰器类型问题
export class CreateTenantHandler
  implements ICommandHandler<CreateTenantCommand, TenantId>
{
  constructor(private readonly useCase: CreateTenantUseCase) {}

  async execute(command: CreateTenantCommand): Promise<TenantId> {
    return await this.useCase.execute({
      code: command.code,
      name: command.name,
      domain: command.domain,
      type: command.type,
      createdBy: command.userId!, // 使用 BaseCommand 的 userId getter
    });
  }

  async handle(command: CreateTenantCommand): Promise<TenantId> {
    return await this.execute(command);
  }

  getSupportedCommandType(): string {
    return "CreateTenantCommand";
  }

  supports(commandType: string): boolean {
    return commandType === "CreateTenantCommand";
  }

  validateCommand(command: CreateTenantCommand): void {
    if (!command.code || command.code.trim().length === 0) {
      throw new Error("Tenant code is required");
    }
    if (!command.name || command.name.trim().length === 0) {
      throw new Error("Tenant name is required");
    }
    if (!command.domain || command.domain.trim().length === 0) {
      throw new Error("Tenant domain is required");
    }
  }

  getPriority(): number {
    return 0;
  }

  canHandle(command: CreateTenantCommand): boolean {
    return command.commandType === "CreateTenantCommand";
  }

  getHandlerName(): string {
    return "CreateTenantHandler";
  }

  getCommandType(): string {
    return "CreateTenantCommand";
  }
}
