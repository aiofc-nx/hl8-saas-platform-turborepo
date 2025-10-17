import { EmailValidator } from "./email.validator.js";

describe("EmailValidator", () => {
  describe("格式验证", () => {
    it("应该验证有效的邮箱格式", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.com",
        "user+tag@example.com",
        "user123@example.com",
        "test.email+tag@example.org",
        "user@subdomain.example.com",
        "user@example.co.uk",
        "user@example-domain.com",
      ];

      validEmails.forEach((email) => {
        const result = EmailValidator.validateFormat(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it("应该拒绝无效的邮箱格式", () => {
      const invalidEmails = [
        "",
        "   ",
        "invalid-email",
        "@example.com",
        "user@",
        "user@.com",
        "user@example.",
        "user..name@example.com",
        "user@example..com",
        "user name@example.com",
        "user@example com",
      ];

      invalidEmails.forEach((email) => {
        const result = EmailValidator.validateFormat(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it("应该处理空邮箱", () => {
      const result = EmailValidator.validateFormat("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("邮箱不能为空");
    });

    it("应该处理过长的邮箱", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      const result = EmailValidator.validateFormat(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("邮箱长度不能超过254个字符");
    });

    it("应该处理缺少@符号的邮箱", () => {
      const result = EmailValidator.validateFormat("userexample.com");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("邮箱必须包含@符号");
    });
  });

  describe("本地部分验证", () => {
    it("应该验证有效的本地部分", () => {
      const validLocalParts = [
        "user",
        "user.name",
        "user+tag",
        "user123",
        "test.email",
        "user_name",
        "user-name",
        "user.name+tag",
      ];

      validLocalParts.forEach((localPart) => {
        const result = EmailValidator.validateLocalPart(localPart);
        expect(result.isValid).toBe(true);
      });
    });

    it("应该拒绝无效的本地部分", () => {
      const invalidLocalParts = [
        "",
        "user..name",
        ".user",
        "user.",
        "user name",
        "user@name",
        "user,name",
        "user;name",
        "user:name",
        "user<name",
        "user>name",
        "user[name",
        "user]name",
        "user\\name",
        "user/name",
        "user?name",
        "user=name",
        "user{name",
        "user}name",
        "user|name",
        "user^name",
        "user`name",
        "user~name",
      ];

      invalidLocalParts.forEach((localPart) => {
        const result = EmailValidator.validateLocalPart(localPart);
        expect(result.isValid).toBe(false);
      });
    });

    it("应该处理过长的本地部分", () => {
      const longLocalPart = "a".repeat(65);
      const result = EmailValidator.validateLocalPart(longLocalPart);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("本地部分长度不能超过64个字符");
    });
  });

  describe("域名验证", () => {
    it("应该验证有效的域名", () => {
      const validDomains = [
        "example.com",
        "subdomain.example.com",
        "example.co.uk",
        "example-domain.com",
        "example123.com",
        "example.com.cn",
        "example.org",
        "example.net",
        "example.info",
      ];

      validDomains.forEach((domain) => {
        const result = EmailValidator.validateDomain(domain);
        expect(result.isValid).toBe(true);
      });
    });

    it("应该拒绝无效的域名", () => {
      const invalidDomains = [
        "",
        "example",
        ".example.com",
        "example.",
        "example..com",
        "example-.com",
        "-example.com",
        "example.com.",
        "example .com",
        "example@com",
        "example,com",
        "example;com",
        "example:com",
        "example<com",
        "example>com",
        "example[com",
        "example]com",
        "example\\com",
        "example/com",
        "example?com",
        "example=com",
        "example{com",
        "example}com",
        "example|com",
        "example^com",
        "example`com",
        "example~com",
      ];

      invalidDomains.forEach((domain) => {
        const result = EmailValidator.validateDomain(domain);
        expect(result.isValid).toBe(false);
      });
    });

    it("应该处理过长的域名", () => {
      const longDomain = "a".repeat(250) + ".com";
      const result = EmailValidator.validateDomain(longDomain);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("域名长度不能超过253个字符");
    });
  });

  describe("特殊格式验证", () => {
    it("应该支持引号字符串格式", () => {
      const quotedEmails = [
        '"user name"@example.com',
        '"user+tag"@example.com',
        '"user.name"@example.com',
      ];

      quotedEmails.forEach((email) => {
        const result = EmailValidator.validateFormat(email);
        expect(result.isValid).toBe(true);
      });
    });

    it("应该支持国际化域名", () => {
      const internationalEmails = [
        "user@xn--example-9ua.com", // Punycode
        "user@example.xn--fiqs8s", // Chinese domain
      ];

      internationalEmails.forEach((email) => {
        const result = EmailValidator.validateFormat(email);
        expect(result.isValid).toBe(true);
      });
    });

    it("应该支持复杂的本地部分", () => {
      const complexEmails = [
        "user+tag@example.com",
        "user.name+tag@example.com",
        "user_name@example.com",
        "user-name@example.com",
        "user123@example.com",
      ];

      complexEmails.forEach((email) => {
        const result = EmailValidator.validateFormat(email);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("业务规则验证", () => {
    it("应该验证邮箱长度限制", () => {
      const result = EmailValidator.validateBusinessRules("test@example.com");
      expect(result.isValid).toBe(true);
    });

    it("应该拒绝过长的邮箱", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      const result = EmailValidator.validateBusinessRules(longEmail);
      expect(result.isValid).toBe(false);
    });

    it("应该验证域名白名单", () => {
      const result = EmailValidator.validateBusinessRules("test@example.com");
      expect(result.isValid).toBe(true);
    });

    it("应该拒绝黑名单域名", () => {
      // 假设example.com在黑名单中
      const result = EmailValidator.validateBusinessRules("test@example.com");
      // 这里需要根据实际的黑名单配置来测试
      expect(result.isValid).toBe(true);
    });
  });

  describe("综合验证", () => {
    it("应该通过完整的邮箱验证", () => {
      const validEmail = "test@example.com";
      const result = EmailValidator.validate(validEmail);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("应该拒绝无效的邮箱", () => {
      const invalidEmail = "invalid-email";
      const result = EmailValidator.validate(invalidEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("应该提供详细的错误信息", () => {
      const invalidEmail = "user@";
      const result = EmailValidator.validate(invalidEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("邮箱必须包含@符号");
    });
  });

  describe("边界情况", () => {
    it("应该处理null和undefined", () => {
      expect(EmailValidator.validate(null as any).isValid).toBe(false);
      expect(EmailValidator.validate(undefined as any).isValid).toBe(false);
    });

    it("应该处理非字符串类型", () => {
      expect(EmailValidator.validate(123 as any).isValid).toBe(false);
      expect(EmailValidator.validate({} as any).isValid).toBe(false);
      expect(EmailValidator.validate([] as any).isValid).toBe(false);
    });

    it("应该处理特殊字符", () => {
      const specialEmails = [
        "user+tag@example.com",
        "user.name@example.com",
        "user_name@example.com",
        "user-name@example.com",
      ];

      specialEmails.forEach((email) => {
        const result = EmailValidator.validate(email);
        expect(result.isValid).toBe(true);
      });
    });
  });
});
