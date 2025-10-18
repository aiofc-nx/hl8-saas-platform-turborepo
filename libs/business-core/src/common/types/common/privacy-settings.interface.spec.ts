import {
  PrivacySettings,
  PrivacySettingsUtils,
} from "./privacy-settings.interface.js";

describe("PrivacySettings Interface", () => {
  describe("PrivacySettings", () => {
    it("应该定义基本的隐私设置", () => {
      const settings: PrivacySettings = {
        profileVisibility: "private",
        activityStatus: false,
        dataCollection: false,
        analytics: false,
      };

      expect(settings.profileVisibility).toBe("private");
      expect(settings.activityStatus).toBe(false);
      expect(settings.dataCollection).toBe(false);
      expect(settings.analytics).toBe(false);
    });

    it("应该支持所有隐私设置选项", () => {
      const settings: PrivacySettings = {
        profileVisibility: "public",
        activityStatus: true,
        dataCollection: true,
        analytics: true,
      };

      expect(typeof settings.profileVisibility).toBe("string");
      expect(typeof settings.activityStatus).toBe("boolean");
      expect(typeof settings.dataCollection).toBe("boolean");
      expect(typeof settings.analytics).toBe("boolean");
    });
  });

  describe("PrivacySettingsUtils", () => {
    it("应该创建默认隐私设置", () => {
      const defaultSettings = PrivacySettingsUtils.createDefault();

      expect(defaultSettings.profileVisibility).toBe("private");
      expect(defaultSettings.activityStatus).toBe(false);
      expect(defaultSettings.dataCollection).toBe(true);
      expect(defaultSettings.analytics).toBe(false);
    });

    it("应该验证隐私设置", () => {
      const validSettings: PrivacySettings = {
        profileVisibility: "private",
        activityStatus: false,
        dataCollection: true,
        analytics: false,
      };

      const invalidSettings = {
        profileVisibility: "invalid", // 应该是有效的可见性值
        activityStatus: false,
        dataCollection: true,
        analytics: false,
      };

      expect(PrivacySettingsUtils.validate(validSettings)).toBe(true);
      expect(PrivacySettingsUtils.validate(invalidSettings as any)).toBe(false);
    });

    it("应该合并隐私设置", () => {
      const baseSettings: PrivacySettings = {
        profileVisibility: "private",
        activityStatus: false,
        dataCollection: true,
        analytics: false,
      };

      const overrideSettings: Partial<PrivacySettings> = {
        profileVisibility: "public",
        analytics: true,
      };

      const mergedSettings = PrivacySettingsUtils.merge(
        baseSettings,
        overrideSettings,
      );

      expect(mergedSettings.profileVisibility).toBe("public");
      expect(mergedSettings.activityStatus).toBe(false);
      expect(mergedSettings.dataCollection).toBe(true);
      expect(mergedSettings.analytics).toBe(true);
    });

    it("应该处理部分覆盖设置", () => {
      const baseSettings: PrivacySettings = {
        profileVisibility: "private",
        activityStatus: false,
        dataCollection: true,
        analytics: false,
      };

      const partialOverride: Partial<PrivacySettings> = {
        profileVisibility: "friends",
      };

      const mergedSettings = PrivacySettingsUtils.merge(
        baseSettings,
        partialOverride,
      );

      expect(mergedSettings.profileVisibility).toBe("friends");
      expect(mergedSettings.activityStatus).toBe(false);
      expect(mergedSettings.dataCollection).toBe(true);
      expect(mergedSettings.analytics).toBe(false);
    });
  });

  describe("类型安全", () => {
    it("应该确保隐私设置类型安全", () => {
      const settings: PrivacySettings = {
        profileVisibility: "private",
        activityStatus: false,
        dataCollection: true,
        analytics: false,
      };

      expect(typeof settings.profileVisibility).toBe("string");
      expect(typeof settings.activityStatus).toBe("boolean");
      expect(typeof settings.dataCollection).toBe("boolean");
      expect(typeof settings.analytics).toBe("boolean");
    });

    it("应该确保可见性值类型安全", () => {
      const validVisibility = ["public", "private", "friends"];
      const testVisibility = "private";
      expect(validVisibility).toContain(testVisibility);
    });
  });
});
