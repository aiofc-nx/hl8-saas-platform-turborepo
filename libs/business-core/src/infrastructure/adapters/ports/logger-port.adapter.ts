/**
 * 日志端口适配器
 *
 * 实现应用层日志记录端口接口，将应用层的日志需求适配到基础设施层的日志服务。
 * 作为通用功能组件，提供统一的日志记录能力。
 *
 * @description 日志端口适配器实现应用层日志记录需求
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { ILoggerPort } from "../../../application/ports/shared/shared-ports.interface.js";

/**
 * 日志端口适配器
 *
 * 实现应用层日志记录端口接口
 */
@Injectable()
export class LoggerPortAdapter implements ILoggerPort {
  constructor(private readonly logger: FastifyLoggerService) {}

  /**
   * 记录调试日志
   *
   * @param message - 日志消息
   * @param context - 上下文信息
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(message, context);
  }

  /**
   * 记录信息日志
   *
   * @param message - 日志消息
   * @param context - 上下文信息
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(message, context);
  }

  /**
   * 记录警告日志
   *
   * @param message - 日志消息
   * @param context - 上下文信息
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(message, context);
  }

  /**
   * 记录错误日志
   *
   * @param message - 日志消息
   * @param error - 错误对象
   * @param context - 上下文信息
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void {
    this.logger.error(message, error?.stack, context);
  }

  /**
   * 创建子日志器
   *
   * @param name - 子日志器名称
   * @returns 子日志器实例
   */
  child(name: string, metadata?: Record<string, unknown>): ILoggerPort {
    // FastifyLoggerService 没有 child 方法，直接返回当前实例
    return this;
  }

  /**
   * 设置日志级别
   *
   * @param level - 日志级别
   */
  setLevel(level: "debug" | "info" | "warn" | "error"): void {
    // 注意：具体的日志级别设置取决于底层日志服务的实现
    // 这里提供接口兼容性，实际实现可能需要根据具体的日志服务调整
    console.log(`设置日志级别: ${level}`);
  }

  /**
   * 获取日志级别
   *
   * @returns 当前日志级别
   */
  getLevel(): string {
    // 注意：具体的日志级别获取取决于底层日志服务的实现
    return "info";
  }

  /**
   * 检查是否启用指定级别
   *
   * @param level - 日志级别
   * @returns 是否启用
   */
  isLevelEnabled(level: string): boolean {
    // 注意：具体的级别检查取决于底层日志服务的实现
    console.log(`检查日志级别是否启用: ${level}`);
    return true;
  }
}
