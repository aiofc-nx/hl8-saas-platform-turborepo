/**
 * 用例相关类型定义
 *
 * @description 定义用例相关的通用类型
 * @since 1.0.0
 */

import { UseCaseType } from "../../enums/application/use-case-type.enum.js";

/**
 * 用例配置选项接口
 */
export interface IUseCaseOptions {
  /**
   * 用例名称
   *
   * @description 用例的唯一标识名称，用于：
   * - 用例注册表管理
   * - 日志记录和调试
   * - 性能监控和指标收集
   * - API路由和文档生成
   *
   * @example 'CreateUser', 'GetUserProfile', 'UpdateUserEmail'
   */
  name: string;

  /**
   * 用例描述
   *
   * @description 用例的业务描述，用于：
   * - 文档生成和业务理解
   * - 开发工具提示
   * - API文档生成
   * - 业务分析和审计
   *
   * @example '创建新用户，包括验证、持久化和事件发布'
   */
  description: string;

  /**
   * 用例类型
   *
   * @description 用例的类型，决定执行策略：
   * - command: 状态变更操作，需要事务和事件发布
   * - query: 数据检索操作，只读且可缓存
   *
   * @example 'command', 'query'
   */
  type: UseCaseType | "command" | "query";

  /**
   * 用例版本
   *
   * @description 用例的版本号，用于：
   * - 版本兼容性管理
   * - API版本控制
   * - 变更追踪和回滚
   *
   * @default '1.0.0'
   * @example '1.0.0', '2.1.0', '3.0.0-beta.1'
   */
  version?: string;

  /**
   * 所需权限
   *
   * @description 执行此用例所需的权限列表，用于：
   * - 权限验证和访问控制
   * - 安全审计
   * - 角色权限分配
   *
   * @example ['user:create', 'user:manage']
   */
  permissions?: string[];

  /**
   * 用例分类
   *
   * @description 用例的业务分类，用于：
   * - 用例分组和管理
   * - 监控指标分类
   * - 权限控制分组
   *
   * @example 'user-management', 'order-processing', 'billing'
   */
  category?: string;

  /**
   * 用例标签
   *
   * @description 用例的分类标签，用于：
   * - 用例分组和过滤
   * - 监控指标分类
   * - 批量操作
   *
   * @example ['critical', 'high-performance', 'audit-required']
   */
  tags?: string[];

  /**
   * 是否关键用例
   *
   * @description 标识是否为关键业务用例，用于：
   * - 监控优先级设置
   * - 告警策略配置
   * - 性能优化重点
   *
   * @default false
   */
  critical?: boolean;

  /**
   * 是否监控
   *
   * @description 标识是否需要监控，用于：
   * - 性能指标收集
   * - 执行时间统计
   * - 错误率监控
   *
   * @default true
   */
  monitored?: boolean;

  /**
   * 是否缓存
   *
   * @description 标识是否支持缓存，用于：
   * - 查询结果缓存
   * - 性能优化
   * - 缓存策略配置
   *
   * @default false
   */
  cacheable?: boolean;

  /**
   * 缓存TTL
   *
   * @description 缓存生存时间（秒），用于：
   * - 缓存过期策略
   * - 数据一致性保证
   * - 性能优化配置
   *
   * @default 300
   */
  cacheTtl?: number;

  /**
   * 超时配置
   *
   * @description 用例执行超时配置，用于：
   * - 防止长时间阻塞
   * - 资源保护
   * - 用户体验优化
   *
   * @default 30000
   */
  timeout?: number;

  /**
   * 重试配置
   *
   * @description 用例执行重试配置，用于：
   * - 临时故障恢复
   * - 提高系统可靠性
   * - 网络抖动处理
   */
  retry?: {
    /** 最大重试次数 */
    maxAttempts: number;
    /** 重试延迟（毫秒） */
    delay: number;
    /** 重试策略 */
    strategy: "fixed" | "exponential" | "linear";
  };

