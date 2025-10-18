import { Aggregate } from "./aggregate.decorator.js";

describe("Aggregate Decorator", () => {
  describe("基本功能", () => {
    it("应该能够装饰类", () => {
      @Aggregate("TestAggregate")
      class TestAggregate {}

      expect(TestAggregate).toBeDefined();
    });

    it("应该能够设置聚合根名称", () => {
      @Aggregate("UserAggregate")
      class UserAggregate {}

      expect(UserAggregate).toBeDefined();
    });

    it("应该能够设置版本", () => {
      @Aggregate("TestAggregate", { version: "1.0.0" })
      class TestAggregate {}

      expect(TestAggregate).toBeDefined();
    });

    it("应该能够设置快照策略", () => {
      @Aggregate("TestAggregate", {
        snapshot: {
          enabled: true,
          frequency: 10,
        },
      })
      class TestAggregate {}

      expect(TestAggregate).toBeDefined();
    });

    it("应该能够设置事件存储配置", () => {
      @Aggregate("TestAggregate", {
        eventStore: {
          provider: "in-memory",
          options: {
            maxEvents: 1000,
          },
        },
      })
      class TestAggregate {}

      expect(TestAggregate).toBeDefined();
    });
  });

  describe("元数据管理", () => {
    it("应该能够获取聚合根元数据", () => {
      @Aggregate("TestAggregate")
      class TestAggregate {}

      const metadata = Reflect.getMetadata("aggregate:metadata", TestAggregate);
      expect(metadata).toBeDefined();
      expect(metadata.name).toBe("TestAggregate");
    });

    it("应该能够获取版本信息", () => {
      @Aggregate("TestAggregate", { version: "2.0.0" })
      class TestAggregate {}

      const metadata = Reflect.getMetadata("aggregate:metadata", TestAggregate);
      expect(metadata.version).toBe("2.0.0");
    });

    it("应该能够获取快照配置", () => {
      @Aggregate("TestAggregate", {
        snapshot: {
          enabled: true,
          frequency: 5,
        },
      })
      class TestAggregate {}

      const metadata = Reflect.getMetadata("aggregate:metadata", TestAggregate);
      expect(metadata.snapshot.enabled).toBe(true);
      expect(metadata.snapshot.frequency).toBe(5);
    });

    it("应该能够获取事件存储配置", () => {
      @Aggregate("TestAggregate", {
        eventStore: {
          provider: "database",
          options: {
            maxEvents: 500,
          },
        },
      })
      class TestAggregate {}

      const metadata = Reflect.getMetadata("aggregate:metadata", TestAggregate);
      expect(metadata.eventStore.provider).toBe("database");
      expect(metadata.eventStore.options.maxEvents).toBe(500);
    });
  });

  describe("默认配置", () => {
    it("应该使用默认版本", () => {
      @Aggregate("TestAggregate")
      class TestAggregate {}

      const metadata = Reflect.getMetadata("aggregate:metadata", TestAggregate);
      expect(metadata.version).toBe("1.0.0");
    });

    it("应该使用默认快照配置", () => {
      @Aggregate("TestAggregate")
      class TestAggregate {}

      const metadata = Reflect.getMetadata("aggregate:metadata", TestAggregate);
      expect(metadata.snapshot.enabled).toBe(false);
      expect(metadata.snapshot.frequency).toBe(100);
    });

    it("应该使用默认事件存储配置", () => {
      @Aggregate("TestAggregate")
      class TestAggregate {}

      const metadata = Reflect.getMetadata("aggregate:metadata", TestAggregate);
      expect(metadata.eventStore.provider).toBe("in-memory");
      expect(metadata.eventStore.options.maxEvents).toBe(10000);
    });
  });

  describe("配置验证", () => {
    it("应该验证聚合根名称", () => {
      expect(() => {
        @Aggregate("")
        class TestAggregate {}
      }).toThrow();
    });

    it("应该验证版本格式", () => {
      expect(() => {
        @Aggregate("TestAggregate", { version: "invalid" })
        class TestAggregate {}
      }).toThrow();
    });

    it("应该验证快照频率", () => {
      expect(() => {
        @Aggregate("TestAggregate", {
          snapshot: {
            enabled: true,
            frequency: -1,
          },
        })
        class TestAggregate {}
      }).toThrow();
    });

    it("应该验证事件存储提供者", () => {
      expect(() => {
        @Aggregate("TestAggregate", {
          eventStore: {
            provider: "invalid",
          },
        })
        class TestAggregate {}
      }).toThrow();
    });
  });

  describe("业务规则", () => {
    it("应该支持租户感知聚合根", () => {
      @Aggregate("TenantAggregate", {
        tenantAware: true,
      })
      class TenantAggregate {}

      const metadata = Reflect.getMetadata(
        "aggregate:metadata",
        TenantAggregate,
      );
      expect(metadata.tenantAware).toBe(true);
    });

    it("应该支持隔离级别配置", () => {
      @Aggregate("IsolationAggregate", {
        isolationLevel: "tenant",
      })
      class IsolationAggregate {}

      const metadata = Reflect.getMetadata(
        "aggregate:metadata",
        IsolationAggregate,
      );
      expect(metadata.isolationLevel).toBe("tenant");
    });

    it("应该支持事件版本控制", () => {
      @Aggregate("VersionedAggregate", {
        eventVersioning: {
          enabled: true,
          currentVersion: "2.0.0",
        },
      })
      class VersionedAggregate {}

      const metadata = Reflect.getMetadata(
        "aggregate:metadata",
        VersionedAggregate,
      );
      expect(metadata.eventVersioning.enabled).toBe(true);
      expect(metadata.eventVersioning.currentVersion).toBe("2.0.0");
    });
  });

  describe("性能配置", () => {
    it("应该支持缓存配置", () => {
      @Aggregate("CachedAggregate", {
        cache: {
          enabled: true,
          ttl: 300,
        },
      })
      class CachedAggregate {}

      const metadata = Reflect.getMetadata(
        "aggregate:metadata",
        CachedAggregate,
      );
      expect(metadata.cache.enabled).toBe(true);
      expect(metadata.cache.ttl).toBe(300);
    });

    it("应该支持批处理配置", () => {
      @Aggregate("BatchAggregate", {
        batch: {
          enabled: true,
          size: 100,
        },
      })
      class BatchAggregate {}

      const metadata = Reflect.getMetadata(
        "aggregate:metadata",
        BatchAggregate,
      );
      expect(metadata.batch.enabled).toBe(true);
      expect(metadata.batch.size).toBe(100);
    });

    it("应该支持并发控制", () => {
      @Aggregate("ConcurrentAggregate", {
        concurrency: {
          maxConcurrent: 10,
          timeout: 5000,
        },
      })
      class ConcurrentAggregate {}

      const metadata = Reflect.getMetadata(
        "aggregate:metadata",
        ConcurrentAggregate,
      );
      expect(metadata.concurrency.maxConcurrent).toBe(10);
      expect(metadata.concurrency.timeout).toBe(5000);
    });
  });

  describe("监控配置", () => {
    it("应该支持指标收集", () => {
      @Aggregate("MonitoredAggregate", {
        metrics: {
          enabled: true,
          interval: 1000,
        },
      })
      class MonitoredAggregate {}

      const metadata = Reflect.getMetadata(
        "aggregate:metadata",
        MonitoredAggregate,
      );
      expect(metadata.metrics.enabled).toBe(true);
      expect(metadata.metrics.interval).toBe(1000);
    });

    it("应该支持健康检查", () => {
      @Aggregate("HealthyAggregate", {
        healthCheck: {
          enabled: true,
          interval: 5000,
        },
      })
      class HealthyAggregate {}

      const metadata = Reflect.getMetadata(
        "aggregate:metadata",
        HealthyAggregate,
      );
      expect(metadata.healthCheck.enabled).toBe(true);
      expect(metadata.healthCheck.interval).toBe(5000);
    });

    it("应该支持审计日志", () => {
      @Aggregate("AuditedAggregate", {
        audit: {
          enabled: true,
          level: "all",
        },
      })
      class AuditedAggregate {}

      const metadata = Reflect.getMetadata(
        "aggregate:metadata",
        AuditedAggregate,
      );
      expect(metadata.audit.enabled).toBe(true);
      expect(metadata.audit.level).toBe("all");
    });
  });

  describe("错误处理", () => {
    it("应该处理无效的聚合根名称", () => {
      expect(() => {
        @Aggregate(null as any)
        class TestAggregate {}
      }).toThrow("聚合根名称不能为空");
    });

    it("应该处理无效的版本号", () => {
      expect(() => {
        @Aggregate("TestAggregate", { version: "1.0" })
        class TestAggregate {}
      }).toThrow("版本号格式无效");
    });

    it("应该处理无效的快照配置", () => {
      expect(() => {
        @Aggregate("TestAggregate", {
          snapshot: {
            enabled: true,
            frequency: 0,
          },
        })
        class TestAggregate {}
      }).toThrow("快照频率必须大于0");
    });
  });

  describe("集成测试", () => {
    it("应该支持完整的聚合根配置", () => {
      @Aggregate("FullAggregate", {
        version: "1.0.0",
        snapshot: {
          enabled: true,
          frequency: 10,
        },
        eventStore: {
          provider: "database",
          options: {
            maxEvents: 1000,
          },
        },
        tenantAware: true,
        isolationLevel: "tenant",
        cache: {
          enabled: true,
          ttl: 300,
        },
        metrics: {
          enabled: true,
          interval: 1000,
        },
      })
      class FullAggregate {}

      const metadata = Reflect.getMetadata("aggregate:metadata", FullAggregate);
      expect(metadata.name).toBe("FullAggregate");
      expect(metadata.version).toBe("1.0.0");
      expect(metadata.snapshot.enabled).toBe(true);
      expect(metadata.eventStore.provider).toBe("database");
      expect(metadata.tenantAware).toBe(true);
      expect(metadata.cache.enabled).toBe(true);
      expect(metadata.metrics.enabled).toBe(true);
    });
  });
});
