/**
 * 隔离上下文切换事件
 *
 * @description 当用户切换组织或部门时触发
 *
 * ## 使用场景
 *
 * - 用户行为分析
 * - 异常检测
 * - 审计追踪
 *
 * @since 1.0.0
 */

import type { IsolationContext } from '../entities/isolation-context.entity.js';

export class IsolationContextSwitchedEvent {
  constructor(
    /** 切换前的上下文 */
    public readonly from: IsolationContext,

    /** 切换后的上下文 */
    public readonly to: IsolationContext,

    /** 切换原因 */
    public readonly reason: string,

    /** 发生时间 */
    public readonly occurredAt: Date = new Date(),
  ) {}
}
