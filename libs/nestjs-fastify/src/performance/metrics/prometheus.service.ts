/**
 * @fileoverview Prometheus 服务
 */

import { Injectable, Logger } from '@nestjs/common';
import * as promClient from 'prom-client';
import type { MetricsOptions } from './types/metrics-options.js';

@Injectable()
export class PrometheusService {
  private readonly logger = new Logger(PrometheusService.name);
  private readonly registry: promClient.Registry;

  // HTTP 指标
  public readonly httpRequestsTotal: promClient.Counter;
  public readonly httpRequestDuration: promClient.Histogram;
  public readonly httpErrorsTotal: promClient.Counter;

  constructor(private readonly options: MetricsOptions) {
    this.registry = new promClient.Registry();

    // 设置默认标签
    if (options.defaultLabels) {
      this.registry.setDefaultLabels(options.defaultLabels);
    }

    // 创建 HTTP 请求计数器
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'HTTP 请求总数',
      labelNames: ['method', 'path', 'status', 'tenant_id'],
      registers: [this.registry],
    });

    // 创建 HTTP 响应时间直方图
    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP 请求响应时间（秒）',
      labelNames: ['method', 'path', 'status', 'tenant_id'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
      registers: [this.registry],
    });

    // 创建 HTTP 错误计数器
    this.httpErrorsTotal = new promClient.Counter({
      name: 'http_errors_total',
      help: 'HTTP 错误总数',
      labelNames: ['method', 'path', 'status', 'tenant_id'],
      registers: [this.registry],
    });

    // 启用默认指标
    if (options.enableDefaultMetrics) {
      promClient.collectDefaultMetrics({ register: this.registry });
    }

    this.logger.log('Prometheus 服务已初始化');
  }

  /**
   * 获取 Prometheus 格式的指标
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * 获取注册表
   */
  getRegistry(): promClient.Registry {
    return this.registry;
  }
}
