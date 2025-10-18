import {
  NotificationSettings,
  NotificationSettingsUtils,
} from "./notification-settings.interface.js";

describe("NotificationSettings Interface", () => {
  describe("NotificationSettings", () => {
    it("应该定义基本的通知设置", () => {
      const settings: NotificationSettings = {
        email: true,
        push: false,
        sms: true,
        marketing: false,
      };

      expect(settings.email).toBe(true);
      expect(settings.push).toBe(false);
      expect(settings.sms).toBe(true);
      expect(settings.marketing).toBe(false);
    });

    it("应该支持所有通知渠道", () => {
      const settings: NotificationSettings = {
        email: true,
        push: true,
        sms: true,
        marketing: true,
      };

      expect(typeof settings.email).toBe("boolean");
      expect(typeof settings.push).toBe("boolean");
      expect(typeof settings.sms).toBe("boolean");
      expect(typeof settings.marketing).toBe("boolean");
    });
  });

  describe("NotificationSettingsUtils", () => {
    it("应该创建默认通知设置", () => {
      const defaultSettings = NotificationSettingsUtils.createDefault();

      expect(defaultSettings.email).toBe(true);
      expect(defaultSettings.push).toBe(true);
      expect(defaultSettings.sms).toBe(false);
      expect(defaultSettings.marketing).toBe(false);
    });

    it("应该验证通知设置", () => {
      const validSettings: NotificationSettings = {
        email: true,
        push: false,
        sms: true,
        marketing: false,
      };

      const invalidSettings = {
        email: "true", // 应该是 boolean
        push: false,
        sms: true,
        marketing: false,
      };

      expect(NotificationSettingsUtils.validate(validSettings)).toBe(true);
      expect(NotificationSettingsUtils.validate(invalidSettings as any)).toBe(
        false,
      );
    });

    it("应该合并通知设置", () => {
      const baseSettings: NotificationSettings = {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      };

      const overrideSettings: Partial<NotificationSettings> = {
        email: false,
        sms: true,
      };

      const mergedSettings = NotificationSettingsUtils.merge(
        baseSettings,
        overrideSettings,
      );

      expect(mergedSettings.email).toBe(false);
      expect(mergedSettings.push).toBe(true);
      expect(mergedSettings.sms).toBe(true);
      expect(mergedSettings.marketing).toBe(false);
    });

    it("应该处理部分覆盖设置", () => {
      const baseSettings: NotificationSettings = {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      };

      const partialOverride = {
        email: false,
      };

      const mergedSettings = NotificationSettingsUtils.merge(
        baseSettings,
        partialOverride,
      );

      expect(mergedSettings.email).toBe(false);
      expect(mergedSettings.push).toBe(true);
      expect(mergedSettings.sms).toBe(false);
      expect(mergedSettings.marketing).toBe(false);
    });
  });

  describe("类型安全", () => {
    it("应该确保通知设置类型安全", () => {
      const settings: NotificationSettings = {
        email: true,
        push: false,
        sms: true,
        marketing: false,
      };

      expect(typeof settings.email).toBe("boolean");
      expect(typeof settings.push).toBe("boolean");
      expect(typeof settings.sms).toBe("boolean");
      expect(typeof settings.marketing).toBe("boolean");
    });
  });
});
