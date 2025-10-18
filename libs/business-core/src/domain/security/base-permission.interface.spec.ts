import {
  PermissionScope,
  PermissionType,
  IBasePermission,
  IPermissionManager,
} from "./base-permission.interface.js";
import { EntityId } from "@hl8/isolation-model";

describe("Base Permission Interface", () => {
  describe("PermissionScope", () => {
    it("应该定义所有权限作用域", () => {
      expect(PermissionScope.SYSTEM).toBe("system");
      expect(PermissionScope.TENANT).toBe("tenant");
      expect(PermissionScope.ORGANIZATION).toBe("organization");
      expect(PermissionScope.DEPARTMENT).toBe("department");
      expect(PermissionScope.RESOURCE).toBe("resource");
    });

    it("应该包含所有必要的权限作用域", () => {
      const scopes = Object.values(PermissionScope);
      expect(scopes).toContain("system");
      expect(scopes).toContain("tenant");
      expect(scopes).toContain("organization");
      expect(scopes).toContain("department");
      expect(scopes).toContain("resource");
    });
  });

  describe("PermissionType", () => {
    it("应该定义所有权限类型", () => {
      expect(PermissionType.OPERATION).toBe("operation");
      expect(PermissionType.DATA).toBe("data");
      expect(PermissionType.FEATURE).toBe("feature");
      expect(PermissionType.CONFIGURATION).toBe("configuration");
      expect(PermissionType.MANAGEMENT).toBe("management");
    });

    it("应该包含所有必要的权限类型", () => {
      const types = Object.values(PermissionType);
      expect(types).toContain("operation");
      expect(types).toContain("data");
      expect(types).toContain("feature");
      expect(types).toContain("configuration");
      expect(types).toContain("management");
    });
  });

  describe("IBasePermission", () => {
    it("应该定义基础权限接口结构", () => {
      // 由于 IBasePermission 是接口且 EntityId 构造函数受保护
      // 这里只测试接口的结构定义，不进行实例化
      interface TestPermission extends IBasePermission {
        id: EntityId;
        code: string;
        name: string;
        description: string;
        scope: PermissionScope;
        type: PermissionType;
        isValid(): boolean;
        matches(permissionCode: string): boolean;
        getMetadata(): Record<string, unknown>;
      }

      // 验证接口结构
      const permissionInterface: TestPermission = {} as TestPermission;

      expect(permissionInterface).toBeDefined();
      // 验证接口属性存在
      expect("id" in permissionInterface).toBe(true);
      expect("code" in permissionInterface).toBe(true);
      expect("name" in permissionInterface).toBe(true);
      expect("description" in permissionInterface).toBe(true);
      expect("scope" in permissionInterface).toBe(true);
      expect("type" in permissionInterface).toBe(true);
      expect("isValid" in permissionInterface).toBe(true);
      expect("matches" in permissionInterface).toBe(true);
      expect("getMetadata" in permissionInterface).toBe(true);
    });
  });

  describe("IPermissionManager", () => {
    it("应该定义权限管理器接口方法", () => {
      const manager: IPermissionManager = {
        hasPermission: jest.fn(),
        getUserPermissions: jest.fn(),
        checkPermissions: jest.fn(),
      };

      expect(manager.hasPermission).toBeDefined();
      expect(manager.getUserPermissions).toBeDefined();
      expect(manager.checkPermissions).toBeDefined();
    });
  });

  describe("类型安全", () => {
    it("应该确保权限作用域类型安全", () => {
      const validScopes = Object.values(PermissionScope);
      const testScope = PermissionScope.TENANT;
      expect(validScopes).toContain(testScope);
    });

    it("应该确保权限类型类型安全", () => {
      const validTypes = Object.values(PermissionType);
      const testType = PermissionType.OPERATION;
      expect(validTypes).toContain(testType);
    });
  });
});
