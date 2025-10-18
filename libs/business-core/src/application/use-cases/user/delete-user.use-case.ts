/**
 * 删除用户用例
 *
 * @description 删除用户，包括软删除和硬删除
 *
 * ## 业务规则
 *
 * ### 删除规则
 * - 只有管理员可以删除用户
 * - 删除用户需要验证权限
 * - 删除用户需要记录审计日志
 * - 删除用户需要发布领域事件
 *
 * ### 验证规则
 * - 用户必须存在
 * - 删除者必须有权限
 * - 不能删除系统管理员
 * - 删除前需要检查关联数据
 *
 * @example
 * ```typescript
 * const deleteUserUseCase = new DeleteUserUseCase(userRepository, eventBus, transactionManager, logger);
 * 
 * const result = await deleteUserUseCase.execute({
 *   userId: userId,
 *   deletedBy: 'admin',
 *   deleteReason: '用户请求删除'
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
 * 删除用户请求
 */
export interface DeleteUserRequest {
  /** 用户ID */
  userId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 删除者 */
  deletedBy: string;
  /** 删除原因 */
  deleteReason?: string;
  /** 是否强制删除 */
  forceDelete?: boolean;
}

/**
 * 删除用户响应
 */
export interface DeleteUserResponse {
  /** 用户ID */
  userId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 删除时间 */
  deletedAt: Date;
  /** 删除者 */
  deletedBy: string;
  /** 删除原因 */
  deleteReason?: string;
}

/**
 * 删除用户用例接口
 */
export interface IDeleteUserUseCase {
  execute(request: DeleteUserRequest): Promise<DeleteUserResponse>;
}

/**
 * 删除用户用例
 *
 * @description 删除用户，包括软删除和硬删除
 */
export class DeleteUserUseCase extends BaseCommandUseCase<
  DeleteUserRequest,
  DeleteUserResponse
> implements IDeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
    logger?: FastifyLoggerService,
  ) {
    super("DeleteUser", "删除用户用例", "1.0.0", ["user:delete"], eventBus, transactionManager, logger);
  }

  /**
   * 执行删除用户命令
   *
   * @param request - 删除用户请求
   * @returns Promise<删除用户响应>
   */
  protected async executeCommand(
    request: DeleteUserRequest,
    context: IUseCaseContext,
  ): Promise<DeleteUserResponse> {
    this.validateRequest(request);
    await this.validateUserExists(request.userId, request.tenantId);
    await this.validateDeletePermissions(request, context);
    await this.validateUserCanBeDeleted(request);
    
    const userAggregate = await this.userRepository.findById(request.userId);
    if (!userAggregate) {
      throw new Error("用户不存在");
    }

    // 删除用户
    userAggregate.deleteUser(request.deletedBy, request.deleteReason);
    
    // 保存用户
    await this.userRepository.save(userAggregate);
    
    // 发布领域事件
    await this.publishDomainEvents(userAggregate);

    return {
      userId: userAggregate.id,
      tenantId: userAggregate.tenantId,
      deletedAt: new Date(),
      deletedBy: request.deletedBy,
      deleteReason: request.deleteReason,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 删除用户请求
   * @private
   */
  private validateRequest(request: DeleteUserRequest): void {
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
    if (!request.deletedBy) {
      throw new ValidationException(
        "DELETED_BY_REQUIRED",
        "删除者不能为空",
        "删除者是必填字段",
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
   * 验证删除权限
   *
   * @param request - 删除用户请求
   * @param context - 用例上下文
   * @private
   */
  private async validateDeletePermissions(
    request: DeleteUserRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为管理员
    const isAdmin = context.user?.role === "ADMIN";
    
    if (!isAdmin) {
      throw new UnauthorizedOperationException(
        "删除用户",
        context.user?.id.toString()
      );
    }
  }

  /**
   * 验证用户是否可以被删除
   *
   * @param request - 删除用户请求
   * @private
   */
  private async validateUserCanBeDeleted(request: DeleteUserRequest): Promise<void> {
    const userAggregate = await this.userRepository.findById(request.userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", request.userId.toString());
    }

    const user = userAggregate.getUser();
    
    // 检查是否为系统管理员
    if (user.role === "SYSTEM_ADMIN") {
      throw new BusinessRuleViolationException(
        "不能删除系统管理员",
        { userId: request.userId.toString(), userRole: user.role }
      );
    }
    
    // 检查用户状态
    if (user.status === "DELETED") {
      throw new BusinessRuleViolationException(
        "用户已被删除",
        { userId: request.userId.toString(), userStatus: user.status }
      );
    }
  }
}
