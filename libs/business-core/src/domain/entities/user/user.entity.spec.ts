/**
 * 用户实体单元测试
 *
 * @description 测试用户实体的业务逻辑和验证规则
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { User } from "./user.entity.js";
import { UserStatus } from "../../value-objects/types/user-status.vo.js";
import { UserRole } from "../../value-objects/types/user-role.vo.js";
import { BusinessRuleViolationException } from "../../exceptions/base/base-domain-exception.js";

describe("User Entity", () => {
  let validEntityId: EntityId;
  let validUserProps: any;
  let validAuditInfo: any;

  beforeEach(() => {
    validEntityId = TenantId.create("123e4567-e89b-4d3a-a456-426614174000");
    validUserProps = {
      username: "testuser",
      email: "test@example.com",
      phone: "13800138000",
      status: UserStatus.ACTIVE,
      role: UserRole.USER,
      displayName: "Test User",
      avatarUrl: "https://example.com/avatar.jpg",
      description: "Test user description",
      isActive: true,
      lastLoginAt: new Date(),
      lastLoginIp: "192.168.1.1",
      failedLoginAttempts: 0,
      lockedAt: undefined,
      lockReason: undefined,
    };
    validAuditInfo = {
      createdBy: "admin",
      createdAt: new Date(),
    };
  });

  describe("构造函数", () => {
    it("应该成功创建用户实体", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(user.username).toBe("testuser");
      expect(user.email).toBe("test@example.com");
      expect(user.phone).toBe("13800138000");
      expect(user.status.value).toBe(UserStatus.ACTIVE.value);
      expect(user.role.value).toBe(UserRole.USER.value);
      expect(user.displayName).toBe("Test User");
      expect(user.avatarUrl).toBe("https://example.com/avatar.jpg");
      expect(user.description).toBe("Test user description");
      expect(user.isActive).toBe(true);
      expect(user.lastLoginAt).toBeDefined();
      expect(user.lastLoginIp).toBe("192.168.1.1");
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lockedAt).toBeUndefined();
      expect(user.lockReason).toBeUndefined();
    });

    it("应该成功创建用户实体（不提供日志记录器）", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(user).toBeDefined();
      expect(user.username).toBe("testuser");
    });

    it("应该验证用户名不能为空", () => {
      const invalidProps = { ...validUserProps, username: "" };

      expect(() => {
        new User(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证用户名长度不能超过50字符", () => {
      const invalidProps = { ...validUserProps, username: "a".repeat(51) };

      expect(() => {
        new User(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证用户名只能包含字母、数字和下划线", () => {
      const invalidProps = { ...validUserProps, username: "test-user" };

      expect(() => {
        new User(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证邮箱地址不能为空", () => {
      const invalidProps = { ...validUserProps, email: "" };

      expect(() => {
        new User(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证邮箱地址格式", () => {
      const invalidProps = { ...validUserProps, email: "invalid-email" };

      expect(() => {
        new User(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证用户姓名不能为空", () => {
      const invalidProps = { ...validUserProps, displayName: "" };

      expect(() => {
        new User(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证用户姓名长度不能超过100字符", () => {
      const invalidProps = { ...validUserProps, displayName: "a".repeat(101) };

      expect(() => {
        new User(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新用户名", () => {
    it("应该成功更新用户名", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateUsername("newusername", "admin");

      expect(user.username).toBe("newusername");
    });

    it("应该自动去除用户名前后空格", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateUsername("  newusername  ", "admin");

      expect(user.username).toBe("newusername");
    });

    it("应该验证新用户名不能为空", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateUsername("", "admin");
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证新用户名长度不能超过50字符", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateUsername("a".repeat(51), "admin");
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证新用户名只能包含字母、数字和下划线", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateUsername("new-user", "admin");
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新邮箱地址", () => {
    it("应该成功更新邮箱地址", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateEmail("newemail@example.com", "admin");

      expect(user.email).toBe("newemail@example.com");
    });

    it("应该自动转换为小写", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateEmail("NEWEMAIL@EXAMPLE.COM", "admin");

      expect(user.email).toBe("newemail@example.com");
    });

    it("应该验证新邮箱地址不能为空", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateEmail("", "admin");
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证新邮箱地址格式", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateEmail("invalid-email", "admin");
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新手机号码", () => {
    it("应该成功更新手机号码", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updatePhone("13900139000", "admin");

      expect(user.phone).toBe("13900139000");
    });

    it("应该验证手机号码格式", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updatePhone("invalid-phone", "admin");
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该允许空手机号码", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updatePhone("", "admin");

      expect(user.phone).toBe("");
    });
  });

  describe("更新用户姓名", () => {
    it("应该成功更新用户姓名", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateDisplayName("New Display Name", "admin");

      expect(user.displayName).toBe("New Display Name");
    });

    it("应该自动去除姓名前后空格", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateDisplayName("  New Display Name  ", "admin");

      expect(user.displayName).toBe("New Display Name");
    });

    it("应该验证新姓名不能为空", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateDisplayName("", "admin");
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证新姓名长度不能超过100字符", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateDisplayName("a".repeat(101), "admin");
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新用户角色", () => {
    it("应该成功更新用户角色", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateRole(UserRole.TENANT_ADMIN, "admin");

      expect(user.role.value).toBe(UserRole.TENANT_ADMIN.value);
    });

    it("应该验证新角色不能为空", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateRole(null as any, "admin");
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新用户状态", () => {
    it("应该成功更新用户状态", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateStatus(UserStatus.INACTIVE, "admin");

      expect(user.status.value).toBe(UserStatus.INACTIVE.value);
    });

    it("应该验证新状态不能为空", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateStatus(null as any, "admin");
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("激活用户", () => {
    it("应该成功激活用户", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.activate("admin");

      expect(user.isActive).toBe(true);
      expect(user.status.value).toBe(UserStatus.ACTIVE.value);
    });
  });

  describe("停用用户", () => {
    it("应该成功停用用户", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.deactivate("admin", "Test reason");

      expect(user.isActive).toBe(false);
      expect(user.status.value).toBe(UserStatus.INACTIVE.value);
    });
  });

  describe("锁定账户", () => {
    it("应该成功锁定账户", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.lockAccount("admin", "Test lock reason");

      expect(user.status.value).toBe(UserStatus.LOCKED.value);
      expect(user.lockedAt).toBeDefined();
      expect(user.lockReason).toBe("Test lock reason");
    });
  });

  describe("解锁账户", () => {
    it("应该成功解锁账户", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);
      user.lockAccount("admin", "Test lock reason");

      user.unlockAccount("admin");

      expect(user.status.value).toBe(UserStatus.ACTIVE.value);
      expect(user.lockedAt).toBeUndefined();
      expect(user.lockReason).toBeUndefined();
      expect(user.failedLoginAttempts).toBe(0);
    });
  });

  describe("记录登录成功", () => {
    it("应该成功记录登录成功", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.recordLoginSuccess("192.168.1.100");

      expect(user.lastLoginAt).toBeDefined();
      expect(user.lastLoginIp).toBe("192.168.1.100");
      expect(user.failedLoginAttempts).toBe(0);
    });
  });

  describe("记录登录失败", () => {
    it("应该成功记录登录失败", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.recordLoginFailure("192.168.1.100");

      expect(user.failedLoginAttempts).toBe(1);
    });

    it("应该在失败次数超过5次时锁定账户", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      // 记录5次失败
      for (let i = 0; i < 5; i++) {
        user.recordLoginFailure("192.168.1.100");
      }

      expect(user.status.value).toBe(UserStatus.LOCKED.value);
      expect(user.lockedAt).toBeDefined();
      expect(user.lockReason).toBe("多次登录失败");
    });
  });

  describe("检查用户状态", () => {
    it("应该正确检查用户是否可以登录", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(user.canLogin()).toBe(true);
    });

    it("应该正确检查用户是否被锁定", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);
      user.lockAccount("admin", "Test reason");

      expect(user.isLocked()).toBe(true);
    });

    it("应该正确检查用户是否激活", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(user.isUserActive()).toBe(true);
    });
  });

  describe("边界条件和异常处理", () => {
    it("应该处理特殊字符的用户名", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      expect(() => {
        user.updateUsername("user@name", "admin");
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该处理Unicode字符的用户姓名", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateDisplayName("张三", "admin");

      expect(user.displayName).toBe("张三");
    });

    it("应该处理数字开头的用户名", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateUsername("123user", "admin");
      expect(user.username).toBe("123user");
    });

    it("应该处理包含空格的用户姓名", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);

      user.updateDisplayName("Test User Name", "admin");

      expect(user.displayName).toBe("Test User Name");
    });
  });

  describe("性能测试", () => {
    it("应该能够快速创建大量用户实体", () => {
      const startTime = Date.now();
      const users = [];

      for (let i = 0; i < 1000; i++) {
        const userProps = {
          ...validUserProps,
          username: `user${i}`,
          email: `user${i}@example.com`,
        };
        users.push(
          new User(
            TenantId.create("123e4567-e89b-4d3a-a456-426614174000"),
            userProps,
            validAuditInfo,
          ),
        );
      }

      const endTime = Date.now();
      expect(users).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it("应该能够快速更新大量用户", () => {
      const user = new User(validEntityId, validUserProps, validAuditInfo);
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        user.updateDisplayName(`User ${i}`, "admin");
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // 应该在100毫秒内完成
    });
  });
});
