/**
 * 缓存配置类
 *
 * @description 使用 class-validator 进行配置验证
 *
 * ## 验证规则
 *
 * ### Redis 配置
 * - host: 非空字符串
 * - port: 1-65535
 * - db: >= 0
 *
 * ### 缓存配置
 * - ttl: >= 0（0 表示永不过期）
 * - keyPrefix: 非空字符串
 *
 * @since 1.0.0
 */

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Redis 配置类
 */
export class RedisConfig {
  /**
   * Redis 主机地址
   */
  @IsString()
  host: string = 'localhost';

  /**
   * Redis 端口
   */
  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number = 6379;

  /**
   * Redis 密码（可选）
   */
  @IsOptional()
  @IsString()
  password?: string;

  /**
   * Redis 数据库编号
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  db?: number;

  /**
   * 连接超时时间（毫秒）
   */
  @IsOptional()
  @IsNumber()
  @Min(1000)
  connectTimeout?: number;

  /**
   * 最大重试次数
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRetriesPerRequest?: number;

  /**
   * 是否启用离线队列
   */
  @IsOptional()
  @IsBoolean()
  enableOfflineQueue?: boolean;
}

/**
 * 缓存模块配置类
 */
export class CachingModuleConfig {
  /**
   * Redis 配置
   */
  @ValidateNested()
  @Type(() => RedisConfig)
  redis: RedisConfig = new RedisConfig();

  /**
   * 默认 TTL（秒）
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  ttl?: number;

  /**
   * 缓存键前缀
   */
  @IsOptional()
  @IsString()
  keyPrefix?: string;

  /**
   * 是否启用调试日志
   */
  @IsOptional()
  @IsBoolean()
  debug?: boolean;
}
