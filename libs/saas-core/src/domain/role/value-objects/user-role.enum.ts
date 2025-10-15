/**
 * 用户角色枚举
 *
 * @description 定义系统中用户的各种角色，用于权限控制和访问管理
 * @since 1.0.0
 */

/**
 * 用户角色枚举
 *
 * 定义了平台中用户可能承担的各种角色，每种角色对应不同的权限集合：
 *
 * ## 业务规则
 *
 * ### 角色层级结构
 * - **SUPER_ADMIN**: 超级管理员 - 平台最高权限，管理所有租户
 * - **TENANT_ADMIN**: 租户管理员 - 管理单个租户的所有资源
 * - **ORGANIZATION_ADMIN**: 组织管理员 - 管理组织内的用户和资源
 * - **DEPARTMENT_MANAGER**: 部门经理 - 管理部门内的用户和资源
 * - **USER**: 普通用户 - 基础用户权限，只能访问自己的资源
 * - **GUEST**: 访客 - 受限访问权限，只能查看公开资源
 *
 * ### 权限继承规则
 * - 高级角色自动继承低级角色的权限
 * - 角色权限具有向下兼容性
 * - 特殊权限需要显式授权
 *
 * ### 角色分配规则
 * - 每个用户在同一租户内只能有一个主要角色
 * - 用户可以拥有多个临时角色（如项目角色）
 * - 角色变更需要相应的授权和审计
 *
 * @example
 * ```typescript
 * // 创建用户时分配角色
 * const user = new User(
 *   userId,
 *   username,
 *   email,
 *   UserRole.USER
 * );
 *
 * // 检查用户角色权限
 * if (user.role === UserRole.TENANT_ADMIN) {
 *   // 执行管理员操作
 * }
 *
 * // 角色升级
 * user.promoteTo(UserRole.DEPARTMENT_MANAGER);
 * ```
 */
export enum UserRole {
  /**
   * 超级管理员
   *
   * 平台最高权限角色，具有以下权限：
   * - 管理所有租户
   * - 访问系统配置
   * - 管理平台用户
   * - 查看系统统计和日志
   * - 执行系统维护操作
   */
  SUPER_ADMIN = "super_admin",

  /**
   * 租户管理员
   *
   * 租户内的最高权限角色，具有以下权限：
   * - 管理租户内所有用户
   * - 配置租户设置
   * - 管理组织架构
   * - 分配用户角色
   * - 查看租户统计和日志
   */
  TENANT_ADMIN = "tenant_admin",

  /**
   * 组织管理员
   *
   * 组织内的管理角色，具有以下权限：
   * - 管理组织内用户
   * - 配置组织设置
   * - 管理部门结构
   * - 分配部门角色
   * - 查看组织统计
   */
  ORGANIZATION_ADMIN = "organization_admin",

  /**
   * 部门经理
   *
   * 部门内的管理角色，具有以下权限：
   * - 管理部门内用户
   * - 配置部门设置
   * - 分配用户任务
   * - 查看部门统计
   * - 审批部门事务
   */
  DEPARTMENT_MANAGER = "department_manager",

  /**
   * 普通用户
   *
   * 基础用户角色，具有以下权限：
   * - 访问个人资源
   * - 编辑个人资料
   * - 查看授权的内容
   * - 参与协作功能
   * - 使用基础功能
   */
  USER = "user",

  /**
   * 访客
   *
   * 受限访问角色，具有以下权限：
   * - 查看公开内容
   * - 基础浏览功能
   * - 受限的交互功能
   * - 无数据修改权限
   */
  GUEST = "guest",
}

/**
 * 用户角色工具类
 *
 * @description 提供用户角色的验证、比较和权限检查功能
 * @since 1.0.0
 */
