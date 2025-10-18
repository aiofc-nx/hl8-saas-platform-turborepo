/**
 * 删除部门用例
 *
 * @description 删除部门，包括软删除和硬删除
 *
 * ## 业务规则
 *
 * ### 删除规则
 * - 只有租户管理员可以删除部门
 * - 删除部门需要验证权限
 * - 删除部门需要记录审计日志
 * - 删除部门需要发布领域事件
 *
 * ### 验证规则
 * - 部门必须存在
 * - 删除者必须有权限
 * - 不能删除有下属部门的部门
 * - 删除前需要检查关联数据
 *
 * @example
 * ```typescript
 * const deleteDepartmentUseCase = new DeleteDepartmentUseCase(departmentRepository, eventBus, transactionManager, logger);
 *
 * const result = await deleteDepartmentUseCase.execute({
 *   departmentId: departmentId,
 *   deletedBy: 'admin',
 *   deleteReason: '部门重组'
 * });
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BaseCommandUseCase } from "../base/base-command-use-case.js";
import type { IUseCaseContext } from "../use-case.interface.js";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.js";
import type { IEventBus } from "../../ports/event-bus.interface.js";
import type { ITransactionManager } from "../../ports/transaction-manager.interface.js";
import {
  ValidationException,
  ResourceNotFoundException,
  UnauthorizedOperationException,
  BusinessRuleViolationException,
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 删除部门请求
 */
export interface DeleteDepartmentRequest {
  /** 部门ID */
  departmentId: EntityId;
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
 * 删除部门响应
 */
export interface DeleteDepartmentResponse {
  /** 部门ID */
  departmentId: EntityId;
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
 * 删除部门用例接口
 */
export interface IDeleteDepartmentUseCase {
  execute(request: DeleteDepartmentRequest): Promise<DeleteDepartmentResponse>;
}

/**
 * 删除部门用例
 *
 * @description 删除部门，包括软删除和硬删除
 */
export class DeleteDepartmentUseCase
  extends BaseCommandUseCase<DeleteDepartmentRequest, DeleteDepartmentResponse>
  implements IDeleteDepartmentUseCase
{
  constructor(
    private readonly departmentRepository: IDepartmentRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
    logger?: FastifyLoggerService,
  ) {
    super(
      "DeleteDepartment",
      "删除部门用例",
      "1.0.0",
      ["department:delete"],
      eventBus,
      transactionManager,
      logger,
    );
  }

  /**
   * 执行删除部门命令
   *
   * @param request - 删除部门请求
   * @returns Promise<删除部门响应>
   */
  protected async executeCommand(
    request: DeleteDepartmentRequest,
    context: IUseCaseContext,
  ): Promise<DeleteDepartmentResponse> {
    this.validateRequest(request);
    await this.validateDepartmentExists(request.departmentId, request.tenantId);
    await this.validateDeletePermissions(request, context);
    await this.validateDepartmentCanBeDeleted(request);

    const departmentAggregate = await this.departmentRepository.findById(
      request.departmentId,
    );
    if (!departmentAggregate) {
      throw new ResourceNotFoundException(
        "部门",
        request.departmentId.toString(),
      );
    }

    // 删除部门
    departmentAggregate.deleteDepartment(
      request.deletedBy,
      request.deleteReason,
    );

    // 保存部门
    await this.departmentRepository.save(departmentAggregate);

    // 发布领域事件
    await this.publishDomainEvents(departmentAggregate);

    return {
      departmentId: departmentAggregate.id,
      tenantId: departmentAggregate.tenantId,
      deletedAt: new Date(),
      deletedBy: request.deletedBy,
      deleteReason: request.deleteReason,
      softDelete: request.softDelete ?? true,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 删除部门请求
   * @private
   */
  private validateRequest(request: DeleteDepartmentRequest): void {
    if (!request.departmentId) {
      throw new ValidationException(
        "DEPARTMENT_ID_REQUIRED",
        "部门ID不能为空",
        "部门ID是必填字段",
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
    if (!request.deletedBy) {
      throw new ValidationException(
        "DELETED_BY_REQUIRED",
        "删除者不能为空",
        "删除者是必填字段",
        400,
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
  private async validateDepartmentExists(
    departmentId: EntityId,
    tenantId: TenantId,
  ): Promise<void> {
    const departmentAggregate =
      await this.departmentRepository.findById(departmentId);
    if (!departmentAggregate) {
      throw new ResourceNotFoundException("部门", departmentId.toString());
    }
    if (!departmentAggregate.tenantId.equals(tenantId)) {
      throw new BusinessRuleViolationException("部门不属于指定租户", {
        departmentId: departmentId.toString(),
        tenantId: tenantId.toString(),
      });
    }
  }

  /**
   * 验证删除权限
   *
   * @param request - 删除部门请求
   * @param context - 用例上下文
   * @private
   */
  private async validateDeletePermissions(
    request: DeleteDepartmentRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为租户管理员
    const isTenantAdmin = context.user?.role === "TENANT_ADMIN";

    if (!isTenantAdmin) {
      throw new UnauthorizedOperationException(
        "删除部门",
        context.user?.id.toString(),
      );
    }
  }

  /**
   * 验证部门是否可以被删除
   *
   * @param request - 删除部门请求
   * @private
   */
  private async validateDepartmentCanBeDeleted(
    request: DeleteDepartmentRequest,
  ): Promise<void> {
    const departmentAggregate = await this.departmentRepository.findById(
      request.departmentId,
    );
    if (!departmentAggregate) {
      throw new ResourceNotFoundException(
        "部门",
        request.departmentId.toString(),
      );
    }

    const department = departmentAggregate.getDepartment();

    // 检查部门状态
    if (department.status === "DELETED") {
      throw new BusinessRuleViolationException("部门已被删除", {
        departmentId: request.departmentId.toString(),
        status: department.status,
      });
    }

    // 检查是否有下属部门
    if (!request.forceDelete && departmentAggregate.hasSubDepartments()) {
      throw new BusinessRuleViolationException(
        "部门下有子部门，不能删除。请先删除所有子部门或使用强制删除",
        { departmentId: request.departmentId.toString() },
      );
    }
  }
}
