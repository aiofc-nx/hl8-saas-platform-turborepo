import { TenantNameRule } from "./tenant-name.rule.js";
import {
  BusinessRuleType,
  BusinessRuleScope,
} from "../../common/enums/business/index.js";

describe("TenantNameRule", () => {
  let rule: TenantNameRule;

  beforeEach(() => {
    rule = new TenantNameRule();
  });

  describe("规则属性", () => {
    it("应该具有正确的规则属性", () => {
      expect(rule.id).toBe("tenant-name-rule");
      expect(rule.code).toBe("TENANT_NAME_RULE");
      expect(rule.name).toBe("租户名称规则");
      expect(rule.description).toBe("租户名称必须非空且长度不超过100字符");
      expect(rule.type).toBe(BusinessRuleType.FORMAT_VALIDATION);
      expect(rule.scope).toBe(BusinessRuleScope.FIELD);
    });
  });

  describe("验证功能", () => {
    it("应该通过有效的租户名称", () => {
      const validNames = [
        "测试租户",
        "企业租户",
        "社区租户",
        "团队租户",
        "个人租户",
        "A".repeat(100), // 最大长度
      ];

      validNames.forEach((name) => {
        const result = rule.validate(name);
        expect(result.isValid).toBe(true);
        expect(result.errorMessage).toBeUndefined();
        expect(result.errorCode).toBeUndefined();
      });
    });

    it("应该拒绝空的租户名称", () => {
      const emptyNames = ["", "   ", "\t", "\n", "  \t  "];

      emptyNames.forEach((name) => {
        const result = rule.validate(name);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe("租户名称不能为空");
        expect(result.errorCode).toBe("TENANT_NAME_EMPTY");
        expect(result.context).toEqual({ value: name });
      });
    });

    it("应该拒绝过长的租户名称", () => {
      const longName = "A".repeat(101);
      const result = rule.validate(longName);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("租户名称长度不能超过100字符");
      expect(result.errorCode).toBe("TENANT_NAME_TOO_LONG");
      expect(result.context).toEqual({
        value: longName,
        length: 101,
      });
    });

    it("应该拒绝null和undefined", () => {
      const result1 = rule.validate(null as any);
      expect(result1.isValid).toBe(false);
      expect(result1.errorMessage).toBe("租户名称不能为空");

      const result2 = rule.validate(undefined as any);
      expect(result2.isValid).toBe(false);
      expect(result2.errorMessage).toBe("租户名称不能为空");
    });
  });

  describe("边界情况", () => {
    it("应该处理最大长度的租户名称", () => {
      const maxLengthName = "A".repeat(100);
      const result = rule.validate(maxLengthName);

      expect(result.isValid).toBe(true);
    });

    it("应该处理最小长度的租户名称", () => {
      const minLengthName = "A";
      const result = rule.validate(minLengthName);

      expect(result.isValid).toBe(true);
    });

    it("应该处理包含特殊字符的租户名称", () => {
      const specialNames = [
        "租户-名称",
        "租户_名称",
        "租户.名称",
        "租户 名称",
        "租户@名称",
        "租户#名称",
        "租户$名称",
        "租户%名称",
        "租户^名称",
        "租户&名称",
        "租户*名称",
        "租户(名称)",
        "租户)名称",
        "租户+名称",
        "租户=名称",
        "租户[名称]",
        "租户{名称}",
        "租户}名称",
        "租户|名称",
        "租户\\名称",
        "租户:名称",
        "租户;名称",
        "租户'名称",
        '租户"名称',
        "租户<名称>",
        "租户,名称",
        "租户.名称",
        "租户?名称",
        "租户/名称",
        "租户`名称",
        "租户~名称",
        "租户!名称",
      ];

      specialNames.forEach((name) => {
        const result = rule.validate(name);
        expect(result.isValid).toBe(true);
      });
    });

    it("应该处理Unicode字符的租户名称", () => {
      const unicodeNames = [
        "测试租户",
        "企业租户",
        "社区租户",
        "团队租户",
        "个人租户",
        "租户名称",
        "租户名称测试",
        "租户名称测试企业",
        "租户名称测试企业社区",
        "租户名称测试企业社区团队",
        "租户名称测试企业社区团队个人",
      ];

      unicodeNames.forEach((name) => {
        const result = rule.validate(name);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("错误处理", () => {
    it("应该提供详细的错误信息", () => {
      const result = rule.validate("");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("租户名称不能为空");
      expect(result.errorCode).toBe("TENANT_NAME_EMPTY");
      expect(result.context).toEqual({ value: "" });
    });

    it("应该提供长度信息当名称过长时", () => {
      const longName = "A".repeat(101);
      const result = rule.validate(longName);

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("租户名称长度不能超过100字符");
      expect(result.errorCode).toBe("TENANT_NAME_TOO_LONG");
      expect(result.context).toEqual({
        value: longName,
        length: 101,
      });
    });
  });

  describe("性能测试", () => {
    it("应该快速处理大量验证", () => {
      const start = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        rule.validate(`租户名称${i}`);
      }

      const end = Date.now();
      const duration = end - start;

      // 应该在合理时间内完成（这里设置为100ms，实际可能更快）
      expect(duration).toBeLessThan(100);
    });

    it("应该快速处理长字符串验证", () => {
      const longName = "A".repeat(1000);
      const start = Date.now();

      rule.validate(longName);

      const end = Date.now();
      const duration = end - start;

      // 应该在合理时间内完成
      expect(duration).toBeLessThan(10);
    });
  });

  describe("规则组合", () => {
    it("应该支持与其他规则组合", () => {
      const result1 = rule.validate("测试租户");
      const result2 = rule.validate("");

      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(false);
    });
  });
});
