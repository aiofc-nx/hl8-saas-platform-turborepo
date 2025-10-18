/**
 * 错误处理服务
 *
 * @description 提供统一的错误处理、分类、记录和恢复机制
 * 实现"异常优先，日志辅助"的错误处理原则
 *
 * ## 错误处理原则
 *
 * ### 异常优先原则
 * - 所有错误都通过异常机制处理
 * - 异常包含完整的错误上下文信息
 * - 异常提供清晰的错误分类和恢复建议
 *
 * ### 日志辅助原则
 * - 日志记录作为异常处理的辅助手段
 * - 提供详细的错误追踪和调试信息
 * - 支持错误分析和性能监控
 *
 * ### 错误分类原则
 * - 按业务领域和错误类型分类
 * - 提供标准化的错误码和消息
 * - 支持错误的国际化处理
 *
 * @class ErrorHandlingService
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { EntityId } from "@hl8/isolation-model";
import {
  ENTITY_ERROR_CODES,
  USE_CASE_ERROR_CODES,
  TENANT_ERROR_CODES,
} from "../../common/constants/constants.js";

/**
 * 错误严重程度枚举
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = "validation",
  BUSINESS = "business",
  TECHNICAL = "technical",
  SECURITY = "security",
  PERFORMANCE = "performance",
}

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** 请求ID */
  requestId?: string;
  /** 租户ID */
  tenantId?: EntityId;
  /** 用户ID */
  userId?: string;
  /** 操作类型 */
  operation?: string;
  /** 模块名称 */
  module?: string;
  /** 组件名称 */
  component?: string;
  /** 额外元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 标准化错误信息
 */
export interface StandardizedError {
  /** 错误码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 错误类型 */
  type: ErrorType;
  /** 严重程度 */
  severity: ErrorSeverity;
  /** 错误上下文 */
  context: ErrorContext;
  /** 原始错误 */
  originalError?: Error;
  /** 时间戳 */
  timestamp: Date;
  /** 错误ID */
  errorId: string;
}

/**
 * 错误恢复建议
 */
export interface ErrorRecoverySuggestion {
  /** 建议类型 */
  type: "retry" | "fallback" | "escalate" | "ignore";
  /** 建议描述 */
  description: string;
  /** 重试次数 */
  maxRetries?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 回退策略 */
  fallbackStrategy?: string;
}

/**
 * 错误处理服务
 */
@Injectable()
export class ErrorHandlingService {
  constructor(private readonly logger: FastifyLoggerService) {}

  /**
   * 处理并标准化错误
   *
   * @description 将各种错误转换为标准化的错误格式
   * @param error - 原始错误
   * @param context - 错误上下文
   * @returns 标准化错误信息
   */
  handleError(error: Error, context: ErrorContext = {}): StandardizedError {
    const standardizedError = this.standardizeError(error, context);
    this.logError(standardizedError);
    return standardizedError;
  }

  /**
   * 标准化错误信息
   *
   * @param error - 原始错误
   * @param context - 错误上下文
   * @returns 标准化错误
   */
  private standardizeError(
    error: Error,
    context: ErrorContext,
  ): StandardizedError {
    const errorId = this.generateErrorId();
    const timestamp = new Date();

    // 分析错误类型和严重程度
    const { type, severity, code, message } = this.analyzeError(error);

    return {
      code,
      message: message || error.message,
      type,
      severity,
      context,
      originalError: error,
      timestamp,
      errorId,
    };
  }

  /**
   * 分析错误信息
   *
   * @param error - 原始错误
   * @returns 错误分析结果
   */
  private analyzeError(error: Error): {
    type: ErrorType;
    severity: ErrorSeverity;
    code: string;
    message: string;
  } {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // 验证错误
    if (errorName.includes("validation") || errorMessage.includes("invalid")) {
      return {
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        code: ENTITY_ERROR_CODES.VALIDATION_ERROR,
        message: "数据验证失败",
      };
    }

    // 业务错误
    if (errorName.includes("business") || errorMessage.includes("business")) {
      return {
        type: ErrorType.BUSINESS,
        severity: ErrorSeverity.HIGH,
        code: USE_CASE_ERROR_CODES.EXECUTION_ERROR,
        message: "业务规则违反",
      };
    }

    // 安全错误
    if (
      errorName.includes("security") ||
      errorMessage.includes("unauthorized")
    ) {
      return {
        type: ErrorType.SECURITY,
        severity: ErrorSeverity.CRITICAL,
        code: USE_CASE_ERROR_CODES.PERMISSION_ERROR,
        message: "安全访问被拒绝",
      };
    }

    // 技术错误
    if (errorName.includes("database") || errorName.includes("network")) {
      return {
        type: ErrorType.TECHNICAL,
        severity: ErrorSeverity.HIGH,
        code: "TECHNICAL_ERROR",
        message: "技术系统错误",
      };
    }

    // 性能错误
    if (errorName.includes("timeout") || errorMessage.includes("slow")) {
      return {
        type: ErrorType.PERFORMANCE,
        severity: ErrorSeverity.MEDIUM,
        code: "PERFORMANCE_ERROR",
        message: "性能问题",
      };
    }

    // 默认错误
    return {
      type: ErrorType.TECHNICAL,
      severity: ErrorSeverity.MEDIUM,
      code: "UNKNOWN_ERROR",
      message: "未知错误",
    };
  }

