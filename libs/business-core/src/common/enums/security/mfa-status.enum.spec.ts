import { MfaStatus, MfaStatusUtils } from "./mfa-status.enum.js";

describe("MfaStatus", () => {
  describe("枚举值", () => {
    it("应该包含所有预期的MFA状态", () => {
      expect(MfaStatus.DISABLED).toBe("DISABLED");
      expect(MfaStatus.ENABLED).toBe("ENABLED");
      expect(MfaStatus.DEACTIVATED).toBe("DEACTIVATED");
      expect(MfaStatus.EXPIRED).toBe("EXPIRED");
      expect(MfaStatus.LOCKED).toBe("LOCKED");
    });

    it("应该包含5个状态值", () => {
      const statuses = Object.values(MfaStatus);
      expect(statuses).toHaveLength(5);
    });
  });
});

describe("MfaStatusUtils", () => {
  describe("状态检查方法", () => {
    it("应该正确识别未启用状态", () => {
      expect(MfaStatusUtils.isDisabled(MfaStatus.DISABLED)).toBe(true);
      expect(MfaStatusUtils.isDisabled(MfaStatus.ENABLED)).toBe(false);
      expect(MfaStatusUtils.isDisabled(MfaStatus.DEACTIVATED)).toBe(false);
      expect(MfaStatusUtils.isDisabled(MfaStatus.EXPIRED)).toBe(false);
      expect(MfaStatusUtils.isDisabled(MfaStatus.LOCKED)).toBe(false);
    });

    it("应该正确识别已启用状态", () => {
      expect(MfaStatusUtils.isEnabled(MfaStatus.ENABLED)).toBe(true);
      expect(MfaStatusUtils.isEnabled(MfaStatus.DISABLED)).toBe(false);
      expect(MfaStatusUtils.isEnabled(MfaStatus.DEACTIVATED)).toBe(false);
      expect(MfaStatusUtils.isEnabled(MfaStatus.EXPIRED)).toBe(false);
      expect(MfaStatusUtils.isEnabled(MfaStatus.LOCKED)).toBe(false);
    });

    it("应该正确识别已禁用状态", () => {
      expect(MfaStatusUtils.isDeactivated(MfaStatus.DEACTIVATED)).toBe(true);
      expect(MfaStatusUtils.isDeactivated(MfaStatus.DISABLED)).toBe(false);
      expect(MfaStatusUtils.isDeactivated(MfaStatus.ENABLED)).toBe(false);
      expect(MfaStatusUtils.isDeactivated(MfaStatus.EXPIRED)).toBe(false);
      expect(MfaStatusUtils.isDeactivated(MfaStatus.LOCKED)).toBe(false);
    });

    it("应该正确识别已过期状态", () => {
      expect(MfaStatusUtils.isExpired(MfaStatus.EXPIRED)).toBe(true);
      expect(MfaStatusUtils.isExpired(MfaStatus.DISABLED)).toBe(false);
      expect(MfaStatusUtils.isExpired(MfaStatus.ENABLED)).toBe(false);
      expect(MfaStatusUtils.isExpired(MfaStatus.DEACTIVATED)).toBe(false);
      expect(MfaStatusUtils.isExpired(MfaStatus.LOCKED)).toBe(false);
    });

    it("应该正确识别已锁定状态", () => {
      expect(MfaStatusUtils.isLocked(MfaStatus.LOCKED)).toBe(true);
      expect(MfaStatusUtils.isLocked(MfaStatus.DISABLED)).toBe(false);
      expect(MfaStatusUtils.isLocked(MfaStatus.ENABLED)).toBe(false);
      expect(MfaStatusUtils.isLocked(MfaStatus.DEACTIVATED)).toBe(false);
      expect(MfaStatusUtils.isLocked(MfaStatus.EXPIRED)).toBe(false);
    });
  });

  describe("业务规则检查", () => {
    it("应该正确检查是否可以验证", () => {
      expect(MfaStatusUtils.canVerify(MfaStatus.ENABLED)).toBe(true);
      expect(MfaStatusUtils.canVerify(MfaStatus.DISABLED)).toBe(false);
      expect(MfaStatusUtils.canVerify(MfaStatus.DEACTIVATED)).toBe(false);
      expect(MfaStatusUtils.canVerify(MfaStatus.EXPIRED)).toBe(false);
      expect(MfaStatusUtils.canVerify(MfaStatus.LOCKED)).toBe(false);
    });

    it("应该正确检查是否可以启用", () => {
      expect(MfaStatusUtils.canEnable(MfaStatus.DISABLED)).toBe(true);
      expect(MfaStatusUtils.canEnable(MfaStatus.DEACTIVATED)).toBe(true);
      expect(MfaStatusUtils.canEnable(MfaStatus.ENABLED)).toBe(false);
      expect(MfaStatusUtils.canEnable(MfaStatus.EXPIRED)).toBe(false);
      expect(MfaStatusUtils.canEnable(MfaStatus.LOCKED)).toBe(false);
    });

    it("应该正确检查是否可以禁用", () => {
      expect(MfaStatusUtils.canDisable(MfaStatus.ENABLED)).toBe(true);
      expect(MfaStatusUtils.canDisable(MfaStatus.DISABLED)).toBe(false);
      expect(MfaStatusUtils.canDisable(MfaStatus.DEACTIVATED)).toBe(false);
      expect(MfaStatusUtils.canDisable(MfaStatus.EXPIRED)).toBe(false);
      expect(MfaStatusUtils.canDisable(MfaStatus.LOCKED)).toBe(false);
    });

    it("应该正确检查是否可以解锁", () => {
      expect(MfaStatusUtils.canUnlock(MfaStatus.LOCKED)).toBe(true);
      expect(MfaStatusUtils.canUnlock(MfaStatus.DISABLED)).toBe(false);
      expect(MfaStatusUtils.canUnlock(MfaStatus.ENABLED)).toBe(false);
      expect(MfaStatusUtils.canUnlock(MfaStatus.DEACTIVATED)).toBe(false);
      expect(MfaStatusUtils.canUnlock(MfaStatus.EXPIRED)).toBe(false);
    });
  });

  describe("描述和列表方法", () => {
    it("应该返回正确的状态描述", () => {
      expect(MfaStatusUtils.getDescription(MfaStatus.DISABLED)).toBe("未启用");
      expect(MfaStatusUtils.getDescription(MfaStatus.ENABLED)).toBe("已启用");
      expect(MfaStatusUtils.getDescription(MfaStatus.DEACTIVATED)).toBe(
        "已禁用",
      );
      expect(MfaStatusUtils.getDescription(MfaStatus.EXPIRED)).toBe("已过期");
      expect(MfaStatusUtils.getDescription(MfaStatus.LOCKED)).toBe("已锁定");
    });

    it("应该返回所有状态", () => {
      const allStatuses = MfaStatusUtils.getAllStatuses();
      expect(allStatuses).toHaveLength(5);
      expect(allStatuses).toContain(MfaStatus.DISABLED);
      expect(allStatuses).toContain(MfaStatus.ENABLED);
      expect(allStatuses).toContain(MfaStatus.DEACTIVATED);
      expect(allStatuses).toContain(MfaStatus.EXPIRED);
      expect(allStatuses).toContain(MfaStatus.LOCKED);
    });

    it("应该返回有效状态", () => {
      const validStatuses = MfaStatusUtils.getValidStatuses();
      expect(validStatuses).toHaveLength(1);
      expect(validStatuses).toContain(MfaStatus.ENABLED);
    });
  });

  describe("边界情况", () => {
    it("应该处理未知状态", () => {
      const unknownStatus = "UNKNOWN" as MfaStatus;
      expect(MfaStatusUtils.getDescription(unknownStatus)).toBe("未知MFA状态");
    });

    it("应该正确处理所有状态转换规则", () => {
      // 未启用 -> 已启用
      expect(MfaStatusUtils.canEnable(MfaStatus.DISABLED)).toBe(true);

      // 已启用 -> 已禁用
      expect(MfaStatusUtils.canDisable(MfaStatus.ENABLED)).toBe(true);

      // 已启用 -> 已过期（通过业务逻辑处理）
      expect(MfaStatusUtils.isExpired(MfaStatus.EXPIRED)).toBe(true);

      // 已启用 -> 已锁定（通过业务逻辑处理）
      expect(MfaStatusUtils.isLocked(MfaStatus.LOCKED)).toBe(true);

      // 已禁用 -> 已启用
      expect(MfaStatusUtils.canEnable(MfaStatus.DEACTIVATED)).toBe(true);

      // 已过期 -> 已启用（通过业务逻辑处理）
      expect(MfaStatusUtils.canEnable(MfaStatus.EXPIRED)).toBe(false);

      // 已锁定 -> 已启用（通过业务逻辑处理）
      expect(MfaStatusUtils.canUnlock(MfaStatus.LOCKED)).toBe(true);
    });
  });
});
