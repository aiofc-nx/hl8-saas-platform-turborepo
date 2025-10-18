/**
 * 用户命令处理器
 *
 * @description 处理用户相关的命令，包括创建、更新、删除、激活、停用等
 *
 * ## 业务规则
 *
 * ### 命令处理规则
 * - 命令处理器负责接收命令并委托给相应的用例服务
 * - 命令处理器不包含业务逻辑，只负责参数转换和委托
 * - 命令处理器负责异常处理和日志记录
 * - 命令处理器支持事务管理
 *
 * ### 权限验证规则
 * - 命令处理器需要验证用户权限
 * - 权限验证失败时应该抛出异常
 * - 权限验证通过后才能执行用例服务
 *
 * @example
 * ```typescript
 * // 创建用户命令处理器
 * const createUserCommandHandler = new CreateUserCommandHandler(createUserUseCase, logger);
 * 
 * // 处理创建用户命令
 * const result = await createUserCommandHandler.execute(createUserCommand);
 * ```
 *
 * @since 1.0.0
 */

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

// 命令
import { CreateUserCommand } from "../../commands/user-commands.js";
import { UpdateUserCommand } from "../../commands/user-commands.js";
import { DeleteUserCommand } from "../../commands/user-commands.js";
import { ActivateUserCommand } from "../../commands/user-commands.js";
import { DeactivateUserCommand } from "../../commands/user-commands.js";

// 用例服务
import type { ICreateUserUseCase, CreateUserRequest, CreateUserResponse } from "../../../use-cases/user/create-user.use-case.js";
import type { IUpdateUserUseCase, UpdateUserRequest, UpdateUserResponse } from "../../../use-cases/user/update-user.use-case.js";
import type { IDeleteUserUseCase, DeleteUserRequest, DeleteUserResponse } from "../../../use-cases/user/delete-user.use-case.js";
import type { IActivateUserUseCase, ActivateUserRequest, ActivateUserResponse } from "../../../use-cases/user/activate-user.use-case.js";
import type { IDeactivateUserUseCase, DeactivateUserRequest, DeactivateUserResponse } from "../../../use-cases/user/deactivate-user.use-case.js";

// 输入输出类型
import { CreateUserInput, CreateUserOutput } from "../../../use-cases/user/create-user.use-case.js";
import { UpdateUserInput, UpdateUserOutput } from "../../../use-cases/user/update-user.use-case.js";
import { DeleteUserInput, DeleteUserOutput } from "../../../use-cases/user/delete-user.use-case.js";
import { ActivateUserInput, ActivateUserOutput } from "../../../use-cases/user/activate-user.use-case.js";
import { DeactivateUserInput, DeactivateUserOutput } from "../../../use-cases/user/deactivate-user.use-case.js";

