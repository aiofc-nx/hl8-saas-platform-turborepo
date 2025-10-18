/**
 * 用户用例服务集合
 *
 * @description 统一管理用户相关的所有用例服务，提供统一的用户业务操作接口
 * 遵循用例为中心的设计原则，每个用例服务都专注于一个具体的业务场景
 *
 * ## 业务规则
 *
 * ### 用例服务集合职责
 * - 统一管理用户相关的所有用例服务
 * - 提供统一的用户业务操作接口
 * - 协调多个用例服务完成复杂的业务场景
 * - 确保用例服务之间的一致性和协调性
 *
 * ### 用例服务协调规则
 * - 用例服务集合不包含业务逻辑，只负责协调
 * - 所有业务逻辑都在具体的用例服务中实现
 * - 用例服务集合负责参数转换和结果聚合
 * - 用例服务集合负责异常处理和日志记录
 *
 * ### 依赖注入规则
 * - 通过构造函数注入所有依赖的用例服务
 * - 使用接口类型进行依赖注入，确保松耦合
 * - 所有依赖都应该是可选的，支持部分功能
 * - 依赖注入应该支持测试时的模拟替换
 *
 * @example
 * ```typescript
 * // 创建用户用例服务集合
 * const userUseCaseServices = new UserUseCaseServices(
 *   createUserUseCase,
 *   updateUserUseCase,
 *   deleteUserUseCase,
 *   getUserUseCase,
 *   getUserListUseCase,
 *   activateUserUseCase,
 *   deactivateUserUseCase
 * );
 *
 * // 创建用户
 * const result = await userUseCaseServices.createUser({
 *   email: 'user@example.com',
 *   username: 'testuser',
 *   password: 'password123',
 *   tenantId: tenantId,
 *   createdBy: 'admin'
 * });
 *
 * console.log('用户创建成功:', result.userId);
 * ```
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";

// 用例服务接口
import type { ICreateUserUseCase } from "../use-cases/user/create-user.use-case.js";
import type { IUpdateUserUseCase } from "../use-cases/user/update-user.use-case.js";
import type { IDeleteUserUseCase } from "../use-cases/user/delete-user.use-case.js";
import type { IGetUserUseCase } from "../use-cases/user/get-user.use-case.js";
import type { IGetUserListUseCase } from "../use-cases/user/get-user-list.use-case.js";
import type { IActivateUserUseCase } from "../use-cases/user/activate-user.use-case.js";
import type { IDeactivateUserUseCase } from "../use-cases/user/deactivate-user.use-case.js";

// 输入输出类型
import type { CreateUserRequest, CreateUserResponse } from "../use-cases/user/create-user.use-case.js";
import type { UpdateUserRequest, UpdateUserResponse } from "../use-cases/user/update-user.use-case.js";
import type { DeleteUserRequest, DeleteUserResponse } from "../use-cases/user/delete-user.use-case.js";
import type { GetUserRequest, GetUserResponse } from "../use-cases/user/get-user.use-case.js";
import type { GetUserListRequest, GetUserListResponse } from "../use-cases/user/get-user-list.use-case.js";
import type { ActivateUserRequest, ActivateUserResponse } from "../use-cases/user/activate-user.use-case.js";
import type { DeactivateUserRequest, DeactivateUserResponse } from "../use-cases/user/deactivate-user.use-case.js";

/**
 * 用户用例服务集合
 *
 * @description 统一管理用户相关的所有用例服务，提供统一的用户业务操作接口
 */