  /**
   * 记录错误日志
   *
   * @param error - 标准化错误
   */
  private logError(error: StandardizedError): void {
    const logContext = {
      errorId: error.errorId,
      code: error.code,
      type: error.type,
      severity: error.severity,
      context: error.context,
      stack: error.originalError?.stack,
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        this.logger.error(
          `[CRITICAL] ${error.message}`,
          error.originalError?.stack,
          logContext,
        );
        break;
      case ErrorSeverity.HIGH:
        this.logger.error(
          `[HIGH] ${error.message}`,
          error.originalError?.stack,
          logContext,
        );
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.warn(`[MEDIUM] ${error.message}`, logContext);
        break;
      case ErrorSeverity.LOW:
        this.logger.debug(`[LOW] ${error.message}`, logContext);
        break;
    }
  }

  /**
   * 生成错误恢复建议
   *
   * @param error - 标准化错误
   * @returns 恢复建议
   */
  generateRecoverySuggestion(
    error: StandardizedError,
  ): ErrorRecoverySuggestion {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return {
          type: "retry",
          description: "请检查输入数据并重试",
          maxRetries: 1,
        };

      case ErrorType.BUSINESS:
        return {
          type: "escalate",
          description: "需要业务人员介入处理",
        };

      case ErrorType.TECHNICAL:
        return {
          type: "retry",
          description: "系统临时故障，请稍后重试",
          maxRetries: 3,
          retryDelay: 1000,
        };

      case ErrorType.SECURITY:
        return {
          type: "escalate",
          description: "安全事件，需要立即处理",
        };

      case ErrorType.PERFORMANCE:
        return {
          type: "fallback",
          description: "使用备用服务或降级处理",
          fallbackStrategy: "use_cached_data",
        };

      default:
        return {
          type: "escalate",
          description: "未知错误，需要技术支持",
        };
    }
  }

  /**
   * 检查错误是否可重试
   *
   * @param error - 标准化错误
   * @returns 是否可重试
   */
  isRetryable(error: StandardizedError): boolean {
    const retryableTypes = [ErrorType.TECHNICAL, ErrorType.PERFORMANCE];
    const retryableSeverities = [ErrorSeverity.LOW, ErrorSeverity.MEDIUM];

    return (
      retryableTypes.includes(error.type) &&
      retryableSeverities.includes(error.severity)
    );
  }

  /**
   * 生成错误ID
   *
   * @returns 唯一错误ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建业务异常
   *
   * @param message - 错误消息
   * @param code - 错误码
   * @param context - 错误上下文
   * @returns 业务异常
   */
  createBusinessError(
    message: string,
    code: string = USE_CASE_ERROR_CODES.EXECUTION_ERROR,
    context: ErrorContext = {},
  ): Error {
    const error = new Error(message);
    error.name = "BusinessError";
    return this.handleError(error, context).originalError || error;
  }

  /**
   * 创建验证异常
   *
   * @param message - 错误消息
   * @param code - 错误码
   * @param context - 错误上下文
   * @returns 验证异常
   */
  createValidationError(
    message: string,
    code: string = ENTITY_ERROR_CODES.VALIDATION_ERROR,
    context: ErrorContext = {},
  ): Error {
    const error = new Error(message);
    error.name = "ValidationError";
    return this.handleError(error, context).originalError || error;
  }

  /**
   * 创建权限异常
   *
   * @param message - 错误消息
   * @param code - 错误码
   * @param context - 错误上下文
   * @returns 权限异常
   */
  createPermissionError(
    message: string,
    code: string = USE_CASE_ERROR_CODES.PERMISSION_ERROR,
    context: ErrorContext = {},
  ): Error {
    const error = new Error(message);
    error.name = "PermissionError";
    return this.handleError(error, context).originalError || error;
  }

  /**
   * 创建技术异常
   *
   * @param message - 错误消息
   * @param code - 错误码
   * @param context - 错误上下文
   * @returns 技术异常
   */
  createTechnicalError(
    message: string,
    code: string = "TECHNICAL_ERROR",
    context: ErrorContext = {},
  ): Error {
    const error = new Error(message);
    error.name = "TechnicalError";
    return this.handleError(error, context).originalError || error;
  }
}
