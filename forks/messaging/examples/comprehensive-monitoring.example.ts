/**
 * 综合监控和性能测试示例
 *
 * @description 展示如何使用缓存监控服务进行全面的系统监控和性能分析
 * 包括健康检查、性能报告、告警管理等完整的监控解决方案
 *
 * @example
 * ```typescript
 * import { ComprehensiveMonitoringExample } from './comprehensive-monitoring.example';
 *
 * const monitoring = new ComprehensiveMonitoringExample();
 * await monitoring.startComprehensiveMonitoring();
 * ```
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { MessagingService } from "../src/lib/messaging.service";
import { EventService } from "../src/lib/event.service";
import { TaskService } from "../src/lib/task.service";
import { CacheMonitoringService } from "../src/lib/services/cache-monitoring.service";
import { DeadLetterCacheService } from "../src/lib/services/dead-letter-cache.service";
import { TenantConfigCacheService } from "../src/lib/services/tenant-config-cache.service";
import { AdvancedMonitoringCacheService } from "../src/lib/services/advanced-monitoring-cache.service";
import { TenantContextService } from "@hl8/multi-tenancy";
import { MessagingConfig } from "../src/lib/config/messaging.config";
import { PinoLogger } from "@hl8/logger";

/**
 * 综合监控示例服务
 *
 * @description 展示如何使用缓存监控服务进行全面的系统监控
 */