export class UserUseCaseServices {
  constructor(
    private readonly createUserUseCase: ICreateUserUseCase,
    private readonly updateUserUseCase: IUpdateUserUseCase,
    private readonly deleteUserUseCase: IDeleteUserUseCase,
    private readonly getUserUseCase: IGetUserUseCase,
    private readonly getUserListUseCase: IGetUserListUseCase,
    private readonly activateUserUseCase: IActivateUserUseCase,
    private readonly deactivateUserUseCase: IDeactivateUserUseCase,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 创建用户
   *
   * @description 创建新用户，包括验证、持久化和事件发布
   *
   * @param request - 创建用户请求
   * @returns Promise<创建用户响应>
   *
   * @example
   * ```typescript
   * const result = await userUseCaseServices.createUser({
   *   email: 'user@example.com',
   *   username: 'testuser',
   *   password: 'password123',
   *   tenantId: tenantId,
   *   createdBy: 'admin'
   * });
   * ```
   */
  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      this.logger.info("开始创建用户", { email: request.email, username: request.username });
      
      const response = await this.createUserUseCase.execute(request);
      
      this.logger.info("用户创建成功", { userId: response.userId.toString() });
      return response;
    } catch (error) {
      this.logger.error("用户创建失败", { error: error.message, email: request.email });
      throw error;
    }
  }

  /**
   * 更新用户
   *
   * @description 更新用户信息，包括验证、持久化和事件发布
   *
   * @param request - 更新用户请求
   * @returns Promise<更新用户响应>
   *
   * @example
   * ```typescript
   * const result = await userUseCaseServices.updateUser({
   *   userId: userId,
   *   displayName: '新姓名',
   *   description: '新描述',
   *   updatedBy: 'admin'
   * });
   * ```
   */
  async updateUser(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      this.logger.info("开始更新用户", { userId: request.userId.toString() });
      
      const response = await this.updateUserUseCase.execute(request);
      
      this.logger.info("用户更新成功", { userId: response.userId.toString() });
      return response;
    } catch (error) {
      this.logger.error("用户更新失败", { error: error.message, userId: request.userId.toString() });
      throw error;
    }
  }

  /**
   * 删除用户
   *
   * @description 删除用户，包括验证、持久化和事件发布
   *
   * @param request - 删除用户请求
   * @returns Promise<删除用户响应>
   *
   * @example
   * ```typescript
   * const result = await userUseCaseServices.deleteUser({
   *   userId: userId,
   *   deletedBy: 'admin',
   *   deleteReason: '用户请求删除'
   * });
   * ```
   */
  async deleteUser(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    try {
      this.logger.info("开始删除用户", { userId: request.userId.toString() });
      
      const response = await this.deleteUserUseCase.execute(request);
      
      this.logger.info("用户删除成功", { userId: response.userId.toString() });
      return response;
    } catch (error) {
      this.logger.error("用户删除失败", { error: error.message, userId: request.userId.toString() });
      throw error;
    }
  }

  /**
   * 获取用户
   *
   * @description 获取用户详细信息
   *
   * @param request - 获取用户请求
   * @returns Promise<获取用户响应>
   *
   * @example
   * ```typescript
   * const result = await userUseCaseServices.getUser({
   *   userId: userId,
   *   tenantId: tenantId
   * });
   * ```
   */
  async getUser(request: GetUserRequest): Promise<GetUserResponse> {
    try {
      this.logger.debug("开始获取用户", { userId: request.userId.toString() });
      
      const response = await this.getUserUseCase.execute(request);
      
      this.logger.debug("用户获取成功", { userId: response.user.id.toString() });
      return response;
    } catch (error) {
      this.logger.error("用户获取失败", { error: error.message, userId: request.userId.toString() });
      throw error;
    }
  }

  /**
   * 获取用户列表
   *
   * @description 获取用户列表，支持分页、过滤和排序
   *
   * @param request - 获取用户列表请求
   * @returns Promise<获取用户列表响应>
   *
   * @example
   * ```typescript
   * const result = await userUseCaseServices.getUserList({
   *   tenantId: tenantId,
   *   page: 1,
   *   limit: 20,
   *   filters: { status: 'ACTIVE' }
   * });
   * ```
   */
  async getUserList(request: GetUserListRequest): Promise<GetUserListResponse> {
    try {
      this.logger.debug("开始获取用户列表", { 
        tenantId: request.tenantId.toString(),
        page: request.page,
        limit: request.limit
      });
      
      const response = await this.getUserListUseCase.execute(request);
      
      this.logger.debug("用户列表获取成功", { 
        total: response.total,
        count: response.users.length
      });
      return response;
    } catch (error) {
      this.logger.error("用户列表获取失败", { 
        error: error.message, 
        tenantId: request.tenantId.toString() 
      });
      throw error;
    }
  }

  /**
   * 激活用户
   *
   * @description 激活用户账户
   *
   * @param request - 激活用户请求
   * @returns Promise<激活用户响应>
   *
   * @example
   * ```typescript
   * const result = await userUseCaseServices.activateUser({
   *   userId: userId,
   *   activatedBy: 'admin'
   * });
   * ```
   */
  async activateUser(request: ActivateUserRequest): Promise<ActivateUserResponse> {
    try {
      this.logger.info("开始激活用户", { userId: request.userId.toString() });
      
      const response = await this.activateUserUseCase.execute(request);
      
      this.logger.info("用户激活成功", { userId: response.userId.toString() });
      return response;
    } catch (error) {
      this.logger.error("用户激活失败", { error: error.message, userId: request.userId.toString() });
      throw error;
    }
  }

  /**
   * 停用用户
   *
   * @description 停用用户账户
   *
   * @param request - 停用用户请求
   * @returns Promise<停用用户响应>
   *
   * @example
   * ```typescript
   * const result = await userUseCaseServices.deactivateUser({
   *   userId: userId,
   *   deactivatedBy: 'admin',
   *   deactivateReason: '违反使用条款'
   * });
   * ```
   */
  async deactivateUser(request: DeactivateUserRequest): Promise<DeactivateUserResponse> {
    try {
      this.logger.info("开始停用用户", { userId: request.userId.toString() });
      
      const response = await this.deactivateUserUseCase.execute(request);
      
      this.logger.info("用户停用成功", { userId: response.userId.toString() });
      return response;
    } catch (error) {
      this.logger.error("用户停用失败", { error: error.message, userId: request.userId.toString() });
      throw error;
    }
  }
}
