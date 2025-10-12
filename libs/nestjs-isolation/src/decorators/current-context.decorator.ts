/**
 * 当前上下文参数装饰器
 * 
 * @description 注入当前请求的隔离上下文到控制器方法参数
 * 
 * ## 使用场景
 * 
 * - 在控制器方法中获取隔离上下文
 * - 传递给服务层进行数据过滤
 * 
 * @since 1.0.0
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CLS_REQ, CLS_ID } from 'nestjs-cls';
import { IsolationContext } from '@hl8/isolation-model';

const ISOLATION_CONTEXT_KEY = 'ISOLATION_CONTEXT';

/**
 * 获取当前请求的隔离上下文
 * 
 * @description 从 CLS 存储中获取隔离上下文
 * 
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   @Get()
 *   async getUsers(@CurrentContext() context: IsolationContext) {
 *     // context.tenantId, context.organizationId 等
 *     return this.userService.findByContext(context);
 *   }
 * }
 * ```
 */
export const CurrentContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IsolationContext | undefined => {
    const request = ctx.switchToHttp().getRequest();
    
    // nestjs-cls 将 CLS 存储作为 Symbol 注入到 request 对象中
    const clsStore = request[CLS_REQ];
    
    if (!clsStore) {
      // 返回平台级上下文而不是抛出错误
      return IsolationContext.platform();
    }
    
    return clsStore[ISOLATION_CONTEXT_KEY] ?? IsolationContext.platform();
  },
);

