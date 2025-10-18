/**
 * 权限冲突处理服务
 *
 * @description 处理用户权限冲突，确保权限分配的一致性和正确性
 *
 * ## 业务规则
 *
 * ### 权限冲突规则
 * - 用户不能同时拥有冲突的角色
 * - 权限继承必须正确
 * - 权限范围必须明确
 * - 权限变更必须记录
 *
 * ### 冲突解决规则
 * - 高权限覆盖低权限
 * - 明确权限优先于继承权限
 * - 最新权限优先于历史权限
 * - 系统权限优先于用户权限
 *
 * @example
 * ```typescript
 * // 解决权限冲突
 * const conflictService = new PermissionConflictResolutionService(userRepository, logger);
 * 
 * const result = await conflictService.resolvePermissionConflicts(userId);
 * if (result.hasConflicts) {
 *   console.log('权限冲突:', result.conflicts);
 *   console.log('解决建议:', result.resolutions);
 * }
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type { IUserRepository } from "../../../domain/repositories/user.repository.js";
import type { IOrganizationRepository } from "../../../domain/repositories/organization.repository.js";
import type { IDepartmentRepository } from "../../../domain/repositories/department.repository.js";
import { ResourceNotFoundException } from "../../../common/exceptions/business.exceptions.js";

/**
 * 权限冲突信息
 */
export interface PermissionConflictInfo {
  /** 冲突类型 */
  conflictType: "ROLE_CONFLICT" | "PERMISSION_CONFLICT" | "SCOPE_CONFLICT" | "INHERITANCE_CONFLICT";
  /** 冲突描述 */
  description: string;
  /** 冲突的权限 */
  conflictingPermissions: string[];
  /** 冲突的角色 */
  conflictingRoles: string[];
  /** 冲突的上下文 */
  context: {
    organizationId?: EntityId;
    departmentId?: EntityId;
    tenantId?: TenantId;
  };
}

/**
 * 权限冲突解决结果
 */
export interface PermissionConflictResolutionResult {
  /** 是否有冲突 */
  hasConflicts: boolean;
  /** 冲突列表 */
  conflicts: PermissionConflictInfo[];
  /** 解决建议 */
  resolutions: Array<{
    /** 建议类型 */
    type: "REMOVE_ROLE" | "ADJUST_PERMISSION" | "CLARIFY_SCOPE" | "UPDATE_INHERITANCE";
    /** 建议描述 */
    description: string;
    /** 建议操作 */
    actions: string[];
    /** 优先级 */
    priority: "HIGH" | "MEDIUM" | "LOW";
  }>;
  /** 最终权限 */
  finalPermissions: string[];
  /** 最终角色 */
  finalRoles: string[];
}

/**
 * 用户权限信息
 */
export interface UserPermissionInfo {
  /** 用户ID */
  userId: EntityId;
  /** 租户ID */
  tenantId: TenantId;
  /** 用户角色 */
  roles: Array<{
    /** 角色名称 */
    name: string;
    /** 角色类型 */
    type: string;
    /** 角色权限 */
    permissions: string[];
    /** 角色上下文 */
    context: {
      organizationId?: EntityId;
      departmentId?: EntityId;
      tenantId?: TenantId;
    };
  }>;
  /** 直接权限 */
  directPermissions: string[];
  /** 继承权限 */
  inheritedPermissions: string[];
  /** 有效权限 */
  effectivePermissions: string[];
}

/**
 * 权限冲突处理服务
 *
 * @description 处理用户权限冲突，确保权限分配的一致性和正确性
 */
