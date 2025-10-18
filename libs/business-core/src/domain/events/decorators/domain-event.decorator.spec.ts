import { DomainEvent } from "./domain-event.decorator.js";

describe("DomainEvent Decorator", () => {
  describe("基本功能", () => {
    it("应该能够装饰类", () => {
      @DomainEvent("TestEvent")
      class TestEvent {}

      expect(TestEvent).toBeDefined();
    });

    it("应该能够设置事件名称", () => {
      @DomainEvent("UserCreated")
      class UserCreatedEvent {}

      expect(UserCreatedEvent).toBeDefined();
    });

    it("应该能够设置版本", () => {
      @DomainEvent("TestEvent", { version: "1.0.0" })
      class TestEvent {}

      expect(TestEvent).toBeDefined();
    });

    it("应该能够设置事件类型", () => {
      @DomainEvent("TestEvent", { type: "domain" })
      class TestEvent {}

      expect(TestEvent).toBeDefined();
    });

    it("应该能够设置优先级", () => {
      @DomainEvent("TestEvent", { priority: "high" })
      class TestEvent {}

      expect(TestEvent).toBeDefined();
    });
  });

  describe("元数据管理", () => {
    it("应该能够获取事件元数据", () => {
      @DomainEvent("TestEvent")
      class TestEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", TestEvent);
      expect(metadata).toBeDefined();
      expect(metadata.name).toBe("TestEvent");
    });

    it("应该能够获取版本信息", () => {
      @DomainEvent("TestEvent", { version: "2.0.0" })
      class TestEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", TestEvent);
      expect(metadata.version).toBe("2.0.0");
    });

    it("应该能够获取事件类型", () => {
      @DomainEvent("TestEvent", { type: "integration" })
      class TestEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", TestEvent);
      expect(metadata.type).toBe("integration");
    });

    it("应该能够获取优先级", () => {
      @DomainEvent("TestEvent", { priority: "critical" })
      class TestEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", TestEvent);
      expect(metadata.priority).toBe("critical");
    });
  });

  describe("默认配置", () => {
    it("应该使用默认版本", () => {
      @DomainEvent("TestEvent")
      class TestEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", TestEvent);
      expect(metadata.version).toBe("1.0.0");
    });

    it("应该使用默认事件类型", () => {
      @DomainEvent("TestEvent")
      class TestEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", TestEvent);
      expect(metadata.type).toBe("domain");
    });

    it("应该使用默认优先级", () => {
      @DomainEvent("TestEvent")
      class TestEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", TestEvent);
      expect(metadata.priority).toBe("normal");
    });
  });

  describe("配置验证", () => {
    it("应该验证事件名称", () => {
      expect(() => {
        @DomainEvent("")
        class TestEvent {}
      }).toThrow();
    });

    it("应该验证版本格式", () => {
      expect(() => {
        @DomainEvent("TestEvent", { version: "invalid" })
        class TestEvent {}
      }).toThrow();
    });

    it("应该验证事件类型", () => {
      expect(() => {
        @DomainEvent("TestEvent", { type: "invalid" })
        class TestEvent {}
      }).toThrow();
    });

    it("应该验证优先级", () => {
      expect(() => {
        @DomainEvent("TestEvent", { priority: "invalid" })
        class TestEvent {}
      }).toThrow();
    });
  });

  describe("业务规则", () => {
    it("应该支持租户感知事件", () => {
      @DomainEvent("TenantEvent", {
        tenantAware: true,
      })
      class TenantEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        TenantEvent,
      );
      expect(metadata.tenantAware).toBe(true);
    });

    it("应该支持隔离级别配置", () => {
      @DomainEvent("IsolationEvent", {
        isolationLevel: "tenant",
      })
      class IsolationEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        IsolationEvent,
      );
      expect(metadata.isolationLevel).toBe("tenant");
    });

    it("应该支持事件版本控制", () => {
      @DomainEvent("VersionedEvent", {
        versioning: {
          enabled: true,
          currentVersion: "2.0.0",
        },
      })
      class VersionedEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        VersionedEvent,
      );
      expect(metadata.versioning.enabled).toBe(true);
      expect(metadata.versioning.currentVersion).toBe("2.0.0");
    });
  });

  describe("序列化配置", () => {
    it("应该支持序列化配置", () => {
      @DomainEvent("SerializableEvent", {
        serialization: {
          format: "json",
          compression: true,
        },
      })
      class SerializableEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        SerializableEvent,
      );
      expect(metadata.serialization.format).toBe("json");
      expect(metadata.serialization.compression).toBe(true);
    });

    it("应该支持敏感数据过滤", () => {
      @DomainEvent("SecureEvent", {
        security: {
          excludeSensitiveData: true,
          encryption: true,
        },
      })
      class SecureEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        SecureEvent,
      );
      expect(metadata.security.excludeSensitiveData).toBe(true);
      expect(metadata.security.encryption).toBe(true);
    });

    it("应该支持数据验证", () => {
      @DomainEvent("ValidatedEvent", {
        validation: {
          enabled: true,
          strict: true,
        },
      })
      class ValidatedEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        ValidatedEvent,
      );
      expect(metadata.validation.enabled).toBe(true);
      expect(metadata.validation.strict).toBe(true);
    });
  });

  describe("性能配置", () => {
    it("应该支持缓存配置", () => {
      @DomainEvent("CachedEvent", {
        cache: {
          enabled: true,
          ttl: 300,
        },
      })
      class CachedEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        CachedEvent,
      );
      expect(metadata.cache.enabled).toBe(true);
      expect(metadata.cache.ttl).toBe(300);
    });

    it("应该支持批处理配置", () => {
      @DomainEvent("BatchEvent", {
        batch: {
          enabled: true,
          size: 100,
        },
      })
      class BatchEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", BatchEvent);
      expect(metadata.batch.enabled).toBe(true);
      expect(metadata.batch.size).toBe(100);
    });

    it("应该支持异步处理", () => {
      @DomainEvent("AsyncEvent", {
        async: {
          enabled: true,
          timeout: 5000,
        },
      })
      class AsyncEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", AsyncEvent);
      expect(metadata.async.enabled).toBe(true);
      expect(metadata.async.timeout).toBe(5000);
    });
  });

  describe("监控配置", () => {
    it("应该支持指标收集", () => {
      @DomainEvent("MonitoredEvent", {
        metrics: {
          enabled: true,
          interval: 1000,
        },
      })
      class MonitoredEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        MonitoredEvent,
      );
      expect(metadata.metrics.enabled).toBe(true);
      expect(metadata.metrics.interval).toBe(1000);
    });

    it("应该支持审计日志", () => {
      @DomainEvent("AuditedEvent", {
        audit: {
          enabled: true,
          level: "all",
        },
      })
      class AuditedEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        AuditedEvent,
      );
      expect(metadata.audit.enabled).toBe(true);
      expect(metadata.audit.level).toBe("all");
    });

    it("应该支持错误处理", () => {
      @DomainEvent("ErrorHandledEvent", {
        errorHandling: {
          enabled: true,
          retryCount: 3,
        },
      })
      class ErrorHandledEvent {}

      const metadata = Reflect.getMetadata(
        "domain-event:metadata",
        ErrorHandledEvent,
      );
      expect(metadata.errorHandling.enabled).toBe(true);
      expect(metadata.errorHandling.retryCount).toBe(3);
    });
  });

  describe("错误处理", () => {
    it("应该处理无效的事件名称", () => {
      expect(() => {
        @DomainEvent(null as any)
        class TestEvent {}
      }).toThrow("事件名称不能为空");
    });

    it("应该处理无效的版本号", () => {
      expect(() => {
        @DomainEvent("TestEvent", { version: "1.0" })
        class TestEvent {}
      }).toThrow("版本号格式无效");
    });

    it("应该处理无效的事件类型", () => {
      expect(() => {
        @DomainEvent("TestEvent", { type: "unknown" })
        class TestEvent {}
      }).toThrow("事件类型无效");
    });
  });

  describe("集成测试", () => {
    it("应该支持完整的事件配置", () => {
      @DomainEvent("FullEvent", {
        version: "1.0.0",
        type: "domain",
        priority: "high",
        tenantAware: true,
        isolationLevel: "tenant",
        serialization: {
          format: "json",
          compression: true,
        },
        security: {
          excludeSensitiveData: true,
          encryption: true,
        },
        cache: {
          enabled: true,
          ttl: 300,
        },
        metrics: {
          enabled: true,
          interval: 1000,
        },
      })
      class FullEvent {}

      const metadata = Reflect.getMetadata("domain-event:metadata", FullEvent);
      expect(metadata.name).toBe("FullEvent");
      expect(metadata.version).toBe("1.0.0");
      expect(metadata.type).toBe("domain");
      expect(metadata.priority).toBe("high");
      expect(metadata.tenantAware).toBe(true);
      expect(metadata.serialization.format).toBe("json");
      expect(metadata.security.encryption).toBe(true);
      expect(metadata.cache.enabled).toBe(true);
      expect(metadata.metrics.enabled).toBe(true);
    });
  });
});
