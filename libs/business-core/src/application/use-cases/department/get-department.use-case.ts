/**
 * 获取部门用例
 *
 * @description 获取单个部门的详细信息
 *
 * ## 业务规则
 *
 * ### 查询规则
 * - 只有部门成员或管理员可以查看部门信息
 * - 查询部门需要验证权限
 * - 查询部门需要支持缓存
 * - 查询部门需要记录审计日志
 *
 * ### 验证规则
 * - 部门必须存在
 * - 查询者必须有权限
 * - 查询结果需要过滤敏感信息
 *
 * @example
 * ```typescript
 * const getDepartmentUseCase = new GetDepartmentUseCase(departmentRepository, cacheService, logger);
 * 
 * const result = await getDepartmentUseCase.execute({
 *   departmentId: departmentId,
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
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.js";
import type { ICacheService } from "../../ports/cache-service.interface.js";
import { 
  ValidationException, 
  ResourceNotFoundException, 
  UnauthorizedOperationException,
  BusinessRuleViolationException
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 获取部门请求
 */
export interface GetDepartmentRequest {
  /** 部门ID */
  departmentId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 是否包含敏感信息 */
  includeSensitiveInfo?: boolean;
}

/**
 * 获取部门响应
 */
export interface GetDepartmentResponse {
  /** 部门信息 */
  department: {
    /** 部门ID */
    id: EntityId;
    /** 租户ID */
    tenantId: TenantId;
    /** 部门名称 */
    name: string;
    /** 部门层级 */
    level: number;
    /** 父部门ID */
    parentDepartmentId?: EntityId;
    /** 部门描述 */
    description?: string;
    /** 部门状态 */
    status: string;
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
  };
}

/**
 * 获取部门用例接口
 */
export interface IGetDepartmentUseCase {
  execute(request: GetDepartmentRequest): Promise<GetDepartmentResponse>;
}

/**
 * 获取部门用例
 *
 * @description 获取单个部门的详细信息
 */
export class GetDepartmentUseCase extends BaseQueryUseCase<
  GetDepartmentRequest,
  GetDepartmentResponse
> implements IGetDepartmentUseCase {
  constructor(
    private readonly departmentRepository: IDepartmentRepository,
    cacheService?: ICacheService,
    logger?: FastifyLoggerService,
  ) {
    super("GetDepartment", "获取部门用例", "1.0.0", ["department:read"], cacheService, logger);
  }

  /**
   * 执行获取部门查询
   *
   * @param request - 获取部门请求
   * @returns Promise<获取部门响应>
   */
  protected async executeQuery(
    request: GetDepartmentRequest,
    context: IUseCaseContext,
  ): Promise<GetDepartmentResponse> {
    this.validateRequest(request);
    await this.validateDepartmentExists(request.departmentId, request.tenantId);
    await this.validateQueryPermissions(request, context);
    
    // 尝试从缓存获取
    const cacheKey = this.getCacheKey(request);
    const cachedResult = await this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // 从数据库获取
    const departmentAggregate = await this.departmentRepository.findById(request.departmentId);
    if (!departmentAggregate) {
      throw new ResourceNotFoundException("部门", request.departmentId.toString());
    }

    const department = departmentAggregate.getDepartment();
    const result: GetDepartmentResponse = {
      department: {
        id: departmentAggregate.id,
        tenantId: departmentAggregate.tenantId,
        name: department.name,
        level: department.level.value,
        parentDepartmentId: department.parentDepartmentId,
        description: department.description,
        status: department.status,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
      },
    };

    // 缓存结果
    await this.cacheResult(cacheKey, result, 300); // 5分钟缓存

    return result;
  }

  /**
   * 验证请求参数
   *
   * @param request - 获取部门请求
   * @private
   */
  private validateRequest(request: GetDepartmentRequest): void {
    if (!request.departmentId) {
      throw new ValidationException(
        "DEPARTMENT_ID_REQUIRED",
        "部门ID不能为空",
        "部门ID是必填字段",
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
   * 验证部门是否存在
   *
   * @param departmentId - 部门ID
   * @param tenantId - 租户ID
   * @private
   */
  private async validateDepartmentExists(departmentId: EntityId, tenantId: TenantId): Promise<void> {
    const departmentAggregate = await this.departmentRepository.findById(departmentId);
    if (!departmentAggregate) {
      throw new ResourceNotFoundException("部门", departmentId.toString());
    }
    if (!departmentAggregate.tenantId.equals(tenantId)) {
      throw new BusinessRuleViolationException(
        "部门不属于指定租户",
        { departmentId: departmentId.toString(), tenantId: tenantId.toString() }
      );
    }
  }

  /**
   * 验证查询权限
   *
   * @param request - 获取部门请求
   * @param context - 用例上下文
   * @private
   */
  private async validateQueryPermissions(
    request: GetDepartmentRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为部门成员或管理员
    const isDepartmentMember = context.user?.departments?.includes(request.departmentId);
    const isAdmin = context.user?.role === "ADMIN" || context.user?.role === "TENANT_ADMIN";
    
    if (!isDepartmentMember && !isAdmin) {
      throw new UnauthorizedOperationException(
        "查看部门信息",
        context.user?.id.toString()
      );
    }
  }

  /**
   * 获取缓存键
   *
   * @param request - 获取部门请求
   * @returns 缓存键
   * @private
   */
  private getCacheKey(request: GetDepartmentRequest): string {
    return `department:${request.departmentId.toString()}:${request.tenantId.toString()}`;
  }
}
