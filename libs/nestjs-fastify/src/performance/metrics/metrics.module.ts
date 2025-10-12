/**
 * @fileoverview Metrics 模块
 */

import { Module, DynamicModule, Global } from '@nestjs/common';
import type { MetricsOptions } from './types/metrics-options.js';
import { DEFAULT_METRICS_OPTIONS } from './types/metrics-options.js';
import { PrometheusService } from './prometheus.service.js';
import { MetricsService } from './metrics.service.js';
import { MetricsController } from './metrics.controller.js';

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

