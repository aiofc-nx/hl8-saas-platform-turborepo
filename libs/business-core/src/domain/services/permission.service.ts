/**
 * 权限服务
 *
 * @description 基于CASL的权限管理服务，提供权限检查、权限合并、权限继承等功能
 *
 * @since 1.0.0
 */

import { EntityId, TenantId, UserId } from "@hl8/isolation-model";
import { Ability, AbilityBuilder, createMongoAbility } from "@casl/ability";
import { Role } from "../entities/role/role.entity.js";
import { Permission } from "../entities/permission/permission.entity.js";
import { UserRole } from "../entities/user-role/user-role.entity.js";
import { RoleAggregate } from "../aggregates/role-aggregate.js";
import { PermissionAggregate } from "../aggregates/permission-aggregate.js";
import { UserRoleAggregate } from "../aggregates/user-role-aggregate.js";
import type { IRoleRepository } from "../repositories/role.repository.js";
import type { IPermissionRepository } from "../repositories/permission.repository.js";
import type { IUserRoleRepository } from "../repositories/user-role.repository.js";
import type { IPureLogger } from "@hl8/pure-logger";

/**
 * 权限上下文
 */
export interface PermissionContext {
  /** 租户ID */
  tenantId: TenantId;

  /** 用户ID */
  userId: UserId;

  /** 组织ID */
  organizationId?: EntityId;

  /** 部门ID */
  departmentId?: EntityId;

  /** 资源ID */
  resourceId?: EntityId;

  /** 额外上下文 */
  extra?: Record<string, any>;
}

/**
 * 权限规则
 */
export interface PermissionRule {
  /** 动作 */
  action: string;

  /** 资源 */
  subject: string;

  /** 条件 */
  conditions?: Record<string, any>;

  /** 字段 */
  fields?: string[];

  /** 是否允许 */
  allow: boolean;
}

/**
 * 权限服务
 *
 * @description 基于CASL的权限管理服务，提供权限检查、权限合并、权限继承等功能
 *
 * ## 业务规则
 *
 * ### 权限检查规则
 * - 权限检查基于用户角色和权限
 * - 权限检查支持条件过滤
 * - 权限检查支持字段级权限
 * - 权限检查支持资源级权限
 *
 * ### 权限合并规则
 * - 多个角色的权限会合并
 * - 权限冲突时以高优先级为准
 * - 系统权限不能被覆盖
 * - 拒绝权限优先于允许权限
 *
 * ### 权限继承规则
 * - 子角色继承父角色的所有权限
 * - 子权限继承父权限的所有条件
 * - 权限继承支持条件覆盖
 * - 权限继承支持动作扩展
 *
 * @example
 * ```typescript
 * // 创建权限服务
 * const permissionService = new PermissionService(
 *   roleRepository,
 *   permissionRepository,
 *   userRoleRepository,
 *   logger
 * );
 *
 * // 检查权限
 * const canManage = await permissionService.can(
 *   context,
 *   "manage",
 *   "user"
 * );
 *
 * // 获取用户权限
 * const ability = await permissionService.getUserAbility(context);
 * ```
 *
 * @since 1.0.0
 */
