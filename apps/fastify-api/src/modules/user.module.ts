/**
 * 用户模块
 *
 * @description 演示模块，展示 @hl8/database 在实际应用中的集成
 *
 * ## 功能
 * - 用户实体定义
 * - 用户 CRUD 服务
 * - 用户 REST API 控制器
 * - 数据库健康检查和性能监控
 *
 * ## 依赖
 * - @hl8/database - 数据库连接和事务管理
 * - @hl8/nestjs-fastify - 日志服务
 * - @hl8/nestjs-isolation - 多租户数据隔离
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [UserModule],
 * })
 * export class AppModule {}
 * ```
 */

import { Module } from "@nestjs/common";
import { UserController } from "../controllers/user.controller.js";
import { UserService } from "../services/user.service.js";

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
