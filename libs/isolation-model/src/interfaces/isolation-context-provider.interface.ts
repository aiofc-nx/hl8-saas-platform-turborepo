/**
 * 隔离上下文提供者接口
 * 
 * @description 定义上下文存储和获取的标准接口
 * 
 * ## 实现要求
 * 
 * - 必须支持请求级上下文存储
 * - 必须线程安全（Node.js 异步安全）
 * - 获取操作无副作用
 * - 可被任何框架实现（NestJS、Express、Koa 等）
 * 
 * @example
 * ```typescript
 * // NestJS 实现示例
 * class IsolationContextService implements IIsolationContextProvider {
 *   constructor(private readonly cls: ClsService) {}
 *   
 *   getIsolationContext() {
 *     return this.cls.get('ISOLATION_CONTEXT');
 *   }
 *   
 *   setIsolationContext(context) {
 *     this.cls.set('ISOLATION_CONTEXT', context);
 *   }
 * }
 * ```
 * 
 * @since 1.0.0
 */

// 前向声明，避免循环依赖
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IsolationContext } from '../entities/isolation-context.entity.js';

export interface IIsolationContextProvider {
  /**
   * 获取当前隔离上下文
   * 
   * @returns 隔离上下文，不存在返回 undefined
   */
  getIsolationContext(): IsolationContext | undefined;
  
  /**
   * 设置隔离上下文
   * 
   * @param context - 隔离上下文
   */
  setIsolationContext(context: IsolationContext): void;
}

