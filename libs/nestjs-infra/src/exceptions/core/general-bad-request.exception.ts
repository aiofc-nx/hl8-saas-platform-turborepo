/**
 * 通用 400 错误请求异常
 *
 * @description 表示客户端的请求无效或不符合要求
 *
 * ## 业务规则
 *
 * ### 使用场景
 * - 请求参数验证失败
 * - 请求格式不正确
 * - 业务规则校验失败
 * - 非法操作请求
 *
 * ### 响应规则
 * - HTTP 状态码：400
 * - 错误代码：BAD_REQUEST
 * - 应包含具体的验证失败信息
 *
 * ## 使用场景
 *
 * 1. **参数验证**：请求参数不符合格式要求
 * 2. **业务校验**：违反业务规则
 * 3. **状态冲突**：操作与当前状态冲突
 * 4. **非法操作**：不允许的操作请求
 *
 * @example
 * ```typescript
 * // 参数验证失败
 * if (!email.includes('@')) {
 *   throw new GeneralBadRequestException(
 *     '邮箱格式错误',
 *     `邮箱地址 "${email}" 格式不正确`,
 *     { email, expectedFormat: 'user@example.com' }
 *   );
 * }
 *
 * // 业务规则校验失败
 * if (quantity > stock) {
 *   throw new GeneralBadRequestException(
 *     '库存不足',
 *     `请求数量 ${quantity} 超过可用库存 ${stock}`,
 *     { requestedQuantity: quantity, availableStock: stock }
 *   );
 * }
 *
 * // 状态冲突
 * if (order.status === 'CANCELLED') {
 *   throw new GeneralBadRequestException(
 *     '订单已取消',
 *     '无法修改已取消的订单',
 *     { orderId: order.id, currentStatus: order.status }
 *   );
 * }
 *
 * // 批量验证失败
 * const errors = validateUser(userData);
 * if (errors.length > 0) {
 *   throw new GeneralBadRequestException(
 *     '用户数据验证失败',
 *     '请求数据包含多个错误',
 *     { validationErrors: errors }
 *   );
 * }
 * ```
 *
 * @since 0.1.0
 */

import { AbstractHttpException } from './abstract-http.exception.js';

/**
 * 通用 400 错误请求异常
 *
 * @description 表示客户端的请求无效或不符合要求
 */
export class GeneralBadRequestException extends AbstractHttpException {
  /**
   * 创建 400 错误请求异常
   *
   * @param title - 错误的简短摘要（如："参数验证失败"）
   * @param detail - 错误的详细说明（如："邮箱地址格式不正确"）
   * @param data - 附加数据（可选，如：{ field: 'email', value: 'invalid' }）
   *
   * @example
   * ```typescript
   * throw new GeneralBadRequestException(
   *   '日期范围错误',
   *   `结束日期 ${endDate} 不能早于开始日期 ${startDate}`,
   *   { startDate, endDate }
   * );
   * ```
   */
  constructor(title: string, detail: string, data?: any) {
    super('BAD_REQUEST', title, detail, 400, data);
  }
}

