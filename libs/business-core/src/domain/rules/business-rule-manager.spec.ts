import { BusinessRuleManager } from "./business-rule-manager.js";
import {
  IBaseBusinessRule,
  IBusinessRuleValidationResult,
} from "./base-business-rule.interface.js";

// 模拟业务规则实现
class MockBusinessRule implements IBaseBusinessRule {
  constructor(
    public code: string,
    public name: string,
    public description: string,
    private shouldPass: boolean = true,
  ) {}

  async validate(context: any): Promise<IBusinessRuleValidationResult> {
    return {
      isValid: this.shouldPass,
      message: this.shouldPass ? "规则验证通过" : "规则验证失败",
      details: { ruleCode: this.code },
    };
  }
}

describe("BusinessRuleManager", () => {
  let ruleManager: BusinessRuleManager;
  let mockRule: MockBusinessRule;
  let mockRule2: MockBusinessRule;

  beforeEach(() => {
    ruleManager = new BusinessRuleManager();
    mockRule = new MockBusinessRule("RULE_001", "测试规则1", "测试规则描述1");
    mockRule2 = new MockBusinessRule("RULE_002", "测试规则2", "测试规则描述2");
  });

  describe("规则注册", () => {
    it("应该成功注册单个规则", () => {
      ruleManager.registerRule(mockRule);

      expect(ruleManager.hasRule("RULE_001")).toBe(true);
      expect(ruleManager.getRuleCount()).toBe(1);
    });

    it("应该成功注册多个规则", () => {
      ruleManager.registerRules([mockRule, mockRule2]);

      expect(ruleManager.hasRule("RULE_001")).toBe(true);
      expect(ruleManager.hasRule("RULE_002")).toBe(true);
      expect(ruleManager.getRuleCount()).toBe(2);
    });

    it("应该处理重复注册的规则", () => {
      ruleManager.registerRule(mockRule);
      ruleManager.registerRule(mockRule); // 重复注册

      expect(ruleManager.getRuleCount()).toBe(1);
    });
  });

  describe("规则注销", () => {
    beforeEach(() => {
      ruleManager.registerRule(mockRule);
      ruleManager.registerRule(mockRule2);
    });

    it("应该成功注销规则", () => {
      ruleManager.unregisterRule("RULE_001");

      expect(ruleManager.hasRule("RULE_001")).toBe(false);
      expect(ruleManager.hasRule("RULE_002")).toBe(true);
      expect(ruleManager.getRuleCount()).toBe(1);
    });

    it("应该处理注销不存在的规则", () => {
      expect(() => {
        ruleManager.unregisterRule("NON_EXISTENT");
      }).not.toThrow();

      expect(ruleManager.getRuleCount()).toBe(2);
    });
  });

  describe("规则查询", () => {
    beforeEach(() => {
      ruleManager.registerRule(mockRule);
      ruleManager.registerRule(mockRule2);
    });

    it("应该正确检查规则是否存在", () => {
      expect(ruleManager.hasRule("RULE_001")).toBe(true);
      expect(ruleManager.hasRule("RULE_002")).toBe(true);
      expect(ruleManager.hasRule("NON_EXISTENT")).toBe(false);
    });

    it("应该正确获取规则数量", () => {
      expect(ruleManager.getRuleCount()).toBe(2);
    });

    it("应该正确获取所有规则代码", () => {
      const ruleCodes = ruleManager.getAllRuleCodes();
      expect(ruleCodes).toContain("RULE_001");
      expect(ruleCodes).toContain("RULE_002");
      expect(ruleCodes).toHaveLength(2);
    });

    it("应该正确获取规则", () => {
      const rule = ruleManager.getRule("RULE_001");
      expect(rule).toBe(mockRule);
      expect(rule?.code).toBe("RULE_001");
    });

    it("应该返回undefined获取不存在的规则", () => {
      const rule = ruleManager.getRule("NON_EXISTENT");
      expect(rule).toBeUndefined();
    });
  });

  describe("规则验证", () => {
    beforeEach(() => {
      ruleManager.registerRule(mockRule);
    });

    it("应该成功验证单个规则", async () => {
      const result = await ruleManager.validateRule("RULE_001", {});

      expect(result.isValid).toBe(true);
      expect(result.message).toBe("规则验证通过");
      expect(result.details).toEqual({ ruleCode: "RULE_001" });
    });

    it("应该处理验证不存在的规则", async () => {
      const result = await ruleManager.validateRule("NON_EXISTENT", {});

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("规则不存在");
    });

    it("应该成功验证多个规则", async () => {
      const failingRule = new MockBusinessRule(
        "RULE_FAIL",
        "失败规则",
        "总是失败的规则",
        false,
      );
      ruleManager.registerRule(failingRule);

      const results = await ruleManager.validateRules([
        "RULE_001",
        "RULE_FAIL",
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
    });

    it("应该处理验证不存在的规则列表", async () => {
      const results = await ruleManager.validateRules([
        "RULE_001",
        "NON_EXISTENT",
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
    });
  });

  describe("规则分组", () => {
    it("应该成功创建规则分组", () => {
      ruleManager.createRuleGroup("GROUP_1", ["RULE_001", "RULE_002"]);
      ruleManager.registerRule(mockRule);
      ruleManager.registerRule(mockRule2);

      expect(ruleManager.hasRuleGroup("GROUP_1")).toBe(true);
      expect(ruleManager.getRuleGroup("GROUP_1")).toEqual([
        "RULE_001",
        "RULE_002",
      ]);
    });

    it("应该成功验证规则分组", async () => {
      ruleManager.registerRule(mockRule);
      ruleManager.registerRule(mockRule2);
      ruleManager.createRuleGroup("GROUP_1", ["RULE_001", "RULE_002"]);

      const results = await ruleManager.validateRuleGroup("GROUP_1", {});

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.isValid)).toBe(true);
    });

    it("应该处理验证不存在的规则分组", async () => {
      const results = await ruleManager.validateRuleGroup("NON_EXISTENT", {});

      expect(results).toHaveLength(0);
    });

    it("应该成功删除规则分组", () => {
      ruleManager.createRuleGroup("GROUP_1", ["RULE_001"]);
      expect(ruleManager.hasRuleGroup("GROUP_1")).toBe(true);

      ruleManager.deleteRuleGroup("GROUP_1");
      expect(ruleManager.hasRuleGroup("GROUP_1")).toBe(false);
    });
  });

  describe("规则统计", () => {
    beforeEach(() => {
      ruleManager.registerRule(mockRule);
      ruleManager.registerRule(mockRule2);
      ruleManager.createRuleGroup("GROUP_1", ["RULE_001"]);
    });

    it("应该正确获取规则统计信息", () => {
      const stats = ruleManager.getRuleStatistics();

      expect(stats.totalRules).toBe(2);
      expect(stats.totalGroups).toBe(1);
      expect(stats.ruleCodes).toContain("RULE_001");
      expect(stats.ruleCodes).toContain("RULE_002");
      expect(stats.groupNames).toContain("GROUP_1");
    });
  });

  describe("边界情况", () => {
    it("应该处理空规则列表", () => {
      ruleManager.registerRules([]);
      expect(ruleManager.getRuleCount()).toBe(0);
    });

    it("应该处理空规则分组", () => {
      ruleManager.createRuleGroup("EMPTY_GROUP", []);
      expect(ruleManager.hasRuleGroup("EMPTY_GROUP")).toBe(true);
      expect(ruleManager.getRuleGroup("EMPTY_GROUP")).toEqual([]);
    });

    it("应该处理验证空规则列表", async () => {
      const results = await ruleManager.validateRules([]);
      expect(results).toHaveLength(0);
    });
  });

  describe("错误处理", () => {
    it("应该处理规则验证异常", async () => {
      const errorRule = new MockBusinessRule(
        "ERROR_RULE",
        "错误规则",
        "抛出异常",
      );
      // 模拟验证时抛出异常
      errorRule.validate = jest.fn().mockRejectedValue(new Error("验证异常"));

      ruleManager.registerRule(errorRule);

      const result = await ruleManager.validateRule("ERROR_RULE", {});

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("验证异常");
    });
  });
});
