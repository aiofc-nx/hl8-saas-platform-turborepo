import { BusinessRules, BusinessRuleValidator } from "./business-rules.js";

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
      expect(BusinessRules.MIN_DESCRIPTION_LENGTH).toBe(1);
    });
  });

  describe("邮箱长度限制", () => {
    it("应该定义邮箱最大长度", () => {
      expect(BusinessRules.MAX_EMAIL_LENGTH).toBe(254);
    });

    it("应该定义邮箱最小长度", () => {
      expect(BusinessRules.MIN_EMAIL_LENGTH).toBe(5);
    });
  });

  describe("电话号码长度限制", () => {
    it("应该定义电话号码最大长度", () => {
      expect(BusinessRules.MAX_PHONE_LENGTH).toBe(16);
    });

    it("应该定义电话号码最小长度", () => {
      expect(BusinessRules.MIN_PHONE_LENGTH).toBe(8);
    });
  });

  describe("密码长度限制", () => {
    it("应该定义密码最小长度", () => {
      expect(BusinessRules.MIN_PASSWORD_LENGTH).toBe(8);
    });

    it("应该定义密码最大长度", () => {
      expect(BusinessRules.MAX_PASSWORD_LENGTH).toBe(128);
    });
  });

  describe("组织层级限制", () => {
    it("应该定义组织最大层级", () => {
      expect(BusinessRules.MAX_ORGANIZATION_LEVEL).toBe(10);
    });

    it("应该定义组织最小层级", () => {
      expect(BusinessRules.MIN_ORGANIZATION_LEVEL).toBe(1);
    });
  });

  describe("部门层级限制", () => {
    it("应该定义部门最大层级", () => {
      expect(BusinessRules.MAX_DEPARTMENT_LEVEL).toBe(5);
    });

    it("应该定义部门最小层级", () => {
      expect(BusinessRules.MIN_DEPARTMENT_LEVEL).toBe(1);
    });
  });

  describe("用户配额限制", () => {
    it("应该定义每个租户最大用户数", () => {
      expect(BusinessRules.MAX_USERS_PER_TENANT).toBe(10000);
    });

    it("应该定义每个租户最大组织数", () => {
      expect(BusinessRules.MAX_ORGANIZATIONS_PER_TENANT).toBe(100);
    });
  });

  describe("权限级别限制", () => {
    it("应该定义最大权限级别", () => {
      expect(BusinessRules.MAX_PERMISSION_LEVEL).toBe(10);
    });

    it("应该定义最小权限级别", () => {
      expect(BusinessRules.MIN_PERMISSION_LEVEL).toBe(1);
    });
  });

  describe("角色数量限制", () => {
    it("应该定义每个用户最大角色数", () => {
      expect(BusinessRules.MAX_ROLES_PER_USER).toBe(10);
    });

    it("应该定义每个角色最大权限数", () => {
      expect(BusinessRules.MAX_PERMISSIONS_PER_ROLE).toBe(100);
    });
  });

  describe("事件数量限制", () => {
    it("应该定义每个聚合根最大事件数", () => {
      expect(BusinessRules.MAX_EVENTS_PER_AGGREGATE).toBe(1000);
    });
  });

  describe("审计信息长度限制", () => {
    it("应该定义最大审计原因长度", () => {
      expect(BusinessRules.MAX_AUDIT_REASON_LENGTH).toBe(200);
    });

    it("应该定义最大审计操作长度", () => {
      expect(BusinessRules.MAX_AUDIT_OPERATION_LENGTH).toBe(50);
    });
  });

  describe("BusinessRuleValidator", () => {
    it("应该验证名称长度", () => {
      expect(BusinessRuleValidator.validateNameLength("测试名称")).toBe(true);
      expect(BusinessRuleValidator.validateNameLength("")).toBe(false);
      expect(BusinessRuleValidator.validateNameLength("a".repeat(101))).toBe(
        false,
      );
    });

    it("应该验证邮箱长度", () => {
      expect(
        BusinessRuleValidator.validateEmailLength("test@example.com"),
      ).toBe(true);
      expect(BusinessRuleValidator.validateEmailLength("a@b")).toBe(false);
      expect(BusinessRuleValidator.validateEmailLength("a".repeat(255))).toBe(
        false,
      );
    });

    it("应该验证电话号码长度", () => {
      expect(BusinessRuleValidator.validatePhoneLength("13800138000")).toBe(
        true,
      );
      expect(BusinessRuleValidator.validatePhoneLength("123")).toBe(false);
      expect(BusinessRuleValidator.validatePhoneLength("1".repeat(17))).toBe(
        false,
      );
    });

    it("应该验证密码长度", () => {
      expect(BusinessRuleValidator.validatePasswordLength("password123")).toBe(
        true,
      );
      expect(BusinessRuleValidator.validatePasswordLength("123")).toBe(false);
      expect(
        BusinessRuleValidator.validatePasswordLength("a".repeat(129)),
      ).toBe(false);
    });

    it("应该验证组织层级", () => {
      expect(BusinessRuleValidator.validateOrganizationLevel(5)).toBe(true);
      expect(BusinessRuleValidator.validateOrganizationLevel(0)).toBe(false);
      expect(BusinessRuleValidator.validateOrganizationLevel(11)).toBe(false);
    });

    it("应该验证部门层级", () => {
      expect(BusinessRuleValidator.validateDepartmentLevel(3)).toBe(true);
      expect(BusinessRuleValidator.validateDepartmentLevel(0)).toBe(false);
      expect(BusinessRuleValidator.validateDepartmentLevel(6)).toBe(false);
    });

    it("应该验证权限级别", () => {
      expect(BusinessRuleValidator.validatePermissionLevel(5)).toBe(true);
      expect(BusinessRuleValidator.validatePermissionLevel(0)).toBe(false);
      expect(BusinessRuleValidator.validatePermissionLevel(11)).toBe(false);
    });
  });

  describe("常量验证", () => {
    it("所有数值常量应该为正数", () => {
      const numericConstants = [
        BusinessRules.MAX_NAME_LENGTH,
        BusinessRules.MIN_NAME_LENGTH,
        BusinessRules.MAX_DESCRIPTION_LENGTH,
        BusinessRules.MIN_DESCRIPTION_LENGTH,
        BusinessRules.MAX_EMAIL_LENGTH,
        BusinessRules.MIN_EMAIL_LENGTH,
        BusinessRules.MAX_PHONE_LENGTH,
        BusinessRules.MIN_PHONE_LENGTH,
        BusinessRules.MIN_PASSWORD_LENGTH,
        BusinessRules.MAX_PASSWORD_LENGTH,
        BusinessRules.MAX_ORGANIZATION_LEVEL,
        BusinessRules.MIN_ORGANIZATION_LEVEL,
        BusinessRules.MAX_DEPARTMENT_LEVEL,
        BusinessRules.MIN_DEPARTMENT_LEVEL,
        BusinessRules.MAX_USERS_PER_TENANT,
        BusinessRules.MAX_ORGANIZATIONS_PER_TENANT,
        BusinessRules.MAX_PERMISSION_LEVEL,
        BusinessRules.MIN_PERMISSION_LEVEL,
        BusinessRules.MAX_ROLES_PER_USER,
        BusinessRules.MAX_PERMISSIONS_PER_ROLE,
        BusinessRules.MAX_EVENTS_PER_AGGREGATE,
        BusinessRules.MAX_AUDIT_REASON_LENGTH,
        BusinessRules.MAX_AUDIT_OPERATION_LENGTH,
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
      expect(BusinessRules.MAX_EMAIL_LENGTH).toBeGreaterThan(
        BusinessRules.MIN_EMAIL_LENGTH,
      );
      expect(BusinessRules.MAX_PHONE_LENGTH).toBeGreaterThan(
        BusinessRules.MIN_PHONE_LENGTH,
      );
      expect(BusinessRules.MAX_PASSWORD_LENGTH).toBeGreaterThan(
        BusinessRules.MIN_PASSWORD_LENGTH,
      );
    });

    it("层级限制应该合理", () => {
      expect(BusinessRules.MAX_ORGANIZATION_LEVEL).toBeGreaterThan(
        BusinessRules.MIN_ORGANIZATION_LEVEL,
      );
      expect(BusinessRules.MAX_DEPARTMENT_LEVEL).toBeGreaterThan(
        BusinessRules.MIN_DEPARTMENT_LEVEL,
      );
      expect(BusinessRules.MAX_PERMISSION_LEVEL).toBeGreaterThan(
        BusinessRules.MIN_PERMISSION_LEVEL,
      );
    });

    it("配额限制应该合理", () => {
      expect(BusinessRules.MAX_USERS_PER_TENANT).toBeGreaterThan(0);
      expect(BusinessRules.MAX_ORGANIZATIONS_PER_TENANT).toBeGreaterThan(0);
      expect(BusinessRules.MAX_ROLES_PER_USER).toBeGreaterThan(0);
      expect(BusinessRules.MAX_PERMISSIONS_PER_ROLE).toBeGreaterThan(0);
      expect(BusinessRules.MAX_EVENTS_PER_AGGREGATE).toBeGreaterThan(0);
    });
  });
});
