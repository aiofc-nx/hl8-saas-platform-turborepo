/**
 * 领域异常类型枚举测试
 *
 * @description 测试领域异常类型枚举和工具类的功能
 * @since 1.0.0
 */

import {
  DomainExceptionType,
  DomainExceptionTypeUtils,
} from "./domain-exception-type.enum.js";

describe("DomainExceptionType", () => {
  describe("枚举值", () => {
    it("应该包含所有预定义的异常类型", () => {
      expect(DomainExceptionType.BUSINESS_RULE).toBe("business_rule");
      expect(DomainExceptionType.VALIDATION).toBe("validation");
      expect(DomainExceptionType.STATE).toBe("state");
      expect(DomainExceptionType.PERMISSION).toBe("permission");
      expect(DomainExceptionType.CONCURRENCY).toBe("concurrency");
      expect(DomainExceptionType.NOT_FOUND).toBe("not_found");
    });
  });
});

describe("DomainExceptionTypeUtils", () => {
  describe("isBusinessRule", () => {
    it("应该正确识别业务规则异常", () => {
      expect(
        DomainExceptionTypeUtils.isBusinessRule(
          DomainExceptionType.BUSINESS_RULE,
        ),
      ).toBe(true);
      expect(
        DomainExceptionTypeUtils.isBusinessRule(DomainExceptionType.VALIDATION),
      ).toBe(false);
      expect(
        DomainExceptionTypeUtils.isBusinessRule(DomainExceptionType.NOT_FOUND),
      ).toBe(false);
    });
  });

  describe("isValidation", () => {
    it("应该正确识别验证异常", () => {
      expect(
        DomainExceptionTypeUtils.isValidation(DomainExceptionType.VALIDATION),
      ).toBe(true);
      expect(
        DomainExceptionTypeUtils.isValidation(
          DomainExceptionType.BUSINESS_RULE,
        ),
      ).toBe(false);
      expect(
        DomainExceptionTypeUtils.isValidation(DomainExceptionType.NOT_FOUND),
      ).toBe(false);
    });
  });

  describe("isState", () => {
    it("应该正确识别状态异常", () => {
      expect(DomainExceptionTypeUtils.isState(DomainExceptionType.STATE)).toBe(
        true,
      );
      expect(
        DomainExceptionTypeUtils.isState(DomainExceptionType.VALIDATION),
      ).toBe(false);
      expect(
        DomainExceptionTypeUtils.isState(DomainExceptionType.NOT_FOUND),
      ).toBe(false);
    });
  });

  describe("isPermission", () => {
    it("应该正确识别权限异常", () => {
      expect(
        DomainExceptionTypeUtils.isPermission(DomainExceptionType.PERMISSION),
      ).toBe(true);
      expect(
        DomainExceptionTypeUtils.isPermission(DomainExceptionType.VALIDATION),
      ).toBe(false);
      expect(
        DomainExceptionTypeUtils.isPermission(DomainExceptionType.NOT_FOUND),
      ).toBe(false);
    });
  });

  describe("isConcurrency", () => {
    it("应该正确识别并发异常", () => {
      expect(
        DomainExceptionTypeUtils.isConcurrency(DomainExceptionType.CONCURRENCY),
      ).toBe(true);
      expect(
        DomainExceptionTypeUtils.isConcurrency(DomainExceptionType.VALIDATION),
      ).toBe(false);
      expect(
        DomainExceptionTypeUtils.isConcurrency(DomainExceptionType.NOT_FOUND),
      ).toBe(false);
    });
  });

  describe("isNotFound", () => {
    it("应该正确识别未找到异常", () => {
      expect(
        DomainExceptionTypeUtils.isNotFound(DomainExceptionType.NOT_FOUND),
      ).toBe(true);
      expect(
        DomainExceptionTypeUtils.isNotFound(DomainExceptionType.VALIDATION),
      ).toBe(false);
      expect(
        DomainExceptionTypeUtils.isNotFound(DomainExceptionType.BUSINESS_RULE),
      ).toBe(false);
    });
  });

  describe("getDescription", () => {
    it("应该返回正确的中文描述", () => {
      expect(
        DomainExceptionTypeUtils.getDescription(
          DomainExceptionType.BUSINESS_RULE,
        ),
      ).toBe("业务规则异常");
      expect(
        DomainExceptionTypeUtils.getDescription(DomainExceptionType.VALIDATION),
      ).toBe("验证异常");
      expect(
        DomainExceptionTypeUtils.getDescription(DomainExceptionType.STATE),
      ).toBe("状态异常");
      expect(
        DomainExceptionTypeUtils.getDescription(DomainExceptionType.PERMISSION),
      ).toBe("权限异常");
      expect(
        DomainExceptionTypeUtils.getDescription(
          DomainExceptionType.CONCURRENCY,
        ),
      ).toBe("并发异常");
      expect(
        DomainExceptionTypeUtils.getDescription(DomainExceptionType.NOT_FOUND),
      ).toBe("未找到异常");
    });
  });

  describe("getAllTypes", () => {
    it("应该返回所有异常类型", () => {
      const allTypes = DomainExceptionTypeUtils.getAllTypes();
      expect(allTypes).toHaveLength(6);
      expect(allTypes).toContain(DomainExceptionType.BUSINESS_RULE);
      expect(allTypes).toContain(DomainExceptionType.VALIDATION);
      expect(allTypes).toContain(DomainExceptionType.STATE);
      expect(allTypes).toContain(DomainExceptionType.PERMISSION);
      expect(allTypes).toContain(DomainExceptionType.CONCURRENCY);
      expect(allTypes).toContain(DomainExceptionType.NOT_FOUND);
    });
  });

  describe("getBusinessTypes", () => {
    it("应该返回业务异常类型", () => {
      const businessTypes = DomainExceptionTypeUtils.getBusinessTypes();
      expect(businessTypes).toHaveLength(4);
      expect(businessTypes).toContain(DomainExceptionType.BUSINESS_RULE);
      expect(businessTypes).toContain(DomainExceptionType.VALIDATION);
      expect(businessTypes).toContain(DomainExceptionType.STATE);
      expect(businessTypes).toContain(DomainExceptionType.PERMISSION);
      expect(businessTypes).not.toContain(DomainExceptionType.CONCURRENCY);
      expect(businessTypes).not.toContain(DomainExceptionType.NOT_FOUND);
    });
  });

  describe("getTechnicalTypes", () => {
    it("应该返回技术异常类型", () => {
      const technicalTypes = DomainExceptionTypeUtils.getTechnicalTypes();
      expect(technicalTypes).toHaveLength(2);
      expect(technicalTypes).toContain(DomainExceptionType.CONCURRENCY);
      expect(technicalTypes).toContain(DomainExceptionType.NOT_FOUND);
      expect(technicalTypes).not.toContain(DomainExceptionType.BUSINESS_RULE);
      expect(technicalTypes).not.toContain(DomainExceptionType.VALIDATION);
    });
  });
});
