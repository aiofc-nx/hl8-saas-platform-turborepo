/**
 * Saga 接口定义
 *
 * 定义了 Saga 模式的核心接口，支持分布式事务管理、
 * 补偿操作、超时处理、状态管理等企业级特性。
 *
 * @description Saga 接口定义
 * @since 1.0.0
 */

import { Observable } from "rxjs";
// 简化的上下文类型定义
interface IAsyncContext {
  getTenantId?(): string;
  getUserId?(): string;
  getOrganizationId?(): string;
  getDepartmentId?(): string;
}

// 导入Saga相关枚举
import { SagaStatus } from "../../../common/enums/application/saga-status.enum.js";

// 导入Saga步骤类型枚举
import { SagaStepType } from "../../../common/enums/application/saga-step-type.enum.js";

// 导入Saga步骤状态枚举
import { SagaStepStatus } from "../../../common/enums/application/saga-step-status.enum.js";

/**
 * Saga 步骤接口
 */
export interface ISagaStep {
  /**
   * 步骤ID
   */
  stepId: string;

  /**
   * 步骤名称
   */
  stepName: string;

  /**
   * 步骤类型
   */
  stepType: SagaStepType;

  /**
   * 步骤状态
   */
  status: SagaStepStatus;

  /**
   * 执行顺序
   */
  order: number;

  /**
   * 超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 重试次数
   */
  retryCount: number;

  /**
   * 最大重试次数
   */
  maxRetries: number;

  /**
   * 重试延迟（毫秒）
   */
  retryDelay: number;

  /**
   * 执行开始时间
   */
  startTime?: Date;

  /**
   * 执行结束时间
   */
  endTime?: Date;

  /**
   * 执行结果
   */
  result?: unknown;

  /**
   * 错误信息
   */
  error?: string;

  /**
   * 补偿命令
   */
  compensationCommand?: unknown;

  /**
   * 步骤配置
   */
  config?: Record<string, unknown>;

  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
}

/**
 * Saga 执行上下文接口
 */
export interface ISagaExecutionContext {
  /**
   * Saga ID
   */
  sagaId: string;

  /**
   * Saga 类型
   */
  sagaType: string;

  /**
   * 当前状态
   */
  status: SagaStatus;

  /**
   * 开始时间
   */
  startTime: Date;

  /**
   * 结束时间
   */
  endTime?: Date;

  /**
   * 当前步骤索引
   */
  currentStepIndex: number;

  /**
   * 步骤列表
   */
  steps: ISagaStep[];

  /**
   * 执行数据
   */
  data: Record<string, unknown>;

  /**
   * 错误信息
   */
  error?: string;

  /**
   * 重试次数
   */
  retryCount: number;

  /**
   * 最大重试次数
   */
  maxRetries: number;

  /**
   * 超时时间（毫秒）
   */
  timeout?: number;

  /**
   * 是否启用补偿
   */
  enableCompensation: boolean;

  /**
   * 是否启用超时
   */
  enableTimeout: boolean;

  /**
   * 上下文信息
   */
  context?: IAsyncContext;

  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
}

/**
 * Saga 配置接口
 */
export interface ISagaConfiguration {
  /**
   * 是否启用 Saga
   */
  enabled: boolean;

  /**
   * 默认超时时间（毫秒）
   */
  defaultTimeout: number;

  /**
   * 默认重试次数
   */
  defaultRetries: number;

  /**
   * 默认重试延迟（毫秒）
   */
  defaultRetryDelay: number;

  /**
   * 是否启用补偿
   */
  enableCompensation: boolean;

  /**
   * 是否启用超时
   */
  enableTimeout: boolean;

  /**
   * 是否启用并发执行
   */
  enableConcurrency: boolean;

  /**
   * 最大并发数
   */
  maxConcurrency: number;

  /**
   * 是否启用持久化
   */
  enablePersistence: boolean;

  /**
   * 持久化间隔（毫秒）
   */
  persistenceInterval: number;

  /**
   * 是否启用监控
   */
  enableMonitoring: boolean;

  /**
   * 监控间隔（毫秒）
   */
  monitoringInterval: number;
}

/**
 * Saga 统计信息接口
 */
export interface ISagaStatistics {
  /**
   * 总 Saga 数量
   */
  totalSagas: number;

  /**
   * 成功完成的 Saga 数量
   */
  completedSagas: number;

  /**
   * 失败的 Saga 数量
   */
  failedSagas: number;

  /**
   * 补偿的 Saga 数量
   */
  compensatedSagas: number;

  /**
   * 超时的 Saga 数量
   */
  timeoutSagas: number;

  /**
   * 平均执行时间（毫秒）
   */
  averageExecutionTime: number;

