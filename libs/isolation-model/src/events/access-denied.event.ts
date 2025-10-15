/**
 * 数据访问被拒绝事件
 *
 * @description 当用户尝试访问无权限的数据时触发
 *
 * ## 使用场景
 *
 * - 安全审计
 * - 异常行为检测
 * - 权限问题诊断
 *
 * @since 1.0.0
 */

import type { IsolationContext } from "../entities/isolation-context.entity.js";

export class DataAccessDeniedEvent {
  constructor(
    /** 用户上下文 */
    public readonly userContext: IsolationContext,

    /** 数据上下文 */
    public readonly dataContext: IsolationContext,

    /** 拒绝原因 */
    public readonly reason: string,

    /** 发生时间 */
    public readonly occurredAt: Date = new Date(),
  ) {}
}
