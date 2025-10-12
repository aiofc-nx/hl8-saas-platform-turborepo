/**
 * 缓存模块配置
 *
 * @description 基于 class-validator 的类型安全配置
 *
 * @since 0.3.0
 */

import { IsString, IsNumber, IsOptional, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Redis 连接配置
 */
export class RedisConfig {
  /**
   * Redis 主机地址
   *
   * @example 'localhost'
   */
  @IsString()
  host!: string;

  /**
   * Redis 端口
   *
   * @example 6379
   */
  @IsNumber()
  @Min(1)
  @Max(65535)
  port!: number;

  /**
   * Redis 密码
   *
   * @optional
   */
  @IsString()
  @IsOptional()
  password?: string;

  /**
   * Redis 数据库索引
   *
   * @default 0
   */
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(15)
  db?: number;

  /**
   * 连接超时（毫秒）
   *
   * @default 10000
   */
  @IsNumber()
  @IsOptional()
  @Min(1000)
  connectTimeout?: number;
}

/**
 * 缓存模块配置
 */
export class CachingModuleConfig {
  /**
   * Redis 配置
   */
  @ValidateNested()
  @Type(() => RedisConfig)
  redis!: RedisConfig;

  /**
   * 默认 TTL（秒）
   *
   * @default 3600
   */
  @IsNumber()
  @IsOptional()
  @Min(1)
  ttl?: number;

  /**
   * 缓存键前缀
   *
   * @default 'hl8:cache'
   */
  @IsString()
  @IsOptional()
  keyPrefix?: string;
}

