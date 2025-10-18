/**
 * 激活用户用例
 *
 * @description 激活用户账户，使其可以正常使用系统
 *
 * ## 业务规则
 *
 * ### 激活规则
 * - 只有管理员可以激活用户
 * - 激活用户需要验证权限
 * - 激活用户需要记录审计日志
 * - 激活用户需要发布领域事件
 *
 * ### 验证规则
 * - 用户必须存在
 * - 激活者必须有权限
 * - 用户必须处于未激活状态
 * - 激活后用户状态变为活跃
 *
 * @example
 * ```typescript
 * const activateUserUseCase = new ActivateUserUseCase(userRepository, eventBus, transactionManager, logger);
 *
 * const result = await activateUserUseCase.execute({
 *   userId: userId,
 *   activatedBy: 'admin'
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BaseCommandUseCase } from "../base/base-command-use-case.js";
import type { IUseCaseContext } from "../use-case.interface.js";
import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { IEventBus } from "../../ports/event-bus.interface.js";
import type { ITransactionManager } from "../../ports/transaction-manager.interface.js";
import {
  ValidationException,
  ResourceNotFoundException,
  UnauthorizedOperationException,
  BusinessRuleViolationException,
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 激活用户请求
 */
export interface ActivateUserRequest {
  /** 用户ID */
  userId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 激活者 */
  activatedBy: string;
  /** 激活原因 */
  activateReason?: string;
}

/**
 * 激活用户响应
 */
export interface ActivateUserResponse {
  /** 用户ID */
  userId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 状态 */
  status: string;
  /** 激活时间 */
  activatedAt: Date;
  /** 激活者 */
  activatedBy: string;
}

/**
 * 激活用户用例接口
 */
export interface IActivateUserUseCase {
  execute(request: ActivateUserRequest): Promise<ActivateUserResponse>;
}

/**
 * 激活用户用例
 *
 * @description 激活用户账户，使其可以正常使用系统
 */
export class ActivateUserUseCase
  extends BaseCommandUseCase<ActivateUserRequest, ActivateUserResponse>
  implements IActivateUserUseCase
{
  constructor(
    private readonly userRepository: IUserRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
    logger?: FastifyLoggerService,
  ) {
    super(
      "ActivateUser",
      "激活用户用例",
      "1.0.0",
      ["user:activate"],
      eventBus,
      transactionManager,
      logger,
    );
  }

  /**
   * 执行激活用户命令
   *
   * @param request - 激活用户请求
   * @returns Promise<激活用户响应>
   */
  protected async executeCommand(
    request: ActivateUserRequest,
    context: IUseCaseContext,
  ): Promise<ActivateUserResponse> {
    this.validateRequest(request);
    await this.validateUserExists(request.userId, request.tenantId);
    await this.validateActivatePermissions(request, context);
    await this.validateUserCanBeActivated(request);

    const userAggregate = await this.userRepository.findById(request.userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", request.userId.toString());
    }

    // 激活用户
    userAggregate.activateUser(request.activatedBy, request.activateReason);

    // 保存用户
    await this.userRepository.save(userAggregate);

    // 发布领域事件
    await this.publishDomainEvents(userAggregate);

    const user = userAggregate.getUser();
    return {
      userId: userAggregate.id,
      tenantId: userAggregate.tenantId,
      username: user.username,
      email: user.email,
      status: user.status,
      activatedAt: new Date(),
      activatedBy: request.activatedBy,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 激活用户请求
   * @private
   */
  private validateRequest(request: ActivateUserRequest): void {
    if (!request.userId) {
      throw new ValidationException(
        "USER_ID_REQUIRED",
        "用户ID不能为空",
        "用户ID是必填字段",
        400,
      );
    }
    if (!request.tenantId) {
      throw new ValidationException(
        "TENANT_ID_REQUIRED",
        "租户ID不能为空",
        "租户ID是必填字段",
        400,
      );
    }
    if (!request.activatedBy) {
      throw new ValidationException(
        "ACTIVATED_BY_REQUIRED",
        "激活者不能为空",
        "激活者是必填字段",
        400,
      );
    }
  }

  /**
   * 验证用户是否存在
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @private
   */
  private async validateUserExists(
    userId: EntityId,
    tenantId: TenantId,
  ): Promise<void> {
    const userAggregate = await this.userRepository.findById(userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", userId.toString());
    }
    if (!userAggregate.tenantId.equals(tenantId)) {
      throw new BusinessRuleViolationException("用户不属于指定租户", {
        userId: userId.toString(),
        tenantId: tenantId.toString(),
      });
    }
  }

  /**
   * 验证激活权限
   *
   * @param request - 激活用户请求
   * @param context - 用例上下文
   * @private
   */
  private async validateActivatePermissions(
    request: ActivateUserRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为管理员
    const isAdmin = context.user?.role === "ADMIN";

    if (!isAdmin) {
      throw new UnauthorizedOperationException(
        "激活用户",
        context.user?.id.toString(),
      );
    }
  }

  /**
   * 验证用户是否可以被激活
   *
   * @param request - 激活用户请求
   * @private
   */
  private async validateUserCanBeActivated(
    request: ActivateUserRequest,
  ): Promise<void> {
    const userAggregate = await this.userRepository.findById(request.userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", request.userId.toString());
    }

    const user = userAggregate.getUser();

    // 检查用户状态
    if (user.status === "ACTIVE") {
      throw new BusinessRuleViolationException("用户已激活", {
        userId: request.userId.toString(),
        userStatus: user.status,
      });
    }

    if (user.status === "DELETED") {
      throw new BusinessRuleViolationException("已删除的用户不能激活", {
        userId: request.userId.toString(),
        userStatus: user.status,
      });
    }
  }
}
