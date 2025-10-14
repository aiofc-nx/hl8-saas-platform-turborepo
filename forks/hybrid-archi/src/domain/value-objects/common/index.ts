/**
 * 通用值对象库
 *
 * @description 提供可重用的值对象抽象基类，减少业务模块的样板代码
 *
 * ## 包含的通用值对象
 *
 * - **Code**: 用于各种代码字段（租户代码、产品代码等）
 * - **Domain**: 用于域名字段验证
 * - **Level**: 用于层级、等级字段
 * - **Name**: 用于各种名称字段
 * - **Description**: 用于描述字段
 *
 * ## 使用方式
 *
 * ```typescript
 * import { Code, Domain, Level, Name, Description } from '@hl8/hybrid-archi';
 *
 * // 继承通用值对象并添加业务特定规则
 * export class TenantCode extends Code {
 *   protected override validate(value: string): void {
 *     super.validate(value);  // 通用验证
 *     this.validateLength(value, 3, 20, '租户代码');
 *   }
 * }
 * ```
 *
 * @module common
 * @since 1.1.0
 */

export { Code } from './code.vo';
export { Domain } from './domain.vo';
export { Level } from './level.vo';
export { Name } from './name.vo';
export { Description } from './description.vo';

