/**
 * 模拟仓储实现
 *
 * @description 为应用层测试提供模拟的仓储实现
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type {
  IUserRepository,
  UserQueryOptions,
} from "../../../domain/repositories/user.repository.js";
import type {
  IOrganizationRepository,
  OrganizationQueryOptions,
} from "../../../domain/repositories/organization.repository.js";
import type {
  IDepartmentRepository,
  DepartmentQueryOptions,
} from "../../../domain/repositories/department.repository.js";
import type { IRoleRepository } from "../../../domain/repositories/role.repository.js";
import type { IPaginatedResult } from "../../../domain/repositories/base/base-repository.interface.js";
import type { UserRoleAggregate } from "../../../domain/aggregates/user-role-aggregate.js";
import type { OrganizationAggregate } from "../../../domain/aggregates/organization-aggregate.js";
import type { DepartmentAggregate } from "../../../domain/aggregates/department-aggregate.js";

/**
 * 模拟用户仓储
 *
 * @description 为测试提供用户仓储的模拟实现
 */
export class MockUserRepository implements IUserRepository {
  private users: Map<string, UserRoleAggregate> = new Map();
  private usernameIndex: Map<string, UserRoleAggregate> = new Map();
  private emailIndex: Map<string, UserRoleAggregate> = new Map();

  /**
   * 保存用户聚合根
   *
   * @param userAggregate - 用户聚合根
   * @returns Promise<void>
   */
  async save(userAggregate: UserRoleAggregate): Promise<void> {
    const key = userAggregate.id.toString();
    this.users.set(key, userAggregate);

    // 更新索引
    const user = (userAggregate as any).getUser();
    this.usernameIndex.set(
      `${userAggregate.tenantId.toString()}:${user.username}`,
      userAggregate,
    );
    this.emailIndex.set(
      `${userAggregate.tenantId.toString()}:${user.email}`,
      userAggregate,
    );
  }

  /**
   * 根据ID查找用户聚合根
   *
   * @param id - 用户ID
   * @returns Promise<UserRoleAggregate | null>
   */
  async findById(id: EntityId): Promise<UserRoleAggregate | null> {
    const key = id.toString();
    return this.users.get(key) || null;
  }

  /**
   * 根据用户名查找用户聚合根
   *
   * @param tenantId - 租户ID
   * @param username - 用户名
   * @returns Promise<UserRoleAggregate | null>
   */
  async findByUsername(
    tenantId: TenantId,
    username: string,
  ): Promise<UserRoleAggregate | null> {
    const key = `${tenantId.toString()}:${username}`;
    return this.usernameIndex.get(key) || null;
  }

  /**
   * 根据邮箱查找用户聚合根
   *
   * @param tenantId - 租户ID
   * @param email - 邮箱地址
   * @returns Promise<UserRoleAggregate | null>
   */
  async findByEmail(
    tenantId: TenantId,
    email: string,
  ): Promise<UserRoleAggregate | null> {
    const key = `${tenantId.toString()}:${email}`;
    return this.emailIndex.get(key) || null;
  }

  /**
   * 根据租户ID查找用户列表
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  async findByTenantId(
    tenantId: TenantId,
    options?: UserQueryOptions,
  ): Promise<IPaginatedResult<UserRoleAggregate>> {
    const allUsers = Array.from(this.users.values()).filter((user) =>
      user.tenantId.equals(tenantId),
    );

    const limit = options?.limit || 100;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;
    const users = allUsers.slice(offset, offset + limit);
    const totalPages = Math.ceil(allUsers.length / limit);

    return {
      items: users,
      total: allUsers.length,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * 删除用户聚合根
   *
   * @param id - 用户ID
   * @returns Promise<void>
   */
  async delete(id: EntityId): Promise<void> {
    const userAggregate = this.users.get(id.toString());
    if (userAggregate) {
      const user = (userAggregate as any).getUser();
      this.usernameIndex.delete(
        `${userAggregate.tenantId.toString()}:${user.username}`,
      );
      this.emailIndex.delete(
        `${userAggregate.tenantId.toString()}:${user.email}`,
      );
      this.users.delete(id.toString());
    }
  }

  /**
   * 检查用户是否存在
   *
   * @param id - 用户ID
   * @returns Promise<boolean>
   */
  async exists(id: EntityId): Promise<boolean> {
    return this.users.has(id.toString());
  }

