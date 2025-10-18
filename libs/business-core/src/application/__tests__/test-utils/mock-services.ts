/**
 * 模拟服务实现
 *
 * @description 为应用层测试提供模拟的服务实现
 *
 * @since 1.0.0
 */

import type { IEventBus } from "../../ports/event-bus.interface.js";
import type { ITransactionManager } from "../../ports/transaction-manager.interface.js";
import type { ICacheService } from "../../ports/cache-service.interface.js";
import type { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { TestDataFactory } from "./test-data.js";

/**
 * 模拟事件总线
 *
 * @description 为测试提供事件总线的模拟实现
 */
export class MockEventBus implements IEventBus {
  private publishedEvents: unknown[] = [];

  /**
   * 发布单个事件
   *
   * @param event - 事件对象
   * @returns Promise<void>
   */
  async publish(event: unknown): Promise<void> {
    this.publishedEvents.push(event);
  }

  /**
   * 发布多个事件
   *
   * @param events - 事件数组
   * @returns Promise<void>
   */
  async publishAll(events: unknown[]): Promise<void> {
    this.publishedEvents.push(...events);
  }

  /**
   * 获取已发布的事件
   *
   * @returns 已发布的事件数组
   */
  getPublishedEvents(): unknown[] {
    return [...this.publishedEvents];
  }

  /**
   * 清空已发布的事件
   */
  clearEvents(): void {
    this.publishedEvents = [];
  }

  /**
   * 获取事件数量
   *
   * @returns 事件数量
   */
  getEventCount(): number {
    return this.publishedEvents.length;
  }

  /**
   * 订阅事件
   *
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   */
  async subscribe(_eventType: string, _handler: any): Promise<void> {
    // 模拟实现，测试中不需要实际功能
  }

  /**
   * 取消订阅事件
   *
   * @param eventType - 事件类型
   * @param handler - 事件处理器
   */
  async unsubscribe(_eventType: string, _handler: any): Promise<void> {
    // 模拟实现，测试中不需要实际功能
  }

  /**
   * 获取事件处理器
   *
   * @param eventType - 事件类型
   * @returns 事件处理器列表
   */
  getHandlers(_eventType: string): any[] {
    return [];
  }

  /**
   * 清空所有事件和处理器
   */
  clear(): void {
    this.publishedEvents = [];
  }
}

/**
 * 模拟事务管理器
 *
 * @description 为测试提供事务管理器的模拟实现
 */
export class MockTransactionManager implements ITransactionManager {
  private isInTransaction = false;
  private transactionCount = 0;

  /**
   * 开始事务
   *
   * @returns Promise<void>
   */
  async begin(): Promise<void> {
    this.isInTransaction = true;
    this.transactionCount++;
  }

  /**
   * 提交事务
   *
   * @returns Promise<void>
   */
  async commit(): Promise<void> {
    this.isInTransaction = false;
  }

  /**
   * 回滚事务
   *
   * @returns Promise<void>
   */
  async rollback(): Promise<void> {
    this.isInTransaction = false;
  }

  /**
   * 检查是否在事务中
   *
   * @returns 是否在事务中
   */
  isTransactionActive(): boolean {
    return this.isInTransaction;
  }

  /**
   * 获取事务计数
   *
   * @returns 事务计数
   */
  getTransactionCount(): number {
    return this.transactionCount;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.isInTransaction = false;
    this.transactionCount = 0;
  }
}

/**
 * 模拟日志服务
 *
 * @description 为测试提供日志服务的模拟实现
 */
export class MockLoggerService implements FastifyLoggerService {
  private logs: Array<{ level: string; message: string; data?: unknown }> = [];

  /**
   * 记录调试日志
   *
   * @param message - 日志消息
   * @param data - 附加数据
   */
  debug(message: string, data?: unknown): void {
    this.logs.push({ level: "debug", message, data });
  }

  /**
   * 记录信息日志
   *
   * @param message - 日志消息
   * @param data - 附加数据
   */
  info(message: string, data?: unknown): void {
    this.logs.push({ level: "info", message, data });
  }

  /**
   * 记录警告日志
   *
   * @param message - 日志消息
   * @param data - 附加数据
   */
  warn(message: string, data?: unknown): void {
    this.logs.push({ level: "warn", message, data });
  }

  /**
   * 记录错误日志
   *
   * @param message - 日志消息
   * @param data - 附加数据
   */
  error(message: string, data?: unknown): void {
    this.logs.push({ level: "error", message, data });
  }

  /**
   * 记录致命错误日志
   *
   * @param message - 日志消息
   * @param data - 附加数据
   */
  fatal(message: string, data?: unknown): void {
    this.logs.push({ level: "fatal", message, data });
  }

  /**
   * 记录跟踪日志
   *
   * @param message - 日志消息
   * @param data - 附加数据
   */
  trace(message: string, data?: unknown): void {
    this.logs.push({ level: "trace", message, data });
  }

  /**
   * 获取所有日志
   *
   * @returns 日志数组
   */
  getLogs(): Array<{ level: string; message: string; data?: unknown }> {
    return [...this.logs];
  }

  /**
   * 获取指定级别的日志
   *
   * @param level - 日志级别
   * @returns 指定级别的日志数组
   */
  getLogsByLevel(
    level: string,
  ): Array<{ level: string; message: string; data?: unknown }> {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 获取日志数量
   *
   * @returns 日志数量
   */
  getLogCount(): number {
    return this.logs.length;
  }
}

/**
 * 模拟缓存服务
 *
 * @description 为测试提供缓存服务的模拟实现
 */
export class MockCacheService implements ICacheService {
  private cache = new Map<string, unknown>();

  /**
   * 设置缓存
   *
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 生存时间（秒）
   * @returns Promise<void>
   */
  async set(key: string, value: unknown, _ttl?: number): Promise<void> {
    this.cache.set(key, value);
  }

  /**
   * 获取缓存
   *
   * @param key - 缓存键
   * @returns Promise<缓存值或null>
   */
  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get(key);
    return value as T | null;
  }

  /**
   * 删除缓存
   *
   * @param key - 缓存键
   * @returns Promise<boolean>
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   *
   * @returns Promise<void>
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在
   *
   * @param key - 缓存键
   * @returns Promise<boolean>
   */
  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  /**
   * 获取缓存大小
   *
   * @returns 缓存大小
   */
  getSize(): number {
    return this.cache.size;
  }
}

/**
 * 模拟用户用例服务
 *
 * @description 为测试提供用户用例服务的模拟实现
 */
export class MockUserUseCaseServices {
  private createUserCallCount = 0;
  private updateUserCallCount = 0;
  private createUserResult: any = {
    success: true,
    data: { userId: TestDataFactory.createEntityId() },
  };
  private updateUserResult: any = {
    success: true,
    data: { userId: TestDataFactory.createEntityId() },
  };

  /**
   * 创建用户
   *
   * @param request - 创建用户请求
   * @param context - 用例上下文
   * @returns Promise<创建用户结果>
   */
  async createUser(_request: any, _context: any): Promise<any> {
    this.createUserCallCount++;
    return this.createUserResult;
  }

  /**
   * 更新用户
   *
   * @param request - 更新用户请求
   * @param context - 用例上下文
   * @returns Promise<更新用户结果>
   */
  async updateUser(_request: any, _context: any): Promise<any> {
    this.updateUserCallCount++;
    return this.updateUserResult;
  }

  /**
   * 设置创建用户结果
   *
   * @param result - 创建用户结果
   */
  setCreateUserResult(result: any): void {
    this.createUserResult = result;
  }

  /**
   * 设置更新用户结果
   *
   * @param result - 更新用户结果
   */
  setUpdateUserResult(result: any): void {
    this.updateUserResult = result;
  }

  /**
   * 获取创建用户调用次数
   *
   * @returns 调用次数
   */
  getCreateUserCallCount(): number {
    return this.createUserCallCount;
  }

  /**
   * 获取更新用户调用次数
   *
   * @returns 调用次数
   */
  getUpdateUserCallCount(): number {
    return this.updateUserCallCount;
  }

  /**
   * 清空状态（测试用）
   */
  clear(): void {
    this.createUserCallCount = 0;
    this.updateUserCallCount = 0;
    this.createUserResult = {
      success: true,
      data: { userId: TestDataFactory.createEntityId() },
    };
    this.updateUserResult = {
      success: true,
      data: { userId: TestDataFactory.createEntityId() },
    };
  }
}

/**
 * 模拟租户用例服务
 *
 * @description 为测试提供租户用例服务的模拟实现
 */
export class MockTenantUseCaseServices {
  private createTenantCallCount = 0;
  private getTenantCallCount = 0;
  private createTenantResult: any = {
    success: true,
    data: { tenantId: TestDataFactory.createTenantId() },
  };
  private getTenantResult: any = {
    success: true,
    data: { tenantId: TestDataFactory.createTenantId() },
  };

  /**
   * 创建租户
   *
   * @param request - 创建租户请求
   * @param context - 用例上下文
   * @returns Promise<创建租户结果>
   */
  async createTenant(_request: any, _context: any): Promise<any> {
    this.createTenantCallCount++;
    return this.createTenantResult;
  }

  /**
   * 获取租户
   *
   * @param request - 获取租户请求
   * @param context - 用例上下文
   * @returns Promise<获取租户结果>
   */
  async getTenant(request: any, context: any): Promise<any> {
    this.getTenantCallCount++;
    return this.getTenantResult;
  }

  /**
   * 设置创建租户结果
   *
   * @param result - 创建租户结果
   */
  setCreateTenantResult(result: any): void {
    this.createTenantResult = result;
  }

  /**
   * 设置获取租户结果
   *
   * @param result - 获取租户结果
   */
  setGetTenantResult(result: any): void {
    this.getTenantResult = result;
  }

  /**
   * 获取创建租户调用次数
   *
   * @returns 调用次数
   */
  getCreateTenantCallCount(): number {
    return this.createTenantCallCount;
  }

  /**
   * 获取获取租户调用次数
   *
   * @returns 调用次数
   */
  getGetTenantCallCount(): number {
    return this.getTenantCallCount;
  }

  /**
   * 清空状态（测试用）
   */
  clear(): void {
    this.createTenantCallCount = 0;
    this.getTenantCallCount = 0;
    this.createTenantResult = {
      success: true,
      data: { tenantId: TestDataFactory.createTenantId() },
    };
    this.getTenantResult = {
      success: true,
      data: { tenantId: TestDataFactory.createTenantId() },
    };
  }
}

/**
 * 模拟组织用例服务
 *
 * @description 为测试提供组织用例服务的模拟实现
 */
export class MockOrganizationUseCaseServices {
  private createOrganizationCallCount = 0;
  private updateOrganizationCallCount = 0;
  private createOrganizationResult: any = {
    success: true,
    data: { organizationId: TestDataFactory.createEntityId() },
  };
  private updateOrganizationResult: any = {
    success: true,
    data: { organizationId: TestDataFactory.createEntityId() },
  };

  /**
   * 创建组织
   *
   * @param request - 创建组织请求
   * @param context - 用例上下文
   * @returns Promise<创建组织结果>
   */
  async createOrganization(request: any, context: any): Promise<any> {
    this.createOrganizationCallCount++;
    return this.createOrganizationResult;
  }

  /**
   * 更新组织
   *
   * @param request - 更新组织请求
   * @param context - 用例上下文
   * @returns Promise<更新组织结果>
   */
  async updateOrganization(request: any, context: any): Promise<any> {
    this.updateOrganizationCallCount++;
    return this.updateOrganizationResult;
  }

  /**
   * 设置创建组织结果
   *
   * @param result - 创建组织结果
   */
  setCreateOrganizationResult(result: any): void {
    this.createOrganizationResult = result;
  }

  /**
   * 设置更新组织结果
   *
   * @param result - 更新组织结果
   */
  setUpdateOrganizationResult(result: any): void {
    this.updateOrganizationResult = result;
  }

  /**
   * 获取创建组织调用次数
   *
   * @returns 调用次数
   */
  getCreateOrganizationCallCount(): number {
    return this.createOrganizationCallCount;
  }

  /**
   * 获取更新组织调用次数
   *
   * @returns 调用次数
   */
  getUpdateOrganizationCallCount(): number {
    return this.updateOrganizationCallCount;
  }

  /**
   * 清空状态（测试用）
   */
  clear(): void {
    this.createOrganizationCallCount = 0;
    this.updateOrganizationCallCount = 0;
    this.createOrganizationResult = {
      success: true,
      data: { organizationId: TestDataFactory.createEntityId() },
    };
    this.updateOrganizationResult = {
      success: true,
      data: { organizationId: TestDataFactory.createEntityId() },
    };
  }
}

/**
 * 模拟部门用例服务
 *
 * @description 为测试提供部门用例服务的模拟实现
 */
export class MockDepartmentUseCaseServices {
  private createDepartmentCallCount = 0;
  private updateDepartmentCallCount = 0;
  private createDepartmentResult: any = {
    success: true,
    data: { departmentId: TestDataFactory.createEntityId() },
  };
  private updateDepartmentResult: any = {
    success: true,
    data: { departmentId: TestDataFactory.createEntityId() },
  };

  /**
   * 创建部门
   *
   * @param request - 创建部门请求
   * @param context - 用例上下文
   * @returns Promise<创建部门结果>
   */
  async createDepartment(request: any, context: any): Promise<any> {
    this.createDepartmentCallCount++;
    return this.createDepartmentResult;
  }

  /**
   * 更新部门
   *
   * @param request - 更新部门请求
   * @param context - 用例上下文
   * @returns Promise<更新部门结果>
   */
  async updateDepartment(request: any, context: any): Promise<any> {
    this.updateDepartmentCallCount++;
    return this.updateDepartmentResult;
  }

  /**
   * 设置创建部门结果
   *
   * @param result - 创建部门结果
   */
  setCreateDepartmentResult(result: any): void {
    this.createDepartmentResult = result;
  }

  /**
   * 设置更新部门结果
   *
   * @param result - 更新部门结果
   */
  setUpdateDepartmentResult(result: any): void {
    this.updateDepartmentResult = result;
  }

  /**
   * 获取创建部门调用次数
   *
   * @returns 调用次数
   */
  getCreateDepartmentCallCount(): number {
    return this.createDepartmentCallCount;
  }

  /**
   * 获取更新部门调用次数
   *
   * @returns 调用次数
   */
  getUpdateDepartmentCallCount(): number {
    return this.updateDepartmentCallCount;
  }

  /**
   * 清空状态（测试用）
   */
  clear(): void {
    this.createDepartmentCallCount = 0;
    this.updateDepartmentCallCount = 0;
    this.createDepartmentResult = {
      success: true,
      data: { departmentId: TestDataFactory.createEntityId() },
    };
    this.updateDepartmentResult = {
      success: true,
      data: { departmentId: TestDataFactory.createEntityId() },
    };
  }
}
