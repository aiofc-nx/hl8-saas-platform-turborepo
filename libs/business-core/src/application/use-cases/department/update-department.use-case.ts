/**
 * 更新部门用例
 *
 * @description 更新部门信息，包括基本信息、层级、父部门等
 *
 * ## 业务规则
 *
 * ### 更新规则
 * - 只有部门管理员可以更新部门信息
 * - 更新部门信息需要验证权限
 * - 更新部门信息需要记录审计日志
 * - 更新部门信息需要发布领域事件
 *
 * ### 验证规则
 * - 部门必须存在
 * - 更新者必须有权限
 * - 更新信息必须有效
 * - 层级变更需要特殊权限
 *
 * @example
 * ```typescript
 * const updateDepartmentUseCase = new UpdateDepartmentUseCase(departmentRepository, eventBus, transactionManager, logger);
 * 
 * const result = await updateDepartmentUseCase.execute({
 *   departmentId: departmentId,
 *   name: '新部门名称',
 *   level: DepartmentLevel.LEVEL_2,
 *   updatedBy: 'admin'
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
  ResourceAlreadyExistsException
} from "../../../common/exceptions/business.exceptions.js";
import type { DepartmentLevel } from "../../../domain/value-objects/types/department-level.vo.js";
import type { DepartmentAggregate } from "../../../domain/aggregates/department-aggregate.js";

/**
 * 更新部门请求
 */
export interface UpdateDepartmentRequest {
  /** 部门ID */
  departmentId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 部门名称 */
  name?: string;
  /** 部门层级 */
  level?: DepartmentLevel;
  /** 父部门ID */
  parentDepartmentId?: EntityId;
  /** 部门描述 */
  description?: string;
  /** 更新者 */
  updatedBy: string;
  /** 更新原因 */
  updateReason?: string;
}

/**
 * 更新部门响应
 */
export interface UpdateDepartmentResponse {
  /** 部门ID */
  departmentId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 部门名称 */
  name: string;
  /** 部门层级 */
  level: DepartmentLevel;
  /** 父部门ID */
  parentDepartmentId?: EntityId;
  /** 部门描述 */
  description?: string;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 更新部门用例接口
 */
export interface IUpdateDepartmentUseCase {
  execute(request: UpdateDepartmentRequest): Promise<UpdateDepartmentResponse>;
}

/**
 * 更新部门用例
 *
 * @description 更新部门信息，包括基本信息、层级、父部门等
 */
export class UpdateDepartmentUseCase extends BaseCommandUseCase<
  UpdateDepartmentRequest,
  UpdateDepartmentResponse
> implements IUpdateDepartmentUseCase {
  constructor(
    private readonly departmentRepository: IDepartmentRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
    logger?: FastifyLoggerService,
  ) {
    super("UpdateDepartment", "更新部门用例", "1.0.0", ["department:update"], eventBus, transactionManager, logger);
  }

  /**
   * 执行更新部门命令
   *
   * @param request - 更新部门请求
   * @returns Promise<更新部门响应>
   */
  protected async executeCommand(
    request: UpdateDepartmentRequest,
    context: IUseCaseContext,
  ): Promise<UpdateDepartmentResponse> {
    this.validateRequest(request);
    await this.validateDepartmentExists(request.departmentId, request.tenantId);
    await this.validateUpdatePermissions(request, context);
    await this.validateDepartmentHierarchy(request);
    
    const departmentAggregate = await this.departmentRepository.findById(request.departmentId);
    if (!departmentAggregate) {
      throw new ResourceNotFoundException("部门", request.departmentId.toString());
    }

    // 更新部门信息
    this.updateDepartmentInfo(departmentAggregate, request);
    
    // 保存部门
    await this.departmentRepository.save(departmentAggregate);
    
    // 发布领域事件
    await this.publishDomainEvents(departmentAggregate);

    return {
      departmentId: departmentAggregate.id,
      tenantId: departmentAggregate.tenantId,
      name: departmentAggregate.getDepartment().name,
      level: departmentAggregate.getDepartment().level,
      parentDepartmentId: departmentAggregate.getDepartment().parentDepartmentId,
      description: departmentAggregate.getDepartment().description,
      updatedAt: departmentAggregate.getDepartment().updatedAt,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 更新部门请求
   * @private
   */
  private validateRequest(request: UpdateDepartmentRequest): void {
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
    if (!request.updatedBy) {
      throw new ValidationException(
        "UPDATED_BY_REQUIRED",
        "更新者不能为空",
        "更新者是必填字段",
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
   * 验证更新权限
   *
   * @param request - 更新部门请求
   * @param context - 用例上下文
   * @private
   */
  private async validateUpdatePermissions(
    request: UpdateDepartmentRequest,
    context: IUseCaseContext,
  ): Promise<void> {
    // 检查是否为部门管理员或租户管理员
    const isDepartmentAdmin = context.user?.role === "DEPARTMENT_ADMIN";
    const isTenantAdmin = context.user?.role === "TENANT_ADMIN";
    
    if (!isDepartmentAdmin && !isTenantAdmin) {
      throw new UnauthorizedOperationException(
        "更新部门信息",
        context.user?.id.toString()
      );
    }
  }

  /**
   * 验证部门层级
   *
   * @param request - 更新部门请求
   * @private
   */
  private async validateDepartmentHierarchy(request: UpdateDepartmentRequest): Promise<void> {
    if (request.parentDepartmentId) {
      const parentDepartment = await this.departmentRepository.findById(request.parentDepartmentId);
      if (!parentDepartment) {
        throw new ResourceNotFoundException("父部门", request.parentDepartmentId.toString());
      }
      
      // 检查层级关系
      if (request.level && parentDepartment.getDepartment().level.value >= request.level.value) {
        throw new BusinessRuleViolationException(
          "父部门层级不能大于等于子部门层级",
          { 
            parentLevel: parentDepartment.getDepartment().level.value,
            childLevel: request.level.value 
          }
        );
      }
    }
  }

  /**
   * 更新部门信息
   *
   * @param departmentAggregate - 部门聚合根
   * @param request - 更新部门请求
   * @private
   */
  private updateDepartmentInfo(departmentAggregate: DepartmentAggregate, request: UpdateDepartmentRequest): void {
    const department = departmentAggregate.getDepartment();
    
    if (request.name) {
      department.updateName(request.name);
    }
    
    if (request.level) {
      department.updateLevel(request.level);
    }
    
    if (request.parentDepartmentId !== undefined) {
      department.updateParentDepartment(request.parentDepartmentId);
    }
    
    if (request.description !== undefined) {
      department.updateDescription(request.description);
    }
    
    departmentAggregate.updateDepartment(department);
  }
}
