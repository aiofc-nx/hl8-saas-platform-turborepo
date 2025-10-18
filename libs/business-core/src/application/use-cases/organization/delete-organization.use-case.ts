/**
 * 删除组织用例
 *
 * @description 删除组织，包括软删除和硬删除
 *
 * ## 业务规则
 *
 * ### 删除规则
 * - 只有租户管理员可以删除组织
 * - 删除组织需要验证权限
 * - 删除组织需要记录审计日志
 * - 删除组织需要发布领域事件
 *
 * ### 验证规则
 * - 组织必须存在
 * - 删除者必须有权限
 * - 不能删除有下属部门的组织
 * - 删除前需要检查关联数据
 *
 * @example
 * ```typescript
 * const deleteOrganizationUseCase = new DeleteOrganizationUseCase(organizationRepository, eventBus, transactionManager, logger);
 * 
 * const result = await deleteOrganizationUseCase.execute({
 *   organizationId: organizationId,
 *   deletedBy: 'admin',
 *   deleteReason: '组织重组'
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BaseCommandUseCase } from "../base/base-command-use-case.js";
import type { IUseCaseContext } from "../use-case.interface.js";
import type { IOrganizationRepository } from "../../../domain/repositories/organization.repository.js";
import type { IEventBus } from "../../ports/event-bus.interface.js";
import type { ITransactionManager } from "../../ports/transaction-manager.interface.js";
import { 
  ValidationException, 
  ResourceNotFoundException, 
  UnauthorizedOperationException,
  BusinessRuleViolationException
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 删除组织请求
 */
export interface DeleteOrganizationRequest {
  /** 组织ID */
  organizationId: EntityId;
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
 * 删除组织响应
 */
export interface DeleteOrganizationResponse {
  /** 组织ID */
  organizationId: EntityId;
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
 * 删除组织用例接口
 */
export interface IDeleteOrganizationUseCase {
  execute(request: DeleteOrganizationRequest): Promise<DeleteOrganizationResponse>;
}

/**
 * 删除组织用例
 *
 * @description 删除组织，包括软删除和硬删除
 */
export class DeleteOrganizationUseCase extends BaseCommandUseCase<
  DeleteOrganizationRequest,
  DeleteOrganizationResponse
> implements IDeleteOrganizationUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
    logger?: FastifyLoggerService,
  ) {
    super("DeleteOrganization", "删除组织用例", "1.0.0", ["organization:delete"], eventBus, transactionManager, logger);
  }

  /**
   * 执行删除组织命令
   *
   * @param request - 删除组织请求
   * @returns Promise<删除组织响应>
   */
  protected async executeCommand(
    request: DeleteOrganizationRequest,
    context: IUseCaseContext,
  ): Promise<DeleteOrganizationResponse> {
    this.validateRequest(request);
    await this.validateOrganizationExists(request.organizationId, request.tenantId);
    await this.validateDeletePermissions(request, context);
    await this.validateOrganizationCanBeDeleted(request);
    
    const organizationAggregate = await this.organizationRepository.findById(request.organizationId);
    if (!organizationAggregate) {
      throw new Error("组织不存在");
    }

    // 删除组织
    organizationAggregate.deleteOrganization(request.deletedBy, request.deleteReason);
    
    // 保存组织
    await this.organizationRepository.save(organizationAggregate);
    
    // 发布领域事件
    await this.publishDomainEvents(organizationAggregate);

    return {
      organizationId: organizationAggregate.id,
      tenantId: organizationAggregate.tenantId,
      deletedAt: new Date(),
      deletedBy: request.deletedBy,
      deleteReason: request.deleteReason,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 删除组织请求
   * @private
   */
  private validateRequest(request: DeleteOrganizationRequest): void {
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
   * 验证删除权限
   *
   * @param request - 删除组织请求
   * @param context - 用例上下文
   * @private
   */
  private async validateDeletePermissions(
    request: DeleteOrganizationRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为租户管理员
    const isTenantAdmin = context.user?.role === "TENANT_ADMIN";
    
    if (!isTenantAdmin) {
      throw new UnauthorizedOperationException(
        "删除组织",
        context.user?.id.toString()
      );
    }
  }

  /**
   * 验证组织是否可以被删除
   *
   * @param request - 删除组织请求
   * @private
   */
  private async validateOrganizationCanBeDeleted(request: DeleteOrganizationRequest): Promise<void> {
    const organizationAggregate = await this.organizationRepository.findById(request.organizationId);
    if (!organizationAggregate) {
      throw new Error("组织不存在");
    }

    const organization = organizationAggregate.getOrganization();
    
    // 检查组织状态
    if (organization.status === "DELETED") {
      throw new Error("组织已被删除");
    }
    
    // 检查是否有下属部门
    if (!request.forceDelete && organizationAggregate.hasDepartments()) {
      throw new Error("组织下有部门，不能删除。请先删除所有下属部门或使用强制删除");
    }
  }
}
