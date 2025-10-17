/**
 * 租户实体测试
 *
 * @description 测试租户实体的业务逻辑和验证规则
 * 包括构造函数、业务方法、验证规则、边界条件等
 *
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { TenantId } from "@hl8/isolation-model";
import { Tenant } from "./tenant.entity.js";
import { TenantType } from "../../value-objects/types/tenant-type.vo.js";
import type { IPartialAuditInfo } from "../base/audit-info.js";
import type { IPureLogger } from "@hl8/pure-logger";

describe("Tenant Entity", () => {
  let tenant: Tenant;
  let auditInfo: IPartialAuditInfo;
  let mockLogger: jest.Mocked<IPureLogger>;

  beforeEach(() => {
    auditInfo = {
      createdBy: TenantId.generate().getValue(),
      updatedBy: TenantId.generate().getValue(),
    };

    // 创建模拟日志记录器
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn(),
      setLevel: jest.fn(),
      getLevel: jest.fn(),
    } as unknown as jest.Mocked<IPureLogger>;
  });

  describe("构造函数", () => {
    it("应该成功创建租户实体", () => {
      const props = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
      };

      tenant = new Tenant(TenantId.generate(), props, auditInfo, mockLogger);

      expect(tenant.name).toBe("测试租户");
      expect(tenant.type).toBe(TenantType.ENTERPRISE);
    });

    it("应该成功创建租户实体（不提供日志记录器）", () => {
      const props = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
      };

      tenant = new Tenant(TenantId.generate(), props, auditInfo);

      expect(tenant.name).toBe("测试租户");
      expect(tenant.type).toBe(TenantType.ENTERPRISE);
    });

    it("应该验证租户名称不能为空", () => {
      const props = {
        name: "",
        type: TenantType.ENTERPRISE,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).toThrow("租户名称不能为空");
    });

    it("应该验证租户名称长度不能超过100", () => {
      const props = {
        name: "a".repeat(101),
        type: TenantType.ENTERPRISE,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).toThrow("租户名称长度不能超过100");
    });

    it("应该验证租户类型不能为空", () => {
      const props = {
        name: "测试租户",
        type: null as any,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).toThrow("租户类型无效");
    });

    it("应该验证租户名称不能为null", () => {
      const props = {
        name: null as any,
        type: TenantType.ENTERPRISE,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).toThrow("租户名称不能为空");
    });

    it("应该验证租户名称不能为undefined", () => {
      const props = {
        name: undefined as any,
        type: TenantType.ENTERPRISE,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).toThrow("租户名称不能为空");
    });

    it("应该验证租户名称不能只包含空格", () => {
      const props = {
        name: "   ",
        type: TenantType.ENTERPRISE,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).toThrow("租户名称不能为空");
    });

    it("应该验证租户名称长度边界值", () => {
      const props = {
        name: "a".repeat(100), // 正好100个字符
        type: TenantType.ENTERPRISE,
      };

      // 应该成功创建
      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).not.toThrow();
    });
  });

  describe("重命名", () => {
    beforeEach(() => {
      const props = {
        name: "原始租户",
        type: TenantType.ENTERPRISE,
      };
      tenant = new Tenant(TenantId.generate(), props, auditInfo, mockLogger);
    });

    it("应该成功重命名租户", () => {
      tenant.rename("新租户名称");

      expect(tenant.name).toBe("新租户名称");
    });

    it("应该自动去除名称前后空格", () => {
      tenant.rename("  新租户名称  ");

      expect(tenant.name).toBe("新租户名称");
    });

    it("应该验证新名称不能为空", () => {
      expect(() => {
        tenant.rename("");
      }).toThrow("租户名称不能为空");
    });

    it("应该验证新名称长度不能超过100", () => {
      expect(() => {
        tenant.rename("a".repeat(101));
      }).toThrow("租户名称长度不能超过100");
    });

    it("应该记录重命名操作日志", () => {
      tenant.rename("新租户名称");

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining("Entity rename"),
        expect.objectContaining({
          operation: "rename",
        }),
      );
    });
  });

  describe("更改类型", () => {
    beforeEach(() => {
      const props = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
      };
      tenant = new Tenant(TenantId.generate(), props, auditInfo, mockLogger);
    });

    it("应该成功更改租户类型", () => {
      tenant.changeType(TenantType.COMMUNITY);

      expect(tenant.type).toBe(TenantType.COMMUNITY);
    });

    it("应该验证新类型不能为空", () => {
      expect(() => {
        tenant.changeType(null as any);
      }).toThrow("租户类型不能为空");
    });

    it("应该验证新类型不能为undefined", () => {
      expect(() => {
        tenant.changeType(undefined as any);
      }).toThrow("租户类型不能为空");
    });

    it("应该记录更改类型操作日志", () => {
      tenant.changeType(TenantType.COMMUNITY);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining("Entity changeType"),
        expect.objectContaining({
          operation: "changeType",
        }),
      );
    });

    it("应该支持所有租户类型之间的转换", () => {
      // 企业 -> 社群
      tenant.changeType(TenantType.COMMUNITY);
      expect(tenant.type).toBe(TenantType.COMMUNITY);

      // 社群 -> 团队
      tenant.changeType(TenantType.TEAM);
      expect(tenant.type).toBe(TenantType.TEAM);

      // 团队 -> 个人
      tenant.changeType(TenantType.PERSONAL);
      expect(tenant.type).toBe(TenantType.PERSONAL);

      // 个人 -> 企业
      tenant.changeType(TenantType.ENTERPRISE);
      expect(tenant.type).toBe(TenantType.ENTERPRISE);
    });
  });

  describe("业务方法", () => {
    beforeEach(() => {
      const props = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
      };
      tenant = new Tenant(TenantId.generate(), props, auditInfo, mockLogger);
    });

    it("应该正确返回租户名称", () => {
      expect(tenant.name).toBe("测试租户");
    });

    it("应该正确返回租户类型", () => {
      expect(tenant.type).toBe(TenantType.ENTERPRISE);
    });

    it("应该正确返回租户ID", () => {
      const tenantId = TenantId.generate();
      const props = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
      };
      const testTenant = new Tenant(tenantId, props, auditInfo);

      expect(testTenant.id).toBe(tenantId);
    });

    it("应该正确返回创建时间", () => {
      const beforeCreation = new Date();
      const props = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
      };
      const testTenant = new Tenant(TenantId.generate(), props, auditInfo);
      const afterCreation = new Date();

      expect(testTenant.createdAt).toBeInstanceOf(Date);
      expect(testTenant.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(testTenant.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });

    it("应该正确返回更新时间", () => {
      const props = {
        name: "测试租户",
        type: TenantType.ENTERPRISE,
      };
      const testTenant = new Tenant(TenantId.generate(), props, auditInfo);

      expect(testTenant.updatedAt).toBeInstanceOf(Date);
      expect(testTenant.updatedAt.getTime()).toBeGreaterThanOrEqual(
        testTenant.createdAt.getTime(),
      );
    });
  });

  describe("不同租户类型", () => {
    it("应该支持企业租户", () => {
      const props = {
        name: "企业租户",
        type: TenantType.ENTERPRISE,
      };
      const enterpriseTenant = new Tenant(
        TenantId.generate(),
        props,
        auditInfo,
      );

      expect(enterpriseTenant.type.isEnterprise()).toBe(true);
      expect(enterpriseTenant.type.getDisplayName()).toBe("企业租户");
      expect(enterpriseTenant.type.getPermissionLevel()).toBe(4);
      expect(enterpriseTenant.type.supportsAdvancedFeatures()).toBe(true);
    });

    it("应该支持社群租户", () => {
      const props = {
        name: "社群租户",
        type: TenantType.COMMUNITY,
      };
      const communityTenant = new Tenant(TenantId.generate(), props, auditInfo);

      expect(communityTenant.type.isCommunity()).toBe(true);
      expect(communityTenant.type.getDisplayName()).toBe("社群租户");
      expect(communityTenant.type.getPermissionLevel()).toBe(3);
      expect(communityTenant.type.supportsOrganizationManagement()).toBe(true);
    });

    it("应该支持团队租户", () => {
      const props = {
        name: "团队租户",
        type: TenantType.TEAM,
      };
      const teamTenant = new Tenant(TenantId.generate(), props, auditInfo);

      expect(teamTenant.type.isTeam()).toBe(true);
      expect(teamTenant.type.getDisplayName()).toBe("团队租户");
      expect(teamTenant.type.getPermissionLevel()).toBe(2);
      expect(teamTenant.type.supportsMultiUser()).toBe(true);
    });

    it("应该支持个人租户", () => {
      const props = {
        name: "个人租户",
        type: TenantType.PERSONAL,
      };
      const personalTenant = new Tenant(TenantId.generate(), props, auditInfo);

      expect(personalTenant.type.isPersonal()).toBe(true);
      expect(personalTenant.type.getDisplayName()).toBe("个人租户");
      expect(personalTenant.type.getPermissionLevel()).toBe(1);
      expect(personalTenant.type.supportsMultiUser()).toBe(false);
    });
  });

  describe("边界条件和异常处理", () => {
    it("应该处理特殊字符的租户名称", () => {
      const props = {
        name: "租户@#$%^&*()_+-=[]{}|;':\",./<>?",
        type: TenantType.ENTERPRISE,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).not.toThrow();
    });

    it("应该处理Unicode字符的租户名称", () => {
      const props = {
        name: "租户🚀🌟💡🎯",
        type: TenantType.ENTERPRISE,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).not.toThrow();
    });

    it("应该处理数字开头的租户名称", () => {
      const props = {
        name: "123租户",
        type: TenantType.ENTERPRISE,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).not.toThrow();
    });

    it("应该处理包含空格的租户名称", () => {
      const props = {
        name: "测试 租户 名称",
        type: TenantType.ENTERPRISE,
      };

      expect(() => {
        new Tenant(TenantId.generate(), props, auditInfo);
      }).not.toThrow();
    });
  });

  describe("性能测试", () => {
    it("应该能够快速创建大量租户实体", () => {
      const startTime = Date.now();
      const tenants: Tenant[] = [];

      for (let i = 0; i < 1000; i++) {
        const props = {
          name: `租户${i}`,
          type: TenantType.ENTERPRISE,
        };
        tenants.push(new Tenant(TenantId.generate(), props, auditInfo));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(tenants).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });

    it("应该能够快速重命名大量租户", () => {
      const props = {
        name: "原始租户",
        type: TenantType.ENTERPRISE,
      };
      const testTenant = new Tenant(
        TenantId.generate(),
        props,
        auditInfo,
        mockLogger,
      );

      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        testTenant.rename(`租户${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(testTenant.name).toBe("租户99");
      expect(duration).toBeLessThan(100); // 应该在100毫秒内完成
    });
  });
});
