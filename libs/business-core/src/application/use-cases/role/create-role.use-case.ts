/**
 * 创建角色用例
 *
 * @description 实现创建角色的业务逻辑
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { UseCase } from "../base/use-case.js";
import { Role } from "../../../domain/entities/role/role.entity.js";
import { RoleAggregate } from "../../../domain/aggregates/role-aggregate.js";
import { RoleType } from "../../../domain/value-objects/types/role-type.vo.js";
import { PermissionType } from "../../../domain/value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../../../domain/value-objects/types/permission-action.vo.js";
import type { IRoleRepository } from "../../../domain/repositories/role.repository.js";
import type { IPureLogger } from "@hl8/pure-logger";

/**
 * 创建角色请求
 */
export interface CreateRoleRequest {
  /** 租户ID */
  tenantId: TenantId;

  /** 角色名称 */
  name: string;

  /** 角色描述 */
  description?: string;

  /** 角色类型 */
  type: RoleType;

  /** 权限类型 */
  permissionType: PermissionType;

  /** 权限动作列表 */
  actions: PermissionAction[];

  /** 是否启用 */
  isActive?: boolean;

  /** 是否系统角色 */
  isSystemRole?: boolean;

  /** 是否可编辑 */
  isEditable?: boolean;

  /** 角色优先级 */
  priority?: number;

  /** 父角色ID */
  parentRoleId?: EntityId;

  /** 角色标签 */
  tags?: string[];

  /** 角色配置 */
  config?: Record<string, any>;

  /** 创建者 */
  createdBy: string;
}

/**
 * 创建角色响应
 */
export interface CreateRoleResponse {
  /** 角色ID */
  roleId: EntityId;

  /** 角色名称 */
  name: string;

  /** 角色描述 */
  description?: string;

  /** 角色类型 */
  type: string;

  /** 权限类型 */
  permissionType: string;

  /** 权限动作列表 */
  actions: string[];

  /** 是否启用 */
  isActive: boolean;

  /** 是否系统角色 */
  isSystemRole: boolean;

  /** 是否可编辑 */
  isEditable: boolean;

  /** 角色优先级 */
  priority: number;

  /** 父角色ID */
  parentRoleId?: string;

  /** 角色标签 */
  tags?: string[];

  /** 角色配置 */
  config?: Record<string, any>;

