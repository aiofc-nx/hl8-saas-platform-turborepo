/**
 * 聚合根模块导出
 *
 * @description 导出聚合根相关的所有公共API
 * 专注于提供业务模块应有的通用功能组件
 * @since 1.0.0
 */

// 基础设施
export * from "./base/index.js";

// 装饰器
export * from "./decorators/index.js";

// 聚合根验证
export * from "./validation/index.js";

// 业务聚合根
export * from "./organization-aggregate.js";
export * from "./department-aggregate.js";
export * from "./tenant-aggregate.js";
export * from "./role-aggregate.js";
export * from "./permission-aggregate.js";
export * from "./user-role-aggregate.js";
