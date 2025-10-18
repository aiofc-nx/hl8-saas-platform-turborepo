import {
  NotificationSettings,
  NotificationChannel,
  NotificationFrequency,
  NotificationType,
  NotificationPreferences,
  NotificationTemplate,
  NotificationRule,
  NotificationSchedule,
  NotificationTarget,
  NotificationStatus,
} from "./notification-settings.interface.js";

describe("NotificationSettings Interface", () => {
  describe("NotificationSettings", () => {
    it("应该定义基本的通知设置", () => {
      const settings: NotificationSettings = {
        email: true,
        push: false,
        sms: true,
        inApp: true,
        webhook: false,
      };

      expect(settings.email).toBe(true);
      expect(settings.push).toBe(false);
      expect(settings.sms).toBe(true);
      expect(settings.inApp).toBe(true);
      expect(settings.webhook).toBe(false);
    });

    it("应该支持所有通知渠道", () => {
      const settings: NotificationSettings = {
        email: true,
        push: true,
        sms: true,
        inApp: true,
        webhook: true,
      };

      expect(typeof settings.email).toBe("boolean");
      expect(typeof settings.push).toBe("boolean");
      expect(typeof settings.sms).toBe("boolean");
      expect(typeof settings.inApp).toBe("boolean");
      expect(typeof settings.webhook).toBe("boolean");
    });
  });

  describe("NotificationChannel", () => {
    it("应该定义所有通知渠道", () => {
      expect(NotificationChannel.EMAIL).toBe("email");
      expect(NotificationChannel.PUSH).toBe("push");
      expect(NotificationChannel.SMS).toBe("sms");
      expect(NotificationChannel.IN_APP).toBe("in_app");
      expect(NotificationChannel.WEBHOOK).toBe("webhook");
    });

    it("应该包含所有必要的通知渠道", () => {
      const channels = Object.values(NotificationChannel);
      expect(channels).toContain("email");
      expect(channels).toContain("push");
      expect(channels).toContain("sms");
      expect(channels).toContain("in_app");
      expect(channels).toContain("webhook");
    });
  });

  describe("NotificationFrequency", () => {
    it("应该定义所有通知频率", () => {
      expect(NotificationFrequency.IMMEDIATE).toBe("immediate");
      expect(NotificationFrequency.HOURLY).toBe("hourly");
      expect(NotificationFrequency.DAILY).toBe("daily");
      expect(NotificationFrequency.WEEKLY).toBe("weekly");
      expect(NotificationFrequency.MONTHLY).toBe("monthly");
      expect(NotificationFrequency.NEVER).toBe("never");
    });

    it("应该包含所有必要的通知频率", () => {
      const frequencies = Object.values(NotificationFrequency);
      expect(frequencies).toContain("immediate");
      expect(frequencies).toContain("hourly");
      expect(frequencies).toContain("daily");
      expect(frequencies).toContain("weekly");
      expect(frequencies).toContain("monthly");
      expect(frequencies).toContain("never");
    });
  });

  describe("NotificationType", () => {
    it("应该定义所有通知类型", () => {
      expect(NotificationType.SYSTEM).toBe("system");
      expect(NotificationType.SECURITY).toBe("security");
      expect(NotificationType.MARKETING).toBe("marketing");
      expect(NotificationType.REMINDER).toBe("reminder");
      expect(NotificationType.ALERT).toBe("alert");
      expect(NotificationType.UPDATE).toBe("update");
    });

    it("应该包含所有必要的通知类型", () => {
      const types = Object.values(NotificationType);
      expect(types).toContain("system");
      expect(types).toContain("security");
      expect(types).toContain("marketing");
      expect(types).toContain("reminder");
      expect(types).toContain("alert");
      expect(types).toContain("update");
    });
  });

  describe("NotificationPreferences", () => {
    it("应该定义通知偏好设置", () => {
      const preferences: NotificationPreferences = {
        channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
        frequency: NotificationFrequency.DAILY,
        types: [NotificationType.SYSTEM, NotificationType.SECURITY],
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "08:00",
        },
        timezone: "Asia/Shanghai",
        language: "zh-CN",
      };

      expect(preferences.channels).toEqual([
        NotificationChannel.EMAIL,
        NotificationChannel.PUSH,
      ]);
      expect(preferences.frequency).toBe(NotificationFrequency.DAILY);
      expect(preferences.types).toEqual([
        NotificationType.SYSTEM,
        NotificationType.SECURITY,
      ]);
      expect(preferences.quietHours.enabled).toBe(true);
      expect(preferences.quietHours.start).toBe("22:00");
      expect(preferences.quietHours.end).toBe("08:00");
      expect(preferences.timezone).toBe("Asia/Shanghai");
      expect(preferences.language).toBe("zh-CN");
    });
  });

  describe("NotificationTemplate", () => {
    it("应该定义通知模板", () => {
      const template: NotificationTemplate = {
        id: "welcome-email",
        name: "欢迎邮件",
        type: NotificationType.SYSTEM,
        channel: NotificationChannel.EMAIL,
        subject: "欢迎加入我们的平台",
        content: "感谢您注册我们的服务！",
        variables: ["userName", "companyName"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(template.id).toBe("welcome-email");
      expect(template.name).toBe("欢迎邮件");
      expect(template.type).toBe(NotificationType.SYSTEM);
      expect(template.channel).toBe(NotificationChannel.EMAIL);
      expect(template.subject).toBe("欢迎加入我们的平台");
      expect(template.content).toBe("感谢您注册我们的服务！");
      expect(template.variables).toEqual(["userName", "companyName"]);
      expect(template.isActive).toBe(true);
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("NotificationRule", () => {
    it("应该定义通知规则", () => {
      const rule: NotificationRule = {
        id: "rule-001",
        name: "系统维护通知",
        type: NotificationType.SYSTEM,
        channel: NotificationChannel.EMAIL,
        conditions: {
          event: "system.maintenance",
          severity: "high",
        },
        template: "maintenance-notification",
        recipients: ["admin@example.com"],
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(rule.id).toBe("rule-001");
      expect(rule.name).toBe("系统维护通知");
      expect(rule.type).toBe(NotificationType.SYSTEM);
      expect(rule.channel).toBe(NotificationChannel.EMAIL);
      expect(rule.conditions.event).toBe("system.maintenance");
      expect(rule.conditions.severity).toBe("high");
      expect(rule.template).toBe("maintenance-notification");
      expect(rule.recipients).toEqual(["admin@example.com"]);
      expect(rule.isActive).toBe(true);
      expect(rule.priority).toBe(1);
      expect(rule.createdAt).toBeInstanceOf(Date);
      expect(rule.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("NotificationSchedule", () => {
    it("应该定义通知计划", () => {
      const schedule: NotificationSchedule = {
        id: "schedule-001",
        name: "每日报告",
        frequency: NotificationFrequency.DAILY,
        time: "09:00",
        timezone: "Asia/Shanghai",
        isActive: true,
        nextRun: new Date(),
        lastRun: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(schedule.id).toBe("schedule-001");
      expect(schedule.name).toBe("每日报告");
      expect(schedule.frequency).toBe(NotificationFrequency.DAILY);
      expect(schedule.time).toBe("09:00");
      expect(schedule.timezone).toBe("Asia/Shanghai");
      expect(schedule.isActive).toBe(true);
      expect(schedule.nextRun).toBeInstanceOf(Date);
      expect(schedule.lastRun).toBeInstanceOf(Date);
      expect(schedule.createdAt).toBeInstanceOf(Date);
      expect(schedule.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("NotificationTarget", () => {
    it("应该定义通知目标", () => {
      const target: NotificationTarget = {
        id: "target-001",
        type: "user",
        identifier: "user@example.com",
        channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
        preferences: {
          channels: [NotificationChannel.EMAIL],
          frequency: NotificationFrequency.IMMEDIATE,
          types: [NotificationType.SYSTEM],
          quietHours: {
            enabled: false,
            start: "22:00",
            end: "08:00",
          },
          timezone: "Asia/Shanghai",
          language: "zh-CN",
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(target.id).toBe("target-001");
      expect(target.type).toBe("user");
      expect(target.identifier).toBe("user@example.com");
      expect(target.channels).toEqual([
        NotificationChannel.EMAIL,
        NotificationChannel.PUSH,
      ]);
      expect(target.preferences.channels).toEqual([NotificationChannel.EMAIL]);
      expect(target.preferences.frequency).toBe(
        NotificationFrequency.IMMEDIATE,
      );
      expect(target.preferences.types).toEqual([NotificationType.SYSTEM]);
      expect(target.preferences.quietHours.enabled).toBe(false);
      expect(target.preferences.timezone).toBe("Asia/Shanghai");
      expect(target.preferences.language).toBe("zh-CN");
      expect(target.isActive).toBe(true);
      expect(target.createdAt).toBeInstanceOf(Date);
      expect(target.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("NotificationStatus", () => {
    it("应该定义所有通知状态", () => {
      expect(NotificationStatus.PENDING).toBe("pending");
      expect(NotificationStatus.SENT).toBe("sent");
      expect(NotificationStatus.DELIVERED).toBe("delivered");
      expect(NotificationStatus.READ).toBe("read");
      expect(NotificationStatus.FAILED).toBe("failed");
      expect(NotificationStatus.CANCELLED).toBe("cancelled");
    });

    it("应该包含所有必要的通知状态", () => {
      const statuses = Object.values(NotificationStatus);
      expect(statuses).toContain("pending");
      expect(statuses).toContain("sent");
      expect(statuses).toContain("delivered");
      expect(statuses).toContain("read");
      expect(statuses).toContain("failed");
      expect(statuses).toContain("cancelled");
    });
  });

  describe("接口组合", () => {
    it("应该支持完整的通知设置", () => {
      const completeSettings: NotificationSettings = {
        email: true,
        push: true,
        sms: false,
        inApp: true,
        webhook: false,
      };

      const preferences: NotificationPreferences = {
        channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
        frequency: NotificationFrequency.DAILY,
        types: [NotificationType.SYSTEM, NotificationType.SECURITY],
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "08:00",
        },
        timezone: "Asia/Shanghai",
        language: "zh-CN",
      };

      expect(completeSettings).toBeDefined();
      expect(preferences).toBeDefined();
      expect(preferences.channels).toContain(NotificationChannel.EMAIL);
      expect(preferences.frequency).toBe(NotificationFrequency.DAILY);
    });
  });

  describe("类型安全", () => {
    it("应该确保通知渠道类型安全", () => {
      const validChannels = Object.values(NotificationChannel);
      const testChannel = NotificationChannel.EMAIL;
      expect(validChannels).toContain(testChannel);
    });

    it("应该确保通知频率类型安全", () => {
      const validFrequencies = Object.values(NotificationFrequency);
      const testFrequency = NotificationFrequency.DAILY;
      expect(validFrequencies).toContain(testFrequency);
    });

    it("应该确保通知类型类型安全", () => {
      const validTypes = Object.values(NotificationType);
      const testType = NotificationType.SYSTEM;
      expect(validTypes).toContain(testType);
    });
  });
});
