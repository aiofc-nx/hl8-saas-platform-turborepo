/**
 * 业务规则工厂
 *
 * @description 创建和配置业务规则实例
 * @since 1.0.0
 */

import { BusinessRuleManager } from "./business-rule-manager.js";
import { TenantNameRule } from "./tenant-name.rule.js";
import { OrganizationLevelRule } from "./organization-level.rule.js";
import { DepartmentLevelRule } from "./department-level.rule.js";
import { EmailFormatRule } from "./email-format.rule.js";

/**
 * 业务规则工厂
 *
 * @description 提供业务规则的创建和配置功能
 */
export class BusinessRuleFactory {
  /**
   * 创建默认的业务规则管理器
   *
   * @returns 配置好的业务规则管理器
   */
  static createDefaultManager(): BusinessRuleManager {
    const manager = new BusinessRuleManager();

    // 注册租户相关规则
    manager.registerRule(new TenantNameRule());

    // 注册组织相关规则
    manager.registerRule(new OrganizationLevelRule());

    // 注册部门相关规则
    manager.registerRule(new DepartmentLevelRule());

    // 注册邮箱相关规则
    manager.registerRule(new EmailFormatRule());

    // 创建规则组
    manager.createRuleGroup("TENANT_RULES", ["TENANT_NAME_RULE"]);
    manager.createRuleGroup("ORGANIZATION_RULES", ["ORGANIZATION_LEVEL_RULE"]);
    manager.createRuleGroup("DEPARTMENT_RULES", ["DEPARTMENT_LEVEL_RULE"]);
    manager.createRuleGroup("EMAIL_RULES", ["EMAIL_FORMAT_RULE"]);

    return manager;
  }

  /**
   * 创建租户业务规则管理器
   *
   * @returns 租户业务规则管理器
   */
  static createTenantManager(): BusinessRuleManager {
    const manager = new BusinessRuleManager();
    manager.registerRule(new TenantNameRule());
    manager.createRuleGroup("TENANT_RULES", ["TENANT_NAME_RULE"]);
    return manager;
  }

  /**
   * 创建组织业务规则管理器
   *
   * @returns 组织业务规则管理器
   */
  static createOrganizationManager(): BusinessRuleManager {
    const manager = new BusinessRuleManager();
    manager.registerRule(new OrganizationLevelRule());
    manager.createRuleGroup("ORGANIZATION_RULES", ["ORGANIZATION_LEVEL_RULE"]);
    return manager;
  }

  /**
   * 创建部门业务规则管理器
   *
   * @returns 部门业务规则管理器
   */
  static createDepartmentManager(): BusinessRuleManager {
    const manager = new BusinessRuleManager();
    manager.registerRule(new DepartmentLevelRule());
    manager.createRuleGroup("DEPARTMENT_RULES", ["DEPARTMENT_LEVEL_RULE"]);
    return manager;
  }

  /**
   * 创建邮箱业务规则管理器
   *
   * @returns 邮箱业务规则管理器
   */
  static createEmailManager(): BusinessRuleManager {
    const manager = new BusinessRuleManager();
    manager.registerRule(new EmailFormatRule());
    manager.createRuleGroup("EMAIL_RULES", ["EMAIL_FORMAT_RULE"]);
    return manager;
  }

  /**
   * 创建自定义业务规则管理器
   *
   * @param ruleTypes - 规则类型列表
   * @returns 自定义业务规则管理器
   */
  static createCustomManager(ruleTypes: string[]): BusinessRuleManager {
    const manager = new BusinessRuleManager();

    for (const ruleType of ruleTypes) {
      switch (ruleType) {
        case "TENANT_NAME":
          manager.registerRule(new TenantNameRule());
          break;
        case "ORGANIZATION_LEVEL":
          manager.registerRule(new OrganizationLevelRule());
          break;
        case "DEPARTMENT_LEVEL":
          manager.registerRule(new DepartmentLevelRule());
          break;
        case "EMAIL_FORMAT":
          manager.registerRule(new EmailFormatRule());
          break;
        default:
          console.warn(`未知的规则类型: ${ruleType}`);
      }
    }

    return manager;
  }
}
