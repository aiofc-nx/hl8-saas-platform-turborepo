/**
 * @Public 装饰器
 *
 * @description 标记路由或控制器为公开访问，跳过认证
 *
 * ## 业务规则
 *
 * ### 使用规则
 * - 用于标记不需要认证的路由
 * - 可以应用于控制器类或方法
 * - 应用于类时，所有方法都是公开的
 * - 应用于方法时，仅该方法是公开的
 *
 * ### 安全规则
 * - 谨慎使用，确保不会暴露敏感数据
 * - 公开接口应实施速率限制
 * - 公开接口应验证请求参数
 *
 * ## 使用场景
 *
 * 1. **登录注册**：登录、注册、忘记密码等接口
 * 2. **公开资源**：公开文档、公开文章、公开 API
 * 3. **健康检查**：健康检查、就绪检查接口
 * 4. **Webhook**：第三方回调接口
 *
 * @example
 * ```typescript
 * // 应用于控制器类
 * @Public()
 * @Controller('auth')
 * export class AuthController {
 *   @Post('login')
 *   login() {
 *     // 无需认证
 *   }
 * }
 *
 * // 应用于单个方法
 * @Controller('users')
 * export class UsersController {
 *   @Public()
 *   @Get('public-profile/:id')
 *   getPublicProfile(@Param('id') id: string) {
 *     // 无需认证，公开访问
 *   }
 *
 *   @Get('profile')
 *   getProfile() {
 *     // 需要认证
 *   }
 * }
 *
 * // 在守卫中检查
 * @Injectable()
 * export class AuthGuard implements CanActivate {
 *   constructor(private reflector: Reflector) {}
 *
 *   canActivate(context: ExecutionContext): boolean {
 *     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
 *       context.getHandler(),
 *       context.getClass(),
 *     ]);
 *
 *     if (isPublic) {
 *       return true; // 跳过认证
 *     }
 *
 *     // 执行认证逻辑
 *     return this.validateToken();
 *   }
 * }
 * ```
 *
 * @since 0.1.0
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Public 元数据键
 *
 * @description 用于标识公开路由的元数据键
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public 装饰器
 *
 * @description 标记路由或控制器为公开访问
 *
 * @returns 装饰器函数
 *
 * @example
 * ```typescript
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

