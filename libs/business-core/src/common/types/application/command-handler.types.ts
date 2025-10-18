/**
 * 命令处理器选项接口
 */
export interface ICommandHandlerOptions {
  /**
   * 处理器描述
   */
  description?: string;

  /**
   * 处理器版本
   */
  version?: string;

  /**
   * 所需权限
   */
  requiredPermissions?: string[];

  /**
   * 处理器分类
   */
  category?: string;

  /**
   * 处理器标签
   */
  tags?: string[];

  /**
   * 是否需要事务
   */
  requiresTransaction?: boolean;

  /**
   * 超时配置
   */
  timeout?: {
    execution: number;
    alertOnTimeout?: boolean;
  };

  /**
   * 重试配置
   */
  retry?: {
    maxAttempts: number;
    backoffStrategy: "fixed" | "exponential" | "linear";
    baseDelay: number;
  };

  /**
   * 缓存配置
   */
  cache?: {
    enabled: boolean;
    ttl: number;
    keyPrefix: string;
  };

  /**
   * 监控配置
   */
  monitoring?: {
    enabled: boolean;
    slowThreshold: number;
    errorThreshold: number;
  };
}
