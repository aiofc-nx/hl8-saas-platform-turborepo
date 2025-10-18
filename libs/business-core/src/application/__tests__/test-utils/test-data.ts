/**
 * 测试数据工厂
 *
 * @description 为应用层测试提供测试数据
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { UserRole } from "../../../domain/value-objects/types/user-role.vo.js";
import { UserStatus } from "../../../domain/value-objects/types/user-status.vo.js";
import { OrganizationType } from "../../../domain/value-objects/types/organization-type.vo.js";
import { DepartmentLevel } from "../../../domain/value-objects/types/department-level.vo.js";
import { RoleType } from "../../../domain/value-objects/types/role-type.vo.js";
import { PermissionType } from "../../../domain/value-objects/types/permission-type.vo.js";
import { PermissionAction } from "../../../domain/value-objects/types/permission-action.vo.js";
import type { CreateUserRequest } from "../../use-cases/user/create-user.use-case.js";
import type { CreateOrganizationRequest } from "../../use-cases/organization/create-organization.use-case.js";
import type { CreateDepartmentRequest } from "../../use-cases/department/create-department.use-case.js";
import type { CreateRoleRequest } from "../../use-cases/role/create-role.use-case.js";
import type { IUseCaseContext } from "../../use-cases/base/use-case.interface.js";

/**
 * 测试数据工厂
 *
 * @description 提供各种测试数据的工厂方法
 */
export class TestDataFactory {
  /**
   * 创建测试租户ID
   *
   * @returns 租户ID
   */
  static createTenantId(): TenantId {
    return new TenantId("550e8400-e29b-41d4-a716-446655440000");
  }

  /**
   * 创建测试实体ID
   *
   * @returns 实体ID
   */
  static createEntityId(): EntityId {
    return new EntityId("550e8400-e29b-41d4-a716-446655440001");
  }

  /**
   * 创建有效的创建用户请求
   *
   * @param overrides - 覆盖默认值的属性
   * @returns 创建用户请求
   */
  static createValidCreateUserRequest(
    overrides: Partial<CreateUserRequest> = {},
  ): CreateUserRequest {
    return {
      username: "testuser",
      email: "test@example.com",
      phone: "13800138000",
      displayName: "测试用户",
      role: UserRole.USER,
      description: "测试用户描述",
      createdBy: "admin",
      ...overrides,
    };
  }

  /**
   * 创建无效的创建用户请求
   *
   * @param type - 无效类型
   * @returns 无效的创建用户请求
   */
  static createInvalidCreateUserRequest(
    type:
      | "empty-username"
      | "empty-email"
      | "empty-display-name"
      | "empty-role"
      | "empty-created-by",
  ): CreateUserRequest {
    const baseRequest = this.createValidCreateUserRequest();

    switch (type) {
      case "empty-username":
        return { ...baseRequest, username: "" };
      case "empty-email":
        return { ...baseRequest, email: "" };
      case "empty-display-name":
        return { ...baseRequest, displayName: "" };
      case "empty-role":
        return { ...baseRequest, role: null as any };
      case "empty-created-by":
        return { ...baseRequest, createdBy: "" };
      default:
        return baseRequest;
    }
  }

  /**
   * 创建测试用例上下文
   *
   * @param overrides - 覆盖默认值的属性
   * @returns 用例上下文
   */
  static createUseCaseContext(
    overrides: Partial<IUseCaseContext> = {},
  ): IUseCaseContext {
    return {
      tenant: {
        id: this.createTenantId(),
        name: "测试租户",
        type: "ENTERPRISE",
      },
      user: {
        id: this.createEntityId(),
        username: "admin",
        email: "admin@example.com",
        role: UserRole.ADMIN,
        roles: ["TENANT_ADMIN", "DEPARTMENT_ADMIN"],
        permissions: [
          "user:create",
          "user:read",
          "user:update",
          "user:delete",
          "department:update",
          "organization:update",
        ],
      },
      request: {
        id: this.createEntityId(),
      },
      ...overrides,
    };
  }

