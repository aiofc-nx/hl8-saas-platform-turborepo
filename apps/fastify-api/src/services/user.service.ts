/**
 * 用户服务
 *
 * @description 示例服务，演示 @hl8/database 的使用：
 * - 事务管理（@Transactional 装饰器）
 * - 多租户数据隔离（@IsolationAware 装饰器）
 * - EntityManager 注入
 * - 健康检查和指标监控
 *
 * ## 业务规则
 *
 * ### 事务规则
 * - 创建用户操作在事务中执行
 * - 批量创建用户使用单个事务
 * - 更新用户信息在事务中执行
 * - 事务失败自动回滚
 *
 * ### 数据隔离规则
 * - 所有查询操作自动应用租户隔离
 * - 查询时自动注入隔离上下文
 * - 支持组织级和部门级隔离
 *
 * ### 查询规则
 * - 默认排除已软删除的用户
 * - 支持分页查询
 * - 支持按条件筛选
 *
 * @example
 * ```typescript
 * // 创建用户（自动应用事务和隔离）
 * const user = await userService.createUser({
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 * });
 *
 * // 查询用户（自动应用隔离）
 * const users = await userService.findAll();
 *
 * // 批量创建（单个事务）
 * const users = await userService.createMany([...]);
 * ```
 */

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  Transactional,
  IsolationAware,
  DatabaseIsolationService,
  IsolationLevel,
} from '@hl8/database';
import { FastifyLoggerService } from '@hl8/nestjs-fastify';
import { User } from '../entities/user.entity.js';

/**
 * 创建用户 DTO
 */
export interface CreateUserDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  departmentId?: string;
}

/**
 * 更新用户 DTO
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
}

@Injectable()
export class UserService {
  constructor(
    private readonly em: EntityManager,
    private readonly isolationService: DatabaseIsolationService,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 创建用户
   *
   * @description 在事务中创建用户，自动应用租户隔离
   *
   * ## 业务规则
   * - 自动从隔离上下文获取 tenantId
   * - 在事务中执行，失败自动回滚
   * - 自动记录创建日志
   *
   * @param dto - 创建用户数据
   * @returns 创建的用户实体
   * @throws {IsolationContextMissingException} 隔离上下文缺失
   * @throws {DatabaseTransactionException} 事务执行失败
   */
  @Transactional()
  @IsolationAware(IsolationLevel.TENANT)
  async createUser(dto: CreateUserDto): Promise<User> {
    this.logger.log('创建用户', { dto });

    // 从隔离上下文获取租户 ID
    const tenantId = this.isolationService.getTenantId();
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const user = new User();
    user.tenantId = tenantId;
    user.username = dto.username;
    user.email = dto.email;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.organizationId = dto.organizationId;
    user.departmentId = dto.departmentId;

    await this.em.persistAndFlush(user);

    this.logger.log('用户创建成功', { userId: user.id });

    return user;
  }

  /**
   * 批量创建用户
   *
   * @description 在单个事务中批量创建用户
   *
   * @param dtos - 用户数据数组
   * @returns 创建的用户实体数组
   */
  @Transactional()
  @IsolationAware(IsolationLevel.TENANT)
  async createMany(dtos: CreateUserDto[]): Promise<User[]> {
    this.logger.log('批量创建用户', { count: dtos.length });

    const tenantId = this.isolationService.getTenantId();
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const users = dtos.map((dto) => {
      const user = new User();
      user.tenantId = tenantId;
      user.username = dto.username;
      user.email = dto.email;
      user.firstName = dto.firstName;
      user.lastName = dto.lastName;
      user.organizationId = dto.organizationId;
      user.departmentId = dto.departmentId;
      return user;
    });

    await this.em.persistAndFlush(users);

    this.logger.log('批量创建用户成功', { count: users.length });

    return users;
  }

  /**
   * 查询所有用户
   *
   * @description 自动应用租户隔离，排除已删除的用户
   *
   * @returns 用户列表
   */
  @IsolationAware(IsolationLevel.TENANT)
  async findAll(): Promise<User[]> {
    // 构建隔离过滤条件
    const isolationFilter = this.isolationService.buildIsolationFilter(
      IsolationLevel.TENANT,
    );

    const users = await this.em.find(User, {
      ...isolationFilter,
      deletedAt: null, // 排除已删除的用户
    });

    this.logger.log('查询用户列表', { count: users.length });

    return users;
  }

  /**
   * 根据 ID 查询用户
   *
   * @param id - 用户 ID
   * @returns 用户实体，不存在则返回 null
   */
  @IsolationAware(IsolationLevel.TENANT)
  async findById(id: string): Promise<User | null> {
    const isolationFilter = this.isolationService.buildIsolationFilter(
      IsolationLevel.TENANT,
    );

    const user = await this.em.findOne(User, {
      id,
      ...isolationFilter,
      deletedAt: null,
    });

    return user;
  }

  /**
   * 更新用户信息
   *
   * @description 在事务中更新用户信息
   *
   * @param id - 用户 ID
   * @param dto - 更新数据
   * @returns 更新后的用户实体
   */
  @Transactional()
  @IsolationAware(IsolationLevel.TENANT)
  async updateUser(id: string, dto: UpdateUserDto): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.email) user.email = dto.email;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    await this.em.flush();

    this.logger.log('用户更新成功', { userId: id });

    return user;
  }

  /**
   * 软删除用户
   *
   * @param id - 用户 ID
   * @returns 是否删除成功
   */
  @Transactional()
  @IsolationAware(IsolationLevel.TENANT)
  async softDelete(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      return false;
    }

    user.softDelete();
    await this.em.flush();

    this.logger.log('用户已软删除', { userId: id });

    return true;
  }

  /**
   * 恢复已删除的用户
   *
   * @param id - 用户 ID
   * @returns 是否恢复成功
   */
  @Transactional()
  @IsolationAware(IsolationLevel.TENANT)
  async restore(id: string): Promise<boolean> {
    const isolationFilter = this.isolationService.buildIsolationFilter(
      IsolationLevel.TENANT,
    );

    const user = await this.em.findOne(User, {
      id,
      ...isolationFilter,
      deletedAt: { $ne: null },
    });

    if (!user) {
      return false;
    }

    user.restore();
    await this.em.flush();

    this.logger.log('用户已恢复', { userId: id });

    return true;
  }
}