  /**
   * 清空所有数据（用于测试清理）
   */
  clear(): void {
    this.users.clear();
    this.usernameIndex.clear();
    this.emailIndex.clear();
  }

  /**
   * 获取所有用户（用于测试验证）
   */
  getAllUsers(): UserRoleAggregate[] {
    return Array.from(this.users.values());
  }

  /**
   * 根据组织ID查找用户列表
   *
   * @param _organizationId - 组织ID
   * @param _options - 查询选项
   * @returns Promise<分页结果>
   */
  async findByOrganizationId(
    _organizationId: EntityId,
    _options?: UserQueryOptions,
  ): Promise<IPaginatedResult<UserRoleAggregate>> {
    // 简化实现，返回空结果
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }

  /**
   * 根据部门ID查找用户列表
   *
   * @param _departmentId - 部门ID
   * @param _options - 查询选项
   * @returns Promise<分页结果>
   */
  async findByDepartmentId(
    _departmentId: EntityId,
    _options?: UserQueryOptions,
  ): Promise<IPaginatedResult<UserRoleAggregate>> {
    // 简化实现，返回空结果
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }

  /**
   * 检查用户名是否存在
   *
   * @param tenantId - 租户ID
   * @param username - 用户名
   * @returns Promise<boolean>
   */
  async existsByUsername(
    tenantId: TenantId,
    username: string,
  ): Promise<boolean> {
    const key = `${tenantId.toString()}:${username}`;
    return this.usernameIndex.has(key);
  }

  /**
   * 检查邮箱是否存在
   *
   * @param tenantId - 租户ID
   * @param email - 邮箱地址
   * @returns Promise<boolean>
   */
  async existsByEmail(tenantId: TenantId, email: string): Promise<boolean> {
    const key = `${tenantId.toString()}:${email}`;
    return this.emailIndex.has(key);
  }

  /**
   * 统计用户数量
   *
   * @param tenantId - 租户ID
   * @param _options - 查询选项
   * @returns Promise<number>
   */
  async countByTenantId(
    tenantId: TenantId,
    _options?: UserQueryOptions,
  ): Promise<number> {
    const allUsers = Array.from(this.users.values()).filter((user) =>
      user.tenantId.equals(tenantId),
    );
    return allUsers.length;
  }

  /**
   * 软删除用户
   *
   * @param id - 用户ID
   * @returns Promise<void>
   */
  async softDelete(id: EntityId): Promise<void> {
    // 简化实现，直接删除
    await this.delete(id);
  }

  /**
   * 删除所有用户
   *
   * @param tenantId - 租户ID
   * @returns Promise<void>
   */
  async deleteAll(tenantId: TenantId): Promise<void> {
    const users = Array.from(this.users.values()).filter((user) =>
      user.tenantId.equals(tenantId),
    );
    for (const user of users) {
      await this.delete(user.id);
    }
  }
}

/**
 * 模拟组织仓储
 *
 * @description 为测试提供组织仓储的模拟实现
 */
export class MockOrganizationRepository implements IOrganizationRepository {
  private organizations: Map<string, OrganizationAggregate> = new Map();
  private nameIndex: Map<string, OrganizationAggregate> = new Map();

  /**
   * 保存组织聚合根
   *
   * @param organizationAggregate - 组织聚合根
   * @returns Promise<void>
   */
  async save(organizationAggregate: OrganizationAggregate): Promise<void> {
    const key = organizationAggregate.id.toString();
    this.organizations.set(key, organizationAggregate);

    // 更新索引
    const organization = organizationAggregate.getOrganization();
    this.nameIndex.set(
      `${organizationAggregate.tenantId.toString()}:${organization.name}`,
      organizationAggregate,
    );
  }

  /**
   * 根据ID查找组织聚合根
   *
   * @param id - 组织ID
   * @returns Promise<OrganizationAggregate | null>
   */
  async findById(id: EntityId): Promise<OrganizationAggregate | null> {
    const key = id.toString();
    return this.organizations.get(key) || null;
  }

