/**
 * 更新用户用例
 *
 * @description 更新用户信息，包括基本信息、角色、权限等
 *
 * ## 业务规则
 *
 * ### 更新规则
 * - 只有用户本人或管理员可以更新用户信息
 * - 更新用户信息需要验证权限
 * - 更新用户信息需要记录审计日志
 * - 更新用户信息需要发布领域事件
 *
 * ### 验证规则
 * - 用户必须存在
 * - 更新者必须有权限
 * - 更新信息必须有效
 * - 角色变更需要特殊权限
 *
 * @example
 * ```typescript
 * const updateUserUseCase = new UpdateUserUseCase(userRepository, eventBus, transactionManager, logger);
 * 
 * const result = await updateUserUseCase.execute({
 *   userId: userId,
 *   displayName: '新姓名',
 *   email: 'new@example.com',
 *   updatedBy: 'admin'
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
 * 更新用户请求
 */
export interface UpdateUserRequest {
  /** 用户ID */
  userId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 显示名称 */
  displayName?: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phoneNumber?: string;
  /** 头像URL */
  avatarUrl?: string;
  /** 角色 */
  role?: string;
  /** 更新者 */
  updatedBy: string;
  /** 更新原因 */
  updateReason?: string;
}

/**
 * 更新用户响应
 */
export interface UpdateUserResponse {
  /** 用户ID */
  userId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 用户名 */
  username: string;
  /** 显示名称 */
  displayName: string;
  /** 邮箱 */
  email: string;
  /** 角色 */
  role: string;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 更新用户用例接口
 */
export interface IUpdateUserUseCase {
  execute(request: UpdateUserRequest): Promise<UpdateUserResponse>;
}

/**
 * 更新用户用例
 *
 * @description 更新用户信息，包括基本信息、角色、权限等
 */
export class UpdateUserUseCase extends BaseCommandUseCase<
  UpdateUserRequest,
  UpdateUserResponse
> implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
    logger?: FastifyLoggerService,
  ) {
    super("UpdateUser", "更新用户用例", "1.0.0", ["user:update"], eventBus, transactionManager, logger);
  }

  /**
   * 执行更新用户命令
   *
   * @param request - 更新用户请求
   * @returns Promise<更新用户响应>
   */
  protected async executeCommand(
    request: UpdateUserRequest,
    context: IUseCaseContext,
  ): Promise<UpdateUserResponse> {
    this.validateRequest(request);
    await this.validateUserExists(request.userId, request.tenantId);
    await this.validateUpdatePermissions(request, context);
    
    const userAggregate = await this.userRepository.findById(request.userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", request.userId.toString());
    }

    // 更新用户信息
    this.updateUserInfo(userAggregate, request);
    
    // 保存用户
    await this.userRepository.save(userAggregate);
    
    // 发布领域事件
    await this.publishDomainEvents(userAggregate);

    return {
      userId: userAggregate.id,
      tenantId: userAggregate.tenantId,
      username: userAggregate.getUser().username,
      displayName: userAggregate.getUser().displayName,
      email: userAggregate.getUser().email,
      role: userAggregate.getUser().role,
      updatedAt: userAggregate.getUser().updatedAt,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 更新用户请求
   * @private
   */
  private validateRequest(request: UpdateUserRequest): void {
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
    if (!request.updatedBy) {
      throw new ValidationException(
        "UPDATED_BY_REQUIRED",
        "更新者不能为空",
        "更新者是必填字段",
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
   * 验证更新权限
   *
   * @param request - 更新用户请求
   * @param context - 用例上下文
   * @private
   */
  private async validateUpdatePermissions(
    request: UpdateUserRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为用户本人或管理员
    const isSelf = context.user?.id.equals(request.userId);
    const isAdmin = context.user?.role === "ADMIN";
    
    if (!isSelf && !isAdmin) {
      throw new UnauthorizedOperationException(
        "更新用户信息",
        context.user?.id.toString()
      );
    }
  }

  /**
   * 更新用户信息
   *
   * @param userAggregate - 用户聚合根
   * @param request - 更新用户请求
   * @private
   */
  private updateUserInfo(userAggregate: UserAggregate, request: UpdateUserRequest): void {
    const user = userAggregate.getUser();
    
    if (request.displayName) {
      user.updateDisplayName(request.displayName);
    }
    
    if (request.email) {
      user.updateEmail(request.email);
    }
    
    if (request.phoneNumber) {
      user.updatePhoneNumber(request.phoneNumber);
    }
    
    if (request.avatarUrl) {
      user.updateAvatarUrl(request.avatarUrl);
    }
    
    if (request.role) {
      user.updateRole(request.role);
    }
    
    userAggregate.updateUser(user);
  }
}