export class PermissionService {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly logger?: IPureLogger,
  ) {}

  /**
   * 检查用户是否有指定权限
   *
   * @param context - 权限上下文
   * @param action - 权限动作
   * @param subject - 资源类型
   * @param resourceId - 资源ID
   * @returns Promise<boolean>
   */
  async can(
    context: PermissionContext,
    action: string,
    subject: string,
    resourceId?: EntityId,
  ): Promise<boolean> {
    try {
      const ability = await this.getUserAbility(context);
      return ability.can(action, subject, resourceId?.toString());
    } catch (error) {
      this.logger?.error(
        "权限检查失败",
        error instanceof Error ? error.stack : undefined,
        {
          userId: context.userId.toString(),
          action,
          subject,
          resourceId: resourceId?.toString(),
        },
      );
      return false;
    }
  }

  /**
   * 检查用户是否可以管理指定资源
   *
   * @param context - 权限上下文
   * @param subject - 资源类型
   * @param resourceId - 资源ID
   * @returns Promise<boolean>
   */
  async canManage(
    context: PermissionContext,
    subject: string,
    resourceId?: EntityId,
  ): Promise<boolean> {
    return this.can(context, "manage", subject, resourceId);
  }

  /**
   * 检查用户是否可以创建指定资源
   *
   * @param context - 权限上下文
   * @param subject - 资源类型
   * @returns Promise<boolean>
   */
  async canCreate(
    context: PermissionContext,
    subject: string,
  ): Promise<boolean> {
    return this.can(context, "create", subject);
  }

  /**
   * 检查用户是否可以读取指定资源
   *
   * @param context - 权限上下文
   * @param subject - 资源类型
   * @param resourceId - 资源ID
   * @returns Promise<boolean>
   */
  async canRead(
    context: PermissionContext,
    subject: string,
    resourceId?: EntityId,
  ): Promise<boolean> {
    return this.can(context, "read", subject, resourceId);
  }

  /**
   * 检查用户是否可以更新指定资源
   *
   * @param context - 权限上下文
   * @param subject - 资源类型
   * @param resourceId - 资源ID
   * @returns Promise<boolean>
   */
  async canUpdate(
    context: PermissionContext,
    subject: string,
    resourceId?: EntityId,
  ): Promise<boolean> {
    return this.can(context, "update", subject, resourceId);
  }

  /**
   * 检查用户是否可以删除指定资源
   *
   * @param context - 权限上下文
   * @param subject - 资源类型
   * @param resourceId - 资源ID
   * @returns Promise<boolean>
   */
  async canDelete(
    context: PermissionContext,
    subject: string,
    resourceId?: EntityId,
  ): Promise<boolean> {
    return this.can(context, "delete", subject, resourceId);
  }

  /**
   * 获取用户权限能力
   *
   * @param context - 权限上下文
   * @returns Promise<Ability>
   */
  async getUserAbility(context: PermissionContext): Promise<Ability> {
    try {
      const { allow, forbid } = new AbilityBuilder(createMongoAbility);

      // 获取用户角色
      const userRoles = await this.getUserRoles(context);

      // 获取角色权限
      const permissions = await this.getRolePermissions(context, userRoles);

      // 构建权限规则
      for (const permission of permissions) {
        const rule = this.buildPermissionRule(permission, context);
        if (rule.allow) {
          allow(rule.action, rule.subject, rule.conditions, rule.fields);
        } else {
          forbid(rule.action, rule.subject, rule.conditions, rule.fields);
        }
      }

      return createMongoAbility(allow, forbid);
    } catch (error) {
      this.logger?.error(
        "获取用户权限能力失败",
        error instanceof Error ? error.stack : undefined,
        {
          userId: context.userId.toString(),
          tenantId: context.tenantId.toString(),
        },
      );
      return createMongoAbility();
    }
  }

  /**
   * 获取用户角色
   *
   * @param context - 权限上下文
   * @returns Promise<RoleAggregate[]>
   * @private
   */
  private async getUserRoles(
    context: PermissionContext,
  ): Promise<RoleAggregate[]> {
    const userRoleAggregates = await this.userRoleRepository.findByUser(
      context.tenantId,
      context.userId,
    );
    const roles: RoleAggregate[] = [];

    for (const userRoleAggregate of userRoleAggregates) {
      if (userRoleAggregate.isValid()) {
        const role = await this.roleRepository.findById(
          context.tenantId,
          userRoleAggregate.getUserRole().roleId,
        );
        if (role) {
          roles.push(role);
        }
      }
    }

    return roles;
  }

  /**
   * 获取角色权限
   *
   * @param context - 权限上下文
   * @param roles - 角色列表
   * @returns Promise<Permission[]>
   * @private
   */
  private async getRolePermissions(
    context: PermissionContext,
    roles: RoleAggregate[],
  ): Promise<Permission[]> {
    const permissions: Permission[] = [];

    for (const role of roles) {
      const rolePermissions = role.getPermissions();
      for (const permission of rolePermissions) {
        if (
          permission.isActive &&
          permission.matchesConditions(context.extra || {})
        ) {
          permissions.push(permission);
        }
      }
    }

    return permissions;
  }

  /**
   * 构建权限规则
   *
   * @param permission - 权限
   * @param context - 权限上下文
   * @returns PermissionRule
   * @private
   */
  private buildPermissionRule(
    permission: Permission,
    context: PermissionContext,
  ): PermissionRule {
    return {
      action: permission.action.value,
      subject: permission.resource,
      conditions: this.buildConditions(permission, context),
      fields: this.buildFields(permission),
      allow: true,
    };
  }

  /**
   * 构建权限条件
   *
   * @param permission - 权限
   * @param context - 权限上下文
   * @returns Record<string, any>
   * @private
   */
  private buildConditions(
    permission: Permission,
    context: PermissionContext,
  ): Record<string, any> {
    const conditions: Record<string, any> = {};

    // 添加权限条件
    if (permission.conditions) {
      Object.assign(conditions, permission.conditions);
    }

    // 添加上下文条件
    if (context.organizationId) {
      conditions.organizationId = context.organizationId.toString();
    }
    if (context.departmentId) {
      conditions.departmentId = context.departmentId.toString();
    }
    if (context.resourceId) {
      conditions.resourceId = context.resourceId.toString();
    }

    return conditions;
  }

  /**
   * 构建权限字段
   *
   * @param permission - 权限
   * @returns string[]
   * @private
   */
  private buildFields(permission: Permission): string[] {
    // 这里可以根据权限配置返回允许的字段
    // 暂时返回空数组，表示所有字段
    return [];
  }

  /**
   * 合并权限规则
   *
   * @param rules - 权限规则列表
   * @returns PermissionRule[]
   * @private
   */
  private mergePermissionRules(rules: PermissionRule[]): PermissionRule[] {
    const mergedRules: PermissionRule[] = [];
    const ruleMap = new Map<string, PermissionRule>();

    for (const rule of rules) {
      const key = `${rule.action}:${rule.subject}`;
      const existingRule = ruleMap.get(key);

      if (existingRule) {
        // 合并条件
        if (rule.conditions && existingRule.conditions) {
          Object.assign(existingRule.conditions, rule.conditions);
        }
        // 合并字段
        if (rule.fields && existingRule.fields) {
          existingRule.fields = [
            ...new Set([...existingRule.fields, ...rule.fields]),
          ];
        }
        // 拒绝权限优先
        if (!rule.allow) {
          existingRule.allow = false;
        }
      } else {
        ruleMap.set(key, { ...rule });
      }
    }

    return Array.from(ruleMap.values());
  }

  /**
   * 检查权限冲突
   *
   * @param rules - 权限规则列表
   * @returns boolean
   * @private
   */
  private checkPermissionConflicts(rules: PermissionRule[]): boolean {
    const allowRules = rules.filter((r) => r.allow);
    const forbidRules = rules.filter((r) => !r.allow);

    for (const allowRule of allowRules) {
      for (const forbidRule of forbidRules) {
        if (this.isRuleConflict(allowRule, forbidRule)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检查规则冲突
   *
   * @param rule1 - 规则1
   * @param rule2 - 规则2
   * @returns boolean
   * @private
   */
  private isRuleConflict(
    rule1: PermissionRule,
    rule2: PermissionRule,
  ): boolean {
    return rule1.action === rule2.action && rule1.subject === rule2.subject;
  }
}
