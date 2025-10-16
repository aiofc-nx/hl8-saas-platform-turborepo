/**
 * BaseCommand 测试
 *
 * @description 测试 BaseCommand 基础命令类的功能
 * @since 1.0.0
 */
import { BaseCommand } from "./base-command.js";
import { EntityId } from "@hl8/isolation-model";
import { TenantId } from "@hl8/isolation-model";

// 测试用的命令类
class TestCommand extends BaseCommand {
  private _customCommandId?: EntityId;

  constructor(
    tenantId: string,
    userId: string,
    commandVersion = 1,
    metadata: Record<string, unknown> = {},
    public readonly action = "",
    public readonly data: Record<string, unknown> = {},
    customCommandId?: EntityId,
  ) {
    super(tenantId, userId, commandVersion, metadata);
    this._customCommandId = customCommandId;
  }

  // 静态工厂方法支持旧格式
  static create(
    action: string,
    data: Record<string, unknown> = {},
    tenantId = "default-tenant",
    userId = "default-user",
    commandVersion = 1,
    metadata: Record<string, unknown> = {},
    customCommandId?: EntityId,
  ): TestCommand {
    return new TestCommand(
      tenantId,
      userId,
      commandVersion,
      metadata,
      action,
      data,
      customCommandId,
    );
  }

  override get commandId(): EntityId {
    return this._customCommandId || super.commandId;
  }

  get commandType(): string {
    return "TestCommand";
  }

  override get commandData(): Record<string, unknown> {
    return {
      action: this.action,
      data: this.data,
    };
  }

  override validate(): {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  } {
    // 只在特定测试中验证，构造函数调用时不抛出错误
    if (this.action === "INVALID_ACTION") {
      return {
        isValid: false,
        errors: [{ field: "action", message: "Action is invalid" }],
      };
    }
    return { isValid: true, errors: [] };
  }
}

// 复杂命令类
class ComplexCommand extends BaseCommand {
  constructor(
    tenantId: string,
    userId: string,
    commandVersion = 1,
    metadata: Record<string, unknown> = {},
    public readonly operation: {
      type: "CREATE" | "UPDATE" | "DELETE";
      target: string;
      payload: Record<string, unknown>;
    } = { type: "CREATE", target: "", payload: {} },
    public readonly options: {
      async?: boolean;
      timeout?: number;
      retries?: number;
    } = {},
  ) {
    super(tenantId, userId, commandVersion, metadata);
  }

  get commandType(): string {
    return "ComplexCommand";
  }

  override get commandData(): Record<string, unknown> {
    return {
      operation: this.operation,
      options: this.options,
    };
  }