  /**
   * 创建管理员用例上下文
   *
   * @returns 管理员用例上下文
   */
  static createAdminUseCaseContext(): IUseCaseContext {
    return this.createUseCaseContext({
      user: {
        id: this.createEntityId(),
        username: "admin",
        email: "admin@example.com",
        role: UserRole.ADMIN,
      },
      permissions: [
        "user:create",
        "user:read",
        "user:update",
        "user:delete",
        "user:admin",
      ],
    });
  }

  /**
   * 创建普通用户用例上下文
   *
   * @returns 普通用户用例上下文
   */
  static createUserUseCaseContext(): IUseCaseContext {
    return this.createUseCaseContext({
      user: {
        id: this.createEntityId(),
        username: "user",
        email: "user@example.com",
        role: UserRole.USER,
      },
      permissions: ["user:read"],
    });
  }

  /**
   * 创建长用户名（超过50字符）
   *
   * @returns 长用户名
   */
  static createLongUsername(): string {
    return "a".repeat(51);
  }

  /**
   * 创建长显示名称（超过100字符）
   *
   * @returns 长显示名称
   */
  static createLongDisplayName(): string {
    return "测试用户".repeat(26); // 104个字符
  }

  /**
   * 创建无效邮箱格式
   *
   * @returns 无效邮箱
   */
  static createInvalidEmail(): string {
    return "invalid-email";
  }

  /**
   * 创建有效邮箱格式
   *
   * @returns 有效邮箱
   */
  static createValidEmail(): string {
    return "valid@example.com";
  }

  /**
   * 创建重复用户名请求
   *
   * @param existingUsername - 已存在的用户名
   * @returns 重复用户名请求
   */
  static createDuplicateUsernameRequest(
    existingUsername: string,
  ): CreateUserRequest {
    return this.createValidCreateUserRequest({
      username: existingUsername,
    });
  }

  /**
   * 创建重复邮箱请求
   *
   * @param existingEmail - 已存在的邮箱
   * @returns 重复邮箱请求
   */
  static createDuplicateEmailRequest(existingEmail: string): CreateUserRequest {
    return this.createValidCreateUserRequest({
      email: existingEmail,
    });
  }

  // ==================== 组织相关测试数据 ====================

  /**
   * 创建有效的创建组织请求
   *
   * @param overrides - 覆盖默认值的属性
   * @returns 创建组织请求
   */
  static createValidCreateOrganizationRequest(
    overrides: Partial<CreateOrganizationRequest> = {},
  ): CreateOrganizationRequest {
    return {
      name: "测试组织",
      type: OrganizationType.DEPARTMENT,
      description: "测试组织描述",
      parentId: undefined,
      sortOrder: 0,
      createdBy: "admin",
      ...overrides,
    };
  }

  /**
   * 创建无效的创建组织请求
   *
   * @param type - 无效类型
   * @returns 无效的创建组织请求
   */
  static createInvalidCreateOrganizationRequest(
    type: "empty-name" | "empty-type" | "empty-created-by",
  ): CreateOrganizationRequest {
    const baseRequest = this.createValidCreateOrganizationRequest();

    switch (type) {
      case "empty-name":
        return { ...baseRequest, name: "" };
      case "empty-type":
        return { ...baseRequest, type: null as any };
      case "empty-created-by":
        return { ...baseRequest, createdBy: "" };
      default:
        return baseRequest;
    }
  }

  /**
   * 创建长组织名称（超过100字符）
   *
   * @returns 长组织名称
   */
  static createLongOrganizationName(): string {
    return "测试组织".repeat(26); // 104个字符
  }