  /**
   * 根据名称查找组织聚合根
   *
   * @param tenantId - 租户ID
   * @param name - 组织名称
   * @param _parentId - 父组织ID（未使用）
   * @returns Promise<OrganizationAggregate | null>
   */
  async findByName(
    tenantId: TenantId,
    name: string,
    _parentId?: EntityId,
  ): Promise<OrganizationAggregate | null> {
    const key = `${tenantId.toString()}:${name}`;
    return this.nameIndex.get(key) || null;
  }

  /**
   * 根据租户ID查找组织列表
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  async findByTenantId(
    tenantId: TenantId,
    options?: OrganizationQueryOptions,
  ): Promise<IPaginatedResult<OrganizationAggregate>> {
    const allOrganizations = Array.from(this.organizations.values()).filter(
      (org) => org.tenantId.equals(tenantId),
    );

    const limit = options?.limit || 100;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;
    const organizations = allOrganizations.slice(offset, offset + limit);
    const totalPages = Math.ceil(allOrganizations.length / limit);

    return {
      items: organizations,
      total: allOrganizations.length,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * 删除组织聚合根
   *
   * @param id - 组织ID
   * @returns Promise<void>
   */
  async delete(id: EntityId): Promise<void> {
    const organizationAggregate = this.organizations.get(id.toString());
    if (organizationAggregate) {
      const organization = organizationAggregate.getOrganization();
      this.nameIndex.delete(
        `${organizationAggregate.tenantId.toString()}:${organization.name}`,
      );
      this.organizations.delete(id.toString());
    }
  }

  /**
   * 检查组织是否存在
   *
   * @param id - 组织ID
   * @returns Promise<boolean>
   */
  async exists(id: EntityId): Promise<boolean> {
    return this.organizations.has(id.toString());
  }

  /**
   * 清空所有数据（用于测试清理）
   */
  clear(): void {
    this.organizations.clear();
    this.nameIndex.clear();
  }

  /**
   * 获取所有组织（用于测试验证）
   */
  getAllOrganizations(): OrganizationAggregate[] {
    return Array.from(this.organizations.values());
  }

  /**
   * 根据父组织ID查找组织列表
   *
   * @param _parentId - 父组织ID
   * @param _options - 查询选项
   * @returns Promise<分页结果>
   */
  async findByParentId(
    _parentId: EntityId,
    _options?: OrganizationQueryOptions,
  ): Promise<IPaginatedResult<OrganizationAggregate>> {
    // 简化实现，返回空结果
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }

  /**
   * 检查组织名称是否存在
   *
   * @param tenantId - 租户ID
   * @param name - 组织名称
   * @param _parentId - 父组织ID（可选）
   * @returns Promise<boolean>
   */
  async existsByName(
    tenantId: TenantId,
    name: string,
    _parentId?: EntityId,
  ): Promise<boolean> {
    const key = `${tenantId.toString()}:${name}`;
    return this.nameIndex.has(key);
  }

  /**
   * 统计组织数量
   *
   * @param tenantId - 租户ID
   * @param _options - 查询选项
   * @returns Promise<number>
   */
  async countByTenantId(
    tenantId: TenantId,
    _options?: OrganizationQueryOptions,
  ): Promise<number> {
    const allOrganizations = Array.from(this.organizations.values()).filter(
      (org) => org.tenantId.equals(tenantId),
    );
    return allOrganizations.length;
  }

  /**
   * 软删除组织
   *
   * @param id - 组织ID
   * @param _deletedBy - 删除者
   * @param _deleteReason - 删除原因（可选）
   * @returns Promise<void>
   */
  async softDelete(
    id: EntityId,
    _deletedBy: string,
    _deleteReason?: string,
  ): Promise<void> {
    // 简化实现，直接删除
    await this.delete(id);
  }

  /**
   * 删除所有组织
   *
   * @param tenantId - 租户ID
   * @returns Promise<void>
   */
  async deleteAll(tenantId: TenantId): Promise<void> {
    const organizations = Array.from(this.organizations.values()).filter(
      (org) => org.tenantId.equals(tenantId),
    );
    for (const org of organizations) {
      await this.delete(org.id);
    }
  }
}

/**
 * 模拟部门仓储
 *
 * @description 为测试提供部门仓储的模拟实现
 */
export class MockDepartmentRepository implements IDepartmentRepository {
  private departments: Map<string, DepartmentAggregate> = new Map();
  private nameIndex: Map<string, DepartmentAggregate> = new Map();

