/**
 * 用户状态枚举测试
 *
 * @description 测试用户状态枚举和工具类的功能
 * @since 1.0.0
 */

import { UserStatus, UserStatusUtils } from "./user-status.enum.js";

describe("UserStatus", () => {
  describe("枚举值", () => {
    it("应该包含所有预定义的状态", () => {
      expect(UserStatus.ACTIVE).toBe("ACTIVE");
      expect(UserStatus.INACTIVE).toBe("INACTIVE");
      expect(UserStatus.LOCKED).toBe("LOCKED");
      expect(UserStatus.DISABLED).toBe("DISABLED");
    });
  });
});

describe("UserStatusUtils", () => {
  describe("isActive", () => {
    it("应该正确识别激活状态", () => {
      expect(UserStatusUtils.isActive(UserStatus.ACTIVE)).toBe(true);
      expect(UserStatusUtils.isActive(UserStatus.INACTIVE)).toBe(false);
      expect(UserStatusUtils.isActive(UserStatus.LOCKED)).toBe(false);
      expect(UserStatusUtils.isActive(UserStatus.DISABLED)).toBe(false);
    });
  });

  describe("isInactive", () => {
    it("应该正确识别未激活状态", () => {
      expect(UserStatusUtils.isInactive(UserStatus.INACTIVE)).toBe(true);
      expect(UserStatusUtils.isInactive(UserStatus.ACTIVE)).toBe(false);
      expect(UserStatusUtils.isInactive(UserStatus.LOCKED)).toBe(false);
      expect(UserStatusUtils.isInactive(UserStatus.DISABLED)).toBe(false);
    });
  });

  describe("isLocked", () => {
    it("应该正确识别锁定状态", () => {
      expect(UserStatusUtils.isLocked(UserStatus.LOCKED)).toBe(true);
      expect(UserStatusUtils.isLocked(UserStatus.ACTIVE)).toBe(false);
      expect(UserStatusUtils.isLocked(UserStatus.INACTIVE)).toBe(false);
      expect(UserStatusUtils.isLocked(UserStatus.DISABLED)).toBe(false);
    });
  });

  describe("isDisabled", () => {
    it("应该正确识别禁用状态", () => {
      expect(UserStatusUtils.isDisabled(UserStatus.DISABLED)).toBe(true);
      expect(UserStatusUtils.isDisabled(UserStatus.ACTIVE)).toBe(false);
      expect(UserStatusUtils.isDisabled(UserStatus.INACTIVE)).toBe(false);
      expect(UserStatusUtils.isDisabled(UserStatus.LOCKED)).toBe(false);
    });
  });

  describe("canLogin", () => {
    it("应该正确判断是否可以登录", () => {
      expect(UserStatusUtils.canLogin(UserStatus.ACTIVE)).toBe(true);
      expect(UserStatusUtils.canLogin(UserStatus.INACTIVE)).toBe(false);
      expect(UserStatusUtils.canLogin(UserStatus.LOCKED)).toBe(false);
      expect(UserStatusUtils.canLogin(UserStatus.DISABLED)).toBe(false);
    });
  });

  describe("canOperate", () => {
    it("应该正确判断是否可以操作", () => {
      expect(UserStatusUtils.canOperate(UserStatus.ACTIVE)).toBe(true);
      expect(UserStatusUtils.canOperate(UserStatus.INACTIVE)).toBe(false);
      expect(UserStatusUtils.canOperate(UserStatus.LOCKED)).toBe(false);
      expect(UserStatusUtils.canOperate(UserStatus.DISABLED)).toBe(false);
    });
  });

  describe("getDescription", () => {
    it("应该返回正确的中文描述", () => {
      expect(UserStatusUtils.getDescription(UserStatus.ACTIVE)).toBe("激活");
      expect(UserStatusUtils.getDescription(UserStatus.INACTIVE)).toBe(
        "未激活",
      );
      expect(UserStatusUtils.getDescription(UserStatus.LOCKED)).toBe("锁定");
      expect(UserStatusUtils.getDescription(UserStatus.DISABLED)).toBe("禁用");
    });
  });

  describe("getAllStatuses", () => {
    it("应该返回所有状态", () => {
      const allStatuses = UserStatusUtils.getAllStatuses();
      expect(allStatuses).toHaveLength(4);
      expect(allStatuses).toContain(UserStatus.ACTIVE);
      expect(allStatuses).toContain(UserStatus.INACTIVE);
      expect(allStatuses).toContain(UserStatus.LOCKED);
      expect(allStatuses).toContain(UserStatus.DISABLED);
    });
  });

  describe("getValidStatuses", () => {
    it("应该返回有效状态（可以登录的状态）", () => {
      const validStatuses = UserStatusUtils.getValidStatuses();
      expect(validStatuses).toHaveLength(1);
      expect(validStatuses).toContain(UserStatus.ACTIVE);
      expect(validStatuses).not.toContain(UserStatus.INACTIVE);
      expect(validStatuses).not.toContain(UserStatus.LOCKED);
      expect(validStatuses).not.toContain(UserStatus.DISABLED);
    });
  });
});
