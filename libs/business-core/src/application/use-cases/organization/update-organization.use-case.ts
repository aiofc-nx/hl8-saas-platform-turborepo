/**
 * 更新组织用例
 *
 * @description 更新组织信息，包括基本信息、类型、层级等
 *
 * ## 业务规则
 *
 * ### 更新规则
 * - 只有组织管理员可以更新组织信息
 * - 更新组织信息需要验证权限
 * - 更新组织信息需要记录审计日志
 * - 更新组织信息需要发布领域事件
 *
 * ### 验证规则
 * - 组织必须存在
 * - 更新者必须有权限
 * - 更新信息必须有效
 * - 类型变更需要特殊权限
 *
 * @example
 * ```typescript
 * const updateOrganizationUseCase = new UpdateOrganizationUseCase(organizationRepository, eventBus, transactionManager, logger);
 *
 * const result = await updateOrganizationUseCase.execute({
 *   organizationId: organizationId,
 *   name: '新组织名称',
 *   type: OrganizationType.COMMITTEE,
 *   updatedBy: 'admin'
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BaseCommandUseCase } from "../base/base-command-use-case.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import type { IOrganizationRepository } from "../../../domain/repositories/organization.repository.js";
import type { IEventBus } from "../../ports/event-bus.interface.js";
import type { ITransactionManager } from "../../ports/transaction-manager.interface.js";
import {
  ValidationException,
  ResourceNotFoundException,
  UnauthorizedOperationException,
  BusinessRuleViolationException,
} from "../../../common/exceptions/business.exceptions.js";
import type { OrganizationType } from "../../../domain/value-objects/types/organization-type.vo.js";
import type { OrganizationAggregate } from "../../../domain/aggregates/organization-aggregate.js";

/**
 * 更新组织请求
 */
export interface UpdateOrganizationRequest {
  /** 组织ID */
  organizationId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 组织名称 */
  name?: string;
  /** 组织类型 */
  type?: OrganizationType;
  /** 组织描述 */
  description?: string;
  /** 更新者 */
  updatedBy: string;
  /** 更新原因 */
  updateReason?: string;
}

/**
 * 更新组织响应
 */
export interface UpdateOrganizationResponse {
  /** 组织ID */
  organizationId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 组织名称 */
  name: string;
  /** 组织类型 */
  type: OrganizationType;
  /** 组织描述 */
  description?: string;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 更新组织用例接口
 */
export interface IUpdateOrganizationUseCase {
  execute(
    request: UpdateOrganizationRequest,
  ): Promise<UpdateOrganizationResponse>;
}

/**
 * 更新组织用例
 *
 * @description 更新组织信息，包括基本信息、类型、层级等
 */
export class UpdateOrganizationUseCase
  extends BaseCommandUseCase<
    UpdateOrganizationRequest,
    UpdateOrganizationResponse
  >
  implements IUpdateOrganizationUseCase
{
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
    logger?: FastifyLoggerService,
  ) {
    super(
      "UpdateOrganization",
      "更新组织用例",
      "1.0.0",
      ["organization:update"],
      eventBus,
      transactionManager,
    );
  }

  /**
   * 执行更新组织命令
   *
   * @param request - 更新组织请求
   * @returns Promise<更新组织响应>
   */
  protected async executeCommand(
    request: UpdateOrganizationRequest,
    context: IUseCaseContext,
  ): Promise<UpdateOrganizationResponse> {
    this.validateRequest(request);
    await this.validateOrganizationExists(
      request.organizationId,
      request.tenantId,
    );
    await this.validateUpdatePermissions(request, context);

    const organizationAggregate = await this.organizationRepository.findById(
      request.organizationId,
    );
    if (!organizationAggregate) {
      throw new ResourceNotFoundException(
        "组织",
        request.organizationId.toString(),
      );
    }

    // 更新组织信息
    this.updateOrganizationInfo(organizationAggregate, request);

    // 保存组织
    await this.organizationRepository.save(organizationAggregate);

    // 发布领域事件
    await this.publishDomainEvents(organizationAggregate);

    return {
      organizationId: organizationAggregate.id,
      tenantId: organizationAggregate.tenantId,
      name: organizationAggregate.getOrganization().name,
      type: organizationAggregate.getOrganization().type,
      description: organizationAggregate.getOrganization().description,
      updatedAt: organizationAggregate.getOrganization().updatedAt,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 更新组织请求
   * @protected
   */
  protected validateRequest(request: UpdateOrganizationRequest): void {
    if (!request.organizationId) {
      throw new ValidationException(
        "ORGANIZATION_ID_REQUIRED",
        "组织ID不能为空",
        "组织ID是必填字段",
        400,
      );
    }
    if (!request.tenantId) {
      throw new ValidationException(
        "TENANT_ID_REQUIRED",
        "租户ID不能为空",
        "租户ID是必填字段",
        400,
      );
    }
    if (!request.updatedBy) {
      throw new ValidationException(
        "UPDATED_BY_REQUIRED",
        "更新者不能为空",
        "更新者是必填字段",
        400,
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
  private async validateOrganizationExists(
    organizationId: EntityId,
    tenantId: TenantId,
  ): Promise<void> {
    const organizationAggregate =
      await this.organizationRepository.findById(organizationId);
    if (!organizationAggregate) {
      throw new ResourceNotFoundException("组织", organizationId.toString());
    }
    if (!organizationAggregate.tenantId.equals(tenantId)) {
      throw new BusinessRuleViolationException("组织不属于指定租户", {
        organizationId: organizationId.toString(),
        tenantId: tenantId.toString(),
      });
    }
  }

  /**
   * 验证更新权限
   *
   * @param request - 更新组织请求
   * @param context - 用例上下文
   * @private
   */
  private async validateUpdatePermissions(
    request: UpdateOrganizationRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为组织管理员或租户管理员
    const isOrganizationAdmin =
      context.user?.roles?.includes("ORGANIZATION_ADMIN");
    const isTenantAdmin = context.user?.roles?.includes("TENANT_ADMIN");

    if (!isOrganizationAdmin && !isTenantAdmin) {
      throw new UnauthorizedOperationException(
        "更新组织信息",
        context.user?.id.toString(),
      );
    }
  }

  /**
   * 更新组织信息
   *
   * @param organizationAggregate - 组织聚合根
   * @param request - 更新组织请求
   * @private
   */
  private updateOrganizationInfo(
    organizationAggregate: OrganizationAggregate,
    request: UpdateOrganizationRequest,
  ): void {
    const organization = organizationAggregate.getOrganization();

    if (request.name) {
      organization.updateName(request.name);
    }

    if (request.type) {
      organization.updateType(request.type);
    }

    if (request.description !== undefined) {
      organization.updateDescription(request.description);
    }

    // 组织实体已通过直接调用方法更新，无需额外操作
  }
}
