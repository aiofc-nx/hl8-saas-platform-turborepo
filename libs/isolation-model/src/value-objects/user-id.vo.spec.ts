/**
 * UserId 值对象单元测试
 */

import { IsolationValidationError } from "../errors/isolation-validation.error.js";
import { UserId } from "./user-id.vo.js";

describe("UserId", () => {
  const validUuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  beforeEach(() => {
    UserId.clearCache();
  });

  it("应该创建有效的 UserId", () => {
    const id = UserId.create(validUuid);
    expect(id.getValue()).toBe(validUuid);
  });

  it("应该使用 Flyweight 模式", () => {
    const id1 = UserId.create(validUuid);
    const id2 = UserId.create(validUuid);
    expect(id1).toBe(id2);
  });

  it("应该拒绝无效的 UUID", () => {
    expect(() => UserId.create("not-a-uuid")).toThrow(IsolationValidationError);
  });
});
