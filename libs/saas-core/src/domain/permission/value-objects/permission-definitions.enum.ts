/**
 * 权限定义枚举
 *
 * @description 定义系统中所有可用的权限，用于细粒度的访问控制
 * @since 1.0.0
 */

/**
 * 权限定义枚举
 *
 * 定义了平台中所有可用的权限，采用分层命名规范：
 *
 * ## 业务规则
 *
 * ### 权限命名规范
 * - 格式：`资源.操作`
 * - 资源：tenant, organization, department, user, role, permission 等
 * - 操作：create, read, update, delete, manage, configure 等
 *
 * ### 权限层级结构
 * - **系统级权限**: 管理整个平台的权限
 * - **租户级权限**: 管理租户内资源的权限
 * - **组织级权限**: 管理组织内资源的权限
 * - **部门级权限**: 管理部门内资源的权限
 * - **用户级权限**: 管理个人资源的权限
 *
 * ### 权限继承规则
 * - manage 权限包含所有 CRUD 权限
 * - configure 权限包含配置相关的所有权限
 * - 高级权限自动包含低级权限
 *
 * @example
 * ```typescript
 * // 检查用户权限
 * if (user.hasPermission(PermissionDefinitions.TENANT_MANAGE)) {
 *   // 执行租户管理操作
 * }
 *
 * // 权限验证
 * const canCreateUser = PermissionDefinitions.USER_CREATE;
 * if (permissionService.check(userId, canCreateUser)) {
 *   // 允许创建用户
 * }
 * ```
 */
export enum PermissionDefinitions {
  // ========== 系统级权限 ==========

  /**
   * 系统管理权限
   * 管理整个平台的配置和用户
   */
  SYSTEM_MANAGE = "system.manage",

  /**
   * 系统配置权限
   * 配置系统级别的设置
   */
  SYSTEM_CONFIGURE = "system.configure",

  /**
   * 系统监控权限
   * 查看系统监控和统计信息
   */
  SYSTEM_MONITOR = "system.monitor",

  /**
   * 系统维护权限
   * 执行系统维护操作
   */
  SYSTEM_MAINTENANCE = "system.maintenance",

  // ========== 租户级权限 ==========

  /**
   * 租户管理权限
   * 管理租户的所有资源
   */
  TENANT_MANAGE = "tenant.manage",

  /**
   * 租户配置权限
   * 配置租户级别的设置
   */
  TENANT_CONFIGURE = "tenant.configure",

  /**
   * 租户创建权限
   * 创建新的租户
   */
  TENANT_CREATE = "tenant.create",

  /**
   * 租户查看权限
   * 查看租户信息
   */
  TENANT_READ = "tenant.read",

  /**
   * 租户更新权限
   * 更新租户信息
   */
  TENANT_UPDATE = "tenant.update",

  /**
   * 租户删除权限
   * 删除租户
   */
  TENANT_DELETE = "tenant.delete",

  // ========== 组织级权限 ==========

  /**
   * 组织管理权限
   * 管理组织内的所有资源
   */
  ORGANIZATION_MANAGE = "organization.manage",

  /**
   * 组织配置权限
   * 配置组织级别的设置
   */
  ORGANIZATION_CONFIGURE = "organization.configure",

  /**
   * 组织创建权限
   * 创建新的组织
   */
  ORGANIZATION_CREATE = "organization.create",

  /**
   * 组织查看权限
   * 查看组织信息
   */
  ORGANIZATION_READ = "organization.read",

  /**
   * 组织更新权限
   * 更新组织信息
   */
  ORGANIZATION_UPDATE = "organization.update",

  /**
   * 组织删除权限
   * 删除组织
   */
  ORGANIZATION_DELETE = "organization.delete",

  // ========== 部门级权限 ==========

  /**
   * 部门管理权限
   * 管理部门内的所有资源
   */
  DEPARTMENT_MANAGE = "department.manage",

  /**
   * 部门配置权限
   * 配置部门级别的设置
   */
  DEPARTMENT_CONFIGURE = "department.configure",

  /**
   * 部门创建权限
   * 创建新的部门
   */
  DEPARTMENT_CREATE = "department.create",

  /**
   * 部门查看权限
   * 查看部门信息
   */
  DEPARTMENT_READ = "department.read",

  /**
   * 部门更新权限
   * 更新部门信息
   */
  DEPARTMENT_UPDATE = "department.update",

  /**
   * 部门删除权限
   * 删除部门
   */
  DEPARTMENT_DELETE = "department.delete",

  // ========== 用户级权限 ==========

