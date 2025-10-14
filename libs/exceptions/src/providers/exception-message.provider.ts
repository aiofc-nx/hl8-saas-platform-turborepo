/**
 * 异常消息提供者
 *
 * @description 提供异常消息的查询和获取功能，支持消息模板和参数替换
 *
 * ## 业务规则
 *
 * ### 消息提供规则
 * - 根据错误代码（errorCode）返回对应的消息
 * - 支持 title 和 detail 两种消息类型
 * - 支持消息参数替换（模板变量）
 * - 不存在的消息返回 undefined
 *
 * ### 参数替换规则
 * - 使用 `{{key}}` 作为占位符
 * - 参数从 params 对象中获取
 * - 不存在的参数保留占位符
 *
 * ## 使用场景
 *
 * 1. **错误消息国际化**：为不同语言提供消息
 * 2. **统一错误描述**：集中管理错误消息
 * 3. **动态消息生成**：根据参数生成个性化消息
 *
 * @example
 * ```typescript
 * // 实现自定义消息提供者
 * @Injectable()
 * class CustomMessageProvider implements ExceptionMessageProvider {
 *   private readonly messages = {
 *     USER_NOT_FOUND: {
 *       title: '用户未找到',
 *       detail: 'ID 为 "{{userId}}" 的用户不存在',
 *     },
 *   };
 *
 *   getMessage(errorCode: string, messageType: 'title' | 'detail', params?: Record<string, any>): string | undefined {
 *     const message = this.messages[errorCode]?.[messageType];
 *     return message ? this.replaceParams(message, params) : undefined;
 *   }
 *
 *   private replaceParams(template: string, params?: Record<string, any>): string {
 *     if (!params) return template;
 *     return template.replace(/\{\{(\w+)\}\}/g, (match, key) => params[key] ?? match);
 *   }
 * }
 * ```
 *
 * @since 0.1.0
 */

/**
 * 异常消息提供者接口
 *
 * @description 定义获取异常消息的标准接口
 */
export interface ExceptionMessageProvider {
  /**
   * 获取消息
   *
   * @param errorCode - 错误代码（如：USER_NOT_FOUND）
   * @param messageType - 消息类型（title 或 detail）
   * @param params - 消息参数（用于替换模板变量）
   * @returns 消息字符串，如果不存在则返回 undefined
   *
   * @example
   * ```typescript
   * const provider = new CustomMessageProvider();
   * const title = provider.getMessage('USER_NOT_FOUND', 'title');
   * // 返回: "用户未找到"
   *
   * const detail = provider.getMessage('USER_NOT_FOUND', 'detail', { userId: 'user-123' });
   * // 返回: "ID 为 "user-123" 的用户不存在"
   * ```
   */
  getMessage(
    errorCode: string,
    messageType: 'title' | 'detail',
    params?: Record<string, any>,
  ): string | undefined;

  /**
   * 检查是否有消息
   *
   * @param errorCode - 错误代码
   * @param messageType - 消息类型
   * @returns 如果有消息则返回 true
   *
   * @example
   * ```typescript
   * if (provider.hasMessage('USER_NOT_FOUND', 'title')) {
   *   const title = provider.getMessage('USER_NOT_FOUND', 'title');
   * }
   * ```
   */
  hasMessage(errorCode: string, messageType: 'title' | 'detail'): boolean;

  /**
   * 获取所有可用的错误代码列表
   *
   * @returns 错误代码数组
   * @optional
   *
   * @example
   * ```typescript
   * const codes = provider.getAvailableErrorCodes?.();
   * // 返回: ['USER_NOT_FOUND', 'BAD_REQUEST', ...]
   * ```
   */
  getAvailableErrorCodes?(): string[];
}
