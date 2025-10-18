/**
 * 租户命令处理器
 *
 * @description 处理租户相关的命令，包括创建、更新、删除等操作
 *
 * ## 业务规则
 *
 * ### 命令处理规则
 * - 每个命令处理器只处理一种类型的命令
 * - 命令处理器应该验证命令的有效性
 * - 命令处理器应该执行业务逻辑
 * - 命令处理器应该返回处理结果
 *
 * ### 命令验证规则
 * - 验证命令参数的有效性
 * - 验证业务规则的一致性
 * - 验证权限和访问控制
 * - 验证数据完整性
 *
 * ### 命令执行规则
 * - 命令执行应该是幂等的
 * - 命令执行应该有事务保护
 * - 命令执行失败时应该回滚
 * - 命令执行成功时应该发布事件
 *
 * @example
 * ```typescript
 * // 创建租户命令处理器
 * const handler = new CreateTenantCommandHandler(createTenantUseCase, logger);
 * 
 * // 处理创建租户命令
 * const result = await handler.handle(createTenantCommand);
 * ```
 *
 * @since 1.0.0
 */

import { EntityId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type { ICreateTenantUseCase } from "../../../use-cases/tenant/create-tenant.use-case.js";
import type { IUpdateTenantUseCase } from "../../../use-cases/tenant/update-tenant.use-case.js";
import type { IDeleteTenantUseCase } from "../../../use-cases/tenant/delete-tenant.use-case.js";
import type { IActivateTenantUseCase } from "../../../use-cases/tenant/activate-tenant.use-case.js";
import type { IDeactivateTenantUseCase } from "../../../use-cases/tenant/deactivate-tenant.use-case.js";

// 命令类型
import { CreateTenantCommand } from "../../commands/tenant-commands.js";
import { UpdateTenantCommand } from "../../commands/tenant-commands.js";
import { DeleteTenantCommand } from "../../commands/tenant-commands.js";
import { ActivateTenantCommand } from "../../commands/tenant-commands.js";
import { DeactivateTenantCommand } from "../../commands/tenant-commands.js";

// 输入输出类型
import type { CreateTenantRequest, CreateTenantResponse } from "../../../use-cases/tenant/create-tenant.use-case.js";
import type { UpdateTenantRequest, UpdateTenantResponse } from "../../../use-cases/tenant/update-tenant.use-case.js";
import type { DeleteTenantRequest, DeleteTenantResponse } from "../../../use-cases/tenant/delete-tenant.use-case.js";
import type { ActivateTenantRequest, ActivateTenantResponse } from "../../../use-cases/tenant/activate-tenant.use-case.js";
import type { DeactivateTenantRequest, DeactivateTenantResponse } from "../../../use-cases/tenant/deactivate-tenant.use-case.js";

/**
 * 创建租户命令处理器
 *
 * @description 处理创建租户的命令
 */
export class CreateTenantCommandHandler {
  constructor(
    private readonly createTenantUseCase: ICreateTenantUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理创建租户命令
   *
   * @param command - 创建租户命令
   * @returns Promise<创建租户结果>
   */
  async handle(command: CreateTenantCommand): Promise<CreateTenantResponse> {
    try {
      this.logger.info("开始处理创建租户命令", {
        name: command.name,
        type: command.type.value,
        platformId: command.platformId.toString(),
      });

      const request: CreateTenantRequest = {
        name: command.name,
        type: command.type,
        platformId: command.platformId,
        createdBy: command.createdBy,
      };

      const response = await this.createTenantUseCase.execute(request);

      this.logger.info("创建租户命令处理成功", {
        tenantId: response.tenantId.toString(),
        name: response.name,
      });

      return response;
    } catch (error) {
      this.logger.error("创建租户命令处理失败", {
        error: error.message,
        name: command.name,
        platformId: command.platformId.toString(),
      });
      throw error;
    }
  }
}

/**
 * 更新租户命令处理器
 *
 * @description 处理更新租户的命令
 */
export class UpdateTenantCommandHandler {
  constructor(
    private readonly updateTenantUseCase: IUpdateTenantUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理更新租户命令
   *
   * @param command - 更新租户命令
   * @returns Promise<更新租户结果>
   */
  async handle(command: UpdateTenantCommand): Promise<UpdateTenantResponse> {
    try {
      this.logger.info("开始处理更新租户命令", {
        tenantId: command.tenantId.toString(),
        name: command.name,
        type: command.type?.value,
      });

      const request: UpdateTenantRequest = {
        tenantId: command.tenantId,
        name: command.name,
        type: command.type,
        description: command.description,
        updatedBy: command.updatedBy,
      };

      const response = await this.updateTenantUseCase.execute(request);

      this.logger.info("更新租户命令处理成功", {
        tenantId: response.tenantId.toString(),
      });

      return response;
    } catch (error) {
      this.logger.error("更新租户命令处理失败", {
        error: error.message,
        tenantId: command.tenantId.toString(),
      });
      throw error;
    }
  }
}

/**
 * 删除租户命令处理器
 *
 * @description 处理删除租户的命令
 */
export class DeleteTenantCommandHandler {
  constructor(
    private readonly deleteTenantUseCase: IDeleteTenantUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理删除租户命令
   *
   * @param command - 删除租户命令
   * @returns Promise<删除租户结果>
   */
  async handle(command: DeleteTenantCommand): Promise<DeleteTenantResponse> {
    try {
      this.logger.info("开始处理删除租户命令", {
        tenantId: command.tenantId.toString(),
        deleteReason: command.deleteReason,
      });

      const request: DeleteTenantRequest = {
        tenantId: command.tenantId,
        deletedBy: command.deletedBy,
        deleteReason: command.deleteReason,
      };

      const response = await this.deleteTenantUseCase.execute(request);

      this.logger.info("删除租户命令处理成功", {
        tenantId: response.tenantId.toString(),
      });

      return response;
    } catch (error) {
      this.logger.error("删除租户命令处理失败", {
        error: error.message,
        tenantId: command.tenantId.toString(),
      });
      throw error;
    }
  }
}

/**
 * 激活租户命令处理器
 *
 * @description 处理激活租户的命令
 */
export class ActivateTenantCommandHandler {
  constructor(
    private readonly activateTenantUseCase: IActivateTenantUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理激活租户命令
   *
   * @param command - 激活租户命令
   * @returns Promise<激活租户结果>
   */
  async handle(command: ActivateTenantCommand): Promise<ActivateTenantResponse> {
    try {
      this.logger.info("开始处理激活租户命令", {
        tenantId: command.tenantId.toString(),
        activatedBy: command.activatedBy,
      });

      const request: ActivateTenantRequest = {
        tenantId: command.tenantId,
        activatedBy: command.activatedBy,
      };

      const response = await this.activateTenantUseCase.execute(request);

      this.logger.info("激活租户命令处理成功", {
        tenantId: response.tenantId.toString(),
      });

      return response;
    } catch (error) {
      this.logger.error("激活租户命令处理失败", {
        error: error.message,
        tenantId: command.tenantId.toString(),
      });
      throw error;
    }
  }
}

/**
 * 停用租户命令处理器
 *
 * @description 处理停用租户的命令
 */
export class DeactivateTenantCommandHandler {
  constructor(
    private readonly deactivateTenantUseCase: IDeactivateTenantUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 处理停用租户命令
   *
   * @param command - 停用租户命令
   * @returns Promise<停用租户结果>
   */
  async handle(command: DeactivateTenantCommand): Promise<DeactivateTenantResponse> {
    try {
      this.logger.info("开始处理停用租户命令", {
        tenantId: command.tenantId.toString(),
        deactivateReason: command.deactivateReason,
      });

      const request: DeactivateTenantRequest = {
        tenantId: command.tenantId,
        deactivatedBy: command.deactivatedBy,
        deactivateReason: command.deactivateReason,
      };

      const response = await this.deactivateTenantUseCase.execute(request);

      this.logger.info("停用租户命令处理成功", {
        tenantId: response.tenantId.toString(),
      });

      return response;
    } catch (error) {
      this.logger.error("停用租户命令处理失败", {
        error: error.message,
        tenantId: command.tenantId.toString(),
      });
      throw error;
    }
  }
}