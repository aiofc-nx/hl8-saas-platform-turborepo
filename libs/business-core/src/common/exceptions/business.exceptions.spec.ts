/**
 * 业务异常单元测试
 *
 * @description 测试业务异常的各种场景
 *
 * @since 1.0.0
 */

import { describe, it, expect } from "@jest/globals";
import { EntityId, TenantId } from "@hl8/isolation-model";
import {
  ValidationException,
  ResourceNotFoundException,
  UnauthorizedOperationException,
  BusinessRuleViolationException,
  ResourceAlreadyExistsException,
  DomainExceptionConverter,
} from "./business.exceptions.js";
import {
  DomainExceptionType,
  DomainValidationException,
} from "../../domain/exceptions/base/base-domain-exception.js";

describe("BusinessExceptions", () => {
  describe("ValidationException", () => {
    it("应该正确创建验证异常", () => {
      const exception = new ValidationException(
        "INVALID_EMAIL",
        "邮箱格式无效",
        "请输入有效的邮箱地址",
        400,
        { field: "email", value: "invalid-email" },
      );

      expect(exception).toBeDefined();
      expect(exception.errorCode).toBe("INVALID_EMAIL");
      expect(exception.message).toBe("邮箱格式无效");
      expect(exception.userMessage).toBe("请输入有效的邮箱地址");
      expect(exception.statusCode).toBe(400);
      expect(exception.context).toEqual({
        field: "email",
        value: "invalid-email",
      });
    });

    it("应该提供默认状态码", () => {
      const exception = new ValidationException(
        "INVALID_EMAIL",
        "邮箱格式无效",
        "请输入有效的邮箱地址",
      );

      expect(exception.statusCode).toBe(400);
    });

    it("应该提供默认上下文", () => {
      const exception = new ValidationException(
        "INVALID_EMAIL",
        "邮箱格式无效",
        "请输入有效的邮箱地址",
      );

      expect(exception.context).toEqual({});
    });
  });

  describe("ResourceNotFoundException", () => {
    it("应该正确创建资源未找到异常", () => {
      const exception = new ResourceNotFoundException(
        "USER_NOT_FOUND",
        "用户不存在",
        "指定的用户不存在",
        404,
        { resourceType: "User", resourceId: "123" },
      );

      expect(exception).toBeDefined();
      expect(exception.errorCode).toBe("USER_NOT_FOUND");
      expect(exception.message).toBe("用户不存在");
      expect(exception.userMessage).toBe("指定的用户不存在");
      expect(exception.statusCode).toBe(404);
      expect(exception.context).toEqual({
        resourceType: "User",
        resourceId: "123",
      });
    });

    it("应该提供默认状态码", () => {
      const exception = new ResourceNotFoundException(
        "USER_NOT_FOUND",
        "用户不存在",
        "指定的用户不存在",
      );

      expect(exception.statusCode).toBe(404);
    });
  });

  describe("UnauthorizedOperationException", () => {
    it("应该正确创建未授权操作异常", () => {
      const exception = new UnauthorizedOperationException(
        "user:delete",
        "user123",
      );

      expect(exception).toBeDefined();
      expect(exception.errorCode).toBe("UNAUTHORIZED_OPERATION");
      expect(exception.message).toBe("未授权的操作");
      expect(exception.userMessage).toBe("您没有执行此操作的权限");
      expect(exception.statusCode).toBe(403);
      expect(exception.context).toEqual({
        requiredPermission: "user:delete",
        userId: "user123",
      });
    });

    it("应该处理空的权限参数", () => {
      const exception = new UnauthorizedOperationException("", "user123");

      expect(exception.context.requiredPermission).toBe("");
    });

    it("应该处理空的用户ID参数", () => {
      const exception = new UnauthorizedOperationException("user:delete", "");

      expect(exception.context.userId).toBe("");
    });
  });

  describe("BusinessRuleViolationException", () => {
    it("应该正确创建业务规则违反异常", () => {
      const exception = new BusinessRuleViolationException("用户不能删除自己", {
        rule: "SELF_DELETE_FORBIDDEN",
        userId: "user123",
      });

      expect(exception).toBeDefined();
      expect(exception.errorCode).toBe("BUSINESS_RULE_VIOLATION");
      expect(exception.message).toBe("业务规则违反");
      expect(exception.userMessage).toBe("用户不能删除自己");
      expect(exception.statusCode).toBe(422);
      expect(exception.context).toEqual({
        rule: "SELF_DELETE_FORBIDDEN",
        userId: "user123",
      });
    });

    it("应该提供默认上下文", () => {
      const exception = new BusinessRuleViolationException("用户不能删除自己");

      expect(exception.context).toEqual({});
    });
  });

  describe("ResourceAlreadyExistsException", () => {
    it("应该正确创建资源已存在异常", () => {
      const exception = new ResourceAlreadyExistsException(
        "USER_ALREADY_EXISTS",
        "用户已存在",
        "该邮箱已被注册",
        409,
        { resourceType: "User", resourceId: "user@example.com" },
      );

      expect(exception).toBeDefined();
      expect(exception.errorCode).toBe("USER_ALREADY_EXISTS");
      expect(exception.message).toBe("用户已存在");
      expect(exception.userMessage).toBe("该邮箱已被注册");
      expect(exception.statusCode).toBe(409);
      expect(exception.context).toEqual({
        resourceType: "User",
        resourceId: "user@example.com",
      });
    });

    it("应该提供默认状态码", () => {
      const exception = new ResourceAlreadyExistsException(
        "USER_ALREADY_EXISTS",
        "用户已存在",
        "该邮箱已被注册",
      );

      expect(exception.statusCode).toBe(409);
    });
  });

  describe("DomainExceptionConverter", () => {
    it("应该将业务规则异常转换为应用异常", () => {
      const domainException = new DomainValidationException(
        "BUSINESS_RULE_VIOLATION",
        "用户不能删除自己",
        { rule: "SELF_DELETE_FORBIDDEN", userId: "user123" },
      );
      domainException.errorType = DomainExceptionType.BUSINESS_RULE;

      const appException =
        DomainExceptionConverter.toApplicationException(domainException);

      expect(appException).toBeInstanceOf(BusinessRuleViolationException);
      expect(appException.userMessage).toBe("用户不能删除自己");
      expect(appException.context).toEqual({
        rule: "SELF_DELETE_FORBIDDEN",
        userId: "user123",
      });
    });

    it("应该将验证异常转换为应用异常", () => {
      const domainException = new DomainValidationException(
        "INVALID_EMAIL",
        "邮箱格式无效",
        { field: "email", value: "invalid-email" },
      );
      domainException.errorType = DomainExceptionType.VALIDATION;

      const appException =
        DomainExceptionConverter.toApplicationException(domainException);

      expect(appException).toBeInstanceOf(ValidationException);
      expect(appException.errorCode).toBe("INVALID_EMAIL");
      expect(appException.userMessage).toBe("邮箱格式无效");
      expect(appException.statusCode).toBe(400);
    });

    it("应该将权限异常转换为应用异常", () => {
      const domainException = new DomainValidationException(
        "UNAUTHORIZED_OPERATION",
        "未授权的操作",
        { requiredPermission: "user:delete", userId: "user123" },
      );
      domainException.errorType = DomainExceptionType.PERMISSION;

      const appException =
        DomainExceptionConverter.toApplicationException(domainException);

      expect(appException).toBeInstanceOf(UnauthorizedOperationException);
      expect(appException.context.requiredPermission).toBe("user:delete");
      expect(appException.context.userId).toBe("user123");
    });

    it("应该将未找到异常转换为应用异常", () => {
      const domainException = new DomainValidationException(
        "USER_NOT_FOUND",
        "用户不存在",
        { resourceType: "User", resourceId: "123" },
      );
      domainException.errorType = DomainExceptionType.NOT_FOUND;

      const appException =
        DomainExceptionConverter.toApplicationException(domainException);

      expect(appException).toBeInstanceOf(ResourceNotFoundException);
      expect(appException.errorCode).toBe("USER_NOT_FOUND");
      expect(appException.userMessage).toBe("用户不存在");
      expect(appException.statusCode).toBe(404);
    });

    it("应该将已存在异常转换为应用异常", () => {
      const domainException = new DomainValidationException(
        "USER_ALREADY_EXISTS",
        "用户已存在",
        { resourceType: "User", resourceId: "user@example.com" },
      );
      domainException.errorType = DomainExceptionType.ALREADY_EXISTS;

      const appException =
        DomainExceptionConverter.toApplicationException(domainException);

      expect(appException).toBeInstanceOf(ResourceAlreadyExistsException);
      expect(appException.errorCode).toBe("USER_ALREADY_EXISTS");
      expect(appException.userMessage).toBe("用户已存在");
      expect(appException.statusCode).toBe(409);
    });

    it("应该处理未知异常类型", () => {
      const domainException = new DomainValidationException(
        "UNKNOWN_ERROR",
        "未知错误",
        {},
      );
      domainException.errorType = "UNKNOWN" as any;

      const appException =
        DomainExceptionConverter.toApplicationException(domainException);

      expect(appException).toBeInstanceOf(BusinessRuleViolationException);
      expect(appException.userMessage).toBe("未知错误");
    });
  });

  describe("异常继承关系", () => {
    it("所有业务异常都应该继承自ApplicationException", () => {
      const validationException = new ValidationException("TEST", "测试");
      const resourceNotFoundException = new ResourceNotFoundException(
        "TEST",
        "测试",
      );
      const unauthorizedException = new UnauthorizedOperationException(
        "test",
        "user",
      );
      const businessRuleException = new BusinessRuleViolationException("测试");
      const alreadyExistsException = new ResourceAlreadyExistsException(
        "TEST",
        "测试",
      );

      expect(validationException).toBeInstanceOf(Error);
      expect(resourceNotFoundException).toBeInstanceOf(Error);
      expect(unauthorizedException).toBeInstanceOf(Error);
      expect(businessRuleException).toBeInstanceOf(Error);
      expect(alreadyExistsException).toBeInstanceOf(Error);
    });
  });

  describe("异常序列化", () => {
    it("应该正确序列化异常", () => {
      const exception = new ValidationException(
        "INVALID_EMAIL",
        "邮箱格式无效",
        "请输入有效的邮箱地址",
        400,
        { field: "email", value: "invalid-email" },
      );

      const serialized = JSON.stringify(exception);
      const parsed = JSON.parse(serialized);

      expect(parsed.errorCode).toBe("INVALID_EMAIL");
      expect(parsed.message).toBe("邮箱格式无效");
      expect(parsed.userMessage).toBe("请输入有效的邮箱地址");
      expect(parsed.statusCode).toBe(400);
      expect(parsed.context).toEqual({
        field: "email",
        value: "invalid-email",
      });
    });
  });

  describe("异常堆栈跟踪", () => {
    it("应该保留异常堆栈跟踪", () => {
      const exception = new ValidationException("TEST", "测试");

      expect(exception.stack).toBeDefined();
      expect(exception.stack).toContain("ValidationException");
    });
  });
});
