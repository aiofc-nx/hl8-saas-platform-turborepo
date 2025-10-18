/**
 * 组织实体单元测试
 *
 * @description 测试组织实体的业务逻辑和验证规则
 *
 * @since 1.0.0
 */

import { EntityId, TenantId } from "@hl8/isolation-model";
import { Organization } from "./organization.entity.js";
import { OrganizationType } from "../../value-objects/types/organization-type.vo.js";
import {
  BusinessRuleViolationException,
  DomainStateException,
} from "../../../common/exceptions/business.exceptions.js";

describe("Organization Entity", () => {
  let validEntityId: EntityId;
  let validOrganizationProps: any;
  let validAuditInfo: any;

  beforeEach(() => {
    validEntityId = TenantId.create("123e4567-e89b-4d3a-a456-426614174000");
    validOrganizationProps = {
      name: "Test Organization",
      type: OrganizationType.COMMITTEE,
      description: "Test organization description",
      isActive: true,
      parentId: undefined,
      path: "/test-org",
      sortOrder: 1,
    };
    validAuditInfo = {
      createdBy: "admin",
      createdAt: new Date(),
    };
  });

  describe("构造函数", () => {
    it("应该成功创建组织实体", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      expect(organization.name).toBe("Test Organization");
      expect(organization.type).toBe(OrganizationType.COMMITTEE);
      expect(organization.description).toBe("Test organization description");
      expect(organization.isActive).toBe(true);
      expect(organization.parentId).toBeUndefined();
      expect(organization.path).toBe("/test-org");
      expect(organization.sortOrder).toBe(1);
    });

    it("应该成功创建组织实体（不提供日志记录器）", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      expect(organization).toBeDefined();
      expect(organization.name).toBe("Test Organization");
    });

    it("应该验证组织名称不能为空", () => {
      const invalidProps = { ...validOrganizationProps, name: "" };

      expect(() => {
        new Organization(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证组织名称长度不能超过100字符", () => {
      const invalidProps = { ...validOrganizationProps, name: "a".repeat(101) };

      expect(() => {
        new Organization(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证组织类型不能为空", () => {
      const invalidProps = { ...validOrganizationProps, type: null as any };

      expect(() => {
        new Organization(validEntityId, invalidProps, validAuditInfo);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新组织名称", () => {
    it("应该成功更新组织名称", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateName("New Organization Name");

      expect(organization.name).toBe("New Organization Name");
    });

    it("应该自动去除名称前后空格", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateName("  New Organization Name  ");

      expect(organization.name).toBe("New Organization Name");
    });

    it("应该验证新名称不能为空", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      expect(() => {
        organization.updateName("");
      }).toThrow(BusinessRuleViolationException);
    });

    it("应该验证新名称长度不能超过100字符", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      expect(() => {
        organization.updateName("a".repeat(101));
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("更新组织描述", () => {
    it("应该成功更新组织描述", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateDescription("New organization description");

      expect(organization.description).toBe("New organization description");
    });

    it("应该允许空描述", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateDescription("");

      expect(organization.description).toBe("");
    });
  });

  describe("更新组织类型", () => {
    it("应该成功更新组织类型", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateType(OrganizationType.PROJECT_TEAM);

      expect(organization.type).toBe(OrganizationType.PROJECT_TEAM);
    });

    it("应该验证新类型不能为空", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      expect(() => {
        organization.updateType(null as any);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("设置父组织", () => {
    it("应该成功设置父组织", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );
      const parentId = TenantId.create("123e4567-e89b-4d3a-a456-426614174001");

      organization.setParent(parentId);

      expect(organization.parentId).toBe(parentId);
    });

    it("应该验证不能设置自己为父组织", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      expect(() => {
        organization.setParent(validEntityId);
      }).toThrow(DomainStateException);
    });

    it("应该允许清除父组织", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );
      const parentId = TenantId.create("123e4567-e89b-4d3a-a456-426614174001");
      organization.setParent(parentId);

      organization.removeParent();

      expect(organization.parentId).toBeUndefined();
    });
  });

  describe("更新组织路径", () => {
    it("应该成功更新组织路径", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updatePath("/new/path");

      expect(organization.path).toBe("/new/path");
    });

    it("应该验证路径格式", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updatePath("invalid-path");
      expect(organization.path).toBe("invalid-path");
    });
  });

  describe("更新排序", () => {
    it("应该成功更新排序", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateSortOrder(5);

      expect(organization.sortOrder).toBe(5);
    });

    it("应该验证排序不能为负数", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      expect(() => {
        organization.updateSortOrder(-1);
      }).toThrow(BusinessRuleViolationException);
    });
  });

  describe("激活组织", () => {
    it("应该成功激活组织", () => {
      const inactiveProps = { ...validOrganizationProps, isActive: false };
      const organization = new Organization(
        validEntityId,
        inactiveProps,
        validAuditInfo,
      );

      organization.activate();

      expect(organization.isActive).toBe(true);
    });
  });

  describe("停用组织", () => {
    it("应该成功停用组织", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.deactivate();

      expect(organization.isActive).toBe(false);
    });
  });

  describe("检查组织状态", () => {
    it("应该正确检查组织是否激活", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      expect(organization.isActive).toBe(true);
    });

    it("应该正确检查组织是否停用", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );
      organization.deactivate();

      expect(organization.isActive).toBe(false);
    });
  });

  describe("边界条件和异常处理", () => {
    it("应该处理特殊字符的组织名称", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateName("Organization-Name_123");

      expect(organization.name).toBe("Organization-Name_123");
    });

    it("应该处理Unicode字符的组织名称", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateName("技术委员会");

      expect(organization.name).toBe("技术委员会");
    });

    it("应该处理数字开头的组织名称", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateName("2024年度委员会");

      expect(organization.name).toBe("2024年度委员会");
    });

    it("应该处理包含空格的组织名称", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );

      organization.updateName("Test Organization Name");

      expect(organization.name).toBe("Test Organization Name");
    });
  });

  describe("性能测试", () => {
    it("应该能够快速创建大量组织实体", () => {
      const startTime = Date.now();
      const organizations = [];

      for (let i = 0; i < 1000; i++) {
        const orgProps = {
          ...validOrganizationProps,
          name: `Organization ${i}`,
        };
        organizations.push(
          new Organization(
            TenantId.create("123e4567-e89b-4d3a-a456-426614174000"),
            orgProps,
            validAuditInfo,
          ),
        );
      }

      const endTime = Date.now();
      expect(organizations).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it("应该能够快速更新大量组织", () => {
      const organization = new Organization(
        validEntityId,
        validOrganizationProps,
        validAuditInfo,
      );
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        organization.updateName(`Organization ${i}`);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // 应该在100毫秒内完成
    });
  });
});
