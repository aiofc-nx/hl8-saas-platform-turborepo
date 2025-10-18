import { ErrorCodes } from "./error-codes.js";

describe("ErrorCodes", () => {
  describe("验证错误", () => {
    it("应该定义验证失败错误代码", () => {
      expect(ErrorCodes.VALIDATION_FAILED).toBe("VALIDATION_FAILED");
    });

    it("应该定义业务规则违反错误代码", () => {
      expect(ErrorCodes.BUSINESS_RULE_VIOLATION).toBe(
        "BUSINESS_RULE_VIOLATION",
      );
    });

    it("应该定义数据完整性错误代码", () => {
      expect(ErrorCodes.DATA_INTEGRITY_VIOLATION).toBe(
        "DATA_INTEGRITY_VIOLATION",
      );
    });
  });

  describe("认证错误", () => {
    it("应该定义认证失败错误代码", () => {
      expect(ErrorCodes.AUTHENTICATION_FAILED).toBe("AUTHENTICATION_FAILED");
    });

    it("应该定义授权失败错误代码", () => {
      expect(ErrorCodes.AUTHORIZATION_FAILED).toBe("AUTHORIZATION_FAILED");
    });

    it("应该定义令牌无效错误代码", () => {
      expect(ErrorCodes.INVALID_TOKEN).toBe("INVALID_TOKEN");
    });

    it("应该定义令牌过期错误代码", () => {
      expect(ErrorCodes.TOKEN_EXPIRED).toBe("TOKEN_EXPIRED");
    });
  });

  describe("资源错误", () => {
    it("应该定义资源未找到错误代码", () => {
      expect(ErrorCodes.RESOURCE_NOT_FOUND).toBe("RESOURCE_NOT_FOUND");
    });

    it("应该定义资源已存在错误代码", () => {
      expect(ErrorCodes.RESOURCE_ALREADY_EXISTS).toBe(
        "RESOURCE_ALREADY_EXISTS",
      );
    });

    it("应该定义资源冲突错误代码", () => {
      expect(ErrorCodes.RESOURCE_CONFLICT).toBe("RESOURCE_CONFLICT");
    });
  });

  describe("租户错误", () => {
    it("应该定义租户未找到错误代码", () => {
      expect(ErrorCodes.TENANT_NOT_FOUND).toBe("TENANT_NOT_FOUND");
    });

    it("应该定义租户已存在错误代码", () => {
      expect(ErrorCodes.TENANT_ALREADY_EXISTS).toBe("TENANT_ALREADY_EXISTS");
    });

    it("应该定义租户已停用错误代码", () => {
      expect(ErrorCodes.TENANT_DEACTIVATED).toBe("TENANT_DEACTIVATED");
    });

    it("应该定义租户配额超限错误代码", () => {
      expect(ErrorCodes.TENANT_QUOTA_EXCEEDED).toBe("TENANT_QUOTA_EXCEEDED");
    });
  });

  describe("组织错误", () => {
    it("应该定义组织未找到错误代码", () => {
      expect(ErrorCodes.ORGANIZATION_NOT_FOUND).toBe("ORGANIZATION_NOT_FOUND");
    });

    it("应该定义组织已存在错误代码", () => {
      expect(ErrorCodes.ORGANIZATION_ALREADY_EXISTS).toBe(
        "ORGANIZATION_ALREADY_EXISTS",
      );
    });

    it("应该定义组织层级超限错误代码", () => {
      expect(ErrorCodes.ORGANIZATION_LEVEL_EXCEEDED).toBe(
        "ORGANIZATION_LEVEL_EXCEEDED",
      );
    });
  });

  describe("部门错误", () => {
    it("应该定义部门未找到错误代码", () => {
      expect(ErrorCodes.DEPARTMENT_NOT_FOUND).toBe("DEPARTMENT_NOT_FOUND");
    });

    it("应该定义部门已存在错误代码", () => {
      expect(ErrorCodes.DEPARTMENT_ALREADY_EXISTS).toBe(
        "DEPARTMENT_ALREADY_EXISTS",
      );
    });

    it("应该定义部门层级超限错误代码", () => {
      expect(ErrorCodes.DEPARTMENT_LEVEL_EXCEEDED).toBe(
        "DEPARTMENT_LEVEL_EXCEEDED",
      );
    });

    it("应该定义部门循环引用错误代码", () => {
      expect(ErrorCodes.DEPARTMENT_CIRCULAR_REFERENCE).toBe(
        "DEPARTMENT_CIRCULAR_REFERENCE",
      );
    });
  });

  describe("用户错误", () => {
    it("应该定义用户未找到错误代码", () => {
      expect(ErrorCodes.USER_NOT_FOUND).toBe("USER_NOT_FOUND");
    });

    it("应该定义用户已存在错误代码", () => {
      expect(ErrorCodes.USER_ALREADY_EXISTS).toBe("USER_ALREADY_EXISTS");
    });

    it("应该定义用户已停用错误代码", () => {
      expect(ErrorCodes.USER_DEACTIVATED).toBe("USER_DEACTIVATED");
    });

    it("应该定义用户邮箱已存在错误代码", () => {
      expect(ErrorCodes.USER_EMAIL_ALREADY_EXISTS).toBe(
        "USER_EMAIL_ALREADY_EXISTS",
      );
    });

    it("应该定义用户名已存在错误代码", () => {
      expect(ErrorCodes.USER_USERNAME_ALREADY_EXISTS).toBe(
        "USER_USERNAME_ALREADY_EXISTS",
      );
    });
  });

  describe("角色错误", () => {
    it("应该定义角色未找到错误代码", () => {
      expect(ErrorCodes.ROLE_NOT_FOUND).toBe("ROLE_NOT_FOUND");
    });

    it("应该定义角色已存在错误代码", () => {
      expect(ErrorCodes.ROLE_ALREADY_EXISTS).toBe("ROLE_ALREADY_EXISTS");
    });

    it("应该定义角色权限不足错误代码", () => {
      expect(ErrorCodes.ROLE_PERMISSION_DENIED).toBe("ROLE_PERMISSION_DENIED");
    });
  });

  describe("权限错误", () => {
    it("应该定义权限未找到错误代码", () => {
      expect(ErrorCodes.PERMISSION_NOT_FOUND).toBe("PERMISSION_NOT_FOUND");
    });

    it("应该定义权限已存在错误代码", () => {
      expect(ErrorCodes.PERMISSION_ALREADY_EXISTS).toBe(
        "PERMISSION_ALREADY_EXISTS",
      );
    });

    it("应该定义权限不足错误代码", () => {
      expect(ErrorCodes.PERMISSION_DENIED).toBe("PERMISSION_DENIED");
    });
  });

  describe("系统错误", () => {
    it("应该定义系统错误代码", () => {
      expect(ErrorCodes.SYSTEM_ERROR).toBe("SYSTEM_ERROR");
    });

    it("应该定义数据库错误代码", () => {
      expect(ErrorCodes.DATABASE_ERROR).toBe("DATABASE_ERROR");
    });

    it("应该定义网络错误代码", () => {
      expect(ErrorCodes.NETWORK_ERROR).toBe("NETWORK_ERROR");
    });

    it("应该定义配置错误代码", () => {
      expect(ErrorCodes.CONFIGURATION_ERROR).toBe("CONFIGURATION_ERROR");
    });
  });

  describe("外部服务错误", () => {
    it("应该定义外部服务错误代码", () => {
      expect(ErrorCodes.EXTERNAL_SERVICE_ERROR).toBe("EXTERNAL_SERVICE_ERROR");
    });

    it("应该定义外部服务超时错误代码", () => {
      expect(ErrorCodes.EXTERNAL_SERVICE_TIMEOUT).toBe(
        "EXTERNAL_SERVICE_TIMEOUT",
      );
    });

    it("应该定义外部服务不可用错误代码", () => {
      expect(ErrorCodes.EXTERNAL_SERVICE_UNAVAILABLE).toBe(
        "EXTERNAL_SERVICE_UNAVAILABLE",
      );
    });
  });

  describe("并发错误", () => {
    it("应该定义并发冲突错误代码", () => {
      expect(ErrorCodes.CONCURRENCY_CONFLICT).toBe("CONCURRENCY_CONFLICT");
    });

    it("应该定义乐观锁失败错误代码", () => {
      expect(ErrorCodes.OPTIMISTIC_LOCK_FAILED).toBe("OPTIMISTIC_LOCK_FAILED");
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

      // 认证错误
      expect(errorCodeValues).toContain(ErrorCodes.AUTHENTICATION_FAILED);
      expect(errorCodeValues).toContain(ErrorCodes.AUTHORIZATION_FAILED);

      // 资源错误
      expect(errorCodeValues).toContain(ErrorCodes.RESOURCE_NOT_FOUND);
      expect(errorCodeValues).toContain(ErrorCodes.RESOURCE_ALREADY_EXISTS);

      // 系统错误
      expect(errorCodeValues).toContain(ErrorCodes.SYSTEM_ERROR);
      expect(errorCodeValues).toContain(ErrorCodes.DATABASE_ERROR);
    });
  });
});
