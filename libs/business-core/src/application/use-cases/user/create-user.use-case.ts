/**
 * 创建用户用例
 *
 * @description 实现创建用户的业务逻辑，包括验证、持久化和事件发布
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { BaseCommandUseCase } from "../base/base-command-use-case.js";
import { UserAggregate } from "../../domain/aggregates/user-aggregate.js";
import { User } from "../../domain/entities/user/user.entity.js";
import { UserStatus } from "../../domain/value-objects/types/user-status.vo.js";
import { UserRole } from "../../domain/value-objects/types/user-role.vo.js";
import type { IUserRepository } from "../../domain/repositories/user.repository.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BusinessRuleViolationException } from "../../domain/exceptions/base/base-domain-exception.js";

/**
 * 创建用户请求接口
 */
export interface CreateUserRequest {
  /** 用户名 */
  username: string;

  /** 邮箱地址 */
  email: string;

  /** 手机号码 */
  phone?: string;

  /** 用户姓名 */
  displayName: string;

  /** 用户角色 */
  role: UserRole;

  /** 用户描述 */
  description?: string;

  /** 创建者标识符 */
  createdBy: string;
}

/**
 * 创建用户响应接口
 */
export interface CreateUserResponse {
  /** 用户ID */
  userId: EntityId;

  /** 用户名 */
  username: string;

  /** 邮箱地址 */
  email: string;

  /** 用户姓名 */
  displayName: string;

  /** 用户角色 */
  role: UserRole;

  /** 租户ID */
  tenantId: TenantId;

  /** 创建时间 */
  createdAt: Date;
}

/**
 * 创建用户用例
 *
 * @description 负责创建新用户的业务逻辑，包括验证、持久化和事件发布
 */
export class CreateUserUseCase extends BaseCommandUseCase<
  CreateUserRequest,
  CreateUserResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly _logger: FastifyLoggerService,
  ) {
    super("CreateUser", "创建用户用例", "1.0.0", ["user:create"], _logger);
  }

  /**
   * 执行创建用户命令
   *
   * @description 创建新用户，包括验证、持久化和事件发布
   *
   * @param request - 创建用户请求
   * @param context - 用例执行上下文
   * @returns Promise<创建用户响应>
   *
   * @protected
   */
  protected async executeCommand(
    request: CreateUserRequest,
    context: IUseCaseContext,
  ): Promise<CreateUserResponse> {
    // 验证输入参数
    this.validateRequest(request);

    // 检查用户名唯一性
    await this.validateUsernameUniqueness(context.tenant!.id, request.username);

    // 检查邮箱唯一性
    await this.validateEmailUniqueness(context.tenant!.id, request.email);

    // 创建用户实体
    const user = this.createUserEntity(request, context);

    // 创建用户聚合根
    const userAggregate = new UserAggregate(
      EntityId.generate(),
      context.tenant!.id,
      user,
      this.buildAuditInfo(request.createdBy, context),
      this.logger,
    );

    // 保存用户（事务边界）
    await this.userRepository.save(userAggregate);

    // 发布领域事件
    await this.publishDomainEvents(userAggregate);

    // 返回响应
    return {
      userId: userAggregate.id,
      username: userAggregate.getUser().username,
      email: userAggregate.getUser().email,
      displayName: userAggregate.getUser().displayName,
      role: userAggregate.getUser().role,
      tenantId: userAggregate.tenantId,
      createdAt: userAggregate.getUser().createdAt,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 创建用户请求
   * @private
   */
  private validateRequest(request: CreateUserRequest): void {
    if (!request.username || !request.username.trim()) {
      throw new BusinessRuleViolationException(
        "用户名不能为空",
        "USERNAME_REQUIRED",
      );
    }

    if (request.username.trim().length > 50) {
      throw new BusinessRuleViolationException(
        "用户名长度不能超过50字符",
        "USERNAME_TOO_LONG",
      );
    }

    if (!request.email || !request.email.trim()) {
      throw new BusinessRuleViolationException(
        "邮箱地址不能为空",
        "EMAIL_REQUIRED",
      );
    }

    if (!request.displayName || !request.displayName.trim()) {
      throw new BusinessRuleViolationException(
        "用户姓名不能为空",
        "DISPLAY_NAME_REQUIRED",
      );
    }

    if (request.displayName.trim().length > 100) {
      throw new BusinessRuleViolationException(
        "用户姓名长度不能超过100字符",
        "DISPLAY_NAME_TOO_LONG",
      );
    }

    if (!request.role) {
      throw new BusinessRuleViolationException(
        "用户角色不能为空",
        "USER_ROLE_REQUIRED",
      );
    }

    if (!request.createdBy || !request.createdBy.trim()) {
      throw new BusinessRuleViolationException(
        "创建者标识符不能为空",
        "CREATED_BY_REQUIRED",
      );
    }
  }

  /**
   * 验证用户名唯一性
   *
   * @param tenantId - 租户ID
   * @param username - 用户名
   * @private
   */
  private async validateUsernameUniqueness(
    tenantId: TenantId,
    username: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByUsername(
      tenantId,
      username,
    );

    if (existingUser) {
      throw new BusinessRuleViolationException(
        `用户名 "${username}" 在同一租户下已存在`,
        "USERNAME_DUPLICATE",
      );
    }
  }

  /**
   * 验证邮箱唯一性
   *
   * @param tenantId - 租户ID
   * @param email - 邮箱地址
   * @private
   */
  private async validateEmailUniqueness(
    tenantId: TenantId,
    email: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(tenantId, email);

    if (existingUser) {
      throw new BusinessRuleViolationException(
        `邮箱地址 "${email}" 在同一租户下已存在`,
        "EMAIL_DUPLICATE",
      );
    }
  }

  /**
   * 创建用户实体
   *
   * @param request - 创建用户请求
   * @param context - 用例执行上下文
   * @returns 用户实体
   * @private
   */
  private createUserEntity(
    request: CreateUserRequest,
    context: IUseCaseContext,
  ): User {
    return new User(
      EntityId.generate(),
      {
        username: request.username.trim(),
        email: request.email.trim().toLowerCase(),
        phone: request.phone?.trim(),
        status: UserStatus.ACTIVE,
        role: request.role,
        displayName: request.displayName.trim(),
        description: request.description?.trim(),
        isActive: true,
        failedLoginAttempts: 0,
      },
      this.buildAuditInfo(request.createdBy, context),
      this.logger,
    );
  }
}