  /**
   * 创建重复组织名称请求
   *
   * @param existingName - 已存在的组织名称
   * @returns 重复组织名称请求
   */
  static createDuplicateOrganizationNameRequest(
    existingName: string,
  ): CreateOrganizationRequest {
    return this.createValidCreateOrganizationRequest({
      name: existingName,
    });
  }

  // ==================== 部门相关测试数据 ====================

  /**
   * 创建有效的创建部门请求
   *
   * @param overrides - 覆盖默认值的属性
   * @returns 创建部门请求
   */
  static createValidCreateDepartmentRequest(
    overrides: Partial<CreateDepartmentRequest> = {},
  ): CreateDepartmentRequest {
    return {
      name: "测试部门",
      level: DepartmentLevel.LEVEL_1,
      description: "测试部门描述",
      parentId: undefined,
      sortOrder: 0,
      managerId: undefined,
      code: "DEPT001",
      createdBy: "admin",
      ...overrides,
    };
  }

  /**
   * 创建无效的创建部门请求
   *
   * @param type - 无效类型
   * @returns 无效的创建部门请求
   */
  static createInvalidCreateDepartmentRequest(
    type: "empty-name" | "empty-level" | "empty-created-by",
  ): CreateDepartmentRequest {
    const baseRequest = this.createValidCreateDepartmentRequest();

    switch (type) {
      case "empty-name":
        return { ...baseRequest, name: "" };
      case "empty-level":
        return { ...baseRequest, level: null as any };
      case "empty-created-by":
        return { ...baseRequest, createdBy: "" };
      default:
        return baseRequest;
    }
  }

  /**
   * 创建长部门名称（超过100字符）
   *
   * @returns 长部门名称
   */
  static createLongDepartmentName(): string {
    return "测试部门".repeat(26); // 104个字符
  }

  /**
   * 创建重复部门名称请求
   *
   * @param existingName - 已存在的部门名称
   * @returns 重复部门名称请求
   */
  static createDuplicateDepartmentNameRequest(
    existingName: string,
  ): CreateDepartmentRequest {
    return this.createValidCreateDepartmentRequest({
      name: existingName,
    });
  }

  // ==================== 角色测试数据 ====================

  /**
   * 创建有效的创建角色请求
   *
   * @param overrides - 覆盖默认值的属性
   * @returns 创建角色请求
   */
  static createValidCreateRoleRequest(
    overrides: Partial<CreateRoleRequest> = {},
  ): CreateRoleRequest {
    return {
      tenantId: this.createTenantId(),
      name: "测试角色",
      description: "测试角色描述",
      type: RoleType.ADMIN,
      permissionType: PermissionType.RESOURCE,
      actions: [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
      ],
      isActive: true,
      isSystemRole: false,
      isEditable: true,
      priority: 0,
      ...overrides,
    };
  }

  /**
   * 创建无效的创建角色请求
   *
   * @param overrides - 覆盖默认值的属性
   * @returns 无效的创建角色请求
   */
  static createInvalidCreateRoleRequest(
    overrides: Partial<CreateRoleRequest> = {},
  ): CreateRoleRequest {
    return {
      tenantId: this.createTenantId(),
      name: "测试角色",
      description: "测试角色描述",
      type: RoleType.ADMIN,
      permissionType: PermissionType.RESOURCE,
      actions: [PermissionAction.CREATE, PermissionAction.READ],
      isActive: true,
      isSystemRole: false,
      isEditable: true,
      priority: 0,
      ...overrides,
    };
  }

  /**
   * 创建长角色名称
   *
   * @returns 长角色名称
   */
  static createLongRoleName(): string {
    return "测试角色".repeat(26); // 104个字符
  }

  /**
   * 创建重复角色名称请求
   *
   * @param existingName - 已存在的角色名称
   * @returns 重复角色名称请求
   */
  static createDuplicateRoleNameRequest(
    existingName: string,
  ): CreateRoleRequest {
    return this.createValidCreateRoleRequest({
      name: existingName,
    });
  }
}
