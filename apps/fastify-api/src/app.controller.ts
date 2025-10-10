import { Controller, Get } from '@nestjs/common';

/**
 * 应用根控制器
 *
 * @description 提供基础的健康检查和应用信息端点
 */
@Controller()
export class AppController {
  /**
   * 健康检查端点
   *
   * @returns 应用状态信息
   */
  @Get()
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * API 信息端点
   *
   * @returns API 基本信息
   */
  @Get('info')
  getInfo(): { name: string; version: string; environment: string } {
    return {
      name: 'Fastify API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
