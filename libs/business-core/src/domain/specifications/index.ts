/**
 * 规范模式导出
 *
 * @description 导出规范模式相关的所有公共API
 * @since 1.0.0
 */

// 基础规范
export * from "./base/index.js";

// 业务规范
export * from "./tenant-specifications.js";
export * from "./organization-specifications.js";
export * from "./department-specifications.js";

// 规范装饰器
export * from "./decorators/index.js";

// 规范工厂
export * from "./specification-factory.js";