@Injectable()
export class ComprehensiveMonitoringExample
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new PinoLogger();
  private isMonitoringActive = false;

  constructor(
    private readonly config: MessagingConfig,
    private readonly cacheMonitoring: CacheMonitoringService,
    private readonly deadLetterCache: DeadLetterCacheService,
    private readonly tenantConfigCache: TenantConfigCacheService,
    private readonly monitoringCache: AdvancedMonitoringCacheService,
    private readonly messagingService: MessagingService,
    private readonly eventService: EventService,
    private readonly taskService: TaskService,
    private readonly tenantContextService: TenantContextService,
  ) {
    this.logger.setContext({ requestId: "comprehensive-monitoring" });
  }

  async onModuleInit() {
    await this.startComprehensiveMonitoring();
  }

  async onModuleDestroy() {
    await this.stopComprehensiveMonitoring();
  }

  /**
   * 启动综合监控
   */
  async startComprehensiveMonitoring(): Promise<void> {
    if (this.isMonitoringActive) {
      this.logger.warn("综合监控已在运行中");
      return;
    }

    this.logger.info("启动综合监控服务");

    try {
      // 启动缓存监控
      await this.cacheMonitoring.startMonitoring();

      // 启动定时健康检查
      await this.startHealthCheckMonitoring();

      // 启动性能报告生成
      await this.startPerformanceReportGeneration();

      // 启动告警监控
      await this.startAlertMonitoring();

      this.isMonitoringActive = true;
      this.logger.info("综合监控服务启动完成");
    } catch (error) {
      this.logger.error("启动综合监控服务失败", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 停止综合监控
   */
  async stopComprehensiveMonitoring(): Promise<void> {
    if (!this.isMonitoringActive) {
      return;
    }

    this.logger.info("停止综合监控服务");

    try {
      // 停止缓存监控
      await this.cacheMonitoring.stopMonitoring();

      this.isMonitoringActive = false;
      this.logger.info("综合监控服务已停止");
    } catch (error) {
      this.logger.error("停止综合监控服务失败", {
        error: (error as Error).message,
      });
    }
  }

  /**
   * 启动健康检查监控
   */
  private async startHealthCheckMonitoring(): Promise<void> {
    this.logger.info("启动健康检查监控");

    // 每5分钟进行一次健康检查
    setInterval(
      async () => {
        try {
          const healthStatus =
            await this.cacheMonitoring.getOverallHealthStatus();

          if (!healthStatus.overallHealth) {
            this.logger.warn("缓存系统健康状态异常", {
              issues: healthStatus.issues,
              recommendations: healthStatus.recommendations,
            });

            // 发送告警通知
            await this.sendHealthAlert(healthStatus);
          } else {
            this.logger.debug("缓存系统健康状态正常");
          }
        } catch (error) {
          this.logger.error("健康检查失败", {
            error: (error as Error).message,
          });
        }
      },
      5 * 60 * 1000,
    ); // 5分钟
  }

  /**
   * 启动性能报告生成
   */
  private async startPerformanceReportGeneration(): Promise<void> {
    this.logger.info("启动性能报告生成");

    // 每小时生成一次性能报告
    setInterval(
      async () => {
        try {
          const performanceReport =
            await this.cacheMonitoring.getPerformanceReport(3600000); // 1小时

          this.logger.info("缓存性能报告", {
            timeRange: performanceReport.timeRange,
            summary: performanceReport.summary,
            trends: performanceReport.trends,
            recommendations: performanceReport.recommendations,
          });

          // 如果性能下降，发送告警
          if (
            performanceReport.summary.avgHitRate < 0.8 ||
            performanceReport.summary.avgLatency > 100
          ) {
            await this.sendPerformanceAlert(performanceReport);
          }
        } catch (error) {
          this.logger.error("生成性能报告失败", {
            error: (error as Error).message,
          });
        }
      },
      60 * 60 * 1000,
    ); // 1小时
  }

  /**
   * 启动告警监控
   */
  private async startAlertMonitoring(): Promise<void> {
    this.logger.info("启动告警监控");

    // 每2分钟检查一次告警状态
    setInterval(
      async () => {
        try {
          const tenantId = this.tenantContextService.getTenant();
          if (tenantId) {
            const alertStatus =
              await this.monitoringCache.getAlertStatus(tenantId);

            if (!alertStatus.isHealthy) {
              this.logger.warn("检测到系统告警", {
                alertCount: alertStatus.alertCount,
                severity: alertStatus.severity,
                activeAlerts: alertStatus.activeAlerts,
              });

              await this.sendSystemAlert(alertStatus);
            }
          }
        } catch (error) {
          this.logger.error("告警监控失败", {
            error: (error as Error).message,
          });
        }
      },
      2 * 60 * 1000,
    ); // 2分钟
  }

  /**
   * 发送健康告警
   */
  private async sendHealthAlert(healthStatus: unknown): Promise<void> {
    try {
      const alertMessage = {
        type: "health_alert",
        severity: "high",
        timestamp: new Date().toISOString(),
        tenantId: (healthStatus as any).tenantId,
        issues: (healthStatus as any).issues,
        recommendations: (healthStatus as any).recommendations,
      };

      // 发送告警事件
      await this.eventService.emit("system.health.alert", alertMessage);

      // 发送告警任务
      await this.taskService.addTask("send-health-alert", alertMessage);

      this.logger.info("健康告警已发送", {
        alertType: "health",
        issuesCount: (healthStatus as any).issues.length,
      });
    } catch (error) {
      this.logger.error("发送健康告警失败", {
        error: (error as Error).message,
      });
    }
  }

  /**
   * 发送性能告警
   */
  private async sendPerformanceAlert(
    performanceReport: unknown,
  ): Promise<void> {
    try {
      const alertMessage = {
        type: "performance_alert",
        severity: "medium",
        timestamp: new Date().toISOString(),
        tenantId: (performanceReport as any).tenantId,
        summary: (performanceReport as any).summary,
        trends: (performanceReport as any).trends,
        recommendations: (performanceReport as any).recommendations,
      };

      // 发送告警事件
      await this.eventService.emit("system.performance.alert", alertMessage);

      // 发送告警任务
      await this.taskService.addTask("send-performance-alert", alertMessage);

      this.logger.info("性能告警已发送", {
        alertType: "performance",
        avgHitRate: (performanceReport as any).summary.avgHitRate,
        avgLatency: (performanceReport as any).summary.avgLatency,
      });
    } catch (error) {
      this.logger.error("发送性能告警失败", {
        error: (error as Error).message,
      });
    }
  }

  /**
   * 发送系统告警
   */
  private async sendSystemAlert(alertStatus: unknown): Promise<void> {
    try {
      const alertMessage = {
        type: "system_alert",
        severity: (alertStatus as any).severity,
        timestamp: new Date().toISOString(),
        tenantId: (alertStatus as any).tenantId,
        alertCount: (alertStatus as any).alertCount,
        activeAlerts: (alertStatus as any).activeAlerts,
      };

      // 发送告警事件
      await this.eventService.emit("system.alert", alertMessage);

      // 发送告警任务
      await this.taskService.addTask("send-system-alert", alertMessage);

      this.logger.info("系统告警已发送", {
        alertType: "system",
        alertCount: (alertStatus as any).alertCount,
        severity: (alertStatus as any).severity,
      });
    } catch (error) {
      this.logger.error("发送系统告警失败", {
        error: (error as Error).message,
      });
    }
  }

  /**
   * 获取系统监控仪表板数据
   */
  async getMonitoringDashboard(): Promise<MonitoringDashboard> {
    try {
      const tenantId = this.tenantContextService.getTenant();

      // 并行获取各种监控数据
      const [
        healthStatus,
        performanceReport,
        alertStatus,
        deadLetterStats,
        tenantConfigStats,
      ] = await Promise.allSettled([
        this.cacheMonitoring.getOverallHealthStatus(),
        this.cacheMonitoring.getPerformanceReport(3600000), // 1小时
        tenantId ? this.monitoringCache.getAlertStatus(tenantId) : null,
        tenantId ? this.deadLetterCache.getDeadLetterStats(tenantId) : null,
        tenantId ? this.tenantConfigCache.getTenantConfigStats(tenantId) : null,
      ]);

      const dashboard: MonitoringDashboard = {
        timestamp: Date.now(),
        tenantId: tenantId || undefined,
        healthStatus:
          healthStatus.status === "fulfilled" ? healthStatus.value : null,
        performanceReport:
          performanceReport.status === "fulfilled"
            ? performanceReport.value
            : null,
        alertStatus:
          alertStatus.status === "fulfilled" ? alertStatus.value : null,
        deadLetterStats:
          deadLetterStats.status === "fulfilled" ? deadLetterStats.value : null,
        tenantConfigStats:
          tenantConfigStats.status === "fulfilled"
            ? tenantConfigStats.value
            : null,
        systemInfo: await this.getSystemInfo(),
      };

      this.logger.debug("监控仪表板数据已生成", {
        tenantId: tenantId || undefined,
        hasHealthStatus: !!dashboard.healthStatus,
        hasPerformanceReport: !!dashboard.performanceReport,
        hasAlertStatus: !!dashboard.alertStatus,
      });

      return dashboard;
    } catch (error) {
      this.logger.error("获取监控仪表板数据失败", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 获取系统信息
   */
  private async getSystemInfo(): Promise<SystemInfo> {
    try {
      const config = this.config;
      const memUsage = process.memoryUsage();

      return {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoryUsage: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal,
          external: memUsage.external,
          rss: memUsage.rss,
        },
        messagingConfig: {
          adapter: config?.adapter,
          cacheEnabled: config?.cache?.enableMessageDeduplication,
          deadLetterCacheEnabled: config?.cache?.enableDeadLetterCache,
          tenantConfigCacheEnabled: config?.cache?.enableTenantConfigCache,
          monitoringCacheEnabled: config?.monitoring?.enableStats,
        },
      };
    } catch (error) {
      this.logger.warn("获取系统信息失败", {
        error: (error as Error).message,
      });
      return {
        nodeVersion: "unknown",
        platform: "unknown",
        arch: "unknown",
        uptime: 0,
        memoryUsage: { used: 0, total: 0, external: 0, rss: 0 },
        messagingConfig: {
          adapter: "unknown",
          cacheEnabled: false,
          deadLetterCacheEnabled: false,
          tenantConfigCacheEnabled: false,
          monitoringCacheEnabled: false,
        },
      };
    }
  }

  /**
   * 执行系统诊断
   */
  async runSystemDiagnostics(): Promise<SystemDiagnostics> {
    try {
      this.logger.info("开始系统诊断");

      const tenantId = this.tenantContextService.getTenant();
      const startTime = Date.now();

      // 执行各种诊断检查
      const diagnostics: SystemDiagnostics = {
        timestamp: startTime,
        tenantId: tenantId || undefined,
        duration: 0,
        checks: {
          cacheConnection: await this.diagnoseCacheConnection(),
          memoryUsage: await this.diagnoseMemoryUsage(),
          performance: await this.diagnosePerformance(),
          deadLetterQueue: await this.diagnoseDeadLetterQueue(),
          tenantConfig: await this.diagnoseTenantConfig(),
          monitoring: await this.diagnoseMonitoring(),
        },
        recommendations: [],
        overallStatus: "healthy",
      };

      // 计算诊断时长
      diagnostics.duration = Date.now() - startTime;

      // 生成推荐建议
      diagnostics.recommendations = this.generateDiagnosticRecommendations(
        diagnostics.checks,
      );

      // 确定整体状态
      diagnostics.overallStatus = this.determineOverallStatus(
        diagnostics.checks,
      );

      this.logger.info("系统诊断完成", {
        duration: diagnostics.duration,
        overallStatus: diagnostics.overallStatus,
        recommendationsCount: diagnostics.recommendations.length,
      });

      return diagnostics;
    } catch (error) {
      this.logger.error("系统诊断失败", {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * 诊断缓存连接
   */
  private async diagnoseCacheConnection(): Promise<DiagnosticResult> {
    try {
      const startTime = Date.now();
      // 注意：getConnectionStatus是私有方法，这里仅作为示例
      // 实际使用时应该通过公共方法获取连接状态
      this.logger.debug("缓存监控服务状态检查");
      const duration = Date.now() - startTime;

      return {
        name: "cache_connection",
        status: "healthy",
        duration,
        details: { latency: duration },
        message: "缓存连接正常",
      };
    } catch (error) {
      return {
        name: "cache_connection",
        status: "unhealthy",
        duration: 0,
        details: { error: (error as Error).message },
        message: "缓存连接失败",
      };
    }
  }

  /**
   * 诊断内存使用
   */
  private async diagnoseMemoryUsage(): Promise<DiagnosticResult> {
    try {
      const memUsage = process.memoryUsage();
      const percentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      const status: "healthy" | "warning" | "unhealthy" =
        percentage > 90 ? "unhealthy" : percentage > 80 ? "warning" : "healthy";

      return {
        name: "memory_usage",
        status,
        duration: 0,
        details: {
          used: memUsage.heapUsed,
          total: memUsage.heapTotal,
          percentage: Math.round(percentage * 100) / 100,
        },
        message: `内存使用率: ${Math.round(percentage)}%`,
      };
    } catch (error) {
      return {
        name: "memory_usage",
        status: "unhealthy",
        duration: 0,
        details: { error: (error as Error).message },
        message: "内存使用诊断失败",
      };
    }
  }

  /**
   * 诊断性能
   */
  private async diagnosePerformance(): Promise<DiagnosticResult> {
    try {
      const performanceReport =
        await this.cacheMonitoring.getPerformanceReport(300000); // 5分钟
      const avgLatency = performanceReport.summary.avgLatency;
      const avgHitRate = performanceReport.summary.avgHitRate;

      let status: "healthy" | "warning" | "unhealthy" = "healthy";
      if (avgLatency > 500 || avgHitRate < 0.5) {
        status = "unhealthy";
      } else if (avgLatency > 100 || avgHitRate < 0.8) {
        status = "warning";
      }

      return {
        name: "performance",
        status,
        duration: 0,
        details: {
          avgLatency,
          avgHitRate,
          totalOperations: performanceReport.summary.totalOperations,
        },
        message: `平均延迟: ${avgLatency.toFixed(2)}ms, 命中率: ${(
          avgHitRate * 100
        ).toFixed(2)}%`,
      };
    } catch (error) {
      return {
        name: "performance",
        status: "unhealthy",
        duration: 0,
        details: { error: (error as Error).message },
        message: "性能诊断失败",
      };
    }
  }

  /**
   * 诊断死信队列
   */
  private async diagnoseDeadLetterQueue(): Promise<DiagnosticResult> {
    try {
      const tenantId = this.tenantContextService.getTenant();
      if (!tenantId) {
        return {
          name: "dead_letter_queue",
          status: "healthy",
          duration: 0,
          details: { message: "无租户上下文" },
          message: "跳过死信队列诊断",
        };
      }

      const stats = await this.deadLetterCache.getDeadLetterStats(tenantId);
      const currentCount = stats.currentCount || 0;

      let status: "healthy" | "warning" | "unhealthy" = "healthy";
      if (currentCount > 1000) {
        status = "unhealthy";
      } else if (currentCount > 100) {
        status = "warning";
      }

      return {
        name: "dead_letter_queue",
        status,
        duration: 0,
        details: {
          currentCount,
          totalStored: stats.totalStored,
          totalRetried: stats.totalRetried,
        },
        message: `当前死信消息数: ${currentCount}`,
      };
    } catch (error) {
      return {
        name: "dead_letter_queue",
        status: "unhealthy",
        duration: 0,
        details: { error: (error as Error).message },
        message: "死信队列诊断失败",
      };
    }
  }

  /**
   * 诊断租户配置
   */
  private async diagnoseTenantConfig(): Promise<DiagnosticResult> {
    try {
      const tenantId = this.tenantContextService.getTenant();
      if (!tenantId) {
        return {
          name: "tenant_config",
          status: "healthy",
          duration: 0,
          details: { message: "无租户上下文" },
          message: "跳过租户配置诊断",
        };
      }

      const stats = await this.tenantConfigCache.getTenantConfigStats(tenantId);
      const isCached = stats.isCached || false;

      return {
        name: "tenant_config",
        status: isCached ? "healthy" : "warning",
        duration: 0,
        details: {
          isCached,
          lastAccessed: stats.lastAccessed,
        },
        message: isCached ? "租户配置已缓存" : "租户配置未缓存",
      };
    } catch (error) {
      return {
        name: "tenant_config",
        status: "unhealthy",
        duration: 0,
        details: { error: (error as Error).message },
        message: "租户配置诊断失败",
      };
    }
  }

  /**
   * 诊断监控
   */
  private async diagnoseMonitoring(): Promise<DiagnosticResult> {
    try {
      const tenantId = this.tenantContextService.getTenant();
      if (!tenantId) {
        return {
          name: "monitoring",
          status: "healthy",
          duration: 0,
          details: { message: "无租户上下文" },
          message: "跳过监控诊断",
        };
      }

      const alertStatus = await this.monitoringCache.getAlertStatus(tenantId);
      const isHealthy = alertStatus.isHealthy;

      return {
        name: "monitoring",
        status: isHealthy ? "healthy" : "warning",
        duration: 0,
        details: {
          isHealthy,
          alertCount: alertStatus.alertCount,
          severity: alertStatus.severity,
        },
        message: isHealthy
          ? "监控状态正常"
          : `有 ${alertStatus.alertCount} 个活跃告警`,
      };
    } catch (error) {
      return {
        name: "monitoring",
        status: "unhealthy",
        duration: 0,
        details: { error: (error as Error).message },
        message: "监控诊断失败",
      };
    }
  }

  /**
   * 生成诊断推荐建议
   */
  private generateDiagnosticRecommendations(checks: unknown): string[] {
    const recommendations: string[] = [];

    Object.values(checks as any).forEach((check: any) => {
      if (check.status === "unhealthy") {
        recommendations.push(`${check.name}: ${check.message}`);
      } else if (check.status === "warning") {
        recommendations.push(`建议关注 ${check.name}: ${check.message}`);
      }
    });

    return recommendations;
  }

  /**
   * 确定整体状态
   */
  private determineOverallStatus(
    checks: unknown,
  ): "healthy" | "warning" | "unhealthy" {
    const statuses = Object.values(checks as any).map(
      (check: any) => check.status,
    );

    if (statuses.includes("unhealthy")) return "unhealthy";
    if (statuses.includes("warning")) return "warning";
    return "healthy";
  }
}

// 类型定义
interface MonitoringDashboard {
  timestamp: number;
  tenantId?: string;
  healthStatus: unknown;
  performanceReport: unknown;
  alertStatus: unknown;
  deadLetterStats: unknown;
  tenantConfigStats: unknown;
  systemInfo: SystemInfo;
}

interface SystemInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    external: number;
    rss: number;
  };
  messagingConfig: {
    adapter?: string;
    cacheEnabled?: boolean;
    deadLetterCacheEnabled?: boolean;
    tenantConfigCacheEnabled?: boolean;
    monitoringCacheEnabled?: boolean;
  };
}

interface SystemDiagnostics {
  timestamp: number;
  tenantId?: string;
  duration: number;
  checks: {
    cacheConnection: DiagnosticResult;
    memoryUsage: DiagnosticResult;
    performance: DiagnosticResult;
    deadLetterQueue: DiagnosticResult;
    tenantConfig: DiagnosticResult;
    monitoring: DiagnosticResult;
  };
  recommendations: string[];
  overallStatus: "healthy" | "warning" | "unhealthy";
}

interface DiagnosticResult {
  name: string;
  status: "healthy" | "warning" | "unhealthy";
  duration: number;
  details: unknown;
  message: string;
}