  /**
   * 用户管理权限
   * 管理用户的所有资源
   */
  USER_MANAGE = "user.manage",

  /**
   * 用户配置权限
   * 配置用户级别的设置
   */
  USER_CONFIGURE = "user.configure",

  /**
   * 用户创建权限
   * 创建新的用户
   */
  USER_CREATE = "user.create",

  /**
   * 用户查看权限
   * 查看用户信息
   */
  USER_READ = "user.read",

  /**
   * 用户更新权限
   * 更新用户信息
   */
  USER_UPDATE = "user.update",

  /**
   * 用户删除权限
   * 删除用户
   */
  USER_DELETE = "user.delete",

  /**
   * 用户激活权限
   * 激活/停用用户
   */
  USER_ACTIVATE = "user.activate",

  /**
   * 用户密码重置权限
   * 重置用户密码
   */
  USER_RESET_PASSWORD = "user.reset_password",

  // ========== 角色级权限 ==========

  /**
   * 角色管理权限
   * 管理角色的所有资源
   */
  ROLE_MANAGE = "role.manage",

  /**
   * 角色创建权限
   * 创建新的角色
   */
  ROLE_CREATE = "role.create",

  /**
   * 角色查看权限
   * 查看角色信息
   */
  ROLE_READ = "role.read",

  /**
   * 角色更新权限
   * 更新角色信息
   */
  ROLE_UPDATE = "role.update",

  /**
   * 角色删除权限
   * 删除角色
   */
  ROLE_DELETE = "role.delete",

  /**
   * 角色分配权限
   * 为用户分配角色
   */
  ROLE_ASSIGN = "role.assign",

  // ========== 权限级权限 ==========

  /**
   * 权限管理权限
   * 管理权限的所有资源
   */
  PERMISSION_MANAGE = "permission.manage",

  /**
   * 权限创建权限
   * 创建新的权限
   */
  PERMISSION_CREATE = "permission.create",

  /**
   * 权限查看权限
   * 查看权限信息
   */
  PERMISSION_READ = "permission.read",

  /**
   * 权限更新权限
   * 更新权限信息
   */
  PERMISSION_UPDATE = "permission.update",

  /**
   * 权限删除权限
   * 删除权限
   */
  PERMISSION_DELETE = "permission.delete",

  /**
   * 权限分配权限
   * 为角色分配权限
   */
  PERMISSION_ASSIGN = "permission.assign",

  // ========== 内容级权限 ==========

  /**
   * 内容管理权限
   * 管理所有内容资源
   */
  CONTENT_MANAGE = "content.manage",

  /**
   * 内容创建权限
   * 创建新的内容
   */
  CONTENT_CREATE = "content.create",

  /**
   * 内容查看权限
   * 查看内容信息
   */
  CONTENT_READ = "content.read",

  /**
   * 内容更新权限
   * 更新内容信息
   */
  CONTENT_UPDATE = "content.update",

  /**
   * 内容删除权限
   * 删除内容
   */
  CONTENT_DELETE = "content.delete",

  /**
   * 内容发布权限
   * 发布内容
   */
  CONTENT_PUBLISH = "content.publish",

  // ========== 审计级权限 ==========

  /**
   * 审计查看权限
   * 查看审计日志
   */
  AUDIT_READ = "audit.read",

  /**
   * 审计导出权限
   * 导出审计日志
   */
  AUDIT_EXPORT = "audit.export",

  // ========== 报表级权限 ==========

  /**
   * 报表查看权限
   * 查看报表信息
   */
  REPORT_READ = "report.read",

  /**
   * 报表创建权限
   * 创建新的报表
   */
  REPORT_CREATE = "report.create",

  /**
   * 报表导出权限
   * 导出报表数据
   */
  REPORT_EXPORT = "report.export",
}

/**
 * 权限定义工具类
 *
 * @description 提供权限定义的验证、分类和比较功能
 * @since 1.0.0
 */
export class PermissionDefinitionsUtils {
  /**
   * 获取所有权限定义
   *
   * @returns 所有权限定义的数组
   */
  static getAllPermissions(): PermissionDefinitions[] {
    return Object.values(PermissionDefinitions);
  }

