import { ErrorCodes, ErrorCodeValidator } from "./error-codes.js";

describe("ErrorCodes", () => {
  describe("基础错误代码", () => {
    it("应该定义验证失败错误代码", () => {
      expect(ErrorCodes.VALIDATION_FAILED).toBe("VALIDATION_FAILED");
    });

    it("应该定义业务规则违反错误代码", () => {
      expect(ErrorCodes.BUSINESS_RULE_VIOLATION).toBe(
        "BUSINESS_RULE_VIOLATION",
      );
    });

    it("应该定义实体不存在错误代码", () => {
      expect(ErrorCodes.ENTITY_NOT_FOUND).toBe("ENTITY_NOT_FOUND");
    });

    it("应该定义重复实体错误代码", () => {
      expect(ErrorCodes.DUPLICATE_ENTITY).toBe("DUPLICATE_ENTITY");
    });

    it("应该定义状态转换无效错误代码", () => {
      expect(ErrorCodes.INVALID_STATE_TRANSITION).toBe(
        "INVALID_STATE_TRANSITION",
      );
    });

    it("应该定义权限不足错误代码", () => {
      expect(ErrorCodes.INSUFFICIENT_PERMISSIONS).toBe(
        "INSUFFICIENT_PERMISSIONS",
      );
    });

    it("应该定义操作不允许错误代码", () => {
      expect(ErrorCodes.OPERATION_NOT_ALLOWED).toBe("OPERATION_NOT_ALLOWED");
    });

    it("应该定义数据完整性违反错误代码", () => {
      expect(ErrorCodes.DATA_INTEGRITY_VIOLATION).toBe(
        "DATA_INTEGRITY_VIOLATION",
      );
    });

    it("应该定义并发冲突错误代码", () => {
      expect(ErrorCodes.CONCURRENCY_CONFLICT).toBe("CONCURRENCY_CONFLICT");
    });

    it("应该定义配置错误代码", () => {
      expect(ErrorCodes.CONFIGURATION_ERROR).toBe("CONFIGURATION_ERROR");
    });
  });

  describe("ErrorCodeValidator", () => {
    it("应该验证错误代码是否有效", () => {
      expect(ErrorCodeValidator.isValid("VALIDATION_FAILED")).toBe(true);
      expect(ErrorCodeValidator.isValid("INVALID_CODE")).toBe(false);
    });

    it("应该获取所有错误代码", () => {
      const allCodes = ErrorCodeValidator.getAllCodes();
      expect(allCodes).toContain("VALIDATION_FAILED");
      expect(allCodes).toContain("BUSINESS_RULE_VIOLATION");
      expect(allCodes).toContain("ENTITY_NOT_FOUND");
      expect(allCodes).toContain("DUPLICATE_ENTITY");
      expect(allCodes).toContain("INVALID_STATE_TRANSITION");
      expect(allCodes).toContain("INSUFFICIENT_PERMISSIONS");
      expect(allCodes).toContain("OPERATION_NOT_ALLOWED");
      expect(allCodes).toContain("DATA_INTEGRITY_VIOLATION");
      expect(allCodes).toContain("CONCURRENCY_CONFLICT");
      expect(allCodes).toContain("CONFIGURATION_ERROR");
    });

    it("应该获取错误代码描述", () => {
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.VALIDATION_FAILED),
      ).toBe("验证失败");
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.BUSINESS_RULE_VIOLATION),
      ).toBe("业务规则违反");
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.ENTITY_NOT_FOUND),
      ).toBe("实体不存在");
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.DUPLICATE_ENTITY),
      ).toBe("重复实体");
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.INVALID_STATE_TRANSITION),
      ).toBe("状态转换无效");
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.INSUFFICIENT_PERMISSIONS),
      ).toBe("权限不足");
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.OPERATION_NOT_ALLOWED),
      ).toBe("操作不允许");
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.DATA_INTEGRITY_VIOLATION),
      ).toBe("数据完整性违反");
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.CONCURRENCY_CONFLICT),
      ).toBe("并发冲突");
      expect(
        ErrorCodeValidator.getDescription(ErrorCodes.CONFIGURATION_ERROR),
      ).toBe("配置错误");
    });
  });

  describe("错误代码唯一性", () => {
    it("所有错误代码应该唯一", () => {
      const errorCodeValues = Object.values(ErrorCodes);
      const uniqueValues = new Set(errorCodeValues);
      expect(errorCodeValues.length).toBe(uniqueValues.size);
    });
  });

  describe("错误代码格式", () => {
    it("所有错误代码应该符合命名规范", () => {
      const errorCodeValues = Object.values(ErrorCodes);
      errorCodeValues.forEach((code) => {
        expect(code).toMatch(/^[A-Z_]+$/);
        expect(code.length).toBeGreaterThan(0);
      });
    });
  });

  describe("错误代码分类", () => {
    it("应该包含所有主要错误类别", () => {
      const errorCodeValues = Object.values(ErrorCodes);

      // 验证错误
      expect(errorCodeValues).toContain(ErrorCodes.VALIDATION_FAILED);
      expect(errorCodeValues).toContain(ErrorCodes.BUSINESS_RULE_VIOLATION);

      // 实体错误
      expect(errorCodeValues).toContain(ErrorCodes.ENTITY_NOT_FOUND);
      expect(errorCodeValues).toContain(ErrorCodes.DUPLICATE_ENTITY);

      // 权限错误
      expect(errorCodeValues).toContain(ErrorCodes.INSUFFICIENT_PERMISSIONS);
      expect(errorCodeValues).toContain(ErrorCodes.OPERATION_NOT_ALLOWED);

      // 数据错误
      expect(errorCodeValues).toContain(ErrorCodes.DATA_INTEGRITY_VIOLATION);
      expect(errorCodeValues).toContain(ErrorCodes.CONCURRENCY_CONFLICT);

      // 配置错误
      expect(errorCodeValues).toContain(ErrorCodes.CONFIGURATION_ERROR);
    });
  });
});
