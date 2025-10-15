import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

/**
 * 应用根控制器
 *
 * @description 提供基础的健康检查和应用信息端点
 */
@ApiTags("健康检查")
@Controller()
export class AppController {
  /**
   * 健康检查端点
   *
   * @returns 应用状态信息
   */
  @Get()
  @ApiOperation({
    summary: "健康检查",
    description: "返回应用的健康状态，用于负载均衡器和监控系统",
  })
  @ApiResponse({
    status: 200,
    description: "应用运行正常",
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          example: "ok",
        },
        timestamp: {
          type: "string",
          format: "date-time",
          example: "2025-10-12T04:00:00.000Z",
        },
      },
    },
  })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * API 信息端点
   *
   * @returns API 基本信息
   */
  @Get("info")
  @ApiOperation({
    summary: "获取应用信息",
    description: "返回应用的版本、名称和运行环境等基本信息",
  })
  @ApiResponse({
    status: 200,
    description: "成功返回应用信息",
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "Fastify API",
        },
        version: {
          type: "string",
          example: "1.0.0",
        },
        environment: {
          type: "string",
          example: "development",
        },
      },
    },
  })
  getInfo(): { name: string; version: string; environment: string } {
    return {
      name: "Fastify API",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    };
  }
}
