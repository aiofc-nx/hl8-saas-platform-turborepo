/**
 * CacheLevelInvalidatedEvent 事件单元测试
 */

import { CacheLevel } from "../../types/cache-level.enum.js";
import { CacheLevelInvalidatedEvent } from "./cache-level-invalidated.event.js";

describe("CacheLevelInvalidatedEvent", () => {
  it("应该创建事件", () => {
    const event = new CacheLevelInvalidatedEvent(
      CacheLevel.TENANT,
      { tenantId: "550e8400-e29b-41d4-a716-446655440000" },
      "tenant-deleted",
      100,
    );

    expect(event.level).toBe(CacheLevel.TENANT);
    expect(event.identifiers).toEqual({
      tenantId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(event.reason).toBe("tenant-deleted");
    expect(event.affectedKeys).toBe(100);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("应该生成事件名称", () => {
    const event = new CacheLevelInvalidatedEvent(
      CacheLevel.ORGANIZATION,
      { tenantId: "t123", organizationId: "o456" },
      "org-restructure",
    );

    expect(event.getEventName()).toBe("cache.level.invalidated");
  });

  it("应该转换为日志格式", () => {
    const event = new CacheLevelInvalidatedEvent(
      CacheLevel.DEPARTMENT,
      { tenantId: "t123", organizationId: "o456", departmentId: "d789" },
      "dept-dissolved",
      50,
    );

    const log = event.toLogFormat();

    expect(log.event).toBe("cache.level.invalidated");
    expect(log.level).toBe(CacheLevel.DEPARTMENT);
    expect(log.identifiers).toBeTruthy();
    expect(log.reason).toBe("dept-dissolved");
    expect(log.affectedKeys).toBe(50);
  });
});
