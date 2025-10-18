import { BusinessRules } from "./business-rules.js";

describe("BusinessRules", () => {
  describe("名称长度限制", () => {
    it("应该定义最大名称长度", () => {
      expect(BusinessRules.MAX_NAME_LENGTH).toBe(100);
    });

    it("应该定义最小名称长度", () => {
      expect(BusinessRules.MIN_NAME_LENGTH).toBe(1);
    });
  });

  describe("描述长度限制", () => {
    it("应该定义最大描述长度", () => {
      expect(BusinessRules.MAX_DESCRIPTION_LENGTH).toBe(500);
    });

    it("应该定义最小描述长度", () => {
      expect(BusinessRules.MIN_DESCRIPTION_LENGTH).toBe(0);
    });
  });

  describe("密码规则", () => {
    it("应该定义密码最小长度", () => {
      expect(BusinessRules.PASSWORD_MIN_LENGTH).toBe(8);
    });

    it("应该定义密码最大长度", () => {
      expect(BusinessRules.PASSWORD_MAX_LENGTH).toBe(128);
    });

    it("应该定义密码复杂度要求", () => {
      expect(BusinessRules.PASSWORD_REQUIRE_UPPERCASE).toBe(true);
      expect(BusinessRules.PASSWORD_REQUIRE_LOWERCASE).toBe(true);
      expect(BusinessRules.PASSWORD_REQUIRE_NUMBERS).toBe(true);
      expect(BusinessRules.PASSWORD_REQUIRE_SPECIAL_CHARS).toBe(true);
    });
  });

  describe("邮箱规则", () => {
    it("应该定义邮箱最大长度", () => {
      expect(BusinessRules.EMAIL_MAX_LENGTH).toBe(254);
    });

    it("应该定义邮箱最小长度", () => {
      expect(BusinessRules.EMAIL_MIN_LENGTH).toBe(5);
    });
  });

  describe("用户名规则", () => {
    it("应该定义用户名最大长度", () => {
      expect(BusinessRules.USERNAME_MAX_LENGTH).toBe(50);
    });

    it("应该定义用户名最小长度", () => {
      expect(BusinessRules.USERNAME_MIN_LENGTH).toBe(3);
    });
  });

  describe("层级规则", () => {
    it("应该定义部门最大层级", () => {
      expect(BusinessRules.DEPARTMENT_MAX_LEVEL).toBe(8);
    });

    it("应该定义组织最大层级", () => {
      expect(BusinessRules.ORGANIZATION_MAX_LEVEL).toBe(5);
    });

    it("应该定义租户最大层级", () => {
      expect(BusinessRules.TENANT_MAX_LEVEL).toBe(3);
    });
  });

  describe("配额规则", () => {
    it("应该定义默认用户配额", () => {
      expect(BusinessRules.DEFAULT_USER_QUOTA).toBe(100);
    });

    it("应该定义默认部门配额", () => {
      expect(BusinessRules.DEFAULT_DEPARTMENT_QUOTA).toBe(50);
    });

    it("应该定义默认组织配额", () => {
      expect(BusinessRules.DEFAULT_ORGANIZATION_QUOTA).toBe(20);
    });
  });

  describe("时间规则", () => {
    it("应该定义会话超时时间", () => {
      expect(BusinessRules.SESSION_TIMEOUT_MINUTES).toBe(30);
    });

    it("应该定义令牌过期时间", () => {
      expect(BusinessRules.TOKEN_EXPIRY_HOURS).toBe(24);
    });

    it("应该定义密码重置过期时间", () => {
      expect(BusinessRules.PASSWORD_RESET_EXPIRY_HOURS).toBe(1);
    });
  });

  describe("重试规则", () => {
    it("应该定义最大重试次数", () => {
      expect(BusinessRules.MAX_RETRY_ATTEMPTS).toBe(3);
    });

    it("应该定义重试间隔", () => {
      expect(BusinessRules.RETRY_DELAY_MS).toBe(1000);
    });
  });

  describe("缓存规则", () => {
    it("应该定义默认缓存时间", () => {
      expect(BusinessRules.DEFAULT_CACHE_TTL_SECONDS).toBe(300);
    });

    it("应该定义最大缓存时间", () => {
      expect(BusinessRules.MAX_CACHE_TTL_SECONDS).toBe(3600);
    });
  });

  describe("分页规则", () => {
    it("应该定义默认页面大小", () => {
      expect(BusinessRules.DEFAULT_PAGE_SIZE).toBe(20);
    });

    it("应该定义最大页面大小", () => {
      expect(BusinessRules.MAX_PAGE_SIZE).toBe(100);
    });

    it("应该定义最小页面大小", () => {
      expect(BusinessRules.MIN_PAGE_SIZE).toBe(1);
    });
  });

  describe("文件规则", () => {
    it("应该定义最大文件大小", () => {
      expect(BusinessRules.MAX_FILE_SIZE_MB).toBe(10);
    });

    it("应该定义允许的文件类型", () => {
      expect(BusinessRules.ALLOWED_FILE_TYPES).toEqual([
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "text/plain",
      ]);
    });
  });

  describe("验证规则", () => {
    it("应该定义邮箱验证正则", () => {
      expect(BusinessRules.EMAIL_REGEX).toBeInstanceOf(RegExp);
      expect(BusinessRules.EMAIL_REGEX.test("test@example.com")).toBe(true);
      expect(BusinessRules.EMAIL_REGEX.test("invalid-email")).toBe(false);
    });

    it("应该定义用户名验证正则", () => {
      expect(BusinessRules.USERNAME_REGEX).toBeInstanceOf(RegExp);
      expect(BusinessRules.USERNAME_REGEX.test("validuser123")).toBe(true);
      expect(BusinessRules.USERNAME_REGEX.test("invalid@user")).toBe(false);
    });

    it("应该定义密码验证正则", () => {
      expect(BusinessRules.PASSWORD_REGEX).toBeInstanceOf(RegExp);
      expect(BusinessRules.PASSWORD_REGEX.test("ValidPass123!")).toBe(true);
      expect(BusinessRules.PASSWORD_REGEX.test("weak")).toBe(false);
    });
  });

  describe("业务逻辑规则", () => {
    it("应该定义租户类型限制", () => {
      expect(BusinessRules.ALLOWED_TENANT_TYPES).toEqual([
        "ENTERPRISE",
        "COMMUNITY",
        "TEAM",
        "PERSONAL",
      ]);
    });

    it("应该定义组织类型限制", () => {
      expect(BusinessRules.ALLOWED_ORGANIZATION_TYPES).toEqual([
        "COMPANY",
        "DEPARTMENT",
        "TEAM",
        "PROJECT",
      ]);
    });

    it("应该定义用户状态限制", () => {
      expect(BusinessRules.ALLOWED_USER_STATUSES).toEqual([
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED",
        "PENDING",
      ]);
    });
  });

  describe("常量验证", () => {
    it("所有数值常量应该为正数", () => {
      const numericConstants = [
        BusinessRules.MAX_NAME_LENGTH,
        BusinessRules.MIN_NAME_LENGTH,
        BusinessRules.MAX_DESCRIPTION_LENGTH,
        BusinessRules.PASSWORD_MIN_LENGTH,
        BusinessRules.PASSWORD_MAX_LENGTH,
        BusinessRules.EMAIL_MAX_LENGTH,
        BusinessRules.EMAIL_MIN_LENGTH,
        BusinessRules.USERNAME_MAX_LENGTH,
        BusinessRules.USERNAME_MIN_LENGTH,
        BusinessRules.DEPARTMENT_MAX_LEVEL,
        BusinessRules.ORGANIZATION_MAX_LEVEL,
        BusinessRules.TENANT_MAX_LEVEL,
        BusinessRules.DEFAULT_USER_QUOTA,
        BusinessRules.DEFAULT_DEPARTMENT_QUOTA,
        BusinessRules.DEFAULT_ORGANIZATION_QUOTA,
        BusinessRules.SESSION_TIMEOUT_MINUTES,
        BusinessRules.TOKEN_EXPIRY_HOURS,
        BusinessRules.PASSWORD_RESET_EXPIRY_HOURS,
        BusinessRules.MAX_RETRY_ATTEMPTS,
        BusinessRules.RETRY_DELAY_MS,
        BusinessRules.DEFAULT_CACHE_TTL_SECONDS,
        BusinessRules.MAX_CACHE_TTL_SECONDS,
        BusinessRules.DEFAULT_PAGE_SIZE,
        BusinessRules.MAX_PAGE_SIZE,
        BusinessRules.MIN_PAGE_SIZE,
        BusinessRules.MAX_FILE_SIZE_MB,
      ];

      numericConstants.forEach((value) => {
        expect(value).toBeGreaterThan(0);
      });
    });

    it("长度限制应该合理", () => {
      expect(BusinessRules.MAX_NAME_LENGTH).toBeGreaterThan(
        BusinessRules.MIN_NAME_LENGTH,
      );
      expect(BusinessRules.MAX_DESCRIPTION_LENGTH).toBeGreaterThan(
        BusinessRules.MIN_DESCRIPTION_LENGTH,
      );
      expect(BusinessRules.PASSWORD_MAX_LENGTH).toBeGreaterThan(
        BusinessRules.PASSWORD_MIN_LENGTH,
      );
      expect(BusinessRules.EMAIL_MAX_LENGTH).toBeGreaterThan(
        BusinessRules.EMAIL_MIN_LENGTH,
      );
      expect(BusinessRules.USERNAME_MAX_LENGTH).toBeGreaterThan(
        BusinessRules.USERNAME_MIN_LENGTH,
      );
    });

    it("配额限制应该合理", () => {
      expect(BusinessRules.DEFAULT_USER_QUOTA).toBeGreaterThan(0);
      expect(BusinessRules.DEFAULT_DEPARTMENT_QUOTA).toBeGreaterThan(0);
      expect(BusinessRules.DEFAULT_ORGANIZATION_QUOTA).toBeGreaterThan(0);
    });

    it("时间限制应该合理", () => {
      expect(BusinessRules.SESSION_TIMEOUT_MINUTES).toBeGreaterThan(0);
      expect(BusinessRules.TOKEN_EXPIRY_HOURS).toBeGreaterThan(0);
      expect(BusinessRules.PASSWORD_RESET_EXPIRY_HOURS).toBeGreaterThan(0);
    });
  });
});
