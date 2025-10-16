/**
 * 通用业务异常类
 *
 * @description 业务相关的通用异常类
 * @since 1.0.0
 */

import { ApplicationException } from "./application.exception.js";
import type { BaseDomainException } from "../../domain/exceptions/base/base-domain-exception.js";
import { DomainExceptionType } from "../../domain/exceptions/base/base-domain-exception.js";

/**
 * 领域异常转换器
 *
 * @description 将领域层异常转换为应用层异常的工具类
 */
export class DomainExceptionConverter {
  /**
   * 将领域异常转换为应用异常
   *
   * @param domainException - 领域异常
   * @returns 对应的应用异常
   */
  static toApplicationException(
    domainException: BaseDomainException,
  ): ApplicationException {
    const message = domainException.getUserFriendlyMessage();
    const context = domainException.context;

    switch (domainException.errorType) {
      case DomainExceptionType.BUSINESS_RULE:
        return new BusinessRuleViolationException(message, context);
      case DomainExceptionType.VALIDATION:
        return new ValidationException(
          domainException.errorCode,
          "数据验证失败",
          message,
          400,
          context,
        );
      case DomainExceptionType.PERMISSION:
        return new UnauthorizedOperationException(
          (context.requiredPermission as string) || "未知操作",
          context.userId as string,
        );
      case DomainExceptionType.NOT_FOUND:
        return new ResourceNotFoundException(
          (context.resourceType as string) || "资源",
          (context.resourceId as string) || "未知",
        );
      case DomainExceptionType.STATE:
      case DomainExceptionType.CONCURRENCY:
        return new BusinessRuleViolationException(message, context);
      default:
        return new BusinessRuleViolationException(message, context);
    }
  }
}

/**
 * 验证异常
 *
 * @description 当数据验证失败时抛出
 */
export class ValidationException extends ApplicationException {
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: any,
  ) {
    super(errorCode, title, detail, status, data);
  }
}

/**
 * 未授权操作异常
 *
 * @description 当用户无权限执行操作时抛出
 */
export class UnauthorizedOperationException extends ApplicationException {
  constructor(operation: string, userId?: string) {
    super(
      "UNAUTHORIZED_OPERATION",
      "未授权操作",
      `用户无权限执行操作: ${operation}`,
      403,
      {
        operation,
        userId,
      },
    );
  }
}

/**
 * 业务规则违反异常
 *
 * @description 当违反业务规则时抛出
 */
export class BusinessRuleViolationException extends ApplicationException {
  constructor(rule: string, context?: any) {
    super(
      "BUSINESS_RULE_VIOLATION",
      "业务规则违反",
      `业务规则违反: ${rule}`,
      400,
      {
        rule,
        context,
      },
    );
  }
}

/**
 * 资源未找到异常
 *
 * @description 当请求的资源不存在时抛出
 */
export class ResourceNotFoundException extends ApplicationException {
  constructor(resourceType: string, resourceId: string) {
    super(
      "RESOURCE_NOT_FOUND",
      "资源未找到",
      `资源未找到: ${resourceType} (${resourceId})`,
      404,
      {
        resourceType,
        resourceId,
      },
    );
  }
}

/**
 * 资源已存在异常
 *
 * @description 当尝试创建已存在的资源时抛出
 */
export class ResourceAlreadyExistsException extends ApplicationException {
  constructor(resourceType: string, resourceId: string) {
    super(
      "RESOURCE_ALREADY_EXISTS",
      "资源已存在",
      `资源已存在: ${resourceType} (${resourceId})`,
      409,
      {
        resourceType,
        resourceId,
      },
    );
  }
}

/**
 * 资源状态异常
 *
 * @description 当资源状态不允许执行操作时抛出
 */
export class ResourceStateException extends ApplicationException {
  constructor(
    resourceType: string,
    resourceId: string,
    currentState: string,
    requiredState: string,
  ) {
    super(
      "RESOURCE_STATE_EXCEPTION",
      "资源状态异常",
      `资源状态异常: ${resourceType} (${resourceId}) 当前状态 ${currentState}，需要状态 ${requiredState}`,
      409,
      {
        resourceType,
        resourceId,
        currentState,
        requiredState,
      },
    );
  }
}
