/**
 * @fileoverview MetricsService 单元测试
 */

import { MetricsService } from './metrics.service';
import { PrometheusService } from './prometheus.service';

describe('MetricsService', () => {
  let service: MetricsService;
  let prometheusService: PrometheusService;

  beforeEach(() => {
    prometheusService = new PrometheusService({
      defaultLabels: { app: 'test' },
      includeTenantMetrics: true,
      enableDefaultMetrics: false,
    });

    service = new MetricsService(prometheusService);
  });

  describe('基础功能', () => {
    it('应该正确创建服务实例', () => {
      expect(service).toBeDefined();
    });
  });

  describe('recordHttpRequest()', () => {
    it('应该记录 HTTP 请求', () => {
      const incCalls: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
      const observeCalls: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

      prometheusService.httpRequestsTotal.inc = ((labels: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        incCalls.push(labels);
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      prometheusService.httpRequestDuration.observe = ((
        labels: any,
        value: number,
      ) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        observeCalls.push({ labels, value });
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      service.recordHttpRequest('GET', '/api/users', 200, 50);

      expect(incCalls[0]).toEqual({
        method: 'GET',
        path: '/api/users',
        status: '200',
        tenant_id: 'unknown',
      });

      expect(observeCalls[0].value).toBe(0.05); // 50ms = 0.05s
    });

    it('应该记录租户级别的请求', () => {
      const incCalls: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
      prometheusService.httpRequestsTotal.inc = ((labels: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        incCalls.push(labels);
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      service.recordHttpRequest('POST', '/api/users', 201, 100, 'tenant-123');

      expect(incCalls[0]).toEqual({
        method: 'POST',
        path: '/api/users',
        status: '201',
        tenant_id: 'tenant-123',
      });
    });

    it('应该记录错误请求', () => {
      const incCalls: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
      const errorCalls: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

      prometheusService.httpRequestsTotal.inc = ((labels: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        incCalls.push(labels);
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      prometheusService.httpErrorsTotal.inc = ((labels: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        errorCalls.push(labels);
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      service.recordHttpRequest('GET', '/api/users', 404, 10);

      expect(incCalls.length).toBeGreaterThan(0);
      expect(errorCalls[0]).toEqual({
        method: 'GET',
        path: '/api/users',
        status: '404',
        tenant_id: 'unknown',
      });
    });

    it('应该记录服务器错误', () => {
      const errorCalls: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
      prometheusService.httpErrorsTotal.inc = ((labels: any) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        errorCalls.push(labels);
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      service.recordHttpRequest('POST', '/api/users', 500, 200);

      expect(errorCalls[0]).toEqual({
        method: 'POST',
        path: '/api/users',
        status: '500',
        tenant_id: 'unknown',
      });
    });
  });

  describe('getMetrics()', () => {
    it('应该返回 Prometheus 格式的指标', async () => {
      const metrics = await service.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('string');
      expect(metrics).toContain('http_requests_total');
    });
  });
});