export class UserRoleUtils {
  /**
   * 获取所有用户角色
   *
   * @returns 所有用户角色的数组
   */
  static getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * 获取管理角色
   *
   * @returns 管理角色的数组
   */
  static getAdminRoles(): UserRole[] {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.TENANT_ADMIN,
      UserRole.ORGANIZATION_ADMIN,
      UserRole.DEPARTMENT_MANAGER,
    ];
  }

  /**
   * 获取普通用户角色
   *
   * @returns 普通用户角色的数组
   */
  static getRegularRoles(): UserRole[] {
    return [UserRole.USER, UserRole.GUEST];
  }

  /**
   * 检查是否为管理角色
   *
   * @param role 用户角色
   * @returns 是否为管理角色
   */
  static isAdmin(role: UserRole): boolean {
    return this.getAdminRoles().includes(role);
  }

  /**
   * 检查是否为超级管理员
   *
   * @param role 用户角色
   * @returns 是否为超级管理员
   */
  static isSuperAdmin(role: UserRole): boolean {
    return role === UserRole.SUPER_ADMIN;
  }

  /**
   * 检查是否为租户管理员
   *
   * @param role 用户角色
   * @returns 是否为租户管理员
   */
  static isTenantAdmin(role: UserRole): boolean {
    return role === UserRole.TENANT_ADMIN;
  }

  /**
   * 检查是否为组织管理员
   *
   * @param role 用户角色
   * @returns 是否为组织管理员
   */
  static isOrganizationAdmin(role: UserRole): boolean {
    return role === UserRole.ORGANIZATION_ADMIN;
  }

  /**
   * 检查是否为部门经理
   *
   * @param role 用户角色
   * @returns 是否为部门经理
   */
  static isDepartmentManager(role: UserRole): boolean {
    return role === UserRole.DEPARTMENT_MANAGER;
  }

  /**
   * 检查是否为普通用户
   *
   * @param role 用户角色
   * @returns 是否为普通用户
   */
  static isUser(role: UserRole): boolean {
    return role === UserRole.USER;
  }

  /**
   * 检查是否为访客
   *
   * @param role 用户角色
   * @returns 是否为访客
   */
  static isGuest(role: UserRole): boolean {
    return role === UserRole.GUEST;
  }

  /**
   * 获取角色显示名称
   *
   * @param role 用户角色
   * @returns 显示名称
   */
  static getDisplayName(role: UserRole): string {
    const displayNames: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: "超级管理员",
      [UserRole.TENANT_ADMIN]: "租户管理员",
      [UserRole.ORGANIZATION_ADMIN]: "组织管理员",
      [UserRole.DEPARTMENT_MANAGER]: "部门经理",
      [UserRole.USER]: "普通用户",
      [UserRole.GUEST]: "访客",
    };
    return displayNames[role] || "未知角色";
  }

  /**
   * 获取角色描述
   *
   * @param role 用户角色
   * @returns 角色描述
   */
  static getDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: "平台最高权限，管理所有租户和系统配置",
      [UserRole.TENANT_ADMIN]: "租户内最高权限，管理租户内所有资源",
      [UserRole.ORGANIZATION_ADMIN]: "组织内管理权限，管理组织架构和用户",
      [UserRole.DEPARTMENT_MANAGER]: "部门内管理权限，管理部门事务和用户",
      [UserRole.USER]: "基础用户权限，访问个人资源和协作功能",
      [UserRole.GUEST]: "受限访问权限，只能查看公开内容",
    };
    return descriptions[role] || "未知角色描述";
  }

  /**
   * 验证用户角色
   *
   * @param role 待验证的角色
   * @returns 是否为有效的用户角色
   */
  static isValid(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
  }

  /**
   * 比较角色权限等级
   *
   * @param role1 第一个角色
   * @param role2 第二个角色
   * @returns 比较结果：-1 (role1 < role2), 0 (相等), 1 (role1 > role2)
   */
  static compare(role1: UserRole, role2: UserRole): number {
    const levels: Record<UserRole, number> = {
      [UserRole.GUEST]: 0,
      [UserRole.USER]: 1,
      [UserRole.DEPARTMENT_MANAGER]: 2,
      [UserRole.ORGANIZATION_ADMIN]: 3,
      [UserRole.TENANT_ADMIN]: 4,
      [UserRole.SUPER_ADMIN]: 5,
    };
    return levels[role1] - levels[role2];
  }

  /**
   * 检查角色是否有权限执行操作
   *
   * @param role 用户角色
   * @param operation 操作类型
   * @returns 是否有权限
   */
  static hasPermission(role: UserRole, operation: string): boolean {
    // 超级管理员拥有所有权限
    if (role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // 根据角色定义权限映射
    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: ["*"], // 所有权限
      [UserRole.TENANT_ADMIN]: [
        "tenant.manage",
        "tenant.configure",
        "organization.manage",
        "department.manage",
        "user.manage",
        "role.assign",
      ],
      [UserRole.ORGANIZATION_ADMIN]: [
        "organization.manage",
        "department.manage",
        "user.manage",
        "role.assign",
      ],
      [UserRole.DEPARTMENT_MANAGER]: [
        "department.manage",
        "user.manage",
        "task.assign",
      ],
      [UserRole.USER]: [
        "profile.edit",
        "content.view",
        "collaboration.participate",
      ],
      [UserRole.GUEST]: ["content.view.public"],
    };

    const permissions = rolePermissions[role] || [];
    return permissions.includes("*") || permissions.includes(operation);
  }

  /**
   * 检查是否可以分配目标角色
   *
   * @param assignerRole 分配者角色
   * @param targetRole 目标角色
   * @returns 是否可以分配
   */
  static canAssign(assignerRole: UserRole, targetRole: UserRole): boolean {
    // 只有管理员可以分配角色
    if (!this.isAdmin(assignerRole)) {
      return false;
    }

    // 不能分配比自己权限更高的角色
    return this.compare(assignerRole, targetRole) >= 0;
  }

  /**
   * 获取角色的权限列表
   *
   * @param role 用户角色
   * @returns 权限列表
   */
  static getPermissions(role: UserRole): string[] {
    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: ["*"], // 所有权限
      [UserRole.TENANT_ADMIN]: [
        "tenant.manage",
        "tenant.configure",
        "organization.manage",
        "department.manage",
        "user.manage",
        "role.assign",
      ],
      [UserRole.ORGANIZATION_ADMIN]: [
        "organization.manage",
        "department.manage",
        "user.manage",
        "role.assign",
      ],
      [UserRole.DEPARTMENT_MANAGER]: [
        "department.manage",
        "user.manage",
        "task.assign",
      ],
      [UserRole.USER]: [
        "profile.edit",
        "content.view",
        "collaboration.participate",
      ],
      [UserRole.GUEST]: ["content.view.public"],
    };

    return rolePermissions[role] || [];
  }
}
