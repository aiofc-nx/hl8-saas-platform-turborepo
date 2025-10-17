/**
 * 用例模块导出
 *
 * @description 导出用例相关的所有公共API
 * @since 1.0.0
 */

// 基础设施
export * from "./base/index.js";

// 多租户感知用例
export * from "./base/tenant-aware-use-case.js";

// 装饰器
export * from "./decorators/index.js";

// 注册表
export * from "./registry/index.js";

// 业务用例
export * from "./tenant/index.js";
export * from "./organization/index.js";
export * from "./department/index.js";
export * from "./user/index.js";
export * from "./role/index.js";

// 示例（可选导出，用于学习参考）
// export * from './examples';
