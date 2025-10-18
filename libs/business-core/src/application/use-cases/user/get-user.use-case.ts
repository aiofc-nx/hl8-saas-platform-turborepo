/**
 * 获取用户用例
 *
 * @description 获取单个用户的详细信息
 *
 * ## 业务规则
 *
 * ### 查询规则
 * - 只有用户本人或管理员可以查看用户信息
 * - 查询用户需要验证权限
 * - 查询用户需要支持缓存
 * - 查询用户需要记录审计日志
 *
 * ### 验证规则
 * - 用户必须存在
 * - 查询者必须有权限
 * - 查询结果需要过滤敏感信息
 *
 * @example
 * ```typescript
 * const getUserUseCase = new GetUserUseCase(userRepository, cacheService, logger);
 * 
 * const result = await getUserUseCase.execute({
 *   userId: userId,
 *   tenantId: tenantId
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BaseQueryUseCase } from "../base/base-query-use-case.js";
import type { IUseCaseContext } from "../use-case.interface.js";
import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { ICacheService } from "../../ports/cache-service.interface.js";
import { 
  ValidationException, 
  ResourceNotFoundException, 
  UnauthorizedOperationException,
  BusinessRuleViolationException 
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 获取用户请求
 */
export interface GetUserRequest {
  /** 用户ID */
  userId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 是否包含敏感信息 */
  includeSensitiveInfo?: boolean;
}

/**
 * 获取用户响应
 */
export interface GetUserResponse {
  /** 用户信息 */
  user: {
    /** 用户ID */
    id: EntityId;
    /** 租户ID */
    tenantId: TenantId;
    /** 用户名 */
    username: string;
    /** 显示名称 */
    displayName: string;
    /** 邮箱 */
    email: string;
    /** 手机号 */
    phoneNumber?: string;
    /** 头像URL */
    avatarUrl?: string;
    /** 角色 */
    role: string;
    /** 状态 */
    status: string;
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
  };
}

/**
 * 获取用户用例接口
 */
export interface IGetUserUseCase {
  execute(request: GetUserRequest): Promise<GetUserResponse>;
}

/**
 * 获取用户用例
 *
 * @description 获取单个用户的详细信息
 */
export class GetUserUseCase extends BaseQueryUseCase<
  GetUserRequest,
  GetUserResponse
> implements IGetUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    cacheService?: ICacheService,
    logger?: FastifyLoggerService,
  ) {
    super("GetUser", "获取用户用例", "1.0.0", ["user:read"], cacheService, logger);
  }

  /**
   * 执行获取用户查询
   *
   * @param request - 获取用户请求
   * @returns Promise<获取用户响应>
   */
  protected async executeQuery(
    request: GetUserRequest,
    context: IUseCaseContext,
  ): Promise<GetUserResponse> {
    this.validateRequest(request);
    await this.validateUserExists(request.userId, request.tenantId);
    await this.validateQueryPermissions(request, context);
    
    // 尝试从缓存获取
    const cacheKey = this.getCacheKey(request);
    const cachedResult = await this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // 从数据库获取
    const userAggregate = await this.userRepository.findById(request.userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", request.userId.toString());
    }

    const user = userAggregate.getUser();
    const result: GetUserResponse = {
      user: {
        id: userAggregate.id,
        tenantId: userAggregate.tenantId,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    // 缓存结果
    await this.cacheResult(cacheKey, result, 300); // 5分钟缓存

    return result;
  }

  /**
   * 验证请求参数
   *
   * @param request - 获取用户请求
   * @private
   */
  private validateRequest(request: GetUserRequest): void {
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
   * 验证查询权限
   *
   * @param request - 获取用户请求
   * @param context - 用例上下文
   * @private
   */
  private async validateQueryPermissions(
    request: GetUserRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为用户本人或管理员
    const isSelf = context.user?.id.equals(request.userId);
    const isAdmin = context.user?.role === "ADMIN";
    
    if (!isSelf && !isAdmin) {
      throw new UnauthorizedOperationException(
        "查询用户信息",
        context.user?.id.toString()
      );
    }
  }

  /**
   * 获取缓存键
   *
   * @param request - 获取用户请求
   * @returns 缓存键
   * @private
   */
  private getCacheKey(request: GetUserRequest): string {
    return `user:${request.userId.toString()}:${request.tenantId.toString()}`;
  }
}
