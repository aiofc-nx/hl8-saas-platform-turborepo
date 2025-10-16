import { EntityId, TenantId } from "@hl8/isolation-model";
import { TenantAggregate } from "../../../domain/aggregates/tenant-aggregate.js";
import { TenantType } from "../../../domain/value-objects/types/tenant-type.vo.js";
import type { ITenantRepository } from "../../../domain/repositories/tenant.repository.js";
import { BaseCommandUseCase } from "../base/base-command-use-case.js";
import { UseCase } from "../decorators/use-case.decorator.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import { BusinessRuleViolationException } from "../../../domain/exceptions/base/base-domain-exception.js";
import { DomainExceptionConverter } from "../../../common/exceptions/business.exceptions.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

/**
 * 创建租户请求
 */
export interface CreateTenantRequest {
  name: string;
  type: TenantType;
  platformId: EntityId;
  createdBy: string;
}

/**
 * 创建租户响应
 */
export interface CreateTenantResponse {
  tenantId: EntityId;
  name: string;
  type: TenantType;
  platformId: EntityId;
  createdAt: Date;
}

/**
 * 创建租户用例
 *
 * @description 实现平台管理员创建租户的业务用例，包括租户创建、唯一性验证、事件发布等功能。
 * 继承自BaseCommandUseCase，使用基础设施提供的通用功能。
 *
 * ## 业务规则
 *
 * ### 租户创建规则
 * - 租户名称在同一平台内必须唯一
 * - 租户类型必须有效且符合业务要求
 * - 租户必须属于有效的平台
 * - 创建者必须具有平台管理员权限
 *
 * ### 验证规则
 * - 租户名称不能为空且长度受限
 * - 租户类型必须是预定义的有效类型
 * - 平台ID必须存在且有效
 * - 创建者标识符不能为空
 *
 * ### 事件发布规则
 * - 租户创建成功后发布TenantCreatedEvent
 * - 事件包含完整的租户信息
 * - 事件用于后续的业务流程触发
 *
 * @example
 * ```typescript
 * // 创建用例实例
 * const createTenantUseCase = new CreateTenantUseCase(
 *   tenantRepository,
 *   logger
 * );
 *
 * // 执行创建租户
 * const result = await createTenantUseCase.execute({
 *   name: '企业租户',
 *   type: TenantType.ENTERPRISE,
 *   platformId: platformId,
 *   createdBy: 'admin'
 * });
 *
 * console.log('租户创建成功:', result.tenantId.toString());
 * ```
 *
 * @since 1.0.0
 */
@UseCase({
  name: "CreateTenant",
  description: "创建租户用例，包括验证、持久化和事件发布",
  type: "command",
  permissions: ["tenant:create"],
  category: "tenant-management",
  critical: true,
  monitored: true,
  version: "1.0.0",
})
export class CreateTenantUseCase extends BaseCommandUseCase<
  CreateTenantRequest,
  CreateTenantResponse
> {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly _logger: FastifyLoggerService,
  ) {
    super("CreateTenant", "创建租户用例", "1.0.0", ["tenant:create"]);
  }

  /**
   * 执行创建租户命令
   *
   * @description 创建新的租户，包括验证、持久化和事件发布
   * 继承自BaseCommandUseCase，自动处理验证、日志记录、错误处理等
   *
   * @param request - 创建租户请求
   * @param context - 用例执行上下文
   * @returns Promise<创建租户响应>
   *
   * @protected
   */
  protected async executeCommand(
    request: CreateTenantRequest,
    _context: IUseCaseContext,
  ): Promise<CreateTenantResponse> {
    // 验证输入参数
    this.validateRequest(request);

    // 检查租户名称唯一性
    await this.validateTenantNameUniqueness(request.platformId, request.name);

    // 创建租户聚合根
    const tenantAggregate = this.createTenantAggregate(request);

    // 保存租户（事务边界）
    const savedTenant = await this.tenantRepository.save(tenantAggregate);

    // 发布领域事件
    await this.publishDomainEvents(savedTenant);

    // 返回响应
    return {
      tenantId: savedTenant.id,
      name: savedTenant.tenant.name,
      type: savedTenant.tenant.type,
      platformId: savedTenant.platformId,
      createdAt: savedTenant.tenant.createdAt,
    };
  }

  /**
   * 验证请求参数
   *
   * @description 验证创建租户请求的所有必需参数
   *
   * @param request - 创建租户请求
   * @throws {BusinessRuleViolationException} 当参数无效时
   * @private
   */
  protected validateRequest(request: CreateTenantRequest): void {
    if (!request.name || request.name.trim().length === 0) {
      throw new BusinessRuleViolationException(
        "租户名称不能为空",
        "TENANT_NAME_REQUIRED",
      );
    }

    if (request.name.trim().length > 100) {
      throw new BusinessRuleViolationException(
        "租户名称长度不能超过100个字符",
        "TENANT_NAME_TOO_LONG",
      );
    }

    if (!request.type) {
      throw new BusinessRuleViolationException(
        "租户类型不能为空",
        "TENANT_TYPE_REQUIRED",
      );
    }

    if (!request.platformId || request.platformId.isEmpty()) {
      throw new BusinessRuleViolationException(
        "平台ID不能为空",
        "PLATFORM_ID_REQUIRED",
      );
    }

    if (!request.createdBy || request.createdBy.trim().length === 0) {
      throw new BusinessRuleViolationException(
        "创建者标识符不能为空",
        "CREATED_BY_REQUIRED",
      );
    }
  }

  /**
   * 验证租户名称唯一性
   *
   * @description 检查租户名称在同一平台内是否唯一
   *
   * @param platformId - 平台ID
   * @param name - 租户名称
   * @throws {BusinessRuleViolationException} 当租户名称已存在时
   * @private
   */
  private async validateTenantNameUniqueness(
    platformId: EntityId,
    name: string,
  ): Promise<void> {
    const existingTenant = await this.tenantRepository.findByName(
      platformId,
      name.trim(),
      false, // 不包含已删除的租户
    );

    if (existingTenant) {
      throw new BusinessRuleViolationException(
        `租户名称 "${name}" 在同一平台下已存在`,
        "TENANT_NAME_DUPLICATE",
        { name, platformId: platformId.toString() },
      );
    }
  }

  /**
   * 创建租户聚合根
   *
   * @description 根据请求参数创建租户聚合根实例
   *
   * @param request - 创建租户请求
   * @returns 租户聚合根实例
   * @private
   */
  private createTenantAggregate(request: CreateTenantRequest): TenantAggregate {
    const tenantId = TenantId.generate();
    const auditInfo = {
      tenantId: request.platformId,
      createdBy: request.createdBy,
    };

    return new TenantAggregate(
      tenantId,
      {
        name: request.name.trim(),
        type: request.type,
        platformId: request.platformId,
      },
      auditInfo,
      null,
    );
  }
}
