/**
 * 业务规则管理器
 *
 * @description 管理业务规则的注册、验证和执行
 * @since 1.0.0
 */

// import { EntityId } from "@hl8/isolation-model";
import {
  IBaseBusinessRule,
  IBusinessRuleManager,
  IBusinessRuleValidationResult,
} from "./base-business-rule.interface.js";

/**
 * 业务规则管理器实现
 *
 * @description 提供业务规则的注册、验证和管理功能
 */
export class BusinessRuleManager implements IBusinessRuleManager {
  private rules = new Map<string, IBaseBusinessRule>();
  private ruleGroups = new Map<string, string[]>();

  /**
   * 注册业务规则
   *
   * @param rule - 业务规则
   */
  registerRule(rule: IBaseBusinessRule): void {
    this.rules.set(rule.code, rule);
  }

  /**
   * 批量注册业务规则
   *
   * @param rules - 业务规则列表
   */
  registerRules(rules: IBaseBusinessRule[]): void {
    for (const rule of rules) {
      this.registerRule(rule);
    }
  }

  /**
   * 注销业务规则
   *
   * @param ruleCode - 规则代码
   */
  unregisterRule(ruleCode: string): void {
    this.rules.delete(ruleCode);
  }

  /**
   * 获取业务规则
   *
   * @param ruleCode - 规则代码
   * @returns 业务规则
   */
  getRule(ruleCode: string): IBaseBusinessRule | undefined {
    return this.rules.get(ruleCode);
  }

  /**
   * 获取所有业务规则
   *
   * @returns 所有业务规则
   */
  getAllRules(): IBaseBusinessRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 验证业务规则
   *
   * @param ruleCode - 规则代码
   * @param value - 要验证的值
   * @param context - 验证上下文
   * @returns 验证结果
   */
  validateRule(
    ruleCode: string,
    value: unknown,
    _context?: Record<string, unknown>,
  ): IBusinessRuleValidationResult {
    const rule = this.rules.get(ruleCode);
    if (!rule) {
      return {
        isValid: false,
        errorMessage: `业务规则 ${ruleCode} 不存在`,
        errorCode: "RULE_NOT_FOUND",
        context: { ruleCode, value },
      };
    }

    try {
      return rule.validate(value);
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `规则验证失败: ${error instanceof Error ? error.message : String(error)}`,
        errorCode: "RULE_VALIDATION_ERROR",
        context: { ruleCode, value, error },
      };
    }
  }

  /**
   * 异步验证业务规则
   *
   * @param ruleCode - 规则代码
   * @param value - 要验证的值
   * @param context - 验证上下文
   * @returns 验证结果的Promise
   */
  async validateRuleAsync(
    ruleCode: string,
    value: unknown,
    _context?: Record<string, unknown>,
  ): Promise<IBusinessRuleValidationResult> {
    const rule = this.rules.get(ruleCode);
    if (!rule) {
      return {
        isValid: false,
        errorMessage: `业务规则 ${ruleCode} 不存在`,
        errorCode: "RULE_NOT_FOUND",
        context: { ruleCode, value },
      };
    }

    try {
      return await rule.validateAsync(value);
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `规则验证失败: ${error instanceof Error ? error.message : String(error)}`,
        errorCode: "RULE_VALIDATION_ERROR",
        context: { ruleCode, value, error },
      };
    }
  }

  /**
   * 批量验证业务规则
   *
   * @param ruleCodes - 规则代码列表
   * @param value - 要验证的值
   * @param context - 验证上下文
   * @returns 验证结果映射
   */
  validateRules(
    ruleCodes: string[],
    value: unknown,
    context?: Record<string, unknown>,
  ): Record<string, IBusinessRuleValidationResult> {
    const results: Record<string, IBusinessRuleValidationResult> = {};

    for (const ruleCode of ruleCodes) {
      results[ruleCode] = this.validateRule(ruleCode, value, context);
    }

    return results;
  }

  /**
   * 异步批量验证业务规则
   *
   * @param ruleCodes - 规则代码列表
   * @param value - 要验证的值
   * @param context - 验证上下文
   * @returns 验证结果映射的Promise
   */
  async validateRulesAsync(
    ruleCodes: string[],
    value: unknown,
    context?: Record<string, unknown>,
  ): Promise<Record<string, IBusinessRuleValidationResult>> {
    const results: Record<string, IBusinessRuleValidationResult> = {};

    const promises = ruleCodes.map(async (ruleCode) => {
      const result = await this.validateRuleAsync(ruleCode, value, context);
      return { ruleCode, result };
    });

    const resolvedResults = await Promise.all(promises);

    for (const { ruleCode, result } of resolvedResults) {
      results[ruleCode] = result;
    }

    return results;
  }

  /**
   * 创建规则组
   *
   * @param groupName - 组名
   * @param ruleCodes - 规则代码列表
   */
  createRuleGroup(groupName: string, ruleCodes: string[]): void {
    this.ruleGroups.set(groupName, ruleCodes);
  }

  /**
   * 验证规则组
   *
   * @param groupName - 组名
   * @param value - 要验证的值
   * @param context - 验证上下文
   * @returns 验证结果映射
   */
  validateRuleGroup(
    groupName: string,
    value: unknown,
    context?: Record<string, unknown>,
  ): Record<string, IBusinessRuleValidationResult> {
    const ruleCodes = this.ruleGroups.get(groupName);
    if (!ruleCodes) {
      return {
        [groupName]: {
          isValid: false,
          errorMessage: `规则组 ${groupName} 不存在`,
          errorCode: "RULE_GROUP_NOT_FOUND",
          context: { groupName, value },
        },
      };
    }

    return this.validateRules(ruleCodes, value, context);
  }

  /**
   * 检查规则是否存在
   *
   * @param ruleCode - 规则代码
   * @returns 规则是否存在
   */
  hasRule(ruleCode: string): boolean {
    return this.rules.has(ruleCode);
  }

  /**
   * 获取规则数量
   *
   * @returns 规则数量
   */
  getRuleCount(): number {
    return this.rules.size;
  }

  /**
   * 清空所有规则
   */
  clearRules(): void {
    this.rules.clear();
    this.ruleGroups.clear();
  }

  /**
   * 获取规则统计信息
   *
   * @returns 规则统计信息
   */
  getStatistics(): Record<string, unknown> {
    const rules = Array.from(this.rules.values());
    const typeStats = rules.reduce(
      (stats, rule) => {
        const type = rule.type;
        stats[type] = (stats[type] || 0) + 1;
        return stats;
      },
      {} as Record<string, number>,
    );

    const scopeStats = rules.reduce(
      (stats, rule) => {
        const scope = rule.scope;
        stats[scope] = (stats[scope] || 0) + 1;
        return stats;
      },
      {} as Record<string, number>,
    );

    return {
      totalRules: this.rules.size,
      totalGroups: this.ruleGroups.size,
      typeStats,
      scopeStats,
    };
  }
}
