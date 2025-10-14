/**
 * @fileoverview Metrics 模块
 */

import { DynamicModule, Global, Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller.js';
import { MetricsService } from './metrics.service.js';
import { PrometheusService } from './prometheus.service.js';
import type { MetricsOptions } from './types/metrics-options.js';
import { DEFAULT_METRICS_OPTIONS } from './types/metrics-options.js';

@Global()
@Module({})
export class MetricsModule {
  static forRoot(options?: MetricsOptions): DynamicModule {
    const mergedOptions: MetricsOptions = {
      ...DEFAULT_METRICS_OPTIONS,
      ...options,
    };

    return {
      module: MetricsModule,
      global: true,
      controllers: [MetricsController],
      providers: [
        {
          provide: 'METRICS_OPTIONS',
          useValue: mergedOptions,
        },
        {
          provide: PrometheusService,
          useFactory: () => new PrometheusService(mergedOptions),
        },
        MetricsService,
      ],
      exports: [MetricsService, PrometheusService],
    };
  }
}
