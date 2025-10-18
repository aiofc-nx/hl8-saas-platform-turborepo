/**
 * 用户查询处理器
 *
 * @description 处理用户相关的查询，包括获取单个用户、获取用户列表等
 *
 * ## 业务规则
 *
 * ### 查询处理规则
 * - 查询处理器负责接收查询并委托给相应的用例服务
 * - 查询处理器不包含业务逻辑，只负责参数转换和委托
 * - 查询处理器负责异常处理和日志记录
 * - 查询处理器支持缓存机制
 *
 * ### 权限验证规则
 * - 查询处理器需要验证用户权限
 * - 权限验证失败时应该抛出异常
 * - 权限验证通过后才能执行用例服务
 *
 * @example
 * ```typescript
 * // 获取用户查询处理器
 * const getUserQueryHandler = new GetUserQueryHandler(getUserUseCase, logger);
 *
 * // 处理获取用户查询
 * const result = await getUserQueryHandler.execute(getUserQuery);
 * ```
 *
 * @since 1.0.0
 */

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

// 查询
import { GetUserQuery } from "../../queries/user-queries.js";
import { GetUserListQuery } from "../../queries/user-queries.js";

// 用例服务
import type {
  IGetUserUseCase,
  GetUserRequest,
  GetUserResponse,
} from "../../../use-cases/user/get-user.use-case.js";
import type {
  IGetUserListUseCase,
  GetUserListRequest,
  GetUserListResponse,
} from "../../../use-cases/user/get-user-list.use-case.js";

/**
 * 获取用户查询处理器
 *
 * @description 处理GetUserQuery，委托给GetUserUseCase执行查询逻辑
 */
@QueryHandler(GetUserQuery)
export class GetUserQueryHandler
  implements IQueryHandler<GetUserQuery, GetUserResponse>
{
  constructor(
    private readonly getUserUseCase: IGetUserUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResponse> {
    this.logger.info("处理获取用户查询", {
      queryId: query.id,
      userId: query.userId.toString(),
      tenantId: query.tenantId.toString(),
    });

    try {
      const request: GetUserRequest = {
        userId: query.userId,
        tenantId: query.tenantId,
        includeSensitiveInfo: query.includeSensitiveInfo,
      };

      const result = await this.getUserUseCase.execute(request);

      this.logger.info("获取用户查询处理成功", {
        queryId: query.id,
        userId: result.user.id.toString(),
      });

      return result;
    } catch (error) {
      this.logger.error("获取用户查询处理失败", {
        queryId: query.id,
        error: error.message,
      });
      throw error;
    }
  }
}

/**
 * 获取用户列表查询处理器
 *
 * @description 处理GetUserListQuery，委托给GetUserListUseCase执行查询逻辑
 */
@QueryHandler(GetUserListQuery)
export class GetUserListQueryHandler
  implements IQueryHandler<GetUserListQuery, GetUserListResponse>
{
  constructor(
    private readonly getUserListUseCase: IGetUserListUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  async execute(query: GetUserListQuery): Promise<GetUserListResponse> {
    this.logger.info("处理获取用户列表查询", {
      queryId: query.id,
      tenantId: query.tenantId.toString(),
      page: query.page,
      limit: query.limit,
    });

    try {
      const request: GetUserListRequest = {
        tenantId: query.tenantId,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        filters: query.filters,
        includeDeleted: query.includeDeleted,
      };

      const result = await this.getUserListUseCase.execute(request);

      this.logger.info("获取用户列表查询处理成功", {
        queryId: query.id,
        total: result.total,
        userCount: result.users.length,
      });

      return result;
    } catch (error) {
      this.logger.error("获取用户列表查询处理失败", {
        queryId: query.id,
        error: error.message,
      });
      throw error;
    }
  }
}
