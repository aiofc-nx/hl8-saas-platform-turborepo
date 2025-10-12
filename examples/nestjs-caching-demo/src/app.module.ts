/**
 * 应用根模块
 * 
 * @description 配置 Isolation 和 Caching 模块
 */

import { Module } from '@nestjs/common';
import { IsolationModule } from '@hl8/nestjs-isolation';
import { CachingModule } from '@hl8/nestjs-caching';
import { UsersModule } from './users/users.module.js';
import { MonitoringModule } from './monitoring/monitoring.module.js';

@Module({
  imports: [
    // 配置隔离模块（自动提取租户/组织/用户上下文）
    IsolationModule.forRoot(),
    
    // 配置缓存模块（自动多层级隔离）
    CachingModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
      ttl: 3600, // 默认 1 小时
      keyPrefix: 'demo:cache:',
    }),
    
    // 业务模块
    UsersModule,
    MonitoringModule,
  ],
})
export class AppModule {}

