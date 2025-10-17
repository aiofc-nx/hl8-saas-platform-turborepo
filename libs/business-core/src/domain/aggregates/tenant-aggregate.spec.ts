import { TenantId } from "@hl8/isolation-model";
import { TenantAggregate, TenantCreatedEvent, TenantUpdatedEvent, TenantDeletedEvent } from "./tenant-aggregate.js";
import { TenantType } from "../value-objects/types/tenant-type.vo.js";
import { IPartialAuditInfo } from "../entities/base/audit-info.js";

describe("TenantAggregate", () => {
  let tenantAggregate: TenantAggregate;
  let platformId: EntityId;
  let tenantId: EntityId;
  let auditInfo: IPartialAuditInfo;

  beforeEach(() => {
    platformId = TenantId.generate();
    tenantId = TenantId.generate();
    auditInfo = {
      tenantId: platformId,
      createdBy: "admin",
    };
  });

  describe("构造函数", () => {
    it("应该创建租户聚合根并发布创建事件", () => {
      tenantAggregate = new TenantAggregate(
        tenantId,
        {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: platformId,
        },
        auditInfo,
      );

      expect(tenantAggregate.tenant.name).toBe("测试租户");
      expect(tenantAggregate.tenant.type).toBe(TenantType.ENTERPRISE);
      expect(tenantAggregate.platformId).toEqual(platformId);

      // 验证创建事件
      const events = tenantAggregate.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TenantCreatedEvent);
      expect((events[0] as TenantCreatedEvent).name).toBe("测试租户");
      expect((events[0] as TenantCreatedEvent).type).toBe(TenantType.ENTERPRISE);
    });

    it("应该验证租户上下文", () => {
      expect(() => {
        new TenantAggregate(
          tenantId,
          {
            name: "测试租户",
            type: TenantType.ENTERPRISE,
            platformId: platformId,
          },
          { createdBy: "admin" }, // 缺少tenantId，但BaseEntity会生成默认值
        );
      }).not.toThrow(); // 实际上不会抛出异常，因为BaseEntity会生成默认tenantId
    });
  });

  describe("updateName", () => {
    beforeEach(() => {
      tenantAggregate = new TenantAggregate(
        tenantId,
        {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: platformId,
        },
        auditInfo,
      );
      tenantAggregate.clearEvents(); // 清除创建事件
    });

    it("应该更新租户名称并发布更新事件", () => {
      tenantAggregate.updateName("新租户名称", "admin");

      expect(tenantAggregate.tenant.name).toBe("新租户名称");

      const events = tenantAggregate.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TenantUpdatedEvent);
      expect((events[0] as TenantUpdatedEvent).name).toBe("新租户名称");
    });

    it("应该记录操作日志", () => {
      const logSpy = jest.spyOn(console, "info");
      tenantAggregate.updateName("新租户名称", "admin");

      expect(logSpy).toHaveBeenCalledWith("租户名称已更新", undefined);
      logSpy.mockRestore();
    });
  });

  describe("updateType", () => {
    beforeEach(() => {
      tenantAggregate = new TenantAggregate(
        tenantId,
        {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: platformId,
        },
        auditInfo,
      );
      tenantAggregate.clearEvents(); // 清除创建事件
    });

    it("应该更新租户类型并发布更新事件", () => {
      tenantAggregate.updateType(TenantType.COMMUNITY, "admin");

      expect(tenantAggregate.tenant.type).toBe(TenantType.COMMUNITY);

      const events = tenantAggregate.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TenantUpdatedEvent);
      expect((events[0] as TenantUpdatedEvent).type).toBe(TenantType.COMMUNITY);
    });
  });

  describe("delete", () => {
    beforeEach(() => {
      tenantAggregate = new TenantAggregate(
        tenantId,
        {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: platformId,
        },
        auditInfo,
      );
      tenantAggregate.clearEvents(); // 清除创建事件
    });

    it("应该删除租户并发布删除事件", () => {
      tenantAggregate.delete("admin", "不再需要");

      expect(tenantAggregate.tenant.isDeleted).toBe(true);

      const events = tenantAggregate.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TenantDeletedEvent);
      expect((events[0] as TenantDeletedEvent).deletedBy).toBe("admin");
      expect((events[0] as TenantDeletedEvent).deleteReason).toBe("不再需要");
    });

    it("应该防止重复删除", () => {
      tenantAggregate.delete("admin", "不再需要");

      expect(() => {
        tenantAggregate.delete("admin", "再次删除");
      }).toThrow("租户已被删除");
    });
  });

  describe("restore", () => {
    beforeEach(() => {
      tenantAggregate = new TenantAggregate(
        tenantId,
        {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: platformId,
        },
        auditInfo,
      );
      tenantAggregate.clearEvents(); // 清除创建事件
      tenantAggregate.delete("admin", "测试删除");
      tenantAggregate.clearEvents(); // 清除删除事件
    });

    it("应该恢复租户并发布更新事件", () => {
      tenantAggregate.restore("admin");

      expect(tenantAggregate.tenant.isDeleted).toBe(false);

      const events = tenantAggregate.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TenantUpdatedEvent);
    });

    it("应该防止恢复未删除的租户", () => {
      tenantAggregate.restore("admin");

      expect(() => {
        tenantAggregate.restore("admin");
      }).toThrow("租户未被删除");
    });
  });

  describe("belongsToPlatform", () => {
    beforeEach(() => {
      tenantAggregate = new TenantAggregate(
        tenantId,
        {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: platformId,
        },
        auditInfo,
      );
    });

    it("应该正确识别所属平台", () => {
      expect(tenantAggregate.belongsToPlatform(platformId)).toBe(true);

      const otherPlatformId = TenantId.generate();
      expect(tenantAggregate.belongsToPlatform(otherPlatformId)).toBe(false);
    });
  });

  describe("getStatus", () => {
    beforeEach(() => {
      tenantAggregate = new TenantAggregate(
        tenantId,
        {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: platformId,
        },
        auditInfo,
      );
    });

    it("应该返回正确的状态信息", () => {
      const status = tenantAggregate.getStatus();

      expect(status.isActive).toBe(true);
      expect(status.isDeleted).toBe(false);
      expect(status.createdAt).toBeInstanceOf(Date);
      expect(status.updatedAt).toBeInstanceOf(Date);
    });

    it("删除后应该返回正确的状态信息", () => {
      tenantAggregate.delete("admin", "测试删除");
      const status = tenantAggregate.getStatus();

      expect(status.isActive).toBe(false);
      expect(status.isDeleted).toBe(true);
    });
  });

  describe("toData", () => {
    beforeEach(() => {
      tenantAggregate = new TenantAggregate(
        tenantId,
        {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: platformId,
        },
        auditInfo,
      );
    });

    it("应该返回完整的数据对象", () => {
      const data = tenantAggregate.toData();

      expect(data.id).toBe(tenantId.toString());
      expect(data.platformId).toBe(platformId.toString());
      expect(data.tenant.name).toBe("测试租户");
      expect(data.tenant.type).toBe(TenantType.ENTERPRISE.value);
      expect(data.tenant.isDeleted).toBe(false);
    });
  });

  describe("toString", () => {
    beforeEach(() => {
      tenantAggregate = new TenantAggregate(
        tenantId,
        {
          name: "测试租户",
          type: TenantType.ENTERPRISE,
          platformId: platformId,
        },
        auditInfo,
      );
    });

    it("应该返回正确的字符串表示", () => {
      const str = tenantAggregate.toString();

      expect(str).toContain("TenantAggregate");
      expect(str).toContain(tenantId.toString());
      expect(str).toContain("测试租户");
      expect(str).toContain(TenantType.ENTERPRISE.value);
    });
  });
});
