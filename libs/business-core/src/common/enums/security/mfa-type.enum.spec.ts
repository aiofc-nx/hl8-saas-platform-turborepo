/**
 * MFA类型枚举测试
 *
 * @description 测试MFA类型枚举和工具类的功能
 * @since 1.0.0
 */

import { MfaType, MfaTypeUtils } from "./mfa-type.enum.js";

describe("MfaType", () => {
  describe("枚举值", () => {
    it("应该包含所有预定义的MFA类型", () => {
      expect(MfaType.SMS).toBe("SMS");
      expect(MfaType.EMAIL).toBe("EMAIL");
      expect(MfaType.APP).toBe("APP");
      expect(MfaType.HARDWARE).toBe("HARDWARE");
      expect(MfaType.BIOMETRIC).toBe("BIOMETRIC");
    });
  });
});

describe("MfaTypeUtils", () => {
  describe("isSms", () => {
    it("应该正确识别SMS类型", () => {
      expect(MfaTypeUtils.isSms(MfaType.SMS)).toBe(true);
      expect(MfaTypeUtils.isSms(MfaType.EMAIL)).toBe(false);
      expect(MfaTypeUtils.isSms(MfaType.APP)).toBe(false);
      expect(MfaTypeUtils.isSms(MfaType.HARDWARE)).toBe(false);
      expect(MfaTypeUtils.isSms(MfaType.BIOMETRIC)).toBe(false);
    });
  });

  describe("isEmail", () => {
    it("应该正确识别EMAIL类型", () => {
      expect(MfaTypeUtils.isEmail(MfaType.EMAIL)).toBe(true);
      expect(MfaTypeUtils.isEmail(MfaType.SMS)).toBe(false);
      expect(MfaTypeUtils.isEmail(MfaType.APP)).toBe(false);
      expect(MfaTypeUtils.isEmail(MfaType.HARDWARE)).toBe(false);
      expect(MfaTypeUtils.isEmail(MfaType.BIOMETRIC)).toBe(false);
    });
  });

  describe("isApp", () => {
    it("应该正确识别应用验证类型", () => {
      expect(MfaTypeUtils.isApp(MfaType.APP)).toBe(true);
      expect(MfaTypeUtils.isApp(MfaType.SMS)).toBe(false);
      expect(MfaTypeUtils.isApp(MfaType.EMAIL)).toBe(false);
      expect(MfaTypeUtils.isApp(MfaType.HARDWARE)).toBe(false);
      expect(MfaTypeUtils.isApp(MfaType.BIOMETRIC)).toBe(false);
    });
  });

  describe("isHardware", () => {
    it("应该正确识别硬件令牌类型", () => {
      expect(MfaTypeUtils.isHardware(MfaType.HARDWARE)).toBe(true);
      expect(MfaTypeUtils.isHardware(MfaType.SMS)).toBe(false);
      expect(MfaTypeUtils.isHardware(MfaType.EMAIL)).toBe(false);
      expect(MfaTypeUtils.isHardware(MfaType.APP)).toBe(false);
      expect(MfaTypeUtils.isHardware(MfaType.BIOMETRIC)).toBe(false);
    });
  });

  describe("isBiometric", () => {
    it("应该正确识别生物识别类型", () => {
      expect(MfaTypeUtils.isBiometric(MfaType.BIOMETRIC)).toBe(true);
      expect(MfaTypeUtils.isBiometric(MfaType.SMS)).toBe(false);
      expect(MfaTypeUtils.isBiometric(MfaType.EMAIL)).toBe(false);
      expect(MfaTypeUtils.isBiometric(MfaType.APP)).toBe(false);
      expect(MfaTypeUtils.isBiometric(MfaType.HARDWARE)).toBe(false);
    });
  });

  describe("getDescription", () => {
    it("应该返回正确的中文描述", () => {
      expect(MfaTypeUtils.getDescription(MfaType.SMS)).toBe("短信验证");
      expect(MfaTypeUtils.getDescription(MfaType.EMAIL)).toBe("邮件验证");
      expect(MfaTypeUtils.getDescription(MfaType.APP)).toBe("应用验证");
      expect(MfaTypeUtils.getDescription(MfaType.HARDWARE)).toBe("硬件令牌");
      expect(MfaTypeUtils.getDescription(MfaType.BIOMETRIC)).toBe("生物识别");
    });
  });

  describe("getAllTypes", () => {
    it("应该返回所有MFA类型", () => {
      const allTypes = MfaTypeUtils.getAllTypes();
      expect(allTypes).toHaveLength(5);
      expect(allTypes).toContain(MfaType.SMS);
      expect(allTypes).toContain(MfaType.EMAIL);
      expect(allTypes).toContain(MfaType.APP);
      expect(allTypes).toContain(MfaType.HARDWARE);
      expect(allTypes).toContain(MfaType.BIOMETRIC);
    });
  });

  describe("getHighSecurityTypes", () => {
    it("应该返回高安全级别类型", () => {
      const highSecurityTypes = MfaTypeUtils.getHighSecurityTypes();
      expect(highSecurityTypes).toHaveLength(3);
      expect(highSecurityTypes).toContain(MfaType.BIOMETRIC);
      expect(highSecurityTypes).toContain(MfaType.HARDWARE);
      expect(highSecurityTypes).toContain(MfaType.APP);
      expect(highSecurityTypes).not.toContain(MfaType.SMS);
      expect(highSecurityTypes).not.toContain(MfaType.EMAIL);
    });
  });

  describe("getLowSecurityTypes", () => {
    it("应该返回低安全级别类型", () => {
      const lowSecurityTypes = MfaTypeUtils.getLowSecurityTypes();
      expect(lowSecurityTypes).toHaveLength(2);
      expect(lowSecurityTypes).toContain(MfaType.SMS);
      expect(lowSecurityTypes).toContain(MfaType.EMAIL);
      expect(lowSecurityTypes).not.toContain(MfaType.APP);
      expect(lowSecurityTypes).not.toContain(MfaType.HARDWARE);
      expect(lowSecurityTypes).not.toContain(MfaType.BIOMETRIC);
    });
  });
});