  /**
   * 保存部门聚合根
   *
   * @param departmentAggregate - 部门聚合根
   * @returns Promise<void>
   */
  async save(departmentAggregate: DepartmentAggregate): Promise<void> {
    const key = departmentAggregate.id.toString();
    this.departments.set(key, departmentAggregate);

    // 更新索引
    const department = departmentAggregate.getDepartment();
    this.nameIndex.set(
      `${departmentAggregate.tenantId.toString()}:${department.name}`,
      departmentAggregate,
    );
  }

  /**
   * 根据ID查找部门聚合根
   *
   * @param id - 部门ID
   * @returns Promise<DepartmentAggregate | null>
   */
  async findById(id: EntityId): Promise<DepartmentAggregate | null> {
    const key = id.toString();
    return this.departments.get(key) || null;
  }

  /**
   * 根据名称查找部门聚合根
   *
   * @param tenantId - 租户ID
   * @param name - 部门名称
   * @param parentId - 父部门ID（可选）
   * @returns Promise<DepartmentAggregate | null>
   */
  async findByName(
    tenantId: TenantId,
    name: string,
    _parentId?: EntityId,
  ): Promise<DepartmentAggregate | null> {
    const key = `${tenantId.toString()}:${name}`;
    return this.nameIndex.get(key) || null;
  }

