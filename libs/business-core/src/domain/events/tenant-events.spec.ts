import { EntityId } from "@hl8/isolation-model";
import {
  TenantCreatedEvent,
  TenantUpdatedEvent,
  TenantActivatedEvent,
  TenantDeactivatedEvent,
  TenantDeletedEvent,
} from "./tenant-events.js";
import { TenantType } from "../value-objects/types/tenant-type.vo.js";

describe("Tenant Events", () => {
  let tenantId: EntityId;
  let platformId: EntityId;
  let version: number;

  beforeEach(() => {
    tenantId = EntityId.generate();
    platformId = EntityId.generate();
    version = 1;
  });

  describe("TenantCreatedEvent", () => {
    it("应该成功创建租户创建事件", () => {
      const event = new TenantCreatedEvent(
        tenantId,
        version,
        platformId,
        "测试租户",
        TenantType.ENTERPRISE,
        platformId,
      );

      expect(event.aggregateId).toBe(tenantId);
      expect(event.version).toBe(version);
      expect(event.platformId).toBe(platformId);
      expect(event.tenantName).toBe("测试租户");
      expect(event.tenantType).toBe(TenantType.ENTERPRISE);
      expect(event.createdBy).toBe(platformId);
      expect(event.eventType).toBe("TenantCreated");
      expect(event.occurredAt).toBeInstanceOf(Date);
    });

    it("应该正确序列化事件", () => {
      const event = new TenantCreatedEvent(
        tenantId,
        version,
        platformId,
        "测试租户",
        TenantType.ENTERPRISE,
        platformId,
      );

      const serialized = event.toJSON();

      expect(serialized.aggregateId).toBe(tenantId.toString());
      expect(serialized.version).toBe(version);
      expect(serialized.platformId).toBe(platformId.toString());
      expect(serialized.tenantName).toBe("测试租户");
      expect(serialized.tenantType).toBe(TenantType.ENTERPRISE);
      expect(serialized.createdBy).toBe(platformId.toString());
      expect(serialized.eventType).toBe("TenantCreated");
      expect(serialized.occurredAt).toBeDefined();
    });

    it("应该正确反序列化事件", () => {
      const originalEvent = new TenantCreatedEvent(
        tenantId,
        version,
        platformId,
        "测试租户",
        TenantType.ENTERPRISE,
        platformId,
      );

      const serialized = originalEvent.toJSON();
      const deserialized = TenantCreatedEvent.fromJSON(serialized);

      expect(deserialized.aggregateId).toBe(originalEvent.aggregateId);
      expect(deserialized.version).toBe(originalEvent.version);
      expect(deserialized.platformId).toBe(originalEvent.platformId);
      expect(deserialized.tenantName).toBe(originalEvent.tenantName);
      expect(deserialized.tenantType).toBe(originalEvent.tenantType);
      expect(deserialized.createdBy).toBe(originalEvent.createdBy);
      expect(deserialized.eventType).toBe(originalEvent.eventType);
    });
  });

  describe("TenantUpdatedEvent", () => {
    it("应该成功创建租户更新事件", () => {
      const event = new TenantUpdatedEvent(
        tenantId,
        version,
        platformId,
        "更新后的租户名称",
        TenantType.COMMUNITY,
        platformId,
      );

      expect(event.aggregateId).toBe(tenantId);
      expect(event.version).toBe(version);
      expect(event.platformId).toBe(platformId);
      expect(event.tenantName).toBe("更新后的租户名称");
      expect(event.tenantType).toBe(TenantType.COMMUNITY);
      expect(event.updatedBy).toBe(platformId);
      expect(event.eventType).toBe("TenantUpdated");
    });

    it("应该正确序列化和反序列化", () => {
      const event = new TenantUpdatedEvent(
        tenantId,
        version,
        platformId,
        "更新后的租户名称",
        TenantType.COMMUNITY,
        platformId,
      );

      const serialized = event.toJSON();
      const deserialized = TenantUpdatedEvent.fromJSON(serialized);

      expect(deserialized.aggregateId).toBe(event.aggregateId);
      expect(deserialized.tenantName).toBe(event.tenantName);
      expect(deserialized.tenantType).toBe(event.tenantType);
    });
  });

  describe("TenantActivatedEvent", () => {
    it("应该成功创建租户激活事件", () => {
      const event = new TenantActivatedEvent(
        tenantId,
        version,
        platformId,
        platformId,
      );

      expect(event.aggregateId).toBe(tenantId);
      expect(event.version).toBe(version);
      expect(event.platformId).toBe(platformId);
      expect(event.activatedBy).toBe(platformId);
      expect(event.eventType).toBe("TenantActivated");
    });

    it("应该正确序列化和反序列化", () => {
      const event = new TenantActivatedEvent(
        tenantId,
        version,
        platformId,
        platformId,
      );

      const serialized = event.toJSON();
      const deserialized = TenantActivatedEvent.fromJSON(serialized);

      expect(deserialized.aggregateId).toBe(event.aggregateId);
      expect(deserialized.activatedBy).toBe(event.activatedBy);
    });
  });

  describe("TenantDeactivatedEvent", () => {
    it("应该成功创建租户停用事件", () => {
      const event = new TenantDeactivatedEvent(
        tenantId,
        version,
        platformId,
        platformId,
      );

      expect(event.aggregateId).toBe(tenantId);
      expect(event.version).toBe(version);
      expect(event.platformId).toBe(platformId);
      expect(event.deactivatedBy).toBe(platformId);
      expect(event.eventType).toBe("TenantDeactivated");
    });

    it("应该正确序列化和反序列化", () => {
      const event = new TenantDeactivatedEvent(
        tenantId,
        version,
        platformId,
        platformId,
      );

      const serialized = event.toJSON();
      const deserialized = TenantDeactivatedEvent.fromJSON(serialized);

      expect(deserialized.aggregateId).toBe(event.aggregateId);
      expect(deserialized.deactivatedBy).toBe(event.deactivatedBy);
    });
  });

  describe("TenantDeletedEvent", () => {
    it("应该成功创建租户删除事件", () => {
      const event = new TenantDeletedEvent(
        tenantId,
        version,
        platformId,
        platformId,
      );

      expect(event.aggregateId).toBe(tenantId);
      expect(event.version).toBe(version);
      expect(event.platformId).toBe(platformId);
      expect(event.deletedBy).toBe(platformId);
      expect(event.eventType).toBe("TenantDeleted");
    });

    it("应该正确序列化和反序列化", () => {
      const event = new TenantDeletedEvent(
        tenantId,
        version,
        platformId,
        platformId,
      );

      const serialized = event.toJSON();
      const deserialized = TenantDeletedEvent.fromJSON(serialized);

      expect(deserialized.aggregateId).toBe(event.aggregateId);
      expect(deserialized.deletedBy).toBe(event.deletedBy);
    });
  });

  describe("事件继承和通用功能", () => {
    it("所有事件都应该继承自BaseDomainEvent", () => {
      const createdEvent = new TenantCreatedEvent(
        tenantId,
        version,
        platformId,
        "测试租户",
        TenantType.ENTERPRISE,
        platformId,
      );

      expect(createdEvent).toHaveProperty("aggregateId");
      expect(createdEvent).toHaveProperty("version");
      expect(createdEvent).toHaveProperty("eventType");
      expect(createdEvent).toHaveProperty("occurredAt");
    });

    it("所有事件都应该有唯一的事件类型", () => {
      const createdEvent = new TenantCreatedEvent(
        tenantId,
        version,
        platformId,
        "测试租户",
        TenantType.ENTERPRISE,
        platformId,
      );
      const updatedEvent = new TenantUpdatedEvent(
        tenantId,
        version,
        platformId,
        "测试租户",
        TenantType.ENTERPRISE,
        platformId,
      );
      const activatedEvent = new TenantActivatedEvent(
        tenantId,
        version,
        platformId,
        platformId,
      );

      expect(createdEvent.eventType).toBe("TenantCreated");
      expect(updatedEvent.eventType).toBe("TenantUpdated");
      expect(activatedEvent.eventType).toBe("TenantActivated");
    });

    it("所有事件都应该有准确的时间戳", () => {
      const before = new Date();
      const event = new TenantCreatedEvent(
        tenantId,
        version,
        platformId,
        "测试租户",
        TenantType.ENTERPRISE,
        platformId,
      );
      const after = new Date();

      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("边界情况", () => {
    it("应该处理空字符串的租户名称", () => {
      const event = new TenantCreatedEvent(
        tenantId,
        version,
        platformId,
        "",
        TenantType.ENTERPRISE,
        platformId,
      );

      expect(event.tenantName).toBe("");
    });

    it("应该处理不同版本的租户类型", () => {
      const enterpriseEvent = new TenantCreatedEvent(
        tenantId,
        version,
        platformId,
        "企业租户",
        TenantType.ENTERPRISE,
        platformId,
      );
      const communityEvent = new TenantCreatedEvent(
        tenantId,
        version,
        platformId,
        "社区租户",
        TenantType.COMMUNITY,
        platformId,
      );

      expect(enterpriseEvent.tenantType).toBe(TenantType.ENTERPRISE);
      expect(communityEvent.tenantType).toBe(TenantType.COMMUNITY);
    });
  });
});
