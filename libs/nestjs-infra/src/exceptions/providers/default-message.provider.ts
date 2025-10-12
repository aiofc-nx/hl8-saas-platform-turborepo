/**
 * 默认消息提供者
 *
 * @description 提供默认的异常消息实现，包含常见错误的中文消息
 *
 * ## 业务规则
 *
 * ### 支持的错误代码
 * - NOT_FOUND：404 未找到错误
 * - BAD_REQUEST：400 错误请求
 * - INTERNAL_SERVER_ERROR：500 服务器错误
 *
 * ### 参数替换
 * - 使用 `{{key}}` 作为占位符
 * - 支持嵌套对象参数（如：`{{user.id}}`）
 * - 不存在的参数保留占位符
 *
 * @example
 * ```typescript
 * const provider = new DefaultMessageProvider();
 *
 * // 使用默认消息
 * const title = provider.getMessage('NOT_FOUND', 'title');
 * // 返回: "资源未找到"
 *
 * // 使用参数替换
 * const detail = provider.getMessage('NOT_FOUND', 'detail', { resource: '用户' });
 * // 返回: "请求的用户不存在"
 * ```
 *
 * @since 0.1.0
 */

import { Injectable } from '@nestjs/common';
import { ExceptionMessageProvider } from './exception-message.provider.js';

/**
 * 默认消息提供者
 *
 * @description 提供常见错误的默认中文消息
 */
@Injectable()
export class DefaultMessageProvider implements ExceptionMessageProvider {
  /**
   * 消息映射表
   *
   * @private
   */
  private readonly messages: Record<
    string,
    { title: string; detail: string }
  > = {
    NOT_FOUND: {
      title: '资源未找到',
      detail: '请求的{{resource}}不存在',
    },
    BAD_REQUEST: {
      title: '错误的请求',
      detail: '请求参数不符合要求',
    },
    INTERNAL_SERVER_ERROR: {
      title: '服务器内部错误',
      detail: '处理请求时发生未预期的错误',
    },
  };

  /**
   * 获取消息
   *
   * @param errorCode - 错误代码
   * @param messageType - 消息类型（title 或 detail）
   * @param params - 消息参数
   * @returns 消息字符串，如果不存在则返回 undefined
   */
  getMessage(
    errorCode: string,
    messageType: 'title' | 'detail',
    params?: Record<string, any>,
  ): string | undefined {
    const message = this.messages[errorCode]?.[messageType];
    if (!message) {
      return undefined;
    }

    return this.replaceParams(message, params);
  }

  /**
   * 检查是否有消息
   *
   * @param errorCode - 错误代码
   * @param messageType - 消息类型
   * @returns 如果有消息则返回 true
   */
  hasMessage(errorCode: string, messageType: 'title' | 'detail'): boolean {
    return this.messages[errorCode]?.[messageType] !== undefined;
  }

  /**
   * 获取所有可用的错误代码列表
   *
   * @returns 错误代码数组
   */
  getAvailableErrorCodes(): string[] {
    return Object.keys(this.messages);
  }

  /**
   * 替换消息中的参数占位符
   *
   * @param template - 消息模板
   * @param params - 参数对象
   * @returns 替换后的消息
   *
   * @private
   * @example
   * ```typescript
   * replaceParams('Hello {{name}}', { name: 'World' });
   * // 返回: "Hello World"
   *
   * replaceParams('User {{user.id}}', { user: { id: '123' } });
   * // 返回: "User 123"
   * ```
   */
  private replaceParams(
    template: string,
    params?: Record<string, any>,
  ): string {
    if (!params) {
      return template;
    }

    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(params, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * 获取嵌套对象的值
   *
   * @param obj - 对象
   * @param path - 路径（如：'user.id'）
   * @returns 值，如果不存在则返回 undefined
   *
   * @private
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[key];
    }

    return value;
  }
}