  /** 创建时间 */
  createdAt: Date;

  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 创建角色用例
 *
 * @description 实现创建角色的业务逻辑
 *
 * ## 业务规则
 *
 * ### 角色创建规则
 * - 角色名称在同一租户内必须唯一
 * - 角色名称不能为空，长度不能超过100字符
 * - 角色描述长度不能超过500字符
 * - 角色必须至少有一个权限动作
 * - 系统角色只能由系统管理员创建
 *
 * ### 权限分配规则
 * - 角色必须至少有一个权限动作
 * - 权限动作不能重复
 * - 管理权限包含所有其他权限
 * - 权限分配需要相应的权限
 *
 * @example
 * ```typescript
 * // 创建角色用例
 * const createRoleUseCase = new CreateRoleUseCase(roleRepository, logger);
 *
 * // 执行用例
 * const result = await createRoleUseCase.execute({
 *   tenantId: TenantId.generate(),
 *   name: "管理员",
 *   description: "系统管理员角色",
 *   type: RoleType.TENANT,
 *   permissionType: PermissionType.TENANT,
 *   actions: [PermissionAction.MANAGE],
 *   isActive: true,
 *   isSystemRole: false,
 *   isEditable: true,
 *   priority: 100,
 *   createdBy: "system"
 * });
 *
 * console.log(result.roleId); // 新创建的角色ID
 * ```
 *
 * @since 1.0.0
 */
export class CreateRoleUseCase extends UseCase<
  CreateRoleRequest,
  CreateRoleResponse
> {
  constructor(
    private readonly roleRepository: IRoleRepository,
    logger?: IPureLogger,
  ) {
    super(logger);
  }

  /**
   * 执行创建角色用例
   *
   * @param request - 创建角色请求
   * @returns 创建角色响应
   */
  async execute(request: CreateRoleRequest): Promise<CreateRoleResponse> {
    this.logger?.info("开始创建角色", {
      tenantId: request.tenantId.toString(),
      name: request.name,
      type: request.type.value,
    });

    try {
      // 验证请求
      this.validateRequest(request);

      // 检查角色名称是否已存在
      await this.checkRoleNameExists(request.tenantId, request.name);

      // 创建角色实体
      const role = new Role(
        EntityId.generate(),
        {
          name: request.name,
          description: request.description,
          type: request.type,
          permissionType: request.permissionType,
          actions: request.actions,
          isActive: request.isActive ?? true,
          isSystemRole: request.isSystemRole ?? false,
          isEditable: request.isEditable ?? true,
          priority: request.priority ?? 100,
          parentRoleId: request.parentRoleId,
          tags: request.tags,
          config: request.config,
        },
        {
          createdBy: request.createdBy,
          createdAt: new Date(),
          updatedBy: request.createdBy,
          updatedAt: new Date(),
        },
        this.logger,
      );

      // 创建角色聚合根
      const roleAggregate = new RoleAggregate(
        EntityId.generate(),
        request.tenantId,
        role,
        {
          createdBy: request.createdBy,
          createdAt: new Date(),
          updatedBy: request.createdBy,
          updatedAt: new Date(),
        },
        this.logger,
      );

      // 保存角色
      await this.roleRepository.save(roleAggregate);

      this.logger?.info("角色创建成功", {
        roleId: role.id.toString(),
        name: role.name,
        type: role.type.value,
      });

      // 返回响应
      return {
        roleId: role.id,
        name: role.name,
        description: role.description,
        type: role.type.value,
        permissionType: role.permissionType.value,
        actions: role.actions.map((a) => a.value),
        isActive: role.isActive,
        isSystemRole: role.isSystemRole,
        isEditable: role.isEditable,
        priority: role.priority,
        parentRoleId: role.parentRoleId?.toString(),
        tags: role.tags,
        config: role.config,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    } catch (error) {
      this.logger?.error(
        "创建角色失败",
        error instanceof Error ? error.stack : undefined,
        {
          tenantId: request.tenantId.toString(),
          name: request.name,
          error: error instanceof Error ? error.message : String(error),
        },
      );
      throw error;
    }
  }

  /**
   * 验证请求
   *
   * @param request - 创建角色请求
   * @private
   */
  private validateRequest(request: CreateRoleRequest): void {
    if (!request.tenantId) {
      throw new Error("租户ID不能为空");
    }
    if (!request.name || !request.name.trim()) {
      throw new Error("角色名称不能为空");
    }
    if (request.name.trim().length > 100) {
      throw new Error("角色名称长度不能超过100字符");
    }
    if (request.description && request.description.trim().length > 500) {
      throw new Error("角色描述长度不能超过500字符");
    }
    if (!request.type) {
      throw new Error("角色类型不能为空");
    }
    if (!request.permissionType) {
      throw new Error("权限类型不能为空");
    }
    if (!request.actions || request.actions.length === 0) {
      throw new Error("角色必须至少有一个权限动作");
    }
    if (!request.createdBy) {
      throw new Error("创建者不能为空");
    }
  }

  /**
   * 检查角色名称是否已存在
   *
   * @param tenantId - 租户ID
   * @param name - 角色名称
   * @private
   */
  private async checkRoleNameExists(
    tenantId: TenantId,
    name: string,
  ): Promise<void> {
    const existingRole = await this.roleRepository.findByName(tenantId, name);
    if (existingRole) {
      throw new Error(`角色名称 "${name}" 已存在`);
    }
  }
}
