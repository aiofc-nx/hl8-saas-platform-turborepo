import { PhoneNumber } from "./phone-number.vo.js";

describe("PhoneNumber", () => {
  describe("创建电话号码", () => {
    it("应该成功创建有效的国际电话号码", () => {
      const phone = PhoneNumber.create("+86 138-1234-5678");
      expect(phone.value).toBe("+8613812345678");
    });

    it("应该成功创建有效的国内电话号码", () => {
      const phone = PhoneNumber.create("13812345678");
      expect(phone.value).toBe("13812345678");
    });

    it("应该成功创建带国家代码的电话号码", () => {
      const phone = PhoneNumber.create("+1 555-123-4567");
      expect(phone.value).toBe("+15551234567");
    });

    it("应该自动去除空格和连字符", () => {
      const phone = PhoneNumber.create("+86 138 - 1234 - 5678");
      expect(phone.value).toBe("+8613812345678");
    });
  });

  describe("验证规则", () => {
    it("应该在空值时抛出异常", () => {
      expect(() => PhoneNumber.create("")).toThrow("电话号码不能为空");
      expect(() => PhoneNumber.create("   ")).toThrow("电话号码不能为空");
    });

    it("应该在长度不足时抛出异常", () => {
      expect(() => PhoneNumber.create("1234567")).toThrow(
        "电话号码长度必须在8-16个字符之间",
      );
    });

    it("应该在长度过长时抛出异常", () => {
      expect(() => PhoneNumber.create("12345678901234567")).toThrow(
        "电话号码长度必须在8-16个字符之间",
      );
    });

    it("应该在格式无效时抛出异常", () => {
      expect(() => PhoneNumber.create("abc1234567")).toThrow(
        "电话号码格式无效",
      );
      expect(() => PhoneNumber.create("+0 1234567890")).toThrow(
        "电话号码格式无效",
      );
      expect(() => PhoneNumber.create("+86-138-1234-5678")).toThrow(
        "电话号码格式无效",
      );
    });

    it("应该接受有效的电话号码格式", () => {
      expect(() => PhoneNumber.create("+86 13812345678")).not.toThrow();
      expect(() => PhoneNumber.create("13812345678")).not.toThrow();
      expect(() => PhoneNumber.create("+1 5551234567")).not.toThrow();
    });
  });

  describe("业务方法", () => {
    it("应该正确提取国家代码", () => {
      const phone = PhoneNumber.create("+86 13812345678");
      expect(phone.getCountryCode()).toBe("86");
    });

    it("应该正确提取不带国家代码的号码", () => {
      const phone = PhoneNumber.create("+86 13812345678");
      expect(phone.getNumber()).toBe("13812345678");
    });

    it("应该正确识别是否为国际号码", () => {
      const internationalPhone = PhoneNumber.create("+86 13812345678");
      const domesticPhone = PhoneNumber.create("13812345678");

      expect(internationalPhone.isInternational()).toBe(true);
      expect(domesticPhone.isInternational()).toBe(false);
    });

    it("应该正确格式化显示", () => {
      const phone = PhoneNumber.create("+86 13812345678");
      expect(phone.getFormattedDisplay()).toBe("+86 138-1234-5678");
    });

    it("应该正确格式化不带国家代码的显示", () => {
      const phone = PhoneNumber.create("13812345678");
      expect(phone.getFormattedDisplay()).toBe("138-1234-5678");
    });
  });

  describe("相等性比较", () => {
    it("应该正确比较相同的电话号码", () => {
      const phone1 = PhoneNumber.create("+86 138-1234-5678");
      const phone2 = PhoneNumber.create("+86 138-1234-5678");
      expect(phone1.equals(phone2)).toBe(true);
    });

    it("应该正确比较不同的电话号码", () => {
      const phone1 = PhoneNumber.create("+86 138-1234-5678");
      const phone2 = PhoneNumber.create("+86 138-1234-5679");
      expect(phone1.equals(phone2)).toBe(false);
    });

    it("应该正确处理null和undefined的比较", () => {
      const phone = PhoneNumber.create("+86 138-1234-5678");
      expect(phone.equals(null as any)).toBe(false);
      expect(phone.equals(undefined as any)).toBe(false);
    });
  });

  describe("序列化", () => {
    it("应该正确序列化为JSON", () => {
      const phone = PhoneNumber.create("+86 138-1234-5678");
      const json = phone.toJSON();
      expect(json).toBe("+8613812345678");
    });

    it("应该正确转换为字符串", () => {
      const phone = PhoneNumber.create("+86 138-1234-5678");
      expect(phone.toString()).toBe("+8613812345678");
    });
  });

  describe("边界情况", () => {
    it("应该处理最小长度的电话号码", () => {
      const phone = PhoneNumber.create("12345678");
      expect(phone.value).toBe("12345678");
    });

    it("应该处理最大长度的电话号码", () => {
      const phone = PhoneNumber.create("1234567890123456");
      expect(phone.value).toBe("1234567890123456");
    });

    it("应该处理各种格式的空格和连字符", () => {
      const phone1 = PhoneNumber.create("+86 138 1234 5678");
      const phone2 = PhoneNumber.create("+86-138-1234-5678");
      const phone3 = PhoneNumber.create("+86 138-1234-5678");

      expect(phone1.value).toBe("+8613812345678");
      expect(phone2.value).toBe("+8613812345678");
      expect(phone3.value).toBe("+8613812345678");
    });
  });

  describe("国际化支持", () => {
    it("应该支持不同国家的电话号码", () => {
      const chinaPhone = PhoneNumber.create("+86 13812345678");
      const usPhone = PhoneNumber.create("+1 5551234567");
      const ukPhone = PhoneNumber.create("+44 2012345678");

      expect(chinaPhone.getCountryCode()).toBe("86");
      expect(usPhone.getCountryCode()).toBe("1");
      expect(ukPhone.getCountryCode()).toBe("44");
    });

    it("应该正确处理不同长度的国家代码", () => {
      const shortCode = PhoneNumber.create("+1 5551234567");
      const longCode = PhoneNumber.create("+86 13812345678");

      expect(shortCode.getCountryCode()).toBe("1");
      expect(longCode.getCountryCode()).toBe("86");
    });
  });
});
