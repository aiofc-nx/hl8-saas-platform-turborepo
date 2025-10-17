/**
 * 租户命令处理器
 *
 * @description 处理租户相关的命令，包括创建、更新、删除等操作
 *
 * @since 1.0.0
 */

import { CommandHandler } from "../../decorators/command-handler.decorator.js";
import { BaseCommandHandler } from "../../base/base-command-handler.js";
import { CreateTenantCommand } from "../../commands/tenant-commands.js";
import { UpdateTenantCommand } from "../../commands/tenant-commands.js";
import { DeleteTenantCommand } from "../../commands/tenant-commands.js";
import { ActivateTenantCommand } from "../../commands/tenant-commands.js";
import { DeactivateTenantCommand } from "../../commands/tenant-commands.js";
import { CreateTenantUseCase } from "../../../use-cases/tenant/create-tenant.use-case.js";
import { UpdateTenantUseCase } from "../../../use-cases/tenant/update-tenant.use-case.js";
import { DeleteTenantUseCase } from "../../../use-cases/tenant/delete-tenant.use-case.js";
import type { IUseCaseContext } from "../../../use-cases/base/use-case.interface.js";

/**
 * 创建租户命令处理器
 *
 * @description 处理创建租户的命令
 */
@CommandHandler(CreateTenantCommand)
export class CreateTenantCommandHandler extends BaseCommandHandler<CreateTenantCommand> {
  constructor(private readonly createTenantUseCase: CreateTenantUseCase) {
    super();
  }

  /**
   * 处理创建租户命令
   *
   * @param command - 创建租户命令
   * @param context - 执行上下文
   * @returns Promise<void>
   */
  async handle(
    command: CreateTenantCommand,
    context: IUseCaseContext,
  ): Promise<void> {
    const request = {
      name: command.name,
      type: command.type,
      platformId: command.platformId,
      createdBy: command.createdBy,
      description: command.description,
    };

    await this.createTenantUseCase.execute(request, context);
  }
}

/**
 * 更新租户命令处理器
 *
 * @description 处理更新租户的命令
 */
@CommandHandler(UpdateTenantCommand)
export class UpdateTenantCommandHandler extends BaseCommandHandler<UpdateTenantCommand> {
  constructor(private readonly updateTenantUseCase: UpdateTenantUseCase) {
    super();
  }

  /**
   * 处理更新租户命令
   *
   * @param command - 更新租户命令
   * @param context - 执行上下文
   * @returns Promise<void>
   */
  async handle(
    command: UpdateTenantCommand,
    context: IUseCaseContext,
  ): Promise<void> {
    const request = {
      tenantId: command.tenantId,
      name: command.name,
      type: command.type,
      description: command.description,
      updatedBy: command.updatedBy,
    };

    await this.updateTenantUseCase.execute(request, context);
  }
}

/**
 * 删除租户命令处理器
 *
 * @description 处理删除租户的命令
 */
@CommandHandler(DeleteTenantCommand)
export class DeleteTenantCommandHandler extends BaseCommandHandler<DeleteTenantCommand> {
  constructor(private readonly deleteTenantUseCase: DeleteTenantUseCase) {
    super();
  }

  /**
   * 处理删除租户命令
   *
   * @param command - 删除租户命令
   * @param context - 执行上下文
   * @returns Promise<void>
   */
  async handle(
    command: DeleteTenantCommand,
    context: IUseCaseContext,
  ): Promise<void> {
    const request = {
      tenantId: command.tenantId,
      deletedBy: command.deletedBy,
      deleteReason: command.deleteReason,
    };

    await this.deleteTenantUseCase.execute(request, context);
  }
}

/**
 * 激活租户命令处理器
 *
 * @description 处理激活租户的命令
 */
@CommandHandler(ActivateTenantCommand)
export class ActivateTenantCommandHandler extends BaseCommandHandler<ActivateTenantCommand> {
  constructor(private readonly updateTenantUseCase: UpdateTenantUseCase) {
    super();
  }

  /**
   * 处理激活租户命令
   *
   * @param command - 激活租户命令
   * @param context - 执行上下文
   * @returns Promise<void>
   */
  async handle(
    command: ActivateTenantCommand,
    context: IUseCaseContext,
  ): Promise<void> {
    const request = {
      tenantId: command.tenantId,
      status: "ACTIVE",
      updatedBy: command.activatedBy,
    };

    await this.updateTenantUseCase.execute(request, context);
  }
}

/**
 * 停用租户命令处理器
 *
 * @description 处理停用租户的命令
 */
@CommandHandler(DeactivateTenantCommand)
export class DeactivateTenantCommandHandler extends BaseCommandHandler<DeactivateTenantCommand> {
  constructor(private readonly updateTenantUseCase: UpdateTenantUseCase) {
    super();
  }

  /**
   * 处理停用租户命令
   *
   * @param command - 停用租户命令
   * @param context - 执行上下文
   * @returns Promise<void>
   */
  async handle(
    command: DeactivateTenantCommand,
    context: IUseCaseContext,
  ): Promise<void> {
    const request = {
      tenantId: command.tenantId,
      status: "INACTIVE",
      updatedBy: command.deactivatedBy,
      description: command.deactivateReason,
    };

    await this.updateTenantUseCase.execute(request, context);
  }
}
