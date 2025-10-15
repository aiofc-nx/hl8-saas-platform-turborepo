/**
 * CacheInvalidatedEvent 事件单元测试
 */

import { IsolationContext, TenantId } from "@hl8/isolation-model";
import { CacheKey } from "../value-objects/cache-key.vo.js";
import { CacheInvalidatedEvent } from "./cache-invalidated.event.js";

describe("CacheInvalidatedEvent", () => {
  it("应该创建事件", () => {
    const context = IsolationContext.tenant(
      TenantId.create("550e8400-e29b-41d4-a716-446655440000"),
    );
    const key = CacheKey.forTenant("user", "profile", "hl8:cache:", context);
    const event = new CacheInvalidatedEvent(key, "manual-clear", {
      userId: "u999",
    });

    expect(event.cacheKey).toBe(key);
    expect(event.reason).toBe("manual-clear");
    expect(event.context).toEqual({ userId: "u999" });
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it("应该生成事件名称", () => {
    const context = IsolationContext.platform();
    const key = CacheKey.forPlatform("system", "config", "hl8:cache:");
    const event = new CacheInvalidatedEvent(key, "expired");

    expect(event.getEventName()).toBe("cache.invalidated");
  });

  it("应该转换为日志格式", () => {
    const context = IsolationContext.platform();
    const key = CacheKey.forPlatform("system", "config", "hl8:cache:");
    const event = new CacheInvalidatedEvent(key, "manual-clear");

    const log = event.toLogFormat();

    expect(log.event).toBe("cache.invalidated");
    expect(log.cacheKey).toBe(key.toString());
    expect(log.reason).toBe("manual-clear");
    expect(log.occurredAt).toBeTruthy();
  });
});