  /**
   * 按类型统计
   */
  byType: Record<string, number>;

  /**
   * 按状态统计
   */
  byStatus: Record<SagaStatus, number>;

  /**
   * 按租户统计
   */
  byTenant: Record<string, number>;

  /**
   * 按时间统计
   */
  byTime: {
    lastHour: number;
    lastDay: number;
    lastWeek: number;
    lastMonth: number;
  };

  /**
   * 最后更新时间
   */
  lastUpdatedAt: Date;
}

/**
 * Saga 接口
 */
export interface ISaga {
  /**
   * Saga 类型
   */
  readonly sagaType: string;

  /**
   * 是否启用补偿
   */
  readonly enableCompensation: boolean;

  /**
   * 是否启用超时
   */
  readonly enableTimeout: boolean;

  /**
   * 超时时间（毫秒）
   */
  readonly timeout?: number;

  /**
   * 最大重试次数
   */
  readonly maxRetries: number;

  /**
   * 重试延迟（毫秒）
   */
  readonly retryDelay: number;

  /**
   * 配置 Saga
   */
  configure(config: Partial<ISagaConfiguration>): void;

  /**
   * 获取配置
   */
  getConfiguration(): ISagaConfiguration;

  /**
   * 执行 Saga
   */
  execute(context: ISagaExecutionContext): Observable<ISagaExecutionContext>;

  /**
   * 补偿 Saga
   */
  compensate(context: ISagaExecutionContext): Observable<ISagaExecutionContext>;

  /**
   * 处理超时
   */
  handleTimeout(
    context: ISagaExecutionContext,
  ): Observable<ISagaExecutionContext>;

  /**
   * 验证 Saga 配置
   */
  validate(): boolean;

  /**
   * 获取 Saga 步骤
   */
  getSteps(): ISagaStep[];

  /**
   * 添加步骤
   */
  addStep(step: ISagaStep): void;

  /**
   * 移除步骤
   */
  removeStep(stepId: string): boolean;

  /**
   * 获取步骤
   */
  getStep(stepId: string): ISagaStep | undefined;

  /**
   * 更新步骤
   */
  updateStep(stepId: string, updates: Partial<ISagaStep>): boolean;
}

/**
 * Saga 管理器接口
 */
export interface ISagaManager {
  /**
   * 启动 Saga
   */
  startSaga(
    sagaType: string,
    data: Record<string, unknown>,
    context?: IAsyncContext,
  ): Observable<ISagaExecutionContext>;

  /**
   * 停止 Saga
   */
  stopSaga(sagaId: string): Observable<boolean>;

  /**
   * 取消 Saga
   */
  cancelSaga(sagaId: string): Observable<boolean>;

  /**
   * 补偿 Saga
   */
  compensateSaga(sagaId: string): Observable<boolean>;

  /**
   * 获取 Saga 状态
   */
  getSagaStatus(sagaId: string): ISagaExecutionContext | undefined;

  /**
   * 获取所有 Saga 状态
   */
  getAllSagaStatuses(): ISagaExecutionContext[];

  /**
   * 注册 Saga
   */
  registerSaga(saga: ISaga): void;

  /**
   * 注销 Saga
   */
  unregisterSaga(sagaType: string): boolean;

  /**
   * 获取 Saga
   */
  getSaga(sagaType: string): ISaga | undefined;

  /**
   * 获取所有 Saga
   */
  getAllSagas(): ISaga[];

  /**
   * 获取统计信息
   */
  getStatistics(): ISagaStatistics;

  /**
   * 启动管理器
   */
  start(): Promise<void>;

  /**
   * 停止管理器
   */
  stop(): Promise<void>;

  /**
   * 检查是否已启动
   */
  isStarted(): boolean;

  /**
   * 健康检查
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Saga 事件接口
 */
export interface ISagaEvent {
  /**
   * 事件类型
   */
  eventType: string;

  /**
   * Saga ID
   */
  sagaId: string;

  /**
   * 步骤 ID
   */
  stepId?: string;

  /**
   * 事件数据
   */
  data: Record<string, unknown>;

  /**
   * 事件时间戳
   */
  timestamp: Date;

  /**
   * 事件来源
   */
  source: string;

  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
}

/**
 * Saga 事件处理器接口
 */
export interface ISagaEventHandler {
  /**
   * 处理器名称
   */
  readonly name: string;

  /**
   * 事件类型
   */
  readonly eventType: string;

  /**
   * 优先级
   */
  readonly priority: number;

  /**
   * 处理事件
   */
  handle(event: ISagaEvent): Observable<unknown>;

  /**
   * 检查是否应该处理此事件
   */
  shouldHandle(event: ISagaEvent): boolean;
}
