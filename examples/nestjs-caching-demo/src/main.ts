/**
 * 示例应用入口
 * 
 * @description 演示 @hl8/nestjs-isolation 和 @hl8/nestjs-caching 的集成使用
 */

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.listen(3000, '0.0.0.0');
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 NestJS Caching Demo 已启动！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📍 地址: http://localhost:3000');
  console.log('');
  console.log('📋 API 端点:');
  console.log('  GET    /users          - 获取用户列表（自动缓存）');
  console.log('  GET    /users/:id      - 获取用户详情（自动缓存）');
  console.log('  POST   /users          - 创建用户（清除列表缓存）');
  console.log('  PUT    /users/:id      - 更新用户（更新缓存）');
  console.log('  DELETE /users/:id      - 删除用户（清除缓存）');
  console.log('  GET    /metrics        - 缓存性能指标');
  console.log('  GET    /health         - 健康检查');
  console.log('');
  console.log('🧪 测试多租户隔离:');
  console.log('  curl -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \\');
  console.log('       http://localhost:3000/users');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

bootstrap();