export class PermissionConflictResolutionService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly departmentRepository: IDepartmentRepository,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 解决用户权限冲突
   *
   * @description 分析并解决用户的权限冲突
   *
   * @param userId - 用户ID
   * @returns Promise<权限冲突解决结果>
   *
   * @example
   * ```typescript
   * const result = await conflictService.resolvePermissionConflicts(userId);
   * if (result.hasConflicts) {
   *   console.log('权限冲突:', result.conflicts);
   *   console.log('解决建议:', result.resolutions);
   * }
   * ```
   */
  async resolvePermissionConflicts(
    userId: EntityId,
  ): Promise<PermissionConflictResolutionResult> {
    try {
      this.logger.debug("解决用户权限冲突", {
        userId: userId.toString(),
      });

      // 获取用户权限信息
      const userPermissionInfo = await this.getUserPermissionInfo(userId);

      // 分析权限冲突
      const conflicts = await this.analyzePermissionConflicts(userPermissionInfo);

      // 生成解决建议
      const resolutions = await this.generateResolutionSuggestions(conflicts, userPermissionInfo);

      // 计算最终权限
      const finalPermissions = await this.calculateFinalPermissions(userPermissionInfo, conflicts);
      const finalRoles = await this.calculateFinalRoles(userPermissionInfo, conflicts);

      const result: PermissionConflictResolutionResult = {
        hasConflicts: conflicts.length > 0,
        conflicts,
        resolutions,
        finalPermissions,
        finalRoles,
      };

      this.logger.debug("用户权限冲突解决完成", {
        userId: userId.toString(),
        hasConflicts: result.hasConflicts,
        conflictCount: conflicts.length,
        resolutionCount: resolutions.length,
      });

      return result;
    } catch (error) {
      this.logger.error("解决用户权限冲突失败", {
        error: error.message,
        userId: userId.toString(),
      });
      throw error;
    }
  }

  /**
   * 获取用户权限信息
   *
   * @param userId - 用户ID
   * @returns Promise<用户权限信息>
   * @private
   */
  private async getUserPermissionInfo(userId: EntityId): Promise<UserPermissionInfo> {
    // 获取用户信息
    const userAggregate = await this.userRepository.findById(userId);
    if (!userAggregate) {
      throw new ResourceNotFoundException("用户", userId.toString());
    }

    const user = userAggregate.getUser();
    const tenantId = userAggregate.tenantId;

    // 获取用户角色
    const roles = await this.getUserRoles(userId, tenantId);

    // 获取直接权限
    const directPermissions = await this.getUserDirectPermissions(userId);

    // 获取继承权限
    const inheritedPermissions = await this.getUserInheritedPermissions(userId, tenantId);

    // 计算有效权限
    const effectivePermissions = this.calculateEffectivePermissions(
      directPermissions,
      inheritedPermissions,
    );

    return {
      userId,
      tenantId,
      roles,
      directPermissions,
      inheritedPermissions,
      effectivePermissions,
    };
  }

  /**
   * 分析权限冲突
   *
   * @param userPermissionInfo - 用户权限信息
   * @returns Promise<权限冲突列表>
   * @private
   */
  private async analyzePermissionConflicts(
    userPermissionInfo: UserPermissionInfo,
  ): Promise<PermissionConflictInfo[]> {
    const conflicts: PermissionConflictInfo[] = [];

    // 分析角色冲突
    const roleConflicts = this.analyzeRoleConflicts(userPermissionInfo.roles);
    conflicts.push(...roleConflicts);

    // 分析权限冲突
    const permissionConflicts = this.analyzePermissionConflicts(userPermissionInfo);
    conflicts.push(...permissionConflicts);

    // 分析作用域冲突
    const scopeConflicts = this.analyzeScopeConflicts(userPermissionInfo.roles);
    conflicts.push(...scopeConflicts);

    // 分析继承冲突
    const inheritanceConflicts = this.analyzeInheritanceConflicts(
      userPermissionInfo.directPermissions,
      userPermissionInfo.inheritedPermissions,
    );
    conflicts.push(...inheritanceConflicts);

    return conflicts;
  }

  /**
   * 分析角色冲突
   *
   * @param roles - 角色列表
   * @returns 角色冲突列表
   * @private
   */
  private analyzeRoleConflicts(roles: Array<{ name: string; permissions?: string[] }>): PermissionConflictInfo[] {
    const conflicts: PermissionConflictInfo[] = [];

    // 检查是否有冲突的角色组合
    const roleNames = roles.map(role => role.name);
    const conflictingRolePairs = [
      ["ADMIN", "USER"],
      ["MANAGER", "EMPLOYEE"],
      ["READ_ONLY", "WRITE"],
    ];

    for (const [role1, role2] of conflictingRolePairs) {
      if (roleNames.includes(role1) && roleNames.includes(role2)) {
        conflicts.push({
          conflictType: "ROLE_CONFLICT",
          description: `角色 ${role1} 和 ${role2} 存在冲突`,
          conflictingPermissions: [],
          conflictingRoles: [role1, role2],
          context: {},
        });
      }
    }

    return conflicts;
  }

  /**
   * 分析权限冲突
   *
   * @param userPermissionInfo - 用户权限信息
   * @returns 权限冲突列表
   * @private
   */
  private analyzePermissionConflicts(userPermissionInfo: UserPermissionInfo): PermissionConflictInfo[] {
    const conflicts: PermissionConflictInfo[] = [];

    // 检查权限冲突
    const allPermissions = [
      ...userPermissionInfo.directPermissions,
      ...userPermissionInfo.inheritedPermissions,
    ];

    const conflictingPermissionPairs = [
      ["READ", "WRITE"],
      ["CREATE", "DELETE"],
      ["VIEW", "EDIT"],
    ];

    for (const [perm1, perm2] of conflictingPermissionPairs) {
      if (allPermissions.includes(perm1) && allPermissions.includes(perm2)) {
        conflicts.push({
          conflictType: "PERMISSION_CONFLICT",
          description: `权限 ${perm1} 和 ${perm2} 存在冲突`,
          conflictingPermissions: [perm1, perm2],
          conflictingRoles: [],
          context: {},
        });
      }
    }

    return conflicts;
  }

  /**
   * 分析作用域冲突
   *
   * @param roles - 角色列表
   * @returns 作用域冲突列表
   * @private
   */
  private analyzeScopeConflicts(roles: Array<{ name: string; permissions?: string[] }>): PermissionConflictInfo[] {
    const conflicts: PermissionConflictInfo[] = [];

    // 检查作用域冲突
    for (const role of roles) {
      if (role.context.organizationId && role.context.departmentId) {
        // 检查部门是否属于组织
        // 这里需要根据实际业务逻辑实现
        conflicts.push({
          conflictType: "SCOPE_CONFLICT",
          description: `角色 ${role.name} 的作用域存在冲突`,
          conflictingPermissions: role.permissions,
          conflictingRoles: [role.name],
          context: role.context,
        });
      }
    }

    return conflicts;
  }

  /**
   * 分析继承冲突
   *
   * @param directPermissions - 直接权限
   * @param inheritedPermissions - 继承权限
   * @returns 继承冲突列表
   * @private
   */
  private analyzeInheritanceConflicts(
    directPermissions: string[],
    inheritedPermissions: string[],
  ): PermissionConflictInfo[] {
    const conflicts: PermissionConflictInfo[] = [];

    // 检查继承冲突
    const conflictingPermissions = directPermissions.filter(perm => 
      inheritedPermissions.includes(perm)
    );

    if (conflictingPermissions.length > 0) {
      conflicts.push({
        conflictType: "INHERITANCE_CONFLICT",
        description: "直接权限和继承权限存在冲突",
        conflictingPermissions,
        conflictingRoles: [],
        context: {},
      });
    }

    return conflicts;
  }

  /**
   * 生成解决建议
   *
   * @param conflicts - 冲突列表
   * @param userPermissionInfo - 用户权限信息
   * @returns Promise<解决建议列表>
   * @private
   */
  private async generateResolutionSuggestions(
    conflicts: PermissionConflictInfo[],
    userPermissionInfo: UserPermissionInfo,
  ): Promise<Array<{
    type: string;
    description: string;
    actions: string[];
    priority: "HIGH" | "MEDIUM" | "LOW";
  }>> {
    const resolutions: Array<{
      type: string;
      description: string;
      actions: string[];
      priority: "HIGH" | "MEDIUM" | "LOW";
    }> = [];

    for (const conflict of conflicts) {
      switch (conflict.conflictType) {
        case "ROLE_CONFLICT":
          resolutions.push({
            type: "REMOVE_ROLE",
            description: "移除冲突的角色",
            actions: ["移除低权限角色", "保留高权限角色"],
            priority: "HIGH",
          });
          break;
        case "PERMISSION_CONFLICT":
          resolutions.push({
            type: "ADJUST_PERMISSION",
            description: "调整权限设置",
            actions: ["移除冲突权限", "重新分配权限"],
            priority: "MEDIUM",
          });
          break;
        case "SCOPE_CONFLICT":
          resolutions.push({
            type: "CLARIFY_SCOPE",
            description: "明确权限作用域",
            actions: ["重新定义作用域", "调整权限范围"],
            priority: "MEDIUM",
          });
          break;
        case "INHERITANCE_CONFLICT":
          resolutions.push({
            type: "UPDATE_INHERITANCE",
            description: "更新权限继承",
            actions: ["调整继承规则", "重新分配权限"],
            priority: "LOW",
          });
          break;
      }
    }

    return resolutions;
  }

  /**
   * 计算最终权限
   *
   * @param userPermissionInfo - 用户权限信息
   * @param conflicts - 冲突列表
   * @returns Promise<最终权限列表>
   * @private
   */
  private async calculateFinalPermissions(
    userPermissionInfo: UserPermissionInfo,
    conflicts: PermissionConflictInfo[],
  ): Promise<string[]> {
    // 基于冲突解决策略计算最终权限
    let finalPermissions = [...userPermissionInfo.effectivePermissions];

    // 移除冲突权限
    for (const conflict of conflicts) {
      if (conflict.conflictType === "PERMISSION_CONFLICT") {
        // 保留高权限，移除低权限
        const highPriorityPermissions = ["WRITE", "DELETE", "EDIT"];
        const lowPriorityPermissions = ["READ", "CREATE", "VIEW"];
        
        for (const perm of conflict.conflictingPermissions) {
          if (lowPriorityPermissions.includes(perm)) {
            finalPermissions = finalPermissions.filter(p => p !== perm);
          }
        }
      }
    }

    return [...new Set(finalPermissions)]; // 去重
  }

  /**
   * 计算最终角色
   *
   * @param userPermissionInfo - 用户权限信息
   * @param conflicts - 冲突列表
   * @returns Promise<最终角色列表>
   * @private
   */
  private async calculateFinalRoles(
    userPermissionInfo: UserPermissionInfo,
    conflicts: PermissionConflictInfo[],
  ): Promise<string[]> {
    // 基于冲突解决策略计算最终角色
    let finalRoles = userPermissionInfo.roles.map(role => role.name);

    // 移除冲突角色
    for (const conflict of conflicts) {
      if (conflict.conflictType === "ROLE_CONFLICT") {
        // 保留高权限角色，移除低权限角色
        const highPriorityRoles = ["ADMIN", "MANAGER"];
        const lowPriorityRoles = ["USER", "EMPLOYEE"];
        
        for (const role of conflict.conflictingRoles) {
          if (lowPriorityRoles.includes(role)) {
            finalRoles = finalRoles.filter(r => r !== role);
          }
        }
      }
    }

    return [...new Set(finalRoles)]; // 去重
  }

  /**
   * 获取用户角色
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns Promise<角色列表>
   * @private
   */
  private async getUserRoles(userId: EntityId, tenantId: TenantId): Promise<any[]> {
    // 这里需要根据实际业务逻辑实现
    // 暂时返回空数组
    return [];
  }

  /**
   * 获取用户直接权限
   *
   * @param userId - 用户ID
   * @returns Promise<直接权限列表>
   * @private
   */
  private async getUserDirectPermissions(userId: EntityId): Promise<string[]> {
    // 这里需要根据实际业务逻辑实现
    // 暂时返回空数组
    return [];
  }

  /**
   * 获取用户继承权限
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns Promise<继承权限列表>
   * @private
   */
  private async getUserInheritedPermissions(userId: EntityId, tenantId: TenantId): Promise<string[]> {
    // 这里需要根据实际业务逻辑实现
    // 暂时返回空数组
    return [];
  }

  /**
   * 计算有效权限
   *
   * @param directPermissions - 直接权限
   * @param inheritedPermissions - 继承权限
   * @returns 有效权限列表
   * @private
   */
  private calculateEffectivePermissions(
    directPermissions: string[],
    inheritedPermissions: string[],
  ): string[] {
    // 合并直接权限和继承权限，去重
    return [...new Set([...directPermissions, ...inheritedPermissions])];
  }
}
