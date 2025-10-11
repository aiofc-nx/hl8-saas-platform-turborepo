/**
 * @CurrentIsolation 装饰器
 *
 * @description 注入当前隔离上下文到控制器方法参数
 *
 * @since 0.2.0
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IsolationContext } from '../../shared/entities/isolation-context.entity.js';

/**
 * CurrentIsolation 装饰器
 *
 * @example
 * ```typescript
 * @Get()
 * getData(@CurrentIsolation() context: IsolationContext) {
 *   console.log(context.tenantId);
 * }
 * ```
 */
export const CurrentIsolation = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IsolationContext | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.isolationContext;
  },
);