  /**
   * 事务配置
   *
   * @description 用例事务配置，用于：
   * - 数据一致性保证
   * - 并发控制
   * - 回滚策略
   */
  transaction?: {
    /** 是否启用事务 */
    enabled: boolean;
    /** 事务隔离级别 */
    isolationLevel?:
      | "read-uncommitted"
      | "read-committed"
      | "repeatable-read"
      | "serializable";
    /** 事务超时时间（毫秒） */
    timeout?: number;
  };

  /**
   * 事件配置
   *
   * @description 用例事件配置，用于：
   * - 领域事件发布
   * - 事件溯源
   * - 异步处理
   */
  events?: {
    /** 是否发布事件 */
    publish: boolean;
    /** 事件类型过滤 */
    eventTypes?: string[];
    /** 事件发布策略 */
    strategy?: "immediate" | "deferred" | "batch";
  };

  /**
   * 审计配置
   *
   * @description 用例审计配置，用于：
   * - 操作日志记录
   * - 安全审计
   * - 合规性要求
   */
  audit?: {
    /** 是否记录审计日志 */
    enabled: boolean;
    /** 审计级别 */
    level?: "basic" | "detailed" | "comprehensive";
    /** 审计字段 */
    fields?: string[];
  };

  /**
   * 性能配置
   *
   * @description 用例性能配置，用于：
   * - 性能监控
   * - 资源限制
   * - 优化策略
   */
  performance?: {
    /** 最大执行时间（毫秒） */
    maxExecutionTime?: number;
    /** 内存限制（MB） */
    memoryLimit?: number;
    /** CPU限制（百分比） */
    cpuLimit?: number;
  };

  /**
   * 安全配置
   *
   * @description 用例安全配置，用于：
   * - 安全验证
   * - 权限控制
   * - 数据保护
   */
  security?: {
    /** 是否验证权限 */
    validatePermissions: boolean;
    /** 是否验证租户 */
    validateTenant: boolean;
    /** 是否验证用户 */
    validateUser: boolean;
    /** 数据脱敏配置 */
    dataMasking?: {
      fields: string[];
      strategy: "hash" | "mask" | "remove";
    };
  };
}

/**
 * 用例元数据接口
 */
export interface IUseCaseMetadata {
  /**
   * 用例名称
   */
  name: string;

  /**
   * 用例描述
   */
  description: string;

  /**
   * 用例类型
   */
  type: UseCaseType;

  /**
   * 用例版本
   */
  version: string;

  /**
   * 所需权限
   */
  permissions: string[];

  /**
   * 用例分类
   */
  category?: string;

  /**
   * 用例标签
   */
  tags: string[];

  /**
   * 是否关键用例
   */
  critical: boolean;

  /**
   * 是否监控
   */
  monitored: boolean;

  /**
   * 是否缓存
   */
  cacheable: boolean;

  /**
   * 缓存TTL
   */
  cacheTtl: number;

  /**
   * 超时配置
   */
  timeout: number;

  /**
   * 重试配置
   */
  retry?: {
    maxAttempts: number;
    delay: number;
    strategy: "fixed" | "exponential" | "linear";
  };

  /**
   * 事务配置
   */
  transaction?: {
    enabled: boolean;
    isolationLevel?:
      | "read-uncommitted"
      | "read-committed"
      | "repeatable-read"
      | "serializable";
    timeout?: number;
  };

  /**
   * 事件配置
   */
  events?: {
    publish: boolean;
    eventTypes?: string[];
    strategy?: "immediate" | "deferred" | "batch";
  };

  /**
   * 审计配置
   */
  audit?: {
    enabled: boolean;
    level?: "basic" | "detailed" | "comprehensive";
    fields?: string[];
  };

  /**
   * 性能配置
   */
  performance?: {
    maxExecutionTime?: number;
    memoryLimit?: number;
    cpuLimit?: number;
  };

  /**
   * 安全配置
   */
  security?: {
    validatePermissions: boolean;
    validateTenant: boolean;
    validateUser: boolean;
    dataMasking?: {
      fields: string[];
      strategy: "hash" | "mask" | "remove";
    };
  };
}
