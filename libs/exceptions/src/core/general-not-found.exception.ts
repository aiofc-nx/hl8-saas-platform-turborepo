/**
 * 通用 404 未找到异常
 *
 * @description 表示请求的资源不存在
 *
 * ## 业务规则
 *
 * ### 使用场景
 * - 通过 ID 查询资源但未找到
 * - 访问不存在的路由或端点
 * - 请求的数据已被删除
 *
 * ### 响应规则
 * - HTTP 状态码：404
 * - 错误代码：NOT_FOUND
 * - 应包含具体的资源标识信息
 *
 * ## 使用场景
 *
 * 1. **资源查询失败**：数据库中找不到指定资源
 * 2. **API 端点不存在**：访问未定义的路由
 * 3. **文件不存在**：请求的文件或资源已删除
 *
 * @example
 * ```typescript
 * // 资源未找到
 * const user = await this.userRepo.findById(userId);
 * if (!user) {
 *   throw new GeneralNotFoundException(
 *     '用户未找到',
 *     `ID 为 "${userId}" 的用户不存在`,
 *     { userId }
 *   );
 * }
 *
 * // 多个资源未找到
 * const products = await this.productRepo.findByIds(productIds);
 * if (products.length === 0) {
 *   throw new GeneralNotFoundException(
 *     '产品未找到',
 *     '未找到任何匹配的产品',
 *     { productIds }
 *   );
 * }
 *
 * // 路由不存在
 * throw new GeneralNotFoundException(
 *   '端点未找到',
 *   `API 端点 "${path}" 不存在`
 * );
 * ```
 *
 * @since 0.1.0
 */

import { AbstractHttpException } from "./abstract-http.exception.js";

/**
 * 通用 404 未找到异常
 *
 * @description 表示请求的资源不存在
 */
export class GeneralNotFoundException extends AbstractHttpException {
  /**
   * 创建 404 未找到异常
   *
   * @param title - 错误的简短摘要（如："用户未找到"）
   * @param detail - 错误的详细说明（如："ID 为 'user-123' 的用户不存在"）
   * @param data - 附加数据（可选，如：{ userId: 'user-123' }）
   *
   * @example
   * ```typescript
   * throw new GeneralNotFoundException(
   *   '订单未找到',
   *   `订单号 "${orderId}" 不存在或已被删除`,
   *   { orderId, timestamp: new Date() }
   * );
   * ```
   */
  constructor(title: string, detail: string, data?: any) {
    super("NOT_FOUND", title, detail, 404, data);
  }
}
