/**
 * 创建组织用例
 *
 * @description 实现创建组织的业务逻辑，包括验证、持久化和事件发布
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { BaseCommandUseCase } from "../base/base-command-use-case.js";
import { OrganizationAggregate } from "../../domain/aggregates/organization-aggregate.js";
import { Organization } from "../../domain/entities/organization/organization.entity.js";
import { OrganizationType } from "../../domain/value-objects/types/organization-type.vo.js";
import type { IOrganizationRepository } from "../../domain/repositories/organization.repository.js";
import type { IUseCaseContext } from "../base/use-case.interface.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { 
  ValidationException, 
  ResourceNotFoundException, 
  UnauthorizedOperationException,
  BusinessRuleViolationException,
  ResourceAlreadyExistsException
} from "../../../common/exceptions/business.exceptions.js";

/**
 * 创建组织请求接口
 */
export interface CreateOrganizationRequest {
  /** 组织名称 */
  name: string;

  /** 组织类型 */
  type: OrganizationType;

  /** 组织描述 */
  description?: string;

  /** 父组织ID（可选） */
  parentId?: EntityId;

  /** 组织排序 */
  sortOrder?: number;

  /** 创建者标识符 */
  createdBy: string;
}

/**
 * 创建组织响应接口
 */
export interface CreateOrganizationResponse {
  /** 组织ID */
  organizationId: EntityId;

  /** 组织名称 */
  name: string;

  /** 组织类型 */
  type: OrganizationType;

  /** 租户ID */
  tenantId: TenantId;

  /** 创建时间 */
  createdAt: Date;
}

/**
 * 创建组织用例
 *
 * @description 负责创建新组织的业务逻辑，包括验证、持久化和事件发布
 */
export class CreateOrganizationUseCase extends BaseCommandUseCase<
  CreateOrganizationRequest,
  CreateOrganizationResponse
> {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
    private readonly _logger: FastifyLoggerService,
  ) {
    super(
      "CreateOrganization",
      "创建组织用例",
      "1.0.0",
      ["organization:create"],
      _logger,
    );
  }

  /**
   * 执行创建组织命令
   *
   * @description 创建新组织，包括验证、持久化和事件发布
   *
   * @param request - 创建组织请求
   * @param context - 用例执行上下文
   * @returns Promise<创建组织响应>
   *
   * @protected
   */
  protected async executeCommand(
    request: CreateOrganizationRequest,
    context: IUseCaseContext,
  ): Promise<CreateOrganizationResponse> {
    // 验证输入参数
    this.validateRequest(request);

    // 检查组织名称唯一性
    await this.validateOrganizationNameUniqueness(
      context.tenant!.id,
      request.name,
      request.parentId,
    );

    // 创建组织实体
    const organization = this.createOrganizationEntity(request, context);

    // 创建组织聚合根
    const organizationAggregate = new OrganizationAggregate(
      EntityId.generate(),
      context.tenant!.id,
      organization,
      this.buildAuditInfo(request.createdBy, context),
      this.logger,
    );

    // 保存组织（事务边界）
    await this.organizationRepository.save(organizationAggregate);

    // 发布领域事件
    await this.publishDomainEvents(organizationAggregate);

    // 返回响应
    return {
      organizationId: organizationAggregate.id,
      name: organizationAggregate.getOrganization().name,
      type: organizationAggregate.getOrganization().type,
      tenantId: organizationAggregate.tenantId,
      createdAt: organizationAggregate.getOrganization().createdAt,
    };
  }

  /**
   * 验证请求参数
   *
   * @param request - 创建组织请求
   * @private
   */
  private validateRequest(request: CreateOrganizationRequest): void {
    if (!request.name || !request.name.trim()) {
      throw new ValidationException(
        "ORGANIZATION_NAME_REQUIRED",
        "组织名称不能为空",
        "组织名称是必填字段",
        400
      );
    }

    if (request.name.trim().length > 100) {
      throw new ValidationException(
        "ORGANIZATION_NAME_TOO_LONG",
        "组织名称长度不能超过100字符",
        "组织名称长度不能超过100字符",
        400
      );
    }

    if (!request.type) {
      throw new ValidationException(
        "ORGANIZATION_TYPE_REQUIRED",
        "组织类型不能为空",
        "组织类型是必填字段",
        400
      );
    }

    if (!request.createdBy || !request.createdBy.trim()) {
      throw new ValidationException(
        "CREATED_BY_REQUIRED",
        "创建者标识符不能为空",
        "创建者标识符是必填字段",
        400
      );
    }
  }

  /**
   * 验证组织名称唯一性
   *
   * @param tenantId - 租户ID
   * @param name - 组织名称
   * @param parentId - 父组织ID
   * @private
   */
  private async validateOrganizationNameUniqueness(
    tenantId: TenantId,
    name: string,
    parentId?: EntityId,
  ): Promise<void> {
    const existingOrganization = await this.organizationRepository.findByName(
      tenantId,
      name,
      parentId,
    );

    if (existingOrganization) {
      throw new ResourceAlreadyExistsException(
        "组织",
        name
      );
    }
  }

  /**
   * 创建组织实体
   *
   * @param request - 创建组织请求
   * @param context - 用例执行上下文
   * @returns 组织实体
   * @private
   */
  private createOrganizationEntity(
    request: CreateOrganizationRequest,
    context: IUseCaseContext,
  ): Organization {
    return new Organization(
      EntityId.generate(),
      {
        name: request.name.trim(),
        type: request.type,
        description: request.description,
        isActive: true,
        parentId: request.parentId,
        path: this.calculatePath(request.parentId),
        sortOrder: request.sortOrder || 0,
      },
      this.buildAuditInfo(request.createdBy, context),
      this.logger,
    );
  }

  /**
   * 计算组织路径
   *
   * @param parentId - 父组织ID
   * @returns 组织路径
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
