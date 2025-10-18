import { EntityId } from "@hl8/isolation-model";
import { TenantAggregate } from "../../../domain/aggregates/tenant-aggregate.js";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";
import type { ITenantRepository } from "../../../domain/repositories/tenant.repository.js";
import { BaseCommandUseCase } from "../base/base-command-use-case.js";
import { UseCase } from "../decorators/use-case.decorator.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import {
  ValidationException,
  ResourceNotFoundException,
  UnauthorizedOperationException,
  BusinessRuleViolationException,
  ResourceAlreadyExistsException,
} from "../../../common/exceptions/business.exceptions.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

/**
 * 更新租户请求
 */
export interface UpdateTenantRequest {
  tenantId: EntityId;
  name?: string;
  type?: TenantType;
  updatedBy: string;
}

/**
 * 更新租户响应
 */
export interface UpdateTenantResponse {
  tenantId: EntityId;
  name: string;
  type: TenantType;
  platformId: EntityId;
  updatedAt: Date;
}

/**
 * 更新租户用例
 *
 * @description 实现平台管理员更新租户的业务用例，包括租户信息更新、唯一性验证、事件发布等功能。
 * 继承自BaseCommandUseCase，使用基础设施提供的通用功能。
 *
 * ## 业务规则
 *
 * ### 租户更新规则
 * - 租户名称在同一平台内必须唯一（如果更新名称）
 * - 租户类型必须有效且符合业务要求
 * - 只能更新租户的基本信息，不能更改平台归属
 * - 更新者必须具有平台管理员权限
 *
 * ### 验证规则
 * - 租户ID必须存在且有效
 * - 租户名称不能为空且长度受限（如果更新）
 * - 租户类型必须是预定义的有效类型（如果更新）
 * - 更新者标识符不能为空
 *
 * ### 事件发布规则
 * - 租户更新成功后发布TenantUpdatedEvent
 * - 事件包含完整的租户信息
 * - 事件用于后续的业务流程触发
 *
 * @example
 * ```typescript
 * // 创建用例实例
 * const updateTenantUseCase = new UpdateTenantUseCase(
 *   tenantRepository,
 *   logger
 * );
 *
 * // 执行更新租户
 * const result = await updateTenantUseCase.execute({
 *   tenantId: tenantId,
 *   name: '新企业租户',
 *   type: TenantType.ENTERPRISE,
 *   updatedBy: 'admin'
 * });
 *
 * console.log('租户更新成功:', result.tenantId.toString());
 * ```
 *
 * @since 1.0.0
 */
@UseCase({
  name: "UpdateTenant",
  description: "更新租户用例，包括验证、持久化和事件发布",
  type: "command",
  permissions: ["tenant:update"],
  category: "tenant-management",
  critical: true,
  monitored: true,
  version: "1.0.0",
})
export class UpdateTenantUseCase extends BaseCommandUseCase<
  UpdateTenantRequest,
  UpdateTenantResponse