  /**
   * 获取系统级权限
   *
   * @returns 系统级权限的数组
   */
  static getSystemPermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.SYSTEM_MANAGE,
      PermissionDefinitions.SYSTEM_CONFIGURE,
      PermissionDefinitions.SYSTEM_MONITOR,
      PermissionDefinitions.SYSTEM_MAINTENANCE,
    ];
  }

  /**
   * 获取租户级权限
   *
   * @returns 租户级权限的数组
   */
  static getTenantPermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.TENANT_MANAGE,
      PermissionDefinitions.TENANT_CONFIGURE,
      PermissionDefinitions.TENANT_CREATE,
      PermissionDefinitions.TENANT_READ,
      PermissionDefinitions.TENANT_UPDATE,
      PermissionDefinitions.TENANT_DELETE,
    ];
  }

  /**
   * 获取组织级权限
   *
   * @returns 组织级权限的数组
   */
  static getOrganizationPermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.ORGANIZATION_MANAGE,
      PermissionDefinitions.ORGANIZATION_CONFIGURE,
      PermissionDefinitions.ORGANIZATION_CREATE,
      PermissionDefinitions.ORGANIZATION_READ,
      PermissionDefinitions.ORGANIZATION_UPDATE,
      PermissionDefinitions.ORGANIZATION_DELETE,
    ];
  }

  /**
   * 获取部门级权限
   *
   * @returns 部门级权限的数组
   */
  static getDepartmentPermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.DEPARTMENT_MANAGE,
      PermissionDefinitions.DEPARTMENT_CONFIGURE,
      PermissionDefinitions.DEPARTMENT_CREATE,
      PermissionDefinitions.DEPARTMENT_READ,
      PermissionDefinitions.DEPARTMENT_UPDATE,
      PermissionDefinitions.DEPARTMENT_DELETE,
    ];
  }

  /**
   * 获取用户级权限
   *
   * @returns 用户级权限的数组
   */
  static getUserPermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.USER_MANAGE,
      PermissionDefinitions.USER_CONFIGURE,
      PermissionDefinitions.USER_CREATE,
      PermissionDefinitions.USER_READ,
      PermissionDefinitions.USER_UPDATE,
      PermissionDefinitions.USER_DELETE,
      PermissionDefinitions.USER_ACTIVATE,
      PermissionDefinitions.USER_RESET_PASSWORD,
    ];
  }

  /**
   * 获取角色级权限
   *
   * @returns 角色级权限的数组
   */
  static getRolePermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.ROLE_MANAGE,
      PermissionDefinitions.ROLE_CREATE,
      PermissionDefinitions.ROLE_READ,
      PermissionDefinitions.ROLE_UPDATE,
      PermissionDefinitions.ROLE_DELETE,
      PermissionDefinitions.ROLE_ASSIGN,
    ];
  }

  /**
   * 获取权限级权限
   *
   * @returns 权限级权限的数组
   */
  static getPermissionPermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.PERMISSION_MANAGE,
      PermissionDefinitions.PERMISSION_CREATE,
      PermissionDefinitions.PERMISSION_READ,
      PermissionDefinitions.PERMISSION_UPDATE,
      PermissionDefinitions.PERMISSION_DELETE,
      PermissionDefinitions.PERMISSION_ASSIGN,
    ];
  }

  /**
   * 获取内容级权限
   *
   * @returns 内容级权限的数组
   */
  static getContentPermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.CONTENT_MANAGE,
      PermissionDefinitions.CONTENT_CREATE,
      PermissionDefinitions.CONTENT_READ,
      PermissionDefinitions.CONTENT_UPDATE,
      PermissionDefinitions.CONTENT_DELETE,
      PermissionDefinitions.CONTENT_PUBLISH,
    ];
  }

  /**
   * 获取审计级权限
   *
   * @returns 审计级权限的数组
   */
  static getAuditPermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.AUDIT_READ,
      PermissionDefinitions.AUDIT_EXPORT,
    ];
  }

  /**
   * 获取报表级权限
   *
   * @returns 报表级权限的数组
   */
  static getReportPermissions(): PermissionDefinitions[] {
    return [
      PermissionDefinitions.REPORT_READ,
      PermissionDefinitions.REPORT_CREATE,
      PermissionDefinitions.REPORT_EXPORT,
    ];
  }

  /**
   * 获取管理级权限
   *
   * @returns 管理级权限的数组
   */
  static getManagePermissions(): PermissionDefinitions[] {
    return this.getAllPermissions().filter((permission) =>
      permission.includes(".manage"),
    );
  }

  /**
   * 获取配置级权限
   *
   * @returns 配置级权限的数组
   */
  static getConfigurePermissions(): PermissionDefinitions[] {
    return this.getAllPermissions().filter((permission) =>
      permission.includes(".configure"),
    );
  }

  /**
   * 获取创建级权限
   *
   * @returns 创建级权限的数组
   */
  static getCreatePermissions(): PermissionDefinitions[] {
    return this.getAllPermissions().filter((permission) =>
      permission.includes(".create"),
    );
  }

  /**
   * 获取读取级权限
   *
   * @returns 读取级权限的数组
   */
  static getReadPermissions(): PermissionDefinitions[] {
    return this.getAllPermissions().filter((permission) =>
      permission.includes(".read"),
    );
  }

  /**
   * 获取更新级权限
   *
   * @returns 更新级权限的数组
   */
  static getUpdatePermissions(): PermissionDefinitions[] {
    return this.getAllPermissions().filter((permission) =>
      permission.includes(".update"),
    );
  }

  /**
   * 获取删除级权限
   *
   * @returns 删除级权限的数组
   */
  static getDeletePermissions(): PermissionDefinitions[] {
    return this.getAllPermissions().filter((permission) =>
      permission.includes(".delete"),
    );
  }

  /**
   * 获取权限的资源类型
   *
   * @param permission 权限定义
   * @returns 资源类型
   */
  static getResourceType(permission: PermissionDefinitions): string {
    const parts = permission.split(".");
    return parts[0] || "unknown";
  }

  /**
   * 获取权限的操作类型
   *
   * @param permission 权限定义
   * @returns 操作类型
   */
  static getOperationType(permission: PermissionDefinitions): string {
    const parts = permission.split(".");
    return parts.slice(1).join(".") || "unknown";
  }

  /**
   * 检查权限是否为管理权限
   *
   * @param permission 权限定义
   * @returns 是否为管理权限
   */
  static isManagePermission(permission: PermissionDefinitions): boolean {
    return permission.includes(".manage");
  }

  /**
   * 检查权限是否为配置权限
   *
   * @param permission 权限定义
   * @returns 是否为配置权限
   */
  static isConfigurePermission(permission: PermissionDefinitions): boolean {
    return permission.includes(".configure");
  }

  /**
   * 检查权限是否为创建权限
   *
   * @param permission 权限定义
   * @returns 是否为创建权限
   */
  static isCreatePermission(permission: PermissionDefinitions): boolean {
    return permission.includes(".create");
  }

  /**
   * 检查权限是否为读取权限
   *
   * @param permission 权限定义
   * @returns 是否为读取权限
   */
  static isReadPermission(permission: PermissionDefinitions): boolean {
    return permission.includes(".read");
  }

  /**
   * 检查权限是否为更新权限
   *
   * @param permission 权限定义
   * @returns 是否为更新权限
   */
  static isUpdatePermission(permission: PermissionDefinitions): boolean {
    return permission.includes(".update");
  }

  /**
   * 检查权限是否为删除权限
   *
   * @param permission 权限定义
   * @returns 是否为删除权限
   */
  static isDeletePermission(permission: PermissionDefinitions): boolean {
    return permission.includes(".delete");
  }

  /**
   * 验证权限定义
   *
   * @param permission 待验证的权限
   * @returns 是否为有效的权限定义
   */
  static isValid(permission: string): permission is PermissionDefinitions {
    return Object.values(PermissionDefinitions).includes(
      permission as PermissionDefinitions,
    );
  }

  /**
   * 获取权限显示名称
   *
   * @param permission 权限定义
   * @returns 显示名称
   */
  static getDisplayName(permission: PermissionDefinitions): string {
    const resourceType = this.getResourceType(permission);
    const operationType = this.getOperationType(permission);

    const resourceNames: Record<string, string> = {
      system: "系统",
      tenant: "租户",
      organization: "组织",
      department: "部门",
      user: "用户",
      role: "角色",
      permission: "权限",
      content: "内容",
      audit: "审计",
      report: "报表",
    };

    const operationNames: Record<string, string> = {
      manage: "管理",
      configure: "配置",
      create: "创建",
      read: "查看",
      update: "更新",
      delete: "删除",
      activate: "激活",
      reset_password: "重置密码",
      assign: "分配",
      publish: "发布",
      monitor: "监控",
      maintenance: "维护",
      export: "导出",
    };

    const resourceName = resourceNames[resourceType] || resourceType;
    const operationName = operationNames[operationType] || operationType;

    return `${resourceName}${operationName}`;
  }

  /**
   * 获取权限描述
   *
   * @param permission 权限定义
   * @returns 权限描述
   */
  static getDescription(permission: PermissionDefinitions): string {
    const descriptions: Record<PermissionDefinitions, string> = {
      [PermissionDefinitions.SYSTEM_MANAGE]: "管理整个平台的配置和用户",
      [PermissionDefinitions.SYSTEM_CONFIGURE]: "配置系统级别的设置",
      [PermissionDefinitions.SYSTEM_MONITOR]: "查看系统监控和统计信息",
      [PermissionDefinitions.SYSTEM_MAINTENANCE]: "执行系统维护操作",

      [PermissionDefinitions.TENANT_MANAGE]: "管理租户的所有资源",
      [PermissionDefinitions.TENANT_CONFIGURE]: "配置租户级别的设置",
      [PermissionDefinitions.TENANT_CREATE]: "创建新的租户",
      [PermissionDefinitions.TENANT_READ]: "查看租户信息",
      [PermissionDefinitions.TENANT_UPDATE]: "更新租户信息",
      [PermissionDefinitions.TENANT_DELETE]: "删除租户",

      [PermissionDefinitions.ORGANIZATION_MANAGE]: "管理组织内的所有资源",
      [PermissionDefinitions.ORGANIZATION_CONFIGURE]: "配置组织级别的设置",
      [PermissionDefinitions.ORGANIZATION_CREATE]: "创建新的组织",
      [PermissionDefinitions.ORGANIZATION_READ]: "查看组织信息",
      [PermissionDefinitions.ORGANIZATION_UPDATE]: "更新组织信息",
      [PermissionDefinitions.ORGANIZATION_DELETE]: "删除组织",

      [PermissionDefinitions.DEPARTMENT_MANAGE]: "管理部门内的所有资源",
      [PermissionDefinitions.DEPARTMENT_CONFIGURE]: "配置部门级别的设置",
      [PermissionDefinitions.DEPARTMENT_CREATE]: "创建新的部门",
      [PermissionDefinitions.DEPARTMENT_READ]: "查看部门信息",
      [PermissionDefinitions.DEPARTMENT_UPDATE]: "更新部门信息",
      [PermissionDefinitions.DEPARTMENT_DELETE]: "删除部门",

      [PermissionDefinitions.USER_MANAGE]: "管理用户的所有资源",
      [PermissionDefinitions.USER_CONFIGURE]: "配置用户级别的设置",
      [PermissionDefinitions.USER_CREATE]: "创建新的用户",
      [PermissionDefinitions.USER_READ]: "查看用户信息",
      [PermissionDefinitions.USER_UPDATE]: "更新用户信息",
      [PermissionDefinitions.USER_DELETE]: "删除用户",
      [PermissionDefinitions.USER_ACTIVATE]: "激活/停用用户",
      [PermissionDefinitions.USER_RESET_PASSWORD]: "重置用户密码",

      [PermissionDefinitions.ROLE_MANAGE]: "管理角色的所有资源",
      [PermissionDefinitions.ROLE_CREATE]: "创建新的角色",
      [PermissionDefinitions.ROLE_READ]: "查看角色信息",
      [PermissionDefinitions.ROLE_UPDATE]: "更新角色信息",
      [PermissionDefinitions.ROLE_DELETE]: "删除角色",
      [PermissionDefinitions.ROLE_ASSIGN]: "为用户分配角色",

      [PermissionDefinitions.PERMISSION_MANAGE]: "管理权限的所有资源",
      [PermissionDefinitions.PERMISSION_CREATE]: "创建新的权限",
      [PermissionDefinitions.PERMISSION_READ]: "查看权限信息",
      [PermissionDefinitions.PERMISSION_UPDATE]: "更新权限信息",
      [PermissionDefinitions.PERMISSION_DELETE]: "删除权限",
      [PermissionDefinitions.PERMISSION_ASSIGN]: "为角色分配权限",

      [PermissionDefinitions.CONTENT_MANAGE]: "管理所有内容资源",
      [PermissionDefinitions.CONTENT_CREATE]: "创建新的内容",
      [PermissionDefinitions.CONTENT_READ]: "查看内容信息",
      [PermissionDefinitions.CONTENT_UPDATE]: "更新内容信息",
      [PermissionDefinitions.CONTENT_DELETE]: "删除内容",
      [PermissionDefinitions.CONTENT_PUBLISH]: "发布内容",

      [PermissionDefinitions.AUDIT_READ]: "查看审计日志",
      [PermissionDefinitions.AUDIT_EXPORT]: "导出审计日志",

      [PermissionDefinitions.REPORT_READ]: "查看报表信息",
      [PermissionDefinitions.REPORT_CREATE]: "创建新的报表",
      [PermissionDefinitions.REPORT_EXPORT]: "导出报表数据",
    };

    return descriptions[permission] || "未知权限描述";
  }
}
