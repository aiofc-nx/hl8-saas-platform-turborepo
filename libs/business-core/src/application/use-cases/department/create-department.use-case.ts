/**
 * 创建部门用例
 *
 * @description 实现创建部门的业务逻辑，包括验证、持久化和事件发布
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { BaseCommandUseCase } from "../base/base-command-use-case.js";
import { DepartmentAggregate } from "../../domain/aggregates/department-aggregate.js";
import { Department } from "../../domain/entities/department/department.entity.js";
import { DepartmentLevel } from "../../domain/value-objects/types/department-level.vo.js";
import type { IDepartmentRepository } from "../../domain/repositories/department.repository.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { BusinessRuleViolationException } from "../../domain/exceptions/base/base-domain-exception.js";

/**
 * 创建部门请求接口
 */
export interface CreateDepartmentRequest {
  /** 部门名称 */
  name: string;
  
  /** 部门层级 */
  level: DepartmentLevel;
  
  /** 部门描述 */
  description?: string;
  
  /** 父部门ID（可选） */
  parentId?: EntityId;
  
  /** 部门排序 */
  sortOrder?: number;
  
  /** 部门负责人ID（可选） */
  managerId?: EntityId;
  
  /** 部门编码（可选） */
  code?: string;
  
  /** 创建者标识符 */
  createdBy: string;
}

/**
 * 创建部门响应接口
 */
export interface CreateDepartmentResponse {
  /** 部门ID */
  departmentId: EntityId;
  
  /** 部门名称 */
  name: string;
  
  /** 部门层级 */
  level: DepartmentLevel;
  
  /** 租户ID */
  tenantId: TenantId;
  
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 创建部门用例
 *
 * @description 负责创建新部门的业务逻辑，包括验证、持久化和事件发布
 */
export class CreateDepartmentUseCase extends BaseCommandUseCase<
  CreateDepartmentRequest,
  CreateDepartmentResponse
> {
  constructor(
    private readonly departmentRepository: IDepartmentRepository,
    private readonly _logger: FastifyLoggerService,
  ) {
    super("CreateDepartment", "创建部门用例", "1.0.0", ["department:create"], _logger);
  }

  /**
   * 执行创建部门命令
   *
   * @description 创建新部门，包括验证、持久化和事件发布
   *
   * @param request - 创建部门请求
   * @param context - 用例执行上下文
   * @returns Promise<创建部门响应>
   *
   * @protected
   */
  protected async executeCommand(
    request: CreateDepartmentRequest,
    context: IUseCaseContext,
  ): Promise<CreateDepartmentResponse> {
    // 验证输入参数
    this.validateRequest(request);

    // 检查部门名称唯一性
    await this.validateDepartmentNameUniqueness(
      context.tenant!.id,
      request.name,
      request.parentId,
    );

    // 创建部门实体
    const department = this.createDepartmentEntity(request, context);

    // 创建部门聚合根
    const departmentAggregate = new DepartmentAggregate(
      EntityId.generate(),
      context.tenant!.id,
      department,
      this.buildAuditInfo(request.createdBy, context),
      this.logger,
    );

    // 保存部门（事务边界）
    await this.departmentRepository.save(departmentAggregate);

    // 发布领域事件
    await this.publishDomainEvents(departmentAggregate);

    // 返回响应
    return {
      departmentId: departmentAggregate.id,
      name: departmentAggregate.getDepartment().name,
      level: departmentAggregate.getDepartment().level,
      tenantId: departmentAggregate.tenantId,
      createdAt: departmentAggregate.getDepartment().createdAt,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 创建部门请求
   * @private
   */
  private validateRequest(request: CreateDepartmentRequest): void {
    if (!request.name || !request.name.trim()) {
      throw new BusinessRuleViolationException(
        "部门名称不能为空",
        "DEPARTMENT_NAME_REQUIRED",
      );
    }

    if (request.name.trim().length > 100) {
      throw new BusinessRuleViolationException(
        "部门名称长度不能超过100字符",
        "DEPARTMENT_NAME_TOO_LONG",
      );
    }

    if (!request.level) {
      throw new BusinessRuleViolationException(
        "部门层级不能为空",
        "DEPARTMENT_LEVEL_REQUIRED",
      );
    }

    if (!request.createdBy || !request.createdBy.trim()) {
      throw new BusinessRuleViolationException(
        "创建者标识符不能为空",
        "CREATED_BY_REQUIRED",
      );
    }
  }

  /**
   * 验证部门名称唯一性
   *
   * @param tenantId - 租户ID
   * @param name - 部门名称
   * @param parentId - 父部门ID
   * @private
   */
  private async validateDepartmentNameUniqueness(
    tenantId: TenantId,
    name: string,
    parentId?: EntityId,
  ): Promise<void> {
    const existingDepartment = await this.departmentRepository.findByName(
      tenantId,
      name,
      parentId,
    );

    if (existingDepartment) {
      throw new BusinessRuleViolationException(
        `部门名称 "${name}" 在同一租户下已存在`,
        "DEPARTMENT_NAME_DUPLICATE",
      );
    }
  }

  /**
   * 创建部门实体
   *
   * @param request - 创建部门请求
   * @param context - 用例执行上下文
   * @returns 部门实体
   * @private
   */
  private createDepartmentEntity(
    request: CreateDepartmentRequest,
    context: IUseCaseContext,
  ): Department {
    return new Department(
      EntityId.generate(),
      {
        name: request.name.trim(),
        level: request.level,
        description: request.description,
        isActive: true,
        parentId: request.parentId,
        path: this.calculatePath(request.parentId),
        sortOrder: request.sortOrder || 0,
        managerId: request.managerId,
        code: request.code,
      },
      this.buildAuditInfo(request.createdBy, context),
      this.logger,
    );
  }

  /**
   * 计算部门路径
   *
   * @param parentId - 父部门ID
   * @returns 部门路径
   * @private
   */
  private calculatePath(parentId?: EntityId): string {
    if (!parentId) {
      return "/";
    }
    // TODO: 实现路径计算逻辑
    return `/${parentId.toString()}/`;
  }
}
