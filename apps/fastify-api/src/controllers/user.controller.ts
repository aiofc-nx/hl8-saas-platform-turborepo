/**
 * 用户控制器
 *
 * @description 示例控制器，演示数据库模块在 REST API 中的使用
 *
 * ## 功能
 * - 用户的 CRUD 操作
 * - 数据库健康检查
 * - 性能指标查询
 *
 * @example
 * ```bash
 * # 创建用户
 * curl -X POST http://localhost:3000/users \
 *   -H "Content-Type: application/json" \
 *   -H "X-Tenant-Id: tenant-123" \
 *   -d '{"username":"john","email":"john@example.com","firstName":"John","lastName":"Doe"}'
 *
 * # 查询用户列表
 * curl http://localhost:3000/users \
 *   -H "X-Tenant-Id: tenant-123"
 *
 * # 数据库健康检查
 * curl http://localhost:3000/users/db/health
 *
 * # 查询数据库指标
 * curl http://localhost:3000/users/db/metrics
 * ```
 */

import { HealthCheckService, MetricsService } from '@hl8/database/index.js';
import { FastifyLoggerService } from '@hl8/nestjs-fastify/index.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import type { CreateUserDto, UpdateUserDto } from '../services/user.service.js';
import { UserService } from '../services/user.service.js';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly healthCheckService: HealthCheckService,
    private readonly metricsService: MetricsService,
    private readonly logger: FastifyLoggerService,
  ) {}

  /**
   * 创建用户
   *
   * @param dto - 创建用户数据
   * @returns 创建的用户
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  /**
   * 查询所有用户
   *
   * @returns 用户列表
   */
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  /**
   * 根据 ID 查询用户
   *
   * @param id - 用户 ID
   * @returns 用户实体
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  /**
   * 更新用户
   *
   * @param id - 用户 ID
   * @param dto - 更新数据
   * @returns 更新后的用户
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  /**
   * 软删除用户
   *
   * @param id - 用户 ID
   * @returns 删除结果
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.userService.softDelete(id);
  }

  /**
   * 恢复已删除的用户
   *
   * @param id - 用户 ID
   * @returns 恢复结果
   */
  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }

  /**
   * 数据库健康检查
   *
   * @description 检查数据库连接状态、连接池状态、响应时间
   *
   * @returns 健康检查结果
   */
  @Get('db/health')
  async healthCheck() {
    return this.healthCheckService.check();
  }

  /**
   * 查询数据库性能指标
   *
   * @description 返回慢查询、连接池统计、事务统计等性能指标
   *
   * @returns 性能指标
   */
  @Get('db/metrics')
  async metrics() {
    const poolStats = await this.healthCheckService.getPoolStats();
    const metrics = this.metricsService.getDatabaseMetrics(poolStats);
    const slowQueries = this.metricsService.getSlowQueries(10);

    return {
      ...metrics,
      slowQueries,
    };
  }
}