  override validate(): {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  } {
    const errors: Array<{ field: string; message: string }> = [];

    if (this.operation && !this.operation.type) {
      errors.push({
        field: "operation.type",
        message: "Operation type is required",
      });
    }
    if (this.operation && !this.operation.target) {
      errors.push({
        field: "operation.target",
        message: "Operation target is required",
      });
    }
    if (this.options && this.options.timeout && this.options.timeout < 0) {
      errors.push({
        field: "options.timeout",
        message: "Timeout must be non-negative",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

describe("BaseCommand", () => {
  let tenantId: string;

  beforeEach(() => {
    tenantId = "test-tenant-123";
  });

  describe("命令创建", () => {
    it("应该正确创建基础命令", () => {
      const command = new TestCommand(
        tenantId,
        "user-123",
        1,
        {},
        "test-action",
        { key: "value" },
      );

      expect(command).toBeInstanceOf(BaseCommand);
      expect(command.tenantId).toBe(tenantId);
      expect(command.userId).toBe("user-123");
      expect(command.action).toBe("test-action");
      expect(command.data).toEqual({ key: "value" });
      expect(command.createdAt).toBeInstanceOf(Date);
      expect(command.commandType).toBe("TestCommand");
    });

    it("应该为每个命令生成唯一的ID", () => {
      const command1 = TestCommand.create("action1");
      const command2 = TestCommand.create("action2");

      expect(command1.commandId).not.toBe(command2.commandId);
    });

    it("应该正确设置命令创建时间", () => {
      const beforeTime = new Date();
      const command = TestCommand.create("test-action");
      const afterTime = new Date();

      expect(command.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(command.createdAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });
  });

  describe("命令类型和验证", () => {
    it("应该返回正确的命令类型", () => {
      const command = TestCommand.create("test-action");
      expect(command.commandType).toBe("TestCommand");
    });

    it("应该正确验证命令", () => {
      const validCommand = TestCommand.create("valid-action");
      expect(() => validCommand.validate()).not.toThrow();

      const invalidCommand = TestCommand.create("INVALID_ACTION");
      const result = invalidCommand.validate();
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes("Action is invalid")),
      ).toBe(true);
    });

    it("应该正确检查命令类型", () => {
      const command = TestCommand.create("test-action");
      expect(command.isOfType("TestCommand")).toBe(true);
      expect(command.isOfType("OtherCommand")).toBe(false);
    });
  });

  describe("命令相等性", () => {
    it("相同ID的命令应该相等", () => {
      const sharedCommandId = TenantId.generate();
      const TestCommandClass = class extends BaseCommand {
        constructor(
          public readonly action: string,
          tenantId = "default",
          userId = "default-user",
          customCommandId?: EntityId,
        ) {
          super(tenantId, userId);
          if (customCommandId) {
            Object.defineProperty(this, "_commandId", {
              value: customCommandId,
              writable: false,
            });
          }
        }

        get commandType(): string {
          return "TestCommand";
        }
      };

      const command1 = new TestCommandClass(
        "action1",
        "tenant-123",
        "user-456",
        sharedCommandId,
      );
      const command2 = new TestCommandClass(
        "action2",
        "tenant-123",
        "user-456",
        sharedCommandId,
      );

      expect(command1.equals(command2)).toBe(true);
    });

    it("不同ID的命令应该不相等", () => {
      const command1 = TestCommand.create("action1", {}, tenantId);
      const command2 = TestCommand.create("action2", {}, tenantId);

      expect(command1.equals(command2)).toBe(false);
    });

    it("与 null 或 undefined 比较应该返回 false", () => {
      const command = TestCommand.create("test-action");
      expect(command.equals(null)).toBe(false);
      expect(command.equals(undefined)).toBe(false);
    });
  });

  describe("命令比较", () => {
    it("应该按创建时间比较命令", async () => {
      const command1 = TestCommand.create("action1");

      // 等待一小段时间确保时间不同
      await new Promise((resolve) => setTimeout(resolve, 10));

      const command2 = TestCommand.create("action2");

      expect(command1.compareTo(command2)).toBeLessThan(0);
      expect(command2.compareTo(command1)).toBeGreaterThan(0);
      expect(command1.compareTo(command1)).toBe(0);
    });

    it("与 null 或 undefined 比较应该返回 1", () => {
      const command = TestCommand.create("test-action");
      expect(command.compareTo(null as unknown as TestCommand)).toBe(1);
      expect(command.compareTo(undefined as unknown as TestCommand)).toBe(1);
    });
  });

  describe("租户关联", () => {
    it("应该正确检查命令是否属于指定的租户", () => {
      const command = TestCommand.create(
        "test-action",
        {},
        tenantId,
        "user-456",
      );
      const otherTenantId = "other-tenant-456";

      expect(command.belongsToTenant(tenantId)).toBe(true);
      expect(command.belongsToTenant(otherTenantId)).toBe(false);
    });
  });

  describe("命令转换", () => {
    it("应该正确转换为字符串", () => {
      const command = TestCommand.create("test-action");
      expect(command.toString()).toMatch(/^TestCommand\([a-f0-9-]+\)$/);
    });

    it("应该正确转换为 JSON", () => {
      const command = TestCommand.create("test-action", { key: "value" });
      const json = command.toJSON();

      expect(json).toHaveProperty("commandId");
      expect(json).toHaveProperty("commandType", "TestCommand");
      expect(json).toHaveProperty("tenantId");
      expect(json).toHaveProperty("createdAt");
      expect(json).toHaveProperty("commandData");
      expect(json["commandData"]).toEqual({
        action: "test-action",
        data: { key: "value" },
      });
    });

    it("应该正确获取哈希码", () => {
      const command = TestCommand.create("test-action");
      expect(command.getHashCode()).toBe(command.commandId.toString());
    });

    it("应该正确获取类型名称", () => {
      const command = TestCommand.create("test-action");
      expect(command.getTypeName()).toBe("TestCommand");
    });
  });

  describe("复杂命令测试", () => {
    it("应该正确创建复杂命令", () => {
      const operation = {
        type: "CREATE" as const,
        target: "User",
        payload: { name: "John", email: "john@example.com" },
      };
      const options = {
        async: true,
        timeout: 5000,
        retries: 3,
      };

      const command = new ComplexCommand(
        "default-tenant",
        "default-user",
        1,
        {},
        operation,
        options,
      );

      expect(command.operation).toEqual(operation);
      expect(command.options).toEqual(options);
      expect(command.commandType).toBe("ComplexCommand");
    });

    it("应该正确验证复杂命令", () => {
      const validCommand = new ComplexCommand(
        "default-tenant",
        "default-user",
        1,
        {},
        {
          type: "UPDATE",
          target: "Product",
          payload: { price: 100 },
        },
      );
      expect(() => validCommand.validate()).not.toThrow();

      // 缺少操作类型
      const invalidTypeCommand = new ComplexCommand(
        "default-tenant",
        "default-user",
        1,
        {},
        {
          type: "" as "CREATE",
          target: "User",
          payload: {},
        },
      );
      const result = invalidTypeCommand.validate();
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.message.includes("Operation type is required"),
        ),
      ).toBe(true);

      // 缺少操作目标
      const invalidTargetCommand = new ComplexCommand(
        "default-tenant",
        "default-user",
        1,
        {},
        {
          type: "CREATE",
          target: "",
          payload: {},
        },
      );
      const targetResult = invalidTargetCommand.validate();
      expect(targetResult.isValid).toBe(false);
      expect(
        targetResult.errors.some((e) =>
          e.message.includes("Operation target is required"),
        ),
      ).toBe(true);

      // 无效的超时时间
      const invalidTimeoutCommand = new ComplexCommand(
        "default-tenant",
        "default-user",
        1,
        {},
        {
          type: "DELETE",
          target: "User",
          payload: {},
        },
        { timeout: -1 },
      );
      const timeoutResult = invalidTimeoutCommand.validate();
      expect(timeoutResult.isValid).toBe(false);
      expect(
        timeoutResult.errors.some((e) =>
          e.message.includes("Timeout must be non-negative"),
        ),
      ).toBe(true);
    });
  });

  describe("边界情况", () => {
    it("应该处理空数据对象", () => {
      const command = TestCommand.create("test-action", {});
      expect(command.data).toEqual({});
      expect(() => command.validate()).not.toThrow();
    });

    it("应该处理特殊字符的动作", () => {
      const specialAction = "test-action_123.@#$%^&*()";
      const command = TestCommand.create(specialAction);
      expect(command.action).toBe(specialAction);
    });

    it("应该处理复杂的数据对象", () => {
      const complexData = {
        nested: {
          deep: {
            value: "test",
            array: [1, 2, 3],
            object: { key: "value" },
          },
        },
        functions: {
          // 注意：函数不会被序列化
          callback: () => "test",
        },
        dates: new Date(),
        regex: /test/g,
      };

      const command = TestCommand.create("test-action", complexData);
      expect(command.data).toEqual(complexData);
    });

    it("应该处理 Unicode 字符", () => {
      const unicodeAction = "测试动作_José_🚀";
      const command = TestCommand.create(
        unicodeAction,
        {},
        "租户-123",
        "user-456",
      );

      expect(command.action).toBe(unicodeAction);
      expect(command.tenantId).toBe("租户-123");
    });
  });
});
