/**
 * 业务规则模块导出
 *
 * @description 导出业务规则相关的所有公共API
 * 专注于提供业务模块所需的通用业务规则功能组件
 * @since 1.0.0
 */

// 基础业务规则接口
export * from "./base-business-rule.interface.js";

// 业务规则管理器
export * from "./business-rule-manager.js";
export * from "./business-rule-factory.js";

// 具体业务规则实现
export * from "./tenant-name.rule.js";
export * from "./organization-level.rule.js";
export * from "./department-level.rule.js";
export * from "./email-format.rule.js";
