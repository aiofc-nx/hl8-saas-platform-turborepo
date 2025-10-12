/**
 * 隔离上下文创建事件
 * 
 * @description 当请求到达并成功构建隔离上下文时触发
 * 
 * ## 使用场景
 * 
 * - 审计追踪
 * - 上下文传播
 * - 安全监控
 * 
 * @example
 * ```typescript
 * const event = new IsolationContextCreatedEvent(
 *   context,
 *   'req-123',
 *   new Date()
 * );
 * 
 * eventBus.publish(event);
 * ```
 * 
 * @since 1.0.0
 */

import type { IsolationContext } from '../entities/isolation-context.entity.js';

export class IsolationContextCreatedEvent {
  constructor(
    /** 隔离上下文 */
    public readonly context: IsolationContext,
    
    /** 请求 ID */
    public readonly requestId: string,
    
    /** 发生时间 */
    public readonly occurredAt: Date = new Date(),
  ) {}
}

