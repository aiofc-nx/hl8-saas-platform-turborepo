import { ExceptionFactory } from "./exception-factory.js";
import {
  BusinessRuleViolationException,
  DomainValidationException,
  DomainStateException,
  DomainPermissionException,
} from "./base/base-domain-exception.js";
import { ErrorCodes } from "../../common/constants/index.js";

describe("ExceptionFactory", () => {
  let exceptionFactory: ExceptionFactory;

  beforeEach(() => {
    exceptionFactory = ExceptionFactory.getInstance();
  });

  describe("单例模式", () => {
    it("应该返回相同的实例", () => {
      const instance1 = ExceptionFactory.getInstance();
      const instance2 = ExceptionFactory.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("领域验证异常", () => {
    it("应该创建领域验证异常", () => {
      const exception = exceptionFactory.createDomainValidation(
        "验证失败",
        "field",
        "value",
      );

      expect(exception).toBeInstanceOf(DomainValidationException);
      expect(exception.message).toBe("验证失败");
      expect(exception.field).toBe("field");
      expect(exception.value).toBe("value");
    });

    it("应该创建带错误代码的领域验证异常", () => {
      const exception = exceptionFactory.createDomainValidation(
        "验证失败",
        "field",
        "value",
        ErrorCodes.VALIDATION_FAILED,
      );

      expect(exception).toBeInstanceOf(DomainValidationException);
      expect(exception.code).toBe(ErrorCodes.VALIDATION_FAILED);
    });
  });

  describe("领域状态异常", () => {
    it("应该创建领域状态异常", () => {
      const exception = exceptionFactory.createDomainState(
        "状态错误",
        "currentState",
        "operation",
        { detail: "test" },
      );

      expect(exception).toBeInstanceOf(DomainStateException);
      expect(exception.message).toBe("状态错误");
      expect(exception.currentState).toBe("currentState");
      expect(exception.operation).toBe("operation");
      expect(exception.details).toEqual({ detail: "test" });
    });
  });

  describe("业务规则违反异常", () => {
    it("应该创建业务规则违反异常", () => {
      const exception = exceptionFactory.createBusinessRuleViolation(
        "业务规则违反",
        ErrorCodes.BUSINESS_RULE_VIOLATION,
      );

      expect(exception).toBeInstanceOf(BusinessRuleViolationException);
      expect(exception.message).toBe("业务规则违反");
      expect(exception.code).toBe(ErrorCodes.BUSINESS_RULE_VIOLATION);
    });
  });

  describe("权限异常", () => {
    it("应该创建权限异常", () => {
      const exception = exceptionFactory.createDomainPermission(
        "权限不足",
        "requiredPermission",
        "userPermission",
      );

      expect(exception).toBeInstanceOf(DomainPermissionException);
      expect(exception.message).toBe("权限不足");
      expect(exception.requiredPermission).toBe("requiredPermission");
      expect(exception.userPermission).toBe("userPermission");
    });
  });

  describe("租户异常", () => {
    it("应该创建租户名称已存在异常", () => {
      const exception =
        exceptionFactory.createTenantNameAlreadyExists("test-tenant");

      expect(exception).toBeInstanceOf(
        exceptionFactory.TenantNameAlreadyExistsException,
      );
      expect(exception.message).toContain("租户名称已存在");
      expect(exception.tenantName).toBe("test-tenant");
    });

    it("应该创建无效租户类型异常", () => {
      const exception = exceptionFactory.createInvalidTenantType(
        "INVALID",
        "ENTERPRISE",
      );

      expect(exception).toBeInstanceOf(
        exceptionFactory.InvalidTenantTypeException,
      );
      expect(exception.message).toContain("无效的租户类型");
      expect(exception.invalidType).toBe("INVALID");
      expect(exception.expectedType).toBe("ENTERPRISE");
    });
  });

  describe("组织异常", () => {
    it("应该创建组织名称已存在异常", () => {
      const exception =
        exceptionFactory.createOrganizationNameAlreadyExists("test-org");

      expect(exception).toBeInstanceOf(
        exceptionFactory.OrganizationNameAlreadyExistsException,
      );
      expect(exception.message).toContain("组织名称已存在");
      expect(exception.organizationName).toBe("test-org");
    });

    it("应该创建无效组织类型异常", () => {
      const exception = exceptionFactory.createInvalidOrganizationType(
        "INVALID",
        "COMPANY",
      );

      expect(exception).toBeInstanceOf(
        exceptionFactory.InvalidOrganizationTypeException,
      );
      expect(exception.message).toContain("无效的组织类型");
      expect(exception.invalidType).toBe("INVALID");
      expect(exception.expectedType).toBe("COMPANY");
    });
  });

  describe("部门异常", () => {
    it("应该创建部门名称已存在异常", () => {
      const exception =
        exceptionFactory.createDepartmentNameAlreadyExists("test-dept");

      expect(exception).toBeInstanceOf(
        exceptionFactory.DepartmentNameAlreadyExistsException,
      );
      expect(exception.message).toContain("部门名称已存在");
      expect(exception.departmentName).toBe("test-dept");
    });

    it("应该创建无效部门层级异常", () => {
      const exception = exceptionFactory.createInvalidDepartmentLevel(5, 3);

      expect(exception).toBeInstanceOf(
        exceptionFactory.InvalidDepartmentLevelException,
      );
      expect(exception.message).toContain("无效的部门层级");
      expect(exception.invalidLevel).toBe(5);
      expect(exception.maxLevel).toBe(3);
    });
  });

  describe("用户异常", () => {
    it("应该创建用户邮箱已存在异常", () => {
      const exception =
        exceptionFactory.createUserEmailAlreadyExists("test@example.com");

      expect(exception).toBeInstanceOf(
        exceptionFactory.UserEmailAlreadyExistsException,
      );
      expect(exception.message).toContain("用户邮箱已存在");
      expect(exception.email).toBe("test@example.com");
    });

    it("应该创建用户名已存在异常", () => {
      const exception =
        exceptionFactory.createUserUsernameAlreadyExists("testuser");

      expect(exception).toBeInstanceOf(
        exceptionFactory.UserUsernameAlreadyExistsException,
      );
      expect(exception.message).toContain("用户名已存在");
      expect(exception.username).toBe("testuser");
    });
  });

  describe("角色异常", () => {
    it("应该创建角色名称已存在异常", () => {
      const exception =
        exceptionFactory.createRoleNameAlreadyExists("test-role");

      expect(exception).toBeInstanceOf(
        exceptionFactory.RoleNameAlreadyExistsException,
      );
      expect(exception.message).toContain("角色名称已存在");
      expect(exception.roleName).toBe("test-role");
    });
  });

  describe("权限异常", () => {
    it("应该创建权限名称已存在异常", () => {
      const exception =
        exceptionFactory.createPermissionNameAlreadyExists("test-permission");

      expect(exception).toBeInstanceOf(
        exceptionFactory.PermissionNameAlreadyExistsException,
      );
      expect(exception.message).toContain("权限名称已存在");
      expect(exception.permissionName).toBe("test-permission");
    });
  });

  describe("验证异常", () => {
    it("应该创建邮箱验证异常", () => {
      const exception = exceptionFactory.createEmailValidation("invalid-email");

      expect(exception).toBeInstanceOf(
        exceptionFactory.EmailValidationException,
      );
      expect(exception.message).toContain("邮箱格式无效");
      expect(exception.email).toBe("invalid-email");
    });

    it("应该创建密码验证异常", () => {
      const exception =
        exceptionFactory.createPasswordValidation("weak-password");

      expect(exception).toBeInstanceOf(
        exceptionFactory.PasswordValidationException,
      );
      expect(exception.message).toContain("密码不符合要求");
      expect(exception.password).toBe("weak-password");
    });

    it("应该创建用户名验证异常", () => {
      const exception =
        exceptionFactory.createUsernameValidation("invalid-username");

      expect(exception).toBeInstanceOf(
        exceptionFactory.UsernameValidationException,
      );
      expect(exception.message).toContain("用户名格式无效");
      expect(exception.username).toBe("invalid-username");
    });
  });

  describe("边界情况", () => {
    it("应该处理空消息", () => {
      const exception = exceptionFactory.createDomainValidation(
        "",
        "field",
        "value",
      );
      expect(exception.message).toBe("");
    });

    it("应该处理undefined值", () => {
      const exception = exceptionFactory.createDomainValidation(
        "test",
        "field",
        undefined,
      );
      expect(exception.value).toBeUndefined();
    });

    it("应该处理复杂对象", () => {
      const complexObject = { nested: { value: "test" } };
      const exception = exceptionFactory.createDomainValidation(
        "test",
        "field",
        complexObject,
      );
      expect(exception.value).toBe(complexObject);
    });
  });
});