> {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly _logger: FastifyLoggerService,
  ) {
    super("UpdateTenant", "更新租户用例", "1.0.0", ["tenant:update"], _logger);
  }

  /**
   * 执行更新租户命令
   *
   * @description 更新租户信息，包括验证、持久化和事件发布
   * 继承自BaseCommandUseCase，自动处理验证、日志记录、错误处理等
   *
   * @param request - 更新租户请求
   * @param context - 用例执行上下文
   * @returns Promise<更新租户响应>
   *
   * @protected
   */
  protected async executeCommand(
    request: UpdateTenantRequest,
    _context: IUseCaseContext,
  ): Promise<UpdateTenantResponse> {
    // 验证输入参数
    this.validateRequest(request);

    // 获取现有租户
    const existingTenant = await this.getExistingTenant(request.tenantId);

    // 检查租户名称唯一性（如果更新名称）
    if (request.name && request.name !== existingTenant.tenant.name) {
      await this.validateTenantNameUniqueness(
        existingTenant.platformId,
        request.name,
        request.tenantId,
      );
    }

    // 更新租户聚合根
    this.updateTenantAggregate(existingTenant, request);

    // 保存租户（事务边界）
    await this.tenantRepository.save(existingTenant);

    // 发布领域事件
    await this.publishDomainEvents(existingTenant);

    // 返回响应
    return {
      tenantId: existingTenant.id,
      name: existingTenant.tenant.name,
      type: existingTenant.tenant.type,
      platformId: existingTenant.platformId,
      updatedAt: existingTenant.tenant.updatedAt,
    };
  }

  /**
   * 验证请求参数
   *
   * @description 验证更新租户请求的所有必需参数
   *
   * @param request - 更新租户请求
   * @throws {BusinessRuleViolationException} 当参数无效时
   * @private
   */
  protected validateRequest(request: UpdateTenantRequest): void {
    if (!request.tenantId || request.tenantId.isEmpty()) {
      throw new ValidationException(
        "TENANT_ID_REQUIRED",
        "租户ID不能为空",
        "租户ID是必填字段",
        400,
      );
    }

    if (request.name !== undefined) {
      if (!request.name || request.name.trim().length === 0) {
        throw new ValidationException(
          "TENANT_NAME_REQUIRED",
          "租户名称不能为空",
          "租户名称是必填字段",
          400,
        );
      }

      if (request.name.trim().length > 100) {
        throw new ValidationException(
          "TENANT_NAME_TOO_LONG",
          "租户名称长度不能超过100个字符",
          "租户名称长度不能超过100个字符",
          400,
        );
      }
    }

    if (request.type !== undefined && !request.type) {
      throw new ValidationException(
        "TENANT_TYPE_REQUIRED",
        "租户类型不能为空",
        "租户类型是必填字段",
        400,
      );
    }

    if (!request.updatedBy || request.updatedBy.trim().length === 0) {
      throw new ValidationException(
        "UPDATED_BY_REQUIRED",
        "更新者标识符不能为空",
        "更新者标识符是必填字段",
        400,
      );
    }
  }

  /**
   * 获取现有租户
   *
   * @description 根据租户ID获取现有的租户聚合根
   *
   * @param tenantId - 租户ID
   * @returns 租户聚合根
   * @throws {BusinessRuleViolationException} 当租户不存在时
   * @private
   */
  private async getExistingTenant(
    tenantId: EntityId,
  ): Promise<TenantAggregate> {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new ResourceNotFoundException("租户", tenantId.toString());
    }
    return tenant;
  }

  /**
   * 验证租户名称唯一性
   *
   * @description 检查租户名称在同一平台内是否唯一（排除当前租户）
   *
   * @param platformId - 平台ID
   * @param name - 租户名称
   * @param excludeTenantId - 排除的租户ID
   * @throws {BusinessRuleViolationException} 当租户名称已存在时
   * @private
   */
  private async validateTenantNameUniqueness(
    platformId: EntityId,
    name: string,
    excludeTenantId: EntityId,
  ): Promise<void> {
    const existingTenant = await this.tenantRepository.findByName(
      platformId,
      name.trim(),
      false, // 不包含已删除的租户
    );

    if (existingTenant && !existingTenant.id.equals(excludeTenantId)) {
      throw new ResourceAlreadyExistsException("租户", name);
    }
  }

  /**
   * 更新租户聚合根
   *
   * @description 根据请求参数更新租户聚合根实例
   *
   * @param tenantAggregate - 租户聚合根
   * @param request - 更新租户请求
   * @private
   */
  private updateTenantAggregate(
    tenantAggregate: TenantAggregate,
    request: UpdateTenantRequest,
  ): void {
    if (request.name !== undefined) {
      tenantAggregate.updateName(request.name.trim(), request.updatedBy);
    }

    if (request.type !== undefined) {
      tenantAggregate.updateType(request.type, request.updatedBy);
    }
  }
}