  /**
   * 根据租户ID查找部门列表
   *
   * @param tenantId - 租户ID
   * @param options - 查询选项
   * @returns Promise<分页结果>
   */
  async findByTenantId(
    tenantId: TenantId,
    options?: DepartmentQueryOptions,
  ): Promise<IPaginatedResult<DepartmentAggregate>> {
    const allDepartments = Array.from(this.departments.values()).filter(
      (dept) => dept.tenantId.equals(tenantId),
    );

    const limit = options?.limit || 100;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;
    const departments = allDepartments.slice(offset, offset + limit);
    const totalPages = Math.ceil(allDepartments.length / limit);

    return {
      items: departments,
      total: allDepartments.length,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * 删除部门聚合根
   *
   * @param id - 部门ID
   * @returns Promise<void>
   */
  async delete(id: EntityId): Promise<void> {
    const departmentAggregate = this.departments.get(id.toString());
    if (departmentAggregate) {
      const department = departmentAggregate.getDepartment();
      this.nameIndex.delete(
        `${departmentAggregate.tenantId.toString()}:${department.name}`,
      );
      this.departments.delete(id.toString());
    }
  }

  /**
   * 检查部门是否存在
   *
   * @param id - 部门ID
   * @returns Promise<boolean>
   */
  async exists(id: EntityId): Promise<boolean> {
    return this.departments.has(id.toString());
  }

  /**
   * 清空所有数据（用于测试清理）
   */
  clear(): void {
    this.departments.clear();
    this.nameIndex.clear();
  }

  /**
   * 获取所有部门（用于测试验证）
   */
  getAllDepartments(): DepartmentAggregate[] {
    return Array.from(this.departments.values());
  }

  /**
   * 根据父部门ID查找部门列表
   *
   * @param _parentId - 父部门ID
   * @param _options - 查询选项
   * @returns Promise<分页结果>
   */
  async findByParentId(
    _parentId: EntityId,
    _options?: DepartmentQueryOptions,
  ): Promise<IPaginatedResult<DepartmentAggregate>> {
    // 简化实现，返回空结果
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }

  /**
   * 检查部门名称是否存在
   *
   * @param tenantId - 租户ID
   * @param name - 部门名称
   * @param _parentId - 父部门ID（可选）
   * @returns Promise<boolean>
   */
  async existsByName(
    tenantId: TenantId,
    name: string,
    _parentId?: EntityId,
  ): Promise<boolean> {
    const key = `${tenantId.toString()}:${name}`;
    return this.nameIndex.has(key);
  }

  /**
   * 统计部门数量
   *
   * @param tenantId - 租户ID
   * @param _options - 查询选项
   * @returns Promise<number>
   */
  async countByTenantId(
    tenantId: TenantId,
    _options?: DepartmentQueryOptions,
  ): Promise<number> {
    const allDepartments = Array.from(this.departments.values()).filter(
      (dept) => dept.tenantId.equals(tenantId),
    );
    return allDepartments.length;
  }

  /**
   * 软删除部门
   *
   * @param id - 部门ID
   * @param _deletedBy - 删除者
   * @param _deleteReason - 删除原因（可选）
   * @returns Promise<void>
   */
  async softDelete(
    id: EntityId,
    _deletedBy: string,
    _deleteReason?: string,
  ): Promise<void> {
    // 简化实现，直接删除
    await this.delete(id);
  }

  /**
   * 删除所有部门
   *
   * @param tenantId - 租户ID
   * @returns Promise<void>
   */
  async deleteAll(tenantId: TenantId): Promise<void> {
    const departments = Array.from(this.departments.values()).filter((dept) =>
      dept.tenantId.equals(tenantId),
    );
    for (const dept of departments) {
      await this.delete(dept.id);
    }
  }
}

/**
 * 模拟角色仓储
 *
 * @description 为测试提供角色仓储的模拟实现
 */
export class MockRoleRepository implements IRoleRepository {
  private roles = new Map<string, any>();

  /**
   * 保存角色
   *
   * @param roleAggregate - 角色聚合根
   * @returns Promise<void>
   */
  async save(roleAggregate: any): Promise<void> {
    this.roles.set(roleAggregate.id.toString(), roleAggregate);
  }

  /**
   * 根据ID查找角色
   *
   * @param id - 角色ID
   * @returns Promise<角色聚合根或null>
   */
  async findById(id: EntityId): Promise<any | null> {
    return this.roles.get(id.toString()) || null;
  }

  /**
   * 根据租户ID查找角色
   *
   * @param tenantId - 租户ID
   * @param _options - 查询选项
   * @returns Promise<分页结果>
   */
  async findByTenantId(tenantId: TenantId, _options?: any): Promise<any> {
    const allRoles = Array.from(this.roles.values()).filter((role) =>
      role.tenantId.equals(tenantId),
    );

    return {
      items: allRoles,
      total: allRoles.length,
      page: 1,
      limit: 100,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };
  }

  /**
   * 根据名称查找角色
   *
   * @param name - 角色名称
   * @param tenantId - 租户ID
   * @returns Promise<角色聚合根或null>
   */
  async findByName(name: string, tenantId: TenantId): Promise<any | null> {
    const role = Array.from(this.roles.values()).find(
      (r) => r.getRole().name === name && r.tenantId.equals(tenantId),
    );
    return role || null;
  }

  /**
   * 检查角色名称是否存在
   *
   * @param name - 角色名称
   * @param tenantId - 租户ID
   * @returns Promise<boolean>
   */
  async existsByName(name: string, tenantId: TenantId): Promise<boolean> {
    const role = await this.findByName(name, tenantId);
    return role !== null;
  }

  /**
   * 统计租户下的角色数量
   *
   * @param tenantId - 租户ID
   * @returns Promise<number>
   */
  async countByTenantId(tenantId: TenantId): Promise<number> {
    const roles = Array.from(this.roles.values()).filter((role) =>
      role.tenantId.equals(tenantId),
    );
    return roles.length;
  }

  /**
   * 删除角色
   *
   * @param id - 角色ID
   * @returns Promise<void>
   */
  async delete(id: EntityId): Promise<void> {
    this.roles.delete(id.toString());
  }

  /**
   * 软删除角色
   *
   * @param id - 角色ID
   * @param _deletedBy - 删除者
   * @param _deleteReason - 删除原因（可选）
   * @returns Promise<void>
   */
  async softDelete(
    id: EntityId,
    _deletedBy: string,
    _deleteReason?: string,
  ): Promise<void> {
    // 简化实现，直接删除
    await this.delete(id);
  }

  /**
   * 删除所有角色
   *
   * @param tenantId - 租户ID
   * @returns Promise<void>
   */
  async deleteAll(tenantId: TenantId): Promise<void> {
    const roles = Array.from(this.roles.values()).filter((role) =>
      role.tenantId.equals(tenantId),
    );
    for (const role of roles) {
      await this.delete(role.id);
    }
  }

  /**
   * 获取所有角色（测试用）
   *
   * @returns 所有角色
   */
  getAllRoles(): any[] {
    return Array.from(this.roles.values());
  }

  /**
   * 清空仓储（测试用）
   */
  clear(): void {
    this.roles.clear();
  }
}
