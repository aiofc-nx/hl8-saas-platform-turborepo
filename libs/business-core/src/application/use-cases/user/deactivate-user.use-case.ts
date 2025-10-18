/**
 * 停用用户用例
 *
 * @description 停用用户账户，禁止其使用系统
 *
 * ## 业务规则
 *
 * ### 停用规则
 * - 只有管理员可以停用用户
 * - 停用用户需要验证权限
 * - 停用用户需要记录审计日志
 * - 停用用户需要发布领域事件
 *
 * ### 验证规则
 * - 用户必须存在
 * - 停用者必须有权限
 * - 用户必须处于活跃状态
 * - 不能停用系统管理员
 *
 * @example
 * ```typescript
 * const deactivateUserUseCase = new DeactivateUserUseCase(userRepository, eventBus, transactionManager, logger);
 * 
 * const result = await deactivateUserUseCase.execute({
 *   userId: userId,
 *   deactivatedBy: 'admin',
 *   deactivateReason: '违反使用条款'
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
  BusinessRuleViolationException 
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 停用用户请求
 */
export interface DeactivateUserRequest {
  /** 用户ID */
  userId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 停用者 */
  deactivatedBy: string;
  /** 停用原因 */
  deactivateReason?: string;
}

/**
 * 停用用户响应
 */
export interface DeactivateUserResponse {
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
  /** 停用时间 */
  deactivatedAt: Date;
  /** 停用者 */
  deactivatedBy: string;
  /** 停用原因 */
  deactivateReason?: string;
}

/**
 * 停用用户用例接口
 */
export interface IDeactivateUserUseCase {
  execute(request: DeactivateUserRequest): Promise<DeactivateUserResponse>;
}

/**
 * 停用用户用例
 *
 * @description 停用用户账户，禁止其使用系统
 */
export class DeactivateUserUseCase extends BaseCommandUseCase<
  DeactivateUserRequest,
  DeactivateUserResponse
> implements IDeactivateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
    logger?: FastifyLoggerService,
  ) {
    super("DeactivateUser", "停用用户用例", "1.0.0", ["user:deactivate"], eventBus, transactionManager, logger);
  }

  /**
   * 执行停用用户命令
   *
   * @param request - 停用用户请求
   * @returns Promise<停用用户响应>
   */
  protected async executeCommand(
    request: DeactivateUserRequest,
    context: IUseCaseContext,
  ): Promise<DeactivateUserResponse> {
    this.validateRequest(request);
    await this.validateUserExists(request.userId, request.tenantId);
    await this.validateDeactivatePermissions(request, context);
    await this.validateUserCanBeDeactivated(request);
    
    const userAggregate = await this.userRepository.findById(request.userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", request.userId.toString());
    }

    // 停用用户
    userAggregate.deactivateUser(request.deactivatedBy, request.deactivateReason);
    
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
      deactivatedAt: new Date(),
      deactivatedBy: request.deactivatedBy,
      deactivateReason: request.deactivateReason,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 停用用户请求
   * @private
   */
  private validateRequest(request: DeactivateUserRequest): void {
    if (!request.userId) {
      throw new ValidationException(
        "USER_ID_REQUIRED",
        "用户ID不能为空",
        "用户ID是必填字段",
        400
      );
    }
    if (!request.tenantId) {
      throw new ValidationException(
        "TENANT_ID_REQUIRED",
        "租户ID不能为空",
        "租户ID是必填字段",
        400
      );
    }
    if (!request.deactivatedBy) {
      throw new ValidationException(
        "DEACTIVATED_BY_REQUIRED",
        "停用者不能为空",
        "停用者是必填字段",
        400
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
  private async validateUserExists(userId: EntityId, tenantId: TenantId): Promise<void> {
    const userAggregate = await this.userRepository.findById(userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", userId.toString());
    }
    if (!userAggregate.tenantId.equals(tenantId)) {
      throw new BusinessRuleViolationException(
        "用户不属于指定租户",
        { userId: userId.toString(), tenantId: tenantId.toString() }
      );
    }
  }

  /**
   * 验证停用权限
   *
   * @param request - 停用用户请求
   * @param context - 用例上下文
   * @private
   */
  private async validateDeactivatePermissions(
    request: DeactivateUserRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为管理员
    const isAdmin = context.user?.role === "ADMIN";
    
    if (!isAdmin) {
      throw new UnauthorizedOperationException(
        "停用用户",
        context.user?.id.toString()
      );
    }
  }

  /**
   * 验证用户是否可以被停用
   *
   * @param request - 停用用户请求
   * @private
   */
  private async validateUserCanBeDeactivated(request: DeactivateUserRequest): Promise<void> {
    const userAggregate = await this.userRepository.findById(request.userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", request.userId.toString());
    }

    const user = userAggregate.getUser();
    
    // 检查是否为系统管理员
    if (user.role === "SYSTEM_ADMIN") {
      throw new BusinessRuleViolationException(
        "不能停用系统管理员",
        { userId: request.userId.toString(), userRole: user.role }
      );
    }
    
    // 检查用户状态
    if (user.status === "INACTIVE") {
      throw new BusinessRuleViolationException(
        "用户已停用",
        { userId: request.userId.toString(), userStatus: user.status }
      );
    }
    
    if (user.status === "DELETED") {
      throw new BusinessRuleViolationException(
        "已删除的用户不能停用",
        { userId: request.userId.toString(), userStatus: user.status }
      );
    }
  }
}
