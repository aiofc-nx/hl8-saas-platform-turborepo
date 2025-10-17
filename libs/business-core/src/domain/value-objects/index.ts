/**
 * 值对象导出文件
 *
 * @description 导出所有值对象类
 * @since 1.0.0
 */

// 基础值对象
export * from "./base-value-object.js";

// 业务规则集成的值对象
export * from "./email.vo.js";
export * from "./phone-number.vo.js";

// 通用值对象库（可重用的抽象基类）
export * from "./common/index.js";

// 其他值对象
// entity-id 已移动到 isolation-model，通过 ids 重新导出
export * from "./identities/index.js";
export * from "./ids/index.js";
export * from "./statuses/index.js";
export * from "./types/index.js";
export * from "./security/index.js";
export * from "./audit/index.js";