/**
 * 创建用户命令处理器
 *
 * @description 处理CreateUserCommand，委托给CreateUserUseCase执行业务逻辑
 */
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, CreateUserResponse> {
  constructor(
    private readonly createUserUseCase: ICreateUserUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResponse> {
    this.logger.info("处理创建用户命令", {
      commandId: command.id,
      username: command.username,
      email: command.email,
    });

    try {
      const request: CreateUserRequest = {
        username: command.username,
        email: command.email,
        phoneNumber: command.phoneNumber,
        displayName: command.displayName,
        role: command.role,
        tenantId: command.tenantId,
        createdBy: command.createdBy,
        description: command.description,
      };

      const result = await this.createUserUseCase.execute(request);

      this.logger.info("创建用户命令处理成功", {
        commandId: command.id,
        userId: result.userId.toString(),
      });

      return result;
    } catch (error) {
      this.logger.error("创建用户命令处理失败", {
        commandId: command.id,
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * 更新用户命令处理器
 *
 * @description 处理UpdateUserCommand，委托给UpdateUserUseCase执行业务逻辑
 */
@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand, UpdateUserResponse> {
  constructor(
    private readonly updateUserUseCase: IUpdateUserUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UpdateUserResponse> {
    this.logger.info("处理更新用户命令", {
      commandId: command.id,
      userId: command.userId.toString(),
    });

    try {
      const request: UpdateUserRequest = {
        userId: command.userId,
        tenantId: command.tenantId,
        displayName: command.displayName,
        email: command.email,
        phoneNumber: command.phoneNumber,
        avatarUrl: command.avatarUrl,
        role: command.role,
        updatedBy: command.updatedBy,
        updateReason: command.updateReason,
      };

      const result = await this.updateUserUseCase.execute(request);

      this.logger.info("更新用户命令处理成功", {
        commandId: command.id,
        userId: result.userId.toString(),
      });

      return result;
    } catch (error) {
      this.logger.error("更新用户命令处理失败", {
        commandId: command.id,
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * 删除用户命令处理器
 *
 * @description 处理DeleteUserCommand，委托给DeleteUserUseCase执行业务逻辑
 */
@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements ICommandHandler<DeleteUserCommand, DeleteUserResponse> {
  constructor(
    private readonly deleteUserUseCase: IDeleteUserUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<DeleteUserResponse> {
    this.logger.info("处理删除用户命令", {
      commandId: command.id,
      userId: command.userId.toString(),
    });

    try {
      const request: DeleteUserRequest = {
        userId: command.userId,
        tenantId: command.tenantId,
        deletedBy: command.deletedBy,
        deleteReason: command.deleteReason,
        forceDelete: command.forceDelete,
      };

      const result = await this.deleteUserUseCase.execute(request);

      this.logger.info("删除用户命令处理成功", {
        commandId: command.id,
        userId: result.userId.toString(),
      });

      return result;
    } catch (error) {
      this.logger.error("删除用户命令处理失败", {
        commandId: command.id,
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * 激活用户命令处理器
 *
 * @description 处理ActivateUserCommand，委托给ActivateUserUseCase执行业务逻辑
 */
@CommandHandler(ActivateUserCommand)
export class ActivateUserCommandHandler implements ICommandHandler<ActivateUserCommand, ActivateUserResponse> {
  constructor(
    private readonly activateUserUseCase: IActivateUserUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  async execute(command: ActivateUserCommand): Promise<ActivateUserResponse> {
    this.logger.info("处理激活用户命令", {
      commandId: command.id,
      userId: command.userId.toString(),
    });

    try {
      const request: ActivateUserRequest = {
        userId: command.userId,
        tenantId: command.tenantId,
        activatedBy: command.activatedBy,
        activateReason: command.activateReason,
      };

      const result = await this.activateUserUseCase.execute(request);

      this.logger.info("激活用户命令处理成功", {
        commandId: command.id,
        userId: result.userId.toString(),
      });

      return result;
    } catch (error) {
      this.logger.error("激活用户命令处理失败", {
        commandId: command.id,
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * 停用用户命令处理器
 *
 * @description 处理DeactivateUserCommand，委托给DeactivateUserUseCase执行业务逻辑
 */
@CommandHandler(DeactivateUserCommand)
export class DeactivateUserCommandHandler implements ICommandHandler<DeactivateUserCommand, DeactivateUserResponse> {
  constructor(
    private readonly deactivateUserUseCase: IDeactivateUserUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  async execute(command: DeactivateUserCommand): Promise<DeactivateUserResponse> {
    this.logger.info("处理停用用户命令", {
      commandId: command.id,
      userId: command.userId.toString(),
    });

    try {
      const request: DeactivateUserRequest = {
        userId: command.userId,
        tenantId: command.tenantId,
        deactivatedBy: command.deactivatedBy,
        deactivateReason: command.deactivateReason,
      };

      const result = await this.deactivateUserUseCase.execute(request);

      this.logger.info("停用用户命令处理成功", {
        commandId: command.id,
        userId: result.userId.toString(),
      });

      return result;
    } catch (error) {
      this.logger.error("停用用户命令处理失败", {
        commandId: command.id,
        error: error.message,
      });
      throw error;
    }
  }
}
