/**
 * 获取组织用例
 *
 * @description 获取单个组织的详细信息
 *
 * ## 业务规则
 *
 * ### 查询规则
 * - 只有组织成员或管理员可以查看组织信息
 * - 查询组织需要验证权限
 * - 查询组织需要支持缓存
 * - 查询组织需要记录审计日志
 *
 * ### 验证规则
 * - 组织必须存在
 * - 查询者必须有权限
 * - 查询结果需要过滤敏感信息
 *
 * @example
 * ```typescript
 * const getOrganizationUseCase = new GetOrganizationUseCase(organizationRepository, cacheService, logger);
 * 
 * const result = await getOrganizationUseCase.execute({
 *   organizationId: organizationId,
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
import type { IOrganizationRepository } from "../../../domain/repositories/organization.repository.js";
import type { ICacheService } from "../../ports/cache-service.interface.js";
import { 
  ValidationException, 
  ResourceNotFoundException, 
  UnauthorizedOperationException,
  BusinessRuleViolationException
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 获取组织请求
 */
export interface GetOrganizationRequest {
  /** 组织ID */
  organizationId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 是否包含敏感信息 */
  includeSensitiveInfo?: boolean;
}

/**
 * 获取组织响应
 */
export interface GetOrganizationResponse {
  /** 组织信息 */
  organization: {
    /** 组织ID */
    id: EntityId;
    /** 租户ID */
    tenantId: TenantId;
    /** 组织名称 */
    name: string;
    /** 组织类型 */
    type: string;
    /** 组织描述 */
    description?: string;
    /** 组织状态 */
    status: string;
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
  };
}

/**
 * 获取组织用例接口
 */
export interface IGetOrganizationUseCase {
  execute(request: GetOrganizationRequest): Promise<GetOrganizationResponse>;
}

/**
 * 获取组织用例
 *
 * @description 获取单个组织的详细信息
 */
export class GetOrganizationUseCase extends BaseQueryUseCase<
  GetOrganizationRequest,
  GetOrganizationResponse
> implements IGetOrganizationUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    cacheService?: ICacheService,
    logger?: FastifyLoggerService,
  ) {
    super("GetOrganization", "获取组织用例", "1.0.0", ["organization:read"], cacheService, logger);
  }

  /**
   * 执行获取组织查询
   *
   * @param request - 获取组织请求
   * @returns Promise<获取组织响应>
   */
  protected async executeQuery(
    request: GetOrganizationRequest,
    context: IUseCaseContext,
  ): Promise<GetOrganizationResponse> {
    this.validateRequest(request);
    await this.validateOrganizationExists(request.organizationId, request.tenantId);
    await this.validateQueryPermissions(request, context);
    
    // 尝试从缓存获取
    const cacheKey = this.getCacheKey(request);
    const cachedResult = await this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // 从数据库获取
    const organizationAggregate = await this.organizationRepository.findById(request.organizationId);
    if (!organizationAggregate) {
      throw new Error("组织不存在");
    }

    const organization = organizationAggregate.getOrganization();
    const result: GetOrganizationResponse = {
      organization: {
        id: organizationAggregate.id,
        tenantId: organizationAggregate.tenantId,
        name: organization.name,
        type: organization.type,
        description: organization.description,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
    };

    // 缓存结果
    await this.cacheResult(cacheKey, result, 300); // 5分钟缓存

    return result;
  }

  /**
   * 验证请求参数
   *
   * @param request - 获取组织请求
   * @private
   */
  private validateRequest(request: GetOrganizationRequest): void {
    if (!request.organizationId) {
      throw new ValidationException(
        "ORGANIZATION_ID_REQUIRED",
        "组织ID不能为空",
        "组织ID是必填字段",
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
   * 验证组织是否存在
   *
   * @param organizationId - 组织ID
   * @param tenantId - 租户ID
   * @private
   */
  private async validateOrganizationExists(organizationId: EntityId, tenantId: TenantId): Promise<void> {
    const organizationAggregate = await this.organizationRepository.findById(organizationId);
    if (!organizationAggregate) {
      throw new ResourceNotFoundException("组织", organizationId.toString());
    }
    if (!organizationAggregate.tenantId.equals(tenantId)) {
      throw new BusinessRuleViolationException(
        "组织不属于指定租户",
        { organizationId: organizationId.toString(), tenantId: tenantId.toString() }
      );
    }
  }

  /**
   * 验证查询权限
   *
   * @param request - 获取组织请求
   * @param context - 用例上下文
   * @private
   */
  private async validateQueryPermissions(
    request: GetOrganizationRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为组织成员或管理员
    const isOrganizationMember = context.user?.organizations?.includes(request.organizationId);
    const isAdmin = context.user?.role === "ADMIN" || context.user?.role === "TENANT_ADMIN";
    
    if (!isOrganizationMember && !isAdmin) {
      throw new UnauthorizedOperationException(
        "查看组织信息",
        context.user?.id.toString()
      );
    }
  }

  /**
   * 获取缓存键
   *
   * @param request - 获取组织请求
   * @returns 缓存键
   * @private
   */
  private getCacheKey(request: GetOrganizationRequest): string {
    return `organization:${request.organizationId.toString()}:${request.tenantId.toString()}`;
  }
}
