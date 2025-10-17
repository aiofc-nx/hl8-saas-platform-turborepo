/**
 * MFA类型值对象测试
 *
 * @description 测试MFA类型值对象的业务逻辑和验证规则
 *
 * @since 1.0.0
 */

import { describe, it, expect } from "@jest/globals";
import { MfaType, MfaTypeUtils } from "./mfa-type.vo.js";

describe("MfaType", () => {
  describe("枚举值", () => {
    it("应该包含所有预定义的MFA类型", () => {
      expect(MfaType.TOTP).toBe("TOTP");
      expect(MfaType.SMS).toBe("SMS");
      expect(MfaType.EMAIL).toBe("EMAIL");
      expect(MfaType.BACKUP_CODES).toBe("BACKUP_CODES");
      expect(MfaType.BIOMETRIC).toBe("BIOMETRIC");
      expect(MfaType.HARDWARE_TOKEN).toBe("HARDWARE_TOKEN");
    });

    it("应该支持所有MFA类型", () => {
      const allTypes = Object.values(MfaType);
      expect(allTypes).toHaveLength(6);
      expect(allTypes).toContain(MfaType.TOTP);
      expect(allTypes).toContain(MfaType.SMS);
      expect(allTypes).toContain(MfaType.EMAIL);
      expect(allTypes).toContain(MfaType.BACKUP_CODES);
      expect(allTypes).toContain(MfaType.BIOMETRIC);
      expect(allTypes).toContain(MfaType.HARDWARE_TOKEN);
    });
  });

  describe("MfaTypeUtils", () => {
    describe("getSecurityLevel", () => {
      it("应该返回高安全级别类型", () => {
        expect(MfaTypeUtils.getSecurityLevel(MfaType.TOTP)).toBe("high");
        expect(MfaTypeUtils.getSecurityLevel(MfaType.HARDWARE_TOKEN)).toBe(
          "high",
        );
        expect(MfaTypeUtils.getSecurityLevel(MfaType.BIOMETRIC)).toBe("high");
      });

      it("应该返回中安全级别类型", () => {
        expect(MfaTypeUtils.getSecurityLevel(MfaType.SMS)).toBe("medium");
        expect(MfaTypeUtils.getSecurityLevel(MfaType.EMAIL)).toBe("medium");
      });

      it("应该返回低安全级别类型", () => {
        expect(MfaTypeUtils.getSecurityLevel(MfaType.BACKUP_CODES)).toBe("low");
      });
    });

    describe("isSupported", () => {
      it("应该支持所有预定义的MFA类型", () => {
        expect(MfaTypeUtils.isSupported(MfaType.TOTP)).toBe(true);
        expect(MfaTypeUtils.isSupported(MfaType.SMS)).toBe(true);
        expect(MfaTypeUtils.isSupported(MfaType.EMAIL)).toBe(true);
        expect(MfaTypeUtils.isSupported(MfaType.BACKUP_CODES)).toBe(true);
        expect(MfaTypeUtils.isSupported(MfaType.BIOMETRIC)).toBe(false); // 需要设备支持
        expect(MfaTypeUtils.isSupported(MfaType.HARDWARE_TOKEN)).toBe(false); // 需要硬件设备
      });

      it("应该不支持无效的MFA类型", () => {
        expect(MfaTypeUtils.isSupported("INVALID" as MfaType)).toBeUndefined();
        expect(MfaTypeUtils.isSupported("" as MfaType)).toBeUndefined();
      });
    });

    describe("getDescription", () => {
      it("应该返回正确的描述", () => {
        expect(MfaTypeUtils.getDescription(MfaType.TOTP)).toContain(
          "基于时间的一次性密码",
        );
        expect(MfaTypeUtils.getDescription(MfaType.SMS)).toContain(
          "短信验证码",
        );
        expect(MfaTypeUtils.getDescription(MfaType.EMAIL)).toContain(
          "邮箱验证码",
        );
        expect(MfaTypeUtils.getDescription(MfaType.BACKUP_CODES)).toContain(
          "备用验证码",
        );
        expect(MfaTypeUtils.getDescription(MfaType.BIOMETRIC)).toContain(
          "生物识别",
        );
        expect(MfaTypeUtils.getDescription(MfaType.HARDWARE_TOKEN)).toContain(
          "硬件令牌",
        );
      });
    });

    describe("isHighSecurityLevel", () => {
      it("应该正确识别高安全级别类型", () => {
        expect(MfaTypeUtils.isHighSecurityLevel(MfaType.TOTP)).toBe(true);
        expect(MfaTypeUtils.isHighSecurityLevel(MfaType.HARDWARE_TOKEN)).toBe(
          true,
        );
        expect(MfaTypeUtils.isHighSecurityLevel(MfaType.BIOMETRIC)).toBe(true);
        expect(MfaTypeUtils.isHighSecurityLevel(MfaType.SMS)).toBe(false);
        expect(MfaTypeUtils.isHighSecurityLevel(MfaType.EMAIL)).toBe(false);
        expect(MfaTypeUtils.isHighSecurityLevel(MfaType.BACKUP_CODES)).toBe(
          false,
        );
      });
    });

    describe("getAllTypes", () => {
      it("应该返回所有MFA类型", () => {
        const allTypes = MfaTypeUtils.getAllTypes();
        expect(allTypes).toHaveLength(6);
        expect(allTypes).toContain(MfaType.TOTP);
        expect(allTypes).toContain(MfaType.SMS);
        expect(allTypes).toContain(MfaType.EMAIL);
        expect(allTypes).toContain(MfaType.BACKUP_CODES);
        expect(allTypes).toContain(MfaType.BIOMETRIC);
        expect(allTypes).toContain(MfaType.HARDWARE_TOKEN);
      });
    });

    describe("compareSecurityLevel", () => {
      it("应该正确比较安全级别", () => {
        expect(
          MfaTypeUtils.compareSecurityLevel(MfaType.TOTP, MfaType.SMS),
        ).toBe(1);
        expect(
          MfaTypeUtils.compareSecurityLevel(MfaType.SMS, MfaType.TOTP),
        ).toBe(-1);
        expect(
          MfaTypeUtils.compareSecurityLevel(
            MfaType.TOTP,
            MfaType.HARDWARE_TOKEN,
          ),
        ).toBe(0);
        expect(
          MfaTypeUtils.compareSecurityLevel(MfaType.SMS, MfaType.EMAIL),
        ).toBe(0);
        expect(
          MfaTypeUtils.compareSecurityLevel(MfaType.BACKUP_CODES, MfaType.TOTP),
        ).toBe(-1);
      });
    });

    describe("getSupportedTypes", () => {
      it("应该返回支持的类型", () => {
        const supportedTypes = MfaTypeUtils.getSupportedTypes();
        expect(supportedTypes).toContain(MfaType.TOTP);
        expect(supportedTypes).toContain(MfaType.SMS);
        expect(supportedTypes).toContain(MfaType.EMAIL);
        expect(supportedTypes).toContain(MfaType.BACKUP_CODES);
        expect(supportedTypes).not.toContain(MfaType.BIOMETRIC);
        expect(supportedTypes).not.toContain(MfaType.HARDWARE_TOKEN);
      });
    });
  });

  describe("边界条件", () => {
    it("应该处理null和undefined", () => {
      expect(MfaTypeUtils.isSupported(null as any)).toBeUndefined();
      expect(MfaTypeUtils.isSupported(undefined as any)).toBeUndefined();
    });
  });

  describe("性能测试", () => {
    it("应该能够快速获取安全级别", () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        MfaTypeUtils.getSecurityLevel(MfaType.TOTP);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // 应该在100毫秒内完成
    });

    it("应该能够快速比较安全级别", () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        MfaTypeUtils.compareSecurityLevel(MfaType.TOTP, MfaType.SMS);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // 应该在100毫秒内完成
    });
  });
});
